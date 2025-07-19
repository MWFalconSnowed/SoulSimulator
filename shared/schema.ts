import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const soulscriptFiles = pgTable("soulscript_files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const worldEntities = pgTable("world_entities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  position: jsonb("position").notNull(), // {x: number, y: number}
  properties: jsonb("properties").notNull(), // component-specific properties
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const simulationLogs = pgTable("simulation_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  level: text("level").notNull(), // 'info', 'warning', 'error', 'debug'
  message: text("message").notNull(),
  entityId: integer("entity_id").references(() => worldEntities.id),
});

export const insertSoulscriptFileSchema = createInsertSchema(soulscriptFiles).pick({
  name: true,
  content: true,
});

export const insertWorldEntitySchema = createInsertSchema(worldEntities).pick({
  type: true,
  name: true,
  position: true,
  properties: true,
});

export const insertSimulationLogSchema = createInsertSchema(simulationLogs).pick({
  level: true,
  message: true,
  entityId: true,
});

export type SoulscriptFile = typeof soulscriptFiles.$inferSelect;
export type InsertSoulscriptFile = z.infer<typeof insertSoulscriptFileSchema>;

export type WorldEntity = typeof worldEntities.$inferSelect;
export type InsertWorldEntity = z.infer<typeof insertWorldEntitySchema>;

export type SimulationLog = typeof simulationLogs.$inferSelect;
export type InsertSimulationLog = z.infer<typeof insertSimulationLogSchema>;
