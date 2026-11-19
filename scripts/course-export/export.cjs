/* global require, process, console, window, __dirname, fetch, setTimeout, localStorage */
/* eslint-disable @typescript-eslint/no-require-imports */
// Course export: every item of the course (course/worlds.json, in course order) as one Markdown
// file for the people / AIs who rewrite the teaching text, with pictures:
//   - the 3D bench as 2D: a top-view screenshot of the board at the start, after each step of a
//     lesson, and with the reference solution, plus a parts table;
//   - everything the right-hand panel shows, in the order the student meets it (the rail): node
//     texts, steps and their checks, figures, teardown layers, derivations, measurement questions
//     (with the reference reading), compare, hints, calculation cards; English in an appendix;
//   - the theory units (#/unit) block by block, their circuits as pictures.
// Pictures are drawn by the app's own components (scripts/course-export/page.tsx) and its real 3D
// bench, so they match what the student sees.
//
//   node scripts/course-export/export.cjs [--only id1,id2] [--out course-export]
// Starts its own dev server (VITE_E2E=1, port 5191). Needs the pre-installed Playwright Chromium.

const { chromium } = require('playwright');
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const OUT = path.resolve(ROOT, opt('--out') || 'course-export');
const ONLY = opt('--only')?.split(',');
const PORT = 5191;
const BASE = `http://localhost:${PORT}/`;

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const T = (v, lang = 'zh') => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.join('\n');
  const x = v[lang] ?? v.zh ?? '';
  return Array.isArray(x) ? x.join('\n') : x;
};

/* ------------------------------------------------------------------ the course, in order */

const challengeFiles = new Map();
for (const f of fs.readdirSync(path.join(ROOT, 'challenges')).filter((x) => x.endsWith('.json'))) {
  const j = read(`challenges/${f}`);
  challengeFiles.set(j.id, `challenges/${f}`);
}
const worlds = read('course/worlds.json').worlds;
const portals = new Map(read('course/portals.json').portals.map((p) => [p.id, p]));
const problemTitles = new Map();
for (const ch of fs.readdirSync(path.join(ROOT, 'problems'))) {
  const dir = path.join(ROOT, 'problems', ch);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (j.id) problemTitles.set(j.id, `${j.title}（${ch}）`);
  }
}

const items = [];
for (const w of worlds) {
  w.sections.forEach((sec, si) => {
    const num = w.n ? `${w.n}.${si + 1}` : `0.${si + 1}`;
    let pos = 0;
    for (const it of sec.items) {
      const [kind, id] = it.split(':');
      if (kind !== 'challenge' && kind !== 'unit') continue;
      pos++;
      items.push({ kind, id, world: w, sec, num, pos, file: kind === 'challenge' ? challengeFiles.get(id) : `units/${id}.json` });
    }
  });
}
const pad = (num) => num.replace(/\.(\d)$/, '.0$1');
for (const it of items) {
  it.dir = it.world.id;
  it.name = `${pad(it.num)}-${it.pos}-${it.id}`;
  it.md = `${it.dir}/${it.name}.md`;
}
const byId = new Map(items.map((i) => [i.id, i]));

/* ------------------------------------------------------------------ reference readings */

function referenceReadings() {
  const out = execFileSync('npx', ['tsx', 'scripts/validate-challenges.ts', '--readings'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 });
  const map = new Map();
  let cur = [];
  for (const line of out.split('\n')) {
    const m = /^\s+reading\s+(\S+)\s+=\s+(.+?)\s{2}/.exec(line);
    if (m) cur.push([m[1], m[2]]);
    const f = /^[✔✘]\s+(challenges\/\S+\.json)/.exec(line);
    if (f) {
      map.set(f[1], new Map(cur));
      cur = [];
    } else if (/^[✔✘]/.test(line)) cur = [];
  }
  return map;
}

/* ------------------------------------------------------------------ markdown helpers */

