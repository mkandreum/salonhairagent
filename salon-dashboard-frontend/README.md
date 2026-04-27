# SalonPro — Premium AI Dashboard
A state-of-the-art, high-fidelity React/Next.js dashboard for elite salon management, featuring glassmorphism aesthetics, real-time AI triage, and a robust SQLite backend.

## 🌟 Premium Features

### 💎 Design System (Premium AI)
- **Glassmorphism**: High-end translucent interfaces with backdrop filters and sophisticated borders.
- **Dynamic Animations**: Custom keyframes for smooth transitions, blob backgrounds, and interactive micro-animations.
- **Responsive & Premium Layout**: A professional sidebar with active states, icons, and a "Plan" indicator.
- **Dark Mode Native**: Designed from the ground up to look stunning in both light and dark modes.

### 📅 Real-Time Management
- **Smart Appointments**: Today's schedule with status tracking and quick actions.
- **Client Portfolio**: Comprehensive directory with VIP indicators and spending history.
- **Stylist Schedule**: Live availability, ratings, and workload management.

### 🤖 AI Triage & Audit
- **Automatic Classification**: Integrated AI agent that triages incoming tickets (Auth, Bug, Feature, General).
- **Audit Dashboard**: Real-time view of AI decisions and priority levels.
- **SQLite Persistence**: All decisions and data are persisted in a real database.

### 📊 Advanced Analytics
- **Revenue Trends**: High-fidelity line charts with area gradients.
- **Service Distribution**: Horizontal bar charts with custom coloring.
- **Real Stats**: Connected to the real backend database for accurate metrics.

## 🛠 Technology Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Icons**: Lucide React.
- **Charts**: Recharts.
- **Backend**: Node.js Express, SQLite3 (Real Database).
- **Automation**: Python 3, LangGraph logic.

## 📂 Project Structure
```
salonhairagent/
├── salon-dashboard-frontend/ # Next.js Application
│   ├── app/                 # App Router & Styles
│   ├── components/          # Premium UI Components
│   └── lib/                 # API Utility Layer
├── server.cjs               # Real Express Backend
├── salon.db                 # SQLite Database
├── automation/              # AI Triage & Logic
└── scripts/                 # Maintenance Scripts
```

## 🚀 Getting Started

### 1. Initialize Database
```bash
node scripts/init_db.cjs
```

### 2. Start Backend Server
```bash
node server.cjs
```

### 3. Start Frontend (Dashboard)
```bash
cd salon-dashboard-frontend
npm install
npm run dev
```

### 4. Run AI Triage (Optional)
```bash
python automation/ticket_triage_mvp.py test_tickets.json
```

## 💎 Premium Aesthetics
Este proyecto ha sido diseñado para impresionar. Cada componente ha sido cuidadosamente estilizado para ofrecer una sensación de lujo y modernidad tecnológica.

- **Tipografía**: Outfit (Google Fonts).
- **Efectos**: Glassmorphism, Floating Blobs, Shake Animations.
- **Localización**: Interfaz completamente en español.

## License
MIT License - Copyright (c) 2024 SalonPro Team