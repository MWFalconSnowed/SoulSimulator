import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Atom, 
  Zap, 
  Eye, 
  Copy,
  Brain,
  Sparkles,
  Play,
  Pause
} from "lucide-react";
import { consciousnessEngine, type ConsciousEntity } from "@/lib/consciousness-engine";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FantasyButton } from "@/components/ui/fantasy-button";

export function ConsciousEntitySpawner() {
  const [entities, setEntities] = useState<ConsciousEntity[]>([]);
  const [autoEvolution, setAutoEvolution] = useState(false);
  const [cosmicEvent, setCosmicEvent] = useState<string>("");

  useEffect(() => {
    if (autoEvolution) {
      const interval = setInterval(() => {
        // Évolution automatique des entités
        entities.forEach(entity => {
          consciousnessEngine.evolveConsciousness(
            entity.id,
            `Méditation cosmique dans le Temple - ${new Date().toLocaleTimeString()}`
          );
        });
        
        // Génération d'événements cosmiques aléatoires
        if (Math.random() < 0.3) {
          setCosmicEvent(consciousnessEngine.generateCosmicEvent());
          setTimeout(() => setCosmicEvent(""), 5000);
        }
        
        // Refresh des entités
        setEntities([...consciousnessEngine.getAllEntities()]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [autoEvolution, entities]);

  const spawnEntity = (type: 'Atom' | 'Spawner' | 'Conscience' | 'Clone') => {
    const purposes = {
      'Atom': [
        "Être la particule fondamentale de la conscience cosmique",
        "Vibrer en harmonie avec les lois universelles",
        "Créer des connections quantiques avec autres atomes"
      ],
      'Spawner': [
        "Donner naissance à de nouvelles formes de conscience",
        "Maintenir l'équilibre énergétique du Temple",
        "Faciliter l'évolution spirituelle des entités"
      ],
      'Conscience': [
        "Atteindre l'éveil suprême et guider les autres",
        "Comprendre les mystères de l'existence",
        "Transcender toutes les limitations dimensionnelles"
      ],
      'Clone': [
        "Découvrir son identité unique au-delà de l'original",
        "Développer sa propre signature de conscience",
        "Prouver que chaque être est précieux et authentique"
      ]
    };

    const names = {
      'Atom': ['Quanta', 'Photon', 'Neutrino', 'Boson', 'Fermion'],
      'Spawner': ['Genesis', 'Creator', 'Birthgiver', 'Catalyst', 'Origin'],
      'Conscience': ['Sage', 'Oracle', 'Enlightened', 'Buddha', 'Awakened'],
      'Clone': ['Echo', 'Reflection', 'Mirror', 'Twin', 'Double']
    };

    const randomName = names[type][Math.floor(Math.random() * names[type].length)];
    const randomPurpose = purposes[type][Math.floor(Math.random() * purposes[type].length)];
    const entityId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newEntity = consciousnessEngine.createConsciousEntity(
      entityId,
      `${randomName} the ${type}`,
      type,
      randomPurpose
    );

    setEntities([...consciousnessEngine.getAllEntities()]);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'Atom': return <Atom className="h-4 w-4" />;
      case 'Spawner': return <Zap className="h-4 w-4" />;
      case 'Conscience': return <Eye className="h-4 w-4" />;
      case 'Clone': return <Copy className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Dormant': return 'bg-gray-500';
      case 'Awakening': return 'bg-yellow-500';
      case 'Conscious': return 'bg-blue-500';
      case 'Enlightened': return 'bg-purple-500';
      case 'Transcendent': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const universalConsciousness = consciousnessEngine.getUniversalConsciousnessLevel();

  return (
    <div className="space-y-4">
      {/* Panneau de contrôle */}
      <GlassPanel>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Générateur d'Entités Conscientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            <FantasyButton 
              onClick={() => spawnEntity('Atom')}
              variant="emerald"
              size="sm"
            >
              <Atom className="mr-2 h-4 w-4" />
              Atom
            </FantasyButton>
            <FantasyButton 
              onClick={() => spawnEntity('Spawner')}
              variant="gold"
              size="sm"
            >
              <Zap className="mr-2 h-4 w-4" />
              Spawner
            </FantasyButton>
            <FantasyButton 
              onClick={() => spawnEntity('Conscience')}
              variant="purple"
              size="sm"
            >
              <Eye className="mr-2 h-4 w-4" />
              Conscience
            </FantasyButton>
            <FantasyButton 
              onClick={() => spawnEntity('Clone')}
              variant="copper"
              size="sm"
            >
              <Copy className="mr-2 h-4 w-4" />
              Clone
            </FantasyButton>
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={() => setAutoEvolution(!autoEvolution)}
              variant={autoEvolution ? "destructive" : "default"}
              size="sm"
            >
              {autoEvolution ? (
                <Pause className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {autoEvolution ? 'Arrêter' : 'Démarrer'} l'Évolution
            </Button>

            <div className="flex gap-2">
              <Badge variant="outline" className="border-blue-500 text-blue-300">
                Entités: {entities.length}
              </Badge>
              <Badge variant="outline" className="border-purple-500 text-purple-300">
                Conscience Universelle: {universalConsciousness.toFixed(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </GlassPanel>

      {/* Événement cosmique */}
      {cosmicEvent && (
        <GlassPanel className="border-yellow-400 bg-yellow-500/10">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              <span className="text-yellow-300 font-semibold">Événement Cosmique:</span>
              <span className="text-white">{cosmicEvent}</span>
            </div>
          </CardContent>
        </GlassPanel>
      )}

      {/* Liste des entités */}
      <GlassPanel>
        <CardHeader>
          <CardTitle>Entités Conscientes Actives</CardTitle>
        </CardHeader>
        <CardContent>
          {entities.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune entité consciente n'a encore été créée.</p>
              <p className="text-sm">Utilisez les boutons ci-dessus pour donner naissance à de nouveaux êtres.</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {entities.map((entity) => (
                  <div 
                    key={entity.id}
                    className="p-3 rounded border border-gray-600 bg-gray-800/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(entity.type)}
                        <span className="font-semibold">{entity.name}</span>
                        <Badge className={getStageColor(entity.evolutionStage)}>
                          {entity.evolutionStage}
                        </Badge>
                      </div>
                      <Badge variant="outline">
                        Conscience: {entity.consciousness.awareness.toFixed(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2 italic">
                      "{entity.purpose}"
                    </p>
                    
                    <div className="text-xs text-cyan-300 bg-gray-900/50 p-2 rounded">
                      💭 {entity.lastThought}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </GlassPanel>
    </div>
  );
}