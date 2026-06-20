import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Enfermedades from './pages/Enfermedades';
import Plagas from './pages/Plagas';
import Usuarios from './pages/Usuarios';
import AdminEnfermedades from './pages/AdminEnfermedades';
import AdminPlagas from './pages/AdminPlagas';
import './index.css';

// Configurar axios para incluir el token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enfermedades"
          element={
            <ProtectedRoute>
              <Enfermedades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plagas"
          element={
            <ProtectedRoute>
              <Plagas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/enfermedades"
          element={
            <ProtectedRoute>
              <AdminEnfermedades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/plagas"
          element={
            <ProtectedRoute>
              <AdminPlagas />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;


