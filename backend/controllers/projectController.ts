import { Request, Response } from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

export const getProjects = async (req: any, res: Response) => {
  try {
    let projects: any[];
    if (req.user.role === 'admin') {
      const [rows]: any = await pool.query('SELECT * FROM Project');
      projects = rows;
    } else {
      // For members, show projects they are involved in (have tasks assigned to them)
      const [rows]: any = await pool.query(`
        SELECT DISTINCT p.* FROM Project p
        JOIN Task t ON p.id = t.projectId
        WHERE t.assignedToId = ?
      `, [req.user.id]);
      projects = rows;
    }

    // Fetch tasks and member counts for each project
    for (let project of projects) {
      const [tasks]: any = await pool.query('SELECT * FROM Task WHERE projectId = ?', [project.id]);
      project.tasks = tasks;
      
      const [members]: any = await pool.query('SELECT COUNT(DISTINCT assignedToId) as count FROM Task WHERE projectId = ?', [project.id]);
      project.memberCount = members[0].count;
    }

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProject = async (req: any, res: Response) => {
  try {
    const { name, description } = req.body;
    let { color } = req.body;
    
    // Assign a professional default color if none provided
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
    if (!color) {
      color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    const id = uuidv4();
    const pinned = 0; // Use 0 for false in MySQL

    await pool.query(
      'INSERT INTO Project (id, name, description, color, pinned) VALUES (?, ?, ?, ?, ?)',
      [id, name, description, color, pinned]
    );

    const [rows]: any = await pool.query('SELECT * FROM Project WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, pinned, color } = req.body;

    const [projects]: any = await pool.query('SELECT * FROM Project WHERE id = ?', [id]);
    const project = projects[0];
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const updatedName = name !== undefined ? name : project.name;
    const updatedDesc = description !== undefined ? description : project.description;
    const updatedPinned = pinned !== undefined ? (pinned ? 1 : 0) : project.pinned;
    const updatedColor = color !== undefined ? color : project.color;

    await pool.query(
      'UPDATE Project SET name = ?, description = ?, pinned = ?, color = ? WHERE id = ?',
      [updatedName, updatedDesc, updatedPinned, updatedColor, id]
    );

    const [rows]: any = await pool.query('SELECT * FROM Project WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const deleteProject = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete projects' });
    }

    // Optional: Delete associated tasks first or let foreign key constraints handle it
    await pool.query('DELETE FROM Task WHERE projectId = ?', [id]);
    await pool.query('DELETE FROM Project WHERE id = ?', [id]);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
