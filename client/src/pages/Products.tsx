import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Package, Plus, DollarSign, CreditCard, ShoppingCart, Repeat, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Products() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "one_time" as "one_time" | "subscription",
    amount: "",
    currency: "USD",
    interval: "month" as "month" | "year" | "week",
  });

  const productsQuery = trpc.stripe.products.useQuery(undefined, { enabled: isAuthenticated });
  const createProduct = trpc.stripe.createProduct.useMutation({
    onSuccess: (data) => {
      if ('error' in data && data.error) {
        toast.warning("Product saved locally but Stripe sync failed: " + data.error);
      } else {
        toast.success("Product created and synced with Stripe!");
      }
      setShowCreate(false);
      setForm({ name: "", description: "", type: "one_time", amount: "", currency: "USD", interval: "month" });
      productsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteProduct = trpc.stripe.deleteProduct.useMutation({
    onSuccess: () => { toast.success("Product archived"); productsQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      toast.info("Redirecting to Stripe Checkout...");
      window.open(data.url, "_blank");
    },
    onError: (err) => toast.error(err.message),
  });

  const products = productsQuery.data ?? [];
  const activeProducts = useMemo(() => products.filter((p: any) => p.isActive !== false), [products]);
  const oneTimeProducts = useMemo(() => activeProducts.filter((p: any) => p.type === "one_time"), [activeProducts]);
  const subscriptionProducts = useMemo(() => activeProducts.filter((p: any) => p.type === "subscription"), [activeProducts]);

  if (authLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></DashboardLayout>;
  if (!isAuthenticated) return <DashboardLayout><div className="flex flex-col items-center justify-center h-64 gap-4"><p className="text-muted-foreground">Please sign in to manage products.</p><Button onClick={() => window.location.href = getLoginUrl()}>Sign In</Button></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products & Pricing</h1>
            <p className="text-muted-foreground">Create products and subscriptions. Customers pay via Stripe Checkout.</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Product</DialogTitle>
                <DialogDescription>This will create a product in Stripe and your local catalog.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="e.g. AI Agent - Pro Plan" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="What does this product include?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v: any) => setForm(f => ({ ...f, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">One-time Payment</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input type="number" step="0.01" min="0.50" placeholder="29.99" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                </div>
                {form.type === "subscription" && (
                  <div className="space-y-2">
                    <Label>Billing Interval</Label>
                    <Select value={form.interval} onValueChange={(v: any) => setForm(f => ({ ...f, interval: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button
                  disabled={!form.name || !form.amount || createProduct.isPending}
                  onClick={() => createProduct.mutate(form)}
                >
                  {createProduct.isPending ? "Creating..." : "Create Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info banner */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="flex items-start gap-3 pt-4 pb-4">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p><strong className="text-foreground">Test Mode:</strong> Use card number <code className="bg-muted px-1 py-0.5 rounded text-xs">4242 4242 4242 4242</code> with any future expiry and any CVC to test payments. Products are synced with your Stripe account.</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-emerald-500/10"><DollarSign className="h-5 w-5 text-emerald-400" /></div>
              <div>
                <p className="text-sm text-muted-foreground">One-time Products</p>
                <p className="text-2xl font-bold">{oneTimeProducts.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-violet-500/10"><Repeat className="h-5 w-5 text-violet-400" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Subscriptions</p>
                <p className="text-2xl font-bold">{subscriptionProducts.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-blue-500/10"><Package className="h-5 w-5 text-blue-400" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold">{activeProducts.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product List */}
        {activeProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first product to start accepting payments.</p>
              <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Create Product</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* One-time products */}
            {oneTimeProducts.length > 0 && (
              <>
                <h2 className="text-lg font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5" />One-time Products</h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {oneTimeProducts.map((product: any) => (
                    <Card key={product.id} className="group hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{product.name}</CardTitle>
                            {product.description && <CardDescription className="mt-1">{product.description}</CardDescription>}
                          </div>
                          <Badge variant="outline" className="shrink-0">One-time</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">${parseFloat(product.amount).toFixed(2)}</span>
                          <span className="text-muted-foreground text-sm">{product.currency}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {product.stripeProductId ? (
                            <span className="flex items-center gap-1 text-emerald-400"><CreditCard className="h-3 w-3" />Synced with Stripe</span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400"><AlertCircle className="h-3 w-3" />Local only</span>
                          )}
                        </div>
                        <Separator />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={!product.stripePriceId || createCheckout.isPending}
                            onClick={() => createCheckout.mutate({ productId: product.id, origin: window.location.origin })}
                          >
                            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />Buy Now
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => { if (confirm("Archive this product?")) deleteProduct.mutate({ id: product.id }); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Subscription products */}
            {subscriptionProducts.length > 0 && (
              <>
                <h2 className="text-lg font-semibold flex items-center gap-2 mt-6"><Repeat className="h-5 w-5" />Subscription Plans</h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {subscriptionProducts.map((product: any) => (
                    <Card key={product.id} className="group hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{product.name}</CardTitle>
                            {product.description && <CardDescription className="mt-1">{product.description}</CardDescription>}
                          </div>
                          <Badge className="shrink-0 bg-violet-500/10 text-violet-400 border-violet-500/30">Subscription</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">${parseFloat(product.amount).toFixed(2)}</span>
                          <span className="text-muted-foreground text-sm">/ {product.interval || "month"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {product.stripeProductId ? (
                            <span className="flex items-center gap-1 text-emerald-400"><CreditCard className="h-3 w-3" />Synced with Stripe</span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400"><AlertCircle className="h-3 w-3" />Local only</span>
                          )}
                        </div>
                        <Separator />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={!product.stripePriceId || createCheckout.isPending}
                            onClick={() => createCheckout.mutate({ productId: product.id, origin: window.location.origin })}
                          >
                            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />Subscribe
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => { if (confirm("Archive this product?")) deleteProduct.mutate({ id: product.id }); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
