import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, CreditCard, Loader2, DollarSign, Zap, ArrowRight, Clock, CheckCircle2, XCircle, Hash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const methodLabels: Record<string, string> = { ach: "ACH", wire: "Wire Transfer", rtp: "Real-Time Payment", credit_card: "Credit Card", instant: "Instant Payment" };
const methodColors: Record<string, string> = { ach: "text-blue-400", wire: "text-violet-400", rtp: "text-emerald-400", credit_card: "text-amber-400", instant: "text-pink-400" };
const statusColors: Record<string, string> = {
  initiated: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  settled: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  reversed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};
const statusIcons: Record<string, any> = { initiated: Clock, pending: Clock, processing: ArrowRight, settled: CheckCircle2, failed: XCircle, reversed: XCircle };

type PayMethod = "ach" | "wire" | "rtp" | "credit_card" | "instant";

export default function Payments() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<{ method: PayMethod; amount: string; description: string; cardLast4: string; cardBrand: string }>({
    method: "ach", amount: "", description: "", cardLast4: "", cardBrand: "",
  });

  const utils = trpc.useUtils();
  const { data: payments, isLoading } = trpc.payments.list.useQuery();
  const createMutation = trpc.payments.create.useMutation({
    onSuccess: (data) => {
      utils.payments.list.invalidate();
      setDialogOpen(false);
      setForm({ method: "ach", amount: "", description: "", cardLast4: "", cardBrand: "" });
      toast.success(`Payment created. TXN: ${data.transactionNumber}`);
    },
  });
  const updateStatusMutation = trpc.payments.updateStatus.useMutation({
    onSuccess: () => { utils.payments.list.invalidate(); toast.success("Payment status updated"); },
  });

  const pendingPayments = (payments || []).filter((p: any) => ["initiated", "pending", "processing"].includes(p.status));
  const settledPayments = (payments || []).filter((p: any) => p.status === "settled");
  const totalPending = pendingPayments.reduce((s: number, p: any) => s + Number(p.amount), 0);
  const totalSettled = settledPayments.reduce((s: number, p: any) => s + Number(p.amount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground text-sm mt-1">Process and track ACH, wire, RTP, instant, and credit card payments.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> New Payment</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Payments</p>
              <p className="text-2xl font-bold mt-1">{payments?.length ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Pending / Processing</p>
              <p className="text-2xl font-bold mt-1 text-amber-400">${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-muted-foreground">{pendingPayments.length} payment{pendingPayments.length !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">Settled</p>
              <p className="text-2xl font-bold mt-1 text-emerald-400">${totalSettled.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-muted-foreground">{settledPayments.length} payment{settledPayments.length !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span><strong>Modern Treasury:</strong> Sandbox mode. ACH, wire, and RTP payments generate tracking numbers. Connect your API keys for live processing.</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !payments?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No payments yet. Process your first payment.</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="bg-card">
              <TabsTrigger value="all">All ({payments.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
              <TabsTrigger value="settled">Settled ({settledPayments.length})</TabsTrigger>
            </TabsList>
            {["all", "pending", "settled"].map((tab) => {
              const filtered = tab === "all" ? payments : tab === "pending" ? pendingPayments : settledPayments;
              return (
                <TabsContent key={tab} value={tab} className="mt-3">
                  <div className="grid gap-2">
                    {filtered.map((payment: any) => {
                      const StatusIcon = statusIcons[payment.status] || Clock;
                      return (
                        <Card key={payment.id} className="bg-card border-border/50 hover:border-border transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
                                  <CreditCard className={`h-4 w-4 ${methodColors[payment.method] || ""}`} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{methodLabels[payment.method] || payment.method}</p>
                                    <Badge variant="outline" className={`text-[10px] ${statusColors[payment.status] || ""}`}>
                                      <StatusIcon className="h-2.5 w-2.5 mr-1" />{payment.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                                    {payment.transactionNumber && <span className="flex items-center gap-1"><Hash className="h-2.5 w-2.5" />TXN: {payment.transactionNumber}</span>}
                                    {payment.trackingNumber && <span className="flex items-center gap-1">TRK: {payment.trackingNumber}</span>}
                                    {payment.cardLast4 && <span>****{payment.cardLast4} ({payment.cardBrand})</span>}
                                    {payment.modernTreasuryId && <span>MT: {payment.modernTreasuryId}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm font-semibold tabular-nums">${Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                {["initiated", "pending", "processing"].includes(payment.status) && (
                                  <Select value={payment.status} onValueChange={(v) => updateStatusMutation.mutate({ id: payment.id, status: v as any })}>
                                    <SelectTrigger className="h-7 w-24 text-[10px] border-border/50"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="processing">Processing</SelectItem>
                                      <SelectItem value="settled">Settled</SelectItem>
                                      <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            </div>
                            {payment.description && <p className="text-xs text-muted-foreground mt-2 pl-12">{payment.description}</p>}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Process Payment</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Payment Method *</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v as PayMethod })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ach">ACH Transfer</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                    <SelectItem value="rtp">Real-Time Payment (RTP)</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="instant">Instant Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Amount *</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            </div>
            {form.method === "credit_card" && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Card Last 4</Label><Input value={form.cardLast4} onChange={(e) => setForm({ ...form, cardLast4: e.target.value })} maxLength={4} /></div>
                <div><Label className="text-xs">Card Brand</Label><Input value={form.cardBrand} onChange={(e) => setForm({ ...form, cardBrand: e.target.value })} placeholder="Visa, Mastercard" /></div>
              </div>
            )}
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.amount) { toast.error("Amount is required"); return; }
              createMutation.mutate(form);
            }} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
