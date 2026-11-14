// Symbol runs of formula text (no React): "v_R1" → italic v + subscript R1, shared by the
// problem drawings (ProblemSchematic), the theory text (PrMd / MathText) and lesson math.

/** A run of text: `it` = italic quantity letter, `sub` = subscript. */
export interface Run {
  t: string;
  it?: boolean;
  sub?: boolean;
}

/** "v_R1" → v + subscript R1, "V_{ab}" → V + subscript ab; single letters are italic. A phasor dot
 *  (combining U+0307, e.g. "V̇_s", or precomposed "İ_1"), a hat (combining U+0302, or precomposed
 *  "v̂_1", "î_k", "Û", "Î") or a bar (combining U+0304, complex power "S̄_Vs") stays on the base letter. */
export function richRuns(s: string): Run[] {
  const out: Run[] = [];
  const re = /([A-Za-zα-ωΑ-Ω][\u0307\u0302\u0304]?|[\u0130ûîÛÎ])_(\{([^}]*)\}|([A-Za-z0-9]+))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index) });
    let sub = m[3] ?? m[4];
    // juxtaposed products without braces ("V_lI_l", "z_12z_21", "V̇_AY_A"): a run that runs into the
    // next symbol's "_" gives its last letter back as that symbol
    let end = re.lastIndex;
    if (m[4] && sub.length > 1 && /[A-Za-zα-ωΑ-Ω]$/.test(sub) && (s[end] === '_' || (/[\u0307\u0302\u0304]/.test(s[end]) && s[end + 1] === '_'))) {
      sub = sub.slice(0, -1);
      end -= 1;
      re.lastIndex = end;
    }
    out.push({ t: m[1], it: true }, { t: sub, sub: true });
    last = end;
  }
  if (last < s.length) out.push({ t: s.slice(last) });
  if (out.length === 1 && /^(?:[A-Za-zα-ω][\u0307\u0302\u0304]?|[\u0130ûîÛÎ])$/.test(out[0].t)) out[0].it = true;
  return out;
}
