#!/usr/bin/env python3
"""Build the course inventory report (HTML) from the course map and the content files.

Usage: python3 scripts/course-report.py <repo> <out.html> <narrative.html>

Structure comes from src/core/course.ts (Worlds -> units -> items) and courseText.ts (titles);
bench items from challenges/, theory from problems/ + summaries/, chapter order and Worlds from
src/core/problem/chapters.ts. The narrative template holds the hand-written evaluation; this
script fills in <!--MAP-->, <!--MATRIX-->, <!--CHAPTERS-->, <!--CATALOG-->, <!--THEORY-->,
<!--CHANGES--> and {{counters}}.
"""
import json, glob, re, html, collections, sys, os, subprocess

REPO, OUT, NARR_PATH = sys.argv[1], sys.argv[2], sys.argv[3]
os.chdir(REPO)
BASE = 'c11d949'  # commit of the previous report (old phase structure)


def esc(s): return html.escape(str(s), quote=False)
def txt(v): return '\n'.join(v) if isinstance(v, list) else (v or '')


def inline(s):
    """Markdown-ish inline: escape, **bold**, `code`, $math$ shown as code-styled text."""
    s = esc(s)
    s = re.sub(r'\$\$(.+?)\$\$', r'<span class="math">\1</span>', s)
    s = re.sub(r'\$(.+?)\$', r'<span class="math">\1</span>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\\mat\{[^}]*\}', '[矩阵]', s)
    return s


def md(v):
    if isinstance(v, list): v = '\n'.join(v)
    return inline(v or '').replace('\n', '<br>')


TYPE = {'dc_source': '直流电源', 'resistor': '电阻', 'led': 'LED', 'pushbutton': '按键', 'ammeter': '电流表',
        'battery': '电池', 'bench_supply': '稳压电源', 'wire': '导线', 'potentiometer': '电位器', 'switch': '开关',
        'spdt': '单刀双掷开关', 'diode': '二极管', 'capacitor': '电容', 'inductor': '电感', 'opamp': '运放 LM358',
        'function_gen': '信号发生器', 'scope_probe': '示波器探头', 'multimeter': '万用表', 'mcu': '开发板',
        'esp32_devkit': 'ESP32 开发板', 'stm32_bluepill': 'STM32 Blue Pill', 'npn': 'NPN 三极管', 'nmos': 'N 沟道 MOSFET',
        'pmos': 'P 沟道 MOSFET', 'relay': '继电器', 'buzzer': '蜂鸣器', 'motor': '电机', 'ldr': '光敏电阻',
        'ntc': 'NTC 热敏电阻', 'ldo': 'LDO 稳压器', 'power_module': '电源模块', 'coin_cell': '纽扣电池',
        'voltmeter': '电压表', 'zener': '稳压二极管', 'schottky': '肖特基二极管'}
def tname(t): return TYPE.get(t, t)


# ---------- course map (src/core/course.ts + courseText.ts) ----------
course_src = open('src/core/course.ts').read()
text_src = open('src/core/courseText.ts').read()
WORLD_T = {int(m.group(1)): (m.group(2), m.group(3)) for m in re.finditer(
    r"(\d): \{\s*title: \(\) => tr\('([^']+)'.*?blurb: \(\) =>\s*tr\(\s*'([^']+)'", text_src, re.S)}
UNIT_T = dict(re.findall(r"'(\d\.\d+)': \(\) => tr\('([^']+)'", text_src))
WORLDS = []
for wm in re.finditer(r"id: (\d),\s*books: '([^']+)',\s*units: \[(.*?)\n    \],", course_src, re.S):
    units = []
    for um in re.finditer(r"\{\s*num: '([^']+)',\s*items: \[([^\]]*)\](?:,\s*practice: \[([^\]]*)\])?", wm.group(3), re.S):
        units.append({'num': um.group(1), 'title': UNIT_T.get(um.group(1), um.group(1)),
                      'items': re.findall(r"'([^']+)'", um.group(2)),
                      'practice': re.findall(r"'([^']+)'", um.group(3) or '')})
    w = int(wm.group(1))
    WORLDS.append({'id': w, 'books': wm.group(2), 'title': WORLD_T[w][0], 'blurb': WORLD_T[w][1], 'units': units})
ARCHIVED = re.findall(r"'([^']+)'", re.search(r"ARCHIVED_CHAPTERS = \[([^\]]*)\]", course_src).group(1))

# ---------- bench items ----------
CH = {}
for f in glob.glob('challenges/*.json'):
    d = json.load(open(f)); d['_fn'] = os.path.basename(f); CH[d['id']] = d
    if 'steps' in d: d['steps'] = [s if isinstance(s, dict) else {'text': s} for s in d['steps']]  # text-only steps are plain strings
PLACE = {}
for w in WORLDS:
    for u in w['units']:
        for k, i in enumerate(u['items']): PLACE[i] = (w, u, k + 1)
unmapped = [i for i in CH if i not in PLACE]
assert not unmapped, unmapped

MISTAKE_RE = re.compile(r'放心烧|不加电阻|先插错|先接错|故意|先烧|插反|接反|夹错|先不接|错一次|错的')


