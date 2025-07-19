import { useState, useEffect } from "react";
import { FileText, Upload, Download, Play, Trash2, Plus } from "lucide-react";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Default SoulScript files
const DEFAULT_SOUL_FILES = [
  {
    name: "atom.soul",
    path: "/src/assets/soul-files/atom.soul",
    description: "Basic energy-based entity with physics"
  },
  {
    name: "spawner.soul", 
    path: "/src/assets/soul-files/spawner.soul",
    description: "Intelligent entity spawner with adaptive behavior"
  },
  {
    name: "conscience.soul",
    path: "/src/assets/soul-files/conscience.soul", 
    description: "Self-aware AI entity with consciousness"
  },
  {
    name: "world-manager.soul",
    path: "/src/assets/soul-files/world-manager.soul",
    description: "Global world state and rules manager"
  },
  {
    name: "demon-animator.soul",
    path: "/src/assets/soul-files/demon-animator.soul",
    description: "Advanced sprite animation system with multiple states"
  }
];

interface SoulFileManagerProps {
  onFileSelect: (filename: string, content: string) => void;
  onExecuteFile: (content: string) => void;
}

export function SoulFileManager({ onFileSelect, onExecuteFile }: SoulFileManagerProps) {
  const [soulFiles, setSoulFiles] = useState(DEFAULT_SOUL_FILES);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Map<string, string>>(new Map());
  const [newFileName, setNewFileName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    // Load default soul files
    loadDefaultFiles();
  }, []);

  const loadDefaultFiles = async () => {
    const contents = new Map<string, string>();
    
    for (const file of DEFAULT_SOUL_FILES) {
      try {
        const response = await fetch(file.path);
        if (response.ok) {
          const content = await response.text();
          contents.set(file.name, content);
        } else {
          // Fallback content if file doesn't exist
          contents.set(file.name, generateDefaultContent(file.name));
        }
      } catch (error) {
        console.warn(`Could not load ${file.name}, using fallback`);
        contents.set(file.name, generateDefaultContent(file.name));
      }
    }
    
    setFileContents(contents);
  };

  const generateDefaultContent = (filename: string): string => {
    const baseName = filename.replace('.soul', '');
    return `// ${baseName} - SoulScript Component
component ${baseName.charAt(0).toUpperCase() + baseName.slice(1)} {
    float energy = 100.0;
    vec2 position = {0.0, 0.0};
    
    fn init(vec2 startPos) {
        position = startPos;
        log("${baseName} initialized at " + position);
    }
    
    fn update(float deltaTime) {
        // Add your update logic here
        energy -= deltaTime * 0.1;
        
        if (energy <= 0) {
            destroy();
        }
    }
    
    fn onDestroy() {
        log("${baseName} destroyed");
    }
}`;
  };

  const handleFileSelect = (filename: string) => {
    setSelectedFile(filename);
    const content = fileContents.get(filename) || "";
    onFileSelect(filename, content);
  };

  const handleExecuteFile = (filename: string) => {
    const content = fileContents.get(filename) || "";
    onExecuteFile(content);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    
    const filename = newFileName.endsWith('.soul') ? newFileName : `${newFileName}.soul`;
    const newFile = {
      name: filename,
      path: `custom/${filename}`,
      description: "Custom SoulScript component"
    };
    
    setSoulFiles([...soulFiles, newFile]);
    setFileContents(prev => new Map(prev.set(filename, generateDefaultContent(filename))));
    setNewFileName("");
    setIsCreateDialogOpen(false);
    
    // Auto-select the new file
    handleFileSelect(filename);
  };

  const handleDeleteFile = (filename: string) => {
    if (DEFAULT_SOUL_FILES.some(f => f.name === filename)) {
      // Can't delete default files, just reset content
      const defaultContent = generateDefaultContent(filename);
      setFileContents(prev => new Map(prev.set(filename, defaultContent)));
      if (selectedFile === filename) {
        onFileSelect(filename, defaultContent);
      }
    } else {
      // Delete custom file
      setSoulFiles(prev => prev.filter(f => f.name !== filename));
      setFileContents(prev => {
        const newMap = new Map(prev);
        newMap.delete(filename);
        return newMap;
      });
      
      if (selectedFile === filename) {
        setSelectedFile(null);
      }
    }
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.soul,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const content = await file.text();
      const filename = file.name.endsWith('.soul') ? file.name : `${file.name}.soul`;
      
      const importedFile = {
        name: filename,
        path: `imported/${filename}`,
        description: "Imported SoulScript file"
      };
      
      setSoulFiles(prev => [...prev.filter(f => f.name !== filename), importedFile]);
      setFileContents(prev => new Map(prev.set(filename, content)));
      handleFileSelect(filename);
    };
    input.click();
  };

  const handleExportFile = (filename: string) => {
    const content = fileContents.get(filename) || "";
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-amber-200">SoulScript Files</h3>
        </div>
        
        <div className="flex space-x-1">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <FantasyButton variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                <Plus className="h-3 w-3" />
              </FantasyButton>
            </DialogTrigger>
            <DialogContent className="bg-amber-950/95 border-amber-600/40">
              <DialogHeader>
                <DialogTitle className="text-amber-200">Create New SoulScript File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter filename (e.g., my-component)"
                  className="bg-amber-950/30 border-amber-600/40 text-amber-100"
                />
                <div className="flex space-x-2">
                  <FantasyButton onClick={handleCreateFile} className="flex-1">
                    Create File
                  </FantasyButton>
                  <FantasyButton variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                    Cancel
                  </FantasyButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <FantasyButton variant="ghost" size="sm" onClick={handleImportFile} className="text-blue-400 hover:text-blue-300">
            <Upload className="h-3 w-3" />
          </FantasyButton>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="h-80">
        <div className="space-y-2">
          {soulFiles.map((file) => (
            <div
              key={file.name}
              className={`p-3 rounded border cursor-pointer transition-all duration-200 ${
                selectedFile === file.name
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-amber-700/50 hover:border-amber-500/70 hover:bg-amber-800/20'
              }`}
              onClick={() => handleFileSelect(file.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-100 font-medium text-sm">{file.name}</span>
                  {DEFAULT_SOUL_FILES.some(f => f.name === file.name) && (
                    <span className="text-xs bg-amber-600/30 text-amber-300 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-1">
                  <FantasyButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExecuteFile(file.name);
                    }}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Play className="h-3 w-3" />
                  </FantasyButton>
                  
                  <FantasyButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportFile(file.name);
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Download className="h-3 w-3" />
                  </FantasyButton>
                  
                  <FantasyButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete ${file.name}?`)) {
                        handleDeleteFile(file.name);
                      }
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </FantasyButton>
                </div>
              </div>
              
              <p className="text-xs text-amber-400/70">{file.description}</p>
              
              {selectedFile === file.name && (
                <div className="mt-2 text-xs text-amber-300">
                  Lines: {(fileContents.get(file.name) || "").split('\n').length} | 
                  Size: {new Blob([fileContents.get(file.name) || ""]).size} bytes
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="border-t border-amber-600/30 pt-3 space-y-2">
        <div className="text-xs text-amber-300 font-semibold">Quick Actions</div>
        <div className="flex flex-wrap gap-2">
          <FantasyButton
            variant="outline"
            size="sm"
            onClick={() => handleExecuteFile("atom.soul")}
            className="text-yellow-400 border-yellow-600/40 hover:bg-yellow-600/20"
          >
            Run Atom
          </FantasyButton>
          <FantasyButton
            variant="outline"
            size="sm"
            onClick={() => handleExecuteFile("spawner.soul")}
            className="text-orange-400 border-orange-600/40 hover:bg-orange-600/20"
          >
            Run Spawner
          </FantasyButton>
          <FantasyButton
            variant="outline"
            size="sm"
            onClick={() => handleExecuteFile("conscience.soul")}
            className="text-purple-400 border-purple-600/40 hover:bg-purple-600/20"
          >
            Run Conscience
          </FantasyButton>
        </div>
      </div>
    </div>
  );
}