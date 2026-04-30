import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Plus, Bot, Loader2, Trash2, Zap, Globe, FileUp, Link, Type, Send, ArrowLeft, Play, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { storagePut } from "../../../server/storage";

const statusColors: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", systemPrompt: "", clientName: "", monthlyFee: "", webAccessEnabled: true });

  const utils = trpc.useUtils();
  const { data: agents, isLoading } = trpc.agents.list.useQuery();
  const createMutation = trpc.agents.create.useMutation({
    onSuccess: (data) => { utils.agents.list.invalidate(); setDialogOpen(false); setSelectedAgent(data.id); toast.success("Agent created"); },
  });
  const deleteMutation = trpc.agents.delete.useMutation({
    onSuccess: () => { utils.agents.list.invalidate(); setSelectedAgent(null); toast.success("Agent deleted"); },
  });

  if (selectedAgent) {
    return <AgentDetail agentId={selectedAgent} onBack={() => setSelectedAgent(null)} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
            <p className="text-muted-foreground text-sm mt-1">Build, train, and deploy AI agents for your clients.</p>
          </div>
          <Button onClick={() => { setForm({ name: "", description: "", systemPrompt: "", clientName: "", monthlyFee: "", webAccessEnabled: true }); setDialogOpen(true); }} size="sm">
            <Plus className="h-4 w-4 mr-1" /> New Agent
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !agents?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Bot className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No agents yet. Build your first AI agent for a client.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent: any) => (
              <Card key={agent.id} className="bg-card border-border/50 hover:border-border transition-colors cursor-pointer" onClick={() => setSelectedAgent(agent.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{agent.name}</p>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[agent.status] || ""}`}>{agent.status}</Badge>
                      </div>
                      {agent.clientName && <p className="text-xs text-muted-foreground mt-1">Client: {agent.clientName}</p>}
                      {agent.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>}
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                    <span>{agent.totalInteractions || 0} interactions</span>
                    {agent.monthlyFee && Number(agent.monthlyFee) > 0 && <span>${Number(agent.monthlyFee).toFixed(2)}/mo</span>}
                    {agent.webAccessEnabled && <span className="flex items-center gap-1"><Globe className="h-2.5 w-2.5" />Web Access</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create AI Agent</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label className="text-xs">Agent Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Customer Support Bot" /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div><Label className="text-xs">System Prompt</Label><Textarea value={form.systemPrompt} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} rows={3} placeholder="Define the agent's personality and behavior..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Client Name</Label><Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></div>
              <div><Label className="text-xs">Monthly Fee ($)</Label><Input type="number" step="0.01" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Enable Web/Internet Access for Training</Label>
              <Switch checked={form.webAccessEnabled} onCheckedChange={(v) => setForm({ ...form, webAccessEnabled: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.name.trim()) { toast.error("Agent name is required"); return; }
              createMutation.mutate(form);
            }} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function AgentDetail({ agentId, onBack }: { agentId: number; onBack: () => void }) {
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [trainingDialog, setTrainingDialog] = useState(false);
  const [trainingType, setTrainingType] = useState<"file" | "url" | "text">("url");
  const [trainingContent, setTrainingContent] = useState("");
  const [trainingName, setTrainingName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: agent } = trpc.agents.getById.useQuery({ id: agentId });
  const { data: sources } = trpc.agents.trainingSources.useQuery({ agentId });
  const updateMutation = trpc.agents.update.useMutation({ onSuccess: () => { utils.agents.getById.invalidate(); utils.agents.list.invalidate(); toast.success("Agent updated"); } });
  const deleteMutation = trpc.agents.delete.useMutation({ onSuccess: () => { onBack(); utils.agents.list.invalidate(); toast.success("Agent deleted"); } });
  const addSourceMutation = trpc.agents.addTrainingSource.useMutation({ onSuccess: () => { utils.agents.trainingSources.invalidate(); setTrainingDialog(false); setTrainingContent(""); setTrainingName(""); toast.success("Training source added"); } });
  const deleteSourceMutation = trpc.agents.deleteTrainingSource.useMutation({ onSuccess: () => { utils.agents.trainingSources.invalidate(); toast.success("Source removed"); } });
  const testChatMutation = trpc.agents.testChat.useMutation({ onSuccess: (data) => { setTestResponse(data.content); } });

  if (!agent) return <DashboardLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></DashboardLayout>;

  const sourceStatusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400", processing: "bg-blue-500/10 text-blue-400",
    completed: "bg-emerald-500/10 text-emerald-400", failed: "bg-red-500/10 text-red-400",
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{agent.name}</h1>
              <Badge variant="outline" className={`text-[10px] ${statusColors[agent.status] || ""}`}>{agent.status}</Badge>
            </div>
            {agent.clientName && <p className="text-xs text-muted-foreground">Client: {agent.clientName}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Select value={agent.status} onValueChange={(v) => updateMutation.mutate({ id: agentId, status: v as any })}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate({ id: agentId })}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>

        <Tabs defaultValue="training">
          <TabsList className="bg-card">
            <TabsTrigger value="training">Training Sources</TabsTrigger>
            <TabsTrigger value="test">Test Agent</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Train your agent with files, URLs (web scraping), or text content.</p>
              <Button onClick={() => setTrainingDialog(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Source</Button>
            </div>

            {!sources?.length ? (
              <Card className="bg-card border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileUp className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No training sources. Add files, URLs, or text to train this agent.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-2">
                {sources.map((source: any) => (
                  <Card key={source.id} className="bg-card border-border/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-md bg-accent/50 flex items-center justify-center shrink-0">
                            {source.type === "url" ? <Link className="h-3.5 w-3.5" /> : source.type === "file" ? <FileUp className="h-3.5 w-3.5" /> : <Type className="h-3.5 w-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium truncate">{source.name || source.content?.slice(0, 50) || "Untitled"}</p>
                              <Badge variant="outline" className={`text-[10px] ${sourceStatusColors[source.status] || ""}`}>{source.status}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground capitalize">{source.type}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSourceMutation.mutate({ id: source.id })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="test" className="mt-3">
            <Card className="bg-card border-border/50">
              <CardContent className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">Test your agent with a sample conversation.</p>
                <div className="flex gap-2">
                  <Input
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { testChatMutation.mutate({ agentId, message: testMessage }); } }}
                    placeholder="Type a test message..."
                    className="bg-accent/30 border-0"
                  />
                  <Button onClick={() => testChatMutation.mutate({ agentId, message: testMessage })} disabled={testChatMutation.isPending || !testMessage.trim()} size="icon">
                    {testChatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                {testResponse && (
                  <div className="bg-accent/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">Agent Response</span>
                    </div>
                    <div className="text-sm prose prose-invert prose-sm max-w-none">
                      <Streamdown>{testResponse}</Streamdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-3">
            <Card className="bg-card border-border/50">
              <CardContent className="p-4 space-y-4">
                <div><Label className="text-xs">System Prompt</Label><Textarea defaultValue={agent.systemPrompt || ""} onBlur={(e) => updateMutation.mutate({ id: agentId, systemPrompt: e.target.value })} rows={5} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Client Name</Label><Input defaultValue={agent.clientName || ""} onBlur={(e) => updateMutation.mutate({ id: agentId, clientName: e.target.value })} /></div>
                  <div><Label className="text-xs">Monthly Fee ($)</Label><Input type="number" defaultValue={agent.monthlyFee || ""} onBlur={(e) => updateMutation.mutate({ id: agentId, monthlyFee: e.target.value })} /></div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Web/Internet Access</Label>
                  <Switch checked={agent.webAccessEnabled ?? true} onCheckedChange={(v) => updateMutation.mutate({ id: agentId, webAccessEnabled: v })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deploy" className="mt-3">
            <Card className="bg-card border-border/50">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-medium">Deployment Options</h3>
                <p className="text-xs text-muted-foreground">Deploy this agent as a standalone chatbot or embed it in a client website.</p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-accent/30">
                    <p className="text-xs font-medium">Standalone URL</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{agent.deploymentUrl || "Not deployed yet. Set status to Active to generate deployment URL."}</p>
                    {!agent.deploymentUrl && agent.status === "active" && (
                      <Button size="sm" className="mt-2" onClick={() => {
                        const url = `${window.location.origin}/agent/${agentId}`;
                        updateMutation.mutate({ id: agentId, deploymentUrl: url });
                      }}>
                        <Zap className="h-3.5 w-3.5 mr-1" /> Generate URL
                      </Button>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-accent/30">
                    <p className="text-xs font-medium">Embed Code</p>
                    <pre className="text-[10px] text-muted-foreground mt-1 bg-background/50 p-2 rounded overflow-x-auto">
{`<script>
  (function() {
    var s = document.createElement('script');
    s.src = '${window.location.origin}/api/chatbot/widget.js';
    s.dataset.agentId = '${agentId}';
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={trainingDialog} onOpenChange={setTrainingDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Training Source</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="flex gap-2">
              {[
                { value: "url" as const, icon: Globe, label: "URL / Web" },
                { value: "file" as const, icon: FileUp, label: "File Upload" },
                { value: "text" as const, icon: Type, label: "Text" },
              ].map((t) => (
                <button
                  key={t.value}
                  className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${trainingType === t.value ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}
                  onClick={() => setTrainingType(t.value)}
                >
                  <t.icon className={`h-4 w-4 ${trainingType === t.value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-[10px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
            <div><Label className="text-xs">Name</Label><Input value={trainingName} onChange={(e) => setTrainingName(e.target.value)} placeholder="Source name" /></div>
            {trainingType === "url" ? (
              <div>
                <Label className="text-xs">URL (agent will scrape and learn from this page)</Label>
                <Input value={trainingContent} onChange={(e) => setTrainingContent(e.target.value)} placeholder="https://example.com/docs" />
                <p className="text-[10px] text-muted-foreground mt-1">The agent will access this URL via the internet and process the content for training.</p>
              </div>
            ) : trainingType === "text" ? (
              <div>
                <Label className="text-xs">Training Text</Label>
                <Textarea value={trainingContent} onChange={(e) => setTrainingContent(e.target.value)} rows={5} placeholder="Paste knowledge base content, FAQs, product info..." />
              </div>
            ) : (
              <div>
                <Label className="text-xs">Upload File</Label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-border transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Click to upload a file (PDF, TXT, DOC, CSV)</p>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt,.doc,.docx,.csv,.json" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setTrainingName(file.name); setTrainingContent(file.name); toast.info(`File "${file.name}" selected. Will be uploaded on submit.`); }
                  }} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrainingDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!trainingContent.trim()) { toast.error("Content is required"); return; }
              addSourceMutation.mutate({ agentId, type: trainingType, name: trainingName || undefined, content: trainingContent });
            }} disabled={addSourceMutation.isPending}>
              {addSourceMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Add Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