def indicators(d):
    st = d.get('steps', []); ms = d.get('measurements', []); cards = d.get('cards', [])
    kinds = [c['kind'] for c in cards]
    alltext = '\n'.join(txt(c['text']) for c in cards) + '\n'.join(x.get('text', '') for x in st)
    figrefs = set(re.findall(r'fig:([\w-]+)', alltext))
    return {
        'cards': len(cards), 'four': kinds == ['try', 'explain', 'build', 'wrap'],
        'figs': len(d.get('figures', {})), 'figrefs': len(figrefs),
        'fig_unused': sorted(set(d.get('figures', {})) - figrefs), 'fig_missing': sorted(figrefs - set(d.get('figures', {}))),
        'steps': len(st), 'checked': sum(1 for s in st if s.get('check')),
        'meas': len(ms), 'meas_pred': sum(1 for m in ms if m.get('predict')),
        'meas_choice': sum(1 for m in ms if 'choices' in m), 'meas_formula': sum(1 for m in ms if 'formula' in m),
        'predict': any(m.get('predict') for m in ms),
        'compare': bool(d.get('compare')),
        'start': bool(d.get('start')), 'tests': len(d['tests']), 'multi': sum(1 for t in d['tests'] if t.get('set')),
        'hints': len(d['hints']), 'prereq': d.get('prereq') or [],
        'practice': sorted({p for c in cards for p in c.get('practice', [])}),
        'mistake': bool(MISTAKE_RE.search(cards[0]['title'] + txt(cards[0]['text']) + d['title'])) if cards else False,
        'behaviour': (d.get('options') or {}).get('grading') == 'behaviour',
        'math': '$' in alltext,
    }


for d in CH.values(): d['_i'] = indicators(d)


def label(i):
    w, u, k = PLACE[i]
    return f"{u['num']}" + (f"·{k}" if len(u['items']) > 1 else '')


def comp_line(c):
    extra = [str(c[k]) for k in ('voltage', 'resistance', 'capacitance', 'inductance', 'color', 'variant', 'board') if k in c]
    return f"{esc(c.get('ref', ''))} {tname(c['type'])}" + (f"（{esc('、'.join(extra))}）" if extra else '')


def test_line(t):
    kinds = []
    if t.get('expect'): kinds.append('元件状态 ' + '、'.join(f"{k}={v}" for k, v in t['expect'].items()))
    if t.get('voltages'): kinds.append(f"电压范围 ×{len(t['voltages'])}")
    if t.get('currents'): kinds.append(f"电流范围 ×{len(t['currents'])}")
    if t.get('scope'): kinds.append('示波器量 ' + '、'.join(sorted({s.get('measure', '?') for s in t['scope']})))
    if t.get('gpio'): kinds.append('引脚量 ' + '、'.join(sorted({s.get('measure', '?') for s in t['gpio']})))
    if t.get('regions'): kinds.append('晶体管工作区 ' + '、'.join(f"{k}={v}" for k, v in t['regions'].items()))
    cond = ''
    if t.get('set'):
        cond = '；改变条件：' + '、'.join(f"{k}（{'/'.join(map(str, v.keys())) if isinstance(v, dict) else v}）" for k, v in t['set'].items())
    return f"<li><b>{esc(t.get('name', ''))}</b><span class='dim'> — 判据：{esc('；'.join(kinds) or '拓扑')}{esc(cond)}</span></li>"


def check_line(c):
    if not c: return "<span class='tag off'>无自动检查</span>"
    parts = []
    for x in c:
        if 'scope' in x: parts.append('示波器旋钮 ' + '、'.join(f"{k}={v}" for k, v in x['scope'].items()))
        elif x.get('empty'): parts.append('指定孔位为空：' + '、'.join(x['empty']))
        else:
            p = tname(x.get('type', '?'))
            if x.get('pins'): p += ' @ ' + '–'.join(map(str, x['pins'].values()))
            elif x.get('at'): p += ' @ ' + str(x['at'])
            props = [f"{k}={x[k]}" for k in x if k not in ('type', 'pins', 'at', 'props')]
            if x.get('props'): props += [f"{k}={v}" for k, v in x['props'].items()]
            if props: p += '（' + '，'.join(str(q) for q in props) + '）'
            parts.append(p)
    return "<span class='tag on'>自动检查</span> <span class='dim'>" + esc('；'.join(parts)) + '</span>'


def meas_line(m):
    if 'choices' in m: kind = '选择题'
    elif 'formula' in m: kind = f"用读数推算（{m['formula']}）"
    elif 'scope' in m: kind = f"示波器读数 {m['scope']}"
    elif 'voltage' in m: kind = f"电压读数 {m['voltage']}" + (f" 对 {m['ref']}" if m.get('ref') else '')
    elif 'current' in m: kind = f"电流读数 {m['current']}"
    elif 'gpio' in m: kind = '引脚读数'
    else: kind = '读数'
    pre = " <span class='tag on'>先预测</span>" if m.get('predict') else ''
    cond = f" <span class='dim'>工况：{esc(json.dumps(m['set'], ensure_ascii=False))}</span>" if m.get('set') else ''
    rng = f" <span class='dim'>（参考答案板上的合格范围 {esc(m['range'])} {esc(m.get('unit', ''))}）</span>" if m.get('range') else ''
    ex = f"<div class='dim'>讲解：{md(m['explain'])}</div>" if m.get('explain') else ''
    ch = ''
    if 'choices' in m:
        ch = '<ol class="choices">' + ''.join(f"<li{' class=ok' if i == m.get('correct') else ''}>{md(c)}</li>" for i, c in enumerate(m['choices'])) + '</ol>'
    return f"<li><span class='tag'>{esc(kind)}</span>{pre} {md(m['ask'])}{cond}{rng}{ch}{ex}</li>"


