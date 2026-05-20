const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('ADVERTENCIA: JWT_SECRET no está definido.');
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

// Google OAuth Configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const APP_URL = process.env.APP_URL || `http://localhost:${port}`;
const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const calendar = google.calendar({ version: "v3", auth: oauth2Client });
const gmail = google.gmail({ version: "v1", auth: oauth2Client });

oauth2Client.on('tokens', (newTokens) => {
  const current = (async () => {
    try {
      const { rows } = await pool.query("SELECT tokens FROM admin_auth WHERE id = 1");
      return rows[0] ? JSON.parse(rows[0].tokens) : null;
    } catch { return null; }
  })();
  if (current) {
    pool.query("UPDATE admin_auth SET tokens = ? WHERE id = 1")
      .then(() => pool.query("UPDATE admin_auth SET tokens = ? WHERE id = 1", [JSON.stringify({ ...current, ...newTokens })]))
      .catch(console.error);
  }
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE,
      phone TEXT, notes TEXT, total_spent REAL DEFAULT 0,
      total_visits INTEGER DEFAULT 0, last_visit TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS stylists (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, specialization TEXT,
      rating REAL DEFAULT 5.0, availability TEXT DEFAULT 'available',
      next_available TEXT DEFAULT 'Ahora'
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY, client_id INTEGER REFERENCES clients(id),
      stylist_id INTEGER REFERENCES stylists(id), service TEXT NOT NULL,
      time TEXT NOT NULL, date TEXT NOT NULL, status TEXT DEFAULT 'pending',
      price REAL DEFAULT 30.0, notes TEXT
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL,
      message TEXT NOT NULL, time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, read INTEGER DEFAULT 0
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS triage_results (
      id TEXT PRIMARY KEY, subject TEXT, body TEXT, category TEXT,
      priority TEXT, suggested_action TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY, value TEXT
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS whatsapp_sessions (
      phone TEXT PRIMARY KEY, step TEXT DEFAULT 'menu',
      data JSONB DEFAULT '{}', updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS admin_auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      tokens TEXT
    )`);
    try {
      await client.query(`ALTER TABLE appointments ADD COLUMN event_id TEXT`);
    } catch (e) { /* column may already exist */ }
    console.log('Tablas de base de datos inicializadas.');
  } finally {
    client.release();
  }
}

// ── helpers ──────────────────────────────────────────────────
async function getSetting(key) {
  try {
    const { rows } = await pool.query('SELECT value FROM settings WHERE key=$1', [key]);
    if (!rows.length) return null;
    try { return JSON.parse(rows[0].value); } catch { return rows[0].value; }
  } catch { return null; }
}

// Google OAuth helpers
async function getAdminTokens() {
  try {
    const { rows } = await pool.query("SELECT tokens FROM admin_auth WHERE id = 1");
    return rows[0] ? JSON.parse(rows[0].tokens) : null;
  } catch { return null; }
}

async function getAdminEmail() {
  const data = await getAdminTokens();
  return data?.adminEmail || null;
}

// Email Template
const getHtmlTemplate = (title, content, clientName, dateStr, appointmentId, service) => {
  const manageUrl = appointmentId ? `${APP_URL}/?manage=${appointmentId}` : APP_URL;
  const salonName = 'Salon Hair';
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D1117;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161B22;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#1C2128;padding:30px 40px;border-bottom:1px solid rgba(255,255,255,0.1);">
            <p style="margin:0;font-size:24px;color:#F0F6FC;letter-spacing:0.5px;">${salonName}</p>
            <p style="margin:4px 0 0;font-size:10px;color:#8B949E;letter-spacing:2px;text-transform:uppercase;">Beauty Studio</p>
          </td>
        </tr>
        <tr>
          <td style="padding:35px 40px;">
            <h1 style="margin:0 0 20px;font-size:24px;color:#F0F6FC;font-weight:600;">${title}</h1>
            <p style="margin:0 0 20px;font-size:15px;color:#8B949E;line-height:1.6;">Hola <strong style="color:#F0F6FC;">${clientName}</strong>,</p>
            <div style="font-size:15px;color:#8B949E;line-height:1.7;">${content}</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#21262D;border:1px solid rgba(255,255,255,0.1);border-radius:12px;margin:25px 0;">
              <tr>
                <td style="padding:20px 25px;">
                  <table width="100%" cellpadding="6" cellspacing="0">
                    <tr>
                      <td style="font-size:10px;color:#8B949E;text-transform:uppercase;letter-spacing:1px;font-weight:600;width:100px;">Fecha</td>
                      <td style="font-size:14px;color:#F0F6FC;font-weight:500;">${dateStr}</td>
                    </tr>
                    <tr>
                      <td style="font-size:10px;color:#8B949E;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Servicio</td>
                      <td style="font-size:14px;color:#F0F6FC;font-weight:500;">${service || 'Servicio de belleza'}</td>
                    </tr>
                    <tr>
                      <td style="font-size:10px;color:#8B949E;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Ubicación</td>
                      <td style="font-size:14px;color:#F0F6FC;font-weight:500;">Salon Hair</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            ${appointmentId ? `<a href="${manageUrl}" style="display:inline-block;background:#238636;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-top:10px;">Gestionar mi Cita</a>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);background:#0D1117;text-align:center;">
            <p style="margin:0;font-size:11px;color:#484F58;">© 2026 ${salonName}. Todos los derechos reservados.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

// Send Email Function
const sendEmail = async (to, subject, html) => {
  const tokens = await getAdminTokens();
  if (!tokens || !CLIENT_ID) return;
  
  oauth2Client.setCredentials(tokens);
  const fromEmail = await getAdminEmail() || "me";
  
  const encodedSubject = Buffer.from(subject, 'utf-8').toString('base64');
  
  const message = [
    `To: ${to}`,
    `From: "Salon Hair" <${fromEmail}>`,
    `Subject: =?utf-8?B?${encodedSubject}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    html
  ].join('\r\n');

  const encodedMessage = Buffer.from(message, "utf-8").toString("base64url");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage }
  });
};

async function sendWhatsAppMessage(to, body, token, phoneNumberId) {
  const payload = JSON.stringify({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body }
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'graph.facebook.com',
      path: `/v19.0/${phoneNumberId}/messages`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': Buffer.byteLength(payload) }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function getOrCreateSession(phone) {
  const { rows } = await pool.query('SELECT * FROM whatsapp_sessions WHERE phone=$1', [phone]);
  if (rows.length) return rows[0];
  await pool.query('INSERT INTO whatsapp_sessions (phone, step, data) VALUES ($1,$2,$3)', [phone, 'menu', '{}']);
  return { phone, step: 'menu', data: {} };
}

async function setSession(phone, step, data = {}) {
  await pool.query(
    'INSERT INTO whatsapp_sessions (phone,step,data,updated_at) VALUES ($1,$2,$3,NOW()) ON CONFLICT (phone) DO UPDATE SET step=$2, data=$3, updated_at=NOW()',
    [phone, step, JSON.stringify(data)]
  );
}

async function processWhatsAppMessage(from, text, token, phoneNumberId) {
  const msg = text.trim();
  const session = await getOrCreateSession(from);
  const data = typeof session.data === 'string' ? JSON.parse(session.data) : session.data || {};

  // Buscar cliente por teléfono
  const { rows: clients } = await pool.query(
    "SELECT * FROM clients WHERE phone=$1 OR phone=$2 OR phone=$3",
    [from, from.replace('+', ''), '+' + from.replace('+', '')]
  );
  const client = clients[0] || null;
  const salonName = (await getSetting('salon_name')) || 'el salón';

  // ── NUEVO CLIENTE: pedir nombre ──────────────────────────
  if (!client && session.step === 'menu') {
    await setSession(from, 'register_name', {});
    return `¡Hola! 👋 Soy el asistente de *${salonName}*.

No encuentro tu número en nuestra base de datos. ¿Cómo te llamas para registrarte?`;
  }

  if (session.step === 'register_name') {
    await setSession(from, 'register_done', { tempName: msg });
    // Crear cliente
    await pool.query('INSERT INTO clients (name, phone) VALUES ($1, $2) ON CONFLICT DO NOTHING', [msg, from]);
    await pool.query('INSERT INTO notifications (type,title,message) VALUES ($1,$2,$3)',
      ['info', 'Nuevo cliente por WhatsApp', `${msg} (${from}) se registró desde WhatsApp`]);
    await setSession(from, 'menu', {});
    return `¡Perfecto, ${msg}! 🎉 Te he registrado en *${salonName}*.

¿Qué deseas hacer?

1️⃣ Reservar cita
2️⃣ Ver mis citas
3️⃣ Cancelar cita

_Responde con el número de la opción_`;
  }

  // ── CLIENTE CONOCIDO: menú principal ────────────────────
  const greeting = `¡Hola, *${client?.name || 'amigo/a'}*! 💇‍♀️`;

  if (session.step === 'menu' || msg === '0' || msg.toLowerCase().includes('menu') || msg.toLowerCase().includes('menú') || msg.toLowerCase().includes('hola') || msg.toLowerCase().includes('inicio')) {
    await setSession(from, 'menu', {});
    return `${greeting}

Bienvenido/a a *${salonName}*. ¿Qué deseas hacer?

1️⃣ Reservar cita
2️⃣ Ver mis próximas citas
3️⃣ Cancelar una cita

_Responde con el número de la opción_`;
  }

  // ── OPCIÓN 1: RESERVAR ──────────────────────────────────
  if (session.step === 'menu' && msg === '1') {
    const { rows: stylists } = await pool.query("SELECT * FROM stylists WHERE availability != 'off'");
    if (!stylists.length) {
      return 'Lo sentimos, no hay estilistas disponibles ahora mismo. Por favor llama al salón. 📞';
    }
    const list = stylists.map((s, i) => `${i + 1}️⃣ ${s.name}${s.specialization ? ' — ' + s.specialization : ''}`).join('\n');
    await setSession(from, 'book_stylist', { stylists: stylists.map(s => ({ id: s.id, name: s.name })) });
    return `Perfecto! Elige tu estilista:\n\n${list}\n\n_Responde con el número_`;
  }

  if (session.step === 'book_stylist') {
    const idx = parseInt(msg) - 1;
    if (isNaN(idx) || idx < 0 || idx >= (data.stylists?.length || 0)) {
      return 'Por favor responde con el número del estilista. 🔢';
    }
    const chosen = data.stylists[idx];
    await setSession(from, 'book_service', { stylist: chosen });
    return `Genial, *${chosen.name}* estará encantado/a de atenderte. 💅

¿Qué servicio deseas?

1️⃣ Corte
2️⃣ Tinte
3️⃣ Peinado
4️⃣ Tratamiento
5️⃣ Manicura
6️⃣ Otro (escribe el servicio)`;
  }

  if (session.step === 'book_service') {
    const services = ['Corte', 'Tinte', 'Peinado', 'Tratamiento', 'Manicura'];
    const num = parseInt(msg);
    const service = (!isNaN(num) && num >= 1 && num <= 5) ? services[num - 1] : msg;
    await setSession(from, 'book_date', { ...data, service });
    const today = new Date();
    const dates = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0) dates.push({ label: d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }), value: d.toISOString().split('T')[0] });
    }
    const dList = dates.map((d, i) => `${i + 1}️⃣ ${d.label}`).join('\n');
    await setSession(from, 'book_date', { ...data, service, dates });
    return `*${service}* anotado. ¿Qué día prefieres?\n\n${dList}\n\n_Responde con el número_`;
  }

  if (session.step === 'book_date') {
    const idx = parseInt(msg) - 1;
    if (isNaN(idx) || idx < 0 || idx >= (data.dates?.length || 0)) {
      return 'Por favor responde con el número del día. 🔢';
    }
    const chosenDate = data.dates[idx];
    await setSession(from, 'book_time', { ...data, date: chosenDate });
    return `Perfecto, *${chosenDate.label}*. ¿A qué hora? ⏰

1️⃣ 09:00
2️⃣ 10:00
3️⃣ 11:00
4️⃣ 12:00
5️⃣ 16:00
6️⃣ 17:00
7️⃣ 18:00
8️⃣ 19:00

_Responde con el número o escribe la hora (ej: 15:30)_`;
  }

  if (session.step === 'book_time') {
    const times = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00'];
    const num = parseInt(msg);
    const time = (!isNaN(num) && num >= 1 && num <= 8) ? times[num - 1] : msg;
    
    const clientRow = (await pool.query('SELECT id, name, email, phone FROM clients WHERE phone=$1 OR phone=$2 OR phone=$3',
      [from, from.replace('+', ''), '+' + from.replace('+', '')]));
    const clientData = clientRow.rows[0];
    
    let eventId = null;
    const tokens = await getAdminTokens();
    
    if (clientData && data.stylist?.id && data.date?.value) {
      if (tokens && CLIENT_ID) {
        try {
          oauth2Client.setCredentials(tokens);
          const startDateTime = `${data.date.value}T${time}:00`;
          const [h, m] = time.split(':');
          const endDate = new Date(data.date.value);
          endDate.setHours(parseInt(h) + 1, parseInt(m), 0, 0);
          const endDateTime = endDate.toISOString().split('T')[0] + 'T' + endDate.toTimeString().slice(0, 5) + ':00';
          
          const { rows: stylistData } = await pool.query('SELECT * FROM stylists WHERE id=$1', [data.stylist.id]);
          const stylist = stylistData[0];
          
          const event = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
              summary: `${data.service} - ${clientData.name}`,
              description: `Cliente: ${clientData.name}\nEmail: ${clientData.email || 'N/A'}\nTeléfono: ${clientData.phone}\nEstilista: ${stylist?.name || 'N/A'}`,
              start: { dateTime: startDateTime, timeZone: 'Europe/Madrid' },
              end: { dateTime: endDateTime, timeZone: 'Europe/Madrid' },
              attendees: clientData.email ? [{ email: clientData.email }] : []
            }
          });
          eventId = event.data.id;
        } catch (err) { console.error('Calendar error:', err.message); }
      }
      
      await pool.query(
        'INSERT INTO appointments (client_id, stylist_id, service, time, date, status, price, event_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [clientData.id, data.stylist.id, data.service, time, data.date.value, 'confirmed', 30, eventId]
      );
      await pool.query('INSERT INTO notifications (type,title,message) VALUES ($1,$2,$3)',
        ['success', 'Nueva cita WhatsApp', `${clientData.name || from} reservó ${data.service} el ${data.date.label} a las ${time}`]);
      
      if (tokens && clientData.email) {
        const dateStr = new Date(`${data.date.value}T${time}`).toLocaleString('es-ES', { 
          weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
        });
        
        const clientHtml = getHtmlTemplate(
          'Cita Confirmada', 
          '<p>Tu cita en Salon Hair ha sido reservada con éxito. ¡Estamos deseando recibirte!</p>',
          clientData.name,
          dateStr,
          null,
          data.service
        );
        sendEmail(clientData.email, 'Confirmación de Reserva - Salon Hair', clientHtml).catch(e => console.error('Email error:', e));

        const adminEmail = await getAdminEmail();
        if (adminEmail) {
          const adminHtml = getHtmlTemplate(
            'Nueva Reserva',
            `<p>Has recibido una nueva reserva de <span style="color: #F0F6FC;">${clientData.name}</span>.</p>
             <p>Email: ${clientData.email || 'No registrado'}<br>Tel: ${clientData.phone}<br>Servicio: ${data.service}<br>Estilista: ${data.stylist?.name || 'N/A'}</p>`,
            'Salon Hair',
            dateStr,
            null,
            data.service
          );
          sendEmail(adminEmail, `Nueva Cita: ${clientData.name}`, adminHtml).catch(e => console.error('Admin email error:', e));
        }
      }
    }
    await setSession(from, 'menu', {});
    return `✅ *¡Cita confirmada!*

📅 ${data.date?.label}
⏰ ${time}
💇 ${data.service} con ${data.stylist?.name}
📍 ${salonName}

Te esperamos. Si necesitas cancelar escríbenos con antelación. ¡Hasta pronto! 👋`;
  }

  // ── OPCIÓN 2: VER CITAS ─────────────────────────────────
  if (session.step === 'menu' && msg === '2') {
    const clientRow = (await pool.query('SELECT id FROM clients WHERE phone=$1 OR phone=$2 OR phone=$3',
      [from, from.replace('+', ''), '+' + from.replace('+', '')])).rows[0];
    if (!clientRow) return 'No encontramos tu perfil. Escribe *hola* para registrarte.';
    const today = new Date().toISOString().split('T')[0];
    const { rows: apps } = await pool.query(
      `SELECT a.*, s.name as stylist_name FROM appointments a JOIN stylists s ON a.stylist_id=s.id WHERE a.client_id=$1 AND a.date >= $2 AND a.status != 'cancelled' ORDER BY a.date, a.time LIMIT 5`,
      [clientRow.id, today]
    );
    if (!apps.length) {
      await setSession(from, 'menu', {});
      return `No tienes citas próximas, ${client?.name}. 📭

Escribe *1* para reservar una. ✂️`;
    }
    const list = apps.map((a, i) => `${i + 1}. ${a.service} con ${a.stylist_name} — ${a.date} a las ${a.time}`).join('\n');
    await setSession(from, 'menu', {});
    return `📅 *Tus próximas citas:*

${list}

Escribe *0* para volver al menú.`;
  }

  // ── OPCIÓN 3: CANCELAR ──────────────────────────────────
  if (session.step === 'menu' && msg === '3') {
    const clientRow = (await pool.query('SELECT id FROM clients WHERE phone=$1 OR phone=$2 OR phone=$3',
      [from, from.replace('+', ''), '+' + from.replace('+', '')])).rows[0];
    if (!clientRow) return 'No encontramos tu perfil. Escribe *hola* para registrarte.';
    const today = new Date().toISOString().split('T')[0];
    const { rows: apps } = await pool.query(
      `SELECT a.*, s.name as stylist_name FROM appointments a JOIN stylists s ON a.stylist_id=s.id WHERE a.client_id=$1 AND a.date >= $2 AND a.status != 'cancelled' ORDER BY a.date, a.time LIMIT 5`,
      [clientRow.id, today]
    );
    if (!apps.length) {
      await setSession(from, 'menu', {});
      return `No tienes citas que cancelar. Escribe *0* para volver al menú.`;
    }
    const list = apps.map((a, i) => `${i + 1}️⃣ ${a.service} — ${a.date} ${a.time} con ${a.stylist_name}`).join('\n');
    await setSession(from, 'cancel_pick', { apps: apps.map(a => ({ id: a.id, service: a.service, date: a.date, time: a.time })) });
    return `¿Cuál cita deseas cancelar?\n\n${list}\n\n_Responde con el número_`;
  }

  if (session.step === 'cancel_pick') {
    const idx = parseInt(msg) - 1;
    if (isNaN(idx) || idx < 0 || idx >= (data.apps?.length || 0)) {
      return 'Por favor responde con el número de la cita. 🔢';
    }
    const app = data.apps[idx];
    
    const { rows: appData } = await pool.query(
      `SELECT a.*, c.name as client_name, c.email as client_email FROM appointments a JOIN clients c ON a.client_id=c.id WHERE a.id=$1`,
      [app.id]
    );
    const appointment = appData[0];
    
    const tokens = await getAdminTokens();
    
    if (tokens && appointment?.event_id) {
      try {
        oauth2Client.setCredentials(tokens);
        await calendar.events.delete({ calendarId: 'primary', eventId: appointment.event_id });
      } catch (err) { console.error('Calendar delete error:', err.message); }
      
      if (appointment?.client_email) {
        const dateStr = new Date(`${appointment.date}T${appointment.time}`).toLocaleString('es-ES', { 
          weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
        });
        const html = getHtmlTemplate(
          'Cita Cancelada',
          '<p>Lamentamos informarte que tu cita ha sido cancelada.</p>',
          appointment.client_name,
          dateStr,
          null,
          appointment.service
        );
        sendEmail(appointment.client_email, 'Cita Cancelada - Salon Hair', html).catch(e => console.error('Cancel email error:', e));
        
        const adminEmail = await getAdminEmail();
        if (adminEmail) {
          const adminHtml = getHtmlTemplate(
            'Cita Cancelada',
            `<p>La cita de <span style="color: #F0F6FC;">${appointment.client_name}</span> ha sido cancelada.</p>
             <p>Fecha: ${dateStr}<br>Servicio: ${appointment.service}</p>`,
            'Salon Hair',
            dateStr,
            null,
            appointment.service
          );
          sendEmail(adminEmail, `Cita Cancelada: ${appointment.client_name}`, adminHtml).catch(e => console.error('Admin cancel email error:', e));
        }
      }
    }
    
    await pool.query("UPDATE appointments SET status='cancelled' WHERE id=$1", [app.id]);
    await pool.query('INSERT INTO notifications (type,title,message) VALUES ($1,$2,$3)',
      ['warning', 'Cita cancelada por WhatsApp', `${client?.name || from} canceló ${app.service} el ${app.date} a las ${app.time}`]);
    await setSession(from, 'menu', {});
    return `✅ Cita de *${app.service}* el ${app.date} a las ${app.time} cancelada correctamente.

Escribe *1* si deseas reservar otra cita. 💇‍♀️`;
  }

  // Fallback
  await setSession(from, 'menu', {});
  return `No entendí eso 😅 Escribe *hola* para ver el menú principal.`;
}

// ── CORS ───────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedOrigins || allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json());

// ── AUTHENTICATION ────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];
    
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Credenciales inválidas' });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
  
  try {
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Este email ya está registrado' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── STATIC ─────────────────────────────────────────────────
const staticPath = path.join(__dirname, 'public');
console.log(`Static files path: ${staticPath}`);
console.log(`Static path exists: ${fs.existsSync(staticPath)}`);
if (fs.existsSync(staticPath)) console.log(`Files in public: ${fs.readdirSync(staticPath).join(', ')}`);
app.use(express.static(staticPath));

// ── AUTH MIDDLEWARE ────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso denegado.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sesión expirada.' });
    req.user = user;
    next();
  });
};

const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const loginAttempts = new Map();
const checkRateLimit = (email) => {
  const now = Date.now();
  const attempts = (loginAttempts.get(email) || []).filter(t => now - t < RATE_LIMIT_WINDOW);
  if (attempts.length >= RATE_LIMIT_MAX) return false;
  attempts.push(now);
  loginAttempts.set(email, attempts);
  return true;
};

// ── AUTH GOOGLE OAUTH ──────────────────────────────────────
app.get('/api/auth/google', (req, res) => {
  if (!CLIENT_ID) {
    return res.status(500).send('Falta GOOGLE_CLIENT_ID en variables de entorno.');
  }
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  });
  res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  if (code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
      oauth2Client.setCredentials(tokens);
      const userInfo = await oauth2.userinfo.get();
      const userEmail = userInfo.data.email;
      
      const authorizedEmail = process.env.ADMIN_EMAIL;
      
      if (!authorizedEmail || userEmail !== authorizedEmail) {
        return res.status(403).send('No autorizado. Este email no tiene acceso.');
      }

      await pool.query(
        'INSERT INTO admin_auth (id, tokens) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET tokens = $1',
        [JSON.stringify({ ...tokens, adminEmail: userEmail })]
      );
      
      res.redirect('/?admin=true');
    } catch (e) {
      res.status(500).send('Error en la autenticación: ' + String(e));
    }
  } else {
    res.redirect('/');
  }
});

app.get('/api/config', async (req, res) => {
  res.json({ 
    hasCredentials: !!(CLIENT_ID && CLIENT_SECRET),
    isGoogleConnected: !!(await getAdminTokens())
  });
});

// ── WHATSAPP WEBHOOK ───────────────────────────────────────
app.get('/api/webhook/whatsapp', async (req, res) => {
  const verifyToken = (await getSetting('whatsapp_verify_token')) || process.env.WA_VERIFY_TOKEN || 'salon_verify_123';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verificado ✅');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post('/api/webhook/whatsapp', async (req, res) => {
  try {
    res.sendStatus(200); // responder rápido a Meta
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];
    if (!message || message.type !== 'text') return;

    const from = message.from;
    const text = message.text.body;
    const token = await getSetting('whatsapp_token');
    const phoneNumberId = await getSetting('whatsapp_phone_number_id');
    if (!token || !phoneNumberId) {
      console.warn('WhatsApp no configurado: falta token o phone_number_id en Settings');
      return;
    }
    const reply = await processWhatsAppMessage(from, text, token, phoneNumberId);
    await sendWhatsAppMessage(from, reply, token, phoneNumberId);
  } catch (err) {
    console.error('Error en webhook WhatsApp:', err.message);
  }
});

// ── TRIAGE IA ──────────────────────────────────────────────
app.post('/api/triage/analyze', authenticateToken, async (req, res) => {
  const { subject, body } = req.body;
  if (!subject && !body) return res.status(400).json({ error: 'Faltan datos para analizar' });

  const geminiKey = await getSetting('gemini_key');
  const openaiKey = await getSetting('openai_key');

  const prompt = `Eres un asistente de gestión para un salón de peluquería/belleza.
Analiza el siguiente mensaje de un cliente y responde SOLO con un JSON válido sin markdown:
{
  "category": "cita" | "queja" | "consulta" | "cancelacion" | "pago" | "otro",
  "priority": "high" | "medium" | "low",
  "suggested_action": "acción concreta y específica en español (máx 100 chars)",
  "summary": "resumen breve en español (máx 80 chars)"
}

Asunto: ${subject || '(sin asunto)'}
Mensaje: ${body || '(sin cuerpo)'}`;

  try {
    let result = null;

    // Intentar con Gemini primero
    if (geminiKey && !geminiKey.startsWith('••••')) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      const geminiData = await geminiRes.json();
      const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const clean = raw.replace(/```json|```/g, '').trim();
      result = JSON.parse(clean);
    }

    // Fallback a OpenAI
    if (!result && openaiKey && !openaiKey.startsWith('••••')) {
      const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });
      const oaiData = await oaiRes.json();
      const raw = oaiData?.choices?.[0]?.message?.content || '';
      const clean = raw.replace(/```json|```/g, '').trim();
      result = JSON.parse(clean);
    }

    if (!result) return res.status(503).json({ error: 'Configura una API key de Gemini u OpenAI en Ajustes para usar el análisis IA.' });

    // Guardar en BD
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO triage_results (id,subject,body,category,priority,suggested_action) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, subject || result.summary, body, result.category, result.priority, result.suggested_action]
    );
    await pool.query('INSERT INTO notifications (type,title,message) VALUES ($1,$2,$3)',
      ['info', 'Nuevo análisis IA', `Triage: ${result.category} — ${result.priority} priority`]);

    res.json({ success: true, id, ...result });
  } catch (err) {
    console.error('Error triage IA:', err.message);
    res.status(500).json({ error: 'Error al analizar con IA: ' + err.message });
  }
});

// ── HEALTH ─────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'salon-backend' }));

// ── APPOINTMENTS ───────────────────────────────────────────
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT a.*, c.name as client_name, c.email as client_email, c.phone as client_phone, s.name as stylist_name FROM appointments a JOIN clients c ON a.client_id=c.id JOIN stylists s ON a.stylist_id=s.id`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { client_id, stylist_id, service, time, date, price } = req.body;
  if (!client_id || !stylist_id || !service || !time || !date) return res.status(400).json({ error: 'Faltan campos' });
  try {
    let eventId = null;
    const tokens = await getAdminTokens();
    
    const { rows: clientData } = await pool.query('SELECT * FROM clients WHERE id=$1', [client_id]);
    const { rows: stylistData } = await pool.query('SELECT * FROM stylists WHERE id=$1', [stylist_id]);
    
    const client = clientData[0];
    const stylist = stylistData[0];
    
    if (tokens && CLIENT_ID) {
      try {
        oauth2Client.setCredentials(tokens);
        const startDateTime = `${date}T${time}:00`;
        const [hours, minutes] = time.split(':');
        const endDate = new Date(date);
        endDate.setHours(parseInt(hours) + 1, parseInt(minutes), 0, 0);
        const endDateTime = endDate.toISOString().split('T')[0] + 'T' + endDate.toTimeString().slice(0, 5) + ':00';
        
        const event = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: `${service} - ${client?.name || 'Cliente'}`,
            description: `Cliente: ${client?.name || 'N/A'}\nEmail: ${client?.email || 'N/A'}\nTeléfono: ${client?.phone || 'N/A'}\nEstilista: ${stylist?.name || 'N/A'}`,
            start: { dateTime: startDateTime, timeZone: 'Europe/Madrid' },
            end: { dateTime: endDateTime, timeZone: 'Europe/Madrid' },
            attendees: client?.email ? [{ email: client.email }] : []
          }
        });
        eventId = event.data.id;
      } catch (err) { console.error('Calendar Error:', err.message); }
    }
    
    const { rows } = await pool.query(
      'INSERT INTO appointments (client_id,stylist_id,service,time,date,price,event_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [client_id, stylist_id, service, time, date, parseFloat(price) || 30.0, eventId]
    );
    
    await pool.query('INSERT INTO notifications (type,title,message) VALUES ($1,$2,$3)', ['success','Nueva Cita',`Cita para ${service} creada.`]);
    
    if (tokens && client?.email) {
      const dateStr = new Date(`${date}T${time}`).toLocaleString('es-ES', { 
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
      });
      
      const clientHtml = getHtmlTemplate(
        'Cita Confirmada', 
        '<p>Tu cita en Salon Hair ha sido reservada con éxito. ¡Estamos deseando recibirte!</p>',
        client?.name || 'Cliente',
        dateStr,
        rows[0].id,
        service
      );
      sendEmail(client?.email, 'Confirmación de Reserva - Salon Hair', clientHtml).catch(e => console.error('Email error:', e));

      const adminEmail = await getAdminEmail();
      if (adminEmail) {
        const adminHtml = getHtmlTemplate(
          'Nueva Reserva',
          `<p>Has recibido una nueva reserva de <span style="color: #F0F6FC;">${client?.name}</span>.</p>
           <p>Email: ${client?.email}<br>Tel: ${client?.phone || 'No prop.'}<br>Servicio: ${service}<br>Estilista: ${stylist?.name || 'N/A'}</p>`,
          'Salon Hair',
          dateStr,
          rows[0].id,
          service
        );
        sendEmail(adminEmail, `Nueva Cita: ${client?.name}`, adminHtml).catch(e => console.error('Admin email error:', e));
      }
    }
    
    res.json({ success: true, appointmentId: rows[0].id, eventId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/appointments/:id/status', authenticateToken, async (req, res) => {
  const appId = parseInt(req.params.id);
  if (isNaN(appId)) return res.status(400).json({ error: 'ID inválido' });
  const { status } = req.body;
  if (!['pending','confirmed','cancelled'].includes(status)) return res.status(400).json({ error: 'Estado inválido' });
  try {
    const { rows } = await pool.query('SELECT a.*, c.name as client_name, c.email as client_email FROM appointments a JOIN clients c ON a.client_id=c.id WHERE a.id=$1', [appId]);
    const appointment = rows[0];
    
    await pool.query('UPDATE appointments SET status=$1 WHERE id=$2', [status, appId]);
    
    if (status === 'cancelled' && appointment?.event_id) {
      const tokens = await getAdminTokens();
      if (tokens) {
        try {
          oauth2Client.setCredentials(tokens);
          await calendar.events.delete({ calendarId: 'primary', eventId: appointment.event_id });
        } catch (err) { console.error('Calendar delete error:', err.message); }
        
        if (appointment?.client_email) {
          const dateStr = new Date(`${appointment.date}T${appointment.time}`).toLocaleString('es-ES', { 
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
          });
          const html = getHtmlTemplate(
            'Cita Cancelada',
            '<p>Lamentamos informarte que tu cita ha sido cancelada.</p>',
            appointment.client_name,
            dateStr,
            null,
            appointment.service
          );
          sendEmail(appointment.client_email, 'Cita Cancelada - Salon Hair', html).catch(e => console.error('Cancel email error:', e));
        }
      }
    }
    
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  const appId = parseInt(req.params.id);
  if (isNaN(appId)) return res.status(400).json({ error: 'ID inválido' });
  const { client_id, stylist_id, service, time, date, status } = req.body;
  if (!client_id || !stylist_id || !service || !time || !date) return res.status(400).json({ error: 'Faltan campos' });
  try {
    const { rows: current } = await pool.query('SELECT * FROM appointments WHERE id=$1', [appId]);
    const currentAppt = current[0];
    
    const tokens = await getAdminTokens();
    if (tokens && currentAppt?.event_id) {
      try {
        oauth2Client.setCredentials(tokens);
        const startDateTime = `${date}T${time}:00`;
        const [hours, minutes] = time.split(':');
        const endDate = new Date(date);
        endDate.setHours(parseInt(hours) + 1, parseInt(minutes), 0, 0);
        const endDateTime = endDate.toISOString().split('T')[0] + 'T' + endDate.toTimeString().slice(0, 5) + ':00';
        
        await calendar.events.patch({
          calendarId: 'primary',
          eventId: currentAppt.event_id,
          requestBody: {
            start: { dateTime: startDateTime, timeZone: 'Europe/Madrid' },
            end: { dateTime: endDateTime, timeZone: 'Europe/Madrid' }
          }
        });
        
        const { rows: clientData } = await pool.query('SELECT * FROM clients WHERE id=$1', [client_id]);
        const client = clientData[0];
        if (client?.email) {
          const dateStr = new Date(startDateTime).toLocaleString('es-ES', { 
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
          });
          const html = getHtmlTemplate(
            'Cita Reagendada',
            '<p>Tu cita ha sido modificada a un nuevo horario. Por favor, asegúrate de anotar la nueva fecha.</p>',
            client?.name || 'Cliente',
            dateStr,
            appId,
            service
          );
          sendEmail(client.email, 'Actualización de tu Cita - Salon Hair', html).catch(e => console.error('Reschedule email error:', e));
        }
      } catch (err) { console.error('Calendar patch error:', err.message); }
    }
    
    await pool.query('UPDATE appointments SET client_id=$1,stylist_id=$2,service=$3,time=$4,date=$5,status=$6 WHERE id=$7',
      [client_id, stylist_id, service, time, date, status||'pending', appId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  const appId = parseInt(req.params.id);
  if (isNaN(appId)) return res.status(400).json({ error: 'ID inválido' });
  try {
    const { rows } = await pool.query('SELECT a.*, c.name as client_name, c.email as client_email FROM appointments a JOIN clients c ON a.client_id=c.id WHERE a.id=$1', [appId]);
    const appointment = rows[0];
    
    const tokens = await getAdminTokens();
    if (tokens && appointment?.event_id) {
      try {
        oauth2Client.setCredentials(tokens);
        await calendar.events.delete({ calendarId: 'primary', eventId: appointment.event_id });
      } catch (err) { console.error('Calendar delete error:', err.message); }
      
      if (appointment?.client_email) {
        const dateStr = new Date(`${appointment.date}T${appointment.time}`).toLocaleString('es-ES', { 
          weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
        });
        const html = getHtmlTemplate(
          'Cita Cancelada',
          '<p>Lamentamos informarte que tu cita ha sido cancelada.</p>',
          appointment.client_name,
          dateStr,
          null,
          appointment.service
        );
        sendEmail(appointment.client_email, 'Cita Cancelada - Salon Hair', html).catch(e => console.error('Cancel email error:', e));
      }
    }
    
    await pool.query('DELETE FROM appointments WHERE id=$1', [appId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── CLIENTS ────────────────────────────────────────────────
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clients');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/clients', authenticateToken, async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    const { rows } = await pool.query('INSERT INTO clients (name,email,phone) VALUES ($1,$2,$3) RETURNING id', [name, email, phone]);
    res.json({ success: true, clientId: rows[0].id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nombre y email requeridos' });
  try {
    await pool.query('UPDATE clients SET name=$1,email=$2,phone=$3 WHERE id=$4', [name, email, phone, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  try {
    await pool.query('DELETE FROM clients WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── STYLISTS ───────────────────────────────────────────────
app.get('/api/stylists', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM stylists');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/stylists', authenticateToken, async (req, res) => {
  const { name, specialization, rating, availability, next_available } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
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
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    await pool.query('UPDATE stylists SET name=$1,specialization=$2,rating=$3,availability=$4,next_available=$5 WHERE id=$6',
      [name, specialization, rating, availability, next_available, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/stylists/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  try {
    await pool.query('DELETE FROM stylists WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── STATS ──────────────────────────────────────────────────
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yStr = yesterday.toISOString().split('T')[0];
    const now = new Date();
    const fTM = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const fLM = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString().split('T')[0];
    const lLM = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    const [tA,yA,tC,tMC,lMC,rev,lRev,sC] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM appointments WHERE date=$1',[today]),
      pool.query('SELECT COUNT(*) as count FROM appointments WHERE date=$1',[yStr]),
      pool.query('SELECT COUNT(*) as count FROM clients'),
      pool.query('SELECT COUNT(*) as count FROM clients WHERE created_at>=$1',[fTM]),
      pool.query('SELECT COUNT(*) as count FROM clients WHERE created_at>=$1 AND created_at<$2',[fLM,fTM]),
      pool.query('SELECT COALESCE(SUM(price),0) as total FROM appointments WHERE date>=$1',[fTM]),
      pool.query('SELECT COALESCE(SUM(price),0) as total FROM appointments WHERE date>=$1 AND date<=$2',[fLM,lLM]),
      pool.query("SELECT COUNT(*) as count FROM stylists WHERE availability!='off'"),
    ]);
    const tc=parseInt(tA.rows[0].count)||0, yc=parseInt(yA.rows[0].count)||0;
    const aC=tc-yc;
    const totC=parseInt(tC.rows[0].count)||0;
    const tMCc=parseInt(tMC.rows[0].count)||0, lMCc=parseInt(lMC.rows[0].count)||0;
    const cC=lMCc>0?Math.round(((tMCc-lMCc)/lMCc)*100):(tMCc>0?100:0);
    const tR=parseFloat(rev.rows[0].total)||0, pR=parseFloat(lRev.rows[0].total)||0;
    const rC=pR>0?Math.round(((tR-pR)/pR)*100):(tR>0?100:0);
    const aS=parseInt(sC.rows[0].count)||1;
    const occ=Math.min(100,Math.round((tc/(aS*8))*100));
    res.json([
      {title:'Citas Hoy',value:tc.toString(),change:(aC>=0?'+':'')+aC,trend:aC>=0?'up':'down',color:'from-slate-700 to-slate-900'},
      {title:'Clientes Activos',value:totC.toString(),change:(cC>=0?'+':'')+cC+'%',trend:cC>=0?'up':'down',color:'from-slate-600 to-slate-800'},
      {title:'Ingresos del Mes',value:`€${Math.round(tR).toLocaleString()}`,change:(rC>=0?'+':'')+rC+'%',trend:rC>=0?'up':'down',color:'from-amber-600 to-amber-700'},
      {title:'Tasa de Ocupación',value:`${occ}%`,change:occ>70?'+5%':'-2%',trend:occ>70?'up':'down',color:'from-amber-500 to-amber-600'},
    ]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── NOTIFICATIONS ──────────────────────────────────────────
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM notifications ORDER BY time DESC LIMIT 50');
    res.json(rows.map(r => ({ ...r, read: !!r.read })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  try { await pool.query('UPDATE notifications SET read=1 WHERE id=$1',[id]); res.json({success:true}); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  try { await pool.query('DELETE FROM notifications WHERE id=$1',[id]); res.json({success:true}); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ANALYTICS ──────────────────────────────────────────────
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const now = new Date();
    let startDate;
    if (range==='7d') startDate=new Date(now-7*864e5);
    else if (range==='3m') startDate=new Date(now-90*864e5);
    else if (range==='1y') startDate=new Date(now-365*864e5);
    else startDate=new Date(now-30*864e5);
    const startStr=startDate.toISOString().split('T')[0];
    const useDaily=range==='7d'||range==='30d';
    const gQ=useDaily
      ?`SELECT date as month, SUM(price) as revenue, COUNT(*) as appointments FROM appointments WHERE date>=$1 GROUP BY date ORDER BY date`
      :`SELECT TO_CHAR(TO_DATE(date,'YYYY-MM-DD'),'Mon') as month, TO_CHAR(TO_DATE(date,'YYYY-MM-DD'),'MM') as month_num, SUM(price) as revenue, COUNT(*) as appointments FROM appointments WHERE date>=$1 GROUP BY 1,2 ORDER BY 2`;
    const [rR,sR,tRev,tApp,pRev,pApp]=await Promise.all([
      pool.query(gQ,[startStr]),
      pool.query('SELECT service as name, COUNT(*) as count FROM appointments WHERE date>=$1 GROUP BY service',[startStr]),
      pool.query('SELECT COALESCE(SUM(price),0) as total FROM appointments WHERE date>=$1',[startStr]),
      pool.query('SELECT COUNT(*) as count FROM appointments WHERE date>=$1',[startStr]),
      pool.query('SELECT COALESCE(SUM(price),0) as total FROM appointments WHERE date<$1 AND date>=$2',[startStr,new Date(startDate-(now-startDate)).toISOString().split('T')[0]]),
      pool.query('SELECT COUNT(*) as count FROM appointments WHERE date<$1 AND date>=$2',[startStr,new Date(startDate-(now-startDate)).toISOString().split('T')[0]]),
    ]);
    const colors=['#6366f1','#ec4899','#10b981','#f59e0b','#8b5cf6'];
    const tot=parseInt(tApp.rows[0].count)||1;
    const thisRev=parseFloat(tRev.rows[0].total)||0;
    const prevRev=parseFloat(pRev.rows[0].total)||0;
    const rC=prevRev>0?Math.round(((thisRev-prevRev)/prevRev)*100):(thisRev>0?100:0);
    const thisA=parseInt(tApp.rows[0].count)||0;
    const prevA=parseInt(pApp.rows[0].count)||0;
    const aC=prevA>0?Math.round(((thisA-prevA)/prevA)*100):(thisA>0?100:0);
    res.json({
      revenueData:rR.rows.length>0?rR.rows.map(r=>({month:r.month,revenue:parseFloat(r.revenue)||0,appointments:parseInt(r.appointments)||0})):[{month:'Sin datos',revenue:0,appointments:0}],
      serviceData:sR.rows.length>0?sR.rows.map((s,i)=>({name:s.name,value:Math.round((parseInt(s.count)/tot)*100),color:colors[i%colors.length]})):[{name:'Sin datos',value:100,color:'#94a3b8'}],
      totalRevenue:thisRev,totalAppointments:thisA,revenueChangePct:rC,apptsChangePct:aC,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TRIAGE CRUD ────────────────────────────────────────────
app.get('/api/triage', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM triage_results ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/triage', authenticateToken, async (req, res) => {
  const { id, subject, body, category, priority, suggested_action } = req.body;
  if (!id||!subject||!category||!priority) return res.status(400).json({ error: 'Faltan campos' });
  try {
    await pool.query(
      'INSERT INTO triage_results (id,subject,body,category,priority,suggested_action) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET subject=$2,body=$3,category=$4,priority=$5,suggested_action=$6',
      [id,subject,body,category,priority,suggested_action]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/triage/:id', authenticateToken, async (req, res) => {
  if (!req.params.id) return res.status(400).json({ error: 'ID inválido' });
  try { await pool.query('DELETE FROM triage_results WHERE id=$1',[req.params.id]); res.json({success:true}); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── SETTINGS ───────────────────────────────────────────────
const SENSITIVE_KEYS = ['openai_key','gemini_key','twilio_sid','twilio_token','smtp_password','whatsapp_token'];
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM settings');
    const s = {};
    rows.forEach(r => {
      try { s[r.key] = JSON.parse(r.value); } catch { s[r.key] = r.value; }
      if (SENSITIVE_KEYS.includes(r.key) && s[r.key] && String(s[r.key]).length > 4) {
        s[r.key] = '••••••••' + String(s[r.key]).slice(-4);
      }
    });
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/settings', authenticateToken, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      if (SENSITIVE_KEYS.includes(key) && typeof value==='string' && value.startsWith('••••')) continue;
      await pool.query('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2',[key,JSON.stringify(value)]);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── SPA FALLBACK ───────────────────────────────────────────
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) return next();
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map|json|txt)$/)) return next();
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) res.sendFile(indexPath);
  else res.status(404).send('Frontend no encontrado.');
});

app.use((err, req, res, next) => {
  console.error('ERROR:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

waitForDB().then(() => initDB()).then(() => {
  app.listen(port, '0.0.0.0', () => console.log(`Salon Backend + Frontend en http://0.0.0.0:${port}`));
}).catch(err => { console.error('Error fatal:', err.message); process.exit(1); });
