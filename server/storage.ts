import { 
  type SoulscriptFile, 
  type InsertSoulscriptFile, 
  type WorldEntity, 
  type InsertWorldEntity, 
  type SimulationLog, 
  type InsertSimulationLog,
  type WorldMap,
  type InsertWorldMap
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private files: Map<number, SoulscriptFile>;
  private entities: Map<number, WorldEntity>;
  private logs: SimulationLog[];
  private maps: Map<number, WorldMap>;
  private currentFileId: number;
  private currentEntityId: number;
  private currentLogId: number;
  private currentMapId: number;

  constructor() {
    this.files = new Map();
    this.entities = new Map();
    this.logs = [];
    this.maps = new Map();
    this.currentFileId = 1;
    this.currentEntityId = 1;
    this.currentLogId = 1;
    this.currentMapId = 1;
    
    // Initialize with MAP001
    this.initializeDefaultMaps();
  }

  private initializeDefaultMaps() {
    const map001: WorldMap = {
      id: 1,
      name: "Ancient Temple",
      code: "MAP001",
      backgroundImage: "/attached_assets/MAP001_1752905174470.png",
      width: 800,
      height: 600,
      tileSize: 32,
      description: "A mystical ancient temple with warm torchlight and stone architecture",
      isActive: true,
      createdAt: new Date()
    };
    this.maps.set(1, map001);
    this.currentMapId = 2;
  }

  // SoulScript Files
  async getAllFiles(): Promise<SoulscriptFile[]> {
    return Array.from(this.files.values());
  }

  async getFile(id: number): Promise<SoulscriptFile | undefined> {
    return this.files.get(id);
  }

  async createFile(insertFile: InsertSoulscriptFile): Promise<SoulscriptFile> {
    const id = this.currentFileId++;
    const file: SoulscriptFile = {
      ...insertFile,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: number, insertFile: InsertSoulscriptFile): Promise<SoulscriptFile | undefined> {
    const existingFile = this.files.get(id);
    if (!existingFile) return undefined;

    const updatedFile: SoulscriptFile = {
      ...existingFile,
      ...insertFile,
      updatedAt: new Date()
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  // World Entities
  async getAllEntities(): Promise<WorldEntity[]> {
    return Array.from(this.entities.values());
  }

  async createEntity(insertEntity: InsertWorldEntity): Promise<WorldEntity> {
    const id = this.currentEntityId++;
    const entity: WorldEntity = {
      ...insertEntity,
      id,
      isActive: true,
      createdAt: new Date()
    };
    this.entities.set(id, entity);
    return entity;
  }

  async updateEntity(id: number, insertEntity: InsertWorldEntity): Promise<WorldEntity | undefined> {
    const existingEntity = this.entities.get(id);
    if (!existingEntity) return undefined;

    const updatedEntity: WorldEntity = {
      ...existingEntity,
      ...insertEntity
    };
    this.entities.set(id, updatedEntity);
    return updatedEntity;
  }

  async deleteEntity(id: number): Promise<boolean> {
    return this.entities.delete(id);
  }

  // Simulation Logs
  async getRecentLogs(limit: number): Promise<SimulationLog[]> {
    return this.logs.slice(-limit);
  }

  async createLog(insertLog: InsertSimulationLog): Promise<SimulationLog> {
    const id = this.currentLogId++;
    const log: SimulationLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
      entityId: insertLog.entityId || null
    };
    this.logs.push(log);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
    
    return log;
  }

  // World Maps
  async getAllMaps(): Promise<WorldMap[]> {
    return Array.from(this.maps.values());
  }

  async getMap(id: number): Promise<WorldMap | undefined> {
    return this.maps.get(id);
  }

  async getMapByCode(code: string): Promise<WorldMap | undefined> {
    return Array.from(this.maps.values()).find(map => map.code === code);
  }

  async createMap(insertMap: InsertWorldMap): Promise<WorldMap> {
    const id = this.currentMapId++;
    const map: WorldMap = {
      ...insertMap,
      id,
      isActive: true,
      createdAt: new Date(),
      tileSize: insertMap.tileSize || 32,
      description: insertMap.description || null
    };
    this.maps.set(id, map);
    return map;
  }

  async updateMap(id: number, insertMap: InsertWorldMap): Promise<WorldMap | undefined> {
    const existingMap = this.maps.get(id);
    if (!existingMap) return undefined;

    const updatedMap: WorldMap = {
      ...existingMap,
      ...insertMap
    };
    this.maps.set(id, updatedMap);
    return updatedMap;
  }

  async deleteMap(id: number): Promise<boolean> {
    return this.maps.delete(id);
  }
}

export const storage = new MemStorage();
