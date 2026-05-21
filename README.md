# Salon Hair Agent

Sistema de gestión para salón de belleza con reservas, integración de calendario, notificaciones por email y WhatsApp.

## Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## Instalación

### 1. Clonar y preparar

```bash
git clone <repo-url>
cd salonhairagent-master
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# JWT - Genera una clave segura
JWT_SECRET=tu_clave_secreta_muy_larga_minimo_32_caracteres

# PostgreSQL
DB_PASSWORD=tu_password_segura
DATABASE_URL=postgresql://postgres:tu_password_segura@localhost:5432/salon_db

# Google OAuth (opcional, para emails y calendario)
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
ADMIN_EMAIL=tu_email@gmail.com
APP_URL=http://localhost:3000
```

### 3. Crear base de datos PostgreSQL

```sql
CREATE DATABASE salon_db;
CREATE USER postgres WITH PASSWORD 'tu_password_segura';
GRANT ALL PRIVILEGES ON DATABASE salon_db TO postgres;
```

### 4. Iniciar el servidor

```bash
npm start
```

El servidor arrancará en `http://localhost:3000`

---

## Configuración de Integraciones

### WhatsApp Business API

El WhatsApp se configura desde el **panel de administración** en la sección "Ajustes". Los valores se guardan en la base de datos.

#### Pasos para activar WhatsApp:

1. **Crear app en Meta for Developers:**
   - Ve a https://developers.facebook.com/
   - Crea una nueva App tipo "Business"
   - Añade el producto "WhatsApp"

2. **Obtener credenciales:**
   - **Phone Number ID**: Lo encontrarás en tu cuenta de WhatsApp Business
   - **Access Token**: Genéralo desde el panel de WhatsApp API

3. **Configurar en el panel:**
   - Accede al panel de administración
   - Ve a Settings/Ajustes
   - Busca la sección WhatsApp
   - Ingresa:
     - WhatsApp Access Token
     - Phone Number ID
     - Verify Token (cualquier texto que uses después)

4. **Configurar Webhook:**
   - En Meta, configura la URL del webhook:
   ```
   https://tu-dominio.com/api/webhook/whatsapp
   ```
   - Usa el mismo verify_token que configuraste

#### Funcionalidades de WhatsApp:

| Comando | Acción |
|---------|--------|
| `hola` | Menú principal |
| `1` | Reservar nueva cita |
| `2` | Ver próximas citas |
| `3` | Cancelar una cita |
| `0` | Volver al menú |

---

### Google Calendar + Gmail (Emails de confirmación)

#### 1. Crear proyecto en Google Cloud Console

1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto
3. Habilita las APIs:
   - Google Calendar API
   - Gmail API

#### 2. Crear credenciales OAuth

1. Ve a "APIs y servicios" > "Credenciales"
2. Crea "ID de cliente OAuth 2.0"
3. Tipo: "Aplicación web"
4. URI de redireccionamiento autorizado:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. Copia el **Client ID** y **Client Secret**

#### 3. Configurar en el servidor

Edita `.env` con tus credenciales de Google:

```env
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_cliente_secret
ADMIN_EMAIL=tu_email@gmail.com
APP_URL=http://localhost:3000
```

#### 4. Autenticarse

1. Inicia el servidor
2. Ve a: `http://localhost:3000/api/auth/google`
3. Inicia sesión con la cuenta de `ADMIN_EMAIL`
4. Autoriza los permisos

#### Automatizaciones de Email:

| Evento | Email a Cliente | Email a Admin |
|--------|-----------------|---------------|
| Nueva cita | Confirmación | Nueva reserva |
| Reagendar | Nuevo horario | Cambio de horario |
| Cancelar | Cancelación | Cancelación |

---

## Estructura del Proyecto

```
├── server.cjs              # Backend Express
├── package.json            # Dependencias
├── .env.example            # Variables de entorno (referencia)
├── salon-dashboard-frontend/  # Frontend Next.js
│   ├── components/
│   │   └── AppointmentCalendar.tsx
│   └── lib/
│       └── api.ts          # Cliente API del frontend
└── docker-compose.yaml     # Despliegue con Docker
```

---

## Endpoints API

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login de admin |
| POST | `/api/auth/register` | Registro de admin |

### Citas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/appointments` | Listar todas las citas |
| POST | `/api/appointments` | Crear nueva cita |
| PUT | `/api/appointments/:id` | Actualizar cita |
| PUT | `/api/appointments/:id/status` | Cambiar estado |
| DELETE | `/api/appointments/:id` | Eliminar cita |

### Clientes y Estilistas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/clients` | Listar/Crear clientes |
| GET/POST | `/api/stylists` | Listar/Crear estilistas |

### Notificaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/notifications` | Listar notificaciones |
| POST | `/api/notifications/:id/read` | Marcar como leída |

### WhatsApp

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/webhook/whatsapp` | Verificación webhook |
| POST | `/api/webhook/whatsapp` | Recibir mensajes |

### Google OAuth

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auth/google` | Iniciar autenticación Google |
| GET | `/api/auth/google/callback` | Callback OAuth |
| GET | `/api/config` | Estado de conexiones |

---

## Desarrollo con Docker

```bash
docker-compose up -d
```

El backend estará disponible en `http://localhost:3000` y PostgreSQL en el puerto `5432`.

---

## Solución de Problemas

### "WhatsApp no configurado"
- Verifica que `whatsapp_token` y `whatsapp_phone_number_id` estén configurados en Settings
- Comprueba que el webhook esté correctamente configurado en Meta

### "Falta GOOGLE_CLIENT_ID"
- Verifica que las variables de Google estén en `.env`
- Asegúrate de haber iniciado sesión en `/api/auth/google`

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté corriendo
- Comprueba las credenciales en `DATABASE_URL`

---

## Tecnologías

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Integraciones**: Google Calendar API, Gmail API, WhatsApp Business API
- **BD**: PostgreSQL con timestamps para tracking