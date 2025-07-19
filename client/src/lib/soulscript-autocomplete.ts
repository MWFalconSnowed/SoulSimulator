// SoulScript Language Server and Autocomplete System
export interface CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
  sortText?: string;
}

export enum CompletionItemKind {
  Keyword = 'keyword',
  Function = 'function',
  Variable = 'variable',
  Type = 'type',
  Component = 'component',
  Property = 'property'
}

export interface DiagnosticMessage {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  code?: string;
}

export class SoulScriptLanguageServer {
  private keywords: string[] = [
    'component', 'fn', 'if', 'else', 'while', 'for', 'return',
    'true', 'false', 'null', 'this', 'break', 'continue',
    'switch', 'case', 'default'
  ];

  private types: string[] = [
    'int', 'float', 'string', 'bool', 'vec2', 'color',
    'array', 'map', 'Entity'
  ];

  private builtinFunctions: Array<{name: string, signature: string, description: string}> = [
    // Math functions
    { name: 'sin', signature: 'sin(x: float) -> float', description: 'Calculate sine of angle in radians' },
    { name: 'cos', signature: 'cos(x: float) -> float', description: 'Calculate cosine of angle in radians' },
    { name: 'sqrt', signature: 'sqrt(x: float) -> float', description: 'Calculate square root' },
    { name: 'abs', signature: 'abs(x: float) -> float', description: 'Calculate absolute value' },
    { name: 'min', signature: 'min(a: float, b: float) -> float', description: 'Get minimum of two values' },
    { name: 'max', signature: 'max(a: float, b: float) -> float', description: 'Get maximum of two values' },
    { name: 'random', signature: 'random() -> float', description: 'Generate random float between 0 and 1' },
    { name: 'randomInt', signature: 'randomInt(min: int, max: int) -> int', description: 'Generate random integer in range' },
    { name: 'clamp', signature: 'clamp(value: float, min: float, max: float) -> float', description: 'Clamp value between min and max' },
    { name: 'lerp', signature: 'lerp(a: float, b: float, t: float) -> float', description: 'Linear interpolation between two values' },

    // Vector functions
    { name: 'distance', signature: 'distance(a: vec2, b: vec2) -> float', description: 'Calculate distance between two points' },
    { name: 'normalize', signature: 'normalize(v: vec2) -> vec2', description: 'Normalize vector to unit length' },
    { name: 'magnitude', signature: 'magnitude(v: vec2) -> float', description: 'Get vector magnitude' },

    // Color functions
    { name: 'rgb', signature: 'rgb(r: float, g: float, b: float) -> color', description: 'Create RGB color' },
    { name: 'hsv', signature: 'hsv(h: float, s: float, v: float) -> color', description: 'Create HSV color' },

    // Entity functions
    { name: 'createEntity', signature: 'createEntity(type: string, pos: vec2) -> Entity', description: 'Create new entity in world' },
    { name: 'destroyEntity', signature: 'destroyEntity(entity: Entity)', description: 'Remove entity from world' },
    { name: 'getAllEntities', signature: 'getAllEntities() -> array', description: 'Get all entities in world' },
    { name: 'getEntitiesInRadius', signature: 'getEntitiesInRadius(pos: vec2, radius: float) -> array', description: 'Find entities within radius' },

    // Animation functions
    { name: 'setSpriteFrame', signature: 'setSpriteFrame(frame: int, row: int)', description: 'Set sprite animation frame' },
    { name: 'setFlipX', signature: 'setFlipX(flip: bool)', description: 'Set horizontal sprite flip' },
    { name: 'setFlipY', signature: 'setFlipY(flip: bool)', description: 'Set vertical sprite flip' },
    { name: 'setScale', signature: 'setScale(scaleX: float, scaleY: float)', description: 'Set entity scale' },
    { name: 'setRotation', signature: 'setRotation(rotation: float)', description: 'Set entity rotation in radians' },
    { name: 'setOpacity', signature: 'setOpacity(opacity: float)', description: 'Set entity opacity (0-1)' },

    // Audio functions
    { name: 'playSound', signature: 'playSound(clipId: string, volume?: float)', description: 'Play sound effect' },
    { name: 'playMusic', signature: 'playMusic(clipId: string, fadeTime?: float)', description: 'Play background music' },
    { name: 'stopMusic', signature: 'stopMusic(fadeTime?: float)', description: 'Stop background music' },
    { name: 'playAmbient', signature: 'playAmbient(clipId: string)', description: 'Play ambient sound loop' },

    // Physics functions
    { name: 'setPhysicsBody', signature: 'setPhysicsBody(type: string, mass: float)', description: 'Configure physics body' },
    { name: 'applyForce', signature: 'applyForce(forceX: float, forceY: float)', description: 'Apply force to physics body' },
    { name: 'setVelocity', signature: 'setVelocity(velX: float, velY: float)', description: 'Set physics body velocity' },

    // Event functions
    { name: 'broadcast', signature: 'broadcast(event: string, data: any)', description: 'Send global event' },
    { name: 'subscribe', signature: 'subscribe(event: string, handler: string)', description: 'Subscribe to event' },

    // Utility functions
    { name: 'log', signature: 'log(message: string)', description: 'Log message to console' },
    { name: 'getTime', signature: 'getTime() -> float', description: 'Get current simulation time' }
  ];

