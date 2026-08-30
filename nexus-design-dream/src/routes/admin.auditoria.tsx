import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/adminNexus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/auditoria")({ ssr: false, component: Auditoria });

function Auditoria() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("admin_auditoria").select("*").order("created_at", { ascending: false }).limit(200).then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display tracking-wide">Auditoría</h1>
      <Card>
        <CardHeader><CardTitle className="text-sm">{rows.length} eventos recientes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Acción</TableHead><TableHead>Detalle</TableHead><TableHead>Actor</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs">{new Date(r.created_at).toLocaleString("es-MX")}</TableCell>
                  <TableCell><Badge variant="outline">{r.accion}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.detalle ?? "—"}</TableCell>
                  <TableCell className="text-xs">{r.actor_email ?? "—"}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin eventos aún.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
