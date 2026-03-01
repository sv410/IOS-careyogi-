import { Smartphone, RefreshCcw, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export function BridgeInfo() {
  return (
    <Card className="border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          Architecture: iOS Bridge
        </CardTitle>
        <CardDescription className="text-base">
          How your health data securely flows into this dashboard:
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 gap-6 mt-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-border/50 flex flex-shrink-0 items-center justify-center">
              <Smartphone className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">1. Apple Health</h4>
              <p className="text-sm text-muted-foreground">Data is recorded securely via HealthKit on your iPhone.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex flex-shrink-0 items-center justify-center">
              <RefreshCcw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">2. Bridge Sync</h4>
              <p className="text-sm text-muted-foreground">The CareYogi Bridge app requests permission and syncs your metrics.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-border/50 flex flex-shrink-0 items-center justify-center">
              <Lock className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">3. Encrypted API</h4>
              <p className="text-sm text-muted-foreground">Our secure backend processes the payload and serves it here.</p>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
