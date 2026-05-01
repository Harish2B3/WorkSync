import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(`Signup attempt: ${email}, Role: ${role}`);
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (email.indexOf('@') === -1) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const [existingUsers]: any = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
    if (existingUsers.length > 0) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Security: Only allow 'member' role by default during public signup
    // Admin role should be created via a separate admin tool or manual DB entry
    const userRole = role || 'member'; 
    const id = uuidv4();

    await pool.query(
      'INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, userRole]
    );

    const token = jwt.sign({ id, email, role: userRole, name }, JWT_SECRET, { expiresIn: '1d' });
    
    res.status(201).json({
      token,
      user: { id, name, email, role: userRole }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    
    const [users]: any = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
    const user = users[0];

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role !== role) {
      return res.status(403).json({ error: 'Incorrect role for this user' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const [users]: any = await pool.query('SELECT id, name, email, role FROM User WHERE id = ?', [req.user.id]);
    const user = users[0];

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const updatePassword = async (req: any, res: Response) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE User SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
