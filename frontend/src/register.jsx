import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Register() {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/vehiculos" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors([]);

        const cleanNombre = nombre.trim();
        const cleanEmail = email.trim();

        if (!cleanNombre) {
            setError('El nombre es obligatorio');
            return;
        }
        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setError('Ingresá un correo electrónico válido');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await register(cleanNombre, cleanEmail, password);
            navigate('/login', { state: { registered: true } });
        } catch (err) {
            setError(err.message);
            setFieldErrors(err.errors || []);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="card auth-card">
                <h1>Crear cuenta</h1>
                <p className="subtitle">Registrá un usuario para acceder al sistema</p>

                {error && (
                    <div className="alert alert-error">
                        <div>{error}</div>
                        {fieldErrors.length > 0 && (
                            <ul>
                                {fieldErrors.map((item, idx) => (
                                    <li key={idx}>{item.mensaje}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group mb-1">
                        <label htmlFor="nombre">Nombre completo</label>
                        <input
                            id="nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Juan Ignacio"
                        />
                    </div>

                    <div className="form-group mb-1">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="juan@example.com"
                        />
                    </div>

                    <div className="form-group mb-125">
                        <label htmlFor="password">Contraseña (mínimo 6 caracteres)</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarme'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
                </p>
                <p className="auth-footer">
                    <Link to="/">Volver al inicio</Link>
                </p>
            </div>
        </div>
    );
}