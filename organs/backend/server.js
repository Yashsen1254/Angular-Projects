const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'organ_donation_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Helper function to generate ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [rows] = await pool.execute(
      'SELECT id, email, name, role, phone, address FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, phone, address } = req.body;

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const id = generateId();
    await pool.execute(
      'INSERT INTO users (id, email, password, name, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, email, password, name, role, phone || null, address || null]
    );

    const [rows] = await pool.execute(
      'SELECT id, email, name, role, phone, address FROM users WHERE id = ?',
      [id]
    );

    res.status(201).json({ user: rows[0] });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Organ Routes
app.get('/api/organs', async (req, res) => {
  try {
    const { status, donorId } = req.query;
    let query = 'SELECT * FROM organs WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (donorId) {
      query += ' AND donor_id = ?';
      params.push(donorId);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get organs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/organs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM organs WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Organ not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get organ error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/organs', async (req, res) => {
  try {
    const { donorId, donorName, organType, bloodType, description } = req.body;

    const id = generateId();
    await pool.execute(
      'INSERT INTO organs (id, donor_id, donor_name, organ_type, blood_type, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, donorId, donorName, organType, bloodType, 'available', description || null]
    );

    const [rows] = await pool.execute('SELECT * FROM organs WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create organ error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/organs/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute('UPDATE organs SET status = ? WHERE id = ?', [status, id]);

    const [rows] = await pool.execute('SELECT * FROM organs WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Update organ status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Request Routes
app.get('/api/requests', async (req, res) => {
  try {
    const { receiverId, status } = req.query;
    let query = 'SELECT * FROM organ_requests WHERE 1=1';
    const params = [];

    if (receiverId) {
      query += ' AND receiver_id = ?';
      params.push(receiverId);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM organ_requests WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const { receiverId, receiverName, organId, organType, bloodType, message } = req.body;

    const id = generateId();
    await pool.execute(
      'INSERT INTO organ_requests (id, receiver_id, receiver_name, organ_id, organ_type, blood_type, status, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, receiverId, receiverName, organId, organType, bloodType, 'pending', message || null]
    );

    // Update organ status to requested
    await pool.execute('UPDATE organs SET status = ? WHERE id = ?', ['requested', organId]);

    const [rows] = await pool.execute('SELECT * FROM organ_requests WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, donorContact, receiverContact } = req.body;

    await pool.execute(
      'UPDATE organ_requests SET status = ?, donor_contact = ?, receiver_contact = ? WHERE id = ?',
      [status, donorContact || null, receiverContact || null, id]
    );

    const [rows] = await pool.execute('SELECT * FROM organ_requests WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Routes
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT id, email, name, role, phone, address FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

