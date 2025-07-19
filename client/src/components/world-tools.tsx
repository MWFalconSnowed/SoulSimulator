import { Save, FolderOpen, Download, Upload, Trash2, RotateCcw } from "lucide-react";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { useWorldStore } from "@/stores/world-store";
import { useState } from "react";

export function WorldTools() {
  const { entities, clearWorld } = useWorldStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveWorld = () => {
    setIsSaving(true);
    const worldData = {
      entities,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(worldData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soulscript-world-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleLoadWorld = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const worldData = JSON.parse(e.target?.result as string);
          if (worldData.entities && Array.isArray(worldData.entities)) {
            // Implementation would require store method to load entities
            console.log('World loaded:', worldData);
          }
        } catch (error) {
          console.error('Failed to load world:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearWorld = () => {
    if (confirm(`Clear all ${entities.length} entities from the world?`)) {
      clearWorld();
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-amber-950/30 border-t border-amber-600/30">
      <FantasyButton
        variant="outline"
        size="sm"
        onClick={handleSaveWorld}
        disabled={isSaving || entities.length === 0}
        className="text-amber-300 border-amber-600/40 hover:bg-amber-600/20"
      >
        <Download className="h-3 w-3 mr-1" />
        {isSaving ? 'Saving...' : 'Export'}
      </FantasyButton>
      
      <FantasyButton
        variant="outline"
        size="sm"
        onClick={handleLoadWorld}
        className="text-amber-300 border-amber-600/40 hover:bg-amber-600/20"
      >
        <Upload className="h-3 w-3 mr-1" />
        Import
      </FantasyButton>
      
      <FantasyButton
        variant="outline"
        size="sm"
        onClick={handleClearWorld}
        disabled={entities.length === 0}
        className="text-red-400 border-red-600/40 hover:bg-red-600/20"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Clear All
      </FantasyButton>
      
      <div className="flex-1" />
      
      <div className="text-xs text-amber-400/70 self-center">
        {entities.length} entities in world
      </div>
    </div>
  );
}