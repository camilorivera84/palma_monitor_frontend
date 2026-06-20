import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function AdminPlagas() {
  const [plagas, setPlagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    daños: '',
    control: '',
    ciclo_vida: '',
    tipo: 'Insecto',
  });
  const [editando, setEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPlagas();
  }, []);

  const fetchPlagas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/catalogo/plagas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlagas(response.data.data || []);
    } catch (error) {
      setError('Error al cargar las plagas');
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
        ? `${API_URL}/api/catalogo/plagas/${editando}`
        : `${API_URL}/api/catalogo/plagas`;

      const method = editando ? 'put' : 'post';
      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensaje(
        editando
          ? '✅ Plaga actualizada correctamente'
          : '✅ Plaga creada correctamente',
      );
      setShowForm(false);
      setEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        daños: '',
        control: '',
        ciclo_vida: '',
        tipo: 'Insecto',
      });
      fetchPlagas();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar la plaga');
    }
  };

  const handleEdit = (plaga) => {
    setFormData({
      nombre: plaga.nombre,
      descripcion: plaga.descripcion || '',
      daños: plaga.daños || '',
      control: plaga.control || '',
      ciclo_vida: plaga.ciclo_vida || '',
      tipo: plaga.tipo || 'Insecto',
    });
    setEditando(plaga.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta plaga?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/catalogo/plagas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje('✅ Plaga eliminada correctamente');
      fetchPlagas();
    } catch (error) {
      setError('Error al eliminar la plaga');
    }
  };

  const tipos = [
    'Insecto',
    'Ácaro',
    'Nematodo',
    'Roedor',
    'Ave',
    'Hongos',
    'Bacteria',
    'Virus',
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
          <h1>📋 Administrar Plagas</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditando(null);
              setFormData({
                nombre: '',
                descripcion: '',
                daños: '',
                control: '',
                ciclo_vida: '',
                tipo: 'Insecto',
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
            {showForm ? '❌ Cancelar' : '➕ Nueva Plaga'}
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
          <h3>{editando ? '✏️ Editar Plaga' : '➕ Nueva Plaga'}</h3>
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
                Daños que Causa
              </label>
              <textarea
                name="daños"
                value={formData.daños}
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
                Métodos de Control
              </label>
              <textarea
                name="control"
                value={formData.control}
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
                Ciclo de Vida
              </label>
              <textarea
                name="ciclo_vida"
                value={formData.ciclo_vida}
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
          📋 Lista de Plagas ({plagas.length})
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
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {plagas.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#666',
                    }}
                  >
                    No hay plagas registradas
                  </td>
                </tr>
              ) : (
                plagas.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{p.id}</td>
                    <td style={{ padding: '12px' }}>
                      <strong>{p.nombre}</strong>
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
                        {p.tipo || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEdit(p)}
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
                        onClick={() => handleDelete(p.id)}
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

export default AdminPlagas;
