REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.recalcular_costo_piezas() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ajustar_stock_pieza() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;