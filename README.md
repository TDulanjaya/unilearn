# UniLearn

UniLearn is a clean university LMS that lets students, lecturers, and staff manage courses, exams, and attendance with a simple, role-based layout.

## Project Structure

- **`client/`**: Next.js (React, TypeScript, Tailwind CSS) frontend application.
- **`server/`**: Spring Boot (Java, Maven) REST API backend service.

---

## Getting Started

### 1. Client (Frontend)

To run the Next.js frontend application:

```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### 2. Server (Backend)

To run the Spring Boot backend service:

```bash
cd server
./mvnw spring-boot:run
```

*(On Windows PowerShell, use `.\mvnw.cmd spring-boot:run`)*

---

## Running with Docker (Entire Stack)

To run the frontend, backend, and MySQL database altogether in Docker containers:

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **MySQL Database**: `localhost:3306` (pre-seeded with `unilearn_db.sql`)

To stop all containers:

```bash
docker compose down
```

---

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, TypeScript
- **Backend**: Spring Boot, Java, Maven, Spring Data JPA
