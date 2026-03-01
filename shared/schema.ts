import { z } from "zod";

export const healthDataSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  steps: z.number(),
  heartRate: z.number(),
  calories: z.number(),
  sleepHours: z.number(),
  timestamp: z.string().datetime().optional(), // ISO string
});

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  age: z.number(),
  gender: z.string(),
});

export const insertUserSchema = userSchema.omit({ id: true });

export type HealthData = z.infer<typeof healthDataSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
