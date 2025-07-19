import { Table, Box, Brain, Copy, Plus, Atom, Zap, Eye, Activity } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { useWorldStore } from "@/stores/world-store";
import { Badge } from "@/components/ui/badge";

const componentTypes = [
  { 
    id: "Atom", 
    name: "Atom", 
    icon: Atom, 
    color: "text-yellow-400",
    bgColor: "bg-yellow-600",
    description: "Basic energy entity"
  },
  { 
    id: "Spawner", 
    name: "Spawner", 
    icon: Zap, 
    color: "text-orange-400",
    bgColor: "bg-orange-600",
    description: "Creates new entities"
  },
  { 
    id: "Conscience", 
    name: "Conscience", 
    icon: Eye, 
    color: "text-purple-400",
    bgColor: "bg-purple-600",
    description: "Thinking entity"
  },
  { 
    id: "Clone", 
    name: "Clone", 
    icon: Copy, 
    color: "text-green-400",
    bgColor: "bg-green-600",
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
    <div className="w-80 bg-gradient-to-b from-amber-950/95 to-amber-900/95 backdrop-blur-md border-r border-amber-600/30 flex flex-col">
      {/* Component Hierarchy */}
      <div className="border-b border-amber-600/30">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
            <h3 className="text-amber-200 font-semibold uppercase tracking-wider text-sm">
              Component Hierarchy
            </h3>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {entities.map((entity, index) => {
              const componentType = componentTypes.find(c => c.id === entity.type);
              const Icon = componentType?.icon || Box;
              
              return (
                <div
                  key={entity.id}
                  className={`group p-3 rounded border cursor-pointer transition-all duration-200 ${
                    selectedEntity?.id === entity.id
                      ? 'border-amber-400 bg-amber-400/10 shadow-lg'
                      : 'border-amber-700/50 hover:border-amber-500/70 hover:bg-amber-800/20'
                  }`}
                  onClick={() => selectEntity(entity)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 ${componentType?.bgColor} rounded mr-2 shadow-sm`}></div>
                      <Icon className={`h-4 w-4 mr-2 ${componentType?.color}`} />
                      <span className="text-amber-100 font-medium text-sm">{entity.name}</span>
                    </div>
                    <Badge variant="outline" className="border-amber-600/50 text-amber-300 text-xs px-1 py-0">
                      {entity.properties.energy > 50 ? 'Active' : 'Low'}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-amber-400/70 ml-6">
                    Position: ({entity.position.x.toFixed(0)}, {entity.position.y.toFixed(0)}) | {getEntityStatus(entity)}
                  </div>
                </div>
              );
            })}
          </div>
          
          {entities.length === 0 && (
            <div className="text-center text-amber-400/60 py-6">
              <Box className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No entities created</p>
              <p className="text-xs">Use Component Library below</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Component Library */}
      <div className="flex-1 p-4">
        <div className="flex items-center mb-4">
          <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
          <h4 className="text-amber-200 font-semibold uppercase tracking-wider text-sm">
            Component Library
          </h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {componentTypes.map((component) => {
            const Icon = component.icon;
            return (
              <button
                key={component.id}
                className={`group relative ${component.bgColor} hover:${component.bgColor}/80 p-4 rounded-lg border border-amber-600/40 hover:border-amber-400/60 transition-all duration-200 hover:shadow-lg hover:scale-105`}
                onClick={() => handleAddComponent(component.id)}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                  <span className="text-white font-medium text-sm">{component.name}</span>
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  {component.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
