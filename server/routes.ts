import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const API_KEY = process.env.API_KEY || "default_careyogi_secret_key";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use(session({
    secret: process.env.SESSION_SECRET || "careyogi-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  // Seed initial mock data
  const userId = "user-1";
  const existingData = await storage.getHealthData(userId);
  if (existingData.length === 0) {
    const now = Date.now();
    for (let i = 5; i >= 0; i--) {
      await storage.addHealthData({
        userId,
        steps: 4000 + Math.floor(Math.random() * 6000),
        heartRate: 65 + Math.floor(Math.random() * 25),
        calories: 1800 + Math.floor(Math.random() * 700),
        sleepHours: 6 + Math.random() * 2.5,
        timestamp: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  app.post(api.auth.login.path, async (req, res) => {
    const { username } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    
    req.session.userId = user.id;
    res.json(user);
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json(user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  app.get(api.health.dashboard.path, async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
    try {
      const data = await storage.getHealthData(req.session.userId);
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch health data" });
    }
  });

  app.post(api.health.submit.path, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const sessionUserId = req.session.userId;
      
      let targetUserId = "";
      
      // Allow either API Key (from iOS) or Session (from Browser Simulate)
      if (authHeader === `Bearer ${API_KEY}`) {
        // In a real app, API key would be linked to a user. 
        // For PoC, we use user-1
        targetUserId = "user-1";
      } else if (sessionUserId) {
        targetUserId = sessionUserId;
      } else {
        return res.status(401).json({ message: "Unauthorized: Invalid API Key or Session" });
      }

      const input = api.health.submit.input.parse(req.body);
      await storage.addHealthData({ ...input, userId: targetUserId });
      
      res.status(201).json({ success: true, message: "Health data securely stored." });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
