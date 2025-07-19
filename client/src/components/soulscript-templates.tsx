import { useState } from "react";
import { FileText, Download, Copy } from "lucide-react";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { ScrollArea } from "@/components/ui/scroll-area";

const soulScriptTemplates = [
  {
    name: "Basic Atom",
    description: "Simple energy-based entity",
    code: `component Atom {
    float energy = 100;
    float charge = -1;
    vec2 velocity = {0, 0};

    fn update(float dt) {
        energy += charge * dt;
        velocity.x += sin(energy * 0.1) * dt;
        velocity.y += cos(energy * 0.1) * dt;
        
        if energy < 0 {
            destroy();
        }
    }

    fn onCollision(Entity other) {
        energy += other.energy * 0.1;
        log("Collision detected!");
    }
}`
  },
  {
    name: "Smart Spawner",
    description: "Intelligent entity spawner",
    code: `component Spawner {
    float spawnRate = 2.0;
    float timer = 0;
    int maxEntities = 10;
    int currentCount = 0;

    fn update(float dt) {
        timer += dt;
        
        if timer >= spawnRate && currentCount < maxEntities {
            spawn("Atom", position + randomOffset());
            currentCount++;
            timer = 0;
            
            // Adaptive spawn rate
            spawnRate = lerp(spawnRate, 5.0, 0.1);
        }
    }

    fn onEntityDestroyed(Entity entity) {
        currentCount--;
    }
}`
  },
  {
    name: "Conscious AI",
    description: "Self-aware thinking entity",
    code: `component Conscience {
    float memory = 64;
    int depth = 3;
    array thoughts = [];
    float awareness = 0;

    fn update(float dt) {
        think(dt);
        observe();
        decide();
    }

    fn think(float dt) {
        awareness += dt * 0.5;
        
        if thoughts.length > memory {
            thoughts.removeFirst();
        }
        
        thoughts.add({
            content: "I am thinking...",
            timestamp: time(),
            importance: random()
        });
    }

    fn observe() {
        Entity nearest = findNearestEntity(position, 100);
        if nearest != null {
            remember(nearest);
        }
    }

    fn decide() {
        if awareness > 50 {
            transcend();
        }
    }
}`
  },
  {
    name: "Advanced Clone",
    description: "Behavior replication system",
    code: `component Clone {
    Entity target = null;
    float similarity = 100;
    array behaviorPattern = [];

    fn update(float dt) {
        if target != null {
            mimicBehavior();
            adaptPattern();
        } else {
            seekTarget();
        }
    }

    fn mimicBehavior() {
        if target.velocity != null {
            velocity = lerp(velocity, target.velocity, 0.8);
        }
        
        if target.energy != null {
            energy = lerp(energy, target.energy, 0.3);
        }
    }

    fn adaptPattern() {
        behaviorPattern.add({
            action: target.currentAction,
            timestamp: time(),
            efficiency: calculateEfficiency()
        });
        
        if behaviorPattern.length > 20 {
            optimizePattern();
        }
    }

    fn seekTarget() {
        Entity[] entities = findAllEntities();
        target = findBestMatch(entities, similarity);
    }
}`
  }
];

interface SoulScriptTemplatesProps {
  onTemplateSelect: (code: string) => void;
}

export function SoulScriptTemplates({ onTemplateSelect }: SoulScriptTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const handleUseTemplate = (template: typeof soulScriptTemplates[0]) => {
    onTemplateSelect(template.code);
  };

  const handleCopyTemplate = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <FileText className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-amber-200">Code Templates</h3>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-3">
          {soulScriptTemplates.map((template, index) => (
            <div
              key={index}
              className={`p-3 rounded border cursor-pointer transition-all duration-200 ${
                selectedTemplate === index
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-amber-700/50 hover:border-amber-500/70 hover:bg-amber-800/20'
              }`}
              onClick={() => setSelectedTemplate(selectedTemplate === index ? null : index)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-amber-100 font-medium text-sm">{template.name}</h4>
                <div className="flex space-x-1">
                  <FantasyButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTemplate(template.code);
                    }}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    <Copy className="h-3 w-3" />
                  </FantasyButton>
                  <FantasyButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template);
                    }}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Download className="h-3 w-3" />
                  </FantasyButton>
                </div>
              </div>
              
              <p className="text-xs text-amber-400/70 mb-2">{template.description}</p>
              
              {selectedTemplate === index && (
                <div className="mt-3">
                  <pre className="text-xs bg-black/40 p-3 rounded border border-amber-600/30 overflow-x-auto">
                    <code className="text-green-300">{template.code}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}