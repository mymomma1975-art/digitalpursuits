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
import { Plus, Search, Trash2, Edit, Loader2, Users, Mail, Phone, Building } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  lead: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  customer: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  inactive: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [form, setForm] = useState<{ firstName: string; lastName: string; email: string; phone: string; company: string; title: string; status: "lead" | "active" | "customer" | "inactive"; notes: string }>({ firstName: "", lastName: "", email: "", phone: "", company: "", title: "", status: "lead", notes: "" });

  const utils = trpc.useUtils();
  const { data: contacts, isLoading } = trpc.contacts.list.useQuery({ search: search || undefined });
  const createMutation = trpc.contacts.create.useMutation({ onSuccess: () => { utils.contacts.list.invalidate(); setDialogOpen(false); resetForm(); toast.success("Contact created"); } });
  const updateMutation = trpc.contacts.update.useMutation({ onSuccess: () => { utils.contacts.list.invalidate(); setDialogOpen(false); resetForm(); toast.success("Contact updated"); } });
  const deleteMutation = trpc.contacts.delete.useMutation({ onSuccess: () => { utils.contacts.list.invalidate(); toast.success("Contact deleted"); } });

  function resetForm() {
    setForm({ firstName: "", lastName: "", email: "", phone: "", company: "", title: "", status: "lead", notes: "" });
    setEditingContact(null);
  }

  function openEdit(contact: any) {
    setEditingContact(contact);
    setForm({ firstName: contact.firstName, lastName: contact.lastName || "", email: contact.email || "", phone: contact.phone || "", company: contact.company || "", title: contact.title || "", status: contact.status as any, notes: contact.notes || "" });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.firstName.trim()) { toast.error("First name is required"); return; }
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your business contacts and relationships.</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Contact
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !contacts?.length ? (
          <Card className="bg-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No contacts yet. Add your first contact to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {contacts.map((contact) => (
              <Card key={contact.id} className="bg-card border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">{contact.firstName.charAt(0)}{contact.lastName?.charAt(0) || ""}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{contact.firstName} {contact.lastName}</p>
                          <Badge variant="outline" className={`text-[10px] ${statusColors[contact.status] || ""}`}>{contact.status}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {contact.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>}
                          {contact.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</span>}
                          {contact.company && <span className="flex items-center gap-1"><Building className="h-3 w-3" />{contact.company}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(contact)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate({ id: contact.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">First Name *</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
              <div><Label className="text-xs">Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div><Label className="text-xs">Job Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingContact ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
