const API_BASE_URL = 'http://localhost:1000/admin';

export const fetchPendingVerifications = async () => {
  const response = await fetch(`${API_BASE_URL}/verification/pending`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch verifications');
  return response.json();
};

export const approveVerification = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/verification/${id}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to approve');
  return response.json();
};

export const rejectVerification = async (id: string, reason: string) => {
  const response = await fetch(`${API_BASE_URL}/verification/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify({ reason })
  });
  if (!response.ok) throw new Error('Failed to reject');
  return response.json();
};