def figure_block(name, f):
    cap = f.get('caption', {}); cap = cap.get('text', '') if isinstance(cap, dict) else cap
    detail = ''
    if f['kind'] == 'schematic':
        els = f.get('schematic', {}).get('elements', [])
        detail = '元件：' + '、'.join(f"{e.get('ref', '')}({e.get('type', '')}{'=' + str(e['value']) if 'value' in e else ''})" for e in els if e.get('type') not in ('W',))
        marks = f.get('schematic', {})
        extra = [k for k in ('arrows', 'marks', 'loops', 'labels', 'nodes') if marks.get(k)]
        if extra: detail += '；标注：' + '、'.join(f"{k}×{len(marks[k])}" for k in extra)
    elif f['kind'] == 'plot':
        p = f.get('plot', f)
        series = p.get('series') or p.get('curves') or []
        detail = f"曲线 {len(series)} 条" + (f"；x：{p['x'].get('label', '')}" if isinstance(p.get('x'), dict) else '') + (f"；y：{p['y'].get('label', '')}" if isinstance(p.get('y'), dict) else '')
    elif f['kind'] == 'breadboard':
        detail = f"金属条标注 {len(f.get('strips', []))} 处，元件 {len(f.get('parts', []))} 个"
    return f"<div class='fig'><span class='tag fg'>图 {esc(name)} · {esc({'schematic': '电路图', 'plot': '曲线', 'breadboard': '面包板图'}.get(f['kind'], f['kind']))}</span> {md(cap)}<div class='dim'>{esc(detail)}</div></div>"


KIND = {'try': ('🔥 试一试', 'try'), 'explain': ('💡 想明白', 'explain'), 'build': ('🛠️ 动手做', 'build'), 'wrap': ('🚀 带走', 'wrap')}


def card_text(lines, figs):
    out, ul = [], False
    for ln in (lines if isinstance(lines, list) else [lines]):
        m = re.match(r'!\[\]\(fig:([\w-]+)\)', ln.strip())
        if m:
            if ul: out.append('</ul>'); ul = False
            f = figs.get(m.group(1))
            out.append(figure_block(m.group(1), f) if f else f"<div class='fig miss'>⚠ 引用了不存在的图 fig:{esc(m.group(1))}</div>")
        elif ln.startswith('- '):
            if not ul: out.append('<ul>'); ul = True
            out.append(f'<li>{inline(ln[2:])}</li>')
        elif not ln.strip():
            if ul: out.append('</ul>'); ul = False
        else:
            if ul: out.append('</ul>'); ul = False
            out.append(f'<p>{inline(ln)}</p>')
    if ul: out.append('</ul>')
    return ''.join(out)


def cards_block(d):
    steps = list(d.get('steps', [])); pos = 0; figs = d.get('figures', {}); out = []
    for c in d.get('cards', []):
        name, cls = KIND.get(c['kind'], (c['kind'], ''))
        body = card_text(c['text'], figs)
        n = c.get('steps') or 0
        if n:
            body += '<ol class="steps" start="%d">' % (pos + 1) + ''.join(
                f"<li>{md(s['text'])}<div>{check_line(s.get('check'))}" +
                (f" <span class='dim'>高亮孔位：{esc('、'.join(s['highlight']))}</span>" if s.get('highlight') else '') + '</div></li>'
                for s in steps[pos:pos + n]) + '</ol>'
            pos += n
        if c.get('practice'): body += f"<p class='dim'>链接到理论章节：{esc('、'.join(c['practice']))}</p>"
        out.append(f"<div class='card {cls}'><div class='ck'>{name} · {esc(c['title'])}{f' <span class=dim>（含 {n} 个步骤）</span>' if n else ''}</div>{body}</div>")
    if pos < len(steps):
        out.append(f"<div class='fig miss'>⚠ 还有 {len(steps) - pos} 个步骤没有分配给任何卡片</div>")
    return ''.join(out)


def interactions(d):
    i = d['_i']; out = []
    types = collections.Counter(p['type'] for p in d['solution'].get('parts', []))
    out.append('放置与连线：' + '、'.join(f"{tname(t)}×{n}" for t, n in types.items()))
    sets = collections.OrderedDict()
    for t in d['tests']:
        for k, v in (t.get('set') or {}).items():
            for kk in (v.keys() if isinstance(v, dict) else ['值']): sets[f"{k}.{kk}"] = 1
    if sets: out.append('测试会切换的状态（学生也要亲手切换）：' + '、'.join(sets))
    if i['steps']: out.append(f"分步引导 {i['steps']} 步，其中 {i['checked']} 步由程序判断是否完成（高亮目标孔位）")
    if i['start']: out.append('开局已有预置电路（学生在它上面改或排错）')
    if i['behaviour']: out.append('<b>只看表现判分</b>：不比对连接和元件值，只跑行为测试，多种方案都能通过')
    out.append(f"「检查我的电路」：{i['tests']} 组行为测试" + (f"，其中 {i['multi']} 组会切换工况" if i['multi'] else ''))
    if i['meas']: out.append(f"电路通过后答测量题 {i['meas']} 道（先预测 {i['meas_pred']}、用读数推算 {i['meas_formula']}、选择 {i['meas_choice']}），期望值按学生自己搭的电路仿真")
    out.append(f"分级提示 {i['hints']} 条；可看参考答案（需确认）")
    if i['prereq']: out.append('先修：' + '、'.join(f"{label(p)} {esc(CH[p]['title'])}" if p in CH else esc(p) for p in i['prereq']))
    return out


