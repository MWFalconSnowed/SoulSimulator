import { Table, Box, Brain, Copy, Plus, Atom } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { useWorldStore } from "@/stores/world-store";

const componentTypes = [
  { 
    id: "Atom", 
    name: "Atom", 
    icon: Atom, 
    color: "text-yellow-400",
    description: "Basic energy entity"
  },
  { 
    id: "Spawner", 
    name: "Spawner", 
    icon: Plus, 
    color: "text-orange-400",
    description: "Creates new entities"
  },
  { 
    id: "Conscience", 
    name: "Conscience", 
    icon: Brain, 
    color: "text-purple-400",
    description: "Thinking entity"
  },
  { 
    id: "Clone", 
    name: "Clone", 
    icon: Copy, 
    color: "text-green-400",
    description: "Replicates behavior"
  }
];

export function LeftSidebar() {
  const { entities, addEntity, selectedEntity, selectEntity } = useWorldStore();

  const handleAddComponent = (componentType: string) => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100
    };
    
    const properties = getDefaultProperties(componentType);
    
    addEntity({
      type: componentType,
      name: `${componentType}_${String(entities.length + 1).padStart(3, '0')}`,
      position,
      properties
    });
  };

  const getDefaultProperties = (type: string) => {
    switch (type) {
      case "Atom":
        return { energy: 100, charge: -1 };
      case "Spawner":
        return { rate: 2.0, timer: 0 };
      case "Conscience":
        return { memory: 64, depth: 3 };
      case "Clone":
        return { target: null, similarity: 100 };
      default:
        return {};
    }
  };

  const getEntityStatus = (entity: any) => {
    switch (entity.type) {
      case "Atom":
        return `Energy: ${entity.properties.energy}%`;
      case "Spawner":
        return `Rate: ${entity.properties.rate}s`;
      case "Conscience":
        return `Memory: ${entity.properties.memory}KB`;
      case "Clone":
        return `Similarity: ${entity.properties.similarity}%`;
      default:
        return "Active";
    }
  };

  const getEntityIcon = (type: string) => {
    const component = componentTypes.find(c => c.id === type);
    return component?.icon || Box;
  };

  const getEntityColor = (type: string) => {
    const component = componentTypes.find(c => c.id === type);
    return component?.color || "text-gray-400";
  };

  return (
    <div className="w-80 glass-panel medieval-border flex flex-col">
      {/* Component Hierarchy */}
      <div className="flex-1 p-4">
        <h3 className="fantasy-font text-lg font-semibold text-yellow-400 mb-4 flex items-center">
          <Table className="mr-2 h-5 w-5" />
          Component Hierarchy
        </h3>
        
        <div className="space-y-2 scroll-fantasy overflow-y-auto max-h-64">
          {entities.map((entity) => {
            const IconComponent = getEntityIcon(entity.type);
            return (
              <GlassPanel
                key={entity.id}
                className={`p-3 cursor-pointer transition-all ${
                  selectedEntity?.id === entity.id 
                    ? 'border-yellow-400/60 bg-yellow-400/10' 
                    : 'border-yellow-400/30 hover:border-yellow-400/60'
                }`}
                onClick={() => selectEntity(entity)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 entity-glow ${getEntityColor(entity.type)}`} />
                    <span className="text-sm font-medium">{entity.name}</span>
                  </div>
                  <div className="text-xs text-green-400">{getEntityStatus(entity)}</div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Position: ({Math.round(entity.position.x)}, {Math.round(entity.position.y)}) | State: Active
                </div>
              </GlassPanel>
            );
          })}
          
          {entities.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Box className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No entities in the world</p>
              <p className="text-xs">Add components from the library below</p>
            </div>
          )}
        </div>
      </div>

      {/* Component Library */}
      <div className="p-4 border-t border-yellow-400/20">
        <h3 className="fantasy-font text-lg font-semibold text-yellow-400 mb-4 flex items-center">
          <Box className="mr-2 h-5 w-5" />
          Component Library
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {componentTypes.map((component) => {
            const IconComponent = component.icon;
            return (
              <FantasyButton
                key={component.id}
                variant="default"
                className="p-3 h-auto flex-col space-y-2"
                onClick={() => handleAddComponent(component.id)}
              >
                <IconComponent className={`h-6 w-6 entity-glow ${component.color}`} />
                <div className="text-xs">{component.name}</div>
              </FantasyButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}
