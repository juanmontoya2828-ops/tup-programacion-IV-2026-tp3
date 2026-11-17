import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/vehiculos" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanEmail = email.trim();
        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setError('Ingresá un correo electrónico válido');
            return;
        }
        if (!password) {
            setError('La contraseña es obligatoria');
            return;
        }

        setLoading(true);
        try {
            await login(cleanEmail, password);
            navigate('/vehiculos');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="card auth-card">
                <h1>Iniciar sesión</h1>
                <p className="subtitle">Ingresá tus credenciales para administrar la flota</p>

                {location.state?.registered && (
                    <div className="alert alert-success">
                        Cuenta creada correctamente. Ya podés iniciar sesión.
                    </div>
                )}

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} noValidate>
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
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿No tenés cuenta? <Link to="/register">Registrate acá</Link>
                </p>
                <p className="auth-footer">
                    <Link to="/">Volver al inicio</Link>
                </p>
            </div>
        </div>
    );
}