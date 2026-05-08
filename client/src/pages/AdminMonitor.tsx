import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import {
  Activity, AlertTriangle, Bell, BellOff, Bot, CheckCircle2,
  DollarSign, Globe, Heart, HeartPulse, Monitor, TrendingUp,
  Users, XCircle, Zap, Eye, MessageSquare, Clock, ShieldAlert,
  Timer, Wifi, WifiOff, Settings,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminMonitor() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Role protection - only admin can access
  if (!loading && user && user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-red-500 opacity-70" />
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                The Admin Monitor is only available to administrators. Contact the platform owner if you need access.
              </p>
              <Button className="mt-4" onClick={() => navigate("/")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { data: overview, isLoading: overviewLoading } = trpc.admin.overview.useQuery();
  const { data: clients, isLoading: clientsLoading } = trpc.admin.clients.useQuery();
  const { data: healthChecks } = trpc.admin.healthChecks.useQuery();
  const { data: alerts, refetch: refetchAlerts } = trpc.admin.alerts.useQuery();

  const markAllRead = trpc.admin.markAllAlertsRead.useMutation({
    onSuccess: () => { refetchAlerts(); toast.success("All alerts marked as read"); },
  });
  const resolveAlert = trpc.admin.resolveAlert.useMutation({
    onSuccess: () => { refetchAlerts(); toast.success("Alert resolved"); },
  });

  // Notification preferences
  const { data: notifPrefs, refetch: refetchPrefs } = trpc.admin.getNotificationPrefs.useQuery();
  const updatePrefs = trpc.admin.updateNotificationPrefs.useMutation({
    onSuccess: () => { refetchPrefs(); toast.success("Notification preferences updated"); },
  });

  // Derive health stats from healthChecks
  const healthStats = {
    healthy: healthChecks?.filter(h => h.status === "healthy").length ?? 0,
    degraded: healthChecks?.filter(h => h.status === "degraded").length ?? 0,
    down: healthChecks?.filter(h => h.status === "down").length ?? 0,
    avgResponseTime: healthChecks && healthChecks.length > 0
      ? Math.round(healthChecks.reduce((sum, h) => sum + (h.responseTimeMs || 0), 0) / healthChecks.length)
      : 0,
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Monitor className="h-6 w-6 text-primary" />
              Admin Monitor
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor all clients, agents, and websites from one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            {alerts && alerts.filter(a => !a.isRead).length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {alerts.filter(a => !a.isRead).length} unread alerts
              </Badge>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-2xl font-bold">{overview?.totalClients ?? 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">${Number(overview?.totalMRR ?? 0).toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                  <p className="text-2xl font-bold">{overview?.activeAgents ?? 0}<span className="text-sm text-muted-foreground">/{overview?.totalAgents ?? 0}</span></p>
                </div>
                <Bot className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published Websites</p>
                  <p className="text-2xl font-bold">{overview?.publishedWebsites ?? 0}<span className="text-sm text-muted-foreground">/{overview?.totalWebsites ?? 0}</span></p>
                </div>
                <Globe className="h-8 w-8 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity + Health Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agent Interactions</p>
                <p className="text-xl font-semibold">{overview?.totalInteractions ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Website Visits</p>
                <p className="text-xl font-semibold">{overview?.totalVisits ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-500/10">
                <Wifi className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Healthy / Degraded / Down</p>
                <p className="text-xl font-semibold">
                  <span className="text-green-500">{healthStats.healthy}</span>
                  {" / "}
                  <span className="text-yellow-500">{healthStats.degraded}</span>
                  {" / "}
                  <span className="text-red-500">{healthStats.down}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-violet-500/10">
                <Timer className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-xl font-semibold">{healthStats.avgResponseTime}ms</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Activity className="h-4 w-4" /> Clients
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-1">
              <Bot className="h-4 w-4" /> Agents
            </TabsTrigger>
            <TabsTrigger value="websites" className="flex items-center gap-1">
              <Globe className="h-4 w-4" /> Websites
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1">
              <HeartPulse className="h-4 w-4" /> Health
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1">
              <Bell className="h-4 w-4" /> Alerts
              {alerts && alerts.filter(a => !a.isRead).length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {alerts.filter(a => !a.isRead).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Client Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : !clients || clients.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No clients yet</p>
                    <p className="text-sm mt-1">Create agents or websites and assign them to clients to see them here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clients.map((client) => (
                      <div key={client.clientName} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {client.clientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{client.clientName}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {client.agents.length} agents</span>
                              <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {client.websites.length} websites</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-muted-foreground">Interactions</p>
                            <p className="font-semibold">{client.totalInteractions}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Visits</p>
                            <p className="font-semibold">{client.totalVisits}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">MRR</p>
                            <p className="font-semibold text-green-500">${client.totalMRR.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" /> Agent Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : !clients || clients.flatMap(c => c.agents).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No agents deployed</p>
                    <p className="text-sm mt-1">Deploy agents from the Agents page to monitor them here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clients?.flatMap(c => c.agents.map(a => ({ ...a, clientName: c.clientName }))).map((agent) => {
                      // Find latest health check for this agent
                      const agentHealth = healthChecks?.find(h => h.entityType === "agent" && h.entityId === agent.id);
                      return (
                        <div key={agent.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`h-3 w-3 rounded-full ${agent.status === "active" ? "bg-green-500" : agent.status === "paused" ? "bg-yellow-500" : "bg-gray-400"}`} />
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-sm text-muted-foreground">Client: {agent.clientName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-right">
                              <p className="text-muted-foreground">Interactions</p>
                              <p className="font-semibold">{agent.totalInteractions || 0}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground">Response</p>
                              <p className="font-semibold">{agentHealth?.responseTimeMs ? `${agentHealth.responseTimeMs}ms` : "N/A"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground">Health</p>
                              <Badge variant={agentHealth?.status === "healthy" ? "default" : agentHealth?.status === "degraded" ? "outline" : agentHealth?.status === "down" ? "destructive" : "secondary"}>
                                {agentHealth?.status || "unchecked"}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground">Fee</p>
                              <p className="font-semibold text-green-500">${Number(agent.monthlyFee || 0).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Websites Tab */}
          <TabsContent value="websites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" /> Website Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : !clients || clients.flatMap(c => c.websites).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No websites published</p>
                    <p className="text-sm mt-1">Publish websites from the Websites page to monitor them here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clients?.flatMap(c => c.websites.map(w => ({ ...w, clientName: c.clientName }))).map((site) => {
                      const siteHealth = healthChecks?.find(h => h.entityType === "website" && h.entityId === site.id);
                      return (
                        <div key={site.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`h-3 w-3 rounded-full ${site.status === "published" ? "bg-green-500" : site.status === "draft" ? "bg-yellow-500" : "bg-gray-400"}`} />
                            <div>
                              <p className="font-medium">{site.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Client: {site.clientName}
                                {site.domain && <span className="ml-2">• {site.domain}</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-right">
                              <p className="text-muted-foreground">Visits</p>
                              <p className="font-semibold">{site.totalVisits || 0}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground">Response</p>
                              <p className="font-semibold">{siteHealth?.responseTimeMs ? `${siteHealth.responseTimeMs}ms` : "N/A"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground">Chatbot</p>
                              <Badge variant={site.chatbotEnabled ? "default" : "secondary"}>
                                {site.chatbotEnabled ? "Active" : "Off"}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground">Health</p>
                              <Badge variant={siteHealth?.status === "healthy" ? "default" : siteHealth?.status === "degraded" ? "outline" : siteHealth?.status === "down" ? "destructive" : "secondary"}>
                                {siteHealth?.status || "unchecked"}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground">Fee</p>
                              <p className="font-semibold text-green-500">${Number(site.monthlyFee || 0).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5" /> System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!healthChecks || healthChecks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-3 opacity-50 text-green-500" />
                    <p className="text-lg font-medium">No health checks recorded yet</p>
                    <p className="text-sm mt-1">Health checks are logged automatically when agents and websites are monitored. As you deploy services and the system runs checks, results will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary bar */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/30 border">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium">{healthStats.healthy} Healthy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">{healthStats.degraded} Degraded</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium">{healthStats.down} Down</span>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Timer className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Avg: {healthStats.avgResponseTime}ms</span>
                      </div>
                    </div>

                    {/* Health check list */}
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-2">
                        {healthChecks.map((check) => (
                          <div key={check.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-3">
                              {check.status === "healthy" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : check.status === "degraded" ? (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium capitalize">
                                  {check.entityType} #{check.entityId}
                                </p>
                                {check.errorMessage && (
                                  <p className="text-xs text-red-400">{check.errorMessage}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                {check.responseTimeMs ? `${check.responseTimeMs}ms` : "—"}
                              </span>
                              <Badge variant={check.status === "healthy" ? "default" : check.status === "degraded" ? "outline" : "destructive"}>
                                {check.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(check.checkedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" /> System Alerts
                </CardTitle>
                {alerts && alerts.filter(a => !a.isRead).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllRead.mutate()}
                    disabled={markAllRead.isPending}
                  >
                    <BellOff className="h-4 w-4 mr-1" /> Mark All Read
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!alerts || alerts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50 text-green-500" />
                    <p className="text-lg font-medium">All clear!</p>
                    <p className="text-sm mt-1">No alerts to show. Everything is running smoothly.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                            !alert.isRead ? "bg-accent/30 border-primary/20" : "bg-card"
                          } ${alert.resolvedAt ? "opacity-60" : ""}`}
                        >
                          <div className="mt-0.5">
                            {alert.severity === "critical" ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : alert.severity === "warning" ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <Bell className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{alert.title}</p>
                              <Badge variant={
                                alert.severity === "critical" ? "destructive" :
                                alert.severity === "warning" ? "outline" : "secondary"
                              } className="text-[10px]">
                                {alert.severity}
                              </Badge>
                              {alert.entityType && (
                                <Badge variant="secondary" className="text-[10px]">
                                  {alert.entityType}
                                </Badge>
                              )}
                              {alert.resolvedAt && (
                                <Badge variant="outline" className="text-[10px] text-green-500 border-green-500">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            {alert.message && (
                              <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!alert.resolvedAt && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveAlert.mutate({ id: alert.id })}
                              disabled={resolveAlert.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Settings Tab - Notification Preferences */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure how and when you receive alerts about your clients' agents and websites.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Real-Time Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications when critical events occur
                    </p>
                  </div>
                  <Switch
                    checked={notifPrefs?.emailEnabled ?? true}
                    onCheckedChange={(checked) => updatePrefs.mutate({ emailEnabled: checked })}
                  />
                </div>

                {/* Minimum Severity */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Minimum Severity</Label>
                    <p className="text-sm text-muted-foreground">
                      Only notify for alerts at or above this severity level
                    </p>
                  </div>
                  <Select
                    value={notifPrefs?.minSeverity ?? "warning"}
                    onValueChange={(value) => updatePrefs.mutate({ minSeverity: value as "info" | "warning" | "critical" })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cooldown Period */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Cooldown Period</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimum time between notifications for the same entity (prevents spam)
                    </p>
                  </div>
                  <Select
                    value={String(notifPrefs?.cooldownMinutes ?? 15)}
                    onValueChange={(value) => updatePrefs.mutate({ cooldownMinutes: parseInt(value) })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notification Status */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Notification Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>{" "}
                      <Badge variant={notifPrefs?.emailEnabled ? "default" : "secondary"}>
                        {notifPrefs?.emailEnabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Threshold:</span>{" "}
                      <Badge variant="outline" className="capitalize">
                        {notifPrefs?.minSeverity ?? "warning"}+
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cooldown:</span>{" "}
                      {notifPrefs?.cooldownMinutes ?? 15} min
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last notified:</span>{" "}
                      {(notifPrefs && "lastNotifiedAt" in notifPrefs && notifPrefs.lastNotifiedAt)
                        ? new Date(notifPrefs.lastNotifiedAt).toLocaleString()
                        : "Never"}
                    </div>
                  </div>
                </div>

                {/* How it works */}
                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                  <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">How Notifications Work</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>When an agent or website goes <strong>down</strong> or becomes <strong>degraded</strong>, an alert is created</li>
                    <li>If the alert meets your severity threshold, a push notification is sent to you instantly</li>
                    <li>The cooldown prevents repeated notifications for the same issue</li>
                    <li>All notifications are logged in the system for audit purposes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
