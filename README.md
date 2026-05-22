# TaskFlow — Team Task Manager (MERN Stack)

A full-stack web application for teams to manage projects and tasks with role-based access control. Built with React, Tailwind CSS, Express, and MongoDB.

---

## Features

- **Authentication** — Secure registration & authentication (JWT token based) with role selection (`Admin` / `Member`).
- **Dashboard** — Premium glassmorphic interface showing metrics cards, overdue alerts, project items, and personal tasks.
- **Project Board** — Custom columns board view (To Do → In Progress → Done) for visualizing progress, team member listings, and metrics tracking.
- **Forms & Slide-overs** — Modals and dedicated views to create projects, select team members, and add tasks.
- **Role-Based Access Control (RBAC)** — Admins manage; Members update ONLY their assigned tasks' status.
- **API Endpoints** — Clean REST API endpoints implementing standard controllers and middleware verification.
- **Docker Compose** — Local orchestration setup for MongoDB, Express server, and React dev container in a single command.

---

## Tech Stack

| Layer        | Technology                         |
|--------------|------------------------------------|
| Frontend     | React 18, Vite, Tailwind CSS, Lucide Icons, Axios |
| Backend      | Node.js, Express.js                |
| Database     | MongoDB + Mongoose ODM             |
| Auth         | JWT (JSON Web Tokens) + Bcryptjs   |
| Deployment   | Railway Configuration (Nixpacks) + Docker Compose |

---

## Database Schema

```
User
├── username (string, unique)
├── email (string, unique)
├── password (string, hashed)
└── role: 'admin' | 'member' (default: 'member')

Project
├── name (string)
├── description (string)
├── created_by → User (Ref)
└── members ← Users (Array of Refs)

Task
├── title (string)
├── description (string)
├── status: 'todo' | 'in_progress' | 'done' (default: 'todo')
├── priority: 'low' | 'medium' | 'high' (default: 'medium')
├── due_date (date, nullable)
├── project → Project (Ref)
├── assigned_to → User (Ref, nullable)
└── created_by → User (Ref)
```

---

## Role-Based Access Control (RBAC)

| Action | Admin | Member |
|--------|-------|--------|
| View own projects | ✅ | ✅ (only where added) |
| Create projects | ✅ | ❌ |
| Edit / delete project | ✅ (only if creator) | ❌ |
| Create tasks | ✅ (only if project creator) | ❌ |
| Edit / delete tasks | ✅ (only if project creator) | ❌ |
| Update task status | ✅ | ✅ (only if assignee) |
| View all tasks in project | ✅ | ❌ (only own tasks) |

---

## Local Setup

### Option 1: Docker Compose (Recommended)

1. Make sure **Docker** and **Docker Compose** are installed on your machine.
2. Clone the repository and navigate to the directory:
   ```bash
   cd Task-Manager
   ```
3. Copy environment variables file:
   ```bash
   cp .env.example .env
   ```
4. Run Docker Compose:
   ```bash
   docker compose up --build
   ```
5. Open your browser:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)

### Option 2: Running Locally Without Docker

#### Prerequisites
- **Node.js** (v18+)
- **NPM** or **Yarn**
- **MongoDB** instance running locally or hosted on MongoDB Atlas

#### Steps:
1. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set your `MONGO_URI` connection string:
   ```env
   MONGO_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=yoursecretjwtkeyhere12345!
   ```
3. Install all dependencies for root, backend, and frontend:
   ```bash
   npm run install-all
   ```
4. Run both servers in development mode concurrently:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (Railway)

The project includes `railway.json` and a root `Procfile` configured for deployment via Railway's **Nixpacks** builder.

1. Connect your repository to Railway.
2. Add a **MongoDB** plugin database service.
3. Configure the following environment variables in your web service:
   - `MONGO_URI` (automatically injected if using Railway's MongoDB database)
   - `JWT_SECRET` (generate a secure secret string)
   - `PORT` (automatically set by Railway)
   - `NODE_ENV` = `production`
4. Deploy! The project's build scripts will automatically build the React assets, and Express will serve them dynamically.
