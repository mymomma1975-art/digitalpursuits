import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Contacts from "./pages/Contacts";
import Pipelines from "./pages/Pipelines";
import Deals from "./pages/Deals";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Invoices from "./pages/Invoices";
import Banking from "./pages/Banking";
import Payments from "./pages/Payments";
import AIChat from "./pages/AIChat";
import AIMemory from "./pages/AIMemory";
import Agents from "./pages/Agents";
import Websites from "./pages/Websites";
import Analytics from "./pages/Analytics";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Products from "./pages/Products";
import Orders from "./pages/Orders";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      {/* CRM */}
      <Route path={"/contacts"} component={Contacts} />
      <Route path={"/pipelines"} component={Pipelines} />
      <Route path={"/deals"} component={Deals} />
      {/* Accounting */}
      <Route path={"/accounts"} component={Accounts} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/invoices"} component={Invoices} />
      <Route path={"/reports"} component={Reports} />
      {/* Banking & Payments */}
      <Route path={"/banking"} component={Banking} />
      <Route path={"/payments"} component={Payments} />
      {/* AI */}
      <Route path={"/ai-chat"} component={AIChat} />
      <Route path={"/ai-memory"} component={AIMemory} />
      {/* Client Services */}
      <Route path={"/agents"} component={Agents} />
      <Route path={"/websites"} component={Websites} />
      {/* Stripe */}
      <Route path={"/products"} component={Products} />
      <Route path={"/orders"} component={Orders} />
      {/* Business */}
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/billing"} component={Billing} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
