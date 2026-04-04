import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useWorkoutsSupabase() {
  const { user } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const loadCompletions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("workout_completions")
      .select("workout_id")
      .eq("user_id", user.id);
    if (data) setCompletedIds(new Set(data.map((w) => w.workout_id)));
    setLoaded(true);
  }, [user]);

  useEffect(() => { loadCompletions(); }, [loadCompletions]);

  const toggleWorkout = useCallback(async (workoutId: string) => {
    if (!user) return;
    if (completedIds.has(workoutId)) {
      await supabase
        .from("workout_completions")
        .delete()
        .eq("user_id", user.id)
        .eq("workout_id", workoutId);
    } else {
      await supabase.from("workout_completions").insert({
        user_id: user.id,
        device_id: "web",
        workout_id: workoutId,
      });
    }
    await loadCompletions();
  }, [user, completedIds, loadCompletions]);

  return { completedIds, loaded, toggleWorkout };
}
