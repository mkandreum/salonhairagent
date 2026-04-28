const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('ADVERTENCIA: JWT_SECRET no está definido. Usando uno generado automáticamente.');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function waitForDB(retries = 20, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      client.release();
      console.log('PostgreSQL conectado correctamente.');
      return;
    } catch (err) {
      console.log(`Esperando a PostgreSQL... intento ${i + 1}/${retries}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  console.error('ERROR: No se pudo conectar a PostgreSQL.');
  process.exit(1);
}

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        notes TEXT,
        total_spent REAL DEFAULT 0,
        total_visits INTEGER DEFAULT 0,
        last_visit TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS stylists (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        specialization TEXT,
        rating REAL DEFAULT 5.0,
        availability TEXT DEFAULT 'available',
        next_available TEXT DEFAULT 'Ahora'
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        stylist_id INTEGER REFERENCES stylists(id),
        service TEXT NOT NULL,
        time TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        price REAL DEFAULT 30.0
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read INTEGER DEFAULT 0
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS triage_results (
        id TEXT PRIMARY KEY,
        subject TEXT,
        body TEXT,
        category TEXT,
        priority TEXT,
        suggested_action TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
    console.log('Tablas de base de datos inicializadas.');
  } finally {
    client.release();
  }
}

const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const loginAttempts = new Map();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!allowedOrigins || !origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o.trim()))) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// ============================================================
// Servir frontend estático - igual que VoltBodyPowered
// ============================================================
const staticPath = path.join(__dirname, 'public');
console.log(`Static files path: ${staticPath}`);
console.log(`Static path exists: ${fs.existsSync(staticPath)}`);
if (fs.existsSync(staticPath)) {
  const files = fs.readdirSync(staticPath);
  console.log(`Files in public: ${files.join(', ')}`);
}
app.use(express.static(staticPath));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso denegado.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sesión expirada o token inválido.' });
    req.user = user;
    next();
  });
};

const checkRateLimit = (email) => {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || [];
  const recentAttempts = attempts.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (recentAttempts.length >= RATE_LIMIT_MAX) return false;
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

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'salon-backend' }));

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, c.name as client_name, s.name as stylist_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN stylists s ON a.stylist_id = s.id
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clients');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/stylists', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM stylists');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const now = new Date();
    const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const firstLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    const [todayApps, yesterdayApps, totalClients, thisMonthClients, lastMonthClients,
           revenue, lastMonthRevenue, stylistCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM appointments WHERE date = $1', [today]),
      pool.query('SELECT COUNT(*) as count FROM appointments WHERE date = $1', [yesterdayStr]),
      pool.query('SELECT COUNT(*) as count FROM clients'),
      pool.query('SELECT COUNT(*) as count FROM clients WHERE created_at >= $1', [firstThisMonth]),
      pool.query('SELECT COUNT(*) as count FROM clients WHERE created_at >= $1 AND created_at < $2', [firstLastMonth, firstThisMonth]),
      pool.query('SELECT COALESCE(SUM(price), 0) as total FROM appointments WHERE date >= $1', [firstThisMonth]),
      pool.query('SELECT COALESCE(SUM(price), 0) as total FROM appointments WHERE date >= $1 AND date <= $2', [firstLastMonth, lastLastMonth]),
      pool.query("SELECT COUNT(*) as count FROM stylists WHERE availability != 'off'"),
    ]);

    const todayCount = parseInt(todayApps.rows[0].count) || 0;
    const yesterdayCount = parseInt(yesterdayApps.rows[0].count) || 0;
    const appChange = todayCount - yesterdayCount;
    const totalClientsCount = parseInt(totalClients.rows[0].count) || 0;
    const thisMonthClientsCount = parseInt(thisMonthClients.rows[0].count) || 0;
    const lastMonthClientsCount = parseInt(lastMonthClients.rows[0].count) || 0;
    const clientChange = lastMonthClientsCount > 0
      ? Math.round(((thisMonthClientsCount - lastMonthClientsCount) / lastMonthClientsCount) * 100)
      : (thisMonthClientsCount > 0 ? 100 : 0);
    const thisMonthRevenue = parseFloat(revenue.rows[0].total) || 0;
    const prevMonthRevenue = parseFloat(lastMonthRevenue.rows[0].total) || 0;
    const revenueChange = prevMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : (thisMonthRevenue > 0 ? 100 : 0);
    const activeStylists = parseInt(stylistCount.rows[0].count) || 1;
    const occupationRate = Math.min(100, Math.round((todayCount / (activeStylists * 8)) * 100));

    res.json([
      { title: 'Citas Hoy', value: todayCount.toString(), change: (appChange >= 0 ? '+' : '') + appChange, trend: appChange >= 0 ? 'up' : 'down', color: 'from-indigo-500 to-purple-500' },
      { title: 'Clientes Activos', value: totalClientsCount.toString(), change: (clientChange >= 0 ? '+' : '') + clientChange + '%', trend: clientChange >= 0 ? 'up' : 'down', color: 'from-emerald-500 to-teal-500' },
      { title: 'Ingresos del Mes', value: `€${Math.round(thisMonthRevenue).toLocaleString()}`, change: (revenueChange >= 0 ? '+' : '') + revenueChange + '%', trend: revenueChange >= 0 ? 'up' : 'down', color: 'from-blue-500 to-cyan-500' },
      { title: 'Tasa de Ocupación', value: `${occupationRate}%`, change: occupationRate > 70 ? '+5%' : '-2%', trend: occupationRate > 70 ? 'up' : 'down', color: 'from-orange-500 to-pink-500' },
    ]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Faltan datos obligatorios' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Email inválido' });
  if (password.length < 6) return res.status(400).json({ error: 'Password debe tener al menos 6 caracteres' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );
    res.json({ success: true, userId: rows[0].id });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: 'Error al procesar el registro' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y password son requeridos' });
  if (!checkRateLimit(email)) return res.status(429).json({ error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' });
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM notifications ORDER BY time DESC LIMIT 50');
    res.json(rows.map(r => ({ ...r, read: !!r.read })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  const notifId = parseInt(req.params.id);
  if (isNaN(notifId)) return res.status(400).json({ error: 'ID inválido' });
  try {
    await pool.query('UPDATE notifications SET read = 1 WHERE id = $1', [notifId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  const notifId = parseInt(req.params.id);
  if (isNaN(notifId)) return res.status(400).json({ error: 'ID inválido' });
  try {
    await pool.query('DELETE FROM notifications WHERE id = $1', [notifId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const range = req.query.range || '30d';
    let startDate;
    const now = new Date();
    if (range === '7d') startDate = new Date(now - 7 * 24 * 3600 * 1000);
    else if (range === '30d') startDate = new Date(now - 30 * 24 * 3600 * 1000);
    else if (range === '3m') startDate = new Date(now - 90 * 24 * 3600 * 1000);
    else if (range === '1y') startDate = new Date(now - 365 * 24 * 3600 * 1000);
    else startDate = new Date(now - 30 * 24 * 3600 * 1000);
    const startStr = startDate.toISOString().split('T')[0];

    const useDaily = range === '7d' || range === '30d';
    const groupQuery = useDaily
      ? `SELECT date as month, SUM(price) as revenue, COUNT(*) as appointments FROM appointments WHERE date >= $1 GROUP BY date ORDER BY date`
      : `SELECT TO_CHAR(TO_DATE(date,'YYYY-MM-DD'),'Mon') as month, TO_CHAR(TO_DATE(date,'YYYY-MM-DD'),'MM') as month_num, SUM(price) as revenue, COUNT(*) as appointments FROM appointments WHERE date >= $1 GROUP BY 1,2 ORDER BY 2`;

    const [revenueResult, serviceResult, totalRev, totalAppts, prevRev, prevAppts] = await Promise.all([
      pool.query(groupQuery, [startStr]),
      pool.query('SELECT service as name, COUNT(*) as count FROM appointments WHERE date >= $1 GROUP BY service', [startStr]),
      pool.query('SELECT COALESCE(SUM(price),0) as total FROM appointments WHERE date >= $1', [startStr]),
      pool.query('SELECT COUNT(*) as count FROM appointments WHERE date >= $1', [startStr]),
      pool.query('SELECT COALESCE(SUM(price),0) as total FROM appointments WHERE date < $1 AND date >= $2',
        [startStr, new Date(startDate - (now - startDate)).toISOString().split('T')[0]]),
      pool.query('SELECT COUNT(*) as count FROM appointments WHERE date < $1 AND date >= $2',
        [startStr, new Date(startDate - (now - startDate)).toISOString().split('T')[0]]),
    ]);

    const colors = ['#6366f1','#ec4899','#10b981','#f59e0b','#8b5cf6'];
    const total = parseInt(totalAppts.rows[0].count) || 1;
    const serviceData = serviceResult.rows.map((s, i) => ({
      name: s.name, value: Math.round((parseInt(s.count)/total)*100), color: colors[i%colors.length]
    }));
    const thisRevenue = parseFloat(totalRev.rows[0].total) || 0;
    const prevRevenue = parseFloat(prevRev.rows[0].total) || 0;
    const revenueChangePct = prevRevenue > 0 ? Math.round(((thisRevenue-prevRevenue)/prevRevenue)*100) : (thisRevenue > 0 ? 100 : 0);
    const thisAppts = parseInt(totalAppts.rows[0].count) || 0;
    const prevApptsCount = parseInt(prevAppts.rows[0].count) || 0;
    const apptsChangePct = prevApptsCount > 0 ? Math.round(((thisAppts-prevApptsCount)/prevApptsCount)*100) : (thisAppts > 0 ? 100 : 0);
    const revenueData = revenueResult.rows.map(r => ({ month: r.month, revenue: parseFloat(r.revenue)||0, appointments: parseInt(r.appointments)||0 }));

    res.json({
      revenueData: revenueData.length > 0 ? revenueData : [{month:'Sin datos',revenue:0,appointments:0}],
      serviceData: serviceData.length > 0 ? serviceData : [{name:'Sin datos',value:100,color:'#94a3b8'}],
      totalRevenue: thisRevenue, totalAppointments: thisAppts, revenueChangePct, apptsChangePct,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/triage', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM triage_results ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/triage', authenticateToken, async (req, res) => {
  const { id, subject, body, category, priority, suggested_action } = req.body;
  if (!id || !subject || !category || !priority) return res.status(400).json({ error: 'Faltan campos requeridos' });
  try {
    await pool.query(
      'INSERT INTO triage_results (id,subject,body,category,priority,suggested_action) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET subject=$2,body=$3,category=$4,priority=$5,suggested_action=$6',
      [id, subject, body, category, priority, suggested_action]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/triage/:id', authenticateToken, async (req, res) => {
  if (!req.params.id) return res.status(400).json({ error: 'ID inválido' });
  try {
    await pool.query('DELETE FROM triage_results WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { client_id, stylist_id, service, time, date, price } = req.body;
  if (!client_id || !stylist_id || !service || !time || !date) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const appointmentPrice = parseFloat(price) || 30.0;
  try {
    const { rows } = await pool.query(
      'INSERT INTO appointments (client_id,stylist_id,service,time,date,price) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [client_id, stylist_id, service, time, date, appointmentPrice]
    );
    await pool.query('INSERT INTO notifications (type,title,message) VALUES ($1,$2,$3)',
      ['success','Nueva Cita',`Nueva cita para ${service} creada.`]);
    res.json({ success: true, appointmentId: rows[0].id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/appointments/:id/status', authenticateToken, async (req, res) => {
  const appId = parseInt(req.params.id);
  if (isNaN(appId)) return res.status(400).json({ error: 'ID inválido' });
  const { status } = req.body;
  if (!['pending','confirmed','cancelled'].includes(status)) return res.status(400).json({ error: 'Estado inválido' });
  try {
    await pool.query('UPDATE appointments SET status=$1 WHERE id=$2', [status, appId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  const appId = parseInt(req.params.id);
  if (isNaN(appId)) return res.status(400).json({ error: 'ID inválido' });
  const { client_id, stylist_id, service, time, date, status } = req.body;
  if (!client_id || !stylist_id || !service || !time || !date) return res.status(400).json({ error: 'Faltan campos requeridos' });
  try {
    await pool.query(
      'UPDATE appointments SET client_id=$1,stylist_id=$2,service=$3,time=$4,date=$5,status=$6 WHERE id=$7',
      [client_id, stylist_id, service, time, date, status||'pending', appId]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  const appId = parseInt(req.params.id);
  if (isNaN(appId)) return res.status(400).json({ error: 'ID inválido' });
  try {
    await pool.query('DELETE FROM appointments WHERE id=$1', [appId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/clients', authenticateToken, async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    const { rows } = await pool.query('INSERT INTO clients (name,email,phone) VALUES ($1,$2,$3) RETURNING id', [name,email,phone]);
    res.json({ success: true, clientId: rows[0].id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  const clientId = parseInt(req.params.id);
  if (isNaN(clientId)) return res.status(400).json({ error: 'ID inválido' });
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nombre y email son requeridos' });
  try {
    await pool.query('UPDATE clients SET name=$1,email=$2,phone=$3 WHERE id=$4', [name,email,phone,clientId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  const clientId = parseInt(req.params.id);
  if (isNaN(clientId)) return res.status(400).json({ error: 'ID inválido' });
  try {
    await pool.query('DELETE FROM clients WHERE id=$1', [clientId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/stylists', authenticateToken, async (req, res) => {
  const { name, specialization, rating, availability, next_available } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO stylists (name,specialization,rating,availability,next_available) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [name, specialization, parseFloat(rating)||5.0, availability||'available', next_available||'Ahora']
    );
    res.json({ success: true, stylistId: rows[0].id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/stylists/:id', authenticateToken, async (req, res) => {
  const { name, specialization, rating, availability, next_available } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    await pool.query(
      'UPDATE stylists SET name=$1,specialization=$2,rating=$3,availability=$4,next_available=$5 WHERE id=$6',
      [name,specialization,rating,availability,next_available,req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/stylists/:id', authenticateToken, async (req, res) => {
  const stylistId = parseInt(req.params.id);
  if (isNaN(stylistId)) return res.status(400).json({ error: 'ID inválido' });
  try {
    await pool.query('DELETE FROM stylists WHERE id=$1', [stylistId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const SENSITIVE_KEYS = ['openai_key','gemini_key','twilio_sid','twilio_token','smtp_password','whatsapp_token'];

app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(row => {
      try { settings[row.key] = JSON.parse(row.value); } catch { settings[row.key] = row.value; }
      if (SENSITIVE_KEYS.includes(row.key) && settings[row.key] && settings[row.key].length > 4) {
        settings[row.key] = '••••••••' + settings[row.key].slice(-4);
      }
    });
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
  const settings = req.body;
  try {
    for (const [key, value] of Object.entries(settings)) {
      if (SENSITIVE_KEYS.includes(key) && typeof value === 'string' && value.startsWith('••••')) continue;
      await pool.query(
        'INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2',
        [key, JSON.stringify(value)]
      );
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SPA fallback - igual que VoltBodyPowered: todas las rutas que no sean /api ni assets
// devuelven index.html para que React Router funcione
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return res.status(404).json({ error: 'Not found' });
  }
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend no encontrado. Verifica el build.');
  }
});

app.use((err, req, res, next) => {
  console.error('ERROR:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

waitForDB().then(() => initDB()).then(() => {
  app.listen(port, '0.0.0.0', () => console.log(`Salon Backend + Frontend en http://0.0.0.0:${port}`));
}).catch(err => {
  console.error('Error fatal al iniciar:', err.message);
  process.exit(1);
});
