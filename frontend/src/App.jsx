import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './navbar';
import ProtectedRoute from './protectedroute';
import Home from './home';
import Login from './login';
import Register from './register';
import Vehiculos from './vehiculos';
import Conductores from './conductores';
import Viajes from './viajes';

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