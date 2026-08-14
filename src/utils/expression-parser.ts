// ── Safe expression parser (replaces eval) ────────────────────────────────────

class ExpressionParser {
  private pos = 0;

  constructor(private readonly input: string) {}

  parse(): number {
    const result = this.expression();
    if (this.pos !== this.input.length) {
      throw new SyntaxError(`Unexpected token at ${this.pos}`);
    }
    return result;
  }

  private expression(): number {
    let result = this.term();
    for (;;) {
      if (this.consume('+')) result += this.term();
      else if (this.consume('-')) result -= this.term();
      else break;
    }
    return result;
  }

  private term(): number {
    let result = this.power();
    for (;;) {
      if (this.peek() === '*' && this.input[this.pos + 1] !== '*') {
        this.pos++;
        result *= this.power();
      } else if (this.consume('/')) {
        result /= this.power();
      } else break;
    }
    return result;
  }

  private power(): number {
    const base = this.unary();
    if (this.peek() === '*' && this.input[this.pos + 1] === '*') {
      this.pos += 2;
      return Math.pow(base, this.power());
    }
    return base;
  }

  private unary(): number {
    if (this.consume('-')) return -this.unary();
    if (this.consume('+')) return this.unary();
    return this.primary();
  }

  private primary(): number {
    if (this.consume('(')) {
      const result = this.expression();
      if (!this.consume(')')) throw new SyntaxError('Expected )');
      return result;
    }
    return this.number();
  }

  private number(): number {
    const start = this.pos;
    while (this.pos < this.input.length && /[\d.]/.test(this.input[this.pos])) {
      this.pos++;
    }
    if (this.pos === start) throw new SyntaxError(`Expected number at ${this.pos}`);
    return parseFloat(this.input.slice(start, this.pos));
  }

  private peek(): string {
    return this.input[this.pos] ?? '';
  }

  private consume(ch: string): boolean {
    if (this.input[this.pos] === ch) {
      this.pos++;
      return true;
    }
    return false;
  }
}

export function evaluate(expr: string): number {
  return new ExpressionParser(expr.trim()).parse();
}
