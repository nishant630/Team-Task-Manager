TaskFlow — Team Task Manager (MERN Stack)
=========================================

A full-stack web application for teams to manage projects and tasks with role-based access control. Built with React, Tailwind CSS, Express, and MongoDB.

Features
--------
- Authentication: Secure registration & authentication (JWT token based) with role selection (Admin / Member).
- Dashboard: Premium glassmorphic interface showing metrics cards, overdue alerts, project items, and personal tasks.
- Project Board: Custom columns board view (To Do -> In Progress -> Done) for visualizing progress, team member listings, and metrics tracking.
- Forms & Slide-overs: Modals and dedicated views to create projects, select team members, and add tasks.
- Role-Based Access Control (RBAC): Admins manage; Members update ONLY their assigned tasks' status.
- API Endpoints: Clean REST API endpoints implementing standard controllers and middleware verification.
- Docker Compose: Local orchestration setup for MongoDB, Express server, and React dev container in a single command.


Tech Stack
----------
- Frontend: React 18, Vite, Tailwind CSS, Lucide Icons, Axios
- Backend: Node.js, Express.js
- Database: MongoDB + Mongoose ODM
- Auth: JWT (JSON Web Tokens) + Bcryptjs
- Deployment: Railway Configuration (Nixpacks) + Docker Compose


Database Schema
---------------
User
- username (string, unique)
- email (string, unique)
- password (string, hashed)
- role: 'admin' | 'member' (default: 'member')

Project
- name (string)
- description (string)
- created_by -> User (Ref)
- members -> Users (Array of Refs)

Task
- title (string)
- description (string)
- status: 'todo' | 'in_progress' | 'done' (default: 'todo')
- priority: 'low' | 'medium' | 'high' (default: 'medium')
- due_date (date, nullable)
- project -> Project (Ref)
- assigned_to -> User (Ref, nullable)
- created_by -> User (Ref)


Role-Based Access Control (RBAC)
--------------------------------
- View own projects: Admins (Yes) | Members (Yes, only where added)
- Create projects: Admins (Yes) | Members (No)
- Edit/delete project: Admins (Yes, only if creator) | Members (No)
- Create tasks: Admins (Yes, only if project creator) | Members (No)
- Edit/delete tasks: Admins (Yes, only if project creator) | Members (No)
- Update task status: Admins (Yes) | Members (Yes, only if assignee)
- View all tasks in project: Admins (Yes) | Members (No, only own tasks)


Local Setup
-----------
Option 1: Docker Compose (Recommended)
1. Make sure Docker and Docker Compose are installed on your machine.
2. Clone the repository and navigate to the directory:
   cd Task-Manager
3. Copy environment variables file:
   cp .env.example .env
4. Run Docker Compose:
   docker compose up --build
5. Open your browser:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

Option 2: Running Locally Without Docker
1. Copy the environment variables:
   cp .env.example .env
2. Edit .env and set your MONGO_URI connection string:
   MONGO_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=yoursecretjwtkeyhere12345!
3. Install all dependencies for root, backend, and frontend:
   npm run install-all
4. Run both servers in development mode concurrently:
   npm run dev
5. Open http://localhost:3000 in your browser.

