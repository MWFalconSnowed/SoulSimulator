import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Home, Map } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { useWorldStore } from "@/stores/world-store";
import { useSimulation } from "@/hooks/use-simulation";
import { useMapByCode } from "@/hooks/use-maps";
import map003Path from "@assets/image_1752918218266.png";

export function IsometricWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [currentMapCode, setCurrentMapCode] = useState("MAP003");
  const { entities, selectedEntity, selectEntity } = useWorldStore();
  const { isRunning, simulationTime } = useSimulation();
  const { data: currentMap } = useMapByCode(currentMapCode);

  // Load background image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setBackgroundImage(img);
    };
    img.src = map003Path;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background map if available
      if (backgroundImage) {
        drawBackgroundMap(ctx, canvas.width, canvas.height);
      } else {
        // Fallback: Draw isometric grid
        drawIsometricGrid(ctx, canvas.width, canvas.height);
      }

      // Draw entities
      entities.forEach(entity => {
        drawEntity(ctx, entity, selectedEntity?.id === entity.id);
      });

      // Draw energy connections if simulation is running
      if (isRunning && entities.length > 1) {
        drawEnergyConnections(ctx, entities);
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [entities, selectedEntity, isRunning, backgroundImage]);

  const drawBackgroundMap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!backgroundImage) return;
    
    // Draw the background image to fill the canvas while maintaining aspect ratio
    const scale = Math.max(width / backgroundImage.width, height / backgroundImage.height);
    const scaledWidth = backgroundImage.width * scale;
    const scaledHeight = backgroundImage.height * scale;
    
    // Center the image
    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;
    
    // Add atmospheric overlay
    ctx.globalAlpha = 0.8;
    ctx.drawImage(backgroundImage, x, y, scaledWidth, scaledHeight);
    ctx.globalAlpha = 1.0;
    
    // Add subtle grid overlay on top of the background
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    for (let i = 0; i < width; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    
    for (let i = 0; i < height; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
  };

  const drawIsometricGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
    ctx.lineWidth = 1;

    const gridSize = 40;
    
    // Draw diagonal grid lines
    for (let x = -width; x < width * 2; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - height, height);
      ctx.stroke();
    }
  };

  const drawEntity = (ctx: CanvasRenderingContext2D, entity: any, isSelected: boolean) => {
    const { x, y } = entity.position;
    
    // Convert world coordinates to screen position (adjusted for the temple background)
    const screenX = x;
    const screenY = y;
    
    // Draw entity based on type with enhanced visual effects for the temple setting
    ctx.save();
    
    if (isSelected) {
      // Draw selection glow with temple-appropriate golden light
      ctx.shadowColor = '#ffbf00';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    switch (entity.type) {
      case 'Atom':
        drawAtom(ctx, screenX, screenY, entity.properties);
        break;
      case 'Spawner':
        drawSpawner(ctx, screenX, screenY, entity.properties);
        break;
      case 'Conscience':
        drawConscience(ctx, screenX, screenY, entity.properties);
        break;
      case 'Clone':
        drawClone(ctx, screenX, screenY, entity.properties);
        break;
    }
    
    ctx.restore();
    
    // Draw entity label with temple-style font and glow
    ctx.save();
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#ffbf00';
    ctx.font = 'bold 11px Cinzel';
    ctx.textAlign = 'center';
    ctx.fillText(entity.name, screenX, screenY - 35);
    ctx.restore();
  };

  const drawAtom = (ctx: CanvasRenderingContext2D, x: number, y: number, properties: any) => {
    const energyLevel = properties.energy / 100;
    const radius = 12 + energyLevel * 6;
    
    // Create mystical temple orb gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, '#fff8dc');
    gradient.addColorStop(0.3, '#ffd700');
    gradient.addColorStop(0.7, '#ff8c00');
    gradient.addColorStop(1, '#8b4513');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add temple-style flickering effect like torchlight
    const flickerIntensity = 0.8 + Math.sin(Date.now() * 0.008) * 0.2;
    const pulseRadius = radius + Math.sin(Date.now() * 0.003) * 3;
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.6 * energyLevel * flickerIntensity})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Add inner core glow
    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * flickerIntensity})`;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawSpawner = (ctx: CanvasRenderingContext2D, x: number, y: number, properties: any) => {
    const size = 12;
    
    // Draw square base
    ctx.fillStyle = '#cc6600';
    ctx.fillRect(x - size/2, y - size/2, size, size);
    
    // Draw plus sign
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 6, y);
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x, y + 6);
    ctx.stroke();
    
    // Add spawning animation
    if (properties.timer > properties.rate * 0.8) {
      ctx.strokeStyle = '#ffbf00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, size + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawConscience = (ctx: CanvasRenderingContext2D, x: number, y: number, properties: any) => {
    const radius = 12;
    
    // Draw main circle
    ctx.fillStyle = '#4a154b';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw thinking animation
    const rotationSpeed = 0.002;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 3; i++) {
      const angle = (Date.now() * rotationSpeed) + (i * Math.PI * 2 / 3);
      const orbitRadius = radius - 3;
      const dotX = x + Math.cos(angle) * orbitRadius;
      const dotY = y + Math.sin(angle) * orbitRadius;
      
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawClone = (ctx: CanvasRenderingContext2D, x: number, y: number, properties: any) => {
    const size = 10;
    
    // Draw diamond shape
    ctx.fillStyle = '#2d5016';
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
    
    // Add similarity indicator
    const similarity = properties.similarity / 100;
    ctx.strokeStyle = `rgba(45, 80, 22, ${similarity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - size - 3);
    ctx.lineTo(x + size + 3, y);
    ctx.lineTo(x, y + size + 3);
    ctx.lineTo(x - size - 3, y);
    ctx.closePath();
    ctx.stroke();
  };

  const drawEnergyConnections = (ctx: CanvasRenderingContext2D, entities: any[]) => {
    if (entities.length < 2) return;
    
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < entities.length - 1; i++) {
      const entity1 = entities[i];
      const entity2 = entities[i + 1];
      
      const x1 = (entity1.position.x - entity1.position.y) * 0.5;
      const y1 = (entity1.position.x + entity1.position.y) * 0.25;
      const x2 = (entity2.position.x - entity2.position.y) * 0.5;
      const y2 = (entity2.position.x + entity2.position.y) * 0.25;
      
      // Animate energy flow
      const dashOffset = (Date.now() * 0.02) % 20;
      ctx.setLineDash([10, 10]);
      ctx.lineDashOffset = -dashOffset;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check if click hits any entity
    let clickedEntity = null;
    for (const entity of entities) {
      const isoX = (entity.position.x - entity.position.y) * 0.5;
      const isoY = (entity.position.x + entity.position.y) * 0.25;
      
      const distance = Math.sqrt((clickX - isoX) ** 2 + (clickY - isoY) ** 2);
      if (distance < 20) {
        clickedEntity = entity;
        break;
      }
    }

    selectEntity(clickedEntity);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 relative bg-gradient-to-br from-gray-900 via-amber-900/5 to-gray-800 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer"
          onClick={handleCanvasClick}
        />
        
        {/* World Status Overlay */}
        <div className="absolute top-4 left-4 bg-amber-950/90 backdrop-blur-md border border-amber-600/40 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-xs text-amber-300 font-semibold flex items-center">
              <Map className="mr-1 h-3 w-3" />
              Current Map: {currentMap?.name || "Temple Mystique Émeraude"}
            </div>
            <div className="text-xs text-amber-400/70 mt-1">
              Code: {currentMapCode} | Dimensions: 1024x768
            </div>
          </div>
          
          <div>
            <div className="text-xs text-amber-300 font-semibold">World Status</div>
            <div className="text-xs text-amber-200 mt-1 space-y-1">
              <div>Entities: <span className="text-yellow-300">{entities.length}</span></div>
              <div>Energy Flow: <span className="text-green-300">+{(entities.length * 15.7).toFixed(1)}/s</span></div>
              <div>Memory Usage: <span className="text-blue-300">{(entities.length * 64 + 183)} KB</span></div>
            </div>
          </div>
        </div>

        {/* Viewport Controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button className="p-2 bg-amber-700 hover:bg-amber-600 text-white rounded transition-colors">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button className="p-2 bg-amber-700 hover:bg-amber-600 text-white rounded transition-colors">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button className="p-2 bg-amber-700 hover:bg-amber-600 text-white rounded transition-colors">
            <Home className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
