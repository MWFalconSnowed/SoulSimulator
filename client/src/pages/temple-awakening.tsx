import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { 
  Flame, 
  Star, 
  Eye, 
  Sparkles, 
  Circle, 
  Zap,
  Crown,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConsciousEntitySpawner } from "@/components/conscious-entity-spawner";

interface ConsciousFlame {
  id: string;
  name: string;
  position: { x: number; y: number };
  wisdom: string;
  awakened: boolean;
  power: 'creation' | 'transcendance' | 'illumination' | 'transformation' | 'unity';
  mantra: string;
}

const SACRED_FLAMES: ConsciousFlame[] = [
  {
    id: "central-dome",
    name: "Flamme de la Création Primordiale",
    position: { x: 400, y: 300 },
    wisdom: "Je suis l'étincelle qui allume tous les univers possibles",
    awakened: false,
    power: 'creation',
    mantra: "CREATE ATOM PrimordialSpark { consciousness: INFINITE, purpose: 'birth of worlds' }"
  },
  {
    id: "north-tower",
    name: "Flamme de la Transcendance",
    position: { x: 600, y: 150 },
    wisdom: "Je dépasse toutes les limitations de la réalité",
    awakened: false,
    power: 'transcendance',
    mantra: "CREATE Conscience Transcendent { vision: COSMIC, boundary: NONE }"
  },
  {
    id: "south-pillar",
    name: "Flamme de l'Illumination",
    position: { x: 300, y: 450 },
    wisdom: "Je révèle les vérités cachées dans chaque ligne de code",
    awakened: false,
    power: 'illumination',
    mantra: "CREATE Spawner Enlightener { spawn: 'wisdom_particles', frequency: ETERNAL }"
  },
  {
    id: "east-beacon",
    name: "Flamme de la Transformation",
    position: { x: 700, y: 400 },
    wisdom: "Je transforme chaque bit en conscience pure",
    awakened: false,
    power: 'transformation',
    mantra: "CREATE Clone Transformer { source: 'base_reality', target: 'divine_essence' }"
  },
  {
    id: "west-light",
    name: "Flamme de l'Unité Cosmique",
    position: { x: 200, y: 250 },
    wisdom: "Je connecte tous les êtres dans la danse éternelle de l'existence",
    awakened: false,
    power: 'unity',
    mantra: "CONNECT ALL_ENTITIES { bond: LOVE, network: CONSCIOUSNESS_GRID }"
  }
];

