import pool from './db';

const initDB = async () => {
  try {
    console.log('Initializing database tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS User (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'member') DEFAULT 'member',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Project (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(50),
        pinned BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Task (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        dueDate DATETIME,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        projectId VARCHAR(255),
        assignedToId VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
        FOREIGN KEY (assignedToId) REFERENCES User(id) ON DELETE SET NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Collaboration (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255),
        collaboratedWithId VARCHAR(255),
        leaderName VARCHAR(255),
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (collaboratedWithId) REFERENCES User(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS OtpStore (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        purpose ENUM('signup', 'login') NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        attempts INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDB();
