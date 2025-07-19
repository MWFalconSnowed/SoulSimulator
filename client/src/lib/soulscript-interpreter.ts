import { ComponentDeclaration, FieldDeclaration, MethodDeclaration, Statement, Expression, BinaryExpression, Literal, Identifier } from './soulscript-parser';

// Advanced SoulScript Runtime Types
export interface SoulVariable {
  name: string;
  type: 'float' | 'int' | 'string' | 'bool' | 'vec2' | 'color' | 'array' | 'map' | 'Entity';
  value: any;
}

export interface SoulFunction {
  name: string;
  parameters: string[];
  returnType?: string;
  body: Statement[];
}

export interface WorldEntity {
  id: number;
  type: string;
  name: string;
  position: { x: number; y: number };
  properties: Map<string, any>;
  component?: RuntimeComponent;
  isActive: boolean;
  lifespan: number;
}

export interface RuntimeComponent {
  name: string;
  fields: Map<string, any>;
  methods: Map<string, MethodDeclaration>;
  isActive: boolean;
}

export interface SimulationLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  entityId?: number;
}

export class SoulScriptInterpreter {
  private components: Map<string, RuntimeComponent> = new Map();
  private logs: SimulationLog[] = [];
  private deltaTime: number = 0.016; // 60 FPS
  private globalVariables: Map<string, any> = new Map();
  private worldEntities: Map<number, WorldEntity> = new Map();
  private eventHandlers: Map<string, string[]> = new Map();
  private builtinFunctions: Map<string, Function> = new Map();
  private nextEntityId: number = 1;
  private worldTime: number = 0;
  private currentEntity: WorldEntity | null = null;

  constructor() {
    this.initializeBuiltinFunctions();
  }

