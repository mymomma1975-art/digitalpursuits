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
import { Plus, ArrowLeftRight, Loader2, ArrowUpRight, ArrowDownRight, RefreshCw, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const typeIcons: Record<string, any> = { income: ArrowDownRight, expense: ArrowUpRight, transfer: RefreshCw, refund: RotateCcw };
const typeColors: Record<string, string> = {
  income: "text-emerald-400", expense: "text-red-400", transfer: "text-blue-400", refund: "text-amber-400",
};
const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

type TxnType = "income" | "expense" | "transfer" | "refund";
type TxnStatus = "pending" | "completed" | "failed" | "cancelled";

export default function Transactions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<{ type: TxnType; amount: string; description: string; category: string; reference: string; status: TxnStatus }>({
    type: "income", amount: "", description: "", category: "", reference: "", status: "completed",
  });

  const utils = trpc.useUtils();
  const { data: transactions, isLoading } = trpc.transactions.list.useQuery();
  const createMutation = trpc.transactions.create.useMutation({
    onSuccess: () => { utils.transactions.list.invalidate(); setDialogOpen(false); setForm({ type: "income", amount: "", description: "", category: "", reference: "", status: "completed" }); toast.success("Transaction recorded"); },
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground text-sm mt-1">Record and track all financial transactions.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Record Transaction</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !transactions?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ArrowLeftRight className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No transactions yet. Record your first transaction.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {transactions.map((txn: any) => {
              const Icon = typeIcons[txn.type] || ArrowLeftRight;
              return (
                <Card key={txn.id} className="bg-card border-border/50 hover:border-border transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-9 w-9 rounded-lg bg-accent/50 flex items-center justify-center shrink-0`}>
                          <Icon className={`h-4 w-4 ${typeColors[txn.type] || ""}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{txn.description || txn.type}</p>
                            <Badge variant="outline" className={`text-[10px] ${statusColors[txn.status] || ""}`}>{txn.status}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                            {txn.category && <span>{txn.category}</span>}
                            {txn.reference && <span>Ref: {txn.reference}</span>}
                            <span>{new Date(txn.transactionDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold tabular-nums ${txn.type === "income" ? "text-emerald-400" : txn.type === "expense" ? "text-red-400" : ""}`}>
                        {txn.type === "expense" || txn.type === "refund" ? "-" : "+"}${Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TxnType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Amount *</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Office, Travel" /></div>
              <div><Label className="text-xs">Reference</Label><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g., INV-001" /></div>
            </div>
            <div><Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TxnStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.amount) { toast.error("Amount is required"); return; }
              createMutation.mutate(form);
            }} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
