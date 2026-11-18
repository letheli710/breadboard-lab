// Builds docs/opamp-course.html: everything World 3 (op-amp basics) teaches, on one static,
// self-contained page — the learning units, the breadboard lessons and labs (text only, no 3D
// bench), the LM358 teardown, the op-amp calculation cards, the chapter's key points and its
// practice problems. Every drawing is the app's own SVG component rendered to markup, so the page
// shows the same figures as the app. Meant as a hand-off document: someone (or another agent)
// can read the whole course and its current presentation without running the app.
//
//   npx tsx scripts/opamp-handout.ts                 → docs/opamp-course.html (中文)
//   npx tsx scripts/opamp-handout.ts --lang en       → docs/opamp-course.en.html
//   npx tsx scripts/opamp-handout.ts --out some.html

/* eslint-disable @typescript-eslint/no-explicit-any -- the app's modules and the content files are loaded at run time, untyped */

import fs from 'node:fs';
import path from 'node:path';
import { createElement as h, Fragment, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const args = process.argv.slice(2);
const argOf = (name: string, def: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const LANG = argOf('lang', 'zh') === 'en' ? 'en' : 'zh';
const OUT = argOf('out', LANG === 'zh' ? 'docs/opamp-course.html' : 'docs/opamp-course.en.html');
const WORLD = 'w3';
// op-amp labs that live in later Worlds (portal targets of World 3 and users of the LM358 teardown)
const EXTRA_LABS = ['exp-schmitt-trigger', 'exp3-opamp-integrator', 'exp4-active-lowpass', 'exp4-buffered-bandpass'];
// instrument lessons listed in World 3: not op-amp content, shown as a short entry only
const BRIEF = new Set(['lesson-generator-scope', 'lesson-generator-load', 'lesson-scope-two-channels']);

const readJson = (f: string) => JSON.parse(fs.readFileSync(f, 'utf8'));
const esc = (s: unknown) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// the app's modules are loaded through Vite (CSS imports, virtual modules and aliases resolve as in the app)
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const i18n = await vite.ssrLoadModule('/src/core/i18n.ts');
// (the app's store picks the language from the browser when it is first imported: set ours again after every load)
const load = async (p: string) => {
  const m = await vite.ssrLoadModule(p);
  i18n.setLang(LANG);
  return m;
};

try {
  i18n.setLang(LANG);
  const tr: (zh: string, en: string) => string = i18n.tr;
  const { UnitMd, Inline } = await load('/src/ui/course/UnitMd.tsx');
  const { Md } = await load('/src/ui/Md.tsx');
  const { InsideMd, inline: insideInlineNodes } = await load('/src/inside/InsideMd.tsx');
  const { PrMd, Sym } = await load('/src/ui/richText.tsx');
  const { MathText } = await load('/src/ui/mathText.tsx');
  const { ProblemSchematic } = await load('/src/ui/ProblemSchematic.tsx');
  const { SchematicView } = await load('/src/ui/SchematicView.tsx');
  const CardFigureView = (await load('/src/ui/CardFigure.tsx')).default;
  const { parseChallenge } = await load('/src/core/challenge.ts');
  const { parseUnit } = await load('/src/core/course/unit.ts');
  const { evaluateModel } = await load('/src/core/course/model.ts');
  const { tt } = await load('/src/core/course/text.ts');
  const { formatSI } = await load('/src/core/format.ts');
  const { parseProblem, formatAnswer } = await load('/src/core/problem/parse.ts');
  const { unitOf } = await load('/src/core/problem/answer.ts');
  const { parseSummary } = await load('/src/core/summary/parse.ts');
  const { chapterById } = await load('/src/core/problem/chapters.ts');
  const { TEARDOWNS } = await load('/src/inside/registry.ts');
  const calcOpamp = await load('/src/inside/calc/opamp.tsx');

  /* ------------------------------------------------------------------ rendering helpers */

  const R = (el: ReactNode) => renderToStaticMarkup(el as never);
  /** headings inside rendered text sit below the item's own h3 / h4 */
  const demote = (html: string) => html.replace(/<(\/?)h[1-6]\b/g, '<$1h5');
  /** the figure frame's zoom / swipe controls are app chrome */
  const bare = (html: string) => html.replace(/<div class="fig-tools">.*?<\/div>(?=<\/div>)/gs, '');
  const unitMd = (t: string) => demote(R(h(UnitMd, { text: t })));
  const inl = (t: string) => R(h(Inline, { text: t }));
  const insideMd = (t: string) => demote(R(h(InsideMd, { text: t })));
  const insideInl = (t: string) => R(h(Fragment, null, insideInlineNodes(t)));
  const prMd = (t: string) => demote(R(h(PrMd, { text: t })));
  const sym = (t: string) => R(h(Sym, { text: t }));
  const math = (t: string) => R(h(MathText, { text: t }));
  const schematic = (s: unknown, highlight?: string[]) => bare(R(h(ProblemSchematic, { schematic: s, highlight })));

  const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  /** same number format as the unit page (ui/course/Blocks.tsx) */
  function fmtValue(v: number, o: { unit?: string; digits?: number; percent?: boolean }): string {
    const d = o.digits ?? 3;
    if (!Number.isFinite(v)) return '—';
    if (o.percent) return `${parseFloat((v * 100).toPrecision(d))} %`;
    if (o.unit) return formatSI(v, o.unit, d);
    const a = Math.abs(v);
    if (a !== 0 && (a >= 1e5 || a < 1e-3)) {
      const [m, e] = v.toExponential(d - 1).split('e');
      return `${parseFloat(m)}×10${String(parseInt(e, 10))
        .split('')
        .map((c) => SUP[c] ?? c)
        .join('')}`;
    }
    return String(parseFloat(v.toPrecision(d)));
  }

  /** drop the groups a teardown figure hides on this layer (they only exist to fade in / out) */
  function stripHidden(svg: string): string {
    const open = /<(\w+)\b[^>]*\bclass="[^"]*\btd-hide\b[^"]*"[^>]*>/g;
    let out = '';
    let pos = 0;
    for (let m = open.exec(svg); m; m = open.exec(svg)) {
      const start = m.index;
      let end = start + m[0].length;
      if (!m[0].endsWith('/>')) {
        const tag = /<(\/?)(\w+)\b[^>]*?(\/?)>/g;
        tag.lastIndex = end;
        let depth = 1;
        for (let t = tag.exec(svg); t; t = tag.exec(svg)) {
          if (t[1]) depth--;
          else if (!t[3]) depth++;
          if (depth === 0) {
            end = t.index + t[0].length;
            break;
          }
        }
      }
      out += svg.slice(pos, start);
      pos = end;
      open.lastIndex = end;
    }
    return out + svg.slice(pos);
  }

  const tag = (label: string, how?: string) => `<div class="h-tag">${esc(label)}${how ? `<span>${esc(how)}</span>` : ''}</div>`;
  const src = (file: string) => `<span class="h-src">${esc(file)}</span>`;
  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));

  /* ------------------------------------------------------------------ data */

  const worlds = readJson('course/worlds.json').worlds as any[];
  const world = worlds.find((w) => w.id === WORLD);
  const pending = new Map<string, any>((readJson('course/pending.json').pending as any[]).map((p) => [p.id, p]));
  const portals = readJson('course/portals.json').portals as any[];
  const worldOfItem = new Map<string, any>();
  for (const w of worlds) for (const s of w.sections) for (const it of s.items) worldOfItem.set(it, w);
  const worldLabel = (w: any) => (w?.n !== undefined ? `World ${w.n}` : tr('UB 衔接区', 'UB bridge'));

  const units = new Map<string, { unit: any; raw: any; file: string }>();
  for (const f of fs.readdirSync('units').filter((x) => x.endsWith('.json'))) {
    const raw = readJson(`units/${f}`);
    const r = parseUnit(raw);
    if (!r.unit) throw new Error(`units/${f}: ${r.errors.join('; ')}`);
    units.set(r.unit.id, { unit: r.unit, raw, file: `units/${f}` });
  }
  const challenges = new Map<string, { ch: any; raw: any; file: string }>();
  for (const f of fs.readdirSync('challenges').filter((x) => x.endsWith('.json'))) {
    const raw = readJson(`challenges/${f}`);
    const r = parseChallenge(raw, 'builtin', f);
    if (r.challenge) challenges.set(r.challenge.id, { ch: r.challenge, raw, file: `challenges/${f}` });
  }
  const problems = new Map<string, { p: any; file: string }>();
  for (const dir of fs.readdirSync('problems')) {
    const d = `problems/${dir}`;
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json'))) {
      const r = parseProblem(readJson(`${d}/${f}`), 'builtin', f, { verify: false });
      if (r.problem) problems.set(r.problem.id, { p: r.problem, file: `${d}/${f}` });
    }
  }
  const chapterProblems = [...problems.values()].filter((x) => x.p.chapter === 'opamp').sort((a, b) => a.file.localeCompare(b.file));
  const summaryRes = parseSummary(readJson('summaries/opamp.json'), 'opamp.json', { verify: false });
  if (!summaryRes.summary) throw new Error(`summaries/opamp.json: ${summaryRes.errors.join('; ')}`);
  const summary = summaryRes.summary;
  const teardown = (await load('/src/inside/td/lm358.tsx')).default();
  const calcGroup = calcOpamp.group();
  const calcCards = calcOpamp.cards() as any[];

  const worldItems: string[] = world.sections.flatMap((s: any) => s.items);
  const fullLabs = worldItems.filter((x) => x.startsWith('challenge:') && !BRIEF.has(x.slice(10))).map((x) => x.slice(10));
  // anchors that exist on this page
  const anchors = new Map<string, string>();
  for (const it of worldItems) {
    const [kind, id] = [it.slice(0, it.indexOf(':')), it.slice(it.indexOf(':') + 1)];
    if (kind === 'unit') anchors.set(it, `unit-${id}`);
    else if (kind === 'challenge') anchors.set(it, `lab-${id}`);
  }
  for (const id of EXTRA_LABS) anchors.set(`challenge:${id}`, `lab-${id}`);
  for (const x of chapterProblems) anchors.set(`problem:${x.p.id}`, `prob-${x.p.id}`);
  anchors.set('chapter:opamp', 'keypoints');

  function refTitle(ref: string): string {
    const k = ref.indexOf(':');
    const [kind, id] = [ref.slice(0, k), ref.slice(k + 1)];
    if (kind === 'unit') {
      const u = units.get(id)?.unit;
      return u ? `${u.code ? `${u.code} · ` : ''}${tt(u.title)}` : id;
    }
    if (kind === 'challenge') return challenges.get(id)?.ch.title ?? id;
    if (kind === 'chapter') return `${tr('练习章节：', 'Practice chapter: ')}${chapterById(id)?.title() ?? id}`;
    if (kind === 'problem') return `${tr('练习题：', 'Problem: ')}${problems.get(id)?.p.title ?? id}`;
    if (kind === 'pending') return `${pending.get(id) ? tt(pending.get(id).title) : id}${tr('（待建单元）', ' (unit not built yet)')}`;
    return ref;
  }
  function refLink(ref: string): string {
    const a = anchors.get(ref);
    const w = worldOfItem.get(ref) ?? (ref.startsWith('pending:') ? worlds.find((x) => x.id === pending.get(ref.slice(8))?.world) : undefined);
    const where = w && w.id !== WORLD ? ` <span class="h-dim">(${esc(worldLabel(w))})</span>` : '';
    return (a ? `<a href="#${a}">${sym(refTitle(ref))}</a>` : sym(refTitle(ref))) + where;
  }
  const refList = (refs: string[]) => refs.map(refLink).join(tr('、', ', '));

  /* ------------------------------------------------------------------ learning units */

  const LAYER_TITLE: Record<string, string> = {
    intuition: tr('① 直觉', '① Intuition'),
    derive: tr('② 推导', '② Derivation'),
    sim: tr('③ 仿真', '③ Simulation'),
    bench: tr('④ 面包板', '④ Breadboard'),
    connect: tr('⑤ 回链：接回学过的内容', '⑤ Connect it back'),
  };
  const LAYER_ORDER = ['intuition', 'derive', 'sim', 'bench', 'connect'];
  const NOTE_LABEL: Record<string, string> = { info: tr('说明', 'Note'), tip: tr('提示', 'Tip'), warn: tr('注意', 'Watch out') };

  function portalCard(p: any): string {
    const live = !p.to.startsWith('pending:');
    return `<aside class="h-blk h-portal" data-block="portal">${tag(live ? tr('传送门', 'Portal') : tr('传送门 · 即将上线', 'Portal · coming soon'), tr(`约 ${p.minutes} 分钟`, `about ${p.minutes} min`))}
<p class="h-portal-to">◎ ${refLink(p.to)}</p>
<p><b>${tr('门后讲什么：', 'Behind the door: ')}</b>${inl(tt(p.what))}</p>
<p><b>${tr('从那边回头看：', 'Seen from the other side: ')}</b>${inl(tt(p.back))}</p>
${p.prereq?.length ? `<p><b>${tr('前置要求：', 'First understand: ')}</b>${refList(p.prereq)}</p>` : ''}</aside>`;
  }

  const paramRow = (p: any) =>
    `<tr><th scope="row">${p.label ? inl(tt(p.label)) : ''}</th><td><code>${esc(p.id)}</code></td><td>${esc(fmtValue(p.value, { unit: p.unit }))}</td><td>${
      p.min !== undefined
        ? `${esc(fmtValue(p.min, { unit: p.unit }))} … ${esc(fmtValue(p.max, { unit: p.unit }))}${p.log ? tr('（对数刻度）', ' (log scale)') : ''}`
        : tr('固定', 'fixed')
    }</td></tr>`;
  const paramTable = (params: any[]) =>
    `<table class="cmp"><thead><tr><th>${tr('参数', 'Parameter')}</th><th>${tr('变量', 'Variable')}</th><th>${tr('初始值', 'Initial')}</th><th>${tr('滑块范围', 'Slider range')}</th></tr></thead><tbody>${params.map(paramRow).join('')}</tbody></table>`;
  const envOf = (params: any[], over: Record<string, number> = {}) => ({ ...Object.fromEntries(params.map((p) => [p.id, p.value])), ...over });
  function outputTable(outputs: any[], env: Record<string, number>, withExpr: boolean): string {
    const values: number[] = evaluateModel(outputs, env);
    return `<table class="cmp"><thead><tr><th>${tr('输出', 'Output')}</th>${withExpr ? `<th>${tr('公式（模型）', 'Formula (model)')}</th>` : ''}<th>${tr('结果', 'Result')}</th></tr></thead><tbody>${outputs
      .map(
        (o, i) =>
          `<tr><th scope="row">${inl(tt(o.label))}</th>${withExpr ? `<td><code>${esc((o.id ? `${o.id} = ` : '') + o.expr)}</code></td>` : ''}<td><b>${esc(fmtValue(values[i], o))}</b></td></tr>`,
      )
      .join('')}</tbody></table>`;
  }
  const choiceList = (choices: string[], correct: number | undefined, extra?: (i: number) => string) =>
    `<ol class="h-choices" type="A">${choices
      .map((c, i) => `<li class="${i === correct ? 'ok' : ''}">${c}${i === correct ? ` <span class="h-ok">✓ ${tr('正确', 'correct')}</span>` : ''}${extra?.(i) ?? ''}</li>`)
      .join('')}</ol>`;

  function block(b: any): string {
    switch (b.type) {
      case 'text':
        return `<div class="h-blk" data-block="text">${unitMd(tt(b.md))}</div>`;
      case 'note':
        return `<div class="h-blk h-note ${b.tone}" data-block="note">${tag(NOTE_LABEL[b.tone])}${unitMd(tt(b.md))}</div>`;
      case 'steps':
        return `<section class="h-blk h-steps" data-block="steps">${tag(tr('分步推导', 'Step-by-step derivation'), tr('界面上一次揭开一步', 'revealed one step at a time'))}${
          b.title ? `<h5>${inl(tt(b.title))}</h5>` : ''
        }<ol>${b.steps.map((s: any) => `<li>${unitMd(tt(s))}</li>`).join('')}</ol></section>`;
      case 'predict': {
        const answer = b.choices
          ? choiceList(
              b.choices.map((c: any) => inl(tt(c))),
              b.correct,
            )
          : `<p class="h-answer"><b>${tr('答案：', 'Answer: ')}</b>${
              b.answer !== undefined
                ? `${esc(fmtValue(b.answer, { digits: 4 }))}${b.unit ? ` ${esc(b.unit)}` : ''}${tr(`（允许误差 ±${(b.tol ?? 0.05) * 100}%）`, ` (tolerance ±${(b.tol ?? 0.05) * 100}%)`)}`
                : esc((b.text ?? []).join(' / '))
            }</p>`;
        return `<section class="h-blk h-predict" data-block="predict">${tag(tr('先预测', 'Predict first'), tr('先作答，再揭晓解释', 'answer first, then the explanation is revealed'))}
<div class="h-ask">${unitMd(tt(b.ask))}</div>${answer}<div class="h-explain"><b>${tr('揭晓：', 'Revealed: ')}</b>${unitMd(tt(b.explain))}</div></section>`;
      }
      case 'explore':
        return `<section class="h-blk h-explore" data-block="explore">${tag(tr('动手调一调', 'Try it'), tr('滑块 + 实时结果表', 'sliders + a live results table'))}${b.title ? `<h5>${inl(tt(b.title))}</h5>` : ''}
${paramTable(b.params)}${outputTable(b.outputs, envOf(b.params), true)}${b.note ? unitMd(tt(b.note)) : ''}</section>`;
      case 'sim':
        return `<section class="h-blk h-sim" data-block="sim">${tag(tr('仿真：先预测，再运行', 'Simulation: predict, then run'), tr('每个情景：选预测 → 运行 → 看结果 → 解释', 'per scenario: pick a prediction → run → result → why'))}${
          b.title ? `<h5>${inl(tt(b.title))}</h5>` : ''
        }${b.intro ? unitMd(tt(b.intro)) : ''}
<p class="h-model"><b>${tr('模型参数：', 'Model parameters: ')}</b>${b.params.map((p: any) => `<code>${esc(p.id)} = ${esc(fmtValue(p.value, { unit: p.unit }))}</code>`).join(' ')}</p>
<p class="h-model"><b>${tr('模型输出：', 'Model outputs: ')}</b>${b.outputs.map((o: any) => `${inl(tt(o.label))} <code>${esc(o.expr)}</code>`).join('； ')}</p>
${b.scenarios
  .map(
    (s: any, i: number) => `<article class="h-scenario"><h6>${tr('情景', 'Scenario')} ${i + 1}：${inl(tt(s.label))}</h6>
<p class="h-model"><b>${tr('改动：', 'Change: ')}</b>${
      Object.entries(s.set)
        .map(([k, v]) => `<code>${esc(k)} = ${esc(v)}</code>`)
        .join(' ') || tr('无', 'none')
    }</p>
<div class="h-ask">${unitMd(tt(s.ask))}</div>${choiceList(
      s.choices.map((c: any) => inl(tt(c))),
      s.correct,
    )}
<div class="h-result"><b>${tr('运行结果：', 'Result of the run: ')}</b>${outputTable(b.outputs, envOf(b.params, s.set), false)}</div>
<div class="h-explain"><b>${tr('为什么：', 'Why: ')}</b>${unitMd(tt(s.explain))}</div></article>`,
  )
  .join('')}</section>`;
      case 'circuit':
        return `<figure class="h-blk h-fig" data-block="circuit">${schematic(b.schematic)}<figcaption>${inl(tt(b.caption))}</figcaption></figure>`;
      case 'bench':
        return `<section class="h-blk h-bench" data-block="bench">${tag(tr('上面包板', 'On the breadboard'), tr('入口卡片：打开对应的课 / 实验', 'entry card: opens the lesson / lab'))}<p class="h-portal-to">${refLink(`challenge:${b.challenge}`)}</p>${unitMd(tt(b.note))}</section>`;
      case 'problems':
        return `<section class="h-blk h-problems" data-block="problems">${tag(tr('练习区的题', 'Practice problems'))}${b.note ? unitMd(tt(b.note)) : ''}<ul>${b.ids
          .map((id: string) => `<li>${refLink(`problem:${id}`)} <span class="h-dim">${'★'.repeat(problems.get(id)?.p.level ?? 0)}</span></li>`)
          .join('')}</ul></section>`;
      case 'portal': {
        const p = portals.find((x) => x.id === b.id);
        return p ? portalCard(p) : '';
      }
    }
    return '';
  }

  function unitHtml(id: string): string {
    const { unit: u, raw, file } = units.get(id)!;
    const other = LANG === 'zh' ? raw.title.en : raw.title.zh;
    const layers = [...u.layers].sort((a: any, b: any) => LAYER_ORDER.indexOf(a.layer) - LAYER_ORDER.indexOf(b.layer));
    const placed = new Set(layers.flatMap((l: any) => l.blocks.filter((b: any) => b.type === 'portal').map((b: any) => b.id)));
    const rest = portals.filter((p) => p.from === `unit:${id}` && !placed.has(p.id));
    const blockCount = layers.reduce((n: number, l: any) => n + l.blocks.length, 0);
    return `<article class="h-item h-unit" id="unit-${id}" data-kind="unit">
<header><div class="h-eyebrow">${tr('学习单元', 'Learning unit')} · ${esc(u.code ?? '')} · ${tr(`约 ${u.minutes} 分钟`, `about ${u.minutes} min`)} · ${blockCount} ${tr('个内容块', 'blocks')} ${src(file)}</div>
<h3>${esc(u.code ?? '')} · ${sym(tt(u.title))} <span class="h-alt">${esc(other)}</span></h3>
<p class="h-question"><b>${tr('这个单元回答：', 'The question: ')}</b>${inl(tt(u.question))}</p>
${u.connects.length ? `<p class="h-connects"><b>${tr('接回：', 'Builds on: ')}</b>${refList(u.connects)}</p>` : ''}</header>
${layers.map((l: any) => `<section class="h-layer" data-layer="${l.layer}"><h4>${esc(l.title ? tt(l.title) : LAYER_TITLE[l.layer])}</h4>${l.blocks.map(block).join('\n')}</section>`).join('\n')}
${rest.length ? `<section class="h-layer"><h4>${tr('传送门：这个想法在别处展开', 'Portals: where this idea goes next')}</h4>${rest.map(portalCard).join('\n')}</section>` : ''}
</article>`;
  }

  /* ------------------------------------------------------------------ lessons and labs */

  const CARD_KIND: Record<string, string> = { try: tr('试一试', 'Try it'), explain: tr('想明白', 'Why'), build: tr('动手做', 'Build'), wrap: tr('带走', 'Take away') };

  function labMd(ch: any, text: string): string {
    return demote(bare(R(h(Md, { text, math: true, figure: (fid: string) => (ch.figures[fid] ? h(CardFigureView, { fig: ch.figures[fid] }) : null) }))));
  }
  const propText = (set: Record<string, Record<string, unknown>>) =>
    Object.entries(set ?? {})
      .flatMap(([ref, props]) => Object.entries(props).map(([k, v]) => `${ref}.${k} = ${typeof v === 'object' ? JSON.stringify(v) : v}`))
      .join('; ');
  function whatText(w: any): string {
    if (!w) return '';
    if (w.kind === 'voltage') return `${tr('电压', 'voltage')} ${w.pin}${w.ref ? ` − ${w.ref}` : tr(' 对 GND', ' to GND')}`;
    if (w.kind === 'current') return `${tr('电流', 'current')} ${w.el}${w.mode === 'rms' ? ' (RMS)' : ''}`;
    if (w.kind === 'scope')
      return `${tr('示波器', 'scope')} ${w.measure} @ ${w.pin}${w.ref ? ` − ${w.ref}` : ''}${w.vs ? ` vs ${w.vs}` : ''}${w.solve ? tr(`（扫 ${w.solve.el} 的频率）`, ` (sweeping ${w.solve.el})`) : ''}`;
    if (w.kind === 'formula') return `${tr('由前面的读数计算', 'computed from earlier readings')}: ${w.expr}`;
    return '';
  }
  function rangeText(q: any): string {
    if (!q.range) return '';
    const scale = unitOf(q.unit ?? '')?.scale ?? 1;
    const f = (v: number) => String(parseFloat((v / scale).toPrecision(4)));
    return `${f(q.range[0])} … ${f(q.range[1])}${q.unit ? ` ${q.unit}` : ''}`;
  }
  function measurementHtml(ch: any, q: any, i: number): string {
    const meta = [
      whatText(q.what),
      propText(q.set) && `${tr('状态', 'state')}: ${propText(q.set)}`,
      q.predict ? tr('先预测再测量', 'prediction asked first') : '',
      q.required === false ? tr('选做', 'optional') : '',
    ]
      .filter(Boolean)
      .join(' · ');
    return `<li><div class="h-ask">${labMd(ch, q.ask)}</div>${meta ? `<p class="h-meta">${esc(meta)}</p>` : ''}${
      q.choices
        ? choiceList(
            q.choices.map((c: string) =>
              labMd(ch, c)
                .replace(/^<div class="md">|<\/div>$/g, '')
                .replace(/^<p>|<\/p>$/g, ''),
            ),
            q.correct,
          )
        : q.range
          ? `<p class="h-answer"><b>${tr('参考读数（标准解答板上的范围）：', 'Reference reading (range on the reference board): ')}</b>${esc(rangeText(q))}</p>`
          : ''
    }${q.explain ? `<div class="h-explain"><b>${tr('答对后显示：', 'Shown once answered: ')}</b>${labMd(ch, q.explain)}</div>` : ''}<span class="h-dim">#${i + 1}</span></li>`;
  }
  function layoutHtml(layout: any, label: string): string {
    if (!layout?.parts?.length) return '';
    const rows = layout.parts
      .map((p: any) => {
        const props = Object.entries(p)
          .filter(([k]) => !['type', 'ref', 'pins', 'at'].includes(k))
          .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
          .join(', ');
        const pins = p.pins
          ? Object.entries(p.pins)
              .map(([k, v]) => `${k}→${v}`)
              .join('  ')
          : p.at
            ? `@${p.at}`
            : '';
        return `<tr><td>${esc(p.type)}</td><td>${esc(p.ref ?? '')}</td><td>${esc(props)}</td><td><code>${esc(pins)}</code></td></tr>`;
      })
      .join('');
    return `<details class="h-layout"><summary>${esc(label)}（${layout.parts.length}）</summary><table class="cmp"><thead><tr><th>${tr('元件', 'Part')}</th><th>${tr('编号', 'Ref')}</th><th>${tr('参数', 'Props')}</th><th>${tr('引脚 → 孔位', 'Pins → holes')}</th></tr></thead><tbody>${rows}</tbody></table></details>`;
  }

  function labHtml(id: string): string {
    const { ch, raw, file } = challenges.get(id)!;
    const other = LANG === 'zh' ? raw.i18n?.en?.title : raw.title;
    const w = worldOfItem.get(`challenge:${id}`);
    const kind = ch.kind === 'lesson' ? tr('面包板课程', 'Breadboard lesson') : tr('面包板实验', 'Breadboard lab');
    const stepsOf = (from: number, to: number) =>
      to > from
        ? `<ol class="h-labsteps" start="${from + 1}">${ch.steps
            .slice(from, to)
            .map((s: any) => `<li>${labMd(ch, s.text)}</li>`)
            .join('')}</ol>`
        : '';
    const target = bare(R(h(SchematicView, { circuit: ch.target, showValues: true })));
    const cards = ch.cards.length
      ? ch.cards
          .map(
            (
              c: any,
              i: number,
            ) => `<section class="h-card" data-card="${c.kind}"><h4><span class="h-cardkind">${tr('卡片', 'Card')} ${i + 1} · ${esc(CARD_KIND[c.kind])}</span> ${sym(c.title)}</h4>
${c.text ? labMd(ch, c.text) : ''}${c.count ? `${tag(tr(`步骤 ${c.first + 1}–${c.first + c.count}`, `Steps ${c.first + 1}–${c.first + c.count}`), tr('一次显示一步，带自动检查', 'one step at a time, each checked automatically'))}${stepsOf(c.first, c.first + c.count)}` : ''}${
              c.practice?.length ? `<p><b>${tr('趁热练理论题：', 'Practise the theory: ')}</b>${refList(c.practice.map((x: string) => `chapter:${x}`))}</p>` : ''
            }</section>`,
          )
          .join('\n')
      : `<section class="h-card"><h4>${tr('步骤', 'Steps')}</h4>${stepsOf(0, ch.steps.length)}</section>`;
    return `<article class="h-item h-lab" id="lab-${id}" data-kind="${ch.kind}">
<header><div class="h-eyebrow">${kind}${w && w.id !== WORLD ? ` · ${esc(worldLabel(w))}` : ''} · ${tr('难度', 'level')} ${stars(ch.level)} ${src(file)}</div>
<h3>${sym(ch.title)}${other ? ` <span class="h-alt">${esc(other)}</span>` : ''}</h3>
<p class="h-question">${sym(ch.summary)}</p>
${ch.concepts.length ? `<p class="h-chips">${ch.concepts.map((c: string) => `<span class="h-chip">${esc(c)}</span>`).join('')}</p>` : ''}
${ch.prereq?.length ? `<p class="h-connects"><b>${tr('先修：', 'Do first: ')}</b>${refList(ch.prereq.map((x: string) => `challenge:${x}`))}</p>` : ''}</header>
<section class="h-layer"><h4>${tr('任务说明', 'Description')}</h4>${labMd(ch, ch.description)}
${ch.startNote ? `<div class="h-blk h-note info">${tag(tr('起始状态（半成品）', 'Starting kit'))}${labMd(ch, ch.startNote)}</div>` : ''}
<figure class="h-blk h-fig h-target"><div class="schem-card">${target}</div><figcaption>${tr('目标原理图（任务面板里显示；学生照着它在面包板上搭）', 'Target schematic (shown in the task panel; the student builds it on the breadboard)')}</figcaption></figure></section>
${cards}
${
  ch.measurements.length
    ? `<section class="h-layer"><h4>${tr('测量题', 'Measurement questions')}</h4>${tag(tr('电路检查通过后出现', 'appear once the circuit check passes'), tr('学生读自己板子上的仪表，答案由仿真实时算出', 'the student reads their own board; the expected value is simulated live'))}<ol class="h-measure">${ch.measurements
        .map((q: any, i: number) => measurementHtml(ch, q, i))
        .join('')}</ol></section>`
    : ''
}
${ch.compare ? `<section class="h-layer"><h4>${tr('对比（全部测量题答完后显示）', 'Compare (shown once every question is answered)')}</h4>${labMd(ch, ch.compare)}</section>` : ''}
${ch.hints.length ? `<section class="h-layer"><h4>${tr('提示', 'Hints')}</h4><ol>${ch.hints.map((x: string) => `<li>${labMd(ch, x)}</li>`).join('')}</ol></section>` : ''}
${ch.tests.length ? `<section class="h-layer"><h4>${tr('「检查我的电路」跑的测试', 'Tests run by “Check my circuit”')}</h4><ul>${ch.tests.map((t: any) => `<li>${sym(t.name)}${propText(t.set) ? ` <span class="h-meta">${esc(propText(t.set))}</span>` : ''}</li>`).join('')}</ul></section>` : ''}
${layoutHtml(raw.start, tr('起始布局：已经搭好的部分', 'Starting layout: what is pre-built'))}${layoutHtml(raw.solution, tr('参考解答的接线（孔位）', 'Reference solution wiring (holes)'))}
</article>`;
  }

  function briefLabHtml(id: string): string {
    const { ch, raw, file } = challenges.get(id)!;
    const other = LANG === 'zh' ? raw.i18n?.en?.title : raw.title;
    return `<article class="h-item h-lab h-brief" id="lab-${id}" data-kind="${ch.kind}">
<header><div class="h-eyebrow">${tr('仪器课（只列概要）', 'Instrument lesson (summary only)')} · ${tr('难度', 'level')} ${stars(ch.level)} ${src(file)}</div>
<h3>${sym(ch.title)}${other ? ` <span class="h-alt">${esc(other)}</span>` : ''}</h3>
<p class="h-question">${sym(ch.summary)}</p>
${ch.concepts.length ? `<p class="h-chips">${ch.concepts.map((c: string) => `<span class="h-chip">${esc(c)}</span>`).join('')}</p>` : ''}</header>
${labMd(ch, ch.description)}</article>`;
  }

  /* ------------------------------------------------------------------ teardown */

  function calloutSvg(callouts: any[]): string {
    return R(
      h(
        'g',
        { className: 'td-callouts' },
        callouts.map((c, i) => {
          const right = c.lx >= c.x;
          const anchor = c.anchor ?? (right ? 'start' : 'end');
          return h(
            'g',
            { key: i, className: 'td-callout', 'data-term': c.part },
            h('line', { x1: c.lx, y1: c.ly, x2: c.x, y2: c.y }),
            h('circle', { cx: c.x, cy: c.y, r: 3.2 }),
            h('text', { x: c.lx + (c.anchor === 'middle' ? 0 : anchor === 'start' ? 4 : -4), y: c.ly + (c.anchor === 'middle' ? -6 : 4), textAnchor: anchor }, c.label),
          );
        }),
      ),
    );
  }
  const calcTitle = (id: string) => calcCards.find((c) => c.id === id)?.title;

  function teardownHtml(): string {
    const td = teardown;
    const n = td.layers.length;
    const entry = TEARDOWNS.find((t: any) => t.id === td.id);
    return `<article class="h-item h-td" id="td-${td.id}" data-kind="teardown">
<header><div class="h-eyebrow">${tr('拆开看 · INSIDE', 'INSIDE · TEARDOWN')} · ${n} ${tr('层', 'layers')} ${src('src/inside/td/lm358.tsx')}</div>
<h3>${esc(td.title)}</h3><p class="h-question">${esc(td.subtitle)}</p>
<p class="h-connects"><b>${tr('图层：', 'Layers: ')}</b>${td.layers.map((l: any, i: number) => `<a href="#td-${td.id}-${l.id}">${i + 1} ${esc(l.short)}</a>`).join(' → ')}</p>
<p class="h-connects"><b>${tr('作为“第 0 步 · 先拆开看”出现在：', 'Shown as “step 0 · look inside first” in: ')}</b>${refList((entry?.lessons ?? []).map((x: string) => `challenge:${x}`))}</p></header>
${td.layers
  .map((l: any, i: number) => {
    const fig = stripHidden(R(h('svg', { viewBox: td.viewBox, className: `td-fig layer-${i}`, role: 'img', 'aria-label': `${td.title}: ${l.title}` }, td.Figure({ layer: i }))));
    const svg = l.callouts?.length ? fig.replace(/<\/svg>$/, `${calloutSvg(l.callouts)}</svg>`) : fig;
    const table = l.table
      ? `<div class="td-table-wrap"><table class="cmp td-table"><thead><tr>${l.table.head.map((x: string) => `<th scope="col">${insideInl(x)}</th>`).join('')}</tr></thead><tbody>${l.table.rows
          .map(
            (r: string[], k: number) =>
              `<tr${l.table.parts?.[k] ? ` data-term="${esc(l.table.parts[k])}"` : ''}>${r.map((c, j) => (j === 0 ? `<th scope="row">${insideInl(c)}</th>` : `<td>${insideInl(c)}</td>`)).join('')}</tr>`,
          )
          .join('')}</tbody></table></div>`
      : '';
    const formulas = l.formulas?.length
      ? `<div class="td-formulas">${l.formulas.map((f: any) => `<div class="td-formula"><div class="td-formula-tex">${math(f.tex)}</div>${f.note ? `<div class="td-formula-note">${insideInl(f.note)}</div>` : ''}</div>`).join('')}</div>`
      : '';
    const calcs = l.calcs?.length
      ? `<p class="h-chips"><b>${tr('动手算：', 'Calculate: ')}</b>${l.calcs.map((c: string) => `<a class="h-chip" href="#calc-${c}">${calcTitle(c) ? insideInl(calcTitle(c)) : esc(c)}</a>`).join('')}</p>`
      : '';
    return `<section class="h-tdlayer td" id="td-${td.id}-${l.id}" data-layer="${i}"><div class="h-tdtext"><div class="h-tdnum">${String(i + 1).padStart(2, '0')}<span> / ${String(n).padStart(2, '0')} · ${esc(l.short)}</span></div>
<h4>${insideInl(l.title)}</h4>${insideMd(l.body)}${table}${formulas}${calcs}</div>
<figure class="h-tdfig">${svg}<figcaption>${tr('第', 'Layer')} ${i + 1} ${tr('层的图：', ': ')}${esc(l.title)}</figcaption></figure></section>`;
  })
  .join('\n')}
${td.recap ? `<section class="h-layer"><h4>${tr('一句话记住', 'Remember it in one line')}</h4>${insideMd(td.recap)}</section>` : ''}
</article>`;
  }

  /* ------------------------------------------------------------------ calculation cards */

  const calcFmt = (v: number, unit: string) =>
    !Number.isFinite(v) ? '—' : unit === '%' ? `${parseFloat(v.toPrecision(3))} %` : unit === '' ? `${parseFloat(v.toPrecision(5))}` : formatSI(v, unit, 4);
  function calcHtml(c: any): string {
    const defaults = Object.fromEntries(c.vars.map((v: any) => [v.sym, v.def]));
    const links = [
      ...(c.teardowns ?? []).map((t: string) => `<a href="#td-${t}">${tr('拆开看：', 'Inside: ')}${esc(TEARDOWNS.find((x: any) => x.id === t)?.[LANG] ?? t)}</a>`),
      ...(c.lessons ?? []).filter((x: string) => challenges.has(x)).map((x: string) => refLink(`challenge:${x}`)),
      ...(c.chapter ? [refLink(`chapter:${c.chapter}`)] : []),
    ];
    return `<article class="h-item h-calc" id="calc-${c.id}" data-kind="calc">
<header><div class="h-eyebrow">${tr('计算卡片', 'Calculation card')} · <code>${esc(c.id)}</code></div><h3>${insideInl(c.title)}</h3><p class="h-question">${esc(c.use)}</p></header>
<div class="h-calctop"><div class="calc-formula">${math(c.tex)}</div>${c.Figure ? `<svg viewBox="0 0 260 150" class="calc-fig" role="img" aria-label="${tr('电路图', 'Circuit')}">${R(c.Figure())}</svg>` : ''}</div>
${tag(tr('实时计算器', 'Live calculator'), tr('界面上每个量是一个输入框，可写 4.7k、100n', 'each quantity is a text field in the app; 4.7k, 100n are accepted'))}
<table class="cmp"><thead><tr><th>${tr('符号', 'Symbol')}</th><th>${tr('含义', 'Meaning')}</th><th>${tr('默认值', 'Default')}</th></tr></thead><tbody>${c.vars
      .map((v: any) => `<tr><th scope="row">${math(v.sym.replace(/^([A-Za-z])(\d+)$/, '$1_$2'))}</th><td>${insideInl(v.name)}</td><td>${esc(calcFmt(v.def, v.unit))}</td></tr>`)
      .join(
        '',
      )}<tr class="h-out"><th scope="row">${math(c.out.sym)}</th><td>${insideInl(c.out.name)}</td><td><b>${esc(calcFmt(c.compute(defaults), c.out.unit))}</b></td></tr></tbody></table>
<h4>${tr('为什么是这个公式', 'Why this formula')}</h4>${insideMd(c.why)}
${c.example ? `<h4>${tr('例子', 'Example')}</h4>${insideMd(c.example)}` : ''}
${c.pitfalls?.length ? `<h4>${tr('容易错', 'Common mistakes')}</h4>${insideMd(c.pitfalls.map((p: string) => `- ${p}`).join('\n'))}` : ''}
${links.length ? `<p class="h-chips"><b>${tr('用到它的地方：', 'Used in: ')}</b>${links.map((x) => `<span class="h-chip">${x}</span>`).join('')}</p>` : ''}</article>`;
  }

  /* ------------------------------------------------------------------ key points and problems */

  function questionHtml(q: any): string {
    const ans = q.choices
      ? choiceList(
          q.choices.map((c: string) => sym(c)),
          q.correct,
          (i) => (q.choiceExplain?.[i] ? `<div class="h-dim">${sym(q.choiceExplain[i])}</div>` : ''),
        )
      : typeof q.answer === 'number'
        ? `<span class="h-answer"> → <b>${esc(formatAnswer(q))}</b></span>`
        : '';
    return `<li><span class="h-ask">${sym(q.ask)}</span>${ans}${q.explain ? `<div class="h-explain">${prMd(q.explain)}</div>` : ''}</li>`;
  }
  function problemHtml(x: { p: any; file: string }, n: number): string {
    const p = x.p;
    return `<article class="h-item h-problem" id="prob-${p.id}" data-kind="problem">
<header><div class="h-eyebrow">${tr('练习题', 'Problem')} ${n} · ${'★'.repeat(p.level)} ${src(x.file)}</div><h3>${sym(p.title)}</h3>
${p.tags.length ? `<p class="h-chips">${p.tags.map((t: string) => `<span class="h-chip">${esc(t)}</span>`).join('')}</p>` : ''}</header>
${prMd(p.statement)}
<figure class="h-blk h-fig">${schematic(p.schematic)}</figure>
<h4>${tr('小问与答案', 'Questions and answers')}</h4><ol class="h-measure">${p.questions.map(questionHtml).join('')}</ol>
${p.hints.length ? `<h4>${tr('提示', 'Hints')}</h4><ol>${p.hints.map((t: string) => `<li>${sym(t)}</li>`).join('')}</ol>` : ''}
${p.solution ? `<h4>${tr('完整解答', 'Full solution')}</h4>${prMd(p.solution)}` : ''}</article>`;
  }
  function keyPointsHtml(): string {
    const s = summary;
    const ideaTitle = (id: string) => s.ideas.find((i: any) => i.id === id)?.title ?? id;
    return `<article class="h-item" id="keypoints" data-kind="summary">
<header><div class="h-eyebrow">${tr('练习区 · 本章要点', 'Practice · key points')} ${src('summaries/opamp.json')}</div><h3>${chapterById('opamp').title()}${tr('：要点页', ': key points')}</h3></header>
${prMd(s.intro)}
<h4>${tr('要点（每条链接到练习题）', 'Key ideas (each links to problems)')}</h4>
${s.ideas.map((i: any, k: number) => `<section class="h-idea"><h5>${k + 1}. ${sym(i.title)}</h5>${prMd(i.text)}${i.problems.length ? `<p class="h-chips"><b>${tr('对应练习：', 'Problems: ')}</b>${i.problems.map((id: string) => `<span class="h-chip">${refLink(`problem:${id}`)}</span>`).join('')}</p>` : ''}</section>`).join('\n')}
<h4>${tr('公式表', 'Formula sheet')}</h4>
<table class="cmp h-formulas"><thead><tr><th>${tr('名称', 'Name')}</th><th>${tr('公式', 'Formula')}</th><th>${tr('成立条件', 'When it holds')}</th></tr></thead><tbody>${s.formulas
      .map(
        (f: any) =>
          `<tr><th scope="row">${sym(f.name)}</th><td class="h-expr">${math(f.expr)}</td><td>${sym(f.when)}${f.note ? `<div class="h-dim">${sym(f.note)}</div>` : ''}</td></tr>`,
      )
      .join('')}</tbody></table>
<h4>${tr('例题', 'Worked examples')}</h4>
${s.examples
  .map(
    (
      e: any,
    ) => `<section class="h-example"><h5>${sym(e.problem.title)}</h5><p class="h-dim">${tr('用到的要点：', 'Ideas used: ')}${e.ideas.map((i: string) => esc(ideaTitle(i))).join(tr('、', ', '))}</p>${prMd(e.problem.statement)}
<figure class="h-blk h-fig">${schematic(e.problem.schematic)}</figure>
<p><b>${tr('结果：', 'Results: ')}</b>${e.problem.questions.map((q: any) => `${sym(q.ask)} = <b>${esc(formatAnswer(q))}</b>`).join('； ')}</p>${prMd(e.problem.solution)}</section>`,
  )
  .join('\n')}
<h4>${tr('易错点', 'Common mistakes')}</h4><ul>${s.mistakes.map((m: any) => `<li>${sym(m.text)}${m.idea ? ` <span class="h-dim">(${esc(ideaTitle(m.idea))})</span>` : ''}</li>`).join('')}</ul>
</article>`;
  }

  /* ------------------------------------------------------------------ page */

  const itemHtml = (ref: string): string => {
    const id = ref.slice(ref.indexOf(':') + 1);
    if (ref.startsWith('unit:')) return unitHtml(id);
    if (ref.startsWith('challenge:')) return BRIEF.has(id) ? briefLabHtml(id) : labHtml(id);
    if (ref === 'chapter:opamp')
      return `<p class="h-pointer">${tr('练习章节「运算放大器」：要点页和 14 道题在本页后面 →', 'Practice chapter “Operational amplifiers”: the key points and the 14 problems are further down →')} <a href="#keypoints">${tr('本章要点', 'Key points')}</a> · <a href="#problems">${tr('练习题', 'Problems')}</a></p>`;
    return `<p class="h-pointer">${refLink(ref)}${tr('：排在这里的练习章节（不是 op-amp 专属内容，本页不收录）。', ': a practice chapter placed here (not op-amp specific; not included on this page).')}</p>`;
  };
  const itemKind = (ref: string) => {
    const id = ref.slice(ref.indexOf(':') + 1);
    if (ref.startsWith('unit:')) return tr('单元', 'unit');
    if (ref.startsWith('chapter:')) return tr('练习章节', 'practice chapter');
    return challenges.get(id)?.ch.kind === 'lesson' ? tr('面包板课程', 'breadboard lesson') : tr('面包板实验', 'breadboard lab');
  };
  const mapHtml = `<ol class="h-map">${world.sections
    .map(
      (s: any, i: number) =>
        `<li><a href="#sec-${i + 1}"><b>${esc(tt(s.title))}</b></a>${s.note ? ` <span class="h-dim">${esc(tt(s.note))}</span>` : ''}<ul>${s.items
          .map((it: string) => `<li><span class="h-kind">${esc(itemKind(it))}</span> ${refLink(it)}</li>`)
          .join('')}</ul></li>`,
    )
    .join('')}</ol>`;

  const allUnits = worldItems.filter((x) => x.startsWith('unit:')).map((x) => units.get(x.slice(5))!.unit);
  const blockStats: Record<string, number> = {};
  for (const u of allUnits) for (const l of u.layers) for (const b of l.blocks) blockStats[b.type] = (blockStats[b.type] ?? 0) + 1;
  const minutes = allUnits.reduce((n, u) => n + u.minutes, 0);

  const overview = tr(
    `<p>这一页把 Breadboard Lab 里 <b>World 3「${esc(tt(world.title))}」</b>（${esc(tt(world.course))}，${esc(tt(world.textbook))}）的全部教学内容按课程顺序汇到一起：文字、题目、答案、公式和图。图是应用里同一套 SVG 组件直接渲染出来的，和应用里看到的一样。<b>没有收录</b>的只有 3D 面包板仿真本身、每一步的自动检查规则，以及英文翻译（内容文件都是中英双语，这里只取中文）。</p>
<p>规模：${allUnits.length} 个学习单元（约 ${minutes} 分钟），${fullLabs.length} 个面包板课程 / 实验 + ${EXTRA_LABS.length} 个延伸实验，LM358 拆解 ${teardown.layers.length} 层，${calcCards.length} 张计算卡片，${summary.ideas.length} 条要点，${chapterProblems.length} 道练习题。</p>
<h3>现在的界面是怎么呈现这些内容的</h3>
<table class="cmp"><thead><tr><th>内容</th><th>页面</th><th>现在的呈现方式</th></tr></thead><tbody>
<tr><th scope="row">课程地图</th><td><code>#/map</code></td><td>8 个 World；World 3 下面分 ${world.sections.length} 个小节，每节里按顺序排着“学习单元 / 面包板课程 / 面包板实验 / 练习章节”。World 的说明：${esc(tt(world.note))}</td></tr>
<tr><th scope="row">学习单元</th><td><code>#/unit/&lt;id&gt;</code></td><td>单栏长页，一张卡片。页首：编号、预计分钟、标题、“这个单元回答”的那一个问题、“接回”（已学内容的链接）。正文最多五层，顺序固定：① 直觉 → ② 推导 → ③ 仿真 → ④ 面包板 → ⑤ 回链。每层由内容块组成（见下表）。页尾：“我学完了这个单元”勾选框、上一个 / 下一个单元。</td></tr>
<tr><th scope="row">面包板课程 / 实验</th><td><code>#/learn/&lt;id&gt;</code><br><code>#/challenges/&lt;id&gt;</code></td><td>左边是 3D 面包板工作台，右边是任务面板。面板里是一叠卡片，一次只看一张：试一试 → 想明白 → 动手做 → 带走。卡片带步骤（一次一步，自动检查板子上有没有搭对）。第一次进入先显示“第 0 步 · 先拆开看”（拆解）。“想明白”卡片上附本课要会算的计算卡片；“动手做”卡片上是测量题（电路检查通过后出现，学生读自己板子上的万用表 / 示波器）；全部答完显示“对比”。部分实验给半成品（起始布局 + 说明）。</td></tr>
<tr><th scope="row">拆开看（拆解）</th><td><code>#/inside</code></td><td>左文右图：左边一层一节文字，右边一张粘住不动的大图，滚动文字时图跟着一层层变化（外形 → 透视 → 符号 → 等效电路 → …）。带下划线的词、表格行、图上的引线标注互相高亮（本页保留了这个悬停高亮）。</td></tr>
<tr><th scope="row">计算卡片</th><td><code>#/calc</code></td><td>一张卡片 = 公式 + 小电路图 + 实时计算器（改一个数看结果）+ 为什么是这个公式 + 例子 + 容易错 + 用到它的课。</td></tr>
<tr><th scope="row">练习</th><td><code>#/practice</code></td><td>每章先是“要点页”（要点、公式表、例题、易错点），然后是题目：电路图 + 填数值答案（引擎核对）+ 提示 + 完整解答；另有错题本、间隔复习和章节测验。</td></tr>
<tr><th scope="row">传送门</th><td>单元内 / 页尾</td><td>一张小卡片，把当前想法连到别的 World 里展开它的内容（有的目标单元还没建，显示“即将上线”），带前置要求和“稍后再看”。</td></tr>
</tbody></table>
<h3>学习单元的内容块（本页每块左上角标了类型）</h3>
<table class="cmp"><thead><tr><th>类型</th><th>界面上的样子</th><th>World 3 里的数量</th></tr></thead><tbody>
<tr><th scope="row"><code>text</code></th><td>一段文字（段落、列表、表格、公式）</td><td>${blockStats.text ?? 0}</td></tr>
<tr><th scope="row"><code>note</code></th><td>提示框：说明 / 提示 / 注意</td><td>${blockStats.note ?? 0}</td></tr>
<tr><th scope="row"><code>circuit</code></th><td>一张电路图 + 图注</td><td>${blockStats.circuit ?? 0}</td></tr>
<tr><th scope="row"><code>steps</code></th><td>分步推导：一次揭开一步，“下一步”按钮（本页全部展开）</td><td>${blockStats.steps ?? 0}</td></tr>
<tr><th scope="row"><code>predict</code></th><td>先预测：选择题或填数，提交后才显示解释（本页直接给出答案和解释）</td><td>${blockStats.predict ?? 0}</td></tr>
<tr><th scope="row"><code>explore</code></th><td>动手调一调：几个滑块 + 实时结果表（本页列出参数、公式和初始值下的结果）</td><td>${blockStats.explore ?? 0}</td></tr>
<tr><th scope="row"><code>sim</code></th><td>仿真：每个情景先选预测 → 点“运行” → 看结果 → 解释为什么（本页列出每个情景的结果）</td><td>${blockStats.sim ?? 0}</td></tr>
<tr><th scope="row"><code>bench</code></th><td>上面包板：打开对应课程 / 实验的入口卡片</td><td>${blockStats.bench ?? 0}</td></tr>
<tr><th scope="row"><code>problems</code></th><td>练习区的题：链接列表</td><td>${blockStats.problems ?? 0}</td></tr>
<tr><th scope="row"><code>portal</code></th><td>传送门卡片</td><td>${blockStats.portal ?? 0}</td></tr>
</tbody></table>
<p>记号：学习单元和面包板内容跟 Sadiku 教材，电压写 v、电流写 i；术语第一次出现写成“English（中文）”，之后用英文（op-amp、node、rail）。每个条目标题旁的灰色路径是它在仓库里的源文件。</p>`,
    `<p>This page gathers everything <b>World 3 “${esc(tt(world.title))}”</b> of Breadboard Lab teaches (${esc(tt(world.course))}, ${esc(tt(world.textbook))}), in course order: text, questions, answers, formulas and figures. The figures are the app's own SVG components rendered to markup. <b>Not included:</b> the 3D breadboard simulation itself, the automatic step checks, and the other language (every content file is bilingual).</p>
<p>Size: ${allUnits.length} learning units (about ${minutes} min), ${fullLabs.length} breadboard lessons / labs + ${EXTRA_LABS.length} follow-on labs, the LM358 teardown in ${teardown.layers.length} layers, ${calcCards.length} calculation cards, ${summary.ideas.length} key ideas, ${chapterProblems.length} practice problems.</p>
<h3>How the app presents this content today</h3>
<table class="cmp"><thead><tr><th>Content</th><th>Page</th><th>Presentation</th></tr></thead><tbody>
<tr><th scope="row">Course map</th><td><code>#/map</code></td><td>Eight Worlds; World 3 has ${world.sections.length} sections, each an ordered list of learning units, breadboard lessons, labs and practice chapters. World note: ${esc(tt(world.note))}</td></tr>
<tr><th scope="row">Learning unit</th><td><code>#/unit/&lt;id&gt;</code></td><td>One long single-column card. Head: code, minutes, title, the one question the unit answers, “builds on” links. Up to five layers in a fixed order: ① intuition → ② derivation → ③ simulation → ④ breadboard → ⑤ connect back; each layer is a list of blocks (table below). Foot: an “I have finished this unit” checkbox, previous / next unit.</td></tr>
<tr><th scope="row">Breadboard lesson / lab</th><td><code>#/learn/&lt;id&gt;</code><br><code>#/challenges/&lt;id&gt;</code></td><td>The 3D breadboard bench on the left, the task panel on the right. The panel is a deck of cards shown one at a time: try it → why → build → take away. Cards own steps (one at a time, each checked against the board). A first visit starts with “step 0 · look inside first” (the teardown). The “why” card carries the lesson's calculation cards; the “build” card carries the measurement questions (after the circuit check passes; the student reads their own meter / scope); “compare” appears once all are answered. Some labs start from a half-built kit.</td></tr>
<tr><th scope="row">Inside (teardown)</th><td><code>#/inside</code></td><td>Text on the left, one section per layer; a sticky figure on the right that changes layer by layer as the text scrolls. Underlined words, table rows and leader labels highlight their part of the figure (kept on this page as a hover highlight).</td></tr>
<tr><th scope="row">Calculation card</th><td><code>#/calc</code></td><td>Formula + small circuit + live calculator + why this formula + example + common mistakes + the lessons that use it.</td></tr>
<tr><th scope="row">Practice</th><td><code>#/practice</code></td><td>Per chapter a key-points page (ideas, formula sheet, worked examples, mistakes), then problems: a circuit, numeric answers checked by the engine, hints, a full solution; plus a mistakes notebook, spaced review and chapter quizzes.</td></tr>
<tr><th scope="row">Portal</th><td>inside a unit / at its end</td><td>A small card linking the idea to where another World develops it (some targets are not built yet), with prerequisites and “watch later”.</td></tr>
</tbody></table>
<h3>Blocks of a learning unit (each block on this page is tagged with its type)</h3>
<table class="cmp"><thead><tr><th>Type</th><th>In the app</th><th>Count in World 3</th></tr></thead><tbody>
<tr><th scope="row"><code>text</code></th><td>prose (paragraphs, lists, tables, formulas)</td><td>${blockStats.text ?? 0}</td></tr>
<tr><th scope="row"><code>note</code></th><td>a callout: note / tip / watch out</td><td>${blockStats.note ?? 0}</td></tr>
<tr><th scope="row"><code>circuit</code></th><td>a circuit drawing with a caption</td><td>${blockStats.circuit ?? 0}</td></tr>
<tr><th scope="row"><code>steps</code></th><td>a derivation revealed one step at a time (all shown here)</td><td>${blockStats.steps ?? 0}</td></tr>
<tr><th scope="row"><code>predict</code></th><td>answer first (choice or number), then the explanation (shown here)</td><td>${blockStats.predict ?? 0}</td></tr>
<tr><th scope="row"><code>explore</code></th><td>sliders with a live results table (parameters, formulas and initial results here)</td><td>${blockStats.explore ?? 0}</td></tr>
<tr><th scope="row"><code>sim</code></th><td>per scenario: predict → run → result → why (results listed here)</td><td>${blockStats.sim ?? 0}</td></tr>
<tr><th scope="row"><code>bench</code></th><td>entry card to the lesson / lab</td><td>${blockStats.bench ?? 0}</td></tr>
<tr><th scope="row"><code>problems</code></th><td>links to practice problems</td><td>${blockStats.problems ?? 0}</td></tr>
<tr><th scope="row"><code>portal</code></th><td>a portal card</td><td>${blockStats.portal ?? 0}</td></tr>
</tbody></table>
<p>Notation: units and breadboard content follow Sadiku (v for voltage, i for current). The grey path next to each title is its source file in the repository.</p>`,
  );

  const toc = [
    ['overview', tr('概览：内容与现有界面', 'Overview: content and current UI')],
    ['map', tr('World 3 路线', 'World 3 map')],
    ...world.sections.map((s: any, i: number) => [`sec-${i + 1}`, `${i + 1}. ${tt(s.title)}`]),
    [`td-${teardown.id}`, tr('拆开看：LM358', 'Inside: the LM358')],
    ['calc', tr('计算卡片', 'Calculation cards')],
    ['keypoints', tr('本章要点', 'Key points')],
    ['problems', tr('练习题', 'Practice problems')],
    ['extra', tr('延伸实验', 'Follow-on labs')],
  ];

  const sectionsHtml = world.sections
    .map(
      (
        s: any,
        i: number,
      ) => `<section class="h-part" id="sec-${i + 1}"><h2><span class="h-num">${i + 1}</span>${esc(tt(s.title))}</h2>${s.note ? `<p class="h-lead">${esc(tt(s.note))}</p>` : ''}
${s.items.map(itemHtml).join('\n')}</section>`,
    )
    .join('\n');

  const css = buildCss();
  const title = tr('Op-amp 基础 · 课程内容汇编', 'Op-amp basics · course content');
  const html = `<!doctype html>
<html lang="${LANG === 'zh' ? 'zh-CN' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
${css}
</style>
</head>
<body>
<header class="h-top">
<div class="h-eyebrow">Breadboard Lab · World ${world.n} · ${esc(tt(world.course))} · ${esc(tt(world.textbook))}</div>
<h1>${title}</h1>
<p class="h-lead">${tr('运算放大器（op-amp）这一段课程的全部文字教学内容和图：学习单元、面包板课程与实验、LM358 拆解、计算卡片、本章要点和练习题。', 'All of the text and figures of the op-amp part of the course: learning units, breadboard lessons and labs, the LM358 teardown, calculation cards, key points and practice problems.')}</p>
<nav class="h-toc" aria-label="${tr('目录', 'Contents')}">${toc.map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join('')}</nav>
</header>
<main>
<section class="h-part" id="overview"><h2>${tr('概览：内容与现有界面', 'Overview: content and current UI')}</h2>${overview}</section>
<section class="h-part" id="map"><h2>${tr('World 3 路线（课程地图上的顺序）', 'World 3 map (the order on the course map)')}</h2>${mapHtml}</section>
${sectionsHtml}
<section class="h-part" id="inside"><h2>${tr('拆开看：LM358', 'Inside: the LM358')}</h2><p class="h-lead">${tr('第一次打开 LM358 课程和每个 op-amp 实验时先看这份拆解。原界面左文右图，滚动切换图层；这里每一层配它自己那一状态的图。把鼠标放在带下划线的词或表格行上，图上对应的部分会亮起来。', 'Shown before the LM358 lesson and every op-amp lab. In the app the text is on the left and one figure on the right changes with the scroll; here each layer has the figure in its own state. Hover an underlined word or a table row to light up its part.')}</p>
${teardownHtml()}</section>
<section class="h-part" id="calc"><h2>${tr('计算卡片', 'Calculation cards')}：${esc(calcGroup.title)}</h2><p class="h-lead">${insideInl(calcGroup.intro)} ${src('src/inside/calc/opamp.tsx')}</p>
${calcCards.map(calcHtml).join('\n')}</section>
<section class="h-part" id="keypoints-part"><h2>${tr('本章要点', 'Key points')}</h2><p class="h-lead">${tr('练习区每章的第一页。练习区的理论题原先按中文教材整理，文字里的结点名沿用 n、p、o。', 'The first page of the chapter in Practice.')}</p>
${keyPointsHtml()}</section>
<section class="h-part" id="problems"><h2>${tr('练习题', 'Practice problems')}（${chapterProblems.length}）</h2><p class="h-lead">${tr('界面上：左边题目列表，右边电路图 + 逐问填数值（支持 2.5k、-3mA），答错给针对性的提示，可看提示和完整解答。这里答案直接列出。', 'In the app: a list on the left; the circuit and numeric answer boxes on the right, with hints and a full solution. Answers are listed here.')}</p>
${chapterProblems.map((x, i) => problemHtml(x, i + 1)).join('\n')}</section>
<section class="h-part" id="extra"><h2>${tr('延伸实验：后面的 World 里用到 op-amp 的实验', 'Follow-on labs: op-amp labs in later Worlds')}</h2><p class="h-lead">${tr('World 3 的传送门指向这些实验（施密特触发器、积分器、有源低通、带缓冲的带通）。它们都用 LM358 的拆解作为“第 0 步”。', "World 3's portals lead to these labs; each uses the LM358 teardown as its step 0.")}</p>
${EXTRA_LABS.map(labHtml).join('\n')}</section>
</main>
<footer class="h-foot">${tr('由 scripts/opamp-handout.ts 从仓库内容生成', 'Generated by scripts/opamp-handout.ts from the repository content')} · ${new Date().toISOString().slice(0, 10)}</footer>
<script>
// teardown: an underlined word, a table row or a leader label lights up its part of the layer's figure
document.querySelectorAll('.h-tdlayer').forEach(function (sec) {
  var svg = sec.querySelector('svg.td-fig');
  if (!svg) return;
  function set(part) {
    svg.querySelectorAll('[data-part]').forEach(function (el) {
      el.classList.toggle('td-on', !!part && el.getAttribute('data-part').split(/\\s+/).indexOf(part) >= 0);
    });
    sec.querySelectorAll('[data-term]').forEach(function (el) { el.classList.toggle('on', !!part && el.getAttribute('data-term') === part); });
  }
  sec.querySelectorAll('[data-term]').forEach(function (el) {
    el.addEventListener('mouseenter', function () { set(el.getAttribute('data-term')); });
    el.addEventListener('mouseleave', function () { set(null); });
    el.addEventListener('focus', function () { set(el.getAttribute('data-term')); });
    el.addEventListener('blur', function () { set(null); });
  });
  svg.addEventListener('pointerover', function (e) {
    var el = e.target.closest('[data-part]');
    set(el ? el.getAttribute('data-part').split(/\\s+/)[0] : null);
  });
  svg.addEventListener('pointerleave', function () { set(null); });
});
</script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log(
    `${OUT}: ${(html.length / 1024).toFixed(0)} kB — ${allUnits.length} units, ${fullLabs.length + EXTRA_LABS.length} lessons / labs, ${teardown.layers.length} teardown layers, ${calcCards.length} calc cards, ${chapterProblems.length} problems`,
  );
} finally {
  await vite.close();
}

/* -------------------------------------------------------------------- css */

/** The app's own rules for the figures and formulas (so they look as they do in the app), then the page's. */
function buildCss(): string {
  const app = fs.readFileSync('src/styles.css', 'utf8');
  const keep = /^\.(ps-|cf-|card-figure|mx-|mx\b|schem|net-|ref-label|val-label|bus\b|fig-frame|fig-scroll)|^\.md \.mx/;
  const pick = (css: string): string => {
    let out = '';
    let i = 0;
    while (i < css.length) {
      const open = css.indexOf('{', i);
      if (open < 0) break;
      let depth = 1;
      let j = open + 1;
      for (; j < css.length && depth > 0; j++) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
      }
      const head = css
        .slice(i, open)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim();
      const body = css.slice(open + 1, j - 1);
      if (head.startsWith('@media') || head.startsWith('@supports')) {
        const inner = pick(body);
        if (inner.trim()) out += `${head} {\n${inner}}\n`;
      } else if (head.startsWith('@keyframes')) {
        if (/@keyframes\s+cf-/.test(head)) out += `${head} {${body}}\n`;
      } else if (head.split(',').some((s) => keep.test(s.trim()))) out += `${head} {${body}}\n`;
      i = j;
    }
    return out;
  };
  const rootVars = /:root\s*\{([\s\S]*?)\}/.exec(app)?.[1] ?? '';
  return `:root {${rootVars}}