def item_card(d):
    i = d['_i']; lesson = d['kind'] == 'lesson'
    badges = [label(d['id']), f"难度 {d['level']}/5", {'lesson': '课程', 'challenge': '挑战'}.get(d['kind'], d['kind'])]
    badges.append(f"{i['cards']} 张卡片"); badges.append(f"{i['figs']} 幅图")
    if i['steps']: badges.append(f"{i['steps']} 步")
    badges.append(f"{i['tests']} 组测试")
    if i['meas']: badges.append(f"{i['meas']} 道测量题")
    warn = []
    if i['fig_unused']: warn.append('定义了但卡片没引用的图：' + '、'.join(i['fig_unused']))
    if not i['four']: warn.append('卡片不是标准的 试一试 → 想明白 → 动手做 → 带走 四张')
    topo = d.get('nets') or d.get('connections') or []
    meas = ('<h5>测量题</h5><ul class="meas">' + ''.join(meas_line(m) for m in d['measurements']) + '</ul>') if d.get('measurements') else ''
    cmp_ = f"<h5>对比（答完测量题后显示）</h5><p>{md(d['compare'])}</p>" if d.get('compare') else ''
    en = (d.get('i18n') or {}).get('en', {})
    return f"""<details class="unit" id="{esc(d['id'])}"><summary><span class="ut">{esc(label(d['id']))} · {esc(d['title'])}</span><span class="bd">{''.join(f'<span class="tag">{esc(b)}</span>' for b in badges[1:])}</span><span class="us">{esc(d['summary'])}</span></summary>
<div class="ub">
<p class="dim">文件 <code>challenges/{esc(d['_fn'])}</code> · id <code>{esc(d['id'])}</code> · 路由 <code>#/{'learn' if lesson else 'challenges'}/{esc(d['id'])}</code> · 英文标题：{esc(en.get('title', '（无）'))}</p>
{''.join(f"<p class='warn'>⚠ {esc(x)}</p>" for x in warn)}
<h5>知识点</h5><p>{'　'.join(f'<span class="tag">{esc(c)}</span>' for c in d['concepts'])}</p>
<h5>概述（任务面板顶部的说明）</h5><p>{md(d['description'])}</p>
<h5>卡片（学生一次看到一张）</h5><div class="cards">{cards_block(d)}</div>
<h5>怎么做的（实现）</h5>
<ul><li>目标电路元件：{'；'.join(comp_line(c) for c in d['components'])}</li>
<li>目标拓扑：{len(topo)} 个{'结点（nets）' if d.get('nets') else '连接（connections）'}；{'本题不比对拓扑（只看表现）' if i['behaviour'] else '判分按拓扑等价，不要求和参考答案摆在同样的孔位'}</li>
<li>参考答案布局：{len(d['solution'].get('parts', []))} 个零件（校验脚本把它放进仿真器，必须通过本题全部测试，测量题读数必须落在范围内）</li>
{'<li>预置电路：' + str(len(d['start'].get('parts', []))) + ' 个零件</li>' if d.get('start') else ''}
{'<li>判分选项：' + esc(json.dumps(d['options'], ensure_ascii=False)) + '</li>' if d.get('options') else ''}</ul>
<h5>行为测试（「检查我的电路」时运行）</h5><ul>{''.join(test_line(t) for t in d['tests'])}</ul>
{meas}{cmp_}
<h5>允许的交互</h5><ul>{''.join(f'<li>{x}</li>' for x in interactions(d))}</ul>
<h5>提示（逐级展开）</h5><ol>{''.join(f'<li>{md(h)}</li>' for h in d['hints'])}</ol>
</div></details>"""


# ---------- theory ----------
chap_src = open('src/core/problem/chapters.ts').read()
CHAPS = []
for m in re.finditer(r"\{ id: '([^']+)', world: (\d)(?:, sadiku: '([^']+)')?, title: \(\) => tr\('([^']+)'", chap_src):
    CHAPS.append({'id': m.group(1), 'world': int(m.group(2)), 'sadiku': m.group(3) or '', 'title': m.group(4), 'problems': []})
CB = {c['id']: c for c in CHAPS}
for f in sorted(glob.glob('problems/*/*.json')):
    d = json.load(open(f)); d['_fn'] = f; CB[d['chapter']]['problems'].append(d)
for c in CHAPS:
    c['problems'].sort(key=lambda d: (d['level'], d['_fn']))
    p = f"summaries/{c['id']}.json"
    c['summary'] = json.load(open(p)) if os.path.exists(p) else None
# which units link each chapter
CH_UNITS = collections.defaultdict(list)
for w in WORLDS:
    for u in w['units']:
        for p in u['practice']: CH_UNITS[p].append(u['num'])
