import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Key, Globe, CreditCard, Landmark, Zap, Copy, CheckCircle, Shield, Server } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const [copied, setCopied] = useState<string | null>(null);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast.success(`${label} copied`);
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure API keys, integrations, and deployment settings.</p>
        </div>

        {/* API Integrations */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Key className="h-4 w-4" /> API Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-accent/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Plaid</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">Sandbox</Badge>
              </div>
              <div className="grid gap-2">
                <div><Label className="text-[10px] text-muted-foreground">Client ID</Label><Input placeholder="Enter Plaid Client ID" className="h-8 text-xs bg-background/50" /></div>
                <div><Label className="text-[10px] text-muted-foreground">Secret</Label><Input type="password" placeholder="Enter Plaid Secret" className="h-8 text-xs bg-background/50" /></div>
              </div>
              <p className="text-[10px] text-muted-foreground">Get your keys at <a href="https://dashboard.plaid.com" target="_blank" className="text-primary hover:underline">dashboard.plaid.com</a></p>
            </div>

            <Separator />

            <div className="p-3 rounded-lg bg-accent/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-medium">Modern Treasury</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">Sandbox</Badge>
              </div>
              <div className="grid gap-2">
                <div><Label className="text-[10px] text-muted-foreground">Organization ID</Label><Input placeholder="Enter Organization ID" className="h-8 text-xs bg-background/50" /></div>
                <div><Label className="text-[10px] text-muted-foreground">API Key</Label><Input type="password" placeholder="Enter API Key" className="h-8 text-xs bg-background/50" /></div>
              </div>
              <p className="text-[10px] text-muted-foreground">Get your keys at <a href="https://app.moderntreasury.com" target="_blank" className="text-primary hover:underline">app.moderntreasury.com</a></p>
            </div>

            <Separator />

            <div className="p-3 rounded-lg bg-accent/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium">Stripe (Credit Card Processing)</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">Sandbox</Badge>
              </div>
              <div className="grid gap-2">
                <div><Label className="text-[10px] text-muted-foreground">Publishable Key</Label><Input placeholder="pk_test_..." className="h-8 text-xs bg-background/50" /></div>
                <div><Label className="text-[10px] text-muted-foreground">Secret Key</Label><Input type="password" placeholder="sk_test_..." className="h-8 text-xs bg-background/50" /></div>
              </div>
              <p className="text-[10px] text-muted-foreground">Get your keys at <a href="https://dashboard.stripe.com" target="_blank" className="text-primary hover:underline">dashboard.stripe.com</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Deployment */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Server className="h-4 w-4" /> Deployment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-accent/20 space-y-3">
              <p className="text-sm font-medium">Self-Hosted Deployment</p>
              <p className="text-xs text-muted-foreground">Deploy this platform on your own infrastructure using Docker.</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-background/50">
                  <code className="text-[10px] text-muted-foreground">docker-compose up -d</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard("docker-compose up -d", "Docker command")}>
                    {copied === "Docker command" ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">See the deployment guide in the project's DEPLOY.md file for full instructions.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-accent/20 space-y-3">
              <p className="text-sm font-medium">AWS Free Tier Deployment</p>
              <p className="text-xs text-muted-foreground">One-click deployment to AWS EC2 using the included CloudFormation template.</p>
              <div className="flex items-center justify-between p-2 rounded bg-background/50">
                <code className="text-[10px] text-muted-foreground">./deploy-aws.sh</code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard("./deploy-aws.sh", "AWS deploy")}>
                  {copied === "AWS deploy" ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-accent/20 space-y-3">
              <p className="text-sm font-medium">VPS Deployment</p>
              <p className="text-xs text-muted-foreground">Deploy to any VPS (DigitalOcean, Linode, Vultr, etc.) with a single command.</p>
              <div className="flex items-center justify-between p-2 rounded bg-background/50">
                <code className="text-[10px] text-muted-foreground">./deploy-vps.sh your-server-ip</code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard("./deploy-vps.sh your-server-ip", "VPS deploy")}>
                  {copied === "VPS deploy" ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-accent/20">
              <p className="text-xs text-muted-foreground">All API keys are encrypted at rest and transmitted over HTTPS. Plaid and Modern Treasury sandbox modes do not process real financial data.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