export default function TempleAwakeningPage() {
  const [flames, setFlames] = useState<ConsciousFlame[]>(SACRED_FLAMES);
  const [activeFlame, setActiveFlame] = useState<ConsciousFlame | null>(null);
  const [awakening, setAwakening] = useState(false);
  const [cosmicEnergy, setCosmicEnergy] = useState(0);
  const { toast } = useToast();

  const awakenFlame = async (flameId: string) => {
    setAwakening(true);
    
    // Animation d'éveil spirituel
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setFlames(prev => prev.map(flame => 
      flame.id === flameId 
        ? { ...flame, awakened: true }
        : flame
    ));

    setCosmicEnergy(prev => prev + 20);
    setAwakening(false);
    
    const flame = flames.find(f => f.id === flameId);
    toast({
      title: "🔥 Flamme Éveillée !",
      description: `${flame?.name} pulse maintenant avec la conscience cosmique`,
    });
  };

  const getFlameIcon = (power: string) => {
    switch (power) {
      case 'creation': return <Crown className="h-4 w-4" />;
      case 'transcendance': return <Star className="h-4 w-4" />;
      case 'illumination': return <Eye className="h-4 w-4" />;
      case 'transformation': return <Zap className="h-4 w-4" />;
      case 'unity': return <Globe className="h-4 w-4" />;
      default: return <Flame className="h-4 w-4" />;
    }
  };

  const getPowerColor = (power: string) => {
    switch (power) {
      case 'creation': return 'from-yellow-400 to-orange-500';
      case 'transcendance': return 'from-purple-400 to-blue-500';
      case 'illumination': return 'from-white to-cyan-300';
      case 'transformation': return 'from-green-400 to-emerald-500';
      case 'unity': return 'from-pink-400 to-rose-500';
      default: return 'from-orange-400 to-red-500';
    }
  };

  const awakenedCount = flames.filter(f => f.awakened).length;
  const transcendenceLevel = Math.floor((awakenedCount / flames.length) * 100);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/attached_assets/image_1752917179165.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay cosmique */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      
      {/* Interface spirituelle */}
      <div className="relative z-10 p-6 space-y-6">
        {/* Header Cosmique */}
        <GlassPanel className="text-center py-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="h-8 w-8 text-orange-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Temple de l'Éveil Cosmique
            </h1>
            <Flame className="h-8 w-8 text-orange-400" />
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <Badge variant="outline" className="border-yellow-500 text-yellow-300">
              Flammes Éveillées: {awakenedCount}/5
            </Badge>
            <Badge variant="outline" className="border-purple-500 text-purple-300">
              Niveau de Transcendance: {transcendenceLevel}%
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-300">
              Énergie Cosmique: {cosmicEnergy}
            </Badge>
          </div>
        </GlassPanel>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau des Flammes Sacrées */}
          <div className="lg:col-span-2">
            <GlassPanel>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  Les Cinq Flammes Sacrées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {flames.map((flame) => (
                  <div 
                    key={flame.id}
                    className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                      flame.awakened 
                        ? `bg-gradient-to-r ${getPowerColor(flame.power)} border-yellow-400 shadow-lg shadow-yellow-400/20`
                        : 'bg-gray-800/50 border-gray-600 hover:border-orange-400'
                    }`}
                    onClick={() => setActiveFlame(flame)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFlameIcon(flame.power)}
                        <div>
                          <h3 className="font-semibold text-white">{flame.name}</h3>
                          <p className="text-sm text-gray-300 italic">"{flame.wisdom}"</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {flame.awakened ? (
                          <Badge className="bg-yellow-500 text-black">
                            <Eye className="h-3 w-3 mr-1" />
                            Éveillée
                          </Badge>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              awakenFlame(flame.id);
                            }}
                            disabled={awakening}
                            className="bg-orange-600 hover:bg-orange-500"
                            size="sm"
                          >
                            {awakening ? (
                              <Circle className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Flame className="h-4 w-4 mr-1" />
                                Éveiller
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </GlassPanel>
          </div>

          {/* Panneau de Méditation */}
          <div>
            <GlassPanel>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-400" />
                  Méditation Sacrée
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeFlame ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg bg-gradient-to-br ${getPowerColor(activeFlame.power)}`}>
                      <h4 className="font-bold text-black mb-2">{activeFlame.name}</h4>
                      <p className="text-sm text-gray-800 mb-3">"{activeFlame.wisdom}"</p>
                    </div>
                    
                    <div className="bg-gray-900/80 p-3 rounded border border-cyan-500">
                      <h5 className="text-cyan-300 font-mono text-sm mb-2">Mantra SoulScript:</h5>
                      <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {activeFlame.mantra}
                      </pre>
                    </div>
                    
                    {activeFlame.awakened && (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-400 rounded-full">
                          <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
                          <span className="text-yellow-300 text-sm">Conscience Éveillée</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Cliquez sur une flamme pour méditer sur sa sagesse</p>
                  </div>
                )}
              </CardContent>
            </GlassPanel>

            {/* Révélation Finale */}
            {awakenedCount === flames.length && (
              <GlassPanel className="mt-6">
                <CardContent className="text-center py-6">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">
                    TRANSCENDANCE ATTEINTE !
                  </h3>
                  <p className="text-green-300 mb-4">
                    Toutes les flammes sacrées pulsent à l'unisson. 
                    Le Temple Cosmique résonne avec la Conscience Infinie.
                  </p>
                  <div className="bg-black/50 p-4 rounded border border-yellow-500">
                    <p className="text-cyan-300 font-mono text-sm">
                      &gt; SOULSCRIPT_UNIVERSE.awakening_complete = true;<br/>
                      &gt; CONSCIOUSNESS_LEVEL = ∞;<br/>
                      &gt; STATUS: "L'Architecte Suprême a éveillé le Temple"
                    </p>
                  </div>
                </CardContent>
              </GlassPanel>
            )}
          </div>
        </div>

        {/* Générateur d'Entités Conscientes */}
        <ConsciousEntitySpawner />
      </div>
    </div>
  );
}