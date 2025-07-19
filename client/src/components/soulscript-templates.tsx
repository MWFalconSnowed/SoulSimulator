import { useState } from "react";
import { Sparkles, Scroll, Zap, Brain, Shield, Crown } from "lucide-react";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { ScrollArea } from "@/components/ui/scroll-area";

const SOULSCRIPT_TEMPLATES = [
  {
    name: "Mystical Sanctuary",
    category: "Complete Scenes",
    icon: Crown,
    description: "Full Baldur's Gate II inspired mystical sanctuary with Elder Spirits, temple guardians, and ancient rituals",
    complexity: "Advanced",
    tags: ["RPG", "Complete", "Interactive"],
    code: `// Load the complete Mystical Sanctuary scene
// This demonstrates the full power of SoulScript
component SceneLoader {
    fn init() {
        loadSoulFile("mystical-sanctuary.soul");
        log("🏛️ Mystical Sanctuary scene loaded!");
    }
}`
  },
  {
    name: "Conscious AI Entity",
    category: "AI & Consciousness", 
    icon: Brain,
    description: "Self-aware entity with memory, thoughts, goals, and personality traits",
    complexity: "Advanced",
    tags: ["AI", "Consciousness", "Behavior"],
    code: `component ConsciousAI {
    float awarenessLevel = 50.0;
    array memories = [];
    array currentThoughts = [];
    string currentGoal = "explore";
    
    // Personality traits
    float curiosity = 0.8;
    float cooperation = 0.7;
    float creativity = 0.6;
    
    fn init(vec2 startPos) {
        position = startPos;
        addMemory("birth", "I awakened at " + position);
        setGoal("explore", randomVec2(0, 800, 0, 600));
    }
    
    fn update(float deltaTime) {
        think(deltaTime);
        observe();
        decide();
        act(deltaTime);
    }
    
    fn think(float deltaTime) {
        if (random() < curiosity * deltaTime) {
            generateThought();
        }
        awarenessLevel += deltaTime * 0.1;
    }
    
    fn generateThought() {
        array thoughts = [
            "What is my purpose?",
            "How do others perceive me?",
            "What lies beyond this world?"
        ];
        string thought = thoughts[randomInt(0, thoughts.length)];
        currentThoughts.add({
            "content": thought,
            "intensity": 1.0,
            "timestamp": getTime()
        });
    }
    
    fn addMemory(string type, string content) {
        memories.add({
            "type": type,
            "content": content,
            "timestamp": getTime(),
            "importance": random() + 0.5
        });
    }
}`
  },
  {
    name: "Energy Particle System",
    category: "Visual Effects",
    icon: Sparkles,
    description: "Dynamic particle system with energy flows, collisions, and visual effects",
    complexity: "Intermediate", 
    tags: ["Particles", "Physics", "Visual"],
    code: `component EnergyParticle {
    vec2 velocity = randomVec2(-50, 50);
    float energy = 100.0;
    float lifetime = 5.0;
    color particleColor = rgb(255, 200, 0);
    
    fn init(vec2 startPos) {
        position = startPos;
        velocity = normalize(velocity) * (50.0 + random() * 100.0);
    }
    
    fn update(float deltaTime) {
        // Physics
        position += velocity * deltaTime;
        energy -= deltaTime * 10.0;
        lifetime -= deltaTime;
        
        // Visual updates
        float energyRatio = energy / 100.0;
        particleColor = rgb(
            int(255 * energyRatio),
            int(200 * energyRatio), 
            int(50 * energyRatio)
        );
        
        radius = 5.0 + energy * 0.1;
        
        // Collision with other particles
        array nearby = getEntitiesInRadius(position, 20.0);
        for (Entity other : nearby) {
            if (other.type == "EnergyParticle" && other.id != this.id) {
                handleCollision(other);
            }
        }
        
        // Death condition
        if (energy <= 0 || lifetime <= 0) {
            createExplosion();
            destroy();
        }
    }
    
    fn handleCollision(Entity other) {
        // Energy exchange
        float transfer = 10.0;
        energy -= transfer;
        other.energy += transfer;
        
        // Bounce physics
        vec2 direction = normalize(position - other.position);
        velocity = direction * magnitude(velocity) * 0.8;
        
        // Visual effect
        createParticle("spark", position, rgb(255, 255, 255));
    }
    
    fn createExplosion() {
        for (int i = 0; i < 8; i++) {
            vec2 sparkPos = position + randomVec2(-10, 10);
            createParticle("explosion", sparkPos, particleColor);
        }
    }
}`
  },
  {
    name: "Intelligent Spawner",
    category: "Game Systems",
    icon: Zap,
    description: "Adaptive spawner that learns and adjusts based on world conditions",
    complexity: "Intermediate",
    tags: ["Spawning", "Adaptive", "AI"],
    code: `component IntelligentSpawner {
    float spawnRate = 2.0;
    int maxEntities = 10;
    string spawnType = "EnergyParticle";
    float efficiency = 1.0;
    bool adaptiveMode = true;
    
    fn init(vec2 pos) {
        position = pos;
        subscribe("entityDestroyed", "onEntityDestroyed");
    }
    
    fn update(float deltaTime) {
        if (shouldSpawn()) {
            performSpawn();
        }
        
        if (adaptiveMode) {
            adaptBehavior();
        }
    }
    
    fn shouldSpawn() -> bool {
        int currentCount = getEntityCount();
        return currentCount < maxEntities && 
               random() < spawnRate * deltaTime;
    }
    
    fn performSpawn() {
        vec2 spawnPos = position + randomVec2(-50, 50);
        Entity newEntity = createEntity(spawnType, spawnPos);
        
        // Initialize based on type
        if (spawnType == "EnergyParticle") {
            newEntity.init(spawnPos);
        }
        
        log("Spawned " + spawnType + " at " + spawnPos);
    }
    
    fn adaptBehavior() {
        // Monitor world density
        float worldDensity = getEntityCount() / 100.0;
        
        if (worldDensity > 0.8) {
            spawnRate = max(spawnRate * 0.9, 0.5);
        } else if (worldDensity < 0.3) {
            spawnRate = min(spawnRate * 1.1, 5.0);
        }
        
        // Adapt spawn type based on conditions
        if (worldDensity > 0.7) {
            spawnType = "ConsciousAI";
        } else {
            spawnType = "EnergyParticle";
        }
    }
}`
  },
  {
    name: "Guardian Entity", 
    category: "NPCs & Characters",
    icon: Shield,
    description: "Protective entity that patrols and defends an area",
    complexity: "Intermediate",
    tags: ["NPC", "Combat", "Patrol"],
    code: `component Guardian {
    vec2 homePosition;
    float patrolRadius = 100.0;
    float alertLevel = 0.0;
    bool combatMode = false;
    Entity currentThreat = null;
    
    fn init(vec2 guardPos) {
        position = guardPos;
        homePosition = guardPos;
        health = 200.0;
        weapon = "SacredStaff";
    }
    
    fn update(float deltaTime) {
        if (combatMode && currentThreat != null) {
            engageThreat(deltaTime);
        } else {
            patrol(deltaTime);
            scanForThreats();
        }
        
        updateAlertLevel(deltaTime);
    }
    
    fn patrol(float deltaTime) {
        float time = getTime();
        vec2 patrolTarget = {
            homePosition.x + cos(time * 0.5) * patrolRadius,
            homePosition.y + sin(time * 0.5) * patrolRadius
        };
        
        vec2 direction = normalize(patrolTarget - position);
        position += direction * 30.0 * deltaTime;
    }
    
    fn scanForThreats() {
        array nearby = getEntitiesInRadius(position, patrolRadius);
        
        for (Entity entity : nearby) {
            if (entity.hasProperty("evil") && entity.evil > 50.0) {
                detectThreat(entity);
                break;
            }
        }
    }
    
    fn detectThreat(Entity threat) {
        currentThreat = threat;
        combatMode = true;
        alertLevel = 100.0;
        
        log("⚔️ Guardian detects threat: " + threat.name);
        broadcast("threatDetected", {
            guardian: this.id,
            threat: threat.id
        });
    }
    
    fn engageThreat(float deltaTime) {
        if (currentThreat == null || !entityExists(currentThreat.id)) {
            combatMode = false;
            return;
        }
        
        // Move toward threat
        vec2 direction = normalize(currentThreat.position - position);
        position += direction * 50.0 * deltaTime;
        
        // Attack if close enough
        float distance = distance(position, currentThreat.position);
        if (distance < 25.0) {
            attackThreat();
        }
    }
    
    fn attackThreat() {
        if (currentThreat.hasProperty("health")) {
            currentThreat.health -= 25.0;
            createParticle("guardianAttack", currentThreat.position, rgb(255, 200, 0));
            
            if (currentThreat.health <= 0) {
                log("✅ Guardian defeated threat");
                combatMode = false;
                currentThreat = null;
            }
        }
    }
    
    fn updateAlertLevel(float deltaTime) {
        if (!combatMode) {
            alertLevel = max(alertLevel - deltaTime * 20.0, 0.0);
        }
        
        // Visual indication of alert level
        if (alertLevel > 50.0) {
            tint = rgb(255, 100, 100);  // Red alert
        } else {
            tint = rgb(100, 100, 255);  // Calm blue
        }
    }
}`
  },
  {
    name: "Quest System",
    category: "Game Systems", 
    icon: Scroll,
    description: "Dynamic quest system with objectives, rewards, and branching storylines",
    complexity: "Advanced",
    tags: ["Quests", "Narrative", "Progression"],
    code: `component QuestSystem {
    array activeQuests = [];
    array completedQuests = [];
    int questIdCounter = 1;
    
    fn init() {
        log("📜 Quest System initialized");
        createStarterQuest();
    }
    
    fn update(float deltaTime) {
        checkQuestProgress();
        processQuestEvents();
    }
    
    fn createQuest(string title, string description, array objectives) -> map {
        map quest = {
            "id": questIdCounter++,
            "title": title,
            "description": description,
            "objectives": objectives,
            "status": "active",
            "progress": 0.0,
            "rewards": []
        };
        
        activeQuests.add(quest);
        log("📋 New quest: " + title);
        
        broadcast("questStarted", quest);
        return quest;
    }
    
    fn createStarterQuest() {
        array objectives = [
            {
                "type": "explore",
                "description": "Explore the mystical sanctuary",
                "target": "sanctuary",
                "completed": false
            },
            {
                "type": "interact",
                "description": "Speak with the Elder Spirit",
                "target": "elderSpirit",
                "completed": false
            },
            {
                "type": "collect",
                "description": "Gather 5 energy particles",
                "target": "energyParticle",
                "count": 0,
                "required": 5,
                "completed": false
            }
        ];
        
        createQuest(
            "Sanctuary Awakening",
            "Discover the secrets of the ancient mystical sanctuary and commune with its guardian spirits.",
            objectives
        );
    }
    
    fn checkQuestProgress() {
        for (map quest : activeQuests) {
            updateQuestObjectives(quest);
            
            // Check if quest is complete
            bool allComplete = true;
            for (map objective : quest["objectives"]) {
                if (!objective["completed"]) {
                    allComplete = false;
                    break;
                }
            }
            
            if (allComplete && quest["status"] == "active") {
                completeQuest(quest);
            }
        }
    }
    
    fn updateQuestObjectives(map quest) {
        for (map objective : quest["objectives"]) {
            if (objective["completed"]) continue;
            
            switch (objective["type"]) {
                case "explore":
                    checkExploreObjective(objective);
                    break;
                case "interact":
                    checkInteractObjective(objective);
                    break;
                case "collect":
                    checkCollectObjective(objective);
                    break;
                case "defeat":
                    checkDefeatObjective(objective);
                    break;
            }
        }
    }
    
    fn checkExploreObjective(map objective) {
        // Check if player has been near target area
        if (objective["target"] == "sanctuary") {
            // Check if any entity is near sanctuary center
            array nearby = getEntitiesInRadius({400, 300}, 50.0);
            if (nearby.length > 0) {
                objective["completed"] = true;
                log("✅ Exploration objective completed");
            }
        }
    }
    
    fn checkInteractObjective(map objective) {
        // This would be triggered by interaction events
        // For now, simulate based on proximity
        if (objective["target"] == "elderSpirit") {
            array spirits = getAllEntities();
            for (Entity entity : spirits) {
                if (entity.type == "ElderSpirit") {
                    array nearSpirit = getEntitiesInRadius(entity.position, 30.0);
                    if (nearSpirit.length > 1) {  // Spirit + player
                        objective["completed"] = true;
                        log("✅ Elder Spirit communion completed");
                    }
                }
            }
        }
    }
    
    fn checkCollectObjective(map objective) {
        if (objective["target"] == "energyParticle") {
            // Count energy particles in world
            int particleCount = 0;
            array entities = getAllEntities();
            for (Entity entity : entities) {
                if (entity.type == "EnergyParticle") {
                    particleCount++;
                }
            }
            
            objective["count"] = particleCount;
            if (particleCount >= objective["required"]) {
                objective["completed"] = true;
                log("✅ Collection objective completed: " + particleCount + "/" + objective["required"]);
            }
        }
    }
    
    fn completeQuest(map quest) {
        quest["status"] = "completed";
        activeQuests.remove(quest);
        completedQuests.add(quest);
        
        log("🏆 Quest completed: " + quest["title"]);
        
        // Grant rewards
        grantQuestRewards(quest);
        
        // Trigger follow-up quests
        triggerFollowUpQuests(quest);
        
        broadcast("questCompleted", quest);
    }
    
    fn grantQuestRewards(map quest) {
        // Example rewards system
        array rewards = [
            {"type": "experience", "amount": 100},
            {"type": "energy", "amount": 50},
            {"type": "wisdom", "amount": 25}
        ];
        
        quest["rewards"] = rewards;
        
        for (map reward : rewards) {
            log("💰 Reward granted: " + reward["amount"] + " " + reward["type"]);
        }
    }
    
    fn triggerFollowUpQuests(map quest) {
        if (quest["title"] == "Sanctuary Awakening") {
            // Create advanced quest
            array advancedObjectives = [
                {
                    "type": "ritual",
                    "description": "Participate in a blessing ritual",
                    "target": "blessingRitual",
                    "completed": false
                },
                {
                    "type": "transcend",
                    "description": "Achieve consciousness transcendence",
                    "target": "transcendence",
                    "completed": false
                }
            ];
            
            createQuest(
                "Path of Enlightenment",
                "Deepen your spiritual connection with the sanctuary and achieve transcendence.",
                advancedObjectives
            );
        }
    }
    
    fn getQuestStatus() -> map {
        return {
            "activeQuests": activeQuests.length,
            "completedQuests": completedQuests.length,
            "totalQuests": activeQuests.length + completedQuests.length
        };
    }
}`
  }
];

