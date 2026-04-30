import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Brain, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  business: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  personal: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  preference: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function AIMemory() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ key: "", value: "", category: "business" });

  const utils = trpc.useUtils();
  const { data: memories, isLoading } = trpc.ai.memories.useQuery();
  const saveMutation = trpc.ai.saveMemory.useMutation({
    onSuccess: () => { utils.ai.memories.invalidate(); setDialogOpen(false); setForm({ key: "", value: "", category: "business" }); toast.success("Memory saved"); },
  });
  const deleteMutation = trpc.ai.deleteMemory.useMutation({
    onSuccess: () => { utils.ai.memories.invalidate(); toast.success("Memory deleted"); },
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Memory</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage what your AI assistant remembers about you and your business.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Memory</Button>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span>Your AI assistant automatically learns from conversations. You can also manually add facts here. Memories persist across all conversations.</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !memories?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Brain className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No memories yet. Your AI will learn from conversations, or add facts manually.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {memories.map((mem: any) => (
              <Card key={mem.id} className="bg-card border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{mem.key}</p>
                        {mem.category && <Badge variant="outline" className={`text-[10px] ${categoryColors[mem.category] || ""}`}>{mem.category}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{mem.value}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => deleteMutation.mutate({ id: mem.id })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Memory</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label className="text-xs">Key / Topic *</Label><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="e.g., business_name, preferred_language" /></div>
            <div><Label className="text-xs">Value / Fact *</Label><Textarea value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} rows={3} placeholder="What should the AI remember?" /></div>
            <div><Label className="text-xs">Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="business, personal, preference" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.key.trim() || !form.value.trim()) { toast.error("Key and value are required"); return; }
              saveMutation.mutate(form);
            }} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
