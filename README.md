# UniLearn

UniLearn is a university learning management system for students, lecturers, heads of departments, and administrators. It includes course management, exams, attendance tracking, and an AI study assistant.

## Features

- **Course Management:** Materials, announcements, and assignments.
- **Attendance:** Secure QR code check-in with time-limited tokens.
- **Exams & Quizzes:** Online exams, question banks, and automatic grading.
- **AI Study Assistant:** Course-grounded chat and practice quiz generation powered by Gemini.
- **Role-based Access:** Student, Lecturer, HOD/Dean, and Staff Admin portals.

## Tech Stack

- **Frontend:** Next.js
- **Backend:** Spring Boot
- **Database:** MySQL
- **Storage:** Storj S3
- **AI:** Google Gemini

---

## Quick Start

### 1. Database

Create your database and load the schema:

```bash
mysql -u root -p unilearn_db < unilearn_db.sql
```

### 2. Backend

1. Go to the `server` folder:
   ```bash
   cd server
   ```
2. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your database details and Gemini API key.
4. Run the backend:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend runs at `http://localhost:8080`.

### 3. Frontend

1. Go to the `client` folder:
   ```bash
   cd client
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## Running with Docker

You can run the entire project with Docker Compose:

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

## Environment Variables

### Backend (`server/.env`)

- `SPRING_DATASOURCE_URL`: Database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT tokens (at least 32 characters)
- `GEMINI_API_KEY`: Google Gemini API key
- `GEMINI_API_MODEL`: Gemini model name (default: `gemini-2.5-flash`)
- `STORJ_*`: Cloud storage credentials (optional, defaults to local folder)

### Frontend (`client/.env.local`)

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8080`)
