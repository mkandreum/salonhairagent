const API_BASE = 'http://localhost:3001/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function fetchAppointments() {
  const res = await fetch(`${API_BASE}/appointments`);
  const data = await res.json();
  // Transform to frontend format if necessary
  return data.map((a: any) => ({
    id: a.id,
    time: a.time,
    client: a.client_name,
    service: a.service,
    stylist: a.stylist_name,
    status: a.status
  }));
}

export async function fetchClients() {
  const res = await fetch(`${API_BASE}/clients`);
  return res.json();
}

export async function fetchStylists() {
  const res = await fetch(`${API_BASE}/stylists`);
  return res.json();
}

export async function fetchTriage() {
  const res = await fetch(`${API_BASE}/triage`);
  return res.json();
}

