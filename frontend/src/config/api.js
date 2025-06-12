export const API_BASE_URL = 'http://localhost:8080';

export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      mode: 'cors',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Server error');
    }

    return data;
  } catch (error) {
    throw error;
  }
};