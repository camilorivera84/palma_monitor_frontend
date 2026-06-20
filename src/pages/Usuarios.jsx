import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Usuarios() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar si el usuario es admin
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      if (parsed.role !== 'admin') {
        setError('No tienes permisos de administrador');
        setLoading(false);
        return;
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 403) {
        setError('No tienes permisos para ver los usuarios');
      } else {
        setError('Error al cargar los usuarios');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMensaje('✅ ' + response.data.message);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
      });
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      setError(
        '❌ ' + (error.response?.data?.message || 'Error al registrar usuario'),
      );
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario "${username}"?`))
      return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje(`✅ Usuario "${username}" eliminado exitosamente`);
      fetchUsers();
    } catch (error) {
      setError(
        '❌ ' + (error.response?.data?.message || 'Error al eliminar usuario'),
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Cargando usuarios...</h2>
      </div>
    );
  }

  if (error && error.includes('permisos')) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>⛔ {error}</h2>
        <p>No tienes acceso a esta página</p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ padding: '10px 20px', marginTop: '15px', cursor: 'pointer' }}
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <h1>👥 Gestión de Usuarios</h1>
            <p style={{ color: '#666' }}>Administra los usuarios del sistema</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {showForm ? '✕ Cerrar' : '➕ Nuevo Usuario'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              🏠 Dashboard
            </button>
          </div>
        </div>
      </header>

      {mensaje && (
        <div
          style={{
            background: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '15px',
          }}
        >
          {mensaje}
        </div>
      )}
      {error && (
        <div
          style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '15px',
          }}
        >
          {error}
        </div>
      )}

      {/* Formulario para crear usuario */}
      {showForm && (
        <div
          style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <h3>📝 Crear Nuevo Usuario</h3>
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginTop: '15px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Usuario *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
                placeholder="Nombre de usuario"
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Rol
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              >
                <option value="user">Usuario Normal</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 30px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                💾 Crear Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="table-container">
        <div className="table-title">
          📋 Usuarios del Sistema ({users.length})
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fecha de registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#666',
                    }}
                  >
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        style={{
                          padding: '2px 12px',
                          borderRadius: '12px',
                          background:
                            u.role === 'admin' ? '#cce5ff' : '#e9ecef',
                          color: u.role === 'admin' ? '#004085' : '#333',
                          fontWeight: u.role === 'admin' ? 'bold' : 'normal',
                        }}
                      >
                        {u.role === 'admin' ? '👑 Admin' : '👤 Usuario'}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          style={{
                            padding: '4px 12px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                      {u.id === user?.id && (
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          Tú
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Usuarios;
