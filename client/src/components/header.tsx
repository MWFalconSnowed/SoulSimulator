import { Play, Pause, Square, Clock, Sparkles, Flame } from "lucide-react";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useSimulation } from "@/hooks/use-simulation";
import { Link } from "wouter";

export function Header() {
  const { 
    isRunning, 
    isPaused, 
    simulationTime, 
    startSimulation, 
    pauseSimulation, 
    resetSimulation 
  } = useSimulation();

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-16 bg-gradient-to-r from-amber-950/95 to-amber-900/95 backdrop-blur-md border-b border-amber-600/30 flex items-center justify-between px-6 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
            SoulScript IDE
          </h1>
        </div>
        <div className="text-sm text-amber-400/70 font-medium">Universe Simulation Engine v2.0</div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={startSimulation}
            disabled={isRunning && !isPaused}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
              isRunning && !isPaused 
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
            }`}
          >
            <Play className="mr-2 h-4 w-4" />
            Run Simulation
          </button>
          
          <button
            onClick={pauseSimulation}
            disabled={!isRunning}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-all duration-200 flex items-center"
          >
            <Pause className="mr-1 h-4 w-4" />
            Pause
          </button>
          
          <button
            onClick={resetSimulation}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-sm transition-all duration-200 flex items-center"
          >
            <Square className="mr-1 h-4 w-4" />
            Reset
          </button>
        </div>
        
        <div className="flex items-center bg-amber-900/50 border border-amber-700/50 rounded-lg px-3 py-2">
          <Clock className="mr-2 h-4 w-4 text-amber-400" />
          <span className="text-amber-200 font-mono text-sm">{formatTime(simulationTime)}</span>
        </div>
      </div>
    </div>
  );
}