const KIND = {
  look: ['🔍', '先看一眼', 'Look first'],
  build: ['🔧', '动手搭', 'Build'],
  measure: ['📏', '测一测', 'Measure'],
  think: ['💡', '想明白', 'Why'],
  wrap: ['🎒', '带走', 'Take away'],
};
const quote = (s) =>
  s
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n');
const table = (head, rows) =>
  [
    `| ${head.join(' | ')} |`,
    `|${head.map(() => '---').join('|')}|`,
    ...rows.map(
      (r) =>
        `| ${r
          .map((c) =>
            String(c ?? '')
              .replace(/\|/g, '\\|')
              .replace(/\n/g, ' '),
          )
          .join(' | ')} |`,
    ),
  ].join('\n');
const propsText = (p) =>
  Object.entries(p || {})
    .filter(([k]) => k !== 'wireColor')
    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(', ');
const pinsText = (p) =>
  Object.entries(p || {})
    .map(([k, v]) => `${k}→${v}`)
    .join(' ');

function partsTable(layout) {
  if (!layout?.parts?.length) return '_（板上没有元件）_';
  return table(
    ['元件', '类型', '参数', '引脚 → 孔'],
    layout.parts.map((p) => [p.ref, p.type, propsText(p.props), pinsText(p.pins)]),
  );
}

function questionMd(q, n, d, readings, lang, img) {
  const zh = lang === 'zh';
  const L = [];
  const kind = q.what
    ? q.what.kind === 'formula'
      ? zh
        ? '计算题（用自己的读数算）'
        : 'calculation from own readings'
      : zh
        ? '读数题'
        : 'reading'
    : zh
      ? '选择题'
      : 'multiple choice';
  L.push(`**${zh ? '测量题' : 'Question'} ${n} · \`${q.id}\`**（${kind}${q.required ? '' : zh ? '，选做' : ', optional'}）`);
  L.push('');
  L.push(quote(q.ask));
  L.push('');
  if (q.choices) q.choices.forEach((c, i) => L.push(`- ${String.fromCharCode(65 + i)}. ${c}${i === q.correct ? (zh ? ' ✅（正确）' : ' ✅ (right)') : ''}`));
  const meta = [];
  if (q.unit) meta.push(`${zh ? '单位' : 'unit'} ${q.unit}`);
  if (q.predict) meta.push(zh ? '先写预测' : 'predict first');
  if (d.qsets?.[q.id]) meta.push(`${zh ? '状态' : 'state'}：${d.qsets[q.id]}`);
  if (q.after !== undefined) meta.push(zh ? `第 ${q.after + 1} 步完成后就能答` : `answerable after step ${q.after + 1}`);
  if (img && readings?.get(q.id)) meta.push(`${zh ? '参考答案的读数' : 'reference reading'} **${readings.get(q.id)}**`);
  if (q.range) meta.push(`${zh ? '合理范围' : 'range'} [${q.range.join(', ')}]`);
  if (q.what?.kind === 'formula') meta.push(`${zh ? '公式' : 'formula'} \`${q.what.expr}\``);
  if (meta.length) L.push('', `- ${meta.join(' · ')}`);
  if (q.explain) L.push('', `${zh ? '答对后显示：' : 'Shown once right:'}`, '', quote(q.explain));
  return L.join('\n');
}

function tdLayerMd(td, n, zh) {
  const l = td.layers[n];
  if (!l) return '';
  const L = [`**${zh ? '拆解' : 'Teardown'}「${td.title}」${zh ? `第 ${n + 1} / ${td.layers.length} 层` : `layer ${n + 1} of ${td.layers.length}`}：${l.title}**`, '', l.body];
  if (l.table) L.push('', table(l.table.head, l.table.rows));
  if (l.formulas?.length) L.push('', ...l.formulas.map((f) => `- 公式 \`${f.tex}\`${f.note ? `：${f.note}` : ''}`));
  return L.join('\n');
}

