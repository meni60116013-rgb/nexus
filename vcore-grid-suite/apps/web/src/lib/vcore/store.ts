import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildTelemetry, DEMO_CLIENTES, DEMO_ORDENES, DEMO_PIEZAS, DEMO_VEHICULOS } from "./demo-data";
import type { BomLine, Client, Part, Vehicle, VcoreState, WorkOrder } from "./types";

/* ---------- mapeo BD -> modelo de la app ---------- */

type ClienteRow = { id: string; nombre: string; telefono: string | null; email: string | null; tipo: string; created_at: string };
type VehiculoRow = { id: string; cliente_id: string | null; marca: string; modelo: string; anio: number; placa: string | null; serie: string | null; km_actual: number; tipo: string };
type OrdenRow = { id: string; folio: string; cliente_id: string | null; vehiculo_id: string | null; titulo: string; descripcion: string | null; estado: string; tecnico: string | null; horas_mano_obra: number; tarifa_hora: number; costo_piezas: number; synced: boolean; created_at: string };
type PiezaRow = { id: string; sku: string; nombre: string; categoria: string; stock: number; stock_minimo: number; costo: number; precio: number };
type OrdenPiezaRow = { id: string; orden_id: string; pieza_id: string; cantidad: number; precio_unitario: number; piezas: { nombre: string; sku: string } | null };

const toClient = (r: ClienteRow): Client => ({
  id: r.id, name: r.nombre, phone: r.telefono ?? "", email: r.email ?? "",
  type: r.tipo === "flota" ? "flota" : "particular", createdAt: r.created_at,
});

const toVehicle = (r: VehiculoRow): Vehicle => ({
  id: r.id, clientId: r.cliente_id ?? "", brand: r.marca, model: r.modelo, year: r.anio,
  plate: r.placa ?? "", vin: r.serie ?? "", km: r.km_actual,
  kind: r.tipo === "scooter" ? "scooter" : r.tipo === "e-bike" ? "e-bike" : "motocicleta",
});

const toOrder = (r: OrdenRow): WorkOrder => ({
  id: r.id, folio: r.folio, clientId: r.cliente_id ?? "", vehicleId: r.vehiculo_id ?? "",
  title: r.titulo, description: r.descripcion ?? "",
  status: (["abierta", "en_proceso", "espera_piezas", "cerrada"].includes(r.estado) ? r.estado : "abierta") as WorkOrder["status"],
  technician: r.tecnico ?? "", laborHours: Number(r.horas_mano_obra), partsCost: Number(r.costo_piezas),
  laborRate: Number(r.tarifa_hora), createdAt: r.created_at, synced: r.synced,
});

const toPart = (r: PiezaRow): Part => ({
  id: r.id, sku: r.sku, name: r.nombre, category: r.categoria,
  stock: r.stock, minStock: r.stock_minimo, cost: Number(r.costo), price: Number(r.precio),
});

const toBomLine = (r: OrdenPiezaRow): BomLine => ({
  id: r.id, ordenId: r.orden_id, piezaId: r.pieza_id,
  piezaNombre: r.piezas?.nombre ?? "—", piezaSku: r.piezas?.sku ?? "—",
  cantidad: r.cantidad, precioUnitario: Number(r.precio_unitario),
});

/* ---------- consultas ---------- */

const EMPTY: VcoreState = { clients: [], vehicles: [], orders: [], telemetry: [], parts: [] };

async function fetchAll() {
  const [clientes, vehiculos, ordenes, piezas] = await Promise.all([
    supabase.from("clientes").select("*").order("created_at", { ascending: false }),
    supabase.from("vehiculos").select("*").order("created_at", { ascending: false }),
    supabase.from("ordenes_trabajo").select("*").order("created_at", { ascending: false }),
    supabase.from("piezas").select("*").order("nombre", { ascending: true }),
  ]);
  if (clientes.error) throw clientes.error;
  if (vehiculos.error) throw vehiculos.error;
  if (ordenes.error) throw ordenes.error;
  if (piezas.error) throw piezas.error;
  return {
    clients: (clientes.data as ClienteRow[]).map(toClient),
    vehicles: (vehiculos.data as VehiculoRow[]).map(toVehicle),
    orders: (ordenes.data as OrdenRow[]).map(toOrder),
    parts: (piezas.data as PiezaRow[]).map(toPart),
  };
}

