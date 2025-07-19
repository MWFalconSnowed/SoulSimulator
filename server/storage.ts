import { 
  soulscriptFiles,
  worldEntities,
  simulationLogs,
  worldMaps,
  type SoulscriptFile, 
  type InsertSoulscriptFile, 
  type WorldEntity, 
  type InsertWorldEntity, 
  type SimulationLog, 
  type InsertSimulationLog,
  type WorldMap,
  type InsertWorldMap
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // SoulScript Files
  getAllFiles(): Promise<SoulscriptFile[]>;
  getFile(id: number): Promise<SoulscriptFile | undefined>;
  createFile(file: InsertSoulscriptFile): Promise<SoulscriptFile>;
  updateFile(id: number, file: InsertSoulscriptFile): Promise<SoulscriptFile | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // World Entities
  getAllEntities(): Promise<WorldEntity[]>;
  createEntity(entity: InsertWorldEntity): Promise<WorldEntity>;
  updateEntity(id: number, entity: InsertWorldEntity): Promise<WorldEntity | undefined>;
  deleteEntity(id: number): Promise<boolean>;
  
  // Simulation Logs
  getRecentLogs(limit: number): Promise<SimulationLog[]>;
  createLog(log: InsertSimulationLog): Promise<SimulationLog>;
  
  // World Maps
  getAllMaps(): Promise<WorldMap[]>;
  getMap(id: number): Promise<WorldMap | undefined>;
  getMapByCode(code: string): Promise<WorldMap | undefined>;
  createMap(map: InsertWorldMap): Promise<WorldMap>;
  updateMap(id: number, map: InsertWorldMap): Promise<WorldMap | undefined>;
  deleteMap(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultMaps();
  }

  private async initializeDefaultMaps() {
    try {
      // Check if MAP001 already exists
      const [existingMap] = await db.select().from(worldMaps).where(eq(worldMaps.code, "MAP001"));
      
      if (!existingMap) {
        // Create MAP001
        await db.insert(worldMaps).values({
          name: "Ancient Temple",
          code: "MAP001", 
          backgroundImage: "/attached_assets/MAP001_1752905174470.png",
          width: 800,
          height: 600,
          tileSize: 32,
          description: "A mystical ancient temple with warm torchlight and stone architecture"
        });
      }
    } catch (error) {
      console.warn("Could not initialize default maps:", error);
    }
  }

  // SoulScript Files
  async getAllFiles(): Promise<SoulscriptFile[]> {
    const files = await db.select().from(soulscriptFiles);
    return files;
  }

  async getFile(id: number): Promise<SoulscriptFile | undefined> {
    const [file] = await db.select().from(soulscriptFiles).where(eq(soulscriptFiles.id, id));
    return file || undefined;
  }

  async createFile(insertFile: InsertSoulscriptFile): Promise<SoulscriptFile> {
    const [file] = await db
      .insert(soulscriptFiles)
      .values(insertFile)
      .returning();
    return file;
  }

  async updateFile(id: number, insertFile: InsertSoulscriptFile): Promise<SoulscriptFile | undefined> {
    const [file] = await db
      .update(soulscriptFiles)
      .set({ ...insertFile, updatedAt: new Date() })
      .where(eq(soulscriptFiles.id, id))
      .returning();
    return file || undefined;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(soulscriptFiles).where(eq(soulscriptFiles.id, id));
    return (result.rowCount || 0) > 0;
  }

  // World Entities
  async getAllEntities(): Promise<WorldEntity[]> {
    const entities = await db.select().from(worldEntities);
    return entities;
  }

  async createEntity(insertEntity: InsertWorldEntity): Promise<WorldEntity> {
    const [entity] = await db
      .insert(worldEntities)
      .values(insertEntity)
      .returning();
    return entity;
  }

  async updateEntity(id: number, insertEntity: InsertWorldEntity): Promise<WorldEntity | undefined> {
    const [entity] = await db
      .update(worldEntities)
      .set(insertEntity)
      .where(eq(worldEntities.id, id))
      .returning();
    return entity || undefined;
  }

  async deleteEntity(id: number): Promise<boolean> {
    const result = await db.delete(worldEntities).where(eq(worldEntities.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Simulation Logs
  async getRecentLogs(limit: number): Promise<SimulationLog[]> {
    const logs = await db.select().from(simulationLogs)
      .orderBy(desc(simulationLogs.timestamp))
      .limit(limit);
    return logs;
  }

  async createLog(insertLog: InsertSimulationLog): Promise<SimulationLog> {
    const [log] = await db
      .insert(simulationLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  // World Maps
  async getAllMaps(): Promise<WorldMap[]> {
    const maps = await db.select().from(worldMaps);
    return maps;
  }

  async getMap(id: number): Promise<WorldMap | undefined> {
    const [map] = await db.select().from(worldMaps).where(eq(worldMaps.id, id));
    return map || undefined;
  }

  async getMapByCode(code: string): Promise<WorldMap | undefined> {
    const [map] = await db.select().from(worldMaps).where(eq(worldMaps.code, code));
    return map || undefined;
  }

  async createMap(insertMap: InsertWorldMap): Promise<WorldMap> {
    const [map] = await db
      .insert(worldMaps)
      .values(insertMap)
      .returning();
    return map;
  }

  async updateMap(id: number, insertMap: InsertWorldMap): Promise<WorldMap | undefined> {
    const [map] = await db
      .update(worldMaps)
      .set(insertMap)
      .where(eq(worldMaps.id, id))
      .returning();
    return map || undefined;
  }

  async deleteMap(id: number): Promise<boolean> {
    const result = await db.delete(worldMaps).where(eq(worldMaps.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
