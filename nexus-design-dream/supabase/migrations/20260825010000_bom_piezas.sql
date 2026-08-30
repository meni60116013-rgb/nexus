-- PIEZAS (inventario real por taller)
CREATE TABLE public.piezas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  taller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'General',
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  costo NUMERIC NOT NULL DEFAULT 0,
  precio NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.piezas TO authenticated;
GRANT ALL ON public.piezas TO service_role;
ALTER TABLE public.piezas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talleres gestionan sus piezas"
  ON public.piezas FOR ALL TO authenticated
  USING (auth.uid() = taller_id) WITH CHECK (auth.uid() = taller_id);

CREATE TRIGGER update_piezas_updated_at BEFORE UPDATE ON public.piezas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_piezas_taller ON public.piezas(taller_id);

-- ORDEN_PIEZAS (BOM real: piezas usadas por orden de trabajo)
CREATE TABLE public.orden_piezas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_id UUID NOT NULL REFERENCES public.ordenes_trabajo(id) ON DELETE CASCADE,
  pieza_id UUID NOT NULL REFERENCES public.piezas(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orden_piezas TO authenticated;
GRANT ALL ON public.orden_piezas TO service_role;
ALTER TABLE public.orden_piezas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talleres gestionan piezas de sus ordenes"
  ON public.orden_piezas FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ordenes_trabajo o WHERE o.id = orden_piezas.orden_id AND o.taller_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ordenes_trabajo o WHERE o.id = orden_piezas.orden_id AND o.taller_id = auth.uid()));

CREATE INDEX idx_orden_piezas_orden ON public.orden_piezas(orden_id);

CREATE OR REPLACE FUNCTION public.recalcular_costo_piezas()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_orden_id UUID;
BEGIN
  v_orden_id := COALESCE(NEW.orden_id, OLD.orden_id);
  UPDATE public.ordenes_trabajo
  SET costo_piezas = COALESCE((SELECT SUM(cantidad * precio_unitario) FROM public.orden_piezas WHERE orden_id = v_orden_id), 0),
      synced = false
  WHERE id = v_orden_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_recalcular_costo_piezas
  AFTER INSERT OR UPDATE OR DELETE ON public.orden_piezas
  FOR EACH ROW EXECUTE FUNCTION public.recalcular_costo_piezas();

CREATE OR REPLACE FUNCTION public.ajustar_stock_pieza()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.piezas SET stock = stock - NEW.cantidad WHERE id = NEW.pieza_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.piezas SET stock = stock + OLD.cantidad WHERE id = OLD.pieza_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.piezas SET stock = stock + OLD.cantidad - NEW.cantidad WHERE id = NEW.pieza_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_ajustar_stock_pieza
  AFTER INSERT OR UPDATE OR DELETE ON public.orden_piezas
  FOR EACH ROW EXECUTE FUNCTION public.ajustar_stock_pieza();
