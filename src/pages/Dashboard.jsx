import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import MapaPalmas from '../components/MapaPalmas';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [palmas, setPalmas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('mapa');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🌐 Conectando a:', API_URL);

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [palmasRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/palmas`, { headers }),
        axios.get(`${API_URL}/api/stats`, { headers }),
      ]);

      console.log('✅ Datos cargados correctamente');
      setPalmas(palmasRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('❌ Error detallado:', error);
      if (error.response?.status === 401) {
        handleLogout();
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else if (
        error.code === 'ERR_NETWORK' ||
        error.message.includes('Network Error')
      ) {
        setError(
          '🌐 Error de conexión. Verifica que el servidor backend esté corriendo.',
        );
      } else {
        setError(
          'Error al cargar los datos: ' +
            (error.response?.data?.message || error.message),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredPalmas = palmas.filter((palma) => {
    if (!palma) return false;
    if (!searchTerm.trim() && filterEstado === 'todos') return true;
    let matchSearch = true;
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      matchSearch =
        (palma.lote || '').toLowerCase().includes(search) ||
        String(palma.linea || '')
          .toLowerCase()
          .includes(search) ||
        String(palma.id || '').includes(search) ||
        (palma.estado || '').toLowerCase().includes(search) ||
        (palma.descarte || '').toLowerCase().includes(search);
    }
    let matchEstado =
      filterEstado === 'todos' || (palma.estado || '') === filterEstado;
    return matchSearch && matchEstado;
  });

  const estadosUnicos = [
    ...new Set(palmas.map((p) => p.estado).filter(Boolean)),
  ];

  const navLinkStyle = ({ isActive }) => ({
    padding: '8px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    background: isActive ? '#007bff' : 'transparent',
    color: isActive ? 'white' : '#333',
    fontWeight: isActive ? '600' : '400',
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Cargando datos...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2 className="error-title">❌ Error</h2>
        <p className="error-message">{error}</p>
        <button className="btn-retry" onClick={fetchData}>
          🔄 Reintentar
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
            <h1>🌴 Palma Monitor</h1>
            <p style={{ color: '#666' }}>{palmas.length} registros cargados</p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#666', fontSize: '14px' }}>
              👤 {user?.username || 'Usuario'}
            </span>
            <button
              onClick={fetchData}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              🔄 Actualizar
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              🚪 Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div
        style={{
          display: 'flex',
          gap: '5px',
          marginBottom: '20px',
          padding: '8px',
          background: 'white',
          borderRadius: '8px',
          flexWrap: 'wrap',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        <NavLink to="/dashboard" style={navLinkStyle} end>
          🏠 Dashboard
        </NavLink>
        <NavLink to="/enfermedades" style={navLinkStyle}>
          🦠 Enfermedades
        </NavLink>
        <NavLink to="/plagas" style={navLinkStyle}>
          🐛 Plagas
        </NavLink>
        {user?.role === 'admin' && (
          <>
            <NavLink to="/admin/enfermedades" style={navLinkStyle}>
              📋 Admin Enfermedades
            </NavLink>
            <NavLink to="/admin/plagas" style={navLinkStyle}>
              📋 Admin Plagas
            </NavLink>
            <NavLink to="/usuarios" style={navLinkStyle}>
              👥 Usuarios
            </NavLink>
          </>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setViewMode('mapa')}
          style={{
            padding: '8px 20px',
            background: viewMode === 'mapa' ? '#007bff' : '#e9ecef',
            color: viewMode === 'mapa' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: viewMode === 'mapa' ? '500' : '400',
          }}
        >
          🗺️ Mapa ({filteredPalmas.length})
        </button>
        <button
          onClick={() => setViewMode('tabla')}
          style={{
            padding: '8px 20px',
            background: viewMode === 'tabla' ? '#007bff' : '#e9ecef',
            color: viewMode === 'tabla' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: viewMode === 'tabla' ? '500' : '400',
          }}
        >
          📋 Tabla
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Palmas</div>
          <div className="stat-value">{stats?.total_palmas || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Lotes</div>
          <div className="stat-value">{stats?.total_lotes || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Líneas</div>
          <div className="stat-value">{stats?.total_lineas || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Estados</div>
          <div className="stat-value">{stats?.total_estados || 0}</div>
        </div>
      </div>

      <div
        style={{
          background: 'white',
          padding: '15px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              outline: 'none',
              fontSize: '14px',
            }}
          />
        </div>
        <div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <option value="todos">📊 Todos los estados</option>
            {estadosUnicos.map((estado) => (
              <option key={estado} value={estado}>
                {estado === 'ACTIVA' ? '🟢' : '🔴'} {estado}
              </option>
            ))}
          </select>
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          {filteredPalmas.length} registros encontrados
        </div>
        {(searchTerm || filterEstado !== 'todos') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterEstado('todos');
            }}
            style={{
              padding: '6px 12px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {viewMode === 'mapa' ? (
        <div>
          <MapaPalmas palmas={filteredPalmas} />
        </div>
      ) : (
        <div
          className="table-container"
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div
            className="table-title"
            style={{
              marginBottom: '15px',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            📋 Registros ({filteredPalmas.length} de {palmas.length})
          </div>
          <div
            style={{ overflowX: 'auto', maxHeight: '550px', overflowY: 'auto' }}
          >
            <table
              className="table"
              style={{ width: '100%', borderCollapse: 'collapse' }}
            >
              <thead
                style={{ position: 'sticky', top: 0, background: '#f8f9fa' }}
              >
                <tr>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Lote
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Línea
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Palma
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Estado
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Zona
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Latitud
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Longitud
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPalmas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666',
                      }}
                    >
                      No hay datos disponibles
                    </td>
                  </tr>
                ) : (
                  filteredPalmas.map((palma) => (
                    <tr
                      key={palma.id}
                      style={{ borderBottom: '1px solid #dee2e6' }}
                    >
                      <td style={{ padding: '12px' }}>{palma.id}</td>
                      <td style={{ padding: '12px' }}>{palma.lote || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>
                        {palma.linea || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {palma.palma || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          className={`status-badge ${palma.estado === 'ACTIVA' ? 'status-active' : 'status-inactive'}`}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                          }}
                        >
                          {palma.estado || 'DESCONOCIDO'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {palma.descarte || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {palma.latitud?.toFixed(5) || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {palma.longitud?.toFixed(5) || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
