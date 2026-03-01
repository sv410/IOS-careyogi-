import React from "react";
import { Activity, Apple, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-health";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { data: user } = useUser();
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-semibold text-lg">CareYogi</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <span className="text-foreground transition-colors">Dashboard</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Insights</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Settings</span>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
              <Apple className="w-3.5 h-3.5" />
              <span>Bridge Active</span>
              <div className="w-2 h-2 rounded-full bg-green-500 ml-1 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 ml-2 border-l pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{user?.name || "Guest"}</p>
                <p className="text-xs text-muted-foreground mt-1">{user?.age}y • {user?.gender}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 border-2 border-white shadow-md flex items-center justify-center text-white font-display font-bold text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('') || "U"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="border-t border-border/50 bg-white py-8 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CareYogi Health Integration.</p>
          <p>Powered by Apple HealthKit</p>
        </div>
      </footer>
    </div>
  );
}
