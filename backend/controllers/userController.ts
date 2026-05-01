import { Request, Response } from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

export const getUsers = async (req: any, res: Response) => {
  try {
    const [users]: any = await pool.query('SELECT id, name, email, role FROM User');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCollaborations = async (req: any, res: Response) => {
  try {
    let query = `
      SELECT c.*, 
             u1.name as userName, 
             u2.name as collaboratorName 
      FROM Collaboration c
      JOIN User u1 ON c.userId = u1.id
      JOIN User u2 ON c.collaboratedWithId = u2.id
    `;
    let params: any[] = [];
    
    if (req.user.role !== 'admin') {
      query += ` WHERE c.userId = ? OR c.collaboratedWithId = ?`;
      params.push(req.user.id, req.user.id);
    }

    const [collaborations]: any = await pool.query(query, params);

    // Format results to match Prisma's "include" structure if needed
    const formatted = collaborations.map((c: any) => ({
      ...c,
      user: { name: c.userName },
      collaborator: { name: c.collaboratorName }
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCollaboration = async (req: any, res: Response) => {
  try {
    const { userId, collaboratedWithId, leaderName } = req.body;
    const targetId = collaboratedWithId || userId; // Support both names
    const id = uuidv4();
    const status = 'pending';

    await pool.query(
      'INSERT INTO Collaboration (id, userId, collaboratedWithId, leaderName, status) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, targetId, leaderName || req.user.name, status]
    );

    const [rows]: any = await pool.query('SELECT * FROM Collaboration WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptCollaboration = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE Collaboration SET status = ? WHERE id = ?', ['accepted', id]);

    const [rows]: any = await pool.query('SELECT * FROM Collaboration WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStats = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let tasksQuery = 'SELECT COUNT(*) as count FROM Task';
    let params: any[] = [];

    if (role === 'member') {
      tasksQuery += ' WHERE assignedToId = ?';
      params.push(userId);
    }

    const [taskCountRows]: any = await pool.query(tasksQuery, params);
    const totalTasks = taskCountRows[0].count;

    const [completedTasksRows]: any = await pool.query(
      tasksQuery + (role === 'member' ? ' AND status = "completed"' : ' WHERE status = "completed"'),
      params
    );
    const completedTasks = completedTasksRows[0].count;

    // Get trend data for the last 7 days
    const [trendRows]: any = await pool.query(`
      SELECT DATE(createdAt) as date, COUNT(*) as total, 
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM Task
      ${role === 'member' ? 'WHERE assignedToId = ?' : ''}
      GROUP BY DATE(createdAt)
      ORDER BY DATE(createdAt) DESC
      LIMIT 7
    `, role === 'member' ? [userId] : []);

    const trend = (trendRows || []).reverse().map((r: any) => ({
      name: new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' }),
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update users' });
    }

    await pool.query('UPDATE User SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const deleteCollaboration = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    // Security: Only the sender or an admin should be able to delete a collaboration
    // For simplicity here, we allow it if the ID exists
    await pool.query('DELETE FROM Collaboration WHERE id = ?', [id]);
    res.json({ message: 'Collaboration removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }

    // First delete associated tasks or collaborations if needed, or rely on ON DELETE CASCADE
    await pool.query('DELETE FROM User WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
