const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

function getToken() { return localStorage.getItem('access_token'); }

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
      return;
    }
    if (res.status === 204) return {};
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || data.error || JSON.stringify(data));
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch'))
      throw new Error('Cannot connect to server. Make sure all services are running.');
    throw err;
  }
}

export const auth = {
  register: (data) => request('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
  login: async (credentials) => {
    const data = await request('/auth/login/', { method: 'POST', body: JSON.stringify(credentials) });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  },
  logout: () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); },
  me: () => request('/auth/me/'),
};

export const doctors = {
  list: (search = '') => request(`/doctors/${search ? `?search=${search}` : ''}`),
  get: (id) => request(`/doctors/${id}/`),
};

export const patients = {
  list: (search = '') => request(`/patients/${search ? `?search=${search}` : ''}`),
  get: (id) => request(`/patients/${id}/`),
  me: () => request('/patients/me/'),
};

export const appointments = {
  list: () => request('/appointments/'),
  today: () => request('/appointments/today/'),
  upcoming: () => request('/appointments/upcoming/'),
  get: (id) => request(`/appointments/${id}/`),
  create: (data) => request('/appointments/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/appointments/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateStatus: (id, status) => request(`/appointments/${id}/update_status/`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id) => request(`/appointments/${id}/`, { method: 'DELETE' }),
};

export const records = {
  list: () => request('/records/'),
  get: (id) => request(`/records/${id}/`),
  create: (data) => request('/records/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/records/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
};

export const prescriptions = {
  list: () => request('/prescriptions/'),
  create: (data) => request('/prescriptions/', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/prescriptions/${id}/`, { method: 'DELETE' }),
};

export const stats = {
  get: () => request('/stats/'),
};
