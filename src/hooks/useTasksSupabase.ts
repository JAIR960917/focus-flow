import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useTasksSupabase() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setTasks(data as Task[]);
    setLoaded(true);
  }, [user]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const addTask = useCallback(async (title: string) => {
    if (!user) return;
    await supabase.from("tasks").insert({
      title,
      user_id: user.id,
      device_id: "web",
    });
    await loadTasks();
  }, [user, loadTasks]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await supabase.from("tasks").update({ completed: !task.completed }).eq("id", id);
    await loadTasks();
  }, [tasks, loadTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    await loadTasks();
  }, [loadTasks]);

  return { tasks, loaded, addTask, toggleTask, deleteTask };
}
