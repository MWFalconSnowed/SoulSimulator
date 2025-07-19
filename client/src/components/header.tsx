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
    <GlassPanel className="h-16 flex items-center justify-between px-6 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl entity-glow">✨</div>
          <h1 className="fantasy-font text-2xl font-bold text-yellow-400">SoulScript IDE</h1>
        </div>
        <div className="text-sm text-gray-400">Universe Simulation Engine v2.0</div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FantasyButton
            variant="gold"
            onClick={startSimulation}
            disabled={isRunning && !isPaused}
            glowing={isRunning && !isPaused}
          >
            <Play className="mr-2 h-4 w-4" />
            Run Simulation
          </FantasyButton>
          
          <FantasyButton
            variant="copper"
            onClick={pauseSimulation}
            disabled={!isRunning}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </FantasyButton>
          
          <FantasyButton
            variant="default"
            onClick={resetSimulation}
          >
            <Square className="mr-2 h-4 w-4" />
            Reset
          </FantasyButton>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/temple">
            <FantasyButton
              variant="gold"
              glowing
            >
              <Flame className="mr-2 h-4 w-4" />
              Temple Cosmique
            </FantasyButton>
          </Link>

          <Link href="/meta-prompt">
            <FantasyButton
              variant="purple"
              glowing
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Méta-Prompt
            </FantasyButton>
          </Link>
          
          <div className="text-sm text-yellow-400 flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {formatTime(simulationTime)}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
