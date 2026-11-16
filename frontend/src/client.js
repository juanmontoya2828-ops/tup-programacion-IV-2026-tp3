const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401 && !endpoint.startsWith('/auth/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth:expired'));
        }

        const error = new Error(data.message || 'Error en la solicitud');
        error.status = response.status;
        error.errors = data.errors || [];
        throw error;
    }

    return data;
}