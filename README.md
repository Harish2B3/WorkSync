# 🚀 WorkSync - Collaborative Task Manager

WorkSync is a high-performance, full-stack project management solution designed for modern teams. It combines a sleek React-based frontend with a robust Express backend to provide real-time task tracking, team collaboration, and visual analytics.

---

## 📂 Table of Contents
- [Project Architecture](#-project-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Advantages](#-advantages)
- [Future Roadmap](#-future-roadmap)

---

## 🏛️ Project Architecture

WorkSync follows a modern **Client-Server** architecture:
- **Frontend**: A Single Page Application (SPA) built with React 19 and Vite, utilizing Zustand for lightweight state management and Tailwind CSS for utility-first styling.
- **Backend**: A RESTful API built with Node.js and Express, implementing JWT for secure stateless authentication and MySQL for persistent storage.
- **Security**: Implements RBAC (Role-Based Access Control) and Multi-Factor Authentication (OTP) to ensure data integrity and privacy.

---

## ✨ Key Features

- **📊 Intelligent Dashboard**: Holistic view of project health, including completion rates and team performance metrics via real-time analytics.
- **🛡️ Secure Authentication**: 
    - **OTP Verification**: Email-based One Time Passwords for secure Signup and Login using Nodemailer.
    - **RBAC**: Admin vs. Member roles with granular permission control.
- **📁 Dynamic Project Management**: Visual organization of projects with custom colors and "Pinned" status for high-priority initiatives.
- **🤝 Collaboration Engine**: Integrated invitation system allowing users to form collaboration networks and manage team members.
- **📅 Visual Timeline**: Track deadlines through an integrated calendar and progress bars.
- **🔒 Security First**: Bcrypt password hashing, JWT-protected routes, rate limiting, and sanitization middleware.

---

## 🛠️ Tech Stack

### Frontend
- **React 19 / TypeScript**
- **Vite** - Lightning fast development and bundling.
- **Tailwind CSS** - Modern, responsive design system.
- **Zustand** - Minimalist global state management.
- **Recharts** - Dynamic data visualization for analytics.
- **Framer Motion** - Smooth, premium UI transitions.

### Backend
- **Node.js / Express** - Scalable server architecture.
- **MySQL** - Reliable relational data storage.
- **JWT** - Secure authentication flow.
- **Nodemailer** - Email service integration for OTP delivery.
- **Express Rate Limit** - Protection against brute-force attacks.

---

## 🗄️ Database Schema

| Table | Description | Key Fields |
|-------|-------------|------------|
| **User** | System actors | `id`, `name`, `email`, `role`, `password` |
| **Project** | Grouping of tasks | `id`, `name`, `description`, `color`, `pinned` |
| **Task** | Atomic units of work | `id`, `title`, `status`, `projectId`, `assignedToId` |
| **Collaboration** | Peer-to-peer links | `id`, `userId`, `collaboratedWithId`, `status` |
| **OtpStore** | OTP management | `id`, `email`, `otp`, `purpose`, `expiresAt`, `attempts` |

---

## 🔌 API Reference

### Auth
- `POST /api/auth/signup` - Register and request Signup OTP.
- `POST /api/auth/verify-signup` - Verify OTP and complete registration.
- `POST /api/auth/login` - Authenticate and request Login OTP.
- `POST /api/auth/verify-login` - Verify OTP and receive JWT.
- `GET /api/auth/me` - Retrieve current user profile.
- `PUT /api/auth/password` - Update account password.

### Users & Stats
- `GET /api/users` - List all users (Admin).
- `GET /api/stats` - Fetch aggregate task and project analytics.
- `GET /api/collaborations` - List user collaborations.

### Projects
- `GET /api/projects` - List all projects.
- `POST /api/projects` - [Admin] Create new project.
- `PUT /api/projects/:id` - [Admin] Update project details.
- `DELETE /api/projects/:id` - [Admin] Remove project.

### Tasks
- `GET /api/tasks` - Fetch user-specific or project-specific tasks.
- `POST /api/tasks` - [Admin] Create and assign tasks.
- `PUT /api/tasks/:id` - Update task status or details.
- `DELETE /api/tasks/:id` - [Admin] Delete task.

---

## 📁 Project Structure

```text
WorkSync/
├── backend/            # Server-side logic
│   ├── controllers/    # Route handlers (Auth, Task, Project, User)
│   ├── middleware/     # Auth (JWT) & validation
│   ├── db.ts           # DB Connection (MySQL Pool)
│   └── init_db.ts      # Schema initialization script
├── src/                # Frontend source
│   ├── components/     # Reusable UI elements
│   ├── pages/          # View components (Dashboard, Analytics, etc.)
│   ├── services/       # API interaction layer (Axios)
│   ├── store/          # Zustand state definitions
│   └── types.ts        # Global TypeScript interfaces
├── server.ts           # Express entry point & rate limiters
├── vite.config.ts      # Vite configuration
└── README.md           # Documentation
```

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env` file in the root:
```env
PORT=5000
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=worksync
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 2. Database Setup
```bash
# Initialize the database schema
npx tsx backend/init_db.ts
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Start backend & frontend concurrently (Dev)
npm run dev
```

---

## 🔥 Advantages

1. **Productivity**: Reduces overhead by 40% through clear task ownership.
2. **Real-time Insights**: No more manual status reports; the analytics speak for themselves.
3. **Enhanced Security**: 2FA/OTP support ensures account protection.
4. **Customizability**: Flexible project tags and pinning allow for personalized workflows.

---

## 🔮 Future Roadmap
- [ ] **Mobile App**: Native iOS/Android apps using React Native.
- [ ] **Third-party Integrations**: Sync with industry-standard calendar services and Slack.
- [ ] **Automation Engine**: Automated task prioritization and deadline predictions.
- [ ] **File Sharing**: Attachment support for individual tasks.

---
*Built with ❤️ by the WorkSync Team*