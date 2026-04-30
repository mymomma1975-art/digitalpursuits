import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Globe, Loader2, Trash2, ExternalLink, Code, Bot, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  maintenance: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function Websites() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [embedDialog, setEmbedDialog] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "", clientName: "", monthlyFee: "", chatbotEnabled: true, chatbotAgentId: "" });

  const utils = trpc.useUtils();
  const { data: websites, isLoading } = trpc.websites.list.useQuery();
  const { data: agents } = trpc.agents.list.useQuery();
  const createMutation = trpc.websites.create.useMutation({
    onSuccess: () => { utils.websites.list.invalidate(); setDialogOpen(false); setForm({ name: "", domain: "", clientName: "", monthlyFee: "", chatbotEnabled: true, chatbotAgentId: "" }); toast.success("Website created"); },
  });
  const updateMutation = trpc.websites.update.useMutation({ onSuccess: () => { utils.websites.list.invalidate(); toast.success("Website updated"); } });
  const deleteMutation = trpc.websites.delete.useMutation({ onSuccess: () => { utils.websites.list.invalidate(); toast.success("Website deleted"); } });

  function copyEmbed(websiteId: number) {
    const code = `<script>
  (function() {
    var s = document.createElement('script');
    s.src = '${window.location.origin}/api/chatbot/widget.js';
    s.dataset.websiteId = '${websiteId}';
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Embed code copied to clipboard");
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Client Websites</h1>
            <p className="text-muted-foreground text-sm mt-1">Build and manage websites for your clients with embedded chatbots.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> New Website</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !websites?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Globe className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No websites yet. Create your first client website.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {websites.map((site: any) => (
              <Card key={site.id} className="bg-card border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{site.name}</p>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[site.status] || ""}`}>{site.status}</Badge>
                      </div>
                      {site.domain && (
                        <a href={`https://${site.domain}`} target="_blank" rel="noopener" className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                          {site.domain} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                      {site.clientName && <p className="text-xs text-muted-foreground mt-1">Client: {site.clientName}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyEmbed(site.id)} title="Copy embed code">
                        {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Code className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate({ id: site.id })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                    {site.chatbotEnabled && <span className="flex items-center gap-1"><Bot className="h-2.5 w-2.5 text-primary" />Chatbot Active</span>}
                    {site.monthlyFee && Number(site.monthlyFee) > 0 && <span>${Number(site.monthlyFee).toFixed(2)}/mo</span>}
                    <span>{site.totalVisits || 0} visits</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Select value={site.status} onValueChange={(v) => updateMutation.mutate({ id: site.id, status: v as any })}>
                      <SelectTrigger className="h-7 text-[10px] flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Client Website</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label className="text-xs">Website Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label className="text-xs">Domain</Label><Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="client-site.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Client Name</Label><Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></div>
              <div><Label className="text-xs">Monthly Fee ($)</Label><Input type="number" step="0.01" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Enable Chatbot</Label>
              <Switch checked={form.chatbotEnabled} onCheckedChange={(v) => setForm({ ...form, chatbotEnabled: v })} />
            </div>
            {form.chatbotEnabled && agents?.length ? (
              <div><Label className="text-xs">Chatbot Agent</Label>
                <Select value={form.chatbotAgentId} onValueChange={(v) => setForm({ ...form, chatbotAgentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select an agent" /></SelectTrigger>
                  <SelectContent>{agents.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.name.trim()) { toast.error("Website name is required"); return; }
              createMutation.mutate({ ...form, chatbotAgentId: form.chatbotAgentId ? Number(form.chatbotAgentId) : undefined });
            }} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
