import { useState } from "react";
import { Dumbbell, Clock, Flame, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOfflineWorkouts } from "@/hooks/useOfflineWorkouts";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

interface Workout {
  id: string;
  title: string;
  duration: string;
  calories: string;
  level: string;
  exercises: Exercise[];
}

const workouts: Workout[] = [
  {
    id: "1",
    title: "Full Body Express",
    duration: "20 min",
    calories: "180 kcal",
    level: "Iniciante",
    exercises: [
      { name: "Polichinelos", sets: 3, reps: "30s", rest: "15s" },
      { name: "Agachamento", sets: 3, reps: "15x", rest: "30s" },
      { name: "Flexão de braço", sets: 3, reps: "10x", rest: "30s" },
      { name: "Prancha", sets: 3, reps: "30s", rest: "20s" },
      { name: "Burpee", sets: 3, reps: "8x", rest: "30s" },
    ],
  },
  {
    id: "2",
    title: "Core & Abdômen",
    duration: "15 min",
    calories: "120 kcal",
    level: "Intermediário",
    exercises: [
      { name: "Abdominal crunch", sets: 3, reps: "20x", rest: "20s" },
      { name: "Prancha lateral", sets: 3, reps: "25s/lado", rest: "15s" },
      { name: "Bicicleta no chão", sets: 3, reps: "20x", rest: "20s" },
      { name: "Elevação de pernas", sets: 3, reps: "15x", rest: "20s" },
      { name: "Mountain climber", sets: 3, reps: "30s", rest: "20s" },
    ],
  },
  {
    id: "3",
    title: "Pernas & Glúteos",
    duration: "25 min",
    calories: "220 kcal",
    level: "Intermediário",
    exercises: [
      { name: "Agachamento sumô", sets: 4, reps: "15x", rest: "30s" },
      { name: "Avanço (lunge)", sets: 3, reps: "12x/perna", rest: "30s" },
      { name: "Ponte de glúteos", sets: 4, reps: "15x", rest: "20s" },
      { name: "Agachamento com salto", sets: 3, reps: "10x", rest: "30s" },
      { name: "Panturrilha em pé", sets: 3, reps: "20x", rest: "15s" },
    ],
  },
  {
    id: "4",
    title: "HIIT Cardio",
    duration: "18 min",
    calories: "250 kcal",
    level: "Avançado",
    exercises: [
      { name: "Burpee", sets: 4, reps: "45s", rest: "15s" },
      { name: "High knees", sets: 4, reps: "45s", rest: "15s" },
      { name: "Jump squat", sets: 4, reps: "45s", rest: "15s" },
      { name: "Mountain climber", sets: 4, reps: "45s", rest: "15s" },
      { name: "Polichinelos", sets: 4, reps: "45s", rest: "15s" },
    ],
  },
];

const levelColor: Record<string, string> = {
  Iniciante: "bg-accent/20 text-accent",
  Intermediário: "bg-warning/20 text-warning",
  Avançado: "bg-destructive/20 text-destructive",
};

const Workouts = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { completedIds, toggleWorkout } = useOfflineWorkouts();

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 max-w-lg mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Treinos em Casa</h1>
        <p className="text-sm text-muted-foreground mt-1">Escolha seu treino e comece agora</p>
      </div>

      {!navigator.onLine && (
        <div className="mb-4 px-3 py-2 bg-warning/20 text-warning rounded-lg text-xs text-center font-medium">
          📴 Modo offline — dados serão sincronizados quando a internet voltar
        </div>
      )}

      <div className="space-y-3">
        {workouts.map((w, i) => (
          <Card
            key={w.id}
            className="glass-card overflow-hidden animate-slide-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <button
              onClick={() => toggleExpand(w.id)}
              className="w-full p-4 flex items-center gap-3 text-left"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                completedIds.has(w.id) ? "bg-accent/20" : "gradient-fitness"
              }`}>
                {completedIds.has(w.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                ) : (
                  <Dumbbell className="w-5 h-5 text-accent-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${completedIds.has(w.id) ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {w.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {w.duration}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {w.calories}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColor[w.level]}`}>
                    {w.level}
                  </span>
                </div>
              </div>
              {expanded === w.id ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </button>

            {expanded === w.id && (
              <div className="px-4 pb-4 animate-fade-in">
                <div className="border-t border-border pt-3 space-y-2">
                  {w.exercises.map((ex, j) => (
                    <div key={j} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-foreground">{ex.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {ex.sets}x {ex.reps} · {ex.rest} descanso
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => toggleWorkout(w.id)}
                  className={`w-full mt-3 ${
                    completedIds.has(w.id) ? "bg-secondary text-secondary-foreground" : "gradient-fitness text-accent-foreground"
                  }`}
                  variant={completedIds.has(w.id) ? "secondary" : "default"}
                >
                  {completedIds.has(w.id) ? "Desmarcar" : "Marcar como concluído"}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Workouts;
