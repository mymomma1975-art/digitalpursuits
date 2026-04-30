import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, GitBranch, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Pipelines() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();
  const { data: pipelines, isLoading } = trpc.pipelines.list.useQuery();
  const createMutation = trpc.pipelines.create.useMutation({
    onSuccess: () => { utils.pipelines.list.invalidate(); setDialogOpen(false); setName(""); setDescription(""); toast.success("Pipeline created"); },
  });
  const deleteMutation = trpc.pipelines.delete.useMutation({
    onSuccess: () => { utils.pipelines.list.invalidate(); toast.success("Pipeline deleted"); },
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pipelines</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your sales pipelines and stages.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> New Pipeline</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !pipelines?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <GitBranch className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No pipelines yet. Create your first sales pipeline.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pipelines.map((pipeline) => (
              <PipelineCard key={pipeline.id} pipeline={pipeline} onDelete={() => deleteMutation.mutate({ id: pipeline.id })} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Pipeline</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label className="text-xs">Pipeline Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sales Pipeline" /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!name.trim()) { toast.error("Name is required"); return; } createMutation.mutate({ name, description }); }} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function PipelineCard({ pipeline, onDelete }: { pipeline: any; onDelete: () => void }) {
  const { data: stages } = trpc.pipelines.stages.useQuery({ pipelineId: pipeline.id });

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{pipeline.name}</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
        {pipeline.description && <p className="text-xs text-muted-foreground">{pipeline.description}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {stages?.map((stage: any) => (
            <div key={stage.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/50 text-xs">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
              {stage.name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
