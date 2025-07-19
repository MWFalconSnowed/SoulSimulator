import { useState } from "react";
import { Code, Terminal, FolderOpen, Save, Volume2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { Textarea } from "@/components/ui/textarea";
import { useSimulation } from "@/hooks/use-simulation";
import { EntityProperties } from "@/components/entity-properties";
import { useWorldStore } from "@/stores/world-store";
import { Separator } from "@/components/ui/separator";
import { SoulScriptTemplates } from "@/components/soulscript-templates";
import { SoulFileManager } from "@/components/soul-file-manager";
import { AudioPanel } from "@/components/audio-panel";
import { SaveLoadPanel } from "@/components/save-load-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RightSidebar() {
  const [currentFile, setCurrentFile] = useState("atom.soul");
  const [code, setCode] = useState(`component Atom {
    float energy = 100;
    float charge = -1;

    fn update(float dt) {
        energy += charge * dt;
        if energy < 0 {
            destroy();
        }
    }
}

// Add your code here...`);

  const { logs, executeCode } = useSimulation();
  const { selectedEntity } = useWorldStore();

  const handleRunCode = () => {
    executeCode(code);
  };

  const handleTemplateSelect = (templateCode: string) => {
    setCode(templateCode);
  };

  const formatLogLevel = (level: string) => {
    const colors = {
      info: "text-green-400",
      warning: "text-yellow-400",
      error: "text-red-400",
      debug: "text-blue-400"
    };
    return colors[level as keyof typeof colors] || "text-gray-400";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="w-96 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md border-l border-amber-600/30 flex flex-col">
      {/* Entity Properties Panel - Show only if entity is selected */}
      {selectedEntity && (
        <div className="border-b border-amber-600/30">
          <EntityProperties entity={selectedEntity} />
        </div>
      )}
      {/* Tabbed Interface */}
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="editor" className="flex-1 flex flex-col">
          <div className="border-b border-amber-600/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
                <h3 className="text-amber-200 font-semibold uppercase tracking-wider text-sm">
                  SoulScript IDE
                </h3>
              </div>
              <div className="flex space-x-1">
                <button className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded transition-colors">
                  <FolderOpen className="h-3 w-3 mr-1 inline" />
                  Open
                </button>
                <button className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded transition-colors">
                  <Save className="h-3 w-3 mr-1 inline" />
                  Save
                </button>
              </div>
            </div>
            
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="files">.soul</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-3 mt-2">
              <TabsTrigger value="audio">
                <Volume2 className="w-3 h-3 mr-1" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="save">
                <Save className="w-3 h-3 mr-1" />
                Save
              </TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="flex-1 flex flex-col">
            <div className="p-4 border-b border-amber-600/30">
              <div className="text-xs text-amber-400/70 mb-3 flex items-center">
                <Code className="mr-1 h-3 w-3" />
                {currentFile}
              </div>
              
              <button 
                onClick={handleRunCode}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm shadow-lg"
              >
                Execute Code
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full font-mono text-sm bg-black/60 border border-amber-700/40 text-green-300 focus:border-amber-400/70 resize-none min-h-[400px]"
                placeholder="Write your SoulScript code here..."
              />
            </div>
          </TabsContent>

          <TabsContent value="files" className="flex-1">
            <SoulFileManager 
              onFileSelect={(filename, content) => {
                setCurrentFile(filename);
                setCode(content);
              }}
              onExecuteFile={(content) => {
                setCode(content);
                executeCode(content);
              }}
            />
          </TabsContent>

          <TabsContent value="templates" className="flex-1">
            <SoulScriptTemplates onTemplateSelect={handleTemplateSelect} />
          </TabsContent>

          <TabsContent value="audio" className="flex-1 overflow-y-auto">
            <AudioPanel />
          </TabsContent>

          <TabsContent value="save" className="flex-1 overflow-y-auto">
            <SaveLoadPanel />
          </TabsContent>

          <TabsContent value="logs" className="flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Terminal className="mr-2 h-4 w-4 text-amber-400" />
                <h4 className="text-amber-200 font-semibold uppercase tracking-wider text-sm">
                  Execution Logs
                </h4>
              </div>
              <div className="text-xs text-amber-400/70">
                {logs.length} entries
              </div>
            </div>
            
            <div className="h-full overflow-y-auto bg-black/40 rounded border border-amber-700/30 p-3">
              {logs.length === 0 ? (
                <div className="text-center text-amber-400/50 py-6">
                  <Terminal className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No logs yet</p>
                  <p className="text-xs">Execute some code to see output</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="flex text-xs">
                      <span className="text-gray-500 mr-2 min-w-[60px]">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className={`mr-2 min-w-[50px] ${formatLogLevel(log.level)}`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="text-gray-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
