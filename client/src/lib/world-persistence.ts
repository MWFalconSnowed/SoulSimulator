// SoulScript World Persistence System
import { WorldEntity } from './soulscript-interpreter';
import { apiRequest } from './queryClient';

export interface WorldSave {
  id: string;
  name: string;
  description: string;
  version: string;
  timestamp: string;
  entities: SerializedEntity[];
  globalVariables: Record<string, any>;
  worldSettings: WorldSettings;
  soulFiles: SoulFileData[];
}

export interface SerializedEntity {
  id: number;
  type: string;
  name: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
  componentCode?: string;
  isActive: boolean;
  lifespan: number;
}

export interface WorldSettings {
  gravity: number;
  timeScale: number;
  ambientLight: { r: number; g: number; b: number };
  backgroundMusic?: string;
  ambientSounds: string[];
  physics: {
    enabled: boolean;
    friction: number;
    restitution: number;
  };
}

export interface SoulFileData {
  name: string;
  code: string;
  lastModified: string;
}

export class WorldPersistenceManager {
  private currentSaveSlot: string | null = null;
  private autoSaveEnabled: boolean = true;
  private autoSaveInterval: number = 30000; // 30 seconds
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoSave();
  }

  // Save world to storage
  async saveWorld(
    saveId: string,
    name: string,
    description: string,
    entities: Map<number, WorldEntity>,
    globalVars: Map<string, any>,
    soulFiles: Map<string, string>
  ): Promise<boolean> {
    try {
      const worldSave: WorldSave = {
        id: saveId,
        name,
        description,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        entities: this.serializeEntities(entities),
        globalVariables: this.mapToObject(globalVars),
        worldSettings: this.getDefaultWorldSettings(),
        soulFiles: this.serializeSoulFiles(soulFiles)
      };

      // Save to API
      await apiRequest('/api/worlds', {
        method: 'POST',
        body: JSON.stringify(worldSave),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Also save to localStorage as backup
      localStorage.setItem(`soulscript_world_${saveId}`, JSON.stringify(worldSave));
      
      this.currentSaveSlot = saveId;
      console.log(`World saved: ${name}`);
      return true;

    } catch (error) {
      console.error('Failed to save world:', error);
      
      // Fallback to localStorage only
      try {
        const worldSave: WorldSave = {
          id: saveId,
          name,
          description,
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          entities: this.serializeEntities(entities),
          globalVariables: this.mapToObject(globalVars),
          worldSettings: this.getDefaultWorldSettings(),
          soulFiles: this.serializeSoulFiles(soulFiles)
        };
        
        localStorage.setItem(`soulscript_world_${saveId}`, JSON.stringify(worldSave));
        console.log('World saved to local storage only');
        return true;
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
        return false;
      }
    }
  }

  // Load world from storage
  async loadWorld(saveId: string): Promise<WorldSave | null> {
    try {
      // Try to load from API first
      const response = await apiRequest(`/api/worlds/${saveId}`);
      if (response.ok) {
        const worldSave = await response.json();
        this.currentSaveSlot = saveId;
        return worldSave;
      }
    } catch (error) {
      console.warn('Failed to load from API, trying localStorage:', error);
    }

    // Fallback to localStorage
    try {
      const saved = localStorage.getItem(`soulscript_world_${saveId}`);
      if (saved) {
        const worldSave = JSON.parse(saved);
        this.currentSaveSlot = saveId;
        return worldSave;
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }

    return null;
  }

  // Get list of saved worlds
  async getSavedWorlds(): Promise<{ id: string; name: string; timestamp: string }[]> {
    const worlds: { id: string; name: string; timestamp: string }[] = [];

    // Try to get from API
    try {
      const response = await apiRequest('/api/worlds');
      if (response.ok) {
        const apiWorlds = await response.json();
        worlds.push(...apiWorlds);
      }
    } catch (error) {
      console.warn('Failed to get worlds from API:', error);
    }

    // Add from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('soulscript_world_')) {
        try {
          const worldData = JSON.parse(localStorage.getItem(key)!);
          const existingIndex = worlds.findIndex(w => w.id === worldData.id);
          if (existingIndex === -1) {
            worlds.push({
              id: worldData.id,
              name: worldData.name,
              timestamp: worldData.timestamp
            });
          }
        } catch (error) {
          console.warn('Failed to parse saved world:', error);
        }
      }
    }

    return worlds.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Delete saved world
  async deleteWorld(saveId: string): Promise<boolean> {
    try {
      // Delete from API
      try {
        await apiRequest(`/api/worlds/${saveId}`, { method: 'DELETE' });
      } catch (error) {
        console.warn('Failed to delete from API:', error);
      }

      // Delete from localStorage
      localStorage.removeItem(`soulscript_world_${saveId}`);
      
      if (this.currentSaveSlot === saveId) {
        this.currentSaveSlot = null;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete world:', error);
      return false;
    }
  }

  // Quick save to current slot
  async quickSave(
    entities: Map<number, WorldEntity>,
    globalVars: Map<string, any>,
    soulFiles: Map<string, string>
  ): Promise<boolean> {
    if (!this.currentSaveSlot) {
      // Create new quick save
      const quickSaveId = `quicksave_${Date.now()}`;
      return this.saveWorld(
        quickSaveId,
        'Quick Save',
        'Auto-generated quick save',
        entities,
        globalVars,
        soulFiles
      );
    }

    // Load existing save to get name and description
    const existingSave = await this.loadWorld(this.currentSaveSlot);
    return this.saveWorld(
      this.currentSaveSlot,
      existingSave?.name || 'Quick Save',
      existingSave?.description || 'Auto-generated quick save',
      entities,
      globalVars,
      soulFiles
    );
  }

  // Auto save functionality
  private startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    if (this.autoSaveEnabled) {
      this.autoSaveTimer = setInterval(() => {
        // Auto save will be triggered by the world store
        window.dispatchEvent(new CustomEvent('soulscript:autosave'));
      }, this.autoSaveInterval);
    }
  }

  // Serialize entities for saving
  private serializeEntities(entities: Map<number, WorldEntity>): SerializedEntity[] {
    return Array.from(entities.values()).map(entity => ({
      id: entity.id,
      type: entity.type,
      name: entity.name,
      position: entity.position,
      properties: this.mapToObject(entity.properties),
      componentCode: entity.component ? this.getComponentCode(entity.component) : undefined,
      isActive: entity.isActive,
      lifespan: entity.lifespan
    }));
  }

  // Serialize soul files
  private serializeSoulFiles(soulFiles: Map<string, string>): SoulFileData[] {
    return Array.from(soulFiles.entries()).map(([name, code]) => ({
      name,
      code,
      lastModified: new Date().toISOString()
    }));
  }

  // Convert Map to plain object
  private mapToObject<T>(map: Map<string, T>): Record<string, T> {
    const obj: Record<string, T> = {};
    for (const [key, value] of map.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  // Get component code (simplified - would need access to component definition)
  private getComponentCode(component: any): string {
    // This would need to be implemented based on how components store their source code
    return `// Component code for ${component.name}`;
  }

  // Default world settings
  private getDefaultWorldSettings(): WorldSettings {
    return {
      gravity: 9.81,
      timeScale: 1.0,
      ambientLight: { r: 0.3, g: 0.3, b: 0.4 },
      ambientSounds: [],
      physics: {
        enabled: true,
        friction: 0.8,
        restitution: 0.2
      }
    };
  }

  // Export world as file
  async exportWorld(saveId: string): Promise<Blob | null> {
    const worldSave = await this.loadWorld(saveId);
    if (!worldSave) return null;

    const exportData = {
      ...worldSave,
      exportedAt: new Date().toISOString(),
      soulscriptVersion: '1.0.0'
    };

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
  }

  // Import world from file
  async importWorld(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const worldData = JSON.parse(text);

      // Validate structure
      if (!worldData.id || !worldData.name || !worldData.entities) {
        throw new Error('Invalid world file format');
      }

      // Generate new ID to avoid conflicts
      const newId = `imported_${Date.now()}`;
      worldData.id = newId;
      worldData.name = `${worldData.name} (Imported)`;

      // Save the imported world
      localStorage.setItem(`soulscript_world_${newId}`, JSON.stringify(worldData));
      
      console.log('World imported successfully');
      return true;

    } catch (error) {
      console.error('Failed to import world:', error);
      return false;
    }
  }

  // Settings
  setAutoSave(enabled: boolean, interval?: number) {
    this.autoSaveEnabled = enabled;
    if (interval) {
      this.autoSaveInterval = interval;
    }
    this.startAutoSave();
  }

  getCurrentSaveSlot(): string | null {
    return this.currentSaveSlot;
  }

  dispose() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}

// Global persistence manager
export const worldPersistence = new WorldPersistenceManager();