import { Circle, Zap, Cpu, HardDrive, Database, Code2, Activity } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useSimulation } from "@/hooks/use-simulation";
import { useWorldStore } from "@/stores/world-store";

export function StatusBar() {
  const { isRunning, simulationTime } = useSimulation();
  const { entities } = useWorldStore();

  const memoryUsage = entities.length * 64 + 183; // KB
  const fps = 60; // Simulated FPS

  return (
    <div className="h-8 bg-gradient-to-r from-amber-950/95 to-amber-900/95 backdrop-blur-md border-t border-amber-600/30 flex items-center justify-between px-6 text-xs">
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-green-400' : 'bg-amber-400'}`}></div>
          <span className="text-amber-200">SoulScript Engine {isRunning ? 'Running' : 'Ready'}</span>
        </div>
        <div className="text-amber-400/70 flex items-center">
          <HardDrive className="h-3 w-3 mr-1" />
          Memory: <span className="text-blue-300 ml-1">{memoryUsage} KB</span>
        </div>
        <div className="text-amber-400/70 flex items-center">
          <Cpu className="h-3 w-3 mr-1" />
          FPS: <span className="text-green-300 ml-1">{fps}</span>
        </div>
        <div className="text-amber-400/70 flex items-center">
          <Database className="h-3 w-3 mr-1" />
          Entities: <span className="text-yellow-300 ml-1">{entities.length}</span>
        </div>
        <div className="text-amber-400/70 flex items-center">
          <Activity className="h-3 w-3 mr-1" />
          Time: <span className="text-purple-300 ml-1">{simulationTime.toFixed(1)}s</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-amber-400/70 flex items-center">
          <Code2 className="h-3 w-3 mr-1" />
          SoulScript IDE v2.1
        </div>
        <div className="text-amber-200 flex items-center">
          <Zap className="mr-1 h-3 w-3" />
          Universe Simulation {isRunning ? 'Active' : 'Idle'}
        </div>
      </div>
    </div>
  );
}
