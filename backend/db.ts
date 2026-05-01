import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('CRITICAL ERROR: DATABASE_URL is not defined in environment variables.');
  process.exit(1);
}

const pool = mysql.createPool(process.env.DATABASE_URL);

export default pool;
