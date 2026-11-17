import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import ProtectedRoute from './ProtectedRoute';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Vehiculos from './Vehiculos';
import Conductores from './Conductores';
import Viajes from './Viajes';

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
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/conductores" element={<Conductores />} />
        <Route path="/viajes" element={<Viajes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}