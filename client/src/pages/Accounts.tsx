import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Plus, BookOpen, Loader2, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  asset: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  liability: "bg-red-500/10 text-red-400 border-red-500/20",
  equity: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  revenue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  expense: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export default function Accounts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; type: AccountType; subtype: string; description: string; balance: string }>({
    name: "", type: "asset", subtype: "", description: "", balance: "0.00",
  });

  const utils = trpc.useUtils();
  const { data: accounts, isLoading } = trpc.accounts.list.useQuery();
  const createMutation = trpc.accounts.create.useMutation({
    onSuccess: () => { utils.accounts.list.invalidate(); setDialogOpen(false); setForm({ name: "", type: "asset", subtype: "", description: "", balance: "0.00" }); toast.success("Account created"); },
  });
  const updateMutation = trpc.accounts.update.useMutation({ onSuccess: () => { utils.accounts.list.invalidate(); toast.success("Account updated"); } });

  // Group accounts by type
  const grouped = (accounts || []).reduce((acc: Record<string, any[]>, a: any) => {
    (acc[a.type] = acc[a.type] || []).push(a);
    return acc;
  }, {});

  const totalByType = Object.entries(grouped).map(([type, accs]) => ({
    type,
    total: (accs as any[]).reduce((sum: number, a: any) => sum + Number(a.balance || 0), 0),
    count: (accs as any[]).length,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your general ledger accounts.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> New Account</Button>
        </div>

        {totalByType.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {["asset", "liability", "equity", "revenue", "expense"].map((type) => {
              const data = totalByType.find(t => t.type === type);
              return (
                <Card key={type} className="bg-card border-border/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{type}</p>
                    <p className="text-lg font-bold mt-1">${(data?.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-muted-foreground">{data?.count ?? 0} accounts</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !accounts?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No accounts yet. Create your chart of accounts to start tracking finances.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {["asset", "liability", "equity", "revenue", "expense"].map((type) => {
              const typeAccounts = grouped[type];
              if (!typeAccounts?.length) return null;
              return (
                <div key={type}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">{type} Accounts</h3>
                  <div className="grid gap-2">
                    {typeAccounts.map((account: any) => (
                      <Card key={account.id} className="bg-card border-border/50 hover:border-border transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm truncate">{account.name}</p>
                                  <Badge variant="outline" className={`text-[10px] ${typeColors[account.type] || ""}`}>{account.type}</Badge>
                                  {!account.isActive && <Badge variant="outline" className="text-[10px] bg-zinc-500/10 text-zinc-400">Inactive</Badge>}
                                </div>
                                {account.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{account.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-sm font-semibold tabular-nums flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                {Number(account.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <Switch
                                checked={account.isActive}
                                onCheckedChange={(checked) => updateMutation.mutate({ id: account.id, isActive: checked })}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Account</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label className="text-xs">Account Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AccountType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Opening Balance</Label><Input type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Subtype</Label><Input value={form.subtype} onChange={(e) => setForm({ ...form, subtype: e.target.value })} placeholder="e.g., Checking, Savings" /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.name.trim()) { toast.error("Account name is required"); return; }
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
