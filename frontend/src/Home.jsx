import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Home() {
    const { isAuthenticated, user } = useAuth();

    return (
        <>
            <section className="card hero-card">
                <span className="badge">Sistema de Gestión de Flota</span>
                <h1 className="hero-title">Control de Vehículos, Conductores y Viajes</h1>
                <p className="hero-subtitle">
                    Plataforma centralizada para administrar unidades de transporte, legajos y licencias de
                    choferes, registro de recorridos y cálculo acumulado de kilómetros.
                </p>

                <div className="hero-actions">
                    {isAuthenticated ? (
                        <>
                            <Link to="/vehiculos" className="btn btn-primary">
                                Ir al panel ({user?.nombre})
                            </Link>
                            <Link to="/viajes" className="btn btn-outline">
                                Ver viajes registrados
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-primary">
                                Iniciar sesión
                            </Link>
                            <Link to="/register" className="btn btn-outline">
                                Crear cuenta
                            </Link>
                        </>
                    )}
                </div>
            </section>

            <section className="features-grid">
                <article className="card">
                    <h3>Flota de Vehículos</h3>
                    <p className="muted-text">
                        Alta, modificación y baja de unidades con control de patente única, año, capacidad de
                        carga e historial de kilómetros recorridos.
                    </p>
                </article>

                <article className="card">
                    <h3>Gestión de Conductores</h3>
                    <p className="muted-text">
                        Registro de choferes, número de documento, licencia habilitante con fechas de alta y
                        vencimiento, y métricas de distancia recorrida.
                    </p>
                </article>

                <article className="card">
                    <h3>Registro de Viajes</h3>
                    <p className="muted-text">
                        Asignación de vehículo y conductor por trayecto, fechas de salida y llegada, origen,
                        destino, observaciones y filtros por unidad o chofer.
                    </p>
                </article>
            </section>
        </>
    );
}