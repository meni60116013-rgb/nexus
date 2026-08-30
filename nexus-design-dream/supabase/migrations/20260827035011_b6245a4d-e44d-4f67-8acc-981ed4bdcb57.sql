-- 1. Roles seguros
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'soporte', 'taller');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE POLICY "usuario ve sus roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM public.profiles WHERE is_admin = true
ON CONFLICT DO NOTHING;

-- is_admin ahora se basa en user_roles (las policies existentes lo usan)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin');
$$;

-- 2. Tokenmaster
CREATE TABLE public.admin_master_token (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  prefijo text NOT NULL,
  etiqueta text NOT NULL DEFAULT 'Tokenmaster',
  activo boolean NOT NULL DEFAULT true,
  ultimo_uso timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_master_token TO authenticated;
GRANT ALL ON public.admin_master_token TO service_role;
ALTER TABLE public.admin_master_token ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin gestiona su tokenmaster" ON public.admin_master_token
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND owner_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND owner_id = auth.uid());

-- 3. Biometría
CREATE TABLE public.admin_biometria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'passkey',
  etiqueta text NOT NULL DEFAULT 'Dispositivo',
  credential_id text,
  activo boolean NOT NULL DEFAULT true,
  ultimo_uso timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_biometria TO authenticated;
GRANT ALL ON public.admin_biometria TO service_role;
ALTER TABLE public.admin_biometria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin gestiona su biometria" ON public.admin_biometria
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND owner_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND owner_id = auth.uid());

-- 4. Tokens de clientes
CREATE TABLE public.tokens_cliente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'acceso',
  etiqueta text NOT NULL DEFAULT 'Token de acceso',
  prefijo text NOT NULL,
  token_hash text NOT NULL,
  plan_id uuid REFERENCES public.planes(id) ON DELETE SET NULL,
  max_dispositivos integer NOT NULL DEFAULT 1,
  usos integer NOT NULL DEFAULT 0,
  estado text NOT NULL DEFAULT 'activo',
  expira_en timestamptz,
  ultimo_uso timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tokens_cliente TO authenticated;
GRANT ALL ON public.tokens_cliente TO service_role;
ALTER TABLE public.tokens_cliente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin gestiona tokens" ON public.tokens_cliente
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "taller ve sus tokens" ON public.tokens_cliente
  FOR SELECT TO authenticated USING (auth.uid() = taller_id);
CREATE INDEX idx_tokens_cliente_taller ON public.tokens_cliente(taller_id);

-- 5. Actualizaciones
CREATE TABLE public.actualizaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  canal text NOT NULL DEFAULT 'estable',
  titulo text NOT NULL DEFAULT 'Nueva versión',
  notas text,
  obligatoria boolean NOT NULL DEFAULT false,
  publicada boolean NOT NULL DEFAULT false,
  taller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha_publicacion timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.actualizaciones TO authenticated;
GRANT ALL ON public.actualizaciones TO service_role;
ALTER TABLE public.actualizaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin gestiona actualizaciones" ON public.actualizaciones
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "taller ve actualizaciones publicadas" ON public.actualizaciones
  FOR SELECT TO authenticated
  USING (publicada = true AND (taller_id IS NULL OR taller_id = auth.uid()));

-- 6. Mantenimiento
CREATE TABLE public.mantenimiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activo boolean NOT NULL DEFAULT false,
  mensaje text NOT NULL DEFAULT 'Estamos realizando mantenimiento del núcleo VCORE.',
  taller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  inicio timestamptz NOT NULL DEFAULT now(),
  fin timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mantenimiento TO authenticated;
GRANT ALL ON public.mantenimiento TO service_role;
ALTER TABLE public.mantenimiento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin gestiona mantenimiento" ON public.mantenimiento
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "taller ve mantenimiento vigente" ON public.mantenimiento
  FOR SELECT TO authenticated
  USING (activo = true AND (taller_id IS NULL OR taller_id = auth.uid()));

-- 7. Auditoría
CREATE TABLE public.admin_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  accion text NOT NULL,
  detalle text,
  entidad text,
  entidad_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_auditoria TO authenticated;
GRANT ALL ON public.admin_auditoria TO service_role;
ALTER TABLE public.admin_auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin lee auditoria" ON public.admin_auditoria
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin escribe auditoria" ON public.admin_auditoria
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND actor_id = auth.uid());
CREATE INDEX idx_auditoria_fecha ON public.admin_auditoria(created_at DESC);

-- triggers updated_at
CREATE TRIGGER trg_master_token_updated BEFORE UPDATE ON public.admin_master_token
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tokens_cliente_updated BEFORE UPDATE ON public.tokens_cliente
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_actualizaciones_updated BEFORE UPDATE ON public.actualizaciones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mantenimiento_updated BEFORE UPDATE ON public.mantenimiento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();