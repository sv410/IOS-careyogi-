import { type HealthData, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { id?: string }): Promise<User>;
  getHealthData(userId: string): Promise<HealthData[]>;
  addHealthData(data: HealthData): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private healthRecords: HealthData[];

  constructor() {
    this.users = new Map();
    this.healthRecords = [];
    
    // Seed a default user for login
    const defaultUser: User = {
      id: "user-1",
      username: "admin",
      name: "John Smith",
      age: 32,
      gender: "Male"
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser & { id?: string }): Promise<User> {
    const id = insertUser.id || randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getHealthData(userId: string): Promise<HealthData[]> {
    return this.healthRecords.filter(r => r.userId === userId);
  }

  async addHealthData(data: HealthData): Promise<void> {
    if (!data.id) data.id = randomUUID();
    if (!data.timestamp) data.timestamp = new Date().toISOString();
    this.healthRecords.push(data);
    
    if (this.healthRecords.length > 500) {
      this.healthRecords.shift();
    }
  }
}

export const storage = new MemStorage();
