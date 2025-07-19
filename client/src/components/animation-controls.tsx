import { useState } from "react";
import { Play, Pause, Square, SkipForward, RotateCcw, Settings } from "lucide-react";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useSimulation } from "@/hooks/use-simulation";

export function AnimationControls() {
  const { isRunning, toggleSimulation, resetSimulation, simulationTime } = useSimulation();
  const [speed, setSpeed] = useState([1]);
  const [quality, setQuality] = useState([60]);

  return (
    <div className="p-4 bg-amber-950/30 border-t border-amber-600/30 space-y-4">
      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-2">
        <FantasyButton
          variant="outline"
          size="sm"
          onClick={toggleSimulation}
          className={`${
            isRunning 
              ? 'text-orange-400 border-orange-600/40 hover:bg-orange-600/20' 
              : 'text-green-400 border-green-600/40 hover:bg-green-600/20'
          }`}
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </FantasyButton>
        
        <FantasyButton
          variant="outline"
          size="sm"
          onClick={resetSimulation}
          className="text-red-400 border-red-600/40 hover:bg-red-600/20"
        >
          <Square className="h-4 w-4" />
        </FantasyButton>
        
        <FantasyButton
          variant="outline"
          size="sm"
          className="text-amber-400 border-amber-600/40 hover:bg-amber-600/20"
        >
          <SkipForward className="h-4 w-4" />
        </FantasyButton>
        
        <FantasyButton
          variant="outline"
          size="sm"
          className="text-blue-400 border-blue-600/40 hover:bg-blue-600/20"
        >
          <RotateCcw className="h-4 w-4" />
        </FantasyButton>
      </div>

      {/* Simulation Info */}
      <div className="text-center">
        <div className="text-xs text-amber-300 font-semibold">Simulation Time</div>
        <div className="text-sm text-amber-400">{simulationTime.toFixed(1)}s</div>
        <div className="text-xs text-amber-400/70 mt-1">
          Status: {isRunning ? 'Running' : 'Paused'}
        </div>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <Label className="text-xs text-amber-300 font-semibold">Speed: {speed[0]}x</Label>
        <Slider
          value={speed}
          onValueChange={setSpeed}
          max={5}
          min={0.1}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Quality Control */}
      <div className="space-y-2">
        <Label className="text-xs text-amber-300 font-semibold">FPS: {quality[0]}</Label>
        <Slider
          value={quality}
          onValueChange={setQuality}
          max={120}
          min={30}
          step={10}
          className="w-full"
        />
      </div>

      {/* Advanced Settings */}
      <div className="border-t border-amber-600/30 pt-3">
        <FantasyButton
          variant="ghost"
          size="sm"
          className="w-full text-amber-400 hover:text-amber-300 justify-center"
        >
          <Settings className="h-3 w-3 mr-2" />
          Advanced Settings
        </FantasyButton>
      </div>
    </div>
  );
}