import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Custom Map Panning Controller
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat && coords.lon) {
      map.setView([coords.lat, coords.lon], 12, { animate: true });
    }
  }, [coords, map]);
  return null;
}

// Custom Leaflet DivIcon with pulsating location pin
function createCustomPin(iconText = '📍') {
  return L.divIcon({
    className: 'custom-commute-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: #f97316;
        color: white;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);
        font-size: 18px;
      ">
        ${iconText}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
}

export default function CommuteMap({ location, weather }) {
  if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
    return null;
  }

  const { lat, lon, name } = location;
  const current = weather?.current;
  const customPin = createCustomPin(current?.icon || '🌦️');

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Interactive Commute Map
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Lat: {lat.toFixed(3)}, Lon: {lon.toFixed(3)}
        </span>
      </div>

      {/* Leaflet Map Container */}
      <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800 z-0">
        <MapContainer
          center={[lat, lon]}
          zoom={12}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <ChangeMapView coords={{ lat, lon }} />

          {/* OpenStreetMap Base Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />

          {/* User Location Marker Pin */}
          <Marker position={[lat, lon]} icon={customPin}>
            <Popup>
              <div className="p-1 space-y-1 text-slate-900">
                <strong className="block text-sm font-extrabold text-orange-600">
                  {name || 'Selected Location'}
                </strong>
                {current && (
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold capitalize">
                      {current.icon} {current.condition} • {Math.round(current.temperature)}°C
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Wind: {current.windSpeed} km/h • Humidity: {current.humidity}%
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
