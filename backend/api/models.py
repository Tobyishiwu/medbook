from django.db import models
from django.contrib.auth.models import User


class DoctorProfile(models.Model):
    SPECIALIZATION_CHOICES = [
        ('general', 'General Practice'),
        ('cardiology', 'Cardiology'),
        ('dermatology', 'Dermatology'),
        ('neurology', 'Neurology'),
        ('orthopedics', 'Orthopedics'),
        ('pediatrics', 'Pediatrics'),
        ('gynecology', 'Gynecology'),
        ('ophthalmology', 'Ophthalmology'),
        ('psychiatry', 'Psychiatry'),
        ('surgery', 'Surgery'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=100, choices=SPECIALIZATION_CHOICES, default='general')
    license_number = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    years_experience = models.IntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    available_days = models.CharField(max_length=100, default='Mon,Tue,Wed,Thu,Fri')
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Dr. {self.user.get_full_name()}'


class PatientProfile(models.Model):
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, blank=True)
    allergies = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Patient: {self.user.get_full_name()}'


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.patient} with {self.doctor} on {self.date}'

    class Meta:
        ordering = ['-date', '-time']


class MedicalRecord(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='medical_record', null=True, blank=True)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='medical_records')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='medical_records')
    diagnosis = models.TextField()
    symptoms = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    visit_date = models.DateField()
    follow_up_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Record: {self.patient} - {self.visit_date}'

    class Meta:
        ordering = ['-visit_date']


class Prescription(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='prescriptions', null=True, blank=True)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='prescriptions')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='prescriptions')
    medication_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    instructions = models.TextField(blank=True)
    prescribed_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f'{self.medication_name} for {self.patient}'

    class Meta:
        ordering = ['-prescribed_date']