const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key';  // Use environment variable in production

// MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',      // Update if using a different host
  user: 'root',           // Your MySQL username
  password: 'yourpassword', // Your MySQL password
  database: 'career_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) return res.status(400).json({ error: 'User already exists' });

    // Hash password and insert
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT id, username, password FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected Route: Get Careers
app.get('/api/careers', authenticateToken, async (req, res) => {
  const { interest, education, skill } = req.query;
  try {
    const [careers] = await db.execute(
      'SELECT title, description FROM careers WHERE interest = ? AND (education = ? OR education = "any") AND (skill = ? OR skill = "any")',
      [interest, education, skill]
    );
    res.json(careers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch careers' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key';  // Use environment variable in production

// MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',      // Update if using a different host
  user: 'root',           // Your MySQL username
  password: 'yourpassword', // Your MySQL password
  database: 'career_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) return res.status(400).json({ error: 'User already exists' });

    // Hash password and insert
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT id, username, password FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected Route: Get Careers
app.get('/api/careers', authenticateToken, async (req, res) => {
  const { interest, education, skill } = req.query;
  try {
    const [careers] = await db.execute(
      'SELECT title, description FROM careers WHERE interest = ? AND (education = ? OR education = "any") AND (skill = ? OR skill = "any")',
      [interest, education, skill]
    );
    res.json(careers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch careers' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});