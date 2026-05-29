# 🏥 MedBook

A modern full-stack healthcare management platform for doctors, patients and administrators.

![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

---

## 🎯 What is MedBook?

MedBook is a healthcare management system that connects doctors, patients and administrators in one platform. Doctors manage appointments and write medical records. Patients book appointments, view their health history and access prescriptions. Admins monitor the entire system.

```
React (Frontend)  →  Express.js (Gateway)  →  Django (API)  →  Database
```

---

## 👥 Three Roles

**👨‍⚕️ Doctor**
- View today's schedule and all appointments
- Confirm, complete or cancel appointments
- Create medical records with diagnosis, symptoms and treatment
- View all patients and their details

**🙋 Patient**
- Book appointments with any available doctor
- View upcoming and past appointments
- Access full medical history and records
- View all prescriptions

**🔑 Admin**
- System-wide overview and stats
- Monitor all appointments across all doctors
- Full visibility into the platform

---

## ✨ Features

| Feature | Details |
|--------|---------|
| 🔐 JWT Authentication | Register and login with role selection |
| 📅 Appointment Booking | Book, confirm, complete and cancel |
| 📋 Medical Records | Diagnosis, symptoms, treatment, follow-up dates |
| 💊 Prescriptions | Medication, dosage, frequency and instructions |
| 📊 Dashboard Stats | Real-time stats per role |
| 🔍 Search | Find doctors and patients |
| 📱 Mobile Responsive | Works on all screen sizes |
| 🛡️ Rate Limiting | Via Express gateway middleware |

---

## 🚀 Getting Started

### Prerequisites
```bash
python --version   # 3.9+
node --version     # 16+
```

### 1. Backend (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
django-admin startproject medbook .
python manage.py makemigrations api
python manage.py migrate
python seed.py
python manage.py runserver 8000
```

### 2. Gateway (Express)
```bash
cd gateway
npm install
node index.js
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3000`

---

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Doctor | dr.james | doctor123 |
| Doctor | dr.sarah | doctor123 |
| Doctor | dr.michael | doctor123 |
| Patient | john.doe | patient123 |
| Patient | mary.jane | patient123 |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register/` | Register with role |
| `POST` | `/api/auth/login/` | Login and get JWT tokens |
| `GET` | `/api/auth/me/` | Current user + profile |
| `GET/POST` | `/api/appointments/` | List or create appointments |
| `PATCH` | `/api/appointments/:id/update_status/` | Update appointment status |
| `GET` | `/api/appointments/today/` | Today's appointments |
| `GET` | `/api/appointments/upcoming/` | Upcoming appointments |
| `GET/POST` | `/api/records/` | Medical records |
| `GET/POST` | `/api/prescriptions/` | Prescriptions |
| `GET` | `/api/doctors/` | List all doctors |
| `GET` | `/api/patients/` | List patients |
| `GET` | `/api/stats/` | Dashboard stats by role |

---

## 📁 Project Structure

```
medbook/
├── backend/                  # Django REST API
│   ├── api/
│   │   ├── models.py         # Doctor, Patient, Appointment, Record, Prescription
│   │   ├── serializers.py    # Role-based serializers
│   │   ├── views.py          # ViewSets + Stats endpoint
│   │   └── urls.py           # API routing
│   ├── seed.py               # Sample data seeder
│   └── requirements.txt
│
├── gateway/                  # Express.js API Gateway
│   └── index.js              # CORS, rate limiting, proxy, logging
│
└── frontend/                 # React Application
    └── src/
        ├── App.js            # All pages and role-based dashboards
        ├── api/index.js      # API service layer
        └── context/
            └── AuthContext.js
```

---

## 👨‍💻 Author

**Tobias Ishiwu** — Full Stack Developer
GitHub: [@Tobyishiwu](https://github.com/Tobyishiwu)
LinkedIn: [linkedin.com/in/tobias-ishiwu](https://linkedin.com/in/tobias-ishiwu)

---

*Built as a full-stack demonstration of Django (Python), Express.js and React (JavaScript) for healthcare.*