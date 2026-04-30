import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Users, Handshake, FileText, CreditCard,
  Bot, Globe, DollarSign, TrendingUp,
  ArrowUpRight, Loader2,
} from "lucide-react";

export default function Home() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  const statCards = [
    { title: "Contacts", value: stats?.contacts ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Open Deals", value: stats?.deals ?? 0, icon: Handshake, color: "text-violet-400", bg: "bg-violet-400/10", sub: `$${Number(stats?.dealValue ?? 0).toLocaleString()} pipeline` },
    { title: "Invoices", value: stats?.invoices ?? 0, icon: FileText, color: "text-amber-400", bg: "bg-amber-400/10", sub: `$${Number(stats?.invoiceTotal ?? 0).toLocaleString()} total` },
    { title: "Payments", value: stats?.payments ?? 0, icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "AI Agents", value: stats?.agents ?? 0, icon: Bot, color: "text-pink-400", bg: "bg-pink-400/10" },
    { title: "Websites", value: stats?.websites ?? 0, icon: Globe, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome to NexusCommand. Here is your business overview.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statCards.map((card) => (
                <Card key={card.title} className="bg-card border-border/50 hover:border-border transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                        <p className="text-3xl font-bold tabular-nums">{card.value}</p>
                        {card.sub && <p className="text-xs text-muted-foreground">{card.sub}</p>}
                      </div>
                      <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                        <card.icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Add New Contact", path: "/contacts" },
                    { label: "Create Invoice", path: "/invoices" },
                    { label: "Process Payment", path: "/payments" },
                    { label: "Build AI Agent", path: "/agents" },
                    { label: "Create Website", path: "/websites" },
                  ].map((action) => (
                    <a
                      key={action.path}
                      href={action.path}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <span className="text-sm">{action.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <span className="text-sm text-muted-foreground">Deal Pipeline Value</span>
                    <span className="text-sm font-semibold">${Number(stats?.dealValue ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <span className="text-sm text-muted-foreground">Total Invoiced</span>
                    <span className="text-sm font-semibold">${Number(stats?.invoiceTotal ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <span className="text-sm text-muted-foreground">Active Agents</span>
                    <span className="text-sm font-semibold">{stats?.agents ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <span className="text-sm text-muted-foreground">Active Websites</span>
                    <span className="text-sm font-semibold">{stats?.websites ?? 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
