import { useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Home } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { useWorldStore } from "@/stores/world-store";
import { useSimulation } from "@/hooks/use-simulation";

export function IsometricWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { entities, selectedEntity, selectEntity } = useWorldStore();
  const { isRunning, simulationTime } = useSimulation();

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

      // Draw isometric grid
      drawIsometricGrid(ctx, canvas.width, canvas.height);

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
  }, [entities, selectedEntity, isRunning]);

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
    
    // Convert to isometric coordinates
    const isoX = (x - y) * 0.5;
    const isoY = (x + y) * 0.25;
    
    // Draw entity based on type
    ctx.save();
    
    if (isSelected) {
      // Draw selection glow
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 20;
    }
    
    switch (entity.type) {
      case 'Atom':
        drawAtom(ctx, isoX, isoY, entity.properties);
        break;
      case 'Spawner':
        drawSpawner(ctx, isoX, isoY, entity.properties);
        break;
      case 'Conscience':
        drawConscience(ctx, isoX, isoY, entity.properties);
        break;
      case 'Clone':
        drawClone(ctx, isoX, isoY, entity.properties);
        break;
    }
    
    ctx.restore();
    
    // Draw entity label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(entity.name, isoX, isoY - 30);
  };

  const drawAtom = (ctx: CanvasRenderingContext2D, x: number, y: number, properties: any) => {
    const energyLevel = properties.energy / 100;
    const radius = 8 + energyLevel * 4;
    
    // Create gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, '#ffbf00');
    gradient.addColorStop(1, '#d4af37');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add pulsing effect
    const pulseRadius = radius + Math.sin(Date.now() * 0.005) * 2;
    ctx.strokeStyle = `rgba(212, 175, 55, ${0.5 * energyLevel})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
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
      <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-black overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer"
          onClick={handleCanvasClick}
        />
        
        {/* World Status Overlay */}
        <GlassPanel className="absolute top-4 left-4 p-4">
          <div className="text-xs text-yellow-400 font-semibold">World Status</div>
          <div className="text-xs text-gray-300 mt-1 space-y-1">
            <div>Entities: <span className="text-yellow-400">{entities.length}</span></div>
            <div>Energy Flow: <span className="text-green-400">+{(entities.length * 15.7).toFixed(1)}/s</span></div>
            <div>Memory Usage: <span className="text-blue-400">{(entities.length * 64 + 183)} KB</span></div>
          </div>
        </GlassPanel>

        {/* Viewport Controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <FantasyButton variant="default" className="p-2">
            <ZoomIn className="h-4 w-4" />
          </FantasyButton>
          <FantasyButton variant="default" className="p-2">
            <ZoomOut className="h-4 w-4" />
          </FantasyButton>
          <FantasyButton variant="default" className="p-2">
            <Home className="h-4 w-4" />
          </FantasyButton>
        </div>
      </div>
    </div>
  );
}
