import { useState } from "react";
import { Plus, Check, Trash2, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: newTask.trim(), completed: false, createdAt: new Date() },
    ]);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Minhas Tarefas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Progress Card */}
      <Card className="p-4 mb-6 glass-card animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Progresso do Dia</p>
              <p className="text-xs text-muted-foreground">{completedCount}/{totalCount} concluídas</p>
            </div>
          </div>
          {progress === 100 && totalCount > 0 && (
            <Flame className="w-5 h-5 text-warning" />
          )}
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Add Task */}
      <div className="flex gap-2 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Adicionar nova tarefa..."
          className="flex-1 bg-card border-border"
        />
        <Button onClick={addTask} size="icon" className="gradient-primary text-primary-foreground shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma tarefa ainda. Adicione a primeira!</p>
          </div>
        )}
        {tasks.map((task, i) => (
          <Card
            key={task.id}
            className={`p-3 flex items-center gap-3 glass-card animate-fade-in transition-all duration-200 ${
              task.completed ? "opacity-60" : ""
            }`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                task.completed
                  ? "bg-accent border-accent"
                  : "border-border hover:border-primary"
              }`}
            >
              {task.completed && <Check className="w-3 h-3 text-accent-foreground" />}
            </button>
            <span
              className={`flex-1 text-sm ${
                task.completed ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
