from django.contrib import admin
from .models import DoctorProfile, PatientProfile, Appointment, MedicalRecord, Prescription
admin.site.register(DoctorProfile)
admin.site.register(PatientProfile)
admin.site.register(Appointment)
admin.site.register(MedicalRecord)
admin.site.register(Prescription)
