const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('ADVERTENCIA: JWT_SECRET no está definido. Usando uno generado automáticamente.');
}

const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const loginAttempts = new Map();

app.use(cors());
app.use(express.json());

// API Endpoints
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado. Se requiere autenticación.' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sesión expirada o token inválido.' });
    req.user = user;
    next();
  });
};

// Rate Limiter for login
const checkRateLimit = (email) => {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || [];
  const recentAttempts = attempts.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (recentAttempts.length >= RATE_LIMIT_MAX) {
    return false;
  }
  recentAttempts.push(now);
  loginAttempts.set(email, recentAttempts);
  return true;
};

app.use((req, res, next) => {
  const now = Date.now();
  for (const [email, attempts] of loginAttempts.entries()) {
    const valid = attempts.filter(t => now - t < RATE_LIMIT_WINDOW);
    if (valid.length === 0) loginAttempts.delete(email);
    else loginAttempts.set(email, valid);
  }
  next();
});

const dbPath = path.join(__dirname, 'data', 'salon.db');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    try {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('Data directory created:', dataDir);
    } catch (e) {
        console.error('ERROR: No se pudo crear el directorio data:', e.message);
    }
}
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('ERROR: No se pudo conectar a la base de datos:', err.message);
  } else {
    console.log('Base de datos conectada:', dbPath);
  }
});

