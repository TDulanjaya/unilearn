# UniLearn

UniLearn is a university learning management system built with Next.js and Spring Boot. It provides dedicated portals for students, lecturers, heads of departments (HOD), and administrators — covering course materials, attendance tracking, exams, and an AI study assistant.

## Features

- **Course Management:** Lecture materials, announcements, and assignment submissions.
- **QR Attendance:** Fast check-in with dynamic, time-limited QR codes.
- **Exams & Quizzes:** Online test taking, question banks, and automated grading.
- **AI Study Assistant:** Course-grounded Q&A and instant practice quiz generation powered by Google Gemini.
- **Role-Based Access Control:** Dedicated workflows and permissions for Student, Lecturer, HOD/Dean, and Admin.
- **Super Admin 2FA:** Mandatory 6-digit email OTP verification on login for administrative accounts.

## Tech Stack

- **Frontend:** Next.js (App Router), React
- **Backend:** Spring Boot (Java 17+), Spring Security, JWT
- **Database:** MySQL / TiDB
- **Storage:** Storj S3 (file uploads)
- **AI:** Google Gemini API

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+ & npm
- MySQL (or TiDB Cloud)

### 1. Database Setup

Create the database and load the schema:

```bash
mysql -u root -p unilearn_db < unilearn_db.sql
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
```

Open `.env` and configure your database credentials and `JWT_SECRET`. Then run the backend:

```bash
# Windows
./mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

The backend starts at `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Running with Docker

You can also run everything using Docker Compose:

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8080
- **Database:** localhost:3306

To stop all services:

```bash
docker compose down
```

---

## Super Admin Two-Factor Authentication (OTP)

To protect administrative operations, all `SUPER_ADMIN` accounts require two-factor verification on login.

### How It Works

1. **Login:** The admin enters their email and password on the login page.
2. **OTP Sent:** A 6-digit verification code is generated and sent to the admin's registered email.
3. **Verification:** The admin enters the 6-digit code on the screen to complete sign-in and access the portal.

---

## Environment Variables

### Backend (`server/.env`)

```env
# Gemini AI API
GEMINI_API_KEY=
GEMINI_API_MODEL=gemini-2.5-flash

# Database Settings (TiDB Cloud / MySQL)
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=

# Storj S3 Storage Settings
B2_KEY_ID=
B2_APPLICATION_KEY=
B2_ENDPOINT=
B2_BUCKET_NAME=
B2_REGION=ap1

# Email (Resend API or Gmail SMTP)
RESEND_API_KEY=
RESEND_FROM=UniLearn <onboarding@resend.dev>

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true
OTP_FROM=
APP_OTP_LOG_TO_CONSOLE=true

# Public Registration Setting
APP_REGISTRATION_PUBLIC_ENABLED=true

# JWT Secret Key & CORS
JWT_SECRET=
CORS_ALLOWED_ORIGIN=http://localhost:3000

# Server Port (default: 8080)
PORT=8080
```

### Frontend (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```
