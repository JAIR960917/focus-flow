import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dumbbell, Clock, Flame, ChevronDown, ChevronUp, CheckCircle2,
  Play, Pause, SkipForward, RotateCcw, Volume2, Edit2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

// --- Web Audio beep ---
function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // ignore
  }
}

// --- Active Workout Component ---
interface ActiveWorkoutProps {
  workout: Workout;
  onFinish: () => void;
  defaultRest: number;
}

const ActiveWorkout = ({ workout, onFinish, defaultRest }: ActiveWorkoutProps) => {
  const [exIdx, setExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<"idle" | "active" | "resting">("idle");
  const [restTime, setRestTime] = useState(defaultRest);
  const [restRemaining, setRestRemaining] = useState(0);
  const [editingRest, setEditingRest] = useState(false);
  const [tempRest, setTempRest] = useState(String(defaultRest));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exercise = workout.exercises[exIdx];
  const totalExercises = workout.exercises.length;
  const isLastSet = currentSet >= exercise.sets;
  const isLastExercise = exIdx >= totalExercises - 1;

  // Rest countdown
  useEffect(() => {
    if (phase !== "resting") return;
    setRestRemaining(restTime);
    timerRef.current = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          playBeep();
          // Auto-advance
          if (isLastSet) {
            if (isLastExercise) {
              onFinish();
            } else {
              setExIdx((i) => i + 1);
              setCurrentSet(1);
            }
          } else {
            setCurrentSet((s) => s + 1);
          }
          setPhase("idle");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, restTime]);

  const handleStart = () => setPhase("active");

  const handlePause = () => {
    // Finish current set → start rest
    setPhase("resting");
  };

  const handleCompleteSet = () => {
    if (isLastSet && isLastExercise) {
      onFinish();
      return;
    }
    if (isLastSet) {
      // Move to next exercise
      setExIdx((i) => i + 1);
      setCurrentSet(1);
      setPhase("idle");
    } else {
      // Start rest
      setPhase("resting");
    }
  };

  const handleSkip = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (isLastSet && isLastExercise) {
      onFinish();
      return;
    }
    if (isLastSet) {
      setExIdx((i) => i + 1);
      setCurrentSet(1);
    } else {
      setCurrentSet((s) => s + 1);
    }
    setPhase("idle");
  };

  const saveRest = () => {
    const val = parseInt(tempRest);
    if (!isNaN(val) && val > 0) setRestTime(val);
    setEditingRest(false);
  };

  const overallProgress = ((exIdx * exercise.sets + (currentSet - 1)) /
    workout.exercises.reduce((sum, e) => sum + e.sets, 0)) * 100;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Exercício {exIdx + 1}/{totalExercises}</span>
          <span>{Math.round(overallProgress)}% concluído</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Current exercise */}
      <Card className="glass-card p-4 sm:p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl gradient-fitness flex items-center justify-center mx-auto">
            <Dumbbell className="w-6 h-6 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{exercise.name}</h2>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{exercise.reps}</span>
            <span>·</span>
            <span className="font-semibold text-primary">
              Série {currentSet}/{exercise.sets}
            </span>
          </div>
        </div>

        {/* Rest phase */}
        {phase === "resting" && (
          <div className="mt-4 text-center space-y-3 animate-fade-in">
            <p className="text-sm font-medium text-muted-foreground">⏳ Descanso</p>
            <p className="text-4xl font-bold text-foreground tabular-nums">{restRemaining}s</p>
            <Progress value={(restRemaining / restTime) * 100} className="h-2" />
            <Button variant="ghost" size="sm" onClick={handleSkip} className="gap-1">
              <SkipForward className="w-4 h-4" /> Pular descanso
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex justify-center gap-3">
          {phase === "idle" && (
            <Button onClick={handleStart} className="gradient-fitness text-accent-foreground gap-2 px-6">
              <Play className="w-4 h-4" /> Iniciar
            </Button>
          )}
          {phase === "active" && (
            <>
              <Button onClick={handlePause} variant="secondary" className="gap-2 px-6">
                <Pause className="w-4 h-4" /> Pausar
              </Button>
              <Button onClick={handleCompleteSet} className="gradient-primary text-primary-foreground gap-2 px-6">
                <CheckCircle2 className="w-4 h-4" />
                {isLastSet && isLastExercise ? "Finalizar" : "Concluir Série"}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Rest time config */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        {editingRest ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={tempRest}
              onChange={(e) => setTempRest(e.target.value)}
              className="w-20 h-8 text-center"
              onKeyDown={(e) => e.key === "Enter" && saveRest()}
              autoFocus
            />
            <span className="text-muted-foreground">s</span>
            <Button variant="ghost" size="sm" onClick={saveRest}>OK</Button>
          </div>
        ) : (
          <button
            onClick={() => { setTempRest(String(restTime)); setEditingRest(true); }}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            Descanso: {restTime}s <Edit2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Exercise list preview */}
      <Card className="glass-card p-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Exercícios</p>
        <div className="space-y-1">
          {workout.exercises.map((ex, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-sm transition-colors ${
                i === exIdx
                  ? "bg-primary/10 text-primary font-medium"
                  : i < exIdx
                  ? "text-muted-foreground line-through opacity-60"
                  : "text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                {i < exIdx && <CheckCircle2 className="w-3.5 h-3.5 text-accent" />}
                {i === exIdx && <Play className="w-3.5 h-3.5" />}
                {ex.name}
              </span>
              <span className="text-xs text-muted-foreground">{ex.sets}x {ex.reps}</span>
            </div>
          ))}
        </div>
      </Card>

      <Button variant="ghost" className="w-full text-destructive" onClick={onFinish}>
        <RotateCcw className="w-4 h-4 mr-1" /> Encerrar Treino
      </Button>
    </div>
  );
};

// --- Main Workouts Page ---
const Workouts = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const { completedIds, toggleWorkout } = useOfflineWorkouts();

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id);

  const activeWorkout = workouts.find((w) => w.id === activeWorkoutId);

  const handleFinish = useCallback(() => {
    if (activeWorkoutId && !completedIds.has(activeWorkoutId)) {
      toggleWorkout(activeWorkoutId);
    }
    setActiveWorkoutId(null);
  }, [activeWorkoutId, completedIds, toggleWorkout]);

  // Active workout view
  if (activeWorkout) {
    return (
      <div className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto sm:px-6 lg:px-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">{activeWorkout.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">Treino em andamento</p>
        </div>
        <ActiveWorkout workout={activeWorkout} onFinish={handleFinish} defaultRest={60} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto sm:px-6 lg:px-8">
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
                <div className="flex items-center gap-3 mt-1 flex-wrap">
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
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => setActiveWorkoutId(w.id)}
                    className="flex-1 gradient-fitness text-accent-foreground gap-2"
                  >
                    <Play className="w-4 h-4" /> Iniciar Treino
                  </Button>
                  <Button
                    onClick={() => toggleWorkout(w.id)}
                    variant={completedIds.has(w.id) ? "secondary" : "outline"}
                    className="shrink-0"
                  >
                    {completedIds.has(w.id) ? "Desmarcar" : "Concluído"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Workouts;
