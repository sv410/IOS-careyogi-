import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Flame, Footprints, HeartPulse, Moon, Plus } from "lucide-react";
import { useDashboardData, useSubmitHealthData } from "@/hooks/use-health";
import { Layout } from "@/components/layout";
import { BridgeInfo } from "@/components/bridge-info";
import { HealthChart } from "@/components/health-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboardData();
  const submitData = useSubmitHealthData();

  const handleSimulateData = () => {
    // Generate some random realistic-looking data
    const mockData = {
      steps: Math.floor(Math.random() * 2000) + 1000,
      heartRate: Math.floor(Math.random() * 40) + 60,
      calories: Math.floor(Math.random() * 300) + 100,
      sleepHours: +(Math.random() * 2 + 6).toFixed(1),
      timestamp: new Date().toISOString(),
    };
    submitData.mutate(mockData);
  };

  const aggregates = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const totalSteps = data.reduce((acc, curr) => acc + curr.steps, 0);
    const totalCalories = data.reduce((acc, curr) => acc + curr.calories, 0);
    
    // Avg HR ignoring zeros
    const hrItems = data.filter(d => d.heartRate > 0);
    const avgHr = hrItems.length ? Math.round(hrItems.reduce((acc, curr) => acc + curr.heartRate, 0) / hrItems.length) : 0;
    
    // Use the latest sleep entry or average
    const latestSleep = data[data.length - 1]?.sleepHours || 0;

    return { totalSteps, totalCalories, avgHr, latestSleep };
  }, [data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[120px] rounded-2xl" />)}
          </div>
          <Skeleton className="h-[450px] w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-semibold">Connection Error</h2>
          <p className="text-muted-foreground max-w-md">We couldn't reach the Apple Health bridge API. Please check if the Flask backend is running.</p>
        </div>
      </Layout>
    );
  }

  const hasData = data && data.length > 0;

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold tracking-tight text-slate-900">Your Overview</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Auto-refreshing every 10s from iOS Bridge
            </p>
          </div>
          <Button 
            onClick={handleSimulateData} 
            disabled={submitData.isPending}
            className="rounded-full shadow-md hover:shadow-lg transition-all"
          >
            {submitData.isPending ? "Syncing..." : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Simulate Sync
              </>
            )}
          </Button>
        </div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="Total Steps" 
              value={aggregates?.totalSteps.toLocaleString() || "0"} 
              unit="steps" 
              icon={<Footprints className="w-5 h-5 text-teal-600" />} 
              trend="+14% vs yesterday"
              trendUp={true}
              colorClass="bg-teal-50"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="Avg Heart Rate" 
              value={aggregates?.avgHr.toString() || "0"} 
              unit="bpm" 
              icon={<HeartPulse className="w-5 h-5 text-rose-500" />} 
              trend="Normal range"
              trendUp={true}
              colorClass="bg-rose-50"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="Energy Burned" 
              value={aggregates?.totalCalories.toLocaleString() || "0"} 
              unit="kcal" 
              icon={<Flame className="w-5 h-5 text-orange-500" />} 
              trend="+300 kcal vs avg"
              trendUp={true}
              colorClass="bg-orange-50"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="Sleep Duration" 
              value={aggregates?.latestSleep.toString() || "0"} 
              unit="hrs" 
              icon={<Moon className="w-5 h-5 text-indigo-500" />} 
              trend="Optimal"
              trendUp={true}
              colorClass="bg-indigo-50"
            />
          </motion.div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {hasData ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <HealthChart data={data} />
              </motion.div>
            ) : (
              <Card className="h-[450px] border-dashed border-2 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Health Data Yet</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  Connect your iOS Bridge App to start syncing Apple HealthKit data, or simulate a sync to test the dashboard.
                </p>
                <Button onClick={handleSimulateData} variant="outline" className="rounded-full">
                  Simulate Data
                </Button>
              </Card>
            )}
          </div>
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <BridgeInfo />
            </motion.div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

function MetricCard({ 
  title, 
  value, 
  unit, 
  icon, 
  trend,
  trendUp,
  colorClass 
}: { 
  title: string; 
  value: string; 
  unit: string; 
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  colorClass: string;
}) {
  return (
    <Card className="border-none shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 bg-white group cursor-default">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className={`p-2.5 rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-display font-semibold text-slate-900 tracking-tight">{value}</h3>
          <span className="text-sm font-medium text-slate-500">{unit}</span>
        </div>
        {trend && (
          <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-slate-500'}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
