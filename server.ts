import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { signup, login, getMe, updatePassword } from "./backend/controllers/authController";
import { getProjects, createProject, updateProject, deleteProject } from "./backend/controllers/projectController";
import { getTasks, createTask, updateTask, deleteTask } from "./backend/controllers/taskController";
import { getUsers, getCollaborations, createCollaboration, acceptCollaboration, getStats, updateUser, deleteCollaboration, deleteUser } from "./backend/controllers/userController";
import { authenticateToken, authorizeRole } from "./backend/middleware/auth";

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());

// --- API Routes ---

// Auth
app.post("/api/auth/signup", signup);
app.post("/api/auth/login", login);
app.get("/api/auth/me", authenticateToken, getMe);
app.put("/api/auth/password", authenticateToken, updatePassword);

// Users
app.get("/api/users", authenticateToken, getUsers);
app.get("/api/collaborations", authenticateToken, getCollaborations);
app.get("/api/stats", authenticateToken, getStats);
app.post("/api/collaborate", authenticateToken, createCollaboration);
app.post("/api/collaborate/accept/:id", authenticateToken, acceptCollaboration);
app.delete("/api/collaborate/:id", authenticateToken, deleteCollaboration);
app.put("/api/users/:id", authenticateToken, authorizeRole(['admin']), updateUser);
app.delete("/api/users/:id", authenticateToken, authorizeRole(['admin']), deleteUser);

// Projects
app.get("/api/projects", authenticateToken, getProjects);
app.post("/api/projects", authenticateToken, authorizeRole(['admin']), createProject);
app.put("/api/projects/:id", authenticateToken, authorizeRole(['admin']), updateProject);
app.delete("/api/projects/:id", authenticateToken, authorizeRole(['admin']), deleteProject);

// Tasks
app.get("/api/tasks", authenticateToken, getTasks);
app.post("/api/tasks", authenticateToken, authorizeRole(['admin']), createTask);
app.put("/api/tasks/:id", authenticateToken, updateTask);
app.delete("/api/tasks/:id", authenticateToken, authorizeRole(['admin']), deleteTask);

// --- Production Static Files ---
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

function startServer() {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
  });
}

startServer();
