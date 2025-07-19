import { create } from 'zustand';

export interface WorldEntity {
  id: number;
  type: string;
  name: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

interface WorldStore {
  entities: WorldEntity[];
  selectedEntity: WorldEntity | null;
  nextId: number;
  
  addEntity: (entity: Omit<WorldEntity, 'id' | 'isActive' | 'createdAt'>) => void;
  removeEntity: (id: number) => void;
  updateEntity: (id: number, updates: Partial<WorldEntity>) => void;
  selectEntity: (entity: WorldEntity | null) => void;
  clearWorld: () => void;
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  entities: [],
  selectedEntity: null,
  nextId: 1,

  addEntity: (entityData) => {
    const entity: WorldEntity = {
      ...entityData,
      id: get().nextId,
      isActive: true,
      createdAt: new Date()
    };

    set((state) => ({
      entities: [...state.entities, entity],
      nextId: state.nextId + 1
    }));
  },

  removeEntity: (id) => {
    set((state) => ({
      entities: state.entities.filter(e => e.id !== id),
      selectedEntity: state.selectedEntity?.id === id ? null : state.selectedEntity
    }));
  },

  updateEntity: (id, updates) => {
    set((state) => ({
      entities: state.entities.map(e => 
        e.id === id ? { ...e, ...updates } : e
      ),
      selectedEntity: state.selectedEntity?.id === id 
        ? { ...state.selectedEntity, ...updates } 
        : state.selectedEntity
    }));
  },

  selectEntity: (entity) => {
    set({ selectedEntity: entity });
  },

  clearWorld: () => {
    set({
      entities: [],
      selectedEntity: null,
      nextId: 1
    });
  }
}));
