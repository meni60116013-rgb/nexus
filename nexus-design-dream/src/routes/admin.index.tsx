import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/")({ ssr: false, component: AdminDashboard });

function AdminDashboard() {
  const [talleres, setTalleres] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [suscripciones, setSuscripciones] = useState<any[]>([]);
  const [counts, setCounts] = useState({ talleres: 0, clientes: 0, vehiculos: 0, ordenes: 0 });

  useEffect(() => {
    (async () => {
      const [t, p, s, cC, vC, oC] = await Promise.all([
        supabase.from("profiles").select("id, nombre_taller, email, created_at").order("created_at", { ascending: false }),
        supabase.from("pagos_admin").select("folio, monto, moneda, fecha, estado, taller_id").order("fecha", { ascending: false }).limit(50),
        supabase.from("suscripciones_taller").select("id, taller_id, estado, proximo_cobro"),
        supabase.from("clientes").select("id", { count: "exact", head: true }),
        supabase.from("vehiculos").select("id", { count: "exact", head: true }),
        supabase.from("ordenes_trabajo").select("id", { count: "exact", head: true }),
      ]);
      setTalleres(t.data ?? []);
      setPagos(p.data ?? []);
      setSuscripciones(s.data ?? []);
      setCounts({
        talleres: t.data?.length ?? 0,
        clientes: cC.count ?? 0,
        vehiculos: vC.count ?? 0,
        ordenes: oC.count ?? 0,
      });
    })();
  }, []);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-display tracking-wide">Panel Administrador — NEXUS</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Talleres</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{counts.talleres}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Clientes</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{counts.clientes}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Vehículos</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{counts.vehiculos}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Órdenes</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{counts.ordenes}</CardContent></Card>
      </div>

      <Tabs defaultValue="talleres">
        <TabsList>
          <TabsTrigger value="talleres">Talleres</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="suscripciones">Suscripciones</TabsTrigger>
        </TabsList>

        <TabsContent value="talleres">
          <Table>
            <TableHeader><TableRow><TableHead>Taller</TableHead><TableHead>Correo</TableHead><TableHead>Alta</TableHead></TableRow></TableHeader>
            <TableBody>
              {talleres.map((t) => (
                <TableRow key={t.id}><TableCell>{t.nombre_taller}</TableCell><TableCell>{t.email}</TableCell><TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="pagos">
          <Table>
            <TableHeader><TableRow><TableHead>Folio</TableHead><TableHead>Monto</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
            <TableBody>
              {pagos.map((p) => (
                <TableRow key={p.folio}><TableCell>{p.folio}</TableCell><TableCell>${p.monto} {p.moneda}</TableCell><TableCell>{p.fecha}</TableCell><TableCell>{p.estado}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="suscripciones">
          <Table>
            <TableHeader><TableRow><TableHead>Taller ID</TableHead><TableHead>Estado</TableHead><TableHead>Próximo cobro</TableHead></TableRow></TableHeader>
            <TableBody>
              {suscripciones.map((s) => (
                <TableRow key={s.id}><TableCell className="text-xs">{s.taller_id}</TableCell><TableCell>{s.estado}</TableCell><TableCell>{s.proximo_cobro}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </main>
  );
}
