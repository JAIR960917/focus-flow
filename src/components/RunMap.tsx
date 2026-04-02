import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/pages/Running";

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const startIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapUpdater({ points }: { points: GeoPoint[] }) {
  const map = useMap();
  const hasSetView = useRef(false);

  useEffect(() => {
    if (points.length === 0) {
      hasSetView.current = false;
      return;
    }
    const last = points[points.length - 1];
    if (!hasSetView.current) {
      map.setView([last.lat, last.lng], 16);
      hasSetView.current = true;
    } else {
      map.panTo([last.lat, last.lng]);
    }
  }, [points, map]);

  return null;
}

interface RunMapProps {
  points: GeoPoint[];
  isRunning: boolean;
}

const RunMap = ({ points, isRunning }: RunMapProps) => {
  const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <MapContainer
      center={[-23.55, -46.63]}
      zoom={14}
      className="h-full w-full z-0"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapUpdater points={points} />

      {latLngs.length > 1 && (
        <Polyline
          positions={latLngs}
          pathOptions={{
            color: isRunning ? "#22c55e" : "#3b82f6",
            weight: 4,
            opacity: 0.9,
            dashArray: isRunning ? undefined : "8 6",
          }}
        />
      )}

      {points.length > 0 && (
        <Marker position={[points[0].lat, points[0].lng]} icon={startIcon} />
      )}
      {points.length > 1 && !isRunning && (
        <Marker position={[points[points.length - 1].lat, points[points.length - 1].lng]} icon={startIcon} />
      )}
    </MapContainer>
  );
};

export default RunMap;
