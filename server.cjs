const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'salon.db');
const db = new sqlite3.Database(dbPath);

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
  // Mocked for now but based on DB counts
  db.get("SELECT COUNT(*) as appointments_today FROM appointments", (err, row1) => {
    db.get("SELECT COUNT(*) as active_clients FROM clients", (err, row2) => {
      res.json([
        {
          title: 'Citas de Hoy',
          value: row1.appointments_today.toString(),
          change: '+3',
          trend: 'up',
          color: 'from-blue-500 to-cyan-500',
        },
        {
          title: 'Clientes Activos',
          value: row2.active_clients.toString(),
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