# polish status per docs/REBUILD_PLAN.md §6 "全局" (hand-maintained: the plan is the source)
POLISHED = {'nonlinear', 'phasors', 'ac-analysis', 'ac-power', 'three-phase', 'coupled', 'frequency', 's-domain', 'non-sinusoidal', 'two-port'}
AN = {'dc': '直流', 'ac': '正弦稳态', 'tran': '暂态', 'periodic': '非正弦周期'}
WNAME = {w['id']: f"World {w['id']}" for w in WORLDS}; WNAME[6] = '选学'


def lvbar(ps):
    c = collections.Counter(p['level'] for p in ps)
    return '<span class="lvbar" role="img" aria-label="难度分布 ' + ' '.join(f'{k}级{c[k]}题' for k in range(1, 6)) + '">' + ''.join(
        f'<i class="l{k}" style="flex:{c[k]}" title="难度 {k}：{c[k]} 题">{c[k]}</i>' for k in range(1, 6) if c[k]) + '</span>'


def problem_row(p):
    def qline(q):
        ch = ''
        if 'choices' in q:
            ex = q.get('choiceExplain') or []
            ch = '<ol class="choices">' + ''.join(f"<li{' class=ok' if k == q.get('correct') else ''}>{md(c)}" + (f"<div class='dim'>{md(ex[k])}</div>" if k < len(ex) and ex[k] else '') + '</li>' for k, c in enumerate(q['choices'])) + '</ol>'
        return f"<li>{md(q.get('ask', q.get('id', '')))}{' <span class=tag>选择</span>' if 'choices' in q else ''}{ch}</li>"
    qs = ''.join(qline(q) for q in p['questions'])
    return (f"<tr><td><code>{esc(os.path.basename(p['_fn']))}</code></td><td><b>{esc(p['title'])}</b><details class='sub'><summary>题面与小问</summary><p>{md(p.get('statement', ''))}</p><ol>{qs}</ol></details></td>"
            f"<td class='n'>{p['level']}</td><td>{esc('、'.join(p.get('tags', [])))}</td>"
            f"<td class='n'>{sum(1 for q in p['questions'] if 'choices' not in q)}</td><td class='n'>{sum(1 for q in p['questions'] if 'choices' in q)}</td>"
            f"<td class='n'>{len(p['hints'])}</td><td class='n'>{len(p['solution'])}</td></tr>")


def chapter_block(c):
    ps = c['problems']; s = c['summary']
    nq = sum(len(p['questions']) for p in ps); nc = sum(1 for p in ps for q in p['questions'] if 'choices' in q)
    an = collections.Counter(AN.get(p['analysis']['type'], p['analysis']['type']) for p in ps)
    rows = ''.join(problem_row(p) for p in ps)
    sm = ''
    if s:
        ideas = ''.join(f"<li><b>{esc(i['title'])}</b> <span class='dim'>（对应 {len(i.get('problems', []))} 题）</span><div class='dim'>{md(i.get('text', ''))}</div></li>" for i in s['ideas'])
        mist = ''.join(f"<li>{md(m['text'])}</li>" for m in s.get('mistakes', []))
        forms = ''.join(f"<li><b>{esc(f['name'])}</b>：{md(f['expr'])}<span class='dim'> — {md(f.get('when', ''))}</span></li>" for f in s.get('formulas', []))
        sm = f"""<h5>本章要点页（<code>#/practice/summary/{c['id']}</code>）</h5><p>{md(s['intro'])}</p>
<div class="cols"><div><h6>核心思路 {len(s['ideas'])} 条</h6><ul>{ideas}</ul></div><div><h6>易错点 {len(s.get('mistakes', []))} 条</h6><ul>{mist}</ul></div></div>
<details class="sub"><summary>公式表 {len(s.get('formulas', []))} 条 · 例题 {len(s.get('examples', []))} 道</summary><ul>{forms}</ul>
<ul>{''.join('<li>例题：' + esc(e['title']) + '</li>' for e in s.get('examples', []))}</ul></details>"""
    pol = '<span class="tag on">已按新规范润色</span>' if c['id'] in POLISHED else '<span class="tag off">还没按新规范润色</span>'
    units = '、'.join(CH_UNITS.get(c['id'], [])) or ('选学（不在主线）' if c['id'] in ARCHIVED else '—')
    return f"""<details class="unit" id="ch-{c['id']}"><summary><span class="ut">{esc(c['title'])} <code class="dim">{c['id']}</code></span><span class="bd"><span class="tag">{WNAME[c['world']]}</span>{f'<span class="tag">Sadiku 第 {esc(c["sadiku"])} 章</span>' if c['sadiku'] else ''}<span class="tag">{len(ps)} 题 / {nq} 小问</span>{pol}{lvbar(ps)}</span><span class="us">课程单元链接：{esc(units)}；分析类型：{esc('、'.join(f'{k} {v}' for k, v in an.items()))}；数值小问 {nq - nc}，选择小问 {nc}</span></summary>
<div class="ub">{sm}
<h5>题目清单（点题目看题面和小问）</h5><div class="tw"><table><thead><tr><th>文件</th><th>题目</th><th>难度</th><th>标签</th><th>数值问</th><th>选择问</th><th>提示</th><th>解答步数</th></tr></thead><tbody>{rows}</tbody></table></div>
</div></details>"""


