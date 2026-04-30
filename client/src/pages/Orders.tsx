import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, CreditCard, Clock, CheckCircle2, XCircle, RefreshCw, Package, CalendarDays, AlertCircle } from "lucide-react";
import { useMemo, useEffect } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useSearch } from "wouter";

export default function Orders() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const success = params.get("success");

  const ordersQuery = trpc.stripe.orders.useQuery(undefined, { enabled: isAuthenticated });
  const subscriptionsQuery = trpc.stripe.subscriptions.useQuery(undefined, { enabled: isAuthenticated });
  const cancelSub = trpc.stripe.cancelSubscription.useMutation({
    onSuccess: () => { toast.success("Subscription will cancel at end of billing period"); subscriptionsQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (success === "true") {
      toast.success("Payment successful! Your order has been placed.");
      ordersQuery.refetch();
    }
  }, [success]);

  const orders = ordersQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];

  const completedOrders = useMemo(() => orders.filter((o: any) => o.status === "completed"), [orders]);
  const pendingOrders = useMemo(() => orders.filter((o: any) => o.status === "pending"), [orders]);
  const activeSubscriptions = useMemo(() => subscriptions.filter((s: any) => s.status === "active" && !s.cancelAtPeriodEnd), [subscriptions]);

  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    pending: { icon: Clock, color: "text-amber-400", label: "Pending" },
    completed: { icon: CheckCircle2, color: "text-emerald-400", label: "Completed" },
    failed: { icon: XCircle, color: "text-red-400", label: "Failed" },
    refunded: { icon: RefreshCw, color: "text-blue-400", label: "Refunded" },
  };

  if (authLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></DashboardLayout>;
  if (!isAuthenticated) return <DashboardLayout><div className="flex flex-col items-center justify-center h-64 gap-4"><p className="text-muted-foreground">Please sign in to view orders.</p><Button onClick={() => window.location.href = getLoginUrl()}>Sign In</Button></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders & Subscriptions</h1>
          <p className="text-muted-foreground">Track your purchases and manage active subscriptions.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-emerald-500/10"><CheckCircle2 className="h-5 w-5 text-emerald-400" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Orders</p>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-amber-500/10"><Clock className="h-5 w-5 text-amber-400" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-violet-500/10"><CreditCard className="h-5 w-5 text-violet-400" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions ({subscriptions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground">Your purchase history will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => {
                  const config = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <Card key={order.id} className="hover:border-primary/20 transition-colors">
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-lg bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(order.createdAt).toLocaleDateString()}</span>
                              {order.customerEmail && <span>{order.customerEmail}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {order.amount && (
                            <span className="text-lg font-semibold">${parseFloat(order.amount).toFixed(2)}</span>
                          )}
                          <Badge variant="outline" className={`${config.color} border-current/30`}>
                            <StatusIcon className="h-3 w-3 mr-1" />{config.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-4">
            {subscriptions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Subscriptions</h3>
                  <p className="text-muted-foreground">Your active subscriptions will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub: any) => {
                  const isActive = sub.status === "active" && !sub.cancelAtPeriodEnd;
                  const isCancelling = sub.cancelAtPeriodEnd;
                  return (
                    <Card key={sub.id} className="hover:border-primary/20 transition-colors">
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-lg ${isActive ? "bg-emerald-500/10" : "bg-muted"}`}>
                            <CreditCard className={`h-5 w-5 ${isActive ? "text-emerald-400" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-medium">Subscription #{sub.id}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                              <span>Started {new Date(sub.createdAt).toLocaleDateString()}</span>
                              {sub.currentPeriodEnd && <span>Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isActive && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Active</Badge>
                          )}
                          {isCancelling && (
                            <Badge variant="outline" className="text-amber-400 border-amber-400/30">Cancelling</Badge>
                          )}
                          {sub.status === "cancelled" && (
                            <Badge variant="outline" className="text-red-400 border-red-400/30">Cancelled</Badge>
                          )}
                          {isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              disabled={cancelSub.isPending}
                              onClick={() => { if (confirm("Cancel this subscription? It will remain active until the end of the current billing period.")) cancelSub.mutate({ stripeSubscriptionId: sub.stripeSubscriptionId }); }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