  private initializeBuiltinFunctions() {
    // Math functions
    this.builtinFunctions.set('sin', (x: number) => Math.sin(x));
    this.builtinFunctions.set('cos', (x: number) => Math.cos(x));
    this.builtinFunctions.set('sqrt', (x: number) => Math.sqrt(x));
    this.builtinFunctions.set('abs', (x: number) => Math.abs(x));
    this.builtinFunctions.set('min', (a: number, b: number) => Math.min(a, b));
    this.builtinFunctions.set('max', (a: number, b: number) => Math.max(a, b));
    this.builtinFunctions.set('clamp', (x: number, min: number, max: number) => Math.max(min, Math.min(max, x)));
    this.builtinFunctions.set('random', () => Math.random());
    this.builtinFunctions.set('randomInt', (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min);
    
    // Vector functions
    this.builtinFunctions.set('randomVec2', (minX: number, maxX: number, minY?: number, maxY?: number) => ({
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * ((maxY || maxX) - (minY || minX)) + (minY || minX)
    }));
    this.builtinFunctions.set('distance', (a: any, b: any) => 
      Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
    );
    this.builtinFunctions.set('normalize', (v: any) => {
      const mag = Math.sqrt(v.x ** 2 + v.y ** 2);
      return mag > 0 ? { x: v.x / mag, y: v.y / mag } : { x: 0, y: 0 };
    });
    this.builtinFunctions.set('magnitude', (v: any) => Math.sqrt(v.x ** 2 + v.y ** 2));
    
    // Color functions
    this.builtinFunctions.set('rgb', (r: number, g: number, b: number) => ({ r, g, b }));
    
    // Entity functions
    this.builtinFunctions.set('createEntity', (type: string, position: any) => this.createEntity(type, position));
    this.builtinFunctions.set('getEntity', (id: number) => this.worldEntities.get(id));
    this.builtinFunctions.set('getAllEntities', () => Array.from(this.worldEntities.values()));
    this.builtinFunctions.set('getEntityCount', () => this.worldEntities.size);
    this.builtinFunctions.set('destroyEntity', (entity: any) => this.destroyEntity(entity));
    this.builtinFunctions.set('getEntitiesInRadius', (pos: any, radius: number) => 
      Array.from(this.worldEntities.values()).filter(e => 
        Math.sqrt((e.position.x - pos.x) ** 2 + (e.position.y - pos.y) ** 2) <= radius
      )
    );
    
    // Time functions
    this.builtinFunctions.set('getTime', () => this.worldTime);
    
    // Event functions
    this.builtinFunctions.set('broadcast', (event: string, data: any) => this.broadcast(event, data));
    this.builtinFunctions.set('subscribe', (event: string, handler: string) => this.subscribe(event, handler));
    
    // Utility functions
    this.builtinFunctions.set('log', (message: string) => this.log('info', message.toString()));
    this.builtinFunctions.set('lerp', (a: number, b: number, t: number) => a + (b - a) * t);
    
    // Animation and sprite functions
    this.builtinFunctions.set('setSpriteFrame', (frame: number, row: number) => {
      if (this.currentEntity) {
        this.currentEntity.properties.set('spriteFrame', frame);
        this.currentEntity.properties.set('spriteRow', row);
        this.log('info', `Sprite frame set to ${frame}, row ${row}`);
      }
    });
    this.builtinFunctions.set('setFlipX', (flip: boolean) => {
      if (this.currentEntity) {
        this.currentEntity.properties.set('flipX', flip);
      }
    });
    this.builtinFunctions.set('setFlipY', (flip: boolean) => {
      if (this.currentEntity) {
        this.currentEntity.properties.set('flipY', flip);
      }
    });
    this.builtinFunctions.set('setScale', (scaleX: number, scaleY: number) => {
      if (this.currentEntity) {
        this.currentEntity.properties.set('scaleX', scaleX);
        this.currentEntity.properties.set('scaleY', scaleY);
      }
    });
    this.builtinFunctions.set('setRotation', (rotation: number) => {
      if (this.currentEntity) {
        this.currentEntity.properties.set('rotation', rotation);
      }
    });
    this.builtinFunctions.set('setOpacity', (opacity: number) => {
      if (this.currentEntity) {
        this.currentEntity.properties.set('opacity', Math.max(0, Math.min(1, opacity)));
      }
    });
    this.builtinFunctions.set('scheduleCallback', (delay: number, callbackName: string, ...args: any[]) => {
      setTimeout(() => {
        if (this.currentEntity && this.currentEntity.component) {
          const method = this.currentEntity.component.methods.get(callbackName);
          if (method) {
            this.executeMethod(this.currentEntity.component, method, args);
          }
        }
      }, delay * 1000);
    });
  }

  createComponent(declaration: ComponentDeclaration, instanceName?: string): RuntimeComponent {
    const component: RuntimeComponent = {
      name: instanceName || declaration.name,
      fields: new Map(),
      methods: new Map(),
      isActive: true
    };

    // Initialize fields
    declaration.fields.forEach(field => {
      let value = field.initialValue;
      if (value !== undefined) {
        value = this.evaluateExpression(value, component);
      } else {
        value = this.getDefaultValue(field.dataType);
      }
      component.fields.set(field.name, value);
    });

    // Store methods
    declaration.methods.forEach(method => {
      component.methods.set(method.name, method);
    });

    this.components.set(component.name, component);
    this.log('info', `Component ${component.name} created`);
    
    return component;
  }

  updateComponent(componentName: string): void {
    const component = this.components.get(componentName);
    if (!component || !component.isActive) return;

    // Find the entity associated with this component
    for (const entity of this.worldEntities.values()) {
      if (entity.component === component) {
        this.currentEntity = entity;
        break;
      }
    }

    const updateMethod = component.methods.get('update');
    if (updateMethod) {
      try {
        this.executeMethod(component, updateMethod, [this.deltaTime]);
      } catch (error) {
        this.log('error', `Error updating ${componentName}: ${error}`, 0);
      }
    }
    
    this.currentEntity = null; // Reset after update
  }

  updateAllComponents(): void {
    this.worldTime += this.deltaTime;
    
    // Update all world entities
    for (const entity of this.worldEntities.values()) {
      if (entity.component && entity.isActive) {
        this.updateComponent(entity.component.name);
      }
      entity.lifespan += this.deltaTime;
    }
    
    // Update traditional components
    for (const [name, component] of this.components) {
      if (component.isActive) {
        this.updateComponent(name);
      }
    }
  }

  // Advanced entity management
  createEntity(type: string, position: { x: number; y: number }): WorldEntity {
    const entity: WorldEntity = {
      id: this.nextEntityId++,
      type,
      name: `${type}_${this.nextEntityId - 1}`,
      position,
      properties: new Map(),
      isActive: true,
      lifespan: 0
    };

    this.worldEntities.set(entity.id, entity);
    
    // Broadcast entity creation
    this.broadcast('entityCreated', {
      id: entity.id,
      type: entity.type,
      position: entity.position
    });

    this.log('info', `Entity created: ${entity.name} at (${position.x}, ${position.y})`);
    return entity;
  }

  destroyEntity(entity: WorldEntity | number): void {
    const id = typeof entity === 'number' ? entity : entity.id;
    const worldEntity = this.worldEntities.get(id);
    
    if (worldEntity) {
      // Call onDestroy if component has it
      if (worldEntity.component) {
        const destroyMethod = worldEntity.component.methods.get('onDestroy');
        if (destroyMethod) {
          try {
            this.executeMethod(worldEntity.component, destroyMethod, []);
          } catch (error) {
            this.log('error', `Error in onDestroy for ${worldEntity.name}: ${error}`);
          }
        }
      }

      // Broadcast destruction
      this.broadcast('entityDestroyed', {
        id: worldEntity.id,
        type: worldEntity.type,
        position: worldEntity.position,
        lifespan: worldEntity.lifespan
      });

      this.worldEntities.delete(id);
      this.log('info', `Entity destroyed: ${worldEntity.name}`);
    }
  }

  // Event system
  subscribe(event: string, handler: string): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  broadcast(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        // Find component that has this handler method
        for (const component of this.components.values()) {
          const method = component.methods.get(handler);
          if (method) {
            try {
              this.executeMethod(component, method, [data]);
            } catch (error) {
              this.log('error', `Event handler error: ${error}`);
            }
          }
        }
      }
    }
  }

  // Execute SoulScript from file content
  executeSoulScript(soulCode: string): void {
    try {
      // Parse the SoulScript code
      const parser = new (window as any).SoulScriptParser();
      const ast = parser.parse(soulCode);
      
      // Execute components
      if (ast.components) {
        for (const componentDecl of ast.components) {
          const component = this.createComponent(componentDecl);
          
          // Create a world entity for this component
          const entity = this.createEntity(componentDecl.name, { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 });
          entity.component = component;
          
          // Initialize the component if it has an init method
          const initMethod = component.methods.get('init');
          if (initMethod) {
            this.executeMethod(component, initMethod, [entity.position]);
          }
        }
      }
      
      this.log('info', 'SoulScript code executed successfully');
    } catch (error) {
      this.log('error', `SoulScript execution failed: ${error}`);
    }
  }

  executeMethod(component: RuntimeComponent, method: MethodDeclaration, args: any[]): any {
    // Create parameter bindings
    const parameterScope = new Map<string, any>();
    method.parameters.forEach((param, index) => {
      parameterScope.set(param.name, args[index]);
    });

    // Execute method body
    for (const statement of method.body) {
      this.executeStatement(statement, component, parameterScope);
    }
  }

  private executeStatement(statement: Statement, component: RuntimeComponent, scope: Map<string, any>): void {
    switch (statement.type) {
      case 'AssignmentStatement':
        this.executeAssignment(statement as any, component, scope);
        break;
      case 'IfStatement':
        this.executeIf(statement as any, component, scope);
        break;
      case 'CallStatement':
        this.executeCall(statement as any, component, scope);
        break;
    }
  }

  private executeAssignment(statement: any, component: RuntimeComponent, scope: Map<string, any>): void {
    const { variable, operator, value } = statement;
    
    const currentValue = component.fields.get(variable) || scope.get(variable) || 0;
    const newValue = this.evaluateExpression(value, component, scope);
    
    let result: any;
    switch (operator) {
      case '=':
        result = newValue;
        break;
      case '+=':
        result = currentValue + newValue;
        break;
      case '-=':
        result = currentValue - newValue;
        break;
      case '*=':
        result = currentValue * newValue;
        break;
      case '/=':
        result = currentValue / newValue;
        break;
      default:
        result = newValue;
    }
    
    if (component.fields.has(variable)) {
      component.fields.set(variable, result);
    } else {
      scope.set(variable, result);
    }
  }

  private executeIf(statement: any, component: RuntimeComponent, scope: Map<string, any>): void {
    const condition = this.evaluateExpression(statement.condition, component, scope);
    
    if (this.isTruthy(condition)) {
      for (const stmt of statement.body) {
        this.executeStatement(stmt, component, scope);
      }
    }
  }

  private executeCall(statement: any, component: RuntimeComponent, scope: Map<string, any>): void {
    const { function: functionName, arguments: args } = statement;
    
    switch (functionName) {
      case 'destroy':
        component.isActive = false;
        this.log('warning', `Component ${component.name} destroyed`);
        break;
      case 'spawn':
        if (args.length > 0) {
          const entityType = this.evaluateExpression(args[0], component, scope);
          this.log('info', `Spawning new ${entityType} from ${component.name}`);
        }
        break;
      default:
        this.log('warning', `Unknown function: ${functionName}`);
    }
  }

  private evaluateExpression(expr: Expression, component: RuntimeComponent, scope?: Map<string, any>): any {
    switch (expr.type) {
      case 'Literal':
        return (expr as Literal).value;
        
      case 'Identifier':
        const name = (expr as Identifier).name;
        if (scope && scope.has(name)) {
          return scope.get(name);
        }
        return component.fields.get(name) || 0;
        
      case 'BinaryExpression':
        return this.evaluateBinaryExpression(expr as BinaryExpression, component, scope);
        
      default:
        return 0;
    }
  }

  private evaluateBinaryExpression(expr: BinaryExpression, component: RuntimeComponent, scope?: Map<string, any>): any {
    const left = this.evaluateExpression(expr.left, component, scope);
    const right = this.evaluateExpression(expr.right, component, scope);
    
    switch (expr.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      case '==': return left == right;
      case '!=': return left != right;
      default: return 0;
    }
  }

  private getDefaultValue(dataType: string): any {
    switch (dataType) {
      case 'float':
      case 'int':
        return 0;
      case 'string':
        return '';
      case 'bool':
        return false;
      default:
        return null;
    }
  }

  private isTruthy(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value !== '';
    return value != null;
  }

  private log(level: SimulationLog['level'], message: string, entityId?: number): void {
    const log: SimulationLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      entityId
    };
    
    this.logs.push(log);
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  getLogs(): SimulationLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getComponent(name: string): RuntimeComponent | undefined {
    return this.components.get(name);
  }

  getAllComponents(): RuntimeComponent[] {
    return Array.from(this.components.values());
  }

  destroyComponent(name: string): boolean {
    const component = this.components.get(name);
    if (component) {
      component.isActive = false;
      this.log('warning', `Component ${name} destroyed`);
      return true;
    }
    return false;
  }

  reset(): void {
    this.components.clear();
    this.logs = [];
    this.log('info', 'Interpreter reset');
  }
}
