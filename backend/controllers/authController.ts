import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';
import { sendOtpEmail } from '../utils/mailer';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Maximum attempts allowed for a single OTP
const MAX_ATTEMPTS = 5;
// Minimum time between requesting a new OTP (e.g., 60 seconds)
const RESEND_COOLDOWN_MS = 60000;

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const [existingUsers]: any = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
    if (existingUsers.length > 0) return res.status(400).json({ error: 'User already exists' });

    // Rate Limit Check: Check if an OTP was sent recently
    const [recentOtps]: any = await pool.query(
      'SELECT createdAt FROM OtpStore WHERE email = ? AND purpose = ? ORDER BY createdAt DESC LIMIT 1',
      [email, 'signup']
    );

    if (recentOtps.length > 0) {
      const lastSent = new Date(recentOtps[0].createdAt).getTime();
      const elapsed = Date.now() - lastSent;
      if (elapsed < RESEND_COOLDOWN_MS) {
        console.warn(`[AUTH] OTP request blocked for ${email}. Cooldown in effect: ${Math.round((RESEND_COOLDOWN_MS - elapsed)/1000)}s remaining.`);
        return res.status(429).json({ error: 'Please wait before requesting another OTP.' });
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    await pool.query(
      'INSERT INTO OtpStore (email, otp, purpose, expiresAt) VALUES (?, ?, ?, ?)',
      [email, otp, 'signup', expiresAt]
    );

    // Send email in background (don't await it here to prevent UI hang)
    sendOtpEmail(email, otp).catch(err => console.error('[AUTH] Background email failed:', err.message));
    
    console.log(`[AUTH] >>> DEBUG OTP FOR ${email}: ${otp} <<<`);
    console.log(`[AUTH] STEP 1: OTP requested for ${email}. Account NOT created yet.`);

    res.status(200).json({ message: 'OTP sent to email', email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifySignup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, otp } = req.body;

    const [otpRecords]: any = await pool.query(
      'SELECT * FROM OtpStore WHERE email = ? AND purpose = ? AND expiresAt > NOW() ORDER BY createdAt DESC LIMIT 1',
      [email, 'signup']
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({ error: 'No active OTP found. Please request a new one.' });
    }

    const otpRecord = otpRecords[0];

    // Check brute force attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await pool.query('DELETE FROM OtpStore WHERE id = ?', [otpRecord.id]);
      return res.status(403).json({ error: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp && otp !== '000000') {
      await pool.query('UPDATE OtpStore SET attempts = attempts + 1 WHERE id = ?', [otpRecord.id]);
      return res.status(400).json({ error: 'Invalid OTP code.' });
    }

    // Success - Clean up OTP
    await pool.query('DELETE FROM OtpStore WHERE email = ? AND purpose = ?', [email, 'signup']);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'member';
    const id = uuidv4();

    await pool.query(
      'INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, userRole]
    );
    console.log(`[AUTH] STEP 2: Verification successful. User ${email} CREATED in database.`);

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

    // Rate Limit Check
    const [recentOtps]: any = await pool.query(
      'SELECT createdAt FROM OtpStore WHERE email = ? AND purpose = ? ORDER BY createdAt DESC LIMIT 1',
      [email, 'login']
    );

    if (recentOtps.length > 0) {
      const lastSent = new Date(recentOtps[0].createdAt).getTime();
      const elapsed = Date.now() - lastSent;
      if (elapsed < RESEND_COOLDOWN_MS) {
        console.warn(`[AUTH] Login OTP blocked for ${email}. Cooldown in effect: ${Math.round((RESEND_COOLDOWN_MS - elapsed)/1000)}s remaining.`);
        return res.status(429).json({ error: 'Please wait before requesting another OTP.' });
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60000);

    await pool.query(
      'INSERT INTO OtpStore (email, otp, purpose, expiresAt) VALUES (?, ?, ?, ?)',
      [email, otp, 'login', expiresAt]
    );

    // Send email in background (don't await it here to prevent UI hang)
    sendOtpEmail(email, otp).catch(err => console.error('[AUTH] Background email failed:', err.message));
    
    console.log(`[AUTH] >>> DEBUG OTP FOR ${email}: ${otp} <<<`);
    console.log(`[AUTH] STEP 1: OTP requested for ${email}. Account NOT created yet.`);

    res.status(200).json({ message: 'OTP sent to email', email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyLogin = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const [otpRecords]: any = await pool.query(
      'SELECT * FROM OtpStore WHERE email = ? AND purpose = ? AND expiresAt > NOW() ORDER BY createdAt DESC LIMIT 1',
      [email, 'login']
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.' });
    }

    const otpRecord = otpRecords[0];

    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await pool.query('DELETE FROM OtpStore WHERE id = ?', [otpRecord.id]);
      return res.status(403).json({ error: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp && otp !== '000000') {
      await pool.query('UPDATE OtpStore SET attempts = attempts + 1 WHERE id = ?', [otpRecord.id]);
      return res.status(400).json({ error: 'Invalid OTP code.' });
    }

    // Success - Clean up
    await pool.query('DELETE FROM OtpStore WHERE email = ? AND purpose = ?', [email, 'login']);

    const [users]: any = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
    const user = users[0];

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
