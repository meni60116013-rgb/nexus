-- Habilitar RLS en tablas clave
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento por ID de Usuario
CREATE POLICY "Usuarios gestionan sus propios perfiles" 
ON public.profiles FOR ALL TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Usuarios ven su propia telemetria" 
ON public.telemetry_logs FOR ALL TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Acceso de lectura a planes de suscripcion" 
ON public.subscriptions FOR SELECT TO authenticated 
USING (true);
