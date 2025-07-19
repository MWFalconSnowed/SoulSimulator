export interface ASTNode {
  type: string;
  [key: string]: any;
}

export interface ComponentDeclaration extends ASTNode {
  type: 'ComponentDeclaration';
  name: string;
  fields: FieldDeclaration[];
  methods: MethodDeclaration[];
}

export interface FieldDeclaration extends ASTNode {
  type: 'FieldDeclaration';
  dataType: string;
  name: string;
  initialValue?: any;
}

export interface MethodDeclaration extends ASTNode {
  type: 'MethodDeclaration';
  name: string;
  parameters: Parameter[];
  body: Statement[];
}

export interface Parameter extends ASTNode {
  type: 'Parameter';
  dataType: string;
  name: string;
}

export interface Statement extends ASTNode {
  type: string;
}

export interface AssignmentStatement extends Statement {
  type: 'AssignmentStatement';
  variable: string;
  operator: string;
  value: Expression;
}

export interface IfStatement extends Statement {
  type: 'IfStatement';
  condition: Expression;
  body: Statement[];
}

export interface CallStatement extends Statement {
  type: 'CallStatement';
  function: string;
  arguments: Expression[];
}

export interface Expression extends ASTNode {
  type: string;
}

export interface BinaryExpression extends Expression {
  type: 'BinaryExpression';
  left: Expression;
  operator: string;
  right: Expression;
}

export interface Literal extends Expression {
  type: 'Literal';
  value: any;
  dataType: string;
}

export interface Identifier extends Expression {
  type: 'Identifier';
  name: string;
}

export class SoulScriptParser {
  private tokens: string[] = [];
  private current = 0;

  parse(code: string): ComponentDeclaration[] {
    this.tokenize(code);
    this.current = 0;
    
    const components: ComponentDeclaration[] = [];
    
    while (!this.isAtEnd()) {
      if (this.match('component')) {
        components.push(this.parseComponent());
      } else {
        this.advance(); // Skip unknown tokens
      }
    }
    
    return components;
  }

  private tokenize(code: string): void {
    // Simple tokenizer - splits by whitespace and common delimiters
    const tokenRegex = /(\w+|[{}();=+\-*/<>!]|"[^"]*"|\d+\.?\d*)/g;
    this.tokens = code.match(tokenRegex) || [];
  }

  private parseComponent(): ComponentDeclaration {
    const name = this.consume('IDENTIFIER', 'Expected component name');
    this.consume('{', 'Expected {');
    
    const fields: FieldDeclaration[] = [];
    const methods: MethodDeclaration[] = [];
    
    while (!this.check('}') && !this.isAtEnd()) {
      if (this.check('fn')) {
        methods.push(this.parseMethod());
      } else {
        fields.push(this.parseField());
      }
    }
    
    this.consume('}', 'Expected }');
    
    return {
      type: 'ComponentDeclaration',
      name,
      fields,
      methods
    };
  }

  private parseField(): FieldDeclaration {
    const dataType = this.advance();
    const name = this.consume('IDENTIFIER', 'Expected field name');
    
    let initialValue: any = undefined;
    if (this.match('=')) {
      initialValue = this.parseExpression();
    }
    
    this.consume(';', 'Expected ;');
    
    return {
      type: 'FieldDeclaration',
      dataType,
      name,
      initialValue
    };
  }

  private parseMethod(): MethodDeclaration {
    this.consume('fn', 'Expected fn');
    const name = this.consume('IDENTIFIER', 'Expected method name');
    this.consume('(', 'Expected (');
    
    const parameters: Parameter[] = [];
    if (!this.check(')')) {
      do {
        const paramType = this.advance();
        const paramName = this.consume('IDENTIFIER', 'Expected parameter name');
        parameters.push({
          type: 'Parameter',
          dataType: paramType,
          name: paramName
        });
      } while (this.match(','));
    }
    
    this.consume(')', 'Expected )');
    this.consume('{', 'Expected {');
    
    const body: Statement[] = [];
    while (!this.check('}') && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    
    this.consume('}', 'Expected }');
    
    return {
      type: 'MethodDeclaration',
      name,
      parameters,
      body
    };
  }

  private parseStatement(): Statement {
    if (this.check('if')) {
      return this.parseIfStatement();
    }
    
    if (this.isIdentifier() && this.peekNext() === '=') {
      return this.parseAssignmentStatement();
    }
    
    if (this.isIdentifier() && this.peekNext() === '(') {
      return this.parseCallStatement();
    }
    
    // Skip unknown statements
    this.advance();
    return { type: 'UnknownStatement' };
  }

  private parseIfStatement(): IfStatement {
    this.consume('if', 'Expected if');
    const condition = this.parseExpression();
    this.consume('{', 'Expected {');
    
    const body: Statement[] = [];
    while (!this.check('}') && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    
    this.consume('}', 'Expected }');
    
    return {
      type: 'IfStatement',
      condition,
      body
    };
  }

  private parseAssignmentStatement(): AssignmentStatement {
    const variable = this.advance();
    const operator = this.advance();
    const value = this.parseExpression();
    this.consume(';', 'Expected ;');
    
    return {
      type: 'AssignmentStatement',
      variable,
      operator,
      value
    };
  }

  private parseCallStatement(): CallStatement {
    const functionName = this.advance();
    this.consume('(', 'Expected (');
    
    const args: Expression[] = [];
    if (!this.check(')')) {
      do {
        args.push(this.parseExpression());
      } while (this.match(','));
    }
    
    this.consume(')', 'Expected )');
    this.consume(';', 'Expected ;');
    
    return {
      type: 'CallStatement',
      function: functionName,
      arguments: args
    };
  }

  private parseExpression(): Expression {
    return this.parseComparison();
  }

  private parseComparison(): Expression {
    let expr = this.parseAddition();
    
    while (this.match('<', '>', '<=', '>=', '==', '!=')) {
      const operator = this.previous();
      const right = this.parseAddition();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right
      };
    }
    
    return expr;
  }

  private parseAddition(): Expression {
    let expr = this.parseMultiplication();
    
    while (this.match('+', '-')) {
      const operator = this.previous();
      const right = this.parseMultiplication();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right
      };
    }
    
    return expr;
  }

  private parseMultiplication(): Expression {
    let expr = this.parsePrimary();
    
    while (this.match('*', '/')) {
      const operator = this.previous();
      const right = this.parsePrimary();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right
      };
    }
    
    return expr;
  }

  private parsePrimary(): Expression {
    if (this.isNumber()) {
      const value = parseFloat(this.advance());
      return {
        type: 'Literal',
        value,
        dataType: 'float'
      };
    }
    
    if (this.isIdentifier()) {
      const name = this.advance();
      return {
        type: 'Identifier',
        name
      };
    }
    
    throw new Error('Unexpected token in expression');
  }

  private match(...tokens: string[]): boolean {
    for (const token of tokens) {
      if (this.check(token)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(token: string): boolean {
    if (this.isAtEnd()) return false;
    return this.peek() === token;
  }

  private advance(): string {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  private peek(): string {
    return this.tokens[this.current] || '';
  }

  private peekNext(): string {
    return this.tokens[this.current + 1] || '';
  }

  private previous(): string {
    return this.tokens[this.current - 1] || '';
  }

  private consume(token: string, message: string): string {
    if (this.check(token)) return this.advance();
    throw new Error(message);
  }

  private isIdentifier(): boolean {
    const token = this.peek();
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token);
  }

  private isNumber(): boolean {
    const token = this.peek();
    return /^\d+\.?\d*$/.test(token);
  }
}
