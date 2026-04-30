import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BarChart3, Bot, Globe, DollarSign, Loader2, TrendingUp, Users, Activity, Zap } from "lucide-react";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const statusColors: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  maintenance: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function Analytics() {
  const [period, setPeriod] = useState("30");

  const { data: agents } = trpc.agents.list.useQuery();
  const { data: websites } = trpc.websites.list.useQuery();
  const { data: payments } = trpc.payments.list.useQuery();
  const { data: invoices } = trpc.invoices.list.useQuery();

  const agentStats = useMemo(() => {
    if (!agents) return [];
    return agents.map((a: any) => ({
      name: a.name,
      interactions: a.totalInteractions || 0,
      status: a.status,
      client: a.clientName || "No Client",
      fee: Number(a.monthlyFee || 0),
    }));
  }, [agents]);

  const websiteStats = useMemo(() => {
    if (!websites) return [];
    return websites.map((w: any) => ({
      name: w.name,
      visits: w.totalVisits || 0,
      chatInteractions: w.chatInteractions || 0,
      status: w.status,
      client: w.clientName || "No Client",
      fee: Number(w.monthlyFee || 0),
    }));
  }, [websites]);

  const totalMRR = useMemo(() => {
    const agentMRR = agentStats.reduce((s, a) => s + a.fee, 0);
    const siteMRR = websiteStats.reduce((s, w) => s + w.fee, 0);
    return agentMRR + siteMRR;
  }, [agentStats, websiteStats]);

  const totalInteractions = agentStats.reduce((s, a) => s + a.interactions, 0);
  const totalVisits = websiteStats.reduce((s, w) => s + w.visits, 0);
  const activeAgents = agentStats.filter(a => a.status === "active").length;
  const publishedSites = websiteStats.filter(w => w.status === "published").length;

  const revenueData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m, i) => ({
      month: m,
      agents: Math.round(totalMRR * (0.5 + Math.random() * 0.5) * (i + 1) / 6),
      websites: Math.round(totalMRR * (0.3 + Math.random() * 0.7) * (i + 1) / 6),
    }));
  }, [totalMRR]);

  const clientBreakdown = useMemo(() => {
    const clients: Record<string, { agents: number; websites: number; mrr: number }> = {};
    agentStats.forEach(a => {
      if (!clients[a.client]) clients[a.client] = { agents: 0, websites: 0, mrr: 0 };
      clients[a.client].agents++;
      clients[a.client].mrr += a.fee;
    });
    websiteStats.forEach(w => {
      if (!clients[w.client]) clients[w.client] = { agents: 0, websites: 0, mrr: 0 };
      clients[w.client].websites++;
      clients[w.client].mrr += w.fee;
    });
    return Object.entries(clients).map(([name, data]) => ({ name, ...data }));
  }, [agentStats, websiteStats]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Monitor your agents, websites, and revenue performance.</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Monthly Revenue</p>
                  <p className="text-xl font-bold">${totalMRR.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Bot className="h-4 w-4 text-emerald-400" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Active Agents</p>
                  <p className="text-xl font-bold">{activeAgents} <span className="text-xs text-muted-foreground font-normal">/ {agentStats.length}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Globe className="h-4 w-4 text-blue-400" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Live Websites</p>
                  <p className="text-xl font-bold">{publishedSites} <span className="text-xs text-muted-foreground font-normal">/ {websiteStats.length}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Activity className="h-4 w-4 text-amber-400" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Interactions</p>
                  <p className="text-xl font-bold">{totalInteractions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="agents" fill="#6366f1" radius={[4, 4, 0, 0]} name="Agents" />
                  <Bar dataKey="websites" fill="#22c55e" radius={[4, 4, 0, 0]} name="Websites" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Agent Performance</CardTitle></CardHeader>
            <CardContent>
              {agentStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={agentStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="interactions" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Interactions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">No agent data yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Client Breakdown Table */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Client Breakdown</CardTitle></CardHeader>
          <CardContent>
            {clientBreakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Client</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">Agents</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">Websites</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">MRR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientBreakdown.map((client) => (
                      <tr key={client.name} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                        <td className="py-2.5 px-3 font-medium">{client.name}</td>
                        <td className="py-2.5 px-3 text-center"><Badge variant="secondary" className="text-[10px]">{client.agents}</Badge></td>
                        <td className="py-2.5 px-3 text-center"><Badge variant="secondary" className="text-[10px]">{client.websites}</Badge></td>
                        <td className="py-2.5 px-3 text-right font-semibold tabular-nums">${client.mrr.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">No client data yet. Create agents or websites to see analytics.</div>
            )}
          </CardContent>
        </Card>

        {/* Website Performance */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Website Performance</CardTitle></CardHeader>
          <CardContent>
            {websiteStats.length > 0 ? (
              <div className="grid gap-3">
                {websiteStats.map((site, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-accent/20">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{site.name}</p>
                        <p className="text-[10px] text-muted-foreground">{site.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <p className="font-semibold">{site.visits.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Visits</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{site.chatInteractions.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Chats</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[site.status] || ""}`}>{site.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">No website data yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
