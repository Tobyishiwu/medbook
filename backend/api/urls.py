from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, MeView, DoctorViewSet, PatientViewSet,
    AppointmentViewSet, MedicalRecordViewSet, PrescriptionViewSet,
    DoctorApprovalViewSet, StatsView
)

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'records', MedicalRecordViewSet, basename='record')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'doctor-approvals', DoctorApprovalViewSet, basename='doctor-approval')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('stats/', StatsView.as_view(), name='stats'),
    path('', include(router.urls)),
]