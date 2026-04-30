import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, FileText, Loader2, DollarSign, Calendar, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  overdue: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

type InvStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export default function Invoices() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ invoiceNumber: "", subtotal: "", tax: "", total: "", notes: "", items: "" });

  const utils = trpc.useUtils();
  const { data: invoices, isLoading } = trpc.invoices.list.useQuery();
  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: () => { utils.invoices.list.invalidate(); setDialogOpen(false); setForm({ invoiceNumber: "", subtotal: "", tax: "", total: "", notes: "", items: "" }); toast.success("Invoice created"); },
  });
  const updateMutation = trpc.invoices.update.useMutation({ onSuccess: () => { utils.invoices.list.invalidate(); toast.success("Invoice updated"); } });

  function calcTotal(sub: string, tax: string) {
    const s = parseFloat(sub) || 0;
    const t = parseFloat(tax) || 0;
    return (s + t).toFixed(2);
  }

  // Generate next invoice number
  const nextNumber = `INV-${String((invoices?.length || 0) + 1).padStart(4, "0")}`;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and manage invoices for your clients.</p>
          </div>
          <Button onClick={() => { setForm({ ...form, invoiceNumber: nextNumber }); setDialogOpen(true); }} size="sm">
            <Plus className="h-4 w-4 mr-1" /> New Invoice
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !invoices?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No invoices yet. Create your first invoice.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {invoices.map((inv: any) => (
              <Card key={inv.id} className="bg-card border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                          <Badge variant="outline" className={`text-[10px] ${statusColors[inv.status] || ""}`}>{inv.status}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          {inv.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due: {new Date(inv.dueDate).toLocaleDateString()}</span>}
                          <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold tabular-nums flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        {Number(inv.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      {inv.status === "draft" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateMutation.mutate({ id: inv.id, status: "sent" as InvStatus })} title="Mark as sent">
                          <Send className="h-3.5 w-3.5 text-blue-400" />
                        </Button>
                      )}
                      {inv.status === "sent" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateMutation.mutate({ id: inv.id, status: "paid" as InvStatus })} title="Mark as paid">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label className="text-xs">Invoice Number *</Label><Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Subtotal</Label><Input type="number" step="0.01" value={form.subtotal} onChange={(e) => { const v = e.target.value; setForm({ ...form, subtotal: v, total: calcTotal(v, form.tax) }); }} /></div>
              <div><Label className="text-xs">Tax</Label><Input type="number" step="0.01" value={form.tax} onChange={(e) => { const v = e.target.value; setForm({ ...form, tax: v, total: calcTotal(form.subtotal, v) }); }} /></div>
              <div><Label className="text-xs">Total</Label><Input type="number" step="0.01" value={form.total} readOnly className="bg-accent/30" /></div>
            </div>
            <div><Label className="text-xs">Line Items (JSON)</Label><Textarea value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} rows={3} placeholder='[{"description": "Service", "qty": 1, "rate": 100}]' /></div>
            <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.invoiceNumber.trim()) { toast.error("Invoice number is required"); return; }
              createMutation.mutate(form);
            }} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
