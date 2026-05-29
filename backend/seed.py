import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medbook.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import DoctorProfile, PatientProfile, Appointment, MedicalRecord, Prescription

print('🌱 Seeding MedBook database...')

# Admin
admin, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@medbook.com', 'first_name': 'Super', 'last_name': 'Admin', 'is_staff': True, 'is_superuser': True})
admin.set_password('admin123')
admin.save()
print('✅ Admin: username=admin / password=admin123')

# Doctors
doctors_data = [
    ('dr.james', 'James', 'Okafor', 'cardiology', '+234 801 234 5678', 'Experienced cardiologist with 15 years of practice.', 15, 15000),
    ('dr.sarah', 'Sarah', 'Adeyemi', 'pediatrics', '+234 802 345 6789', 'Passionate pediatrician dedicated to child health.', 10, 12000),
    ('dr.michael', 'Michael', 'Eze', 'general', '+234 803 456 7890', 'General practitioner with broad clinical experience.', 8, 8000),
]

doctor_profiles = []
for username, first, last, spec, phone, bio, exp, fee in doctors_data:
    user, created = User.objects.get_or_create(username=username, defaults={'email': f'{username}@medbook.com', 'first_name': first, 'last_name': last, 'is_staff': True})
    if created:
        user.set_password('doctor123')
        user.save()
    profile, _ = DoctorProfile.objects.get_or_create(user=user, defaults={
        'specialization': spec, 'phone': phone, 'bio': bio,
        'years_experience': exp, 'consultation_fee': fee, 'is_approved': True
    })
    if not profile.is_approved:
        profile.is_approved = True
        profile.save()
    doctor_profiles.append(profile)
    print(f'✅ Doctor: Dr. {first} {last} ({spec}) — approved')

# Patients
patients_data = [
    ('john.doe', 'John', 'Doe', '1990-05-15', '+234 804 567 8901', 'O+', 'Penicillin'),
    ('mary.jane', 'Mary', 'Jane', '1985-08-22', '+234 805 678 9012', 'A+', 'None'),
    ('peter.paul', 'Peter', 'Paul', '1978-12-10', '+234 806 789 0123', 'B+', 'Aspirin'),
    ('ada.obi', 'Ada', 'Obi', '1995-03-28', '+234 807 890 1234', 'AB+', 'None'),
]

patient_profiles = []
for username, first, last, dob, phone, blood, allergies in patients_data:
    user, created = User.objects.get_or_create(username=username, defaults={'email': f'{username}@medbook.com', 'first_name': first, 'last_name': last})
    if created:
        user.set_password('patient123')
        user.save()
    profile, _ = PatientProfile.objects.get_or_create(user=user, defaults={
        'date_of_birth': date.fromisoformat(dob), 'phone': phone,
        'blood_group': blood, 'allergies': allergies
    })
    patient_profiles.append(profile)
    print(f'✅ Patient: {first} {last}')

# Appointments
today = date.today()
appointments_data = [
    (doctor_profiles[0], patient_profiles[0], today, '09:00', 'confirmed', 'Chest pain and shortness of breath'),
    (doctor_profiles[0], patient_profiles[1], today, '10:30', 'pending', 'Routine cardiac checkup'),
    (doctor_profiles[1], patient_profiles[2], today, '11:00', 'confirmed', 'Child vaccination'),
    (doctor_profiles[2], patient_profiles[3], today + timedelta(days=1), '14:00', 'pending', 'General checkup'),
    (doctor_profiles[0], patient_profiles[2], today - timedelta(days=3), '09:00', 'completed', 'Follow-up after heart procedure'),
    (doctor_profiles[1], patient_profiles[0], today - timedelta(days=7), '10:00', 'completed', 'Annual physical examination'),
]

appointment_objects = []
for doctor, patient, appt_date, time, status, reason in appointments_data:
    appt, _ = Appointment.objects.get_or_create(
        doctor=doctor, patient=patient, date=appt_date, time=time,
        defaults={'status': status, 'reason': reason}
    )
    appointment_objects.append(appt)

print(f'✅ {len(appointments_data)} appointments created')

# Medical Records
records_data = [
    (doctor_profiles[0], patient_profiles[2], appointment_objects[4], today - timedelta(days=3), 'Hypertension Stage 2', 'Severe headaches, dizziness, high blood pressure readings', 'Prescribed antihypertensive medication, lifestyle changes recommended', today + timedelta(days=27)),
    (doctor_profiles[1], patient_profiles[0], appointment_objects[5], today - timedelta(days=7), 'Healthy - Annual Checkup', 'No significant symptoms', 'Continue current lifestyle, exercise regularly', today + timedelta(days=358)),
]

record_objects = []
for doctor, patient, appt, visit_date, diagnosis, symptoms, treatment, follow_up in records_data:
    record, _ = MedicalRecord.objects.get_or_create(
        doctor=doctor, patient=patient, visit_date=visit_date,
        defaults={'appointment': appt, 'diagnosis': diagnosis, 'symptoms': symptoms, 'treatment': treatment, 'follow_up_date': follow_up}
    )
    record_objects.append(record)

print(f'✅ {len(records_data)} medical records created')

# Prescriptions
prescriptions_data = [
    (doctor_profiles[0], patient_profiles[2], record_objects[0], 'Amlodipine', '5mg', 'Once daily', '30 days', 'Take in the morning with water'),
    (doctor_profiles[0], patient_profiles[2], record_objects[0], 'Losartan', '50mg', 'Once daily', '30 days', 'Take in the evening'),
    (doctor_profiles[1], patient_profiles[0], record_objects[1], 'Vitamin D3', '1000 IU', 'Once daily', '90 days', 'Take with meals'),
]

for doctor, patient, record, med, dosage, freq, duration, instructions in prescriptions_data:
    Prescription.objects.get_or_create(
        doctor=doctor, patient=patient, medication_name=med,
        defaults={'medical_record': record, 'dosage': dosage, 'frequency': freq, 'duration': duration, 'instructions': instructions}
    )

print(f'✅ {len(prescriptions_data)} prescriptions created')

print('\n🎉 MedBook seeded successfully!')
print('\n📋 Login Credentials:')
print('   Admin:    username=admin      / password=admin123')
print('   Doctor:   username=dr.james   / password=doctor123')
print('   Doctor:   username=dr.sarah   / password=doctor123')
print('   Doctor:   username=dr.michael / password=doctor123')
print('   Patient:  username=john.doe   / password=patient123')
print('   Patient:  username=mary.jane  / password=patient123')