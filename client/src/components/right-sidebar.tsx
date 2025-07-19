import { useState } from "react";
import { Code, Terminal, FolderOpen, Save } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { Textarea } from "@/components/ui/textarea";
import { useSimulation } from "@/hooks/use-simulation";

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

  const handleRunCode = () => {
    executeCode(code);
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
    <div className="w-96 glass-panel medieval-border flex flex-col">
      {/* Code Editor */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-yellow-400/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="fantasy-font text-lg font-semibold text-yellow-400 flex items-center">
              <Code className="mr-2 h-5 w-5" />
              SoulScript Editor
            </h3>
            <div className="flex space-x-2">
              <FantasyButton variant="default" className="text-xs px-2 py-1">
                <FolderOpen className="mr-1 h-3 w-3" />
                Open
              </FantasyButton>
              <FantasyButton variant="default" className="text-xs px-2 py-1">
                <Save className="mr-1 h-3 w-3" />
                Save
              </FantasyButton>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 mb-2 flex items-center">
            <Code className="mr-1 h-3 w-3" />
            {currentFile}
          </div>
          
          <FantasyButton 
            variant="gold" 
            className="w-full mb-4"
            onClick={handleRunCode}
          >
            Execute Code
          </FantasyButton>
        </div>

        {/* Code Editor Panel */}
        <div className="flex-1 code-bg font-mono text-sm overflow-hidden">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full resize-none border-none bg-transparent text-white font-mono text-sm p-4 scroll-fantasy"
            placeholder="Write your SoulScript code here..."
          />
        </div>
      </div>

      {/* Execution Logs */}
      <div className="h-48 border-t border-yellow-400/20 p-4">
        <h3 className="fantasy-font text-sm font-semibold text-yellow-400 mb-3 flex items-center">
          <Terminal className="mr-2 h-4 w-4" />
          Execution Logs
        </h3>
        
        <div className="text-xs space-y-1 overflow-y-auto scroll-fantasy h-32 bg-gray-900/50 p-2 rounded">
          {logs.map((log, index) => (
            <div key={index} className={formatLogLevel(log.level)}>
              [{formatTimestamp(log.timestamp)}] <span className="text-white">{log.message}</span>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div className="text-gray-400 text-center py-4">
              <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No logs yet</p>
              <p className="text-xs">Execute some code to see output</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
