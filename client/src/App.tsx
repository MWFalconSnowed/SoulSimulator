import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import IDE from "@/pages/ide";
import NotFound from "@/pages/not-found";
import MetaPrompt from "@/pages/meta-prompt";
import TempleAwakening from "@/pages/temple-awakening";

function Router() {
  return (
    <Switch>
      <Route path="/" component={IDE} />
      <Route path="/meta-prompt" component={MetaPrompt} />
      <Route path="/temple" component={TempleAwakening} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