# ---------- stats ----------
ITEMS = list(CH.values())
S = {}
S['items'] = len(ITEMS); S['lessons'] = sum(1 for d in ITEMS if d['kind'] == 'lesson'); S['labs'] = S['items'] - S['lessons']
S['units'] = sum(len(w['units']) for w in WORLDS); S['worlds'] = len(WORLDS)
S['cards'] = sum(d['_i']['cards'] for d in ITEMS); S['four'] = sum(1 for d in ITEMS if d['_i']['four'])
S['figs'] = sum(d['_i']['figs'] for d in ITEMS); S['u_figs'] = sum(1 for d in ITEMS if d['_i']['figs'])
S['fig_sch'] = sum(1 for d in ITEMS for f in d.get('figures', {}).values() if f['kind'] == 'schematic')
S['fig_plot'] = sum(1 for d in ITEMS for f in d.get('figures', {}).values() if f['kind'] == 'plot')
S['fig_bb'] = sum(1 for d in ITEMS for f in d.get('figures', {}).values() if f['kind'] == 'breadboard')
S['fig_unused'] = sum(len(d['_i']['fig_unused']) for d in ITEMS)
S['problems'] = sum(len(c['problems']) for c in CHAPS); S['chapters'] = len(CHAPS)
S['subq'] = sum(len(p['questions']) for c in CHAPS for p in c['problems'])
S['choice'] = sum(1 for c in CHAPS for p in c['problems'] for q in p['questions'] if 'choices' in q)
S['numq'] = S['subq'] - S['choice']
S['steps'] = sum(d['_i']['steps'] for d in ITEMS); S['checked'] = sum(d['_i']['checked'] for d in ITEMS)
S['u_steps'] = sum(1 for d in ITEMS if d['_i']['steps'])
S['meas'] = sum(d['_i']['meas'] for d in ITEMS); S['meas_pred'] = sum(d['_i']['meas_pred'] for d in ITEMS)
S['meas_formula'] = sum(d['_i']['meas_formula'] for d in ITEMS); S['meas_choice'] = sum(d['_i']['meas_choice'] for d in ITEMS)
S['u_meas'] = sum(1 for d in ITEMS if d['_i']['meas']); S['u_nomeas'] = S['items'] - S['u_meas']
S['tests'] = sum(d['_i']['tests'] for d in ITEMS); S['multi'] = sum(d['_i']['multi'] for d in ITEMS)
S['u_pred'] = sum(1 for d in ITEMS if d['_i']['predict']); S['u_cmp'] = sum(1 for d in ITEMS if d['_i']['compare'])
S['u_start'] = sum(1 for d in ITEMS if d['_i']['start']); S['u_prereq'] = sum(1 for d in ITEMS if d['_i']['prereq'])
S['u_mistake'] = sum(1 for d in ITEMS if d['_i']['mistake']); S['u_behaviour'] = sum(1 for d in ITEMS if d['_i']['behaviour'])
S['u_practice'] = sum(1 for d in ITEMS if d['_i']['practice']); S['u_math'] = sum(1 for d in ITEMS if d['_i']['math'])
S['ideas'] = sum(len(c['summary']['ideas']) for c in CHAPS if c['summary'])
S['mistakes'] = sum(len(c['summary'].get('mistakes', [])) for c in CHAPS if c['summary'])
S['formulas'] = sum(len(c['summary'].get('formulas', [])) for c in CHAPS if c['summary'])
S['hints_p'] = sum(len(p['hints']) for c in CHAPS for p in c['problems'])
S['polished_ch'] = sum(1 for c in CHAPS if c['id'] in POLISHED)
S['polished_p'] = sum(len(c['problems']) for c in CHAPS if c['id'] in POLISHED)
S['unpolished_p'] = S['problems'] - S['polished_p'] - sum(len(CB[a]['problems']) for a in ARCHIVED)
S['head'] = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
S['date'] = subprocess.run(['git', 'log', '-1', '--format=%cd', '--date=short'], capture_output=True, text=True).stdout.strip()
print(json.dumps(S, ensure_ascii=False))


# ---------- course map ----------
def est(d): return 0.25 if d['kind'] == 'lesson' else 0.5
def course_map():
    out = ''
    for w in WORLDS:
        rows = ''
        hrs = 0; nprob = 0; seen = set()
        for u in w['units']:
            items = '<br>'.join(f"<a href='#{esc(i)}'>{esc(label(i))} {esc(CH[i]['title'])}</a> <span class='dim'>{esc(CH[i]['_fn'][:3].rstrip('-'))}</span>" for i in u['items'])
            th = ' '.join(f"<a class='chip th' href='#ch-{p}'>{esc(CB[p]['title'])}</a>" for p in u['practice'])
            rows += f"<tr><td class='n'><b>{u['num']}</b></td><td>{esc(u['title'])}</td><td>{items}</td><td>{th}</td></tr>"
            hrs += sum(est(CH[i]) for i in u['items'])
            for p in u['practice']:
                if p not in seen: seen.add(p); nprob += len(CB[p]['problems'])
        n_items = sum(len(u['items']) for u in w['units'])
        out += f"""<section class="world" id="w{w['id']}"><h3>World {w['id']} · {esc(w['title'])} <span class="cnt">{len(w['units'])} 个单元 · {n_items} 个面包板文件 · 对应教材 {esc(w['books'])}</span></h3>
<p>{esc(w['blurb'])}</p><p class="meta"><span>面包板约 {hrs:.0f} 小时</span><span>理论题 {nprob} 道（约 {nprob * 10 / 60:.0f} 小时）</span></p>
<div class="tw"><table><thead><tr><th>单元</th><th>标题</th><th>按顺序做的面包板文件</th><th>配套理论章节</th></tr></thead><tbody>{rows}</tbody></table></div></section>"""
    el = ' '.join(f"<a class='chip th' href='#ch-{a}'>{esc(CB[a]['title'])} <b>{len(CB[a]['problems'])}</b></a>" for a in ARCHIVED)
    return out + f"<p><b>选学</b>（不在主线，练习页最下面）：{el}</p>"


