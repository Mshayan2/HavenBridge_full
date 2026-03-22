import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { toAssetUrl } from "../utils/url";

// Fix default marker icons in Vite builds
// (Leaflet's default icon URLs don't resolve correctly without this)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function BoundsListener({ onBoundsChange }) {
  const timeoutRef = useRef(null);

  useMapEvents({
    moveend: (ev) => {
      const map = ev.target;
      const b = map.getBounds();
      const minLat = b.getSouthWest().lat;
      const minLng = b.getSouthWest().lng;
      const maxLat = b.getNorthEast().lat;
      const maxLng = b.getNorthEast().lng;

      // debounce to avoid rapid URL updates
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onBoundsChange?.({ minLat, minLng, maxLat, maxLng });
      }, 250);
    },
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return null;
}

export default function PropertyMap({
  properties = [],
  onBoundsChange,
  initialCenter = [31.5204, 74.3587],
  initialZoom = 11,
  className,
}) {
  const navigate = useNavigate();

  const markers = useMemo(() => {
    return (properties || [])
      .map((p) => {
        const coords = p?.geo?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) return null;
        const [lng, lat] = coords;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { p, lat, lng };
      })
      .filter(Boolean);
  }, [properties]);

  return (
    <div className={`w-full rounded-xl overflow-hidden shadow bg-gray-100 ${className || "h-[70vh]"}`}>
      <MapContainer center={initialCenter} zoom={initialZoom} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BoundsListener onBoundsChange={onBoundsChange} />

        {markers.map(({ p, lat, lng }) => (
          <Marker key={p._id} position={[lat, lng]}>
            <Popup>
              <div className="w-56">
                <div className="font-semibold text-gray-900">{p.title}</div>
                <div className="text-xs text-gray-600">{p.location}</div>
                {p.images?.[0] ? (
                  <img
                    alt={p.title}
                    src={toAssetUrl(p.images[0])}
                    className="mt-2 w-full h-24 object-cover rounded"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.dataset._hadError) return;
                      img.dataset._hadError = "1";
                      img.onerror = null;
                      img.src = "/vite.svg";
                    }}
                  />
                ) : null}
                <div className="mt-2 font-semibold text-teal-700">PKR {p.price?.toLocaleString?.() || p.price}</div>
                <button
                  type="button"
                  className="mt-2 w-full bg-teal-600 text-white px-3 py-2 rounded"
                  onClick={() => navigate(`/properties/${p._id}`)}
                >
                  View
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
