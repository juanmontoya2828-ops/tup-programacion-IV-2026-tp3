import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import ProtectedRoute from './ProtectedRoute';
import Home from './Home';
import Login from './Login';
import Register from './Register';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <main className="container">
              <Home />
            </main>
          </>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/vehiculos"
          element={
            <div className="card">
              <h2>Vehículos</h2>
              <p>Módulo en construcción...</p>
            </div>
          }
        />
        <Route
          path="/conductores"
          element={
            <div className="card">
              <h2>Conductores</h2>
              <p>Módulo en construcción...</p>
            </div>
          }
        />
        <Route
          path="/viajes"
          element={
            <div className="card">
              <h2>Viajes</h2>
              <p>Módulo en construcción...</p>
            </div>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}