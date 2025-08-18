// src/lib/api.js
const BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000/api';

const headers = { 'Content-Type': 'application/json' };

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, { headers, ...options });
    const data = await res.json();
    console.log('API Response:', { path, options, data });
    if (!res.ok) {
      console.error('API Error:', data.error || res.statusText);
      throw new Error(data.error || res.statusText);
    }
    return data;
  } catch (error) {
    console.error('API Exception:', error.message);
    throw error;
  }
}

export const api = {
  /* ─── User ────────────────────────── */
  verifyUser: (body) => request('/users/verify', { method: 'POST', body: JSON.stringify(body) }),
  adminSignIn: (body) => request('/users/admin-signin', { method: 'POST', body: JSON.stringify(body) }),

  /* ─── Vote ────────────────────────── */
  submitVote : (body) => request('/votes/submit', { method: 'POST', body: JSON.stringify(body) }),
  liveResults: ()     => request('/votes/results'),
  longPoll   : ()     => request('/votes/live-poll'),

  /* ─── Party (public) ──────────────── */
  getParties : ()     => request('/parties'),

  /* ─── Party (admin) ───────────────── */
  addParty   : (body, adminId)       => request('/parties',         { method: 'POST',    body: JSON.stringify(body), headers:{...headers,'x-admin-id':adminId} }),
  updateParty: (id, body, adminId)   => request(`/parties/${id}`,   { method: 'PUT',     body: JSON.stringify(body), headers:{...headers,'x-admin-id':adminId} }),
  deleteParty: (id, adminId)         => request(`/parties/${id}`,   { method: 'DELETE',  headers:{...headers,'x-admin-id':adminId} })
};
