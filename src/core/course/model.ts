// Formula models of the unit pages' "explore" (sliders) and "sim" (predict → run → explain)
// blocks: a few named parameters and outputs written as arithmetic expressions of them, e.g.
//   gain = A / (1 + A * beta)      vd = vin / (1 + A * beta)      vo = clamp(A * vin, -13, 13)
// A small, safe evaluator (no eval / Function), compiled once per expression.
//
// Grammar: numbers (1e5, 0.1), names (parameters and earlier outputs), + - * / ^ (right
// associative), unary minus, parentheses, and the functions below; constants pi, e.

type Node =
  | { k: 'num'; v: number }
  | { k: 'var'; name: string }
  | { k: 'neg'; x: Node }
  | { k: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { k: 'call'; fn: string; args: Node[] };

const FNS: Record<string, { n: [number, number]; f: (...a: number[]) => number }> = {
  abs: { n: [1, 1], f: Math.abs },
  sqrt: { n: [1, 1], f: Math.sqrt },
  exp: { n: [1, 1], f: Math.exp },
  ln: { n: [1, 1], f: Math.log },
  log10: { n: [1, 1], f: Math.log10 },
  sin: { n: [1, 1], f: Math.sin },
  cos: { n: [1, 1], f: Math.cos },
  atan: { n: [1, 1], f: Math.atan },
  /** atan in degrees */
  atand: { n: [1, 1], f: (x) => (Math.atan(x) * 180) / Math.PI },
  atan2d: { n: [2, 2], f: (y, x) => (Math.atan2(y, x) * 180) / Math.PI },
  min: { n: [2, 8], f: Math.min },
  max: { n: [2, 8], f: Math.max },
  pow: { n: [2, 2], f: Math.pow },
  clamp: { n: [3, 3], f: (x, lo, hi) => Math.min(hi, Math.max(lo, x)) },
  /** 1 when the condition is > 0, else 0 (for "is it saturated?" style outputs) */
  step: { n: [1, 1], f: (x) => (x > 0 ? 1 : 0) },
  /** if(c, a, b): a when c > 0, else b */
  if: { n: [3, 3], f: (c, a, b) => (c > 0 ? a : b) },
};
const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E };

export class ModelError extends Error {}

export interface Compiled {
  src: string;
  node: Node;
  /** names the expression reads (parameters / earlier outputs; not functions or constants) */
  vars: string[];
}

export function compile(src: string): Compiled {
  let i = 0;
  const s = src;
  const vars = new Set<string>();
  const ws = () => {
    while (i < s.length && /\s/.test(s[i])) i++;
  };
  const fail = (msg: string): never => {
    throw new ModelError(`${msg} @${i}: ${s}`);
  };
  const peek = () => (ws(), s[i]);
  const primary = (): Node => {
    ws();
    const c = s[i];
    if (c === '(') {
      i++;
      const x = expr();
      if (peek() !== ')') fail('missing ")"');
      i++;
      return x;
    }
    if (c === '-') {
      i++;
      return { k: 'neg', x: power() };
    }
    if (c === '+') {
      i++;
      return power();
    }
    const num = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(s.slice(i));
    if (num) {
      i += num[0].length;
      return { k: 'num', v: parseFloat(num[0]) };
    }
    const id = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
    if (id) {
      i += id[0].length;
      const name = id[0];
      if (peek() === '(') {
        const fn = FNS[name];
        if (!fn) fail(`unknown function "${name}"`);
        i++;
        const args: Node[] = [];
        if (peek() !== ')') {
          for (;;) {
            args.push(expr());
            if (peek() === ',') {
              i++;
              continue;
            }
            break;
          }
        }
        if (peek() !== ')') fail('missing ")"');
        i++;
        if (args.length < fn.n[0] || args.length > fn.n[1]) fail(`${name}() takes ${fn.n[0]}–${fn.n[1]} arguments`);
        return { k: 'call', fn: name, args };
      }
      if (name in CONSTS) return { k: 'num', v: CONSTS[name] };
      vars.add(name);
      return { k: 'var', name };
    }
    return fail(c === undefined ? 'unexpected end' : `unexpected "${c}"`);
  };
  const power = (): Node => {
    const a = primary();
    if (peek() === '^') {
      i++;
      return { k: 'bin', op: '^', a, b: unary() };
    }
    return a;
  };
  const unary = (): Node => power();
  const term = (): Node => {
    let a = unary();
    for (;;) {
      const c = peek();
      if (c === '*' || c === '/') {
        i++;
        a = { k: 'bin', op: c, a, b: unary() };
      } else return a;
    }
  };
  const expr = (): Node => {
    let a = term();
    for (;;) {
      const c = peek();
      if (c === '+' || c === '-') {
        i++;
        a = { k: 'bin', op: c, a, b: term() };
      } else return a;
    }
  };
  const node = expr();
  ws();
  if (i < s.length) fail(`unexpected "${s[i]}"`);
  return { src, node, vars: [...vars] };
}

function run(n: Node, env: Record<string, number>): number {
  switch (n.k) {
    case 'num':
      return n.v;
    case 'var': {
      const v = env[n.name];
      if (v === undefined) throw new ModelError(`unknown name "${n.name}"`);
      return v;
    }
    case 'neg':
      return -run(n.x, env);
    case 'bin': {
      const a = run(n.a, env);
      const b = run(n.b, env);
      return n.op === '+' ? a + b : n.op === '-' ? a - b : n.op === '*' ? a * b : n.op === '/' ? a / b : Math.pow(a, b);
    }
    case 'call':
      return FNS[n.fn].f(...n.args.map((x) => run(x, env)));
  }
}

export const evaluate = (c: Compiled, env: Record<string, number>): number => run(c.node, env);

export interface ModelOutput {
  /** name later outputs can use */
  id?: string;
  expr: string;
}

/** Evaluate a model's outputs in order (each may use the parameters and the outputs before it).
 *  Returns one value per output (NaN where an expression fails). */
export function evaluateModel(outputs: { id?: string; compiled: Compiled }[], params: Record<string, number>): number[] {
  const env: Record<string, number> = { ...params };
  return outputs.map((o) => {
    let v: number;
    try {
      v = evaluate(o.compiled, env);
    } catch {
      v = NaN;
    }
    if (o.id) env[o.id] = v;
    return v;
  });
}

/** Slider position (0…1000) ↔ value, linear or logarithmic. */
export function sliderToValue(pos: number, min: number, max: number, log: boolean): number {
  const t = pos / 1000;
  return log ? Math.pow(10, Math.log10(min) + t * (Math.log10(max) - Math.log10(min))) : min + t * (max - min);
}
export function valueToSlider(v: number, min: number, max: number, log: boolean): number {
  const t = log ? (Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min)) : (v - min) / (max - min);
  return Math.round(Math.min(1, Math.max(0, t)) * 1000);
}
