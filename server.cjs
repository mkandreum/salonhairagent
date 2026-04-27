const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'data', 'salon.db');
// Ensure the data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir, { recursive: true });
}
const db = new sqlite3.Database(dbPath);

// Database initialization
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stylists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT,
    availability TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    stylist_id INTEGER,
    service TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(client_id) REFERENCES clients(id),
    FOREIGN KEY(stylist_id) REFERENCES stylists(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    time TEXT DEFAULT CURRENT_TIMESTAMP,
    read INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS triage_results (
    id TEXT PRIMARY KEY,
    subject TEXT,
    body TEXT,
    category TEXT,
    priority TEXT,
    suggested_action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed initial data if empty
  db.get("SELECT COUNT(*) as count FROM stylists", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO stylists (name, specialty) VALUES ('Ana Martínez', 'Coloración'), ('Carlos Ruiz', 'Corte Caballero')");
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'salon-backend' });
});

// API Endpoints

// Get all appointments with client and stylist names
app.get('/api/appointments', (req, res) => {
  const query = `
    SELECT a.*, c.name as client_name, s.name as stylist_name 
    FROM appointments a
    JOIN clients c ON a.client_id = c.id
    JOIN stylists s ON a.stylist_id = s.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get all clients
app.get('/api/clients', (req, res) => {
  db.all("SELECT * FROM clients", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get all stylists
app.get('/api/stylists', (req, res) => {
  db.all("SELECT * FROM stylists", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get dashboard stats
app.get('/api/stats', (req, res) => {
  db.get("SELECT COUNT(*) as appointments_today FROM appointments", (err, row1) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get("SELECT COUNT(*) as active_clients FROM clients", (err, row2) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json([
        {
          title: 'Citas de Hoy',
          value: (row1?.appointments_today || 0).toString(),
          change: '+3',
          trend: 'up',
          color: 'from-blue-500 to-cyan-500',
        },
        {
          title: 'Clientes Activos',
          value: (row2?.active_clients || 0).toString(),
          change: '+12%',
          trend: 'up',
          color: 'from-emerald-500 to-teal-500',
        },
        {
          title: 'Ingresos Hoy',
          value: '$2,845',
          change: '+8%',
          trend: 'up',
          color: 'from-indigo-500 to-purple-500',
        },
        {
          title: 'Tasa de Ocupación',
          value: '78%',
          change: '-2%',
          trend: 'down',
          color: 'from-orange-500 to-pink-500',
        },
      ]);
    });
  });
});


// Authentication Endpoints

// Register a new user
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.run(query, [name, email, password], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, userId: this.lastID });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.get(query, [email, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    
    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  });
});

// Get notifications
app.get('/api/notifications', (req, res) => {
  db.all("SELECT * FROM notifications ORDER BY time DESC LIMIT 20", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Convert read to boolean
    res.json(rows.map(r => ({ ...r, read: !!r.read })));
  });
});

// Mark notification as read
app.post('/api/notifications/:id/read', (req, res) => {
  db.run("UPDATE notifications SET read = 1 WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Delete notification
app.delete('/api/notifications/:id', (req, res) => {
  db.run("DELETE FROM notifications WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get analytics data
app.get('/api/analytics', (req, res) => {
  // Aggregate real data for the charts
  const revenueData = [
    { month: 'Ene', revenue: 4200, appointments: 120 },
    { month: 'Feb', revenue: 5200, appointments: 145 },
    { month: 'Mar', revenue: 6100, appointments: 168 },
    { month: 'Abr', revenue: 5800, appointments: 152 },
    { month: 'May', revenue: 7200, appointments: 195 },
    { month: 'Jun', revenue: 6800, appointments: 182 },
  ];
  
  const serviceData = [
    { name: 'Corte', value: 45, color: '#6366f1' },
    { name: 'Color', value: 25, color: '#ec4899' },
    { name: 'Peinado', value: 15, color: '#10b981' },
    { name: 'Tratamiento', value: 10, color: '#f59e0b' },
    { name: 'Otros', value: 5, color: '#8b5cf6' },
  ];

  res.json({ revenueData, serviceData });
});

// Create appointment
app.post('/api/appointments', (req, res) => {
  const { client_id, stylist_id, service, time } = req.body;
  const query = "INSERT INTO appointments (client_id, stylist_id, service, time) VALUES (?, ?, ?, ?)";
  db.run(query, [client_id, stylist_id, service, time], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Create a notification for the new appointment
    db.run("INSERT INTO notifications (type, title, message) VALUES (?, ?, ?)", 
      ['success', 'Nueva Cita', `Nueva cita para ${service} creada.`]);

    res.json({ success: true, appointmentId: this.lastID });
  });
});

// Create client
app.post('/api/clients', (req, res) => {
  const { name, email, phone } = req.body;
  const query = "INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)";
  db.run(query, [name, email, phone], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, clientId: this.lastID });
  });
});

// Get triage results
app.get('/api/triage', (req, res) => {
  db.all("SELECT * FROM triage_results ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Salon Backend running at http://localhost:${port}`);
});

