import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSoulscriptFileSchema, insertWorldEntitySchema, insertSimulationLogSchema, insertWorldMapSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // SoulScript Files API
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch file" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const data = insertSoulscriptFileSchema.parse(req.body);
      const file = await storage.createFile(data);
      res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid file data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  app.put("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertSoulscriptFileSchema.parse(req.body);
      const file = await storage.updateFile(id, data);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid file data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update file" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFile(id);
      
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // World Entities API
  app.get("/api/entities", async (req, res) => {
    try {
      const entities = await storage.getAllEntities();
      res.json(entities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entities" });
    }
  });

  app.post("/api/entities", async (req, res) => {
    try {
      const data = insertWorldEntitySchema.parse(req.body);
      const entity = await storage.createEntity(data);
      res.status(201).json(entity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid entity data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create entity" });
    }
  });

  app.put("/api/entities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertWorldEntitySchema.parse(req.body);
      const entity = await storage.updateEntity(id, data);
      
      if (!entity) {
        return res.status(404).json({ error: "Entity not found" });
      }
      
      res.json(entity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid entity data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update entity" });
    }
  });

  app.delete("/api/entities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEntity(id);
      
      if (!success) {
        return res.status(404).json({ error: "Entity not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete entity" });
    }
  });

  // Simulation Logs API
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getRecentLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.post("/api/logs", async (req, res) => {
    try {
      const data = insertSimulationLogSchema.parse(req.body);
      const log = await storage.createLog(data);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid log data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create log" });
    }
  });

  // Execute SoulScript code
  app.post("/api/execute", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: "Code is required" });
      }

      // Simple execution simulation for demo
      const output = simulateCodeExecution(code);
      
      res.json({ output });
    } catch (error) {
      res.status(500).json({ error: "Failed to execute code" });
    }
  });

  // World Maps API
  app.get("/api/maps", async (req, res) => {
    try {
      const maps = await storage.getAllMaps();
      res.json(maps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch maps" });
    }
  });

  app.get("/api/maps/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const map = await storage.getMap(id);
      
      if (!map) {
        return res.status(404).json({ error: "Map not found" });
      }
      
      res.json(map);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch map" });
    }
  });

  app.get("/api/maps/code/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const map = await storage.getMapByCode(code);
      
      if (!map) {
        return res.status(404).json({ error: "Map not found" });
      }
      
      res.json(map);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch map" });
    }
  });

  app.post("/api/maps", async (req, res) => {
    try {
      const data = insertWorldMapSchema.parse(req.body);
      const map = await storage.createMap(data);
      res.status(201).json(map);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid map data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create map" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function simulateCodeExecution(code: string): string {
  let output = "";
  
  if (code.includes("component Atom")) {
    let energy = 100;
    const charge = -1;
    
    for (let i = 0; i < 5; i++) {
      energy += charge * 1.0;
      if (energy < 0) {
        output += `[Atom] Destroyed (energy < 0)\n`;
        break;
      } else {
        output += `[Atom] Energy: ${energy}\n`;
      }
    }
  }
  
  if (code.includes("component Spawner")) {
    let timer = 0.0;
    const rate = 2.0;
    
    for (let i = 0; i < 5; i++) {
      timer += 1.0;
      if (timer > rate) {
        output += `[Spawner] Spawned new Atom\n`;
        timer = 0.0;
      } else {
        output += `[Spawner] Waiting... (${timer}s)\n`;
      }
    }
  }
  
  if (code.includes("component Conscience")) {
    output += `[Conscience] Initializing memory systems...\n`;
    output += `[Conscience] Processing thoughts...\n`;
    output += `[Conscience] Memory allocation: 64KB\n`;
  }
  
  if (!output) {
    output = "Code executed successfully. No output generated.";
  }
  
  return output;
}
