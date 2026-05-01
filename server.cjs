var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);

// backend/controllers/authController.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// backend/db.ts
var import_promise = __toESM(require("mysql2/promise"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
if (!process.env.DATABASE_URL) {
  console.error("CRITICAL ERROR: DATABASE_URL is not defined in environment variables.");
  process.exit(1);
}
var pool = import_promise.default.createPool(process.env.DATABASE_URL);
var db_default = pool;

// backend/controllers/authController.ts
var import_uuid = require("uuid");
var JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
var signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(`Signup attempt: ${email}, Role: ${role}`);
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (email.indexOf("@") === -1) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const [existingUsers] = await db_default.query("SELECT * FROM User WHERE email = ?", [email]);
    if (existingUsers.length > 0) return res.status(400).json({ error: "User already exists" });
    const hashedPassword = await import_bcryptjs.default.hash(password, 10);
    const userRole = role || "member";
    const id = (0, import_uuid.v4)();
    await db_default.query(
      "INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [id, name, email, hashedPassword, userRole]
    );
    const token = import_jsonwebtoken.default.sign({ id, email, role: userRole, name }, JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({
      token,
      user: { id, name, email, role: userRole }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const [users] = await db_default.query("SELECT * FROM User WHERE email = ?", [email]);
    const user = users[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (user.role !== role) {
      return res.status(403).json({ error: "Incorrect role for this user" });
    }
    const isPasswordValid = await import_bcryptjs.default.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });
    const token = import_jsonwebtoken.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "1d" });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var getMe = async (req, res) => {
  try {
    const [users] = await db_default.query("SELECT id, name, email, role FROM User WHERE id = ?", [req.user.id]);
    const user = users[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const hashedPassword = await import_bcryptjs.default.hash(newPassword, 10);
    await db_default.query("UPDATE User SET password = ? WHERE id = ?", [hashedPassword, userId]);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// backend/controllers/projectController.ts
var import_uuid2 = require("uuid");
var getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === "admin") {
      const [rows] = await db_default.query("SELECT * FROM Project");
      projects = rows;
    } else {
      const [rows] = await db_default.query(`
        SELECT DISTINCT p.* FROM Project p
        JOIN Task t ON p.id = t.projectId
        WHERE t.assignedToId = ?
      `, [req.user.id]);
      projects = rows;
    }
    for (let project of projects) {
      const [tasks] = await db_default.query("SELECT * FROM Task WHERE projectId = ?", [project.id]);
      project.tasks = tasks;
      const [members] = await db_default.query("SELECT COUNT(DISTINCT assignedToId) as count FROM Task WHERE projectId = ?", [project.id]);
      project.memberCount = members[0].count;
    }
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    let { color } = req.body;
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6"];
    if (!color) {
      color = colors[Math.floor(Math.random() * colors.length)];
    }
    const id = (0, import_uuid2.v4)();
    const pinned = 0;
    await db_default.query(
      "INSERT INTO Project (id, name, description, color, pinned) VALUES (?, ?, ?, ?, ?)",
      [id, name, description, color, pinned]
    );
    const [rows] = await db_default.query("SELECT * FROM Project WHERE id = ?", [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, pinned, color } = req.body;
    const [projects] = await db_default.query("SELECT * FROM Project WHERE id = ?", [id]);
    const project = projects[0];
    if (!project) return res.status(404).json({ error: "Project not found" });
    const updatedName = name !== void 0 ? name : project.name;
    const updatedDesc = description !== void 0 ? description : project.description;
    const updatedPinned = pinned !== void 0 ? pinned ? 1 : 0 : project.pinned;
    const updatedColor = color !== void 0 ? color : project.color;
    await db_default.query(
      "UPDATE Project SET name = ?, description = ?, pinned = ?, color = ? WHERE id = ?",
      [updatedName, updatedDesc, updatedPinned, updatedColor, id]
    );
    const [rows] = await db_default.query("SELECT * FROM Project WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};
var deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete projects" });
    }
    await db_default.query("DELETE FROM Task WHERE projectId = ?", [id]);
    await db_default.query("DELETE FROM Project WHERE id = ?", [id]);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// backend/controllers/taskController.ts
var import_uuid3 = require("uuid");
var getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "admin") {
      const [rows] = await db_default.query("SELECT * FROM Task");
      tasks = rows;
    } else {
      const [rows] = await db_default.query("SELECT * FROM Task WHERE assignedToId = ?", [req.user.id]);
      tasks = rows;
    }
    for (let task of tasks) {
      const [users] = await db_default.query("SELECT id, name, email, role FROM User WHERE id = ?", [task.assignedToId]);
      task.assignedTo = users[0] || null;
      const [projects] = await db_default.query("SELECT * FROM Project WHERE id = ?", [task.projectId]);
      task.project = projects[0] || null;
    }
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var createTask = async (req, res) => {
  try {
    const { title, description, dueDate, projectId, assignedToId } = req.body;
    const id = (0, import_uuid3.v4)();
    const status = "pending";
    await db_default.query(
      "INSERT INTO Task (id, title, description, dueDate, status, projectId, assignedToId) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, title, description, dueDate, status, projectId, assignedToId || null]
    );
    const [rows] = await db_default.query("SELECT * FROM Task WHERE id = ?", [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, dueDate, assignedToId } = req.body;
    const [tasks] = await db_default.query("SELECT * FROM Task WHERE id = ?", [id]);
    const task = tasks[0];
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (req.user.role === "member" && task.assignedToId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to update this task" });
    }
    const updatedStatus = status === "in-progress" ? "in_progress" : status !== void 0 ? status : task.status;
    const updatedTitle = title !== void 0 ? title : task.title;
    const updatedDesc = description !== void 0 ? description : task.description;
    const updatedDueDate = dueDate !== void 0 ? dueDate : task.dueDate;
    const updatedAssigned = assignedToId !== void 0 ? assignedToId : task.assignedToId;
    await db_default.query(
      "UPDATE Task SET status = ?, title = ?, description = ?, dueDate = ?, assignedToId = ? WHERE id = ?",
      [updatedStatus, updatedTitle, updatedDesc, updatedDueDate, updatedAssigned || null, id]
    );
    const [rows] = await db_default.query("SELECT * FROM Task WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete tasks" });
    }
    const [result] = await db_default.query("DELETE FROM Task WHERE id = ?", [id]);
    console.log(`Task ${id} delete attempt. Affected rows: ${result.affectedRows}`);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found or already deleted" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// backend/controllers/userController.ts
var import_uuid4 = require("uuid");
var getUsers = async (req, res) => {
  try {
    const [users] = await db_default.query("SELECT id, name, email, role FROM User");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var getCollaborations = async (req, res) => {
  try {
    let query = `
      SELECT c.*, 
             u1.name as userName, 
             u2.name as collaboratorName 
      FROM Collaboration c
      JOIN User u1 ON c.userId = u1.id
      JOIN User u2 ON c.collaboratedWithId = u2.id
    `;
    let params = [];
    if (req.user.role !== "admin") {
      query += ` WHERE c.userId = ? OR c.collaboratedWithId = ?`;
      params.push(req.user.id, req.user.id);
    }
    const [collaborations] = await db_default.query(query, params);
    const formatted = collaborations.map((c) => ({
      ...c,
      user: { name: c.userName },
      collaborator: { name: c.collaboratorName }
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var createCollaboration = async (req, res) => {
  try {
    const { userId, collaboratedWithId, leaderName } = req.body;
    const targetId = collaboratedWithId || userId;
    const id = (0, import_uuid4.v4)();
    const status = "pending";
    await db_default.query(
      "INSERT INTO Collaboration (id, userId, collaboratedWithId, leaderName, status) VALUES (?, ?, ?, ?, ?)",
      [id, req.user.id, targetId, leaderName || req.user.name, status]
    );
    const [rows] = await db_default.query("SELECT * FROM Collaboration WHERE id = ?", [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var acceptCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    await db_default.query("UPDATE Collaboration SET status = ? WHERE id = ?", ["accepted", id]);
    const [rows] = await db_default.query("SELECT * FROM Collaboration WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let tasksQuery = "SELECT COUNT(*) as count FROM Task";
    let params = [];
    if (role === "member") {
      tasksQuery += " WHERE assignedToId = ?";
      params.push(userId);
    }
    const [taskCountRows] = await db_default.query(tasksQuery, params);
    const totalTasks = taskCountRows[0].count;
    const [completedTasksRows] = await db_default.query(
      tasksQuery + (role === "member" ? ' AND status = "completed"' : ' WHERE status = "completed"'),
      params
    );
    const completedTasks = completedTasksRows[0].count;
    const [trendRows] = await db_default.query(`
      SELECT DATE(createdAt) as date, COUNT(*) as total, 
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM Task
      ${role === "member" ? "WHERE assignedToId = ?" : ""}
      GROUP BY DATE(createdAt)
      ORDER BY DATE(createdAt) DESC
      LIMIT 7
    `, role === "member" ? [userId] : []);
    const trend = (trendRows || []).reverse().map((r) => ({
      name: new Date(r.date).toLocaleDateString("en-US", { weekday: "short" }),
      tasks: r.total,
      completed: r.completed
    }));
    res.json({
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      weeklyTasks: totalTasks,
      trend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update users" });
    }
    await db_default.query("UPDATE User SET role = ? WHERE id = ?", [role, id]);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var deleteCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    await db_default.query("DELETE FROM Collaboration WHERE id = ?", [id]);
    res.json({ message: "Collaboration removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete users" });
    }
    await db_default.query("DELETE FROM User WHERE id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// backend/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET2 = process.env.JWT_SECRET || "super-secret-key";
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });
  import_jsonwebtoken2.default.verify(token, JWT_SECRET2, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};
var authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    next();
  };
};

// server.ts
import_dotenv2.default.config();
var app = (0, import_express.default)();
var PORT = parseInt(process.env.PORT || "3000", 10);
app.use((0, import_cors.default)());
app.use(import_express.default.json());
app.post("/api/auth/signup", signup);
app.post("/api/auth/login", login);
app.get("/api/auth/me", authenticateToken, getMe);
app.put("/api/auth/password", authenticateToken, updatePassword);
app.get("/api/users", authenticateToken, getUsers);
app.get("/api/collaborations", authenticateToken, getCollaborations);
app.get("/api/stats", authenticateToken, getStats);
app.post("/api/collaborate", authenticateToken, createCollaboration);
app.post("/api/collaborate/accept/:id", authenticateToken, acceptCollaboration);
app.delete("/api/collaborate/:id", authenticateToken, deleteCollaboration);
app.put("/api/users/:id", authenticateToken, authorizeRole(["admin"]), updateUser);
app.delete("/api/users/:id", authenticateToken, authorizeRole(["admin"]), deleteUser);
app.get("/api/projects", authenticateToken, getProjects);
app.post("/api/projects", authenticateToken, authorizeRole(["admin"]), createProject);
app.put("/api/projects/:id", authenticateToken, authorizeRole(["admin"]), updateProject);
app.delete("/api/projects/:id", authenticateToken, authorizeRole(["admin"]), deleteProject);
app.get("/api/tasks", authenticateToken, getTasks);
app.post("/api/tasks", authenticateToken, authorizeRole(["admin"]), createTask);
app.put("/api/tasks/:id", authenticateToken, updateTask);
app.delete("/api/tasks/:id", authenticateToken, authorizeRole(["admin"]), deleteTask);
if (process.env.NODE_ENV === "production") {
  const __dirname = import_path.default.resolve();
  const distPath = import_path.default.join(__dirname, "dist");
  app.use(import_express.default.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(import_path.default.join(distPath, "index.html"));
  });
}
function startServer() {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
  });
}
startServer();
