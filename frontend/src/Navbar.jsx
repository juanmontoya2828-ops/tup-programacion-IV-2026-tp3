import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="navbar">
            <NavLink to="/" className="navbar-brand">
                Gestión de Transporte
            </NavLink>

            <nav className="navbar-links">
                <NavLink to="/" end>
                    Inicio
                </NavLink>
                {isAuthenticated && (
                    <>
                        <NavLink to="/vehiculos">Vehículos</NavLink>
                        <NavLink to="/conductores">Conductores</NavLink>
                        <NavLink to="/viajes">Viajes</NavLink>
                    </>
                )}
            </nav>

            <div className="navbar-user">
                {isAuthenticated ? (
                    <>
                        <span>{user?.nombre}</span>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm nav-btn-outline"
                            onClick={handleLogout}
                        >
                            Cerrar sesión
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" className="btn btn-primary btn-sm nav-link-btn">
                            Iniciar sesión
                        </NavLink>
                        <NavLink to="/register" className="btn btn-outline btn-sm nav-btn-outline nav-link-btn">
                            Registrarse
                        </NavLink>
                    </>
                )}
            </div>
        </header>
    );
}