// Database initialization
db.serialize(() => {
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

  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  // Seed initial data if empty
  db.get("SELECT COUNT(*) as count FROM stylists", (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO stylists (name, specialization, rating, availability, next_available) VALUES 
        ('Ana Martínez', 'Coloración y Mechas', 4.9, 'available', 'Ahora'),
        ('Carlos Ruiz', 'Corte Caballero y Barba', 4.7, 'available', '10:30'),
        ('Laura Sánchez', 'Peinados y Ondulados', 4.8, 'available', '11:00'),
        ('Miguel Torres', 'Tratamientos Capilares', 4.6, 'busy', '12:00'),
        ('Sofia Jiménez', 'Coloración y Balayage', 5.0, 'available', 'Ahora')`);
    }
  });

  db.get("SELECT COUNT(*) as count FROM clients", (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO clients (name, email, phone, total_spent, total_visits, last_visit) VALUES 
        ('María García', 'maria.garcia@email.com', '+34 612 345 678', 485.50, 8, '2026-04-20'),
        ('Isabel Fernández', 'isabel.f@email.com', '+34 623 456 789', 320.00, 5, '2026-04-15'),
        ('Antonio López', 'antonio.lopez@email.com', '+34 634 567 890', 210.00, 6, '2026-04-10'),
        ('Carmen Rodríguez', 'carmen.r@email.com', '+34 645 678 901', 560.75, 12, '2026-04-22'),
        ('José Martínez', 'jose.m@email.com', '+34 656 789 012', 180.00, 4, '2026-03-30'),
        ('Lucía Pérez', 'lucia.perez@email.com', '+34 667 890 123', 420.00, 9, '2026-04-18'),
        ('Francisco González', 'fran.g@email.com', '+34 678 901 234', 95.00, 2, '2026-04-05'),
        ('Elena Sánchez', 'elena.s@email.com', '+34 689 012 345', 735.00, 15, '2026-04-24')`);
    }
  });

  db.get("SELECT COUNT(*) as count FROM appointments", (err, row) => {
    if (row && row.count === 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      db.run(`INSERT INTO appointments (client_id, stylist_id, service, time, date, status, price) VALUES 
        (1, 1, 'Mechas y Color', '09:00', '${today}', 'confirmed', 95.00),
        (2, 3, 'Corte y Peinado', '10:00', '${today}', 'confirmed', 55.00),
        (3, 2, 'Corte Caballero', '10:30', '${today}', 'pending', 25.00),
        (4, 5, 'Balayage', '11:00', '${today}', 'confirmed', 120.00),
        (6, 4, 'Tratamiento Keratina', '12:00', '${today}', 'pending', 80.00),
        (5, 2, 'Corte y Barba', '13:00', '${today}', 'confirmed', 35.00),
        (8, 1, 'Color Completo', '15:00', '${today}', 'confirmed', 75.00),
        (7, 3, 'Corte Mujer', '16:00', '${today}', 'pending', 40.00),
        (1, 5, 'Mechas Californianas', '09:00', '${yesterday}', 'confirmed', 110.00),
        (4, 1, 'Tinte Raíces', '11:00', '${yesterday}', 'confirmed', 65.00),
        (2, 2, 'Corte Caballero', '12:00', '${yesterday}', 'confirmed', 25.00),
        (8, 4, 'Hidratación Profunda', '14:00', '${yesterday}', 'confirmed', 60.00),
        (3, 3, 'Peinado Recogido', '09:30', '${tomorrow}', 'confirmed', 50.00),
        (6, 1, 'Color y Mechas', '10:00', '${tomorrow}', 'pending', 105.00),
        (5, 2, 'Corte y Barba', '11:30', '${tomorrow}', 'confirmed', 35.00)`);
    }
  });

  db.get("SELECT COUNT(*) as count FROM notifications", (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO notifications (type, title, message, read) VALUES 
        ('success', 'Nueva Cita Confirmada', 'María García ha confirmado su cita de Mechas y Color para hoy a las 09:00.', 0),
        ('info', 'Recordatorio de Cita', 'Carmen Rodríguez tiene cita de Balayage hoy a las 11:00.', 0),
        ('warning', 'Cita Pendiente de Confirmar', 'Francisco González tiene una cita pendiente para el día de mañana.', 0),
        ('success', 'Pago Recibido', 'Se ha recibido el pago de €95.00 de Isabel Fernández.', 1),
        ('info', 'Nueva Clienta Registrada', 'Elena Sánchez se ha registrado como nueva clienta del salón.', 1)`);
    }
  });

  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row && row.count === 0) {
      const bcrypt = require('bcryptjs');
      bcrypt.hash('admin123', 10, (hashErr, hash) => {
        if (!hashErr) {
          db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            ['Administrador', 'admin@salon.com', hash],
            (insertErr) => {
              if (!insertErr) console.log('Usuario admin creado: admin@salon.com / admin123');
            }
          );
        }
      });
    }
  });

  // Basic migration logic to add columns if they don't exist (for existing databases)
  const addColumn = (table, column, type) => {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, (err) => {
      if (err) {
        if (!err.message.includes('duplicate column name')) {
          console.log(`Note: ${err.message}`);
        }
      } else {
        console.log(`Added column ${column} to ${table}`);
      }
    });
  };

  addColumn('clients', 'total_spent', 'REAL DEFAULT 0');
  addColumn('clients', 'total_visits', 'INTEGER DEFAULT 0');
  addColumn('clients', 'last_visit', 'TEXT');
  addColumn('stylists', 'rating', 'REAL DEFAULT 5.0');
  addColumn('stylists', 'next_available', 'TEXT DEFAULT "Ahora"');
  addColumn('stylists', 'specialization', 'TEXT');
  addColumn('appointments', 'date', 'TEXT');
  addColumn('appointments', 'price', 'REAL DEFAULT 30.0');
});



// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'salon-backend' });
});

// API Endpoints

// Get all appointments with client and stylist names
app.get('/api/appointments', authenticateToken, (req, res) => {
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
app.get('/api/clients', authenticateToken, (req, res) => {
  db.all("SELECT * FROM clients", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get all stylists
app.get('/api/stylists', authenticateToken, (req, res) => {
  db.all("SELECT * FROM stylists", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get dashboard stats
app.get('/api/stats', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  // Logic to calculate real stats
  const queries = {
    todayApps: "SELECT COUNT(*) as count FROM appointments WHERE date = ?",
    yesterdayApps: "SELECT COUNT(*) as count FROM appointments WHERE date = ?",
    totalClients: "SELECT COUNT(*) as count FROM clients",
    revenue: "SELECT SUM(total_spent) as total FROM clients",
    stylistCount: "SELECT COUNT(*) as count FROM stylists WHERE availability != 'off'"
  };

  db.get(queries.todayApps, [today], (err, rowToday) => {
    db.get(queries.yesterdayApps, [yesterday], (err, rowYesterday) => {
      db.get(queries.totalClients, [], (err, rowClients) => {
        db.get(queries.revenue, [], (err, rowRevenue) => {
          db.get(queries.stylistCount, [], (err, rowStylists) => {
            
            const todayCount = rowToday?.count || 0;
            const yesterdayCount = rowYesterday?.count || 0;
            const appChange = todayCount - yesterdayCount;
            const appTrend = appChange >= 0 ? 'up' : 'down';
            const appChangeStr = (appChange >= 0 ? '+' : '') + appChange.toString();

            const totalRevenue = rowRevenue?.total || 0;
            const activeStylists = rowStylists?.count || 1;
            // Assume 8 slots per day per stylist for occupation rate
            const totalSlots = activeStylists * 8;
            const occupationRate = Math.min(100, Math.round((todayCount / totalSlots) * 100));

            res.json([
              {
                title: 'Citas Hoy',
                value: todayCount.toString(),
                change: appChangeStr,
                trend: appTrend,
                color: 'from-indigo-500 to-purple-500',
              },
              {
                title: 'Clientes Activos',
                value: (rowClients?.count || 0).toString(),
                change: '+12%', // Still a bit mocked but based on real count
                trend: 'up',
                color: 'from-emerald-500 to-teal-500',
              },
              {
                title: 'Ingresos Totales',
                value: `$${Math.round(totalRevenue).toLocaleString()}`,
                change: '+15.2%',
                trend: 'up',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                title: 'Tasa de Ocupación',
                value: `${occupationRate}%`,
                change: occupationRate > 70 ? '+5%' : '-2%',
                trend: occupationRate > 70 ? 'up' : 'down',
                color: 'from-orange-500 to-pink-500',
              },
            ]);
          });
        });
      });
    });
  });
});

// Authentication Endpoints

// Register a new user
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password debe tener al menos 6 caracteres' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.run(query, [name, email, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'El email ya está registrado' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, userId: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el registro' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' });
  }
  
  if (!checkRateLimit(email)) {
    return res.status(429).json({ error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' });
  }
  
  const query = "SELECT * FROM users WHERE email = ?";
  db.get(query, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });

    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword, token });
  });
});

// Get notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  db.all("SELECT * FROM notifications ORDER BY time DESC LIMIT 20", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({ ...r, read: !!r.read })));
  });
});

// Mark notification as read
app.post('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notifId = parseInt(req.params.id);
  if (isNaN(notifId)) return res.status(400).json({ error: 'ID inválido' });
  db.run("UPDATE notifications SET read = 1 WHERE id = ?", [notifId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Delete notification
app.delete('/api/notifications/:id', authenticateToken, (req, res) => {
  const notifId = parseInt(req.params.id);
  if (isNaN(notifId)) return res.status(400).json({ error: 'ID inválido' });
  db.run("DELETE FROM notifications WHERE id = ?", [notifId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get analytics data
app.get('/api/analytics', authenticateToken, (req, res) => {
  const revenueQuery = `
    SELECT 
      CASE strftime('%m', date)
        WHEN '01' THEN 'Ene' WHEN '02' THEN 'Feb' WHEN '03' THEN 'Mar'
        WHEN '04' THEN 'Abr' WHEN '05' THEN 'May' WHEN '06' THEN 'Jun'
        WHEN '07' THEN 'Jul' WHEN '08' THEN 'Ago' WHEN '09' THEN 'Sep'
        WHEN '10' THEN 'Oct' WHEN '11' THEN 'Nov' WHEN '12' THEN 'Dic'
      END as month,
      SUM(price) as revenue,
      COUNT(*) as appointments
    FROM appointments
    GROUP BY month
    ORDER BY strftime('%m', date)
  `;

  const serviceQuery = `
    SELECT service as name, COUNT(*) as count
    FROM appointments
    GROUP BY service
  `;

  db.all(revenueQuery, [], (err, revenueRows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all(serviceQuery, [], (err, serviceRows) => {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT SUM(price) as totalRevenue FROM appointments", (err, totalRev) => {
        db.get("SELECT COUNT(*) as totalAppointments FROM appointments", (err, totalAppts) => {
          
          // Map colors to services
          const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
          const total = totalAppts?.totalAppointments || 1;
          const serviceData = serviceRows.map((s, i) => ({
            name: s.name,
            value: Math.round((s.count / total) * 100),
            color: colors[i % colors.length]
          }));

          res.json({
            revenueData: revenueRows.length > 0 ? revenueRows : [
              { month: 'Ene', revenue: 0, appointments: 0 },
              { month: 'Feb', revenue: 0, appointments: 0 }
            ],
            serviceData: serviceData.length > 0 ? serviceData : [
              { name: 'Sin datos', value: 100, color: '#94a3b8' }
            ],
            totalRevenue: totalRev?.totalRevenue || 0,
            totalAppointments: totalAppts?.totalAppointments || 0
          });
        });
      });
    });
  });
});

// Create triage result
app.post('/api/triage', authenticateToken, (req, res) => {
  const { id, subject, body, category, priority, suggested_action } = req.body;
  if (!id || !subject || !category || !priority) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const query = "INSERT INTO triage_results (id, subject, body, category, priority, suggested_action) VALUES (?, ?, ?, ?, ?, ?)";
  db.run(query, [id, subject, body, category, priority, suggested_action], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Create appointment
app.post('/api/appointments', authenticateToken, (req, res) => {
  const { client_id, stylist_id, service, time, date, price } = req.body;
  if (!client_id || !stylist_id || !service || !time || !date) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const appointmentPrice = parseFloat(price) || 30.0;
  if (appointmentPrice < 0 || appointmentPrice > 10000) {
    return res.status(400).json({ error: 'Precio inválido' });
  }
  const query = "INSERT INTO appointments (client_id, stylist_id, service, time, date, price) VALUES (?, ?, ?, ?, ?, ?)";
  db.run(query, [client_id, stylist_id, service, time, date, appointmentPrice], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Create a notification for the new appointment
    db.run("INSERT INTO notifications (type, title, message) VALUES (?, ?, ?)", 
      ['success', 'Nueva Cita', `Nueva cita para ${service} creada.`]);

    res.json({ success: true, appointmentId: this.lastID });
  });
});

// Create client
app.post('/api/clients', authenticateToken, (req, res) => {
  const { name, email, phone } = req.body;
  const query = "INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)";
  db.run(query, [name, email, phone], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, clientId: this.lastID });
  });
});

// Delete appointment
app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
  const appId = parseInt(req.params.id);
  if (isNaN(appId)) return res.status(400).json({ error: 'ID inválido' });
  db.run("DELETE FROM appointments WHERE id = ?", [appId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Delete client
app.delete('/api/clients/:id', authenticateToken, (req, res) => {
  const clientId = parseInt(req.params.id);
  if (isNaN(clientId)) return res.status(400).json({ error: 'ID inválido' });
  db.run("DELETE FROM clients WHERE id = ?", [clientId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Update client
app.put('/api/clients/:id', authenticateToken, (req, res) => {
  const clientId = parseInt(req.params.id);
  if (isNaN(clientId)) return res.status(400).json({ error: 'ID inválido' });
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nombre y email son requeridos' });
  db.run("UPDATE clients SET name = ?, email = ?, phone = ? WHERE id = ?", 
    [name, email, phone, clientId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Update appointment status
app.put('/api/appointments/:id/status', authenticateToken, (req, res) => {
  const appId = parseInt(req.params.id);
  if (isNaN(appId)) return res.status(400).json({ error: 'ID inválido' });
  const { status } = req.body;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  db.run("UPDATE appointments SET status = ? WHERE id = ?", [status, appId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Update full appointment
app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  const appId = parseInt(req.params.id);
  if (isNaN(appId)) return res.status(400).json({ error: 'ID inválido' });
  const { client_id, stylist_id, service, time, date, status } = req.body;
  if (!client_id || !stylist_id || !service || !time || !date) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  if (status && !['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  db.run(`UPDATE appointments SET 
    client_id = ?, 
    stylist_id = ?, 
    service = ?, 
    time = ?, 
    date = ?, 
    status = ? 
    WHERE id = ?`, 
    [client_id, stylist_id, service, time, date, status || 'pending', appId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Create stylist
app.post('/api/stylists', authenticateToken, (req, res) => {
  const { name, specialization, rating, availability, next_available } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre es requerido' });
  const stylistRating = parseFloat(rating) || 5.0;
  if (stylistRating < 0 || stylistRating > 5) return res.status(400).json({ error: 'Rating inválido' });
  const query = "INSERT INTO stylists (name, specialization, rating, availability, next_available) VALUES (?, ?, ?, ?, ?)";
  db.run(query, [name, specialization, stylistRating, availability || 'available', next_available || 'Ahora'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, stylistId: this.lastID });
  });
});

// Delete stylist
app.delete('/api/stylists/:id', authenticateToken, (req, res) => {
  const stylistId = parseInt(req.params.id);
  if (isNaN(stylistId)) return res.status(400).json({ error: 'ID inválido' });
  db.run("DELETE FROM stylists WHERE id = ?", [stylistId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get triage results
app.get('/api/triage', authenticateToken, (req, res) => {
  db.all("SELECT * FROM triage_results ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Delete triage result (Mark as processed)
app.delete('/api/triage/:id', authenticateToken, (req, res) => {
  const triageId = req.params.id;
  if (!triageId) return res.status(400).json({ error: 'ID inválido' });
  db.run("DELETE FROM triage_results WHERE id = ?", [triageId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get settings
app.get('/api/settings', authenticateToken, (req, res) => {
  db.all("SELECT * FROM settings", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    });
    res.json(settings);
  });
});

// Update settings
app.post('/api/settings', authenticateToken, (req, res) => {
  const settings = req.body;
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  
  db.serialize(() => {
    Object.keys(settings).forEach(key => {
      stmt.run(key, JSON.stringify(settings[key]));
    });
    stmt.finalize();
    res.json({ success: true });
  });
});

// Update stylist
app.put('/api/stylists/:id', authenticateToken, (req, res) => {
  const { name, specialization, rating, availability, next_available } = req.body;
  db.run(`UPDATE stylists SET 
    name = ?, 
    specialization = ?, 
    rating = ?, 
    availability = ?, 
    next_available = ? 
    WHERE id = ?`, 
    [name, specialization, rating, availability, next_available, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Salon Backend running at http://localhost:${port}`);
});

// Global error handler - must be LAST
app.use((err, req, res, next) => {
  console.error('ERROR:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

