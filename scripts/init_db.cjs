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

async function run() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (row && row.count === 0) {
        db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", ['Admin', 'admin@salonpro.com', hashedPassword], (err) => {
          if (err) console.error("Error seeding user:", err);
          else console.log("Admin user seeded: admin@salonpro.com / admin123");
        });
      }
    });

    // Also ensure other tables exist
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      notes TEXT,
      total_spent REAL DEFAULT 0,
      total_visits INTEGER DEFAULT 0,
      last_visit TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS stylists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialization TEXT,
      rating REAL DEFAULT 5.0,
      availability TEXT DEFAULT 'available',
      next_available TEXT DEFAULT 'Ahora'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      stylist_id INTEGER,
      service TEXT NOT NULL,
      time TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      price REAL DEFAULT 30.0,
      FOREIGN KEY(client_id) REFERENCES clients(id),
      FOREIGN KEY(stylist_id) REFERENCES stylists(id)
    )`);
  });
}

run().catch(console.error);

// Wait a bit before closing to ensure async operations finish
setTimeout(() => {
  db.close();
  console.log('Database initialization complete.');
}, 2000);
