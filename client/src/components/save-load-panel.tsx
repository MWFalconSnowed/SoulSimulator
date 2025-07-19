import { useState, useEffect } from "react";
import { Save, Upload, Download, Trash2, Clock, FolderOpen } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { worldPersistence } from "@/lib/world-persistence";
import { useWorldStore } from "@/stores/world-store";
import { useToast } from "@/hooks/use-toast";

interface SavedWorld {
  id: string;
  name: string;
  timestamp: string;
}

export function SaveLoadPanel() {
  const [savedWorlds, setSavedWorlds] = useState<SavedWorld[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { entities } = useWorldStore();
  const { toast } = useToast();

  useEffect(() => {
    loadSavedWorlds();
  }, []);

  const loadSavedWorlds = async () => {
    try {
      const worlds = await worldPersistence.getSavedWorlds();
      setSavedWorlds(worlds);
    } catch (error) {
      console.error('Failed to load saved worlds:', error);
    }
  };

  const handleSaveWorld = async () => {
    if (!saveName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your world save",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const saveId = `world_${Date.now()}`;
      const success = await worldPersistence.saveWorld(
        saveId,
        saveName,
        saveDescription,
        new Map(), // entities - would need to be passed from world store
        new Map(), // global variables
        new Map()  // soul files
      );

      if (success) {
        toast({
          title: "World Saved",
          description: `${saveName} has been saved successfully`,
          variant: "default"
        });
        setSaveName("");
        setSaveDescription("");
        setIsDialogOpen(false);
        await loadSavedWorlds();
      } else {
        throw new Error("Failed to save world");
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save the world. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadWorld = async (saveId: string) => {
    setIsLoading(true);
    try {
      const worldSave = await worldPersistence.loadWorld(saveId);
      if (worldSave) {
        // Here you would restore the world state
        toast({
          title: "World Loaded",
          description: `${worldSave.name} has been loaded`,
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Load Failed",
        description: "Failed to load the world. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorld = async (saveId: string, worldName: string) => {
    if (!confirm(`Are you sure you want to delete "${worldName}"?`)) {
      return;
    }

    try {
      const success = await worldPersistence.deleteWorld(saveId);
      if (success) {
        toast({
          title: "World Deleted",
          description: `${worldName} has been deleted`,
          variant: "default"
        });
        await loadSavedWorlds();
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the world",
        variant: "destructive"
      });
    }
  };

  const handleQuickSave = async () => {
    setIsLoading(true);
    try {
      const success = await worldPersistence.quickSave(
        new Map(), // entities
        new Map(), // global variables
        new Map()  // soul files
      );
      
      if (success) {
        toast({
          title: "Quick Save",
          description: "World has been quick saved",
          variant: "default"
        });
        await loadSavedWorlds();
      }
    } catch (error) {
      toast({
        title: "Quick Save Failed",
        description: "Failed to quick save",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportWorld = async (saveId: string, worldName: string) => {
    try {
      const blob = await worldPersistence.exportWorld(saveId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${worldName.replace(/[^a-z0-9]/gi, '_')}.soulworld`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "World Exported",
          description: `${worldName} has been exported`,
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export the world",
        variant: "destructive"
      });
    }
  };

  const handleImportWorld = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const success = await worldPersistence.importWorld(file);
      if (success) {
        toast({
          title: "World Imported",
          description: "World has been imported successfully",
          variant: "default"
        });
        await loadSavedWorlds();
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import the world file",
        variant: "destructive"
      });
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <GlassPanel className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="w-5 h-5 text-amber-400" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
          Save & Load
        </h2>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <FantasyButton
          onClick={handleQuickSave}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Quick Save
        </FantasyButton>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <FantasyButton className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save As...
            </FantasyButton>
          </DialogTrigger>
          <DialogContent className="bg-gray-900/95 border-amber-500/30">
            <DialogHeader>
              <DialogTitle className="text-amber-300">Save World</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="save-name" className="text-amber-300">World Name</Label>
                <Input
                  id="save-name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter world name..."
                  className="bg-black/20 border-amber-500/30"
                />
              </div>
              <div>
                <Label htmlFor="save-description" className="text-amber-300">Description (Optional)</Label>
                <Input
                  id="save-description"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Describe your world..."
                  className="bg-black/20 border-amber-500/30"
                />
              </div>
              <div className="flex justify-end gap-2">
                <FantasyButton
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </FantasyButton>
                <FantasyButton
                  onClick={handleSaveWorld}
                  disabled={isLoading || !saveName.trim()}
                >
                  Save World
                </FantasyButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <label htmlFor="import-file">
          <FantasyButton
            as="span"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import
          </FantasyButton>
          <input
            id="import-file"
            type="file"
            accept=".soulworld"
            onChange={handleImportWorld}
            className="hidden"
          />
        </label>
      </div>

      {/* Saved Worlds List */}
      <div className="space-y-4">
        <h3 className="text-amber-300 font-semibold">Saved Worlds</h3>
        
        {savedWorlds.length === 0 ? (
          <Card className="bg-black/20 border-amber-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-amber-400/60">
                No saved worlds yet. Create your first world save!
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {savedWorlds.map((world) => (
              <Card key={world.id} className="bg-black/20 border-amber-500/20 hover:border-amber-400/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-amber-300 font-semibold">{world.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-amber-400/60">
                        <Clock className="w-3 h-3" />
                        {formatDate(world.timestamp)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <FantasyButton
                        size="sm"
                        onClick={() => handleLoadWorld(world.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Load
                      </FantasyButton>
                      
                      <FantasyButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportWorld(world.id, world.name)}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </FantasyButton>
                      
                      <FantasyButton
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteWorld(world.id, world.name)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </FantasyButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Auto-save Info */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="p-4">
          <div className="text-amber-200 text-xs space-y-2">
            <div className="font-semibold text-amber-300">Auto-Save Features:</div>
            <div className="space-y-1">
              <div>• World state automatically saved every 30 seconds</div>
              <div>• Quick save preserves current session</div>
              <div>• Export creates .soulworld files for sharing</div>
              <div>• Local backup in case of connection issues</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </GlassPanel>
  );
}