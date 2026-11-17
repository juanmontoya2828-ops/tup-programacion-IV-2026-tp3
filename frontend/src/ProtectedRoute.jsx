import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './Navbar';

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <Navbar />
            <main className="container">
                <Outlet />
            </main>
        </>
    );
}