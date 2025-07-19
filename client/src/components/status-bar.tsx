import { Circle, Zap, Cpu, HardDrive } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useSimulation } from "@/hooks/use-simulation";
import { useWorldStore } from "@/stores/world-store";

export function StatusBar() {
  const { isRunning, simulationTime } = useSimulation();
  const { entities } = useWorldStore();

  const memoryUsage = entities.length * 64 + 183; // KB
  const fps = 60; // Simulated FPS

  return (
    <GlassPanel className="h-8 flex items-center justify-between px-6 text-xs border-t">
      <div className="flex items-center space-x-4">
        <div className="text-yellow-400 flex items-center">
          <Circle className={`h-2 w-2 mr-1 fill-current ${isRunning ? 'text-green-400' : 'text-gray-400'}`} />
          SoulScript Engine {isRunning ? 'Running' : 'Ready'}
        </div>
        <div className="text-gray-400 flex items-center">
          <HardDrive className="h-3 w-3 mr-1" />
          Memory: <span className="text-blue-400 ml-1">{memoryUsage} KB</span>
        </div>
        <div className="text-gray-400 flex items-center">
          <Cpu className="h-3 w-3 mr-1" />
          FPS: <span className="text-green-400 ml-1">{fps}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-gray-400">
          Version 2.0.1 | Build 2024.1215
        </div>
        <div className="text-yellow-400 flex items-center">
          <Zap className="mr-1 h-3 w-3" />
          Universe Simulation {isRunning ? 'Active' : 'Idle'}
        </div>
      </div>
    </GlassPanel>
  );
}
