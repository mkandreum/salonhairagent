// API_BASE: en producción nginx hace proxy de /api -> backend:3001
// En desarrollo local Next.js reescribe /api -> localhost:3001
const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('salon_pro_token');
  } catch {
    return null;
  }
}

function getAuthHeader(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeader(),
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    let errMsg = `Error ${res.status}`;
    try {
      const data = await res.json();
      errMsg = data.error || errMsg;
    } catch {}
    // Token expirado: limpiar sesión
    if (res.status === 401 || res.status === 403) {
      try { localStorage.removeItem('salon_pro_token'); } catch {}
      if (typeof window !== 'undefined') window.location.reload();
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export async function fetchStats() {
  return apiFetch('/stats');
}

export async function fetchAppointments() {
  const data = await apiFetch('/appointments');
  return data.map((a: any) => ({
    id: a.id,
    time: a.time,
    date: a.date,
    client: a.client_name,
    client_id: a.client_id,
    service: a.service,
    stylist: a.stylist_name,
    stylist_id: a.stylist_id,
    price: a.price,
    status: a.status
  }));
}

export async function fetchClients() {
  return apiFetch('/clients');
}

export async function fetchStylists() {
  return apiFetch('/stylists');
}

export async function fetchTriage() {
  return apiFetch('/triage');
}

export async function fetchNotifications() {
  return apiFetch('/notifications');
}

export async function markNotificationRead(id: number) {
  return apiFetch(`/notifications/${id}/read`, { method: 'POST' });
}

export async function deleteNotification(id: number) {
  return apiFetch(`/notifications/${id}`, { method: 'DELETE' });
}

export async function fetchAnalytics(range: string = '30d') {
  return apiFetch(`/analytics?range=${range}`);
}

export async function createAppointment(data: any) {
  return apiFetch('/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function createClient(data: any) {
  return apiFetch('/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteAppointment(id: number) {
  return apiFetch(`/appointments/${id}`, { method: 'DELETE' });
}

export async function updateAppointmentStatus(id: number, status: string) {
  return apiFetch(`/appointments/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function updateAppointment(id: number, data: any) {
  return apiFetch(`/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateClient(id: number, data: any) {
  return apiFetch(`/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function createStylist(data: any) {
  return apiFetch('/stylists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateStylist(id: number, data: any) {
  return apiFetch(`/stylists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteStylist(id: number) {
  return apiFetch(`/stylists/${id}`, { method: 'DELETE' });
}

export async function deleteClient(id: number) {
  return apiFetch(`/clients/${id}`, { method: 'DELETE' });
}

export async function deleteTriage(id: string) {
  return apiFetch(`/triage/${id}`, { method: 'DELETE' });
}

export async function fetchSettings() {
  return apiFetch('/settings');
}

export async function saveSettings(settings: any) {
  return apiFetch('/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}