# ---------- matrix ----------
COLS = [('四张卡', lambda i, d: i['four']), ('配图', lambda i, d: i['figs'] > 0),
        ('步骤检查', lambda i, d: None if not i['steps'] else i['checked'] >= i['steps'] - 1),
        ('先犯错', lambda i, d: i['mistake']), ('先预测', lambda i, d: i['predict']), ('测量题', lambda i, d: i['meas'] > 0),
        ('推算', lambda i, d: i['meas_formula'] > 0), ('为什么', lambda i, d: i['meas_choice'] > 0),
        ('对比', lambda i, d: i['compare']), ('多工况', lambda i, d: i['multi'] >= 1), ('提示≥3', lambda i, d: i['hints'] >= 3),
        ('链理论', lambda i, d: bool(i['practice']))]


def matrix():
    out = []
    for w in WORLDS:
        rows = ''
        for u in w['units']:
            for iid in u['items']:
                d = CH[iid]; cells = ''
                for name, fn in COLS:
                    v = fn(d['_i'], d)
                    cls = 'na' if v is None else ('y' if v else 'n')
                    cells += f'<td class="dot {cls}" title="{name}：{"不适用" if v is None else ("有" if v else "无")}"><span>{"–" if v is None else ("●" if v else "○")}</span></td>'
                rows += f'<tr><td><a href="#{esc(iid)}">{esc(label(iid))} {esc(d["title"])}</a></td><td class="n">{d["level"]}</td>{cells}</tr>'
        out.append(f'<tr class="gh"><th colspan="{len(COLS) + 2}">World {w["id"]} · {esc(w["title"])}</th></tr>{rows}')
    head = ''.join(f'<th class="rot">{n}</th>' for n, _ in COLS)
    return f'<div class="tw"><table class="mx"><thead><tr><th>单元 · 文件</th><th>难度</th>{head}</tr></thead><tbody>{"".join(out)}</tbody></table></div>'


def chapter_table():
    rows = ''
    for c in CHAPS:
        ps = c['problems']; nq = sum(len(p['questions']) for p in ps); nc = sum(1 for p in ps for q in p['questions'] if 'choices' in q)
        s = c['summary'] or {}
        pol = '✔' if c['id'] in POLISHED else '—'
        rows += (f"<tr><td>{WNAME[c['world']]}</td><td><a href='#ch-{c['id']}'>{esc(c['title'])}</a></td><td>{esc(c['sadiku'])}</td>"
                 f"<td>{esc('、'.join(CH_UNITS.get(c['id'], [])) or '—')}</td><td class='n'>{len(ps)}</td><td>{lvbar(ps)}</td><td class='n'>{nq}</td>"
                 f"<td class='n'>{nc * 100 // max(nq, 1)}%</td><td class='n'>{len(s.get('ideas', []))}</td><td class='n'>{len(s.get('mistakes', []))}</td><td class='n'>{pol}</td></tr>")
    return ("<div class='tw'><table><thead><tr><th>World</th><th>章节</th><th>Sadiku</th><th>链接单元</th><th>题数</th><th>难度分布（1 → 5）</th>"
            f"<th>小问</th><th>选择题占比</th><th>要点</th><th>易错点</th><th>已润色</th></tr></thead><tbody>{rows}</tbody></table></div>")



# ---------- this round's rebuild: Worlds, units, portals (course/*.json, units/*.json) ----------
WJ = json.load(open('course/worlds.json')); WJ['pending'] = json.load(open('course/pending.json'))['pending']; PJ = json.load(open('course/portals.json'))
UNITS = {}
for f in sorted(glob.glob('units/*.json')):
    u = json.load(open(f)); u['_fn'] = f; UNITS[u['id']] = u
PEND = {p['id']: p for p in WJ['pending']}
PROBS = {d['id']: d for c in CHAPS for d in c['problems']}
WORLD_OF = {}
for w in WJ['worlds']:
    for sec in w['sections']:
        for it in sec['items']: WORLD_OF[it] = w
def zh(t): return '\n'.join(t['zh']) if isinstance(t.get('zh'), list) else t.get('zh', '')
def wlabel(w): return f"World {w['n']}" if 'n' in w else 'UB 衔接区'
def ref_title(r):
    k, i = r.split(':', 1)
    if k == 'pending':
        if i in UNITS: k = 'unit'
        elif i in BYID: k = 'challenge'
        else: return zh(PEND[i]['title']) if i in PEND else i
    if k == 'challenge': return BYID[i]['title'] if i in BYID else i
    if k == 'chapter': return '理论 · ' + (CB[i]['title'] if i in CB else i)
    if k == 'problem': return '理论题 · ' + (PROBS[i]['title'] if i in PROBS else i)
    if k == 'unit': u = UNITS.get(i); return (f"{u.get('code', '')} · {zh(u['title'])}" if u else i)
    return r
