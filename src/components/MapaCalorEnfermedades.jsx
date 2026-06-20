// frontend/src/components/MapaCalorEnfermedades.jsx
import { API_URL } from '../config';
import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Configuración de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Icono pequeño para TODAS las palmas (punto verde)
function createPalmIcon() {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: 5px;
        height: 5px;
        background: #2ecc71;
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.5);
        box-shadow: 0 0 4px rgba(0,0,0,0.2);
        cursor: default;
      "></div>
    `,
    iconSize: [5, 5],
    iconAnchor: [2.5, 2.5],
  });
}

// Icono para palmas con enfermedades
function createEnfermedadIcon(severidad) {
  let color = '#e74c3c';
  let size = 32;

  if (severidad === 'Crítica') {
    color = '#c0392b';
    size = 38;
  } else if (severidad === 'Alta') {
    color = '#e67e22';
    size = 34;
  } else if (severidad === 'Media') {
    color = '#f1c40f';
    size = 30;
  } else {
    color = '#2ecc71';
    size = 28;
  }

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        font-size: ${size * 0.5}px;
        line-height: ${size}px;
        text-align: center;
        background: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        color: white;
        font-weight: bold;
      ">
        🌴
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function MapaCalorEnfermedades() {
  const [palmas, setPalmas] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarPalmas, setMostrarPalmas] = useState(true);
  const center = [4.56, -72.77];
  const zoom = 12;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      // 🔴 CORRECCIÓN AQUÍ: Usar backticks (`) en lugar de comillas simples (')
      const palmasUrl = `${API_URL}/api/palmas`;
      const enfermedadesUrl = `${API_URL}/api/enfermedades/with-palma`;

      console.log('🌐 Conectando a palmas:', palmasUrl);
      console.log('🌐 Conectando a enfermedades:', enfermedadesUrl);

      const [palmasRes, enfermedadesRes] = await Promise.all([
        axios.get(palmasUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(enfermedadesUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log('🌴 Palmas:', palmasRes.data?.data?.length || 0);
      console.log('🦠 Enfermedades:', enfermedadesRes.data?.data?.length || 0);

      setPalmas(palmasRes.data?.data || []);
      setEnfermedades(enfermedadesRes.data?.data || []);
    } catch (error) {
      console.error('❌ Error detallado:', error);
      console.error('❌ URL que falló:', error.config?.url);

      if (error.response?.status === 401) {
        setError('🔒 Sesión expirada. Por favor inicia sesión nuevamente.');
      } else if (error.response?.status === 404) {
        setError(`📡 Endpoint no encontrado: ${error.config?.url}`);
      } else {
        setError(`❌ Error al cargar los datos: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Crear datos para el heatmap (círculos difuminados)
  const heatmapData = enfermedades.reduce((acc, item) => {
    if (!item.latitud || !item.longitud) return acc;

    const key = `${item.latitud},${item.longitud}`;
    if (acc[key]) {
      acc[key].concentracion += 1;
      acc[key].enfermedades.push(item.enfermedad);
      acc[key].items.push(item);
    } else {
      acc[key] = {
        latitud: item.latitud,
        longitud: item.longitud,
        concentracion: 1,
        enfermedades: [item.enfermedad],
        items: [item],
      };
    }
    return acc;
  }, {});

  const heatmapPoints = Object.values(heatmapData);

  if (loading) {
    return (
      <div
        style={{
          height: '550px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f8f9fa',
          borderRadius: '12px',
        }}
      >
        <div>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '10px' }}>Cargando mapa de calor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: '550px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <p style={{ color: 'red', textAlign: 'center', maxWidth: '500px' }}>
          ❌ {error}
        </p>
        <button
          onClick={fetchData}
          style={{
            padding: '10px 20px',
            marginTop: '10px',
            cursor: 'pointer',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          🔄 Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Controles */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '15px',
          padding: '15px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <div>
          <span style={{ fontWeight: 'bold', marginRight: '15px' }}>
            📊 Estadísticas:
          </span>
          <span style={{ marginRight: '15px', color: '#2ecc71' }}>
            🌴 {palmas.length} palmas
          </span>
          <span style={{ marginRight: '15px', color: '#e74c3c' }}>
            🦠 {enfermedades.length} reportes
          </span>
          <span style={{ color: '#f39c12' }}>
            🔥 {heatmapPoints.length} focos
          </span>
        </div>
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={mostrarPalmas}
              onChange={() => setMostrarPalmas(!mostrarPalmas)}
            />
            <span style={{ fontSize: '13px' }}>Mostrar todas las palmas</span>
          </label>
        </div>
      </div>

      <div
        style={{
          height: '550px',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <ChangeView center={center} zoom={zoom} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* TODAS LAS PALMAS (puntos verdes pequeños) */}
          {mostrarPalmas &&
            palmas.map((palma) => {
              if (!palma.latitud || !palma.longitud) return null;
              return (
                <Marker
                  key={`p-${palma.id}`}
                  position={[
                    parseFloat(palma.latitud),
                    parseFloat(palma.longitud),
                  ]}
                  icon={createPalmIcon()}
                  interactive={false}
                />
              );
            })}

          {/* Círculos de calor difuminados (enfermedades) */}
          {heatmapPoints.map((point, index) => {
            const lat = parseFloat(point.latitud) || 0;
            const lng = parseFloat(point.longitud) || 0;
            if (lat === 0 || lng === 0) return null;

            const radius = 40 + point.concentracion * 25;
            const opacity = Math.min(0.3 + point.concentracion * 0.15, 0.85);

            let color;
            if (point.concentracion <= 2)
              color = `rgba(46, 204, 113, ${opacity})`;
            else if (point.concentracion <= 4)
              color = `rgba(241, 196, 15, ${opacity})`;
            else if (point.concentracion <= 6)
              color = `rgba(230, 126, 34, ${opacity})`;
            else color = `rgba(231, 76, 60, ${opacity})`;

            return (
              <Circle
                key={`heat-${index}`}
                center={[lat, lng]}
                radius={radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: opacity,
                  weight: 0,
                  opacity: 0,
                }}
              />
            );
          })}

          {/* Marcadores de enfermedades (con popup) */}
          {enfermedades.map((item, index) => {
            const lat = parseFloat(item.latitud) || 0;
            const lng = parseFloat(item.longitud) || 0;
            if (lat === 0 || lng === 0) return null;

            return (
              <Marker
                key={`e-${item.id || index}`}
                position={[lat, lng]}
                icon={createEnfermedadIcon(item.severidad)}
              >
                <Popup>
                  <div
                    style={{
                      minWidth: '280px',
                      fontFamily: 'Arial, sans-serif',
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px 0', color: '#e74c3c' }}>
                      🦠 {item.enfermedad || 'Sin nombre'}
                    </h3>
                    <hr style={{ margin: '8px 0' }} />

                    <div style={{ marginBottom: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 'bold', color: '#555' }}>
                          🌴 Palma:
                        </span>
                        <span>#{item.palma_id}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 'bold', color: '#555' }}>
                          📦 Lote:
                        </span>
                        <span>{item.lote || 'N/A'}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 'bold', color: '#555' }}>
                          📏 Línea:
                        </span>
                        <span>{item.linea || 'N/A'}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 'bold', color: '#555' }}>
                          📊 Estado:
                        </span>
                        <span>{item.estado || 'N/A'}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 'bold', color: '#555' }}>
                          📍 Zona:
                        </span>
                        <span>{item.descarte || 'N/A'}</span>
                      </div>
                    </div>

                    <hr style={{ margin: '8px 0' }} />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 'bold', color: '#555' }}>
                        📅 Fecha:
                      </span>
                      <span>
                        {item.fecha_deteccion
                          ? new Date(item.fecha_deteccion).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 'bold', color: '#555' }}>
                        ⚡ Severidad:
                      </span>
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: '12px',
                          background:
                            item.severidad === 'Crítica'
                              ? '#c0392b'
                              : item.severidad === 'Alta'
                                ? '#e67e22'
                                : item.severidad === 'Media'
                                  ? '#f1c40f'
                                  : '#2ecc71',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '12px',
                        }}
                      >
                        {item.severidad || 'Media'}
                      </span>
                    </div>
                    {item.observaciones && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px',
                          background: '#f8f9fa',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      >
                        <strong style={{ color: '#555' }}>
                          📝 Observaciones:
                        </strong>
                        <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                          {item.observaciones}
                        </p>
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        color: '#999',
                      }}
                    >
                      📍 {lat.toFixed(5)}, {lng.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Leyenda */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          marginTop: '10px',
          padding: '10px 20px',
          background: 'white',
          borderRadius: '8px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              background: '#2ecc71',
              borderRadius: '50%',
            }}
          ></div>
          <span style={{ fontSize: '13px' }}>Palmas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#c0392b',
              borderRadius: '50%',
            }}
          ></div>
          <span>Crítica</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#e67e22',
              borderRadius: '50%',
            }}
          ></div>
          <span>Alta</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#f1c40f',
              borderRadius: '50%',
            }}
          ></div>
          <span>Media</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#2ecc71',
              borderRadius: '50%',
            }}
          ></div>
          <span>Baja</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginLeft: '15px',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '12px',
              background:
                'linear-gradient(to right, #2ecc71, #f1c40f, #e67e22, #e74c3c)',
              borderRadius: '4px',
            }}
          ></div>
          <span style={{ fontSize: '12px', color: '#666' }}>
            Concentración →
          </span>
        </div>
      </div>
    </div>
  );
}

export default MapaCalorEnfermedades;