  private componentTemplates: Array<{name: string, template: string}> = [
    {
      name: 'Basic Component',
      template: `component ${1:ComponentName} {
    ${2:// Properties}
    
    fn init(${3:// parameters}) {
        ${4:// Initialization code}
    }
    
    fn update(float deltaTime) {
        ${5:// Update logic}
    }
}`
    },
    {
      name: 'Animated Entity',
      template: `component ${1:AnimatedEntity} {
    int currentFrame = 0;
    float animationTimer = 0.0;
    float frameRate = 0.1;
    string currentAnimation = "idle";
    
    fn init(vec2 startPos) {
        position = startPos;
        setSpriteFrame(0, 0);
    }
    
    fn update(float deltaTime) {
        animationTimer += deltaTime;
        if (animationTimer >= frameRate) {
            animationTimer = 0.0;
            currentFrame = (currentFrame + 1) % 6;
            setSpriteFrame(currentFrame, 0);
        }
    }
    
    fn setAnimation(string animName) {
        currentAnimation = animName;
        currentFrame = 0;
    }
}`
    }
  ];

  // Get completions for current cursor position
  getCompletions(text: string, line: number, character: number): CompletionItem[] {
    const completions: CompletionItem[] = [];
    const currentWord = this.getCurrentWord(text, line, character);

    // Add keywords
    this.keywords.forEach(keyword => {
      if (keyword.startsWith(currentWord.toLowerCase())) {
        completions.push({
          label: keyword,
          kind: CompletionItemKind.Keyword,
          detail: 'SoulScript keyword',
          sortText: '1' + keyword
        });
      }
    });

    // Add types
    this.types.forEach(type => {
      if (type.startsWith(currentWord.toLowerCase())) {
        completions.push({
          label: type,
          kind: CompletionItemKind.Type,
          detail: 'SoulScript type',
          sortText: '2' + type
        });
      }
    });

    // Add builtin functions
    this.builtinFunctions.forEach(func => {
      if (func.name.startsWith(currentWord.toLowerCase())) {
        completions.push({
          label: func.name,
          kind: CompletionItemKind.Function,
          detail: func.signature,
          documentation: func.description,
          insertText: func.name + '($0)',
          sortText: '3' + func.name
        });
      }
    });

    // Add component templates when typing "component"
    if (currentWord.toLowerCase().includes('comp') || text.includes('component')) {
      this.componentTemplates.forEach(template => {
        completions.push({
          label: template.name,
          kind: CompletionItemKind.Component,
          detail: 'Component template',
          insertText: template.template,
          sortText: '4' + template.name
        });
      });
    }

    return completions.sort((a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label));
  }

