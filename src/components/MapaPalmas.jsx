import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ============================================
// SOLUCIÓN PARA ICONOS DE LEAFLET EN VITE
// ============================================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ============================================
// COMPONENTE PARA CENTRAR EL MAPA
// ============================================
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// ============================================
// FUNCIÓN PARA CREAR ICONO DE PALMA PEQUEÑO
// ============================================
function createPalmIcon(estado) {
  const color = estado === 'ACTIVA' ? '#2ecc71' : '#e74c3c';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: 8px;
        height: 8px;
        font-size: 10px;
        line-height: 16px;
        text-align: center;
        background: ${color};
        border-radius: 50%;
        border: 1.5px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        cursor: pointer;
        color: white;
        font-weight: bold;
        transition: transform 0.1s;
      ">
        🌴
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

// ============================================
// COMPONENTE PRINCIPAL DEL MAPA
// ============================================
function MapaPalmas({ palmas }) {
  const center = [4.56, -72.77];
  const zoom = 12;

  // Si no hay palmas, mostrar mensaje
  if (!palmas || palmas.length === 0) {
    return (
      <div
        style={{
          height: '500px',
          width: '100%',
          borderRadius: '12px',
          background: '#f8f9fa',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <p style={{ fontSize: '18px', color: '#666' }}>
          🗺️ No hay datos para mostrar en el mapa
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          Carga datos desde el backend
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '500px',
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
        zoomControl={true}
        maxZoom={20}
        minZoom={8}
      >
        <ChangeView center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Renderizar TODAS las palmas con icono de palma pequeño */}
        {palmas.map((palma) => (
          <Marker
            key={palma.id}
            position={[palma.latitud, palma.longitud]}
            icon={createPalmIcon(palma.estado)}
          >
            <Popup>
              <div
                style={{ minWidth: '180px', fontFamily: 'Arial, sans-serif' }}
              >
                <h4
                  style={{
                    margin: '0 0 6px 0',
                    color: '#1a1a2e',
                    fontSize: '14px',
                  }}
                >
                  🌴 Palma #{palma.id}
                </h4>
                <hr style={{ margin: '4px 0' }} />
                <p style={{ margin: '2px 0', fontSize: '12px' }}>
                  <strong>Lote:</strong> {palma.lote || 'N/A'}
                </p>
                <p style={{ margin: '2px 0', fontSize: '12px' }}>
                  <strong>Línea:</strong> {palma.linea || 'N/A'}
                </p>
                <p style={{ margin: '2px 0', fontSize: '12px' }}>
                  <strong>Palma:</strong> {palma.palma || 'N/A'}
                </p>
                <p style={{ margin: '2px 0', fontSize: '12px' }}>
                  <strong>Estado:</strong>{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 8px',
                      borderRadius: '10px',
                      background:
                        palma.estado === 'ACTIVA' ? '#d4edda' : '#f8d7da',
                      color: palma.estado === 'ACTIVA' ? '#155724' : '#721c24',
                      fontWeight: 'bold',
                      fontSize: '11px',
                    }}
                  >
                    {palma.estado || 'DESCONOCIDO'}
                  </span>
                </p>
                <p style={{ margin: '2px 0', fontSize: '10px', color: '#999' }}>
                  📍 {palma.latitud?.toFixed(5)}, {palma.longitud?.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapaPalmas;


