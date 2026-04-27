const API_BASE = (typeof window !== 'undefined' && (window as any).ENV_API_URL) 
  || process.env.NEXT_PUBLIC_API_URL 
  || '/api';

function getAuthHeader() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('salon_pro_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeader() });
  return res.json();
}

export async function fetchAppointments() {
  const res = await fetch(`${API_BASE}/appointments`, { headers: getAuthHeader() });
  const data = await res.json();
  // Transform to frontend format if necessary
  return data.map((a: any) => ({
    id: a.id,
    time: a.time,
    date: a.date,
    client: a.client_name,
    service: a.service,
    stylist: a.stylist_name,
    status: a.status
  }));
}

export async function fetchClients() {
  const res = await fetch(`${API_BASE}/clients`, { headers: getAuthHeader() });
  return res.json();
}

export async function fetchStylists() {
  const res = await fetch(`${API_BASE}/stylists`, { headers: getAuthHeader() });
  return res.json();
}

export async function fetchTriage() {
  const res = await fetch(`${API_BASE}/triage`, { headers: getAuthHeader() });
  return res.json();
}

export async function fetchNotifications() {
  const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeader() });
  return res.json();
}

export async function markNotificationRead(id: number) {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, { 
    method: 'POST',
    headers: getAuthHeader()
  });
  return res.json();
}

export async function deleteNotification(id: number) {
  const res = await fetch(`${API_BASE}/notifications/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`, { headers: getAuthHeader() });
  return res.json();
}

export async function createAppointment(data: any) {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function createClient(data: any) {
  const res = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteAppointment(id: number) {
  const res = await fetch(`${API_BASE}/appointments/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return res.json();
}

export async function updateAppointmentStatus(id: number, status: string) {
  const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function updateClient(id: number, data: any) {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function createStylist(data: any) {
  const res = await fetch(`${API_BASE}/stylists`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteStylist(id: number) {
  const res = await fetch(`${API_BASE}/stylists/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return res.json();
}

export async function deleteClient(id: number) {
  const res = await fetch(`${API_BASE}/clients/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return res.json();
}

export async function deleteTriage(id: string) {
  const res = await fetch(`${API_BASE}/triage/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return res.json();
}
