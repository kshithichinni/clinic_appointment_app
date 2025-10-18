# Clinic Appointment App

A full-stack web application for booking and managing clinic appointments with role-based access for **patients, doctors, and admins**. Built using the MERN stack (MongoDB, Express.js, React, Node.js) with JWT authentication, responsive UI, and advanced appointment management features.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Project Workflow](#project-workflow)
* [Installation](#installation)
* [Usage](#usage)
* [Screenshots](#screenshots)
* [Contributing](#contributing)
* [License](#license)
* [References](#references)

---

## Project Overview

Healthcare today is fast-paced, but many clinics still rely on manual appointment systems. This causes double-bookings, missed appointments, and inefficiencies.
The **Clinic Appointment App** streamlines appointment scheduling:

* Patients can book, reschedule, and cancel appointments online.
* Doctors can manage schedules and view appointments in calendar format.
* Admins can monitor users, appointments, and system analytics.
* Features like PDF appointment slips and conflict prevention improve usability and reliability.

---

## Features

### Patient

* Search doctors by specialization
* Book appointments based on availability
* Download appointment slips in PDF
* Reschedule or cancel appointments

### Doctor

* View booked appointments
* Manage availability and schedule
* Calendar view (day/week/month)
* Conflict prevention for overlapping bookings

### Admin

* View counts of all users (patients, doctors, admins)
* Monitor system analytics
* Oversee appointments and users

### Common

* JWT-based authentication and role-based access
* Responsive UI with Tailwind CSS
* Form validation with React Hook Form + Yup
* Error handling and notifications

---

## Tech Stack

* **Frontend:** React (Vite + TypeScript), Tailwind CSS
* **Backend:** Node.js, Express.js (TypeScript)
* **Database:** MongoDB + Mongoose
* **Authentication:** JWT, bcrypt
* **Form Handling:** React Hook Form + Yup
* **PDF Export:** jspdf, html2canvas
* **Routing:** React Router DOM
* **API Communication:** Axios
* **State Management:** Context API

---

## Project Workflow

1. Planned project scope and designed UI wireframes
2. Set up frontend and backend boilerplates
3. Configured MongoDB and created schemas using Mongoose
4. Implemented user registration, login, and JWT authentication
5. Built patient dashboard with doctor search and appointment booking
6. Developed doctor dashboard with calendar view and schedule management
7. Added conflict prevention logic for overlapping appointments
8. Built admin dashboard with real-time analytics
9. Integrated PDF export for appointment slips
10. Added responsive design, form validation, and error handling
11. Tested application and finalized documentation

---

## Installation

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Environment Variables (.env):**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Usage

* Register as Patient, Doctor, or Admin
* Login and access role-based dashboard
* Book, manage, or view appointments
* Download appointment slips in PDF
* Admin can view analytics and user stats

---

## Screenshots





---
