// Central API configuration
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';

  // Happy path — JSON response
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
  }

  // Non-JSON response (HTML error page, gateway timeout, etc.)
  // Log it for debugging but show the user a clean message
  const text = await res.text().catch(() => '');
  console.error(`[API] Non-JSON response ${res.status} for ${res.url}:`, text.slice(0, 200));

  if (res.status === 503) {
    throw new Error('Service temporarily unavailable. Please try again in a moment.');
  }
  if (res.status === 502 || res.status === 504) {
    throw new Error('Server is starting up. Please wait a moment and try again.');
  }
  if (!res.ok) {
    throw new Error(`Something went wrong (${res.status}). Please try again.`);
  }

  // 2xx but not JSON — shouldn't happen but handle gracefully
  throw new Error('Unexpected response format. Please try again.');
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const apiSignup = (body) =>
  fetch(`${BASE_URL}/auth/signup`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);

export const apiLogin = (body) =>
  fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);

export const apiGetMe = (token) =>
  fetch(`${BASE_URL}/auth/me`, { headers: getHeaders(token) }).then(handleResponse);

export const apiUpdateMe = (token, body) =>
  fetch(`${BASE_URL}/auth/me`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse);

export const apiForgotPassword = (email) =>
  fetch(`${BASE_URL}/auth/forgot-password`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ email }) }).then(handleResponse);

export const apiResetPassword = (token, password) =>
  fetch(`${BASE_URL}/auth/reset-password/${token}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ password }) }).then(handleResponse);

// ─── Contact ──────────────────────────────────────────────────────────────────
export const apiSendContactMessage = (body) =>
  fetch(`${BASE_URL}/contact`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const apiGetDoctors = () =>
  fetch(`${BASE_URL}/doctors`).then(handleResponse);

export const apiGetDoctor = (id) =>
  fetch(`${BASE_URL}/doctors/${id}`).then(handleResponse);

export const apiCreateDoctor = (token, body) =>
  fetch(`${BASE_URL}/doctors`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse);

export const apiUpdateDoctor = (token, id, body) =>
  fetch(`${BASE_URL}/doctors/${id}`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse);

export const apiDeleteDoctor = (token, id) =>
  fetch(`${BASE_URL}/doctors/${id}`, { method: 'DELETE', headers: getHeaders(token) }).then(handleResponse);

export const apiSetAvailability = (token, id, availability) =>
  fetch(`${BASE_URL}/doctors/${id}/availability`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify({ availability }) }).then(handleResponse);

// ─── Appointments ─────────────────────────────────────────────────────────────
export const apiGetAppointments = (token) =>
  fetch(`${BASE_URL}/appointments`, { headers: getHeaders(token) }).then(handleResponse);

export const apiBookAppointment = (token, body) =>
  fetch(`${BASE_URL}/appointments`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse);

export const apiUpdateStatus = (token, id, status) =>
  fetch(`${BASE_URL}/appointments/${id}/status`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify({ status }) }).then(handleResponse);

export const apiReschedule = (token, id, body) =>
  fetch(`${BASE_URL}/appointments/${id}/reschedule`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse);

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const apiGetReviews = () =>
  fetch(`${BASE_URL}/reviews`).then(handleResponse);

export const apiCreateReview = (token, body) =>
  fetch(`${BASE_URL}/reviews`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse);

// ─── Admin ────────────────────────────────────────────────────────────────────
export const apiGetAdminStats = (token) =>
  fetch(`${BASE_URL}/admin/stats`, { headers: getHeaders(token) }).then(handleResponse);

export const apiGetAllUsers = (token) =>
  fetch(`${BASE_URL}/admin/users`, { headers: getHeaders(token) }).then(handleResponse);

export const apiUpdateUserRole = (token, id, role) =>
  fetch(`${BASE_URL}/admin/users/${id}/role`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify({ role }) }).then(handleResponse);

export const apiGetAuditLogs = (token) =>
  fetch(`${BASE_URL}/admin/audit-logs`, { headers: getHeaders(token) }).then(handleResponse);

// ─── AI Chat ──────────────────────────────────────────────────────────────────
export const apiAIChat = (history, message) =>
  fetch(`${BASE_URL}/ai/chat`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ history, message }) }).then(handleResponse);

// ─── Free Session Booking ─────────────────────────────────────────────────────
export const apiBookFreeSession = (token, data) =>
  fetch(`${BASE_URL}/appointments/free-session`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(data) }).then(handleResponse);
