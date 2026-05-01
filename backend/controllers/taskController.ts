import { Request, Response } from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

export const getTasks = async (req: any, res: Response) => {
  try {
    let tasks: any[];
    if (req.user.role === 'admin') {
      const [rows]: any = await pool.query('SELECT * FROM Task');
      tasks = rows;
    } else {
      const [rows]: any = await pool.query('SELECT * FROM Task WHERE assignedToId = ?', [req.user.id]);
      tasks = rows;
    }

    // Include assignedTo and project for each task
    for (let task of tasks) {
      const [users]: any = await pool.query('SELECT id, name, email, role FROM User WHERE id = ?', [task.assignedToId]);
      task.assignedTo = users[0] || null;

      const [projects]: any = await pool.query('SELECT * FROM Project WHERE id = ?', [task.projectId]);
      task.project = projects[0] || null;
    }

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description, dueDate, projectId, assignedToId } = req.body;
    const id = uuidv4();
    const status = 'pending';

    await pool.query(
      'INSERT INTO Task (id, title, description, dueDate, status, projectId, assignedToId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, dueDate, status, projectId, assignedToId || null]
    );

    const [rows]: any = await pool.query('SELECT * FROM Task WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status, title, description, dueDate, assignedToId } = req.body;

    const [tasks]: any = await pool.query('SELECT * FROM Task WHERE id = ?', [id]);
    const task = tasks[0];

    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role === 'member' && task.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this task' });
    }

    const updatedStatus = status === 'in-progress' ? 'in_progress' : (status !== undefined ? status : task.status);
    const updatedTitle = title !== undefined ? title : task.title;
    const updatedDesc = description !== undefined ? description : task.description;
    const updatedDueDate = dueDate !== undefined ? dueDate : task.dueDate;
    const updatedAssigned = assignedToId !== undefined ? assignedToId : task.assignedToId;

    await pool.query(
      'UPDATE Task SET status = ?, title = ?, description = ?, dueDate = ?, assignedToId = ? WHERE id = ?',
      [updatedStatus, updatedTitle, updatedDesc, updatedDueDate, updatedAssigned || null, id]
    );

    const [rows]: any = await pool.query('SELECT * FROM Task WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete tasks' });
    }

    const [result]: any = await pool.query('DELETE FROM Task WHERE id = ?', [id]);
    console.log(`Task ${id} delete attempt. Affected rows: ${result.affectedRows}`);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found or already deleted' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
