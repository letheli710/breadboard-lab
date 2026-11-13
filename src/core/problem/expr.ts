// A small, safe arithmetic-expression evaluator for student answers (no eval / Function).
//
// Accepts: numbers with e-notation (1.2e-3), + − × * · / ÷ ^ (also **), parentheses,
// √x / sqrt(x), exp(x), ln(x), log(x) (base 10), the constants π / pi and e,
// a postfix percent (60% → 0.6), an SI prefix right after a number (1k+500, 2m·3) and
// implicit multiplication (2√2, 2π, 3(1+2), 100pi).
// Unit suffixes ("mA", "kΩ", "rad") are handled by the caller (readAnswer in parse.ts).

const SI: Record<string, number> = { p: 1e-12, n: 1e-9, u: 1e-6, µ: 1e-6, μ: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };

type Tok = { t: 'num'; v: number; prefixed: boolean } | { t: 'id'; v: string } | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' | '(' | ')' | '%' | '√' };

export type ExprError =
  /** a word that is not a known constant or function */
  | { code: 'name'; name: string }
  /** a character that can't appear in an answer */
  | { code: 'char'; char: string }
  /** unbalanced parentheses, a dangling operator, two numbers in a row … */
  | { code: 'syntax' }
  | { code: 'div0' }
  /** sqrt / ln of a negative number, overflow … */
  | { code: 'nan' };

export type ExprResult = { value: number; prefixed: boolean } | { error: ExprError };

const isLetter = (c: string) => /\p{L}/u.test(c);

function tokenize(s: string): Tok[] | { error: ExprError } {
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const num = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(s.slice(i));
    if (num) {
      let v = parseFloat(num[0]);
      i += num[0].length;
      let prefixed = false;
      // an SI prefix glued to the number: "1k", "4.7µ" — but not the start of a word ("2pi", "2mA" is handled by the caller)
      const p = s[i];
      if (p && p in SI && !(s[i + 1] && isLetter(s[i + 1]))) {
        v *= SI[p];
        prefixed = true;
        i++;
      }
      out.push({ t: 'num', v, prefixed });
      continue;
    }
    if (c === '*' && s[i + 1] === '*') {
      out.push({ t: 'op', v: '^' });
      i += 2;
      continue;
    }
    const ops: Record<string, Tok['v']> = { '+': '+', '-': '-', '*': '*', '×': '*', '·': '*', '⋅': '*', '/': '/', '÷': '/', '^': '^', '(': '(', ')': ')', '%': '%', '√': '√' };
    if (c in ops) {
      out.push({ t: 'op', v: ops[c] } as Tok);
      i++;
      continue;
    }
    if (c === 'π') {
      out.push({ t: 'id', v: 'pi' });
      i++;
      continue;
    }
    if (isLetter(c)) {
      let j = i;
      while (j < s.length && isLetter(s[j]) && s[j] !== 'π') j++;
      out.push({ t: 'id', v: s.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    return { error: { code: 'char', char: c } };
  }
  return out;
}

const FUNCS: Record<string, (x: number) => number> = { sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log10, lg: Math.log10 };
const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E };

class Fail {
  constructor(public error: ExprError) {}
}

/** Evaluate an answer expression. `prefixed` is true when any number carried an SI prefix. */
export function evalExpr(src: string): ExprResult {
  const toks = tokenize(src);
  if (!Array.isArray(toks)) return toks;
  if (!toks.length) return { error: { code: 'syntax' } };
  let pos = 0;
  let prefixed = false;
  const peek = () => toks[pos];
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v;
  const startsPrimary = () => {
    const k = peek();
    return !!k && (k.t === 'num' || k.t === 'id' || (k.t === 'op' && (k.v === '(' || k.v === '√')));
  };

  const expr = (): number => {
    let v = term();
    while (isOp('+') || isOp('-')) {
      const op = toks[pos++].v;
      const r = term();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  };
  const term = (): number => {
    let v = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = toks[pos++].v;
        const r = unary();
        if (op === '/') {
          if (r === 0) throw new Fail({ code: 'div0' });
          v /= r;
        } else v *= r;
      } else if (startsPrimary())
        v *= power(); // implicit multiplication: 2√2, 2π, 3(4)
      else return v;
    }
  };
  const unary = (): number => {
    if (isOp('-')) {
      pos++;
      return -unary();
    }
    if (isOp('+')) {
      pos++;
      return unary();
    }
    return power();
  };
  // right-associative; the exponent may carry a sign: 10^-3
  const power = (): number => {
    const b = postfix();
    if (isOp('^')) {
      pos++;
      return b ** unary();
    }
    return b;
  };
  const postfix = (): number => {
    let v = primary();
    while (isOp('%')) {
      pos++;
      v /= 100;
    }
    return v;
  };
  const primary = (): number => {
    const k = toks[pos++];
    if (!k) throw new Fail({ code: 'syntax' });
    if (k.t === 'num') {
      if (k.prefixed) prefixed = true;
      return k.v;
    }
    if (k.t === 'id') {
      if (k.v in FUNCS) {
        // sqrt(2), or sqrt2 / ln2 without parentheses
        const x = isOp('(') ? paren() : postfix();
        return FUNCS[k.v](x);
      }
      if (k.v in CONSTS) return CONSTS[k.v];
      throw new Fail({ code: 'name', name: k.v });
    }
    if (k.v === '(') {
      pos--;
      return paren();
    }
    if (k.v === '√') return Math.sqrt(postfix());
    throw new Fail({ code: 'syntax' });
  };
  const paren = (): number => {
    pos++; // '('
    const v = expr();
    if (!isOp(')')) throw new Fail({ code: 'syntax' });
    pos++;
    return v;
  };

  try {
    const v = expr();
    if (pos !== toks.length) return { error: { code: 'syntax' } };
    if (!Number.isFinite(v)) return { error: { code: 'nan' } };
    return { value: v, prefixed };
  } catch (e) {
    if (e instanceof Fail) return { error: e.error };
    throw e;
  }
}