function calcMd(c, zh) {
  const L = [
    `**${zh ? '计算卡片' : 'Calculation card'} \`${c.id}\`：${c.title}**`,
    '',
    `- ${zh ? '公式' : 'formula'} \`${c.tex}\``,
    `- ${zh ? '用途' : 'use'}：${c.use}`,
    `- ${zh ? '输入' : 'inputs'}：${c.vars.join('；')} → ${c.out}`,
    '',
    c.why,
  ];
  if (c.example) L.push('', `${zh ? '例子' : 'Example'}：${c.example}`);
  if (c.pitfalls?.length) L.push('', ...c.pitfalls.map((p) => `- ⚠ ${p}`));
  return L.join('\n');
}

/** one lab: the Markdown of the rail (the right-hand panel), in one language */
function railMd(it, d, readings, lang, img) {
  const zh = lang === 'zh';
  const ch = d.ch;
  const A = (f) => (img ? `../assets/${it.id}/${f}` : null);
  const L = [];
  const qs = new Map(ch.measurements.map((q, i) => [q.id, [q, i + 1]]));
  const stepMd = (k) => {
    const s = ch.steps[k];
    const text = s.text
      .split('\n')
      .map((l) => (/\(fig:/.test(l) ? (embed(l) ?? l) : l))
      .join('\n');
    const out = [`**${zh ? '步骤' : 'Step'} ${k + 1}**`, '', text];
    if (d.checkText[k]?.length) out.push('', `${zh ? '自动检查（做到这些才算完成）' : 'Checked automatically'}：${d.checkText[k].join('；')}`);
    if (s.highlight?.length) out.push(`${zh ? '板上高亮的孔' : 'Holes highlighted'}：${s.highlight.join('、')}`);
    if (img && d.boards.steps[k]) out.push('', `![${zh ? '做完这一步的面包板' : 'board after this step'}](${A(`board-step-${k + 1}.jpg`)})`);
    return out.join('\n');
  };
  const embed = (line, n) => {
    const m = /^\s*!\[([^\]]*)\]\((fig|measure|inside|derive|calc|steps):([A-Za-z0-9_#-]+)\)\s*$/.exec(line);
    if (!m) return null;
    const [, , kind, arg] = m;
    if (kind === 'fig') {
      const f = ch.figures[arg];
      const cap = f ? (typeof f.caption === 'string' ? f.caption : f.caption?.text) : '';
      return [img ? `![${cap}](${A(`fig-${arg}.png`)})` : `[${zh ? '图' : 'figure'} \`${arg}\`]`, '', `*${zh ? '图' : 'Figure'} \`${arg}\`（${f?.kind ?? '?'}）：${cap}*`].join(
        '\n',
      );
    }
    if (kind === 'measure') {
      const [q, k] = qs.get(arg) ?? [];
      return q ? questionMd(q, k, d, readings, lang, img) : '';
    }
    if (kind === 'inside') {
      const [id, l] = arg.split('#');
      const td = d.tds[id];
      return [img ? `![](${A(`td-${id}-${l}.png`)})` : '', td ? tdLayerMd(td, +l - 1, zh) : `（拆解 ${id} 不存在）`].filter(Boolean).join('\n\n');
    }
    if (kind === 'derive') {
      const dv = ch.derivations[arg];
      if (!dv) return '';
      const out = [
        `**${zh ? '推导' : 'Derivation'} \`${arg}\`${dv.title ? `：${dv.title}` : ''}**（${zh ? '一次揭开一行' : 'revealed one line at a time'}）`,
        '',
        ...dv.steps.map((s, i) => `${i + 1}. ${s.replace(/\n/g, ' ')}`),
      ];
      if (dv.check) out.push('', `${zh ? '最后填结果' : 'Then type the result'}：${dv.check.answer} ${dv.check.unit}`);
      return out.join('\n');
    }
    if (kind === 'calc') {
      const c = d.calcs.find((x) => x.id === arg);
      return c ? calcMd(c, zh) : '';
    }
    if (kind === 'steps') return Array.from({ length: n.count }, (_, j) => stepMd(n.first + j)).join('\n\n');
    return null;
  };
  d.nodes.forEach((n, i) => {
    const [ico, kz, ke] = KIND[n.kind];
    L.push(`### ${zh ? '第' : 'Node'} ${i + 1}${zh ? ' 步' : ''} · ${ico} ${zh ? kz : ke}：${n.title}`, '');
    const lines = n.text.split('\n');
    let stepsShown = false;
    const buf = [];
    const flush = () => {
      if (buf.length) L.push(buf.join('\n'), '');
      buf.length = 0;
    };
    for (const line of lines) {
      const e = embed(line, n);
      if (e === null) buf.push(line);
      else {
        flush();
        if (/\(steps:/.test(line)) stepsShown = true;
        if (e) L.push(e, '');
      }
    }
    flush();
    if (n.count && !stepsShown) for (let j = 0; j < n.count; j++) L.push(stepMd(n.first + j), '');
    const inText = new Set(lines.flatMap((l) => /\(measure:([A-Za-z0-9_-]+)\)/.exec(l)?.[1] ?? []));
    for (const id of n.measure.filter((x) => !inText.has(x))) {
      const [q, k] = qs.get(id) ?? [];
      if (q) L.push(questionMd(q, k, d, readings, lang, img), '');
    }
    if (ch.railAuto && n.kind === 'think' && d.calcs.length)
      L.push(
        `${zh ? '（这一步下面列着这节课的计算卡片，点开就地展开：' : '(This node lists the lesson’s calculation cards: '}${d.calcs.map((c) => `\`${c.id}\``).join('、')}${zh ? '，全文见第 6 节）' : '; full text in section 6)'}`,
        '',
      );
    if (n.kind === 'wrap' && n.practice.length) L.push(`${zh ? '趁热练理论题' : 'Practise'}：${n.practice.map((c) => `\`${c}\``).join('、')}`, '');
  });
  return L.join('\n');
}

function labMd(it, d, en, readings, prev, next) {
  const ch = d.ch;
  const L = [];
  const where = `World ${it.world.n ?? 'UB'} · ${T(it.world.title)} → ${it.num} ${T(it.sec.title)}（本节第 ${it.pos} 项）`;
  L.push(`# ${it.num} · ${ch.title}`, '');
  L.push(
    table(
      ['项目', '内容'],
      [
        ['id', `\`${ch.id}\``],
        ['文件', `\`${it.file}\``],
        ['类型', `${ch.kind === 'lesson' ? '课程（有分步，每步自动检查）' : '实验 / 挑战（没有分步，照目标电路图搭）'} · 难度 ${ch.level}/5`],
        ['位置', where],
        ['右侧面板', ch.railAuto ? '轨道由旧的四张卡片自动生成（还没手工精排）' : ch.rail.length ? '手写轨道（样板课）' : '旧版面（文件里没有卡片）'],
        ['前后', `${prev ? `上一项 [${prev.num} ${prev.id}](../${prev.md})` : '—'} · ${next ? `下一项 [${next.num} ${next.id}](../${next.md})` : '—'}`],
        ['先修', ch.prereq?.length ? ch.prereq.join('、') : '—'],
        ['概念', ch.concepts?.join('、') || '—'],
      ],
    ),
    '',
  );
  if (ch.summary) L.push(`**一句话概要**：${ch.summary}`, '');

  L.push('## 1. 左侧工作台（3D 面包板 → 2D 俯视截图）', '');
  L.push('截图是程序里真实的 3D 面包板换成俯视角拍的；表格是同一块板的文字版（元件、参数、每只脚插在哪个孔）。', '');
  if (d.boards.start) {
    L.push('### 1.1 起点：打开这一课时板上已经有的', '');
    if (ch.startNote) L.push(`右侧显示的「起点」说明：`, '', quote(ch.startNote), '');
    L.push(`![起点](../assets/${it.id}/board-start.jpg)`, '', partsTable(d.boards.start), '');
  } else L.push('### 1.1 起点：空面包板（学生从零开始搭）', '');
  if (d.boards.steps.length) L.push('### 1.2 每一步之后的面包板', '', '见第 2 节每个步骤下面的截图（按步骤的自动检查重建：放 / 改 / 拔元件、移动万用表表笔）。', '');
  if (d.boards.solution) L.push('### 1.3 参考答案（「看答案」载入的板子）', '', `![参考答案](../assets/${it.id}/board-solution.jpg)`, '', partsTable(d.boards.solution), '');
  L.push('### 1.4 目标原理图（右侧「目标原理图」抽屉）', '', `![目标原理图](../assets/${it.id}/target.png)`, '');
  L.push(
    table(
      ['元件', '类型', '参数'],
      d.targetParts.map((p) => [p.ref, p.type, propsText(p.props)]),
    ),
    '',
    '连接（每个结点上的引脚）：',
    '',
    ...d.targetNets.map((n) => `- **${n.name}**：${n.pins.join('、')}`),
    '',
  );
  if (ch.grading === 'behaviour') L.push('> 开放式设计题：只看电路表现判分，上图只是一种做法。', '');

  L.push('## 2. 右侧面板：学生从上往下看到的内容（单轨流）', '');
  if (!d.nodes.length) {
    L.push('> 这个文件还没有卡片，界面是旧版面：题目说明 + 目标原理图 + 测量题。', '', '### 题目说明', '', ch.description, '');
    ch.measurements.forEach((q, i) => L.push(questionMd(q, i + 1, d, readings, 'zh', true), ''));
  } else L.push(railMd(it, d, readings, 'zh', true));

  L.push('## 3. 测量题一览', '');
  if (ch.measurements.length)
    L.push(
      table(
        ['#', 'id', '题目', '类型', '单位', '状态', '参考读数'],
        ch.measurements.map((q, i) => [
          i + 1,
          q.id,
          q.ask,
          q.what ? q.what.kind : '选择',
          q.unit,
          d.qsets[q.id],
          readings?.get(q.id) ?? (q.choices ? `正确：${String.fromCharCode(65 + q.correct)}` : ''),
        ]),
      ),
      '',
    );
  else L.push('_没有测量题。_', '');
  if (ch.compare) L.push('### 全部答完后显示的「对比」', '', ch.compare, '');
  if (ch.hints?.length) L.push('### 提示按钮（依次显示）', '', ...ch.hints.map((h, i) => `${i + 1}. ${h}`), '');
  if (ch.tests?.length) L.push('### 功能测试（「检查我的电路」时跑）', '', ...ch.tests.map((t) => `- ${t.name}`), '');

  const tds = Object.values(d.tds);
  if (tds.length) {
    L.push('## 4. 用到的拆解（全部层的文字，供改写参考）', '');
    for (const td of tds) {
      L.push(`### 拆解 \`${td.id}\`：${td.title}`, '', `*${td.subtitle}*`, '');
      td.layers.forEach((_, i) => L.push(tdLayerMd(td, i, true), ''));
      if (td.recap) L.push(`**一句话记住**：${td.recap}`, '');
    }
  }
  if (d.calcs.length) {
    L.push('## 5. 这一课的计算卡片', '');
    for (const c of d.calcs) L.push(calcMd(c, true), '');
  }
  L.push('## 6. English（界面英文版的同一份内容）', '', '<details><summary>展开英文</summary>', '');
  if (en.nodes.length) L.push(railMd(it, en, readings, 'en', false));
  else {
    L.push(en.ch.description, '');
    en.ch.measurements.forEach((q, i) => L.push(questionMd(q, i + 1, en, readings, 'en', false), ''));
  }
  if (en.ch.compare) L.push('**Compare**', '', en.ch.compare, '');
  if (en.ch.hints?.length) L.push('**Hints**', '', ...en.ch.hints.map((h, i) => `${i + 1}. ${h}`), '');
  L.push('', '</details>', '');
  return L.join('\n');
}

/* ------------------------------------------------------------------ units */

const LAYER = { intuition: '① 直觉', derive: '② 交互推导', sim: '③ 仿真', bench: '④ 面包板', connect: '⑤ 回链' };
function blockMd(b, lang, unitId, k, img) {
  const t = (v) => T(v, lang);
  switch (b.type) {
    case 'text':
      return t(b.md);
    case 'note':
      return quote(`**${{ info: '说明', tip: '提示', warn: '注意' }[b.tone] ?? b.tone}** · ${t(b.md)}`);
    case 'steps':
      return [`**分步推导${b.title ? `：${t(b.title)}` : ''}**（一次揭开一步）`, '', ...b.steps.map((s, i) => `${i + 1}. ${t(s).replace(/\n/g, ' ')}`)].join('\n');
    case 'predict': {
      const L = [`**预测题**：${t(b.ask)}`, ''];
      if (b.choices) b.choices.forEach((c, i) => L.push(`- ${String.fromCharCode(65 + i)}. ${t(c)}${i === b.correct ? ' ✅' : ''}`));
      if (b.answer !== undefined) L.push(`- 答案：${b.answer}${b.unit ? ` ${b.unit}` : ''}（误差 ${b.tol ?? 0.05}）`);
      if (b.text) L.push(`- 可接受的文字答案：${b.text.join('、')}`);
      L.push('', '揭晓：', '', quote(t(b.explain)));
      return L.join('\n');
    }
    case 'explore':
    case 'sim': {
      const L = [`**${b.type === 'explore' ? '滑块探索' : '仿真'}${b.title ? `：${t(b.title)}` : ''}**`];
      if (b.intro) L.push('', t(b.intro));
      L.push(
        '',
        table(
          ['参数', '名称', '默认', '范围', '单位'],
          b.params.map((p) => [p.id, t(p.label), p.value, p.min !== undefined ? `${p.min} … ${p.max}${p.log ? '（对数）' : ''}` : '', p.unit ?? '']),
        ),
        '',
        table(
          ['输出', '公式', '单位'],
          b.outputs.map((o) => [t(o.label), `\`${o.expr}\``, o.unit ?? '']),
        ),
      );
      if (b.note) L.push('', t(b.note));
      for (const s of b.scenarios ?? []) {
        L.push(
          '',
          `- **情景「${t(s.label)}」**（设定 ${Object.entries(s.set)
            .map(([a, v]) => `${a}=${v}`)
            .join(', ')}）：${t(s.ask)}`,
        );
        s.choices.forEach((c, i) => L.push(`  - ${String.fromCharCode(65 + i)}. ${t(c)}${i === s.correct ? ' ✅' : ''}`));
        L.push(`  - 解释：${t(s.explain).replace(/\n/g, ' ')}`);
      }
      return L.join('\n');
    }
    case 'circuit':
      return [img ? `![](../assets/${unitId}/circuit-${k}.png)` : '[电路图]', '', `*${t(b.caption)}*`].join('\n');
    case 'bench': {
      const target = byId.get(b.challenge);
      return `**去面包板** → ${target ? `[${target.num} ${b.challenge}](../${target.md})` : `\`${b.challenge}\``}：${t(b.note)}`;
    }
    case 'problems':
      return [`**理论题**${b.note ? `：${t(b.note)}` : ''}`, '', ...b.ids.map((id) => `- \`${id}\` ${problemTitles.get(id) ?? ''}`)].join('\n');
    case 'portal': {
      const p = portals.get(b.id);
      return p ? `**传送门** \`${b.id}\` → \`${p.to}\`（${p.minutes ?? '?'} 分钟）：${t(p.what)} · 回来时：${t(p.back)}` : `**传送门** \`${b.id}\``;
    }
    default:
      return `（${b.type}）`;
  }
}

function unitMd(it, u, prev, next) {
  const L = [`# ${it.num} · 单元 ${u.code ?? ''}：${T(u.title)}`, ''];
  L.push(
    table(
      ['项目', '内容'],
      [
        ['id', `\`${u.id}\``],
        ['文件', `\`${it.file}\``],
        ['类型', '理论单元（#/unit 页面，从上往下读的长页）'],
        ['位置', `World ${it.world.n} · ${T(it.world.title)} → ${it.num} ${T(it.sec.title)}（本节第 ${it.pos} 项）`],
        ['这个单元回答的问题', T(u.question)],
        ['时长', `${u.minutes} 分钟`],
        ['接回', (u.connects ?? []).join('、') || '—'],
        ['前后', `${prev ? `上一项 [${prev.num} ${prev.id}](../${prev.md})` : '—'} · ${next ? `下一项 [${next.num} ${next.id}](../${next.md})` : '—'}`],
      ],
    ),
    '',
  );
  let k = 0;
  const body = (lang, img) => {
    k = 0;
    const out = [];
    for (const layer of u.layers) {
      out.push(`## ${LAYER[layer.layer] ?? layer.layer}${layer.title ? `：${T(layer.title, lang)}` : ''}`, '');
      for (const b of layer.blocks) {
        const n = b.type === 'circuit' ? ++k : 0;
        out.push(blockMd(b, lang, u.id, n, img), '');
      }
    }
    return out.join('\n');
  };
  L.push(body('zh', true));
  L.push('## English', '', '<details><summary>展开英文</summary>', '', body('en', false), '', '</details>', '');
  return L.join('\n');
}

/* ------------------------------------------------------------------ run */

async function waitUp() {
  for (let i = 0; i < 150; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {
      /* not yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('dev server did not start');
}

(async () => {
  const server = spawn(process.execPath, [path.join(ROOT, 'node_modules/vite/bin/vite.js'), '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    env: { ...process.env, VITE_E2E: '1' },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  process.on('exit', () => server.kill());
  try {
    await waitUp();
    console.log('reference readings …');
    const readings = referenceReadings();
    fs.mkdirSync(OUT, { recursive: true });
    const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => localStorage.setItem('bb.lang', JSON.stringify('zh')));
    const page = await ctx.newPage();
    const figCtx = await browser.newContext({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
    const fig = await figCtx.newPage();
    const errors = [];
    fig.on('pageerror', (e) => errors.push(`figures: ${e}`));
    page.on('pageerror', (e) => errors.push(`bench: ${e}`));
    await fig.goto(`${BASE}scripts/course-export/page.html`);
    await fig.waitForFunction(() => window.__export);

    const todo = ONLY ? items.filter((i) => ONLY.includes(i.id)) : items;
    for (const it of todo) {
      const t0 = Date.now();
      const idx = items.indexOf(it);
      const prev = items[idx - 1];
      const next = items[idx + 1];
      const assets = path.join(OUT, 'assets', it.id);
      fs.mkdirSync(assets, { recursive: true });
      fs.mkdirSync(path.join(OUT, it.dir), { recursive: true });
      const json = read(it.file);
      if (it.kind === 'unit') {
        const circuits = [];
        let k = 0;
        for (const l of json.layers) for (const b of l.blocks) if (b.type === 'circuit') circuits.push({ name: `circuit-${++k}`, schematic: b.schematic });
        await fig.evaluate((c) => window.__export.unit(c), circuits);
        await fig.waitForTimeout(800);
        for (const el of await fig.$$('[data-shot]')) await el.screenshot({ path: path.join(assets, `${await el.getAttribute('data-shot')}.png`) });
        fs.writeFileSync(path.join(OUT, it.md), unitMd(it, json, prev, next));
        console.log(`${it.num} ${it.id}: unit, ${circuits.length} circuits, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
        continue;
      }
      // the right panel's content (zh with pictures, en text only)
      const d = await fig.evaluate(([j]) => window.__export.lesson(j, 'zh', true), [json]);
      await fig.waitForTimeout(1200);
      for (const el of await fig.$$('[data-shot]')) {
        const name = await el.getAttribute('data-shot');
        // a teardown layer: its picture only (its text goes into the Markdown)
        const target = name.startsWith('td-') ? ((await el.$('svg.td-fig')) ?? el) : el;
        await target.screenshot({ path: path.join(assets, `${name}.png`) });
      }
      const en = await fig.evaluate(([j]) => window.__export.lesson(j, 'en', false), [json]);
      // the bench, from the top
      await page.goto(`${BASE}?e2e#/learn/${it.id}`);
      await page.waitForFunction(() => window.__bb && window.__bb.frames > 2, null, { timeout: 60000 });
      if ((await page.locator('.view-btn').getAttribute('aria-label')).match(/斜视|Angled/)) await page.locator('.view-btn').click();
      await page.addStyleTag({ content: '.stage-top, .toolbar, .part-pop, .hole-tip, .bench-menu { display: none !important; }' });
      const board = async (layout, probe, file) => {
        await page.evaluate(
          ([l, pr]) => {
            const s = window.__bb.store;
            s.getState().loadLayout(l, false);
            s.setState({ probe: pr ?? { red: null, black: null }, selectedId: null, highlight: null });
          },
          [layout, probe],
        );
        const f0 = await page.evaluate(() => window.__bb.frames);
        await page.waitForFunction((f) => window.__bb.frames > f + 2, f0, { timeout: 4000 }).catch(() => {});
        await page.waitForTimeout(500);
        await page.locator('.stage-view').screenshot({ path: path.join(assets, file), type: 'jpeg', quality: 80 });
      };
      if (d.boards.start) await board(d.boards.start, null, 'board-start.jpg');
      for (let k = 0; k < d.boards.steps.length; k++) {
        await page.evaluate((s) => window.__bb.store.getState().setStep(s), k);
        await board(d.boards.steps[k].layout, d.boards.steps[k].probe, `board-step-${k + 1}.jpg`);
      }
      if (d.boards.solution) await board(d.boards.solution, null, 'board-solution.jpg');
      if (d.errors.length) errors.push(`${it.id}: ${d.errors.join('; ')}`);
      fs.writeFileSync(path.join(OUT, it.md), labMd(it, d, en, readings.get(it.file), prev, next));
      console.log(`${it.num} ${it.id}: ${d.nodes.length} nodes, ${d.boards.steps.length} step boards, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    }
    await browser.close();

    // the index
    const L = [
      '# 课程内容导出 / Course export',
      '',
      `生成时间：${new Date().toISOString().slice(0, 10)} · 生成命令：\`node scripts/course-export/export.cjs\` · ${items.length} 项（实验 / 课程 ${items.filter((i) => i.kind === 'challenge').length}，理论单元 ${items.filter((i) => i.kind === 'unit').length}）`,
      '',
      '按课程顺序（`course/worlds.json`）每项一个 Markdown 文件，给逐课改写教学文本的人 / AI 用。每个实验文件里：',
      '',
      '1. **左侧工作台**：3D 面包板换成俯视截图（起点、每一步之后、参考答案）+ 元件表；目标原理图。',
      '2. **右侧面板**：学生从上往下看到的全部内容（单轨流的每个节点：文字、步骤和它的自动检查、插图、拆解层、推导、测量题）。',
      '3. **测量题一览**（含参考答案的读数）、对比、提示、功能测试。',
      '4. 用到的**拆解**和**计算卡片**的全文。',
      '5. **English**：界面英文版的同一份内容。',
      '',
      '理论单元（`units/`）按“直觉 → 推导 → 仿真 → 面包板 → 回链”五层逐块列出。',
      '',
      '改写规则见 `docs/CHALLENGE_FORMAT.md` §17（轨道格式）和 `docs/RAIL_PLAN.md`；样板课：3.1 LM358、1.1 面包板、1.5 电流表。',
      '',
    ];
    for (const w of worlds) {
      const list = items.filter((i) => i.world === w);
      if (!list.length) continue;
      L.push(`## World ${w.n ?? 'UB'} · ${T(w.title)}`, '');
      L.push(
        table(
          ['编号', '标题', '类型', 'id', '文件'],
          list.map((i) => {
            const j = read(i.file);
            const title = i.kind === 'unit' ? T(j.title) : j.title;
            const type = i.kind === 'unit' ? '理论单元' : j.kind === 'lesson' ? '课程（分步）' : '实验';
            return [`${i.num}${list.filter((x) => x.num === i.num).length > 1 ? `-${i.pos}` : ''}`, `[${title}](${i.md})`, type, i.id, i.file];
          }),
        ),
        '',
      );
    }
    if (!ONLY) fs.writeFileSync(path.join(OUT, 'README.md'), L.join('\n'));
    if (errors.length) {
      console.log('\nerrors:\n' + errors.join('\n'));
      process.exitCode = 1;
    }
  } finally {
    server.kill();
  }
})();
