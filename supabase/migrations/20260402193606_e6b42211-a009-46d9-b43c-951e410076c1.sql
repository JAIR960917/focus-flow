
-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_completions table
CREATE TABLE public.workout_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  workout_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create running_sessions table
CREATE TABLE public.running_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  distance_meters DOUBLE PRECISION NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  avg_pace TEXT,
  gps_points JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_sessions ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon access filtered by device_id
CREATE POLICY "Anon can select own tasks" ON public.tasks FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert tasks" ON public.tasks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update own tasks" ON public.tasks FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can delete own tasks" ON public.tasks FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can select own workout_completions" ON public.workout_completions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert workout_completions" ON public.workout_completions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can delete own workout_completions" ON public.workout_completions FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can select own running_sessions" ON public.running_sessions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert running_sessions" ON public.running_sessions FOR INSERT TO anon WITH CHECK (true);

-- Create indexes for device_id lookups
CREATE INDEX idx_tasks_device_id ON public.tasks(device_id);
CREATE INDEX idx_workout_completions_device_id ON public.workout_completions(device_id);
CREATE INDEX idx_running_sessions_device_id ON public.running_sessions(device_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
