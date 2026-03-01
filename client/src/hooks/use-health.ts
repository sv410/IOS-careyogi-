import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

const API_KEY = "default_careyogi_secret_key";

export function useUser() {
  return useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    }
  });
}

export function useDashboardData() {
  return useQuery({
    queryKey: [api.health.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.health.dashboard.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export function useSubmitHealthData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.health.submit.path, {
        method: api.health.submit.method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}` // Use API key for simulation
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.message || "Failed to submit data");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.health.dashboard.path] });
      toast({ title: "Success", description: "Health data synced successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
