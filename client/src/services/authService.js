import api from './api.js';

export async function registerUser(name, email, password, preferredTransport = 'transit') {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
    preferredTransport,
  });
  return response.data;
}

export async function loginUser(email, password) {
  const response = await api.post('/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data.user;
}

export async function updateUserPreferences(preferredTransport, defaultLocation) {
  const response = await api.put('/auth/preferences', {
    preferredTransport,
    defaultLocation,
  });
  return response.data;
}
