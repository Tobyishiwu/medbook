from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db.models import Q
from .models import DoctorProfile, PatientProfile, Appointment, MedicalRecord, Prescription
from .serializers import (
    UserSerializer, RegisterSerializer, DoctorProfileSerializer,
    PatientProfileSerializer, AppointmentSerializer,
    MedicalRecordSerializer, PrescriptionSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        role = 'admin' if user.is_superuser else ('doctor' if user.is_staff else 'patient')
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': role,
        }, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        user = request.user
        role = 'admin' if user.is_superuser else ('doctor' if user.is_staff else 'patient')
        data = UserSerializer(user).data
        data['role'] = role
        if role == 'doctor' and hasattr(user, 'doctor_profile'):
            data['profile'] = DoctorProfileSerializer(user.doctor_profile).data
        elif role == 'patient' and hasattr(user, 'patient_profile'):
            data['profile'] = PatientProfileSerializer(user.patient_profile).data
        return Response(data)


class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'specialization']

    def get_queryset(self):
        return DoctorProfile.objects.select_related('user').all()

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            profile = request.user.doctor_profile
            return Response(DoctorProfileSerializer(profile).data)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Not a doctor'}, status=400)

    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        doctor = self.get_object()
        appointments = doctor.appointments.all()
        return Response(AppointmentSerializer(appointments, many=True).data)


class PatientViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'phone']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return PatientProfile.objects.select_related('user').all()
        try:
            return PatientProfile.objects.filter(user=user)
        except:
            return PatientProfile.objects.none()

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            profile = request.user.patient_profile
            return Response(PatientProfileSerializer(profile).data)
        except PatientProfile.DoesNotExist:
            return Response({'error': 'Not a patient'}, status=400)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['reason', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Appointment.objects.select_related('doctor__user', 'patient__user').all()
        if user.is_staff:
            try:
                return Appointment.objects.filter(doctor=user.doctor_profile).select_related('doctor__user', 'patient__user')
            except:
                return Appointment.objects.none()
        try:
            return Appointment.objects.filter(patient=user.patient_profile).select_related('doctor__user', 'patient__user')
        except:
            return Appointment.objects.none()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['pending', 'confirmed', 'completed', 'cancelled']:
            return Response({'error': 'Invalid status'}, status=400)
        appointment.status = new_status
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=False, methods=['get'])
    def today(self, request):
        from datetime import date
        today = date.today()
        qs = self.get_queryset().filter(date=today)
        return Response(AppointmentSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        from datetime import date
        today = date.today()
        qs = self.get_queryset().filter(date__gte=today, status__in=['pending', 'confirmed'])
        return Response(AppointmentSerializer(qs, many=True).data)


class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return MedicalRecord.objects.select_related('doctor__user', 'patient__user').all()
        if user.is_staff:
            try:
                return MedicalRecord.objects.filter(doctor=user.doctor_profile).select_related('doctor__user', 'patient__user')
            except:
                return MedicalRecord.objects.none()
        try:
            return MedicalRecord.objects.filter(patient=user.patient_profile).select_related('doctor__user', 'patient__user')
        except:
            return MedicalRecord.objects.none()


class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Prescription.objects.select_related('doctor__user', 'patient__user').all()
        if user.is_staff:
            try:
                return Prescription.objects.filter(doctor=user.doctor_profile).select_related('doctor__user', 'patient__user')
            except:
                return Prescription.objects.none()
        try:
            return Prescription.objects.filter(patient=user.patient_profile).select_related('doctor__user', 'patient__user')
        except:
            return Prescription.objects.none()


class StatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        from datetime import date
        today = date.today()

        if user.is_superuser:
            return Response({
                'total_doctors': DoctorProfile.objects.count(),
                'total_patients': PatientProfile.objects.count(),
                'total_appointments': Appointment.objects.count(),
                'today_appointments': Appointment.objects.filter(date=today).count(),
                'pending_appointments': Appointment.objects.filter(status='pending').count(),
                'completed_appointments': Appointment.objects.filter(status='completed').count(),
            })

        if user.is_staff:
            try:
                doctor = user.doctor_profile
                return Response({
                    'total_patients': Appointment.objects.filter(doctor=doctor).values('patient').distinct().count(),
                    'today_appointments': Appointment.objects.filter(doctor=doctor, date=today).count(),
                    'pending_appointments': Appointment.objects.filter(doctor=doctor, status='pending').count(),
                    'completed_appointments': Appointment.objects.filter(doctor=doctor, status='completed').count(),
                    'total_records': MedicalRecord.objects.filter(doctor=doctor).count(),
                    'total_prescriptions': Prescription.objects.filter(doctor=doctor).count(),
                })
            except:
                return Response({})

        try:
            patient = user.patient_profile
            return Response({
                'total_appointments': Appointment.objects.filter(patient=patient).count(),
                'upcoming_appointments': Appointment.objects.filter(patient=patient, date__gte=today, status__in=['pending', 'confirmed']).count(),
                'completed_appointments': Appointment.objects.filter(patient=patient, status='completed').count(),
                'total_records': MedicalRecord.objects.filter(patient=patient).count(),
                'total_prescriptions': Prescription.objects.filter(patient=patient).count(),
            })
        except:
            return Response({})