/* ---- from src/styles.css: figures and formulas */
${pick(app)}
/* ---- src/inside/inside.css: teardown figures, calculation cards */
${fs.readFileSync('src/inside/inside.css', 'utf8')}
/* ---- this page */
${pageCss()}`;
}

function pageCss(): string {
  return `
:root {
  color-scheme: light;
  --body: 'HarmonyOS Sans SC', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Segoe UI', sans-serif;
  --cond: 'HarmonyOS Sans Condensed', 'HarmonyOS Sans SC', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Segoe UI', sans-serif;
  --mono: ui-monospace, 'SF Mono', Menlo, Consolas, 'Noto Sans Mono CJK SC', monospace;
  --td-hl: #2ba59b;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 16px; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); font-size: 15px; line-height: 1.65; -webkit-font-smoothing: antialiased; }
.h-top, main, .h-foot { max-width: 1040px; margin: 0 auto; padding: 0 20px; }
.h-top { padding-top: 36px; }
h1 { font-family: var(--cond); font-size: 34px; line-height: 1.15; margin: 4px 0 8px; letter-spacing: 0.01em; text-wrap: balance; }
h2 { font-family: var(--cond); font-size: 25px; line-height: 1.2; margin: 0 0 10px; padding-top: 6px; }
h3 { font-size: 20px; line-height: 1.3; margin: 2px 0 6px; }
h4 { font-size: 16px; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1.5px solid var(--line); }
h5 { font-size: 15px; margin: 12px 0 4px; }
h6 { font-size: 14.5px; margin: 0 0 4px; }
p { margin: 0 0 9px; }
ul, ol { margin: 0 0 9px; padding-left: 1.5em; }
li { margin: 2px 0; }
li > .md > p:last-child, li > p:last-child { margin-bottom: 2px; }
a { color: var(--accent-ink); text-underline-offset: 2px; }
code { font-family: var(--mono); font-size: 0.88em; background: rgba(31, 42, 68, 0.07); border-radius: 5px; padding: 1px 5px; }
b { font-weight: 700; }
.h-eyebrow { font-family: var(--cond); font-size: 12.5px; letter-spacing: 0.08em; color: var(--accent-ink); font-weight: 700; }
.h-lead { color: var(--ink-2); max-width: 78ch; }
.h-dim { color: var(--muted); font-size: 0.92em; }
.h-src { font-family: var(--mono); font-size: 11.5px; letter-spacing: 0; font-weight: 400; color: var(--muted); margin-left: 6px; }
.h-alt { font-size: 0.68em; font-weight: 400; color: var(--muted); margin-left: 6px; }
.h-toc { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 6px; }
.h-toc a { text-decoration: none; font-size: 13px; padding: 4px 11px; border: 1.5px solid var(--line-2); border-radius: 999px; background: var(--card); color: var(--ink); }
.h-toc a:hover { border-color: var(--ink-2); }
.h-part { margin-top: 44px; }
.h-part > h2 { border-bottom: 2.5px solid var(--ink); padding-bottom: 6px; }
.h-num { display: inline-block; min-width: 1.5em; color: var(--accent-ink); }
.h-map { padding-left: 1.4em; }
.h-map > li { margin: 8px 0; }
.h-map ul { list-style: none; padding-left: 0; margin: 4px 0 0; }
.h-kind { display: inline-block; min-width: 5.2em; font-size: 12px; color: var(--muted); }
.h-pointer { background: var(--card); border: 1.5px dashed var(--line-2); border-radius: 12px; padding: 10px 14px; margin: 14px 0; }

/* an item: a unit, a lesson / lab, the teardown, a calc card, a problem */
.h-item { background: var(--card); border: 1.5px solid var(--line-2); border-radius: var(--radius); padding: 20px 24px 18px; margin: 18px 0; }
.h-item > header { border-bottom: 1.5px solid var(--line); padding-bottom: 8px; margin-bottom: 4px; }
.h-question { color: var(--ink-2); margin-bottom: 4px; }
.h-connects { font-size: 13.5px; color: var(--ink-2); margin-bottom: 4px; }
.h-chips { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; margin: 6px 0; font-size: 13px; }
.h-chip { border: 1.2px solid var(--line-2); border-radius: 999px; padding: 1px 9px; background: var(--paper); text-decoration: none; }
.h-chip a { text-decoration: none; }
.h-layer > h4, .h-card > h4 { font-family: var(--cond); font-size: 17px; letter-spacing: 0.02em; }
.h-cardkind { display: inline-block; background: var(--ink); color: #fff; border-radius: 7px; padding: 0 8px; font-size: 13px; margin-right: 4px; }
.h-blk { margin: 10px 0; }
.h-tag { font-family: var(--cond); font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; color: var(--accent-ink); margin-bottom: 3px; }
.h-tag span { font-weight: 400; letter-spacing: 0; color: var(--muted); margin-left: 8px; }
.h-note, .h-predict, .h-explore, .h-sim, .h-steps, .h-bench, .h-problems, .h-portal { border-radius: 12px; padding: 10px 14px; background: var(--paper); border: 1.5px solid var(--line); }
.h-note.info { background: var(--info-soft); border-color: #c9d8ee; }
.h-note.tip { background: var(--accent-soft); border-color: #b4ddd4; }
.h-note.warn { background: var(--warn-soft); border-color: #ecd9a8; }
.h-note.warn .h-tag { color: var(--warn-ink); }
.h-portal { border-style: dashed; border-color: var(--line-2); }
.h-portal-to { font-weight: 700; font-size: 15.5px; margin-bottom: 4px; }
.h-ask { font-weight: 600; }
.h-ask .md p { margin-bottom: 4px; }
.h-choices { margin: 4px 0 6px; }
.h-choices li.ok { font-weight: 600; }
.h-ok { color: var(--accent-ink); font-size: 12.5px; font-weight: 700; margin-left: 4px; white-space: nowrap; }
.h-answer { color: var(--accent-ink); }
.h-explain { border-left: 3px solid var(--accent); padding: 1px 0 1px 10px; margin: 6px 0 2px; color: var(--ink-2); }
.h-explain > b { font-size: 12.5px; color: var(--accent-ink); }
.h-explain .md p:last-child { margin-bottom: 0; }
.h-model, .h-meta { font-size: 13px; color: var(--muted); margin-bottom: 4px; }
.h-meta { font-family: var(--mono); font-size: 11.5px; }
.h-scenario { border-top: 1.5px dashed var(--line-2); padding-top: 10px; margin-top: 10px; }
.h-result table { margin-top: 4px; }
.h-measure > li { margin: 10px 0; padding-bottom: 8px; border-bottom: 1px dashed var(--line); }
.h-measure > li > .h-dim { display: none; }
.h-labsteps > li { margin: 6px 0; }
.h-layout { margin: 10px 0 0; font-size: 13px; }
.h-layout summary { cursor: pointer; color: var(--accent-ink); font-weight: 600; }
.h-idea, .h-example { margin: 10px 0 14px; }
.h-brief { padding-bottom: 10px; }

/* tables */
table.cmp { border-collapse: collapse; width: 100%; margin: 6px 0 10px; font-size: 14px; }
table.cmp th, table.cmp td { border: 1px solid var(--line-2); padding: 5px 9px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
table.cmp thead th { background: rgba(31, 42, 68, 0.06); font-size: 13px; }
table.cmp tbody th { font-weight: 600; background: rgba(31, 42, 68, 0.025); }
table.cmp tr.h-out td, table.cmp tr.h-out th { background: var(--accent-soft); }
.u-table-wrap, .td-table-wrap { overflow-x: auto; }
.h-formulas .h-expr { white-space: nowrap; font-size: 15px; }

/* figures */
.h-fig { margin: 12px 0; padding: 10px 10px 8px; background: var(--paper); border: 1.5px solid var(--line); border-radius: 12px; text-align: center; }
.h-fig figcaption, .h-tdfig figcaption { margin-top: 6px; font-size: 13px; color: var(--muted); line-height: 1.45; }
.h-fig .ps-svg { margin: 0 auto; }
.fig-frame { position: relative; }
.fig-scroll { overflow-x: auto; }
.fig-frame::before, .fig-frame::after { display: none; }
.h-target .schem-card { border: none; padding: 0; }
.h-target .schem { margin: 0 auto; max-width: 100%; height: auto; }
.card-figure { margin: 10px 0 12px; }
.md .mx, .td-math { white-space: nowrap; }

/* teardown: text left, the layer's figure right */
.h-tdlayer { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 22px; align-items: start; padding: 18px 0; border-top: 1.5px solid var(--line); }
.h-tdlayer.td { flex-direction: unset; }
.h-tdtext h4 { border: none; margin: 0 0 6px; font-size: 19px; padding: 0; }
.h-tdnum { font-family: var(--cond); font-size: 22px; font-weight: 700; color: var(--accent-ink); line-height: 1; margin-bottom: 4px; }
.h-tdnum span { font-size: 13px; color: var(--muted); font-weight: 400; }
.h-tdfig { margin: 0; position: sticky; top: 12px; background: var(--paper); border: 1.5px solid var(--line); border-radius: 12px; padding: 8px; text-align: center; }
.h-tdfig .td-fig { max-height: none; }
tr.on > * { background: var(--accent-soft); }
.td-callout.on line { stroke: var(--accent-ink); stroke-width: 2; stroke-dasharray: none; }
.td-callout.on circle { fill: var(--accent); }
.td-callout.on text { fill: var(--accent-ink); }
.h-calctop { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin: 10px 0; }
.h-calctop .calc-formula { flex: 1 1 260px; }
.h-calctop .calc-fig { flex: 0 1 300px; max-width: 320px; height: auto; background: var(--paper); border: 1.5px solid var(--line); border-radius: 10px; }
.h-calc h4 { border: none; margin: 12px 0 4px; }
.h-foot { margin-top: 48px; padding-bottom: 40px; color: var(--muted); font-size: 12.5px; }

@media (max-width: 760px) {
  body { font-size: 14.5px; }
  .h-top, main, .h-foot { padding: 0 16px; }
  .h-top { padding-top: 24px; }
  h1 { font-size: 27px; }
  .h-item { padding: 14px 14px 12px; }
  .h-tdlayer { grid-template-columns: minmax(0, 1fr); }
  .h-tdfig { position: static; }
  .h-formulas .h-expr { white-space: normal; }
  table.cmp { font-size: 13px; }
  table.cmp th, table.cmp td { padding: 4px 6px; }
}
@media print {
  body { background: #fff; }
  .h-item { break-inside: auto; border-color: #bbb; }
  .h-tdfig { position: static; }
  .h-toc { display: none; }
}
`;
}