async function currentTallerId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Sesión no disponible");
  return data.user.id;
}

/** BOM real de una orden: piezas usadas, con nombre/sku resueltos. */
export function useOrderParts(ordenId: string) {
  const qc = useQueryClient();
  const key = ["orden_piezas", ordenId];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orden_piezas")
        .select("id, orden_id, pieza_id, cantidad, precio_unitario, piezas(nombre, sku)")
        .eq("orden_id", ordenId);
      if (error) throw error;
      return (data as unknown as OrdenPiezaRow[]).map(toBomLine);
    },
    enabled: !!ordenId,
  });

  const invalidate = useCallback(() => {
    void qc.invalidateQueries({ queryKey: key });
    void qc.invalidateQueries({ queryKey: ["vcore"] }); // costo_piezas de la orden cambia por trigger
  }, [qc, ordenId]);

  const addLineMut = useMutation({
    mutationFn: async ({ piezaId, cantidad, precioUnitario }: { piezaId: string; cantidad: number; precioUnitario: number }) => {
      const { error } = await supabase.from("orden_piezas").insert({
        orden_id: ordenId, pieza_id: piezaId, cantidad, precio_unitario: precioUnitario,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeLineMut = useMutation({
    mutationFn: async (lineId: string) => {
      const { error } = await supabase.from("orden_piezas").delete().eq("id", lineId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    lines: query.data ?? [],
    isLoading: query.isLoading,
    addLine: (piezaId: string, cantidad: number, precioUnitario: number) =>
      addLineMut.mutate({ piezaId, cantidad, precioUnitario }),
    isAdding: addLineMut.isPending,
    removeLine: (lineId: string) => removeLineMut.mutate(lineId),
  };
}

/**
 * Store del taller conectado a la base de datos real (multi-taller con RLS).
 */
export function useVcore() {
  const qc = useQueryClient();

  const query = useQuery({ queryKey: ["vcore"], queryFn: fetchAll, staleTime: 10_000 });

  const state: VcoreState = useMemo(() => {
    if (!query.data) return EMPTY;
    return {
      clients: query.data.clients,
      vehicles: query.data.vehicles,
      orders: query.data.orders,
      telemetry: buildTelemetry(query.data.vehicles),
      parts: query.data.parts,
    };
  }, [query.data]);

  const invalidate = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["vcore"] });
  }, [qc]);

  const addOrderMut = useMutation({
    mutationFn: async (order: Omit<WorkOrder, "id" | "folio" | "createdAt" | "synced">) => {
      const taller_id = await currentTallerId();
      const { count } = await supabase.from("ordenes_trabajo").select("id", { count: "exact", head: true });
      const { error } = await supabase.from("ordenes_trabajo").insert({
        taller_id, folio: `OT-${1041 + (count ?? 0)}`,
        cliente_id: order.clientId || null, vehiculo_id: order.vehicleId || null,
        titulo: order.title, descripcion: order.description, estado: order.status,
        tecnico: order.technician, horas_mano_obra: order.laborHours,
        tarifa_hora: order.laborRate, costo_piezas: order.partsCost, synced: false,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateStatusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: WorkOrder["status"] }) => {
      const { error } = await supabase.from("ordenes_trabajo").update({ estado: status, synced: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const addClientMut = useMutation({
    mutationFn: async (client: Omit<Client, "id" | "createdAt">) => {
      const taller_id = await currentTallerId();
      const { error } = await supabase.from("clientes").insert({
        taller_id, nombre: client.name, telefono: client.phone, email: client.email, tipo: client.type,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const addVehicleMut = useMutation({
    mutationFn: async (vehicle: Omit<Vehicle, "id">) => {
      const taller_id = await currentTallerId();
      const { error } = await supabase.from("vehiculos").insert({
        taller_id, cliente_id: vehicle.clientId || null, marca: vehicle.brand, modelo: vehicle.model,
        anio: vehicle.year, placa: vehicle.plate, serie: vehicle.vin, km_actual: vehicle.km, tipo: vehicle.kind,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  /** Alta real de una pieza en el inventario del taller. */
  const addPartMut = useMutation({
    mutationFn: async (part: Omit<Part, "id">) => {
      const taller_id = await currentTallerId();
      const { error } = await supabase.from("piezas").insert({
        taller_id, sku: part.sku, nombre: part.name, categoria: part.category,
        stock: part.stock, stock_minimo: part.minStock, costo: part.cost, precio: part.price,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const syncMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ordenes_trabajo").update({ synced: true }).eq("synced", false);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const seedMut = useMutation({
    mutationFn: async () => {
      const taller_id = await currentTallerId();
      const { data: clientes, error: cErr } = await supabase.from("clientes").insert(DEMO_CLIENTES.map((c) => ({ ...c, taller_id }))).select("id");
      if (cErr) throw cErr;

      const { data: vehiculos, error: vErr } = await supabase.from("vehiculos").insert(
        DEMO_VEHICULOS.map(({ clienteIdx, ...v }) => ({ ...v, taller_id, cliente_id: clientes?.[clienteIdx]?.id ?? null })),
      ).select("id, cliente_id");
      if (vErr) throw vErr;

      const { error: oErr } = await supabase.from("ordenes_trabajo").insert(
        DEMO_ORDENES.map(({ vehiculoIdx, ...o }, i) => ({
          ...o, taller_id, folio: `OT-${1041 + i}`,
          vehiculo_id: vehiculos?.[vehiculoIdx]?.id ?? null,
          cliente_id: vehiculos?.[vehiculoIdx]?.cliente_id ?? null,
          tarifa_hora: 320, synced: o.estado === "cerrada",
        })),
      );
      if (oErr) throw oErr;

      const { error: pErr } = await supabase.from("piezas").insert(DEMO_PIEZAS.map((p) => ({ ...p, taller_id })));
      if (pErr) throw pErr;
    },
    onSuccess: invalidate,
  });

  const clearMut = useMutation({
    mutationFn: async () => {
      const taller_id = await currentTallerId();
      await supabase.from("ordenes_trabajo").delete().eq("taller_id", taller_id);
      await supabase.from("vehiculos").delete().eq("taller_id", taller_id);
      await supabase.from("piezas").delete().eq("taller_id", taller_id);
      const { error } = await supabase.from("clientes").delete().eq("taller_id", taller_id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    state,
    isLoading: query.isLoading,
    error: query.error,
    addOrder: (order: Omit<WorkOrder, "id" | "folio" | "createdAt" | "synced">) => addOrderMut.mutate(order),
    updateOrderStatus: (id: string, status: WorkOrder["status"]) => updateStatusMut.mutate({ id, status }),
    addClient: (client: Omit<Client, "id" | "createdAt">) => addClientMut.mutate(client),
    addVehicle: (vehicle: Omit<Vehicle, "id">) => addVehicleMut.mutate(vehicle),
    addPart: (part: Omit<Part, "id">) => addPartMut.mutate(part),
    isAddingPart: addPartMut.isPending,
    syncAll: () => syncMut.mutate(),
    isSyncing: syncMut.isPending,
    loadDemoData: () => seedMut.mutate(),
    isLoadingDemo: seedMut.isPending,
    clearAll: () => clearMut.mutate(),
    isClearing: clearMut.isPending,
    resetDemo: () => seedMut.mutate(),
  };
}

export function orderTotal(o: WorkOrder) {
  return o.partsCost + o.laborHours * o.laborRate;
}

export const currency = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

export const STATUS_LABEL: Record<WorkOrder["status"], string> = {
  abierta: "Abierta", en_proceso: "En proceso", espera_piezas: "Espera piezas", cerrada: "Cerrada",
};
