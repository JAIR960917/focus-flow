import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { GeoPoint } from "@/pages/Running";

export function useRunningSupabase() {
  const { user } = useAuth();

  const saveSession = useCallback(async (data: {
    distance_meters: number;
    duration_seconds: number;
    avg_pace: string;
    gps_points: GeoPoint[];
  }) => {
    if (!user) return;
    await supabase.from("runs").insert({
      user_id: user.id,
      distance_meters: data.distance_meters,
      duration_seconds: data.duration_seconds,
      avg_pace: data.avg_pace,
      route: data.gps_points as any,
    });
  }, [user]);

  return { saveSession };
}
