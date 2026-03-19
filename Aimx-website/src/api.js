// AIMX Backend API Client

const BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';

const API_DELAY = 300;

const withDelay = async () => {
  await new Promise((r) => setTimeout(r, API_DELAY));
};

const getAdminHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const adminLogin = async (email, password) => {
  await withDelay();
  const response = await fetch(`${BASE_URL}/participants/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: email,
      password: password
    })
  });

  if (!response.ok) throw new Error('Invalid admin credentials');
  const data = await response.json();

  if (data?.token) localStorage.setItem('adminToken', data.token);
  return data;
};
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
};

export const postRegistration = async (registrationData) => {
  await withDelay();
  const response = await fetch(`${BASE_URL}/participants/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationData)
  });
  if (!response.ok) throw new Error(await response.text() || 'Register failed');
  return response.json();
};

export const getRegistrations = async () => {
  await withDelay();
  const response = await fetch(`${BASE_URL}/participants`, {
    headers: getAdminHeaders()
  });
  if (!response.ok) throw new Error(await response.text() || 'Fetch failed');
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const getRegistrationById = async (participantId) => {
  await withDelay();
  const response = await fetch(`${BASE_URL}/participants/${participantId}`);
  if (!response.ok) return null;
  const data = await response.json();
  return Array.isArray(data) ? data[0] || null : data;
};

export const updateRegistrationStatus = async (participantId, newStatus) => {
  await withDelay();
  const response = await fetch(`${BASE_URL}/participants/${participantId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status: newStatus })
  });
  if (!response.ok) throw new Error(await response.text() || 'Update failed');
  return response.json();
};

export const deleteRegistration = async (participantId) => {
  await withDelay();
  const response = await fetch(`${BASE_URL}/participants/${participantId}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  if (!response.ok) throw new Error(await response.text() || 'Delete failed');
  return response.json();
};

export const verifyParticipant = async (registrationId) => {
  await withDelay();
  const response = await fetch(`${BASE_URL}/participants/verify/${registrationId}`);
  if (!response.ok) throw new Error(await response.text() || 'Verify failed');
  return response.json();
};

export const checkinParticipant = async (registrationId) => {
  await withDelay();
  const response = await fetch(`${BASE_URL}/participants/checkin/${registrationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error(await response.text() || 'Checkin failed');
  return response.json();
};

export const postCheckin = async (qrData) => {
  await withDelay();
  const response = await fetch(`${BASE_URL}/participants/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrData })
  });
  if (!response.ok) throw new Error(await response.text() || 'Checkin failed');
  return response.json();
};

export const downloadParticipantsExcel = async () => {
  const response = await fetch(`${BASE_URL}/participants/export/excel`, {
    headers: getAdminHeaders()
  });
  if (!response.ok) throw new Error('Failed to export excel');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aimx-participants.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const generateMockData = () => {
  console.log('Backend API active - no mock needed');
};

