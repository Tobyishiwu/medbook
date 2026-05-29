from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DoctorProfile, PatientProfile, Appointment, MedicalRecord, Prescription


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False, default='patient')
    specialization = serializers.CharField(write_only=True, required=False, default='general')
    phone = serializers.CharField(write_only=True, required=False, default='')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'role', 'specialization', 'phone']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        role = validated_data.pop('role', 'patient')
        specialization = validated_data.pop('specialization', 'general')
        phone = validated_data.pop('phone', '')
        user = User.objects.create_user(**validated_data)
        if role == 'doctor':
            user.is_staff = True
            user.save()
            DoctorProfile.objects.create(user=user, specialization=specialization, phone=phone)
        elif role == 'admin':
            user.is_staff = True
            user.is_superuser = True
            user.save()
        else:
            PatientProfile.objects.create(user=user, phone=phone)
        return user


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = '__all__'

    def get_full_name(self, obj):
        return f'Dr. {obj.user.get_full_name()}' or f'Dr. {obj.user.username}'


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_age(self, obj):
        if obj.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - obj.date_of_birth.year - ((today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day))
        return None


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    doctor_specialization = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'

    def get_doctor_name(self, obj):
        return f'Dr. {obj.doctor.user.get_full_name()}' or f'Dr. {obj.doctor.user.username}'

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username

    def get_doctor_specialization(self, obj):
        return obj.doctor.get_specialization_display()


class MedicalRecordSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    prescriptions = serializers.SerializerMethodField()

    class Meta:
        model = MedicalRecord
        fields = '__all__'

    def get_doctor_name(self, obj):
        return f'Dr. {obj.doctor.user.get_full_name()}'

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()

    def get_prescriptions(self, obj):
        return PrescriptionSerializer(obj.prescriptions.all(), many=True).data


class PrescriptionSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = '__all__'

    def get_doctor_name(self, obj):
        return f'Dr. {obj.doctor.user.get_full_name()}'

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()
