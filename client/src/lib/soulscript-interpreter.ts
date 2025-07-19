import { ComponentDeclaration, FieldDeclaration, MethodDeclaration, Statement, Expression, BinaryExpression, Literal, Identifier } from './soulscript-parser';

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

    const updateMethod = component.methods.get('update');
    if (updateMethod) {
      try {
        this.executeMethod(component, updateMethod, [this.deltaTime]);
      } catch (error) {
        this.log('error', `Error updating ${componentName}: ${error}`, 0);
      }
    }
  }

  updateAllComponents(): void {
    for (const [name, component] of this.components) {
      if (component.isActive) {
        this.updateComponent(name);
      }
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
