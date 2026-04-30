import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { DollarSign, TrendingUp, TrendingDown, BarChart3, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function Reports() {
  const [reportType, setReportType] = useState("pnl");

  const { data: transactions } = trpc.transactions.list.useQuery();
  const { data: accounts } = trpc.accounts.list.useQuery();
  const { data: invoices } = trpc.invoices.list.useQuery();

  const income = useMemo(() => (transactions || []).filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0), [transactions]);
  const expenses = useMemo(() => (transactions || []).filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0), [transactions]);
  const netIncome = income - expenses;

  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    (transactions || []).filter((t: any) => t.type === "expense").forEach((t: any) => {
      const cat = t.category || "Uncategorized";
      cats[cat] = (cats[cat] || 0) + Number(t.amount);
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const balanceSheet = useMemo(() => {
    const totals: Record<string, number> = { asset: 0, liability: 0, equity: 0 };
    (accounts || []).forEach((a: any) => { if (totals[a.type] !== undefined) totals[a.type] += Number(a.balance || 0); });
    return totals;
  }, [accounts]);

  const invoiceStats = useMemo(() => {
    const stats = { total: 0, paid: 0, outstanding: 0, overdue: 0 };
    (invoices || []).forEach((inv: any) => {
      const amount = Number(inv.total || 0);
      stats.total += amount;
      if (inv.status === "paid") stats.paid += amount;
      else if (inv.status === "overdue") stats.overdue += amount;
      else stats.outstanding += amount;
    });
    return stats;
  }, [invoices]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">Profit & Loss, Balance Sheet, and financial summaries.</p>
          </div>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pnl">Profit & Loss</SelectItem>
              <SelectItem value="balance">Balance Sheet</SelectItem>
              <SelectItem value="invoices">Invoice Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {reportType === "pnl" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Income</p>
                  </div>
                  <p className="text-2xl font-bold mt-1 text-emerald-400">${income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Expenses</p>
                  </div>
                  <p className="text-2xl font-bold mt-1 text-red-400">${expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
              <Card className={`${netIncome >= 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className={`h-4 w-4 ${netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`} />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Net Income</p>
                  </div>
                  <p className={`text-2xl font-bold mt-1 ${netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}>${netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Expense Breakdown</CardTitle></CardHeader>
              <CardContent>
                {categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categoryBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">No expense data yet. Record transactions to see breakdown.</div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {reportType === "balance" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Assets", value: balanceSheet.asset, color: "emerald" },
                { label: "Total Liabilities", value: balanceSheet.liability, color: "red" },
                { label: "Total Equity", value: balanceSheet.equity, color: "violet" },
              ].map((item) => (
                <Card key={item.label} className="bg-card border-border/50">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Accounts Summary</CardTitle></CardHeader>
              <CardContent>
                {accounts?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Account</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Type</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((a: any) => (
                          <tr key={a.id} className="border-b border-border/30">
                            <td className="py-2 px-3 font-medium">{a.name}</td>
                            <td className="py-2 px-3 capitalize text-muted-foreground">{a.type}</td>
                            <td className="py-2 px-3 text-right tabular-nums">${Number(a.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">No accounts yet</div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {reportType === "invoices" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Invoiced", value: invoiceStats.total, color: "" },
                { label: "Paid", value: invoiceStats.paid, color: "text-emerald-400" },
                { label: "Outstanding", value: invoiceStats.outstanding, color: "text-amber-400" },
                { label: "Overdue", value: invoiceStats.overdue, color: "text-red-400" },
              ].map((item) => (
                <Card key={item.label} className="bg-card border-border/50">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{item.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${item.color}`}>${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-card border-border/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  {invoices?.length ? `${invoices.length} total invoices tracked.` : "No invoices yet. Create invoices to see summary."}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