def ref_live(r):
    k, i = r.split(':', 1)
    return k != 'pending' or i in UNITS or i in BYID

OLD_PHASE = {1: '第 1 期', 2: '第 2 期', 3: '第 3 期', 4: '第 4 期'}
def old_group(item):
    k, i = item.split(':', 1)
    if k == 'challenge':
        if i not in BYID: return '—'
        d = BYID[i]
        if d['_fn'][:3] in ('229', '248', '260'): return '<span class="tag on">本轮新增</span>'
        return next(g[1] for g in GROUPS if g[0] == d['_g']).split('（')[0]
    if k == 'chapter': return OLD_PHASE.get(CB[i]['phase'], '—') + '（理论）' if i in CB else '—'
    return '<span class="tag on">本轮新增</span>'

def worlds_table():
    rows = []
    for w in WJ['worlds']:
        items = [it for sec in w['sections'] for it in sec['items']]
        groups = collections.OrderedDict()
        for it in items: groups.setdefault(re.sub('<[^>]+>', '', old_group(it)), []).append(it)
        src = '；'.join(f"{esc(g)}：{len(v)}" for g, v in groups.items())
        lst = '、'.join(esc(ref_title(it)) for it in items)
        meta = esc(zh(w['course'])) + (f" · {esc(zh(w['textbook']))}" if 'textbook' in w else '')
        here = ' 📍' if w.get('current') else ''
        rows.append(f"<tr><td><b>{wlabel(w)}</b>{here}<br>{esc(zh(w['title']))}<div class='dim'>{meta}</div></td><td class='n'>{len(items)}</td><td>{src}</td><td class='dim'>{lst}</td></tr>")
    return ("<div class='tw'><table><thead><tr><th>World</th><th>条目</th><th>原来在哪</th><th>内容</th></tr></thead><tbody>"
            + ''.join(rows) + '</tbody></table></div>')

def portals_table():
    rows = []
    for p in PJ['portals']:
        live = ref_live(p['to'])
        st = "<span class='tag on'>已接通</span>" if live else "<span class='tag off'>占位（即将上线）</span>"
        rows.append(f"<tr><td><code>{esc(p['id'])}</code></td><td>{esc(ref_title(p['from']))}</td><td>{esc(ref_title(p['to']))}</td><td>{st}</td><td class='n'>{p['minutes']}</td><td class='dim'>{esc(zh(p['what']))}</td></tr>")
    n_live = sum(1 for p in PJ['portals'] if ref_live(p['to']))
    return (f"<p>{len(PJ['portals'])} 个传送门：{n_live} 个已接通，{len(PJ['portals']) - n_live} 个是占位。占位的目标都登记在 <code>docs/REBUILD_PLAN.md</code>，建好同 id 的单元后自动接通。</p>"
            "<div class='tw'><table><thead><tr><th>id</th><th>来源</th><th>目标</th><th>状态</th><th>分钟</th><th>门后讲什么</th></tr></thead><tbody>"
            + ''.join(rows) + '</tbody></table></div>')

def units_table():
    rows = []
    for u in UNITS.values():
        bl = collections.Counter(b['type'] for l in u['layers'] for b in l['blocks'])
        layers = ' → '.join({'intuition': '直觉', 'derive': '推导', 'sim': '仿真', 'bench': '面包板', 'connect': '回链'}[l['layer']] for l in u['layers'])
        probs = [i for l in u['layers'] for b in l['blocks'] if b['type'] == 'problems' for i in b['ids']]
        rows.append(f"<tr><td><code>{esc(u['id'])}</code></td><td>{esc(u.get('code', ''))} · {esc(zh(u['title']))}<div class='dim'>{esc(zh(u['question']))}</div></td><td class='n'>{u['minutes']}</td><td>{layers}</td><td class='dim'>{esc('、'.join(f'{k}×{v}' for k, v in bl.items()))}</td><td class='n'>{len(probs)}</td></tr>")
    return ("<div class='tw'><table><thead><tr><th>id</th><th>单元 · 回答的问题</th><th>分钟</th><th>层</th><th>block</th><th>挂的理论题</th></tr></thead><tbody>"
            + ''.join(rows) + '</tbody></table></div>')

NARR = open(sys.argv[3]).read()
def fill(t):
    for k, v in S.items(): t = t.replace('{{' + k + '}}', str(v))
    return t
catalog = ''.join(f'<section class="grp" id="{gid}"><h3>{esc(gt)} <span class="cnt">{len(G[gid])} 个</span></h3><p class="dim">{esc(gs)}</p>{"".join(challenge_card(d) for d in G[gid])}</section>' for gid, gt, gs in GROUPS)
theory = ''.join(chapter_block(c) for c in CHAPS)
page = fill(NARR).replace('<!--PATH-->', path()).replace('<!--PREREQ-->', prereq_table()).replace('<!--PHASES-->', phase_table()) \
    .replace('<!--MATRIX-->', matrix()).replace('<!--CATALOG-->', catalog).replace('<!--THEORY-->', theory) \
    .replace('<!--WORLDS-->', worlds_table()).replace('<!--PORTALS-->', portals_table()).replace('<!--UNITS-->', units_table())
open(OUT, 'w').write(page)
print(len(page))
