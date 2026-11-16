import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from './client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        const handleExpired = () => logout();
        window.addEventListener('auth:expired', handleExpired);
        return () => window.removeEventListener('auth:expired', handleExpired);
    }, []);

    const login = async (email, password) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (nombre, email, password) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ nombre, email, password }),
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: Boolean(token),
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}