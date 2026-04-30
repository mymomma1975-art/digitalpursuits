import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Landmark, Loader2, RefreshCw, DollarSign, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  disconnected: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Banking() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ institutionName: "", accountName: "", accountMask: "", accountType: "checking", currentBalance: "", availableBalance: "" });

  const utils = trpc.useUtils();
  const { data: accounts, isLoading } = trpc.banking.accounts.useQuery();
  const connectMutation = trpc.banking.connectAccount.useMutation({
    onSuccess: () => { utils.banking.accounts.invalidate(); setDialogOpen(false); setForm({ institutionName: "", accountName: "", accountMask: "", accountType: "checking", currentBalance: "", availableBalance: "" }); toast.success("Bank account connected (sandbox)"); },
  });
  const syncMutation = trpc.banking.syncAccount.useMutation({
    onSuccess: () => { utils.banking.accounts.invalidate(); toast.success("Account synced"); },
  });

  const totalBalance = (accounts || []).reduce((sum: number, a: any) => sum + Number(a.currentBalance || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bank Accounts</h1>
            <p className="text-muted-foreground text-sm mt-1">Connect and manage your bank accounts via Plaid.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Connect Bank</Button>
        </div>

        {accounts && accounts.length > 0 && (
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Balance</p>
              <p className="text-3xl font-bold mt-1">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground mt-1">{accounts.length} connected account{accounts.length !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
        )}

        <div className="rounded-lg border border-border/50 bg-card/50 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span><strong>Sandbox Mode:</strong> Using Plaid sandbox environment. Connect your Plaid API keys in settings for live banking data.</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !accounts?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Landmark className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No bank accounts connected. Connect your first bank account.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {accounts.map((account: any) => (
              <Card key={account.id} className="bg-card border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
                        <Landmark className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{account.accountName}</p>
                          <Badge variant="outline" className={`text-[10px] ${statusColors[account.status] || ""}`}>
                            {account.status === "active" ? <Wifi className="h-2.5 w-2.5 mr-1" /> : <WifiOff className="h-2.5 w-2.5 mr-1" />}
                            {account.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span>{account.institutionName}</span>
                          {account.accountMask && <span>****{account.accountMask}</span>}
                          <span className="capitalize">{account.accountType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">${Number(account.currentBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-muted-foreground">Available: ${Number(account.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => syncMutation.mutate({ id: account.id })} disabled={syncMutation.isPending}>
                        <RefreshCw className={`h-3.5 w-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  </div>
                  {account.lastSynced && (
                    <p className="text-[10px] text-muted-foreground mt-2 pl-13">Last synced: {new Date(account.lastSynced).toLocaleString()}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Connect Bank Account (Sandbox)</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">In production, this uses Plaid Link to securely connect your bank. For now, enter sandbox account details.</p>
          <div className="grid gap-4 py-2">
            <div><Label className="text-xs">Institution Name *</Label><Input value={form.institutionName} onChange={(e) => setForm({ ...form, institutionName: e.target.value })} placeholder="e.g., Chase, Bank of America" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Account Name *</Label><Input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="e.g., Business Checking" /></div>
              <div><Label className="text-xs">Last 4 Digits</Label><Input value={form.accountMask} onChange={(e) => setForm({ ...form, accountMask: e.target.value })} maxLength={4} placeholder="1234" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Current Balance</Label><Input type="number" step="0.01" value={form.currentBalance} onChange={(e) => setForm({ ...form, currentBalance: e.target.value })} /></div>
              <div><Label className="text-xs">Available Balance</Label><Input type="number" step="0.01" value={form.availableBalance} onChange={(e) => setForm({ ...form, availableBalance: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.institutionName.trim() || !form.accountName.trim()) { toast.error("Institution and account name required"); return; }
              connectMutation.mutate(form);
            }} disabled={connectMutation.isPending}>
              {connectMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
