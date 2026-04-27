const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'salon.db');
const db = new sqlite3.Database(dbPath);


db.serialize(() => {
  // Clients Table
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    type TEXT DEFAULT 'Regular',
    total_visits INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0.0,
    last_visit TEXT
  )`);

  // Stylists Table
  db.run(`CREATE TABLE IF NOT EXISTS stylists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT,
    rating REAL DEFAULT 5.0,
    availability TEXT DEFAULT 'available',
    next_available TEXT
  )`);

  // Appointments Table
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

  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed Data
  db.get("SELECT COUNT(*) as count FROM clients", (err, row) => {
    if (row.count === 0) {
      db.run("INSERT INTO clients (name, phone, email, type, total_visits, total_spent, last_visit) VALUES ('Sarah Johnson', '(555) 123-4567', 'sarah@email.com', 'VIP', 12, 850.0, '2024-04-08')");
      db.run("INSERT INTO clients (name, phone, email, type, total_visits, total_spent, last_visit) VALUES ('Michael Brown', '(555) 234-5678', 'michael@email.com', 'Regular', 8, 520.0, '2024-04-07')");
    }
  });

  db.get("SELECT COUNT(*) as count FROM stylists", (err, row) => {
    if (row.count === 0) {
      db.run("INSERT INTO stylists (name, specialization, rating, availability, next_available) VALUES ('Emma Wilson', 'Especialista en Color', 4.9, 'busy', '2:00 PM')");
      db.run("INSERT INTO stylists (name, specialization, rating, availability, next_available) VALUES ('James Miller', 'Barbero', 4.8, 'available', 'Ahora')");
    }
  });

  db.get("SELECT COUNT(*) as count FROM appointments", (err, row) => {
    if (row.count === 0) {
      db.run("INSERT INTO appointments (client_id, stylist_id, service, time, status) VALUES (1, 1, 'Corte y Estilo', '09:00 AM', 'confirmed')");
      db.run("INSERT INTO appointments (client_id, stylist_id, service, time, status) VALUES (2, 2, 'Arreglo de Barba', '10:30 AM', 'confirmed')");
    }
  });

  // Seed Users
  db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
    if (row.count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", ['Admin', 'admin@salonpro.com', hashedPassword]);
    }
  });
});

console.log('Database initialized successfully at', dbPath);
db.close();
