import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, toCsv, downloadCsv, formatDate } from "@/lib/adminNexus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/talleres")({ ssr: false, component: Talleres });

function Talleres() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("profiles").select("id, nombre_taller, email, created_at").order("created_at", { ascending: false })
      .then(({ data }: { data: any }) => setRows(data ?? []));
  }, []);

  const filtered = rows.filter((r) =>
    (r.nombre_taller ?? "").toLowerCase().includes(q.toLowerCase()) || (r.email ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-display tracking-wide">Talleres registrados</h1>
        <Button size="sm" variant="outline" onClick={() => downloadCsv("talleres.csv", toCsv(filtered))}>Exportar CSV</Button>
      </div>
      <Input placeholder="Buscar por nombre o correo…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <Card>
        <CardHeader><CardTitle className="text-sm">{filtered.length} talleres</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Taller</TableHead><TableHead>Correo</TableHead><TableHead>Alta</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.nombre_taller || "—"}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{formatDate(t.created_at?.slice(0, 10))}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Sin resultados.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