  // Validate SoulScript syntax
  validateSyntax(text: string): DiagnosticMessage[] {
    const diagnostics: DiagnosticMessage[] = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for common syntax errors
      if (line.includes('component') && !line.includes('{') && !line.endsWith(';')) {
        if (i + 1 < lines.length && !lines[i + 1].trim().startsWith('{')) {
          diagnostics.push({
            line: i + 1,
            column: 1,
            severity: 'error',
            message: 'Component declaration must be followed by opening brace',
            code: 'missing-brace'
          });
        }
      }

      // Check for function syntax
      if (line.includes('fn ') && !line.includes('(')) {
        diagnostics.push({
          line: i + 1,
          column: line.indexOf('fn ') + 1,
          severity: 'error',
          message: 'Function declaration must include parameters in parentheses',
          code: 'missing-params'
        });
      }

      // Check for unmatched braces
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      if (openBraces !== closeBraces && line.includes('{') && line.includes('}')) {
        diagnostics.push({
          line: i + 1,
          column: 1,
          severity: 'warning',
          message: 'Unmatched braces on same line',
          code: 'unmatched-braces'
        });
      }

      // Check for undefined functions (basic check)
      const functionCalls = line.match(/(\w+)\s*\(/g);
      if (functionCalls) {
        functionCalls.forEach(call => {
          const funcName = call.replace(/\s*\(/, '');
          const isBuiltin = this.builtinFunctions.some(f => f.name === funcName);
          const isKeyword = this.keywords.includes(funcName);
          
          if (!isBuiltin && !isKeyword && !['if', 'while', 'for', 'switch'].includes(funcName)) {
            diagnostics.push({
              line: i + 1,
              column: line.indexOf(call) + 1,
              severity: 'warning',
              message: `Unknown function '${funcName}'`,
              code: 'unknown-function'
            });
          }
        });
      }
    }

    return diagnostics;
  }

  // Get hover information
  getHoverInfo(text: string, line: number, character: number): string | null {
    const word = this.getCurrentWord(text, line, character);
    
    // Check builtin functions
    const func = this.builtinFunctions.find(f => f.name === word);
    if (func) {
      return `**${func.signature}**\n\n${func.description}`;
    }

    // Check types
    if (this.types.includes(word)) {
      const typeInfo = {
        'int': 'Integer number type (32-bit)',
        'float': 'Floating point number type',
        'string': 'Text string type',
        'bool': 'Boolean type (true/false)',
        'vec2': '2D vector with x,y components',
        'color': 'Color type with r,g,b components',
        'array': 'Dynamic array collection',
        'map': 'Key-value dictionary',
        'Entity': 'Reference to world entity'
      };
      return `**${word}**\n\n${typeInfo[word] || 'SoulScript type'}`;
    }

    // Check keywords
    if (this.keywords.includes(word)) {
      return `**${word}**\n\nSoulScript keyword`;
    }

    return null;
  }

  // Helper to get current word at cursor position
  private getCurrentWord(text: string, line: number, character: number): string {
    const lines = text.split('\n');
    if (line >= lines.length) return '';
    
    const currentLine = lines[line];
    let start = character;
    let end = character;

    // Find word boundaries
    while (start > 0 && /\w/.test(currentLine[start - 1])) {
      start--;
    }
    while (end < currentLine.length && /\w/.test(currentLine[end])) {
      end++;
    }

    return currentLine.substring(start, end);
  }

  // Get signature help for function calls
  getSignatureHelp(text: string, line: number, character: number): {
    signatures: string[];
    activeParameter: number;
  } | null {
    const lines = text.split('\n');
    const currentLine = lines[line];
    
    // Find function call
    let parenDepth = 0;
    let funcStart = character;
    
    // Go backwards to find function name
    for (let i = character - 1; i >= 0; i--) {
      const char = currentLine[i];
      if (char === ')') parenDepth++;
      else if (char === '(') {
        parenDepth--;
        if (parenDepth < 0) {
          // Found opening paren, now find function name
          let nameEnd = i;
          while (nameEnd > 0 && /\s/.test(currentLine[nameEnd - 1])) {
            nameEnd--;
          }
          let nameStart = nameEnd;
          while (nameStart > 0 && /\w/.test(currentLine[nameStart - 1])) {
            nameStart--;
          }
          
          const funcName = currentLine.substring(nameStart, nameEnd);
          const func = this.builtinFunctions.find(f => f.name === funcName);
          
          if (func) {
            // Count commas to determine active parameter
            let activeParam = 0;
            for (let j = i + 1; j < character; j++) {
              if (currentLine[j] === ',') activeParam++;
            }
            
            return {
              signatures: [func.signature],
              activeParameter: activeParam
            };
          }
          break;
        }
      }
    }

    return null;
  }

  // Get all symbols in document (for outline/navigation)
  getDocumentSymbols(text: string): Array<{
    name: string;
    kind: string;
    line: number;
    detail?: string;
  }> {
    const symbols: Array<{name: string; kind: string; line: number; detail?: string}> = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Find components
      const componentMatch = line.match(/component\s+(\w+)/);
      if (componentMatch) {
        symbols.push({
          name: componentMatch[1],
          kind: 'component',
          line: i + 1,
          detail: 'SoulScript Component'
        });
      }

      // Find functions
      const funcMatch = line.match(/fn\s+(\w+)\s*\([^)]*\)/);
      if (funcMatch) {
        symbols.push({
          name: funcMatch[1],
          kind: 'function',
          line: i + 1,
          detail: 'Function'
        });
      }

      // Find properties
      const propMatch = line.match(/^\s*(\w+)\s+(\w+)\s*[=;]/);
      if (propMatch) {
        symbols.push({
          name: propMatch[2],
          kind: 'property',
          line: i + 1,
          detail: `${propMatch[1]} property`
        });
      }
    }

    return symbols;
  }
}

// Global language server instance
export const soulScriptLanguageServer = new SoulScriptLanguageServer();