-- Inyección de Flag SuperAdmin en la tabla de perfiles
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Otorgar rol SuperAdmin al correo principal
UPDATE public.profiles 
SET is_super_admin = TRUE 
WHERE email = 'meni60116013-rgb@gmail.com';

-- Política Bypass: SuperAdmin ignora todas las restricciones de pago y RLS
CREATE POLICY "SuperAdmin Bypass Absoluto Perfiles" 
ON public.profiles FOR ALL TO authenticated 
USING ( (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE );

CREATE POLICY "SuperAdmin Bypass Absoluto Telemetria" 
ON public.telemetry_logs FOR ALL TO authenticated 
USING ( (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE );

CREATE POLICY "SuperAdmin Bypass Absoluto Suscripciones" 
ON public.subscriptions FOR ALL TO authenticated 
USING ( (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE );
