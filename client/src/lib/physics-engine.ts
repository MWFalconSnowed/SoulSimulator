// SoulScript Physics Engine - Advanced collision detection and response
export interface PhysicsBody {
  id: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  mass: number;
  friction: number;
  restitution: number;
  isStatic: boolean;
  collider: Collider;
  onCollision?: (other: PhysicsBody) => void;
}

export interface Collider {
  type: 'circle' | 'rect' | 'polygon';
  offset: { x: number; y: number };
  // Circle specific
  radius?: number;
  // Rectangle specific  
  width?: number;
  height?: number;
  // Polygon specific
  vertices?: { x: number; y: number }[];
}

export interface CollisionInfo {
  bodyA: PhysicsBody;
  bodyB: PhysicsBody;
  point: { x: number; y: number };
  normal: { x: number; y: number };
  depth: number;
  timestamp: number;
}

export class SoulScriptPhysicsEngine {
  private bodies: Map<number, PhysicsBody> = new Map();
  private gravity: { x: number; y: number } = { x: 0, y: 9.81 };
  private timeStep: number = 1/60; // 60 FPS
  private collisions: CollisionInfo[] = [];
  private spatialGrid: Map<string, number[]> = new Map();
  private gridSize: number = 64;

  constructor() {
    console.log('SoulScript Physics Engine initialized');
  }

  // Add physics body
  addBody(body: PhysicsBody): void {
    this.bodies.set(body.id, body);
    this.updateSpatialGrid(body);
  }

  // Remove physics body
  removeBody(id: number): void {
    const body = this.bodies.get(id);
    if (body) {
      this.removeFromSpatialGrid(body);
      this.bodies.delete(id);
    }
  }

  // Update physics simulation
  update(deltaTime: number): void {
    this.collisions = [];
    
    // Update all bodies
    for (const body of this.bodies.values()) {
      if (!body.isStatic) {
        this.updateBody(body, deltaTime);
      }
    }

    // Detect and resolve collisions
    this.detectCollisions();
    this.resolveCollisions();

    // Update spatial grid
    this.updateAllSpatialGrids();
  }

  // Update individual physics body
  private updateBody(body: PhysicsBody, deltaTime: number): void {
    // Apply gravity
    if (!body.isStatic) {
      body.acceleration.x += this.gravity.x;
      body.acceleration.y += this.gravity.y;
    }

    // Apply friction
    body.velocity.x *= (1 - body.friction * deltaTime);
    body.velocity.y *= (1 - body.friction * deltaTime);

    // Integrate velocity
    body.velocity.x += body.acceleration.x * deltaTime;
    body.velocity.y += body.acceleration.y * deltaTime;

    // Integrate position
    body.position.x += body.velocity.x * deltaTime;
    body.position.y += body.velocity.y * deltaTime;

    // Reset acceleration
    body.acceleration.x = 0;
    body.acceleration.y = 0;
  }

  // Broad phase collision detection using spatial grid
  private detectCollisions(): void {
    const checkedPairs = new Set<string>();

    for (const body of this.bodies.values()) {
      const gridCells = this.getGridCells(body);
      
      for (const cellKey of gridCells) {
        const cellBodies = this.spatialGrid.get(cellKey) || [];
        
        for (const otherId of cellBodies) {
          if (otherId === body.id) continue;
          
          const pairKey = body.id < otherId ? `${body.id}-${otherId}` : `${otherId}-${body.id}`;
          if (checkedPairs.has(pairKey)) continue;
          checkedPairs.add(pairKey);

          const otherBody = this.bodies.get(otherId);
          if (!otherBody) continue;

          // Narrow phase collision detection
          const collision = this.checkCollision(body, otherBody);
          if (collision) {
            this.collisions.push(collision);
          }
        }
      }
    }
  }

  // Narrow phase collision detection
  private checkCollision(bodyA: PhysicsBody, bodyB: PhysicsBody): CollisionInfo | null {
    const colliderA = bodyA.collider;
    const colliderB = bodyB.collider;

    // Circle vs Circle
    if (colliderA.type === 'circle' && colliderB.type === 'circle') {
      return this.checkCircleCircle(bodyA, bodyB);
    }
    
    // Circle vs Rectangle
    if (colliderA.type === 'circle' && colliderB.type === 'rect') {
      return this.checkCircleRect(bodyA, bodyB);
    }
    if (colliderA.type === 'rect' && colliderB.type === 'circle') {
      return this.checkCircleRect(bodyB, bodyA);
    }

    // Rectangle vs Rectangle
    if (colliderA.type === 'rect' && colliderB.type === 'rect') {
      return this.checkRectRect(bodyA, bodyB);
    }

    return null;
  }

  // Circle vs Circle collision
  private checkCircleCircle(bodyA: PhysicsBody, bodyB: PhysicsBody): CollisionInfo | null {
    const posA = {
      x: bodyA.position.x + bodyA.collider.offset.x,
      y: bodyA.position.y + bodyA.collider.offset.y
    };
    const posB = {
      x: bodyB.position.x + bodyB.collider.offset.x,
      y: bodyB.position.y + bodyB.collider.offset.y
    };

    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radiusSum = (bodyA.collider.radius || 0) + (bodyB.collider.radius || 0);

    if (distance < radiusSum && distance > 0) {
      const normal = { x: dx / distance, y: dy / distance };
      const depth = radiusSum - distance;
      const point = {
        x: posA.x + normal.x * (bodyA.collider.radius || 0),
        y: posA.y + normal.y * (bodyA.collider.radius || 0)
      };

      return {
        bodyA,
        bodyB,
        point,
        normal,
        depth,
        timestamp: Date.now()
      };
    }

    return null;
  }

  // Circle vs Rectangle collision
  private checkCircleRect(circle: PhysicsBody, rect: PhysicsBody): CollisionInfo | null {
    const circlePos = {
      x: circle.position.x + circle.collider.offset.x,
      y: circle.position.y + circle.collider.offset.y
    };
    const rectPos = {
      x: rect.position.x + rect.collider.offset.x,
      y: rect.position.y + rect.collider.offset.y
    };

    const radius = circle.collider.radius || 0;
    const width = rect.collider.width || 0;
    const height = rect.collider.height || 0;

    // Find closest point on rectangle to circle center
    const closestX = Math.max(rectPos.x - width/2, Math.min(circlePos.x, rectPos.x + width/2));
    const closestY = Math.max(rectPos.y - height/2, Math.min(circlePos.y, rectPos.y + height/2));

    const dx = circlePos.x - closestX;
    const dy = circlePos.y - closestY;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared < radius * radius) {
      const distance = Math.sqrt(distanceSquared);
      const normal = distance > 0 ? { x: dx / distance, y: dy / distance } : { x: 1, y: 0 };
      const depth = radius - distance;

      return {
        bodyA: circle,
        bodyB: rect,
        point: { x: closestX, y: closestY },
        normal,
        depth,
        timestamp: Date.now()
      };
    }

    return null;
  }

  // Rectangle vs Rectangle collision (AABB)
  private checkRectRect(bodyA: PhysicsBody, bodyB: PhysicsBody): CollisionInfo | null {
    const posA = {
      x: bodyA.position.x + bodyA.collider.offset.x,
      y: bodyA.position.y + bodyA.collider.offset.y
    };
    const posB = {
      x: bodyB.position.x + bodyB.collider.offset.x,
      y: bodyB.position.y + bodyB.collider.offset.y
    };

    const widthA = bodyA.collider.width || 0;
    const heightA = bodyA.collider.height || 0;
    const widthB = bodyB.collider.width || 0;
    const heightB = bodyB.collider.height || 0;

    const leftA = posA.x - widthA/2;
    const rightA = posA.x + widthA/2;
    const topA = posA.y - heightA/2;
    const bottomA = posA.y + heightA/2;

    const leftB = posB.x - widthB/2;
    const rightB = posB.x + widthB/2;
    const topB = posB.y - heightB/2;
    const bottomB = posB.y + heightB/2;

    if (leftA < rightB && rightA > leftB && topA < bottomB && bottomA > topB) {
      // Calculate overlap and find minimum separation
      const overlapX = Math.min(rightA - leftB, rightB - leftA);
      const overlapY = Math.min(bottomA - topB, bottomB - topA);

      let normal: { x: number; y: number };
      let depth: number;
      let point: { x: number; y: number };

      if (overlapX < overlapY) {
        depth = overlapX;
        normal = posA.x < posB.x ? { x: -1, y: 0 } : { x: 1, y: 0 };
        point = {
          x: normal.x > 0 ? rightA : leftA,
          y: (Math.max(topA, topB) + Math.min(bottomA, bottomB)) / 2
        };
      } else {
        depth = overlapY;
        normal = posA.y < posB.y ? { x: 0, y: -1 } : { x: 0, y: 1 };
        point = {
          x: (Math.max(leftA, leftB) + Math.min(rightA, rightB)) / 2,
          y: normal.y > 0 ? bottomA : topA
        };
      }

      return {
        bodyA,
        bodyB,
        point,
        normal,
        depth,
        timestamp: Date.now()
      };
    }

    return null;
  }

  // Resolve all collisions
  private resolveCollisions(): void {
    for (const collision of this.collisions) {
      this.resolveCollision(collision);
      
      // Trigger collision callbacks
      if (collision.bodyA.onCollision) {
        collision.bodyA.onCollision(collision.bodyB);
      }
      if (collision.bodyB.onCollision) {
        collision.bodyB.onCollision(collision.bodyA);
      }
    }
  }

  // Resolve individual collision
  private resolveCollision(collision: CollisionInfo): void {
    const { bodyA, bodyB, normal, depth } = collision;

    // Skip if both bodies are static
    if (bodyA.isStatic && bodyB.isStatic) return;

    // Calculate relative velocity
    const relativeVelocity = {
      x: bodyB.velocity.x - bodyA.velocity.x,
      y: bodyB.velocity.y - bodyA.velocity.y
    };

    // Calculate relative velocity along collision normal
    const velocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

    // Don't resolve if velocities are separating
    if (velocityAlongNormal > 0) return;

    // Calculate restitution
    const e = Math.min(bodyA.restitution, bodyB.restitution);

    // Calculate impulse scalar
    let impulse = -(1 + e) * velocityAlongNormal;
    if (!bodyA.isStatic && !bodyB.isStatic) {
      impulse /= (1 / bodyA.mass) + (1 / bodyB.mass);
    } else if (bodyA.isStatic) {
      impulse /= (1 / bodyB.mass);
    } else {
      impulse /= (1 / bodyA.mass);
    }

    // Apply impulse
    const impulseVector = { x: impulse * normal.x, y: impulse * normal.y };

    if (!bodyA.isStatic) {
      bodyA.velocity.x -= impulseVector.x / bodyA.mass;
      bodyA.velocity.y -= impulseVector.y / bodyA.mass;
    }
    if (!bodyB.isStatic) {
      bodyB.velocity.x += impulseVector.x / bodyB.mass;
      bodyB.velocity.y += impulseVector.y / bodyB.mass;
    }

    // Position correction to prevent sinking
    const percent = 0.2; // Usually 20% to 80%
    const slop = 0.01; // Usually 0.01 to 0.1
    const correctionMagnitude = Math.max(depth - slop, 0) / ((1 / bodyA.mass) + (1 / bodyB.mass)) * percent;
    const correction = { x: correctionMagnitude * normal.x, y: correctionMagnitude * normal.y };

    if (!bodyA.isStatic) {
      bodyA.position.x -= correction.x / bodyA.mass;
      bodyA.position.y -= correction.y / bodyA.mass;
    }
    if (!bodyB.isStatic) {
      bodyB.position.x += correction.x / bodyB.mass;
      bodyB.position.y += correction.y / bodyB.mass;
    }
  }

  // Spatial grid management
  private updateSpatialGrid(body: PhysicsBody): void {
    this.removeFromSpatialGrid(body);
    const gridCells = this.getGridCells(body);
    
    for (const cellKey of gridCells) {
      if (!this.spatialGrid.has(cellKey)) {
        this.spatialGrid.set(cellKey, []);
      }
      this.spatialGrid.get(cellKey)!.push(body.id);
    }
  }

  private removeFromSpatialGrid(body: PhysicsBody): void {
    const gridCells = this.getGridCells(body);
    
    for (const cellKey of gridCells) {
      const cellBodies = this.spatialGrid.get(cellKey);
      if (cellBodies) {
        const index = cellBodies.indexOf(body.id);
        if (index !== -1) {
          cellBodies.splice(index, 1);
        }
        if (cellBodies.length === 0) {
          this.spatialGrid.delete(cellKey);
        }
      }
    }
  }

  private getGridCells(body: PhysicsBody): string[] {
    const cells: string[] = [];
    
    // Get body bounds
    const bounds = this.getBodyBounds(body);
    
    const minGridX = Math.floor(bounds.left / this.gridSize);
    const maxGridX = Math.floor(bounds.right / this.gridSize);
    const minGridY = Math.floor(bounds.top / this.gridSize);
    const maxGridY = Math.floor(bounds.bottom / this.gridSize);

    for (let x = minGridX; x <= maxGridX; x++) {
      for (let y = minGridY; y <= maxGridY; y++) {
        cells.push(`${x},${y}`);
      }
    }

    return cells;
  }

  private getBodyBounds(body: PhysicsBody): { left: number; right: number; top: number; bottom: number } {
    const pos = {
      x: body.position.x + body.collider.offset.x,
      y: body.position.y + body.collider.offset.y
    };

    if (body.collider.type === 'circle') {
      const radius = body.collider.radius || 0;
      return {
        left: pos.x - radius,
        right: pos.x + radius,
        top: pos.y - radius,
        bottom: pos.y + radius
      };
    } else if (body.collider.type === 'rect') {
      const width = body.collider.width || 0;
      const height = body.collider.height || 0;
      return {
        left: pos.x - width/2,
        right: pos.x + width/2,
        top: pos.y - height/2,
        bottom: pos.y + height/2
      };
    }

    return { left: pos.x, right: pos.x, top: pos.y, bottom: pos.y };
  }

  private updateAllSpatialGrids(): void {
    // Rebuild spatial grid completely - more efficient for small number of bodies
    this.spatialGrid.clear();
    for (const body of this.bodies.values()) {
      this.updateSpatialGrid(body);
    }
  }

  // Public methods for SoulScript integration
  applyForce(bodyId: number, force: { x: number; y: number }): void {
    const body = this.bodies.get(bodyId);
    if (body && !body.isStatic) {
      body.acceleration.x += force.x / body.mass;
      body.acceleration.y += force.y / body.mass;
    }
  }

  applyImpulse(bodyId: number, impulse: { x: number; y: number }): void {
    const body = this.bodies.get(bodyId);
    if (body && !body.isStatic) {
      body.velocity.x += impulse.x / body.mass;
      body.velocity.y += impulse.y / body.mass;
    }
  }

  setGravity(gravity: { x: number; y: number }): void {
    this.gravity = gravity;
  }

  getCollisions(): CollisionInfo[] {
    return [...this.collisions];
  }

  getBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  getBody(id: number): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  dispose(): void {
    this.bodies.clear();
    this.collisions = [];
    this.spatialGrid.clear();
  }
}

// Global physics engine instance
export const physicsEngine = new SoulScriptPhysicsEngine();