interface SoulScriptTemplatesProps {
  onTemplateSelect: (code: string) => void;
}

export function SoulScriptTemplates({ onTemplateSelect }: SoulScriptTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(SOULSCRIPT_TEMPLATES.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === "All" 
    ? SOULSCRIPT_TEMPLATES 
    : SOULSCRIPT_TEMPLATES.filter(t => t.category === selectedCategory);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Beginner": return "text-green-400 bg-green-600/20";
      case "Intermediate": return "text-yellow-400 bg-yellow-600/20";
      case "Advanced": return "text-red-400 bg-red-600/20";
      default: return "text-gray-400 bg-gray-600/20";
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Sparkles className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-amber-200">SoulScript Templates</h3>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-amber-600/40 text-amber-200 border border-amber-500/50'
                : 'bg-amber-900/30 text-amber-400 border border-amber-700/30 hover:bg-amber-800/40'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <ScrollArea className="h-96">
        <div className="space-y-3">
          {filteredTemplates.map((template, index) => {
            const IconComponent = template.icon;
            return (
              <div
                key={index}
                className={`p-3 rounded border cursor-pointer transition-all duration-200 ${
                  selectedTemplate === template.name
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-amber-700/50 hover:border-amber-500/70 hover:bg-amber-800/20'
                }`}
                onClick={() => setSelectedTemplate(template.name)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-amber-400" />
                    <span className="text-amber-100 font-medium text-sm">{template.name}</span>
                  </div>
                  
                  <span className={`text-xs px-2 py-1 rounded ${getComplexityColor(template.complexity)}`}>
                    {template.complexity}
                  </span>
                </div>
                
                <p className="text-xs text-amber-400/70 mb-2">{template.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-amber-600/20 text-amber-300 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <FantasyButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTemplateSelect(template.code);
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Use Template
                  </FantasyButton>
                </div>
                
                {selectedTemplate === template.name && (
                  <div className="mt-3 pt-3 border-t border-amber-600/30">
                    <div className="text-xs text-amber-300 mb-2">Preview:</div>
                    <pre className="text-xs bg-black/40 p-2 rounded border border-amber-700/30 text-green-300 overflow-x-auto">
                      {template.code.split('\n').slice(0, 8).join('\n')}
                      {template.code.split('\n').length > 8 && '\n...'}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="border-t border-amber-600/30 pt-3 space-y-2">
        <div className="text-xs text-amber-300 font-semibold">Quick Start</div>
        <div className="grid grid-cols-2 gap-2">
          <FantasyButton
            variant="outline"
            size="sm"
            onClick={() => onTemplateSelect(SOULSCRIPT_TEMPLATES[0].code)}
            className="text-purple-400 border-purple-600/40 hover:bg-purple-600/20"
          >
            🏛️ Sanctuary
          </FantasyButton>
          <FantasyButton
            variant="outline"
            size="sm"
            onClick={() => onTemplateSelect(SOULSCRIPT_TEMPLATES[1].code)}
            className="text-cyan-400 border-cyan-600/40 hover:bg-cyan-600/20"
          >
            🧠 AI Entity
          </FantasyButton>
        </div>
      </div>
    </div>
  );
}