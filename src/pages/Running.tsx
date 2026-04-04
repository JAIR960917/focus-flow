import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Square, MapPin, Clock, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RunMap from "@/components/RunMap";
import { useRunningSupabase } from "@/hooks/useRunningSupabase";

export interface GeoPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function calcDistance(points: GeoPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const R = 6371e3;
    const lat1 = (points[i - 1].lat * Math.PI) / 180;
    const lat2 = (points[i].lat * Math.PI) / 180;
    const dLat = lat2 - lat1;
    const dLng = ((points[i].lng - points[i - 1].lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return total;
}

const Running = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [initialPos, setInitialPos] = useState<GeoPoint | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { saveSession } = useOfflineRunning();

  // Capture initial position on page load
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setInitialPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
        });
      },
      () => {
        // silently fail — user will see error when starting
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const startRun = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada pelo navegador.");
      return;
    }
    setError(null);
    setPoints([]);
    setElapsed(0);
    setHasFinished(false);
    setIsRunning(true);

    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPoints((prev) => [
          ...prev,
          { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: Date.now() },
        ]);
      },
      (err) => setError(`Erro GPS: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  }, []);

  const stopRun = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setHasFinished(true);
  }, []);

  useEffect(() => {
    if (hasFinished && points.length > 1) {
      const distance = calcDistance(points);
      const pace = distance > 0 && elapsed > 0
        ? formatTime(Math.round(elapsed / (distance / 1000)))
        : "--:--";
      saveSession({
        distance_meters: distance,
        duration_seconds: elapsed,
        avg_pace: pace,
        gps_points: points,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFinished]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Use initial position as the first map point when no run points exist
  const mapPoints = points.length > 0 ? points : initialPos ? [initialPos] : [];

  const distance = calcDistance(points);
  const distanceKm = (distance / 1000).toFixed(2);
  const pace =
    distance > 0 && elapsed > 0
      ? formatTime(Math.round(elapsed / (distance / 1000)))
      : "--:--";

  return (
    <div className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Corrida</h1>
        <p className="text-sm text-muted-foreground mt-1">Rastreie sua corrida em tempo real</p>
      </div>

      {!navigator.onLine && (
        <div className="mb-4 px-3 py-2 bg-warning/20 text-warning rounded-lg text-xs text-center font-medium">
          📴 Modo offline — dados serão sincronizados quando a internet voltar
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 animate-slide-up">
        <Card className="glass-card p-3 text-center">
          <Route className="w-4 h-4 mx-auto text-accent mb-1" />
          <p className="text-lg font-bold text-foreground">{distanceKm}</p>
          <p className="text-xs text-muted-foreground">km</p>
        </Card>
        <Card className="glass-card p-3 text-center">
          <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{formatTime(elapsed)}</p>
          <p className="text-xs text-muted-foreground">tempo</p>
        </Card>
        <Card className="glass-card p-3 text-center">
          <MapPin className="w-4 h-4 mx-auto text-warning mb-1" />
          <p className="text-lg font-bold text-foreground">{pace}</p>
          <p className="text-xs text-muted-foreground">min/km</p>
        </Card>
      </div>

      {/* Map */}
      <Card className="glass-card overflow-hidden mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="h-[300px] sm:h-[400px] relative">
          <RunMap points={mapPoints} isRunning={isRunning} />
        </div>
      </Card>

      {error && (
        <p className="text-destructive text-sm text-center mb-4">{error}</p>
      )}

      {/* Control */}
      <div className="flex justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
        {!isRunning ? (
          <Button
            onClick={startRun}
            size="lg"
            className="gradient-fitness text-accent-foreground px-10 py-6 text-base font-semibold rounded-2xl shadow-lg gap-2"
          >
            <Play className="w-5 h-5" />
            {hasFinished ? "Nova Corrida" : "Iniciar"}
          </Button>
        ) : (
          <Button
            onClick={stopRun}
            size="lg"
            variant="destructive"
            className="px-10 py-6 text-base font-semibold rounded-2xl shadow-lg gap-2"
          >
            <Square className="w-5 h-5" />
            Parar
          </Button>
        )}
      </div>

      {hasFinished && points.length > 1 && (
        <Card className="glass-card p-4 mt-6 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-2">Resumo da Corrida</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distância</span>
              <span className="font-medium text-foreground">{distanceKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tempo total</span>
              <span className="font-medium text-foreground">{formatTime(elapsed)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ritmo médio</span>
              <span className="font-medium text-foreground">{pace} min/km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pontos GPS</span>
              <span className="font-medium text-foreground">{points.length}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            ✅ Sessão salva {navigator.onLine ? "e sincronizada" : "localmente — será sincronizada quando online"}
          </p>
        </Card>
      )}
    </div>
  );
};

export default Running;
