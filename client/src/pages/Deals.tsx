import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Handshake, Loader2, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  won: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  lost: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Deals() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<string>("");
  const [form, setForm] = useState({ title: "", pipelineId: "", stageId: "", value: "", notes: "" });

  const utils = trpc.useUtils();
  const { data: deals, isLoading } = trpc.deals.list.useQuery(selectedPipeline ? { pipelineId: Number(selectedPipeline) } : undefined);
  const { data: pipelines } = trpc.pipelines.list.useQuery();
  const { data: stages } = trpc.pipelines.stages.useQuery(
    { pipelineId: Number(form.pipelineId) },
    { enabled: !!form.pipelineId }
  );

  const createMutation = trpc.deals.create.useMutation({
    onSuccess: () => { utils.deals.list.invalidate(); setDialogOpen(false); setForm({ title: "", pipelineId: "", stageId: "", value: "", notes: "" }); toast.success("Deal created"); },
  });
  const updateMutation = trpc.deals.update.useMutation({ onSuccess: () => { utils.deals.list.invalidate(); toast.success("Deal updated"); } });
  const deleteMutation = trpc.deals.delete.useMutation({ onSuccess: () => { utils.deals.list.invalidate(); toast.success("Deal deleted"); } });

  // Group deals by stage for kanban-like view
  const allStages = useMemo(() => {
    if (!selectedPipeline) return [];
    return stages || [];
  }, [selectedPipeline, stages]);

  const { data: filterStages } = trpc.pipelines.stages.useQuery(
    { pipelineId: Number(selectedPipeline) },
    { enabled: !!selectedPipeline }
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
            <p className="text-muted-foreground text-sm mt-1">Track and manage your sales deals.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> New Deal</Button>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
            <SelectTrigger className="w-[200px] bg-card"><SelectValue placeholder="All Pipelines" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pipelines</SelectItem>
              {pipelines?.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !deals?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Handshake className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No deals yet. Create your first deal to start tracking sales.</p>
            </CardContent>
          </Card>
        ) : selectedPipeline && selectedPipeline !== "all" && filterStages?.length ? (
          // Kanban view when pipeline selected
          <div className="flex gap-4 overflow-x-auto pb-4">
            {filterStages.map((stage: any) => {
              const stageDeals = deals.filter((d: any) => d.stageId === stage.id);
              return (
                <div key={stage.id} className="min-w-[280px] flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stage.name}</span>
                    <Badge variant="secondary" className="text-[10px] h-5">{stageDeals.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {stageDeals.map((deal: any) => (
                      <Card key={deal.id} className="bg-card border-border/50 hover:border-border transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{deal.title}</p>
                              {deal.value && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <DollarSign className="h-3 w-3" />{Number(deal.value).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Select value={deal.status} onValueChange={(v) => updateMutation.mutate({ id: deal.id, status: v as any })}>
                                <SelectTrigger className="h-6 w-16 text-[10px] border-0 bg-transparent p-0"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="won">Won</SelectItem>
                                  <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate({ id: deal.id })}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List view
          <div className="grid gap-3">
            {deals.map((deal: any) => (
              <Card key={deal.id} className="bg-card border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{deal.title}</p>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[deal.status] || ""}`}>{deal.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {deal.value && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${Number(deal.value).toLocaleString()}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate({ id: deal.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Deal</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label className="text-xs">Deal Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label className="text-xs">Pipeline *</Label>
              <Select value={form.pipelineId} onValueChange={(v) => setForm({ ...form, pipelineId: v, stageId: "" })}>
                <SelectTrigger><SelectValue placeholder="Select pipeline" /></SelectTrigger>
                <SelectContent>{pipelines?.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {stages?.length ? (
              <div><Label className="text-xs">Stage *</Label>
                <Select value={form.stageId} onValueChange={(v) => setForm({ ...form, stageId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>{stages.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : null}
            <div><Label className="text-xs">Value ($)</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
            <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.title.trim() || !form.pipelineId || !form.stageId) { toast.error("Title, pipeline and stage are required"); return; }
              createMutation.mutate({ title: form.title, pipelineId: Number(form.pipelineId), stageId: Number(form.stageId), value: form.value || undefined, notes: form.notes || undefined });
            }} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
