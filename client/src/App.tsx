import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import { useUser } from "@/hooks/use-health";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("admin");
  const queryClient = useQueryClient();

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: "any" })
    });
    if (res.ok) queryClient.invalidateQueries({ queryKey: ["/api/me"] });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">CareYogi Login</CardTitle>
          <p className="text-sm text-muted-foreground">Welcome back to your health overview</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Username"
              className="rounded-xl h-11"
            />
          </div>
          <Button onClick={handleLogin} className="w-full rounded-xl h-11 text-base font-medium">
            Sign In
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Use "admin" to login for PoC demo
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Router() {
  const { data: user, isLoading } = useUser();

  if (isLoading) return null;
  if (!user) return <Login />;

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
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
