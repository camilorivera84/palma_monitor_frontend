import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function AdminEnfermedades() {
  const [enfermedades, setEnfermedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    sintomas: '',
    tratamiento: '',
    agente_causal: '',
    tipo: 'Fúngica',
  });
  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEnfermedades();
  }, []);

  const fetchEnfermedades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/catalogo/enfermedades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnfermedades(response.data.data || []);
    } catch (error) {
      setError('Error al cargar las enfermedades');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const token = localStorage.getItem('token');
      const url = editando
        ? `${API_URL}/api/catalogo/enfermedades/${editando}`
        : `${API_URL}/api/catalogo/enfermedades`;

      const method = editando ? 'put' : 'post';
      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensaje(
        editando
          ? '✅ Enfermedad actualizada correctamente'
          : '✅ Enfermedad creada correctamente',
      );
      setShowForm(false);
      setEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        sintomas: '',
        tratamiento: '',
        agente_causal: '',
        tipo: 'Fúngica',
      });
      fetchEnfermedades();
    } catch (error) {
      setError(
        error.response?.data?.message || 'Error al guardar la enfermedad',
      );
    }
  };

  const handleEdit = (enfermedad) => {
    setFormData({
      nombre: enfermedad.nombre,
      descripcion: enfermedad.descripcion || '',
      sintomas: enfermedad.sintomas || '',
      tratamiento: enfermedad.tratamiento || '',
      agente_causal: enfermedad.agente_causal || '',
      tipo: enfermedad.tipo || 'Fúngica',
    });
    setEditando(enfermedad.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta enfermedad?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/catalogo/enfermedades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje('✅ Enfermedad eliminada correctamente');
      fetchEnfermedades();
    } catch (error) {
      setError('Error al eliminar la enfermedad');
    }
  };

  const tipos = [
    'Fúngica',
    'Bacteriana',
    'Viral',
    'Fisiológica',
    'Parasitaria',
    'Otra',
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Cargando...</h2>
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
          <h1>📋 Administrar Enfermedades</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditando(null);
              setFormData({
                nombre: '',
                descripcion: '',
                sintomas: '',
                tratamiento: '',
                agente_causal: '',
                tipo: 'Fúngica',
              });
            }}
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {showForm ? '❌ Cancelar' : '➕ Nueva Enfermedad'}
          </button>
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
          <h3>{editando ? '✏️ Editar Enfermedad' : '➕ Nueva Enfermedad'}</h3>
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
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
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
                Tipo
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              >
                {tipos.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="2"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Síntomas
              </label>
              <textarea
                name="sintomas"
                value={formData.sintomas}
                onChange={handleChange}
                rows="2"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Tratamiento
              </label>
              <textarea
                name="tratamiento"
                value={formData.tratamiento}
                onChange={handleChange}
                rows="2"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}
              >
                Agente Causal
              </label>
              <input
                type="text"
                name="agente_causal"
                value={formData.agente_causal}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
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
                }}
              >
                {editando ? '💾 Actualizar' : '💾 Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

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
          style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '16px' }}
        >
          📋 Lista de Enfermedades ({enfermedades.length})
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            className="table"
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead style={{ background: '#f8f9fa' }}>
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
                  Nombre
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #dee2e6',
                  }}
                >
                  Tipo
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #dee2e6',
                  }}
                >
                  Agente Causal
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #dee2e6',
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {enfermedades.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#666',
                    }}
                  >
                    No hay enfermedades registradas
                  </td>
                </tr>
              ) : (
                enfermedades.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{e.id}</td>
                    <td style={{ padding: '12px' }}>
                      <strong>{e.nombre}</strong>
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
                        {e.tipo || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {e.agente_causal || '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEdit(e)}
                        style={{
                          padding: '5px 15px',
                          background: '#ffc107',
                          color: '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '5px',
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        style={{
                          padding: '5px 15px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️
                      </button>
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

export default AdminEnfermedades;
