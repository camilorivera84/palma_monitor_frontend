import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import MapaCalorPlagas from '../components/MapaCalorPlagas';

const ESTADOS_BIOLOGICOS = [
  'Huevo',
  'Larva',
  'Pupa',
  'Adulto',
  'Ninfa',
  'Obrera',
  'Reina',
];
const NIVELES_INFESTACION = ['Bajo', 'Medio', 'Alto', 'Crítico'];

function Plagas() {
  const [palmas, setPalmas] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [stats, setStats] = useState([]);
  const [catalogoPlagas, setCatalogoPlagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    lote: '',
    linea: '',
    palma_id: '',
    plaga: '',
    fecha_deteccion: new Date().toISOString().split('T')[0],
    nivel_infestacion: 'Medio',
    estado_biologico: 'Adulto',
    observaciones: '',
    latitud: '',
    longitud: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('formulario');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [palmasRes, registrosRes, statsRes, catalogoRes] =
        await Promise.all([
          axios.get(`${API_URL}/api/palmas`, { headers }),
          axios.get(`${API_URL}/api/plagas`, { headers }),
          axios.get(`${API_URL}/api/plagas/stats`, { headers }),
          axios.get(`${API_URL}/api/catalogo/plagas`),
        ]);

      setPalmas(palmasRes.data.data || []);
      setRegistros(registrosRes.data.data || []);
      setStats(statsRes.data.data || []);
      setCatalogoPlagas(catalogoRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const lotesUnicos = [
    ...new Set(palmas.map((p) => String(p.lote || '').trim()).filter(Boolean)),
  ];
  const lineasUnicas = [
    ...new Set(
      palmas
        .filter(
          (p) =>
            !formData.lote ||
            String(p.lote || '').trim() === String(formData.lote).trim(),
        )
        .map((p) => String(p.linea || '').trim())
        .filter(Boolean),
    ),
  ];
  const palmasFiltradas = palmas.filter((p) => {
    const pLote = String(p.lote || '').trim();
    const pLinea = String(p.linea || '').trim();
    const fLote = String(formData.lote || '').trim();
    const fLinea = String(formData.linea || '').trim();
    if (fLote && pLote !== fLote) return false;
    if (fLinea && pLinea !== fLinea) return false;
    return true;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lote' || name === 'linea') {
      setFormData((prev) => ({ ...prev, [name]: value, palma_id: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (name === 'palma_id' && value) {
      const palma = palmas.find((p) => p.id === parseInt(value));
      if (palma) {
        setFormData((prev) => ({
          ...prev,
          latitud: palma.latitud || '',
          longitud: palma.longitud || '',
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (!formData.palma_id) {
      setError('❌ Selecciona una palma');
      return;
    }
    if (!formData.plaga) {
      setError('❌ Selecciona una plaga');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        palma_id: parseInt(formData.palma_id),
        plaga: formData.plaga,
        fecha_deteccion: formData.fecha_deteccion,
        nivel_infestacion: formData.nivel_infestacion,
        estado_biologico: formData.estado_biologico,
        observaciones: formData.observaciones
          ? `Reportado por: ${user?.username || 'Anónimo'}\n${formData.observaciones}`
          : `Reportado por: ${user?.username || 'Anónimo'}`,
        latitud: formData.latitud,
        longitud: formData.longitud,
      };

      const response = await axios.post(`${API_URL}/api/plagas`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setMensaje('✅ ' + response.data.message);
      setFormData({
        lote: '',
        linea: '',
        palma_id: '',
        plaga: '',
        fecha_deteccion: new Date().toISOString().split('T')[0],
        nivel_infestacion: 'Medio',
        estado_biologico: 'Adulto',
        observaciones: '',
        latitud: '',
        longitud: '',
      });
      fetchData();
    } catch (error) {
      setError(
        '❌ ' +
          (error.response?.data?.message ||
            error.message ||
            'Error al registrar'),
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Cargando...</h2>
      </div>
    );
  }

  const btnActive = {
    padding: '8px 20px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  };
  const btnInactive = {
    padding: '8px 20px',
    background: '#e9ecef',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  };

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
          <h1>🐛 Monitoreo de Plagas</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setViewMode('formulario')}
              style={viewMode === 'formulario' ? btnActive : btnInactive}
            >
              📝 Registrar
            </button>
            <button
              onClick={() => setViewMode('mapa')}
              style={viewMode === 'mapa' ? btnActive : btnInactive}
            >
              🗺️ Mapa de Calor
            </button>
            <button
              onClick={() => setViewMode('registros')}
              style={viewMode === 'registros' ? btnActive : btnInactive}
            >
              📋 Registros
            </button>
          </div>
        </div>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
          👤 Usuario: <strong>{user?.username || 'No autenticado'}</strong>
        </p>
        <p style={{ color: '#999', fontSize: '12px' }}>
          📚 Catálogo: {catalogoPlagas.length} plagas disponibles
        </p>
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

      {viewMode === 'formulario' && (
        <div
          style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <h3>📝 Registrar Nueva Plaga</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            👤 Reportado por: <strong>{user?.username || 'Anónimo'}</strong>
          </p>
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
                Lote *
              </label>
              <select
                name="lote"
                value={formData.lote}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              >
                <option value="">Seleccionar lote</option>
                {lotesUnicos.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Línea *
              </label>
              <select
                name="linea"
                value={formData.linea}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
                disabled={!formData.lote}
              >
                <option value="">
                  {formData.lote
                    ? 'Seleccionar línea'
                    : 'Primero selecciona un lote'}
                </option>
                {lineasUnicas.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Palma *
              </label>
              <select
                name="palma_id"
                value={formData.palma_id}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
                disabled={!formData.linea}
              >
                <option value="">
                  {formData.linea
                    ? 'Seleccionar palma'
                    : 'Primero selecciona una línea'}
                </option>
                {palmasFiltradas.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.palma || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Plaga *
              </label>
              <select
                name="plaga"
                value={formData.plaga}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              >
                <option value="">Seleccionar plaga</option>
                {catalogoPlagas.map((p) => (
                  <option key={p.id} value={p.nombre}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Fecha de Detección
              </label>
              <input
                type="date"
                name="fecha_deteccion"
                value={formData.fecha_deteccion}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
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
                Nivel de Infestación
              </label>
              <select
                name="nivel_infestacion"
                value={formData.nivel_infestacion}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              >
                {NIVELES_INFESTACION.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Estado Biológico
              </label>
              <select
                name="estado_biologico"
                value={formData.estado_biologico}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              >
                {ESTADOS_BIOLOGICOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  resize: 'vertical',
                }}
                placeholder="Descripción adicional..."
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
                Latitud
              </label>
              <input
                type="number"
                step="any"
                name="latitud"
                value={formData.latitud}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
                readOnly
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
                Longitud
              </label>
              <input
                type="number"
                step="any"
                name="longitud"
                value={formData.longitud}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
                readOnly
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 30px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                }}
              >
                💾 Registrar Plaga
              </button>
            </div>
          </form>
        </div>
      )}

      {viewMode === 'mapa' && <MapaCalorPlagas />}

      {viewMode === 'registros' && (
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
            📋 Registros de Plagas ({registros.length})
          </div>
          <div
            style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}
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
                    Palma
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Plaga
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Fecha
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Infestación
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Estado Biológico
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                    }}
                  >
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {registros.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666',
                      }}
                    >
                      No hay registros
                    </td>
                  </tr>
                ) : (
                  registros.map((r) => {
                    let observaciones = r.observaciones || '';
                    if (observaciones.includes('Reportado por:')) {
                      const partes = observaciones.split('\n');
                      observaciones = partes
                        .filter((p) => !p.includes('Reportado por:'))
                        .join('\n');
                    }
                    const nivelColors = {
                      Bajo: '#28a745',
                      Medio: '#ffc107',
                      Alto: '#fd7e14',
                      Crítico: '#dc3545',
                    };
                    return (
                      <tr
                        key={r.id}
                        style={{ borderBottom: '1px solid #dee2e6' }}
                      >
                        <td style={{ padding: '12px' }}>{r.id}</td>
                        <td style={{ padding: '12px' }}>#{r.palma_id}</td>
                        <td style={{ padding: '12px' }}>
                          <strong>{r.plaga}</strong>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {new Date(r.fecha_deteccion).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              padding: '2px 10px',
                              borderRadius: '12px',
                              background:
                                nivelColors[r.nivel_infestacion] || '#6c757d',
                              color: 'white',
                              fontSize: '12px',
                            }}
                          >
                            {r.nivel_infestacion}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              padding: '2px 10px',
                              borderRadius: '12px',
                              background: '#e9ecef',
                              fontSize: '12px',
                            }}
                          >
                            {r.estado_biologico || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {observaciones || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plagas;
