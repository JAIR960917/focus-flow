import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar, Route, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Run {
  id: string;
  distance_meters: number;
  duration_seconds: number;
  avg_pace: string | null;
  ran_at: string;
}

interface WorkoutCompletion {
  id: string;
  workout_id: string;
  completed_at: string;
}

const Evolution = () => {
  const { user } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [runsRes, workoutsRes] = await Promise.all([
        supabase
          .from("runs")
          .select("id, distance_meters, duration_seconds, avg_pace, ran_at")
          .eq("user_id", user.id)
          .order("ran_at", { ascending: true }),
        supabase
          .from("workout_completions")
          .select("id, workout_id, completed_at")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(20),
      ]);

      if (runsRes.data) setRuns(runsRes.data);
      if (workoutsRes.data) setWorkoutHistory(workoutsRes.data);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const chartData = runs.map((r) => ({
    date: format(new Date(r.ran_at), "dd/MM", { locale: ptBR }),
    distancia: +(r.distance_meters / 1000).toFixed(2),
  }));

  const totalDistance = runs.reduce((s, r) => s + r.distance_meters, 0) / 1000;
  const totalRuns = runs.length;
  const totalWorkouts = workoutHistory.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Minha Evolução</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe seu progresso</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up">
        <Card className="glass-card p-3 text-center">
          <Route className="w-4 h-4 mx-auto text-accent mb-1" />
          <p className="text-lg font-bold text-foreground">{totalDistance.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">km total</p>
        </Card>
        <Card className="glass-card p-3 text-center">
          <TrendingUp className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{totalRuns}</p>
          <p className="text-xs text-muted-foreground">corridas</p>
        </Card>
        <Card className="glass-card p-3 text-center">
          <Calendar className="w-4 h-4 mx-auto text-warning mb-1" />
          <p className="text-lg font-bold text-foreground">{totalWorkouts}</p>
          <p className="text-xs text-muted-foreground">treinos</p>
        </Card>
      </div>

      {/* Distance chart */}
      <Card className="glass-card p-4 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="font-semibold text-foreground mb-4">Distância por Corrida</h2>
        {chartData.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} unit=" km" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="distancia"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  name="Distância (km)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma corrida registrada ainda. Comece a correr para ver sua evolução!
          </p>
        )}
      </Card>

      {/* Workout history */}
      <Card className="glass-card p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="font-semibold text-foreground mb-3">Últimos Treinos Concluídos</h2>
        {workoutHistory.length > 0 ? (
          <div className="space-y-2">
            {workoutHistory.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-foreground">Treino #{w.workout_id.slice(0, 8)}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(w.completed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum treino concluído ainda.
          </p>
        )}
      </Card>
    </div>
  );
};

export default Evolution;
