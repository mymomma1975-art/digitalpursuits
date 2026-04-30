import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { DollarSign, Users, Bot, Globe, TrendingUp, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useMemo } from "react";

export default function Billing() {
  const { data: agents } = trpc.agents.list.useQuery();
  const { data: websites } = trpc.websites.list.useQuery();

  const billingItems = useMemo(() => {
    const items: { type: string; name: string; client: string; fee: number; status: string }[] = [];
    agents?.forEach((a: any) => {
      if (Number(a.monthlyFee) > 0) {
        items.push({ type: "agent", name: a.name, client: a.clientName || "No Client", fee: Number(a.monthlyFee), status: a.status });
      }
    });
    websites?.forEach((w: any) => {
      if (Number(w.monthlyFee) > 0) {
        items.push({ type: "website", name: w.name, client: w.clientName || "No Client", fee: Number(w.monthlyFee), status: w.status });
      }
    });
    return items;
  }, [agents, websites]);

  const totalMRR = billingItems.reduce((s, i) => s + i.fee, 0);
  const activeItems = billingItems.filter(i => i.status === "active" || i.status === "published");
  const activeMRR = activeItems.reduce((s, i) => s + i.fee, 0);
  const uniqueClients = new Set(billingItems.map(i => i.client)).size;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Subscriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage client subscriptions and track recurring revenue.</p>
        </div>

        {/* Revenue KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total MRR</p>
              <p className="text-2xl font-bold mt-1">${totalMRR.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Active MRR</p>
              <p className="text-2xl font-bold mt-1 text-emerald-400">${activeMRR.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Billable Items</p>
              <p className="text-2xl font-bold mt-1">{billingItems.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Unique Clients</p>
              <p className="text-2xl font-bold mt-1">{uniqueClients}</p>
            </CardContent>
          </Card>
        </div>

        {/* ARR Projection */}
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Annual Recurring Revenue (ARR) Projection</p>
                <p className="text-3xl font-bold mt-1">${(totalMRR * 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        {/* Billing Items Table */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active Subscriptions</CardTitle></CardHeader>
          <CardContent>
            {billingItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Service</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Type</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Client</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Monthly Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingItems.map((item, i) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            {item.type === "agent" ? <Bot className="h-3.5 w-3.5 text-violet-400" /> : <Globe className="h-3.5 w-3.5 text-blue-400" />}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 capitalize text-muted-foreground">{item.type}</td>
                        <td className="py-2.5 px-3">{item.client}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant="outline" className={`text-[10px] ${item.status === "active" || item.status === "published" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
                            {item.status === "active" || item.status === "published" ? <CheckCircle className="h-2.5 w-2.5 mr-1" /> : <AlertCircle className="h-2.5 w-2.5 mr-1" />}
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold tabular-nums">${item.fee.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border">
                      <td colSpan={4} className="py-2.5 px-3 text-xs font-semibold text-muted-foreground">Total Monthly Revenue</td>
                      <td className="py-2.5 px-3 text-right font-bold text-lg">${totalMRR.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSign className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No billable items yet. Set monthly fees on your agents and websites to track revenue.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
