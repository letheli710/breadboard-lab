#!/usr/bin/env python3
"""Build the course inventory report (HTML) from challenges/, problems/, summaries/."""
import json, glob, re, html, collections, sys, os

REPO = sys.argv[1]
OUT = sys.argv[2]
os.chdir(REPO)

def esc(s): return html.escape(str(s), quote=False)
def md(v):
    if isinstance(v, list): v = '\n'.join(v)
    s = esc(v or '')
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'\\mat\{[^}]*\}', '[矩阵]', s)
    return s.replace('\n', '<br>')
def txt(v): return '\n'.join(v) if isinstance(v, list) else (v or '')

TYPE = {'dc_source': '直流电源', 'resistor': '电阻', 'led': 'LED', 'pushbutton': '按键', 'ammeter': '电流表',
        'battery': '电池', 'bench_supply': '稳压电源', 'wire': '导线', 'potentiometer': '电位器', 'switch': '开关',
        'spdt': '单刀双掷开关', 'diode': '二极管', 'capacitor': '电容', 'inductor': '电感', 'opamp': '运放 LM358',
        'function_gen': '信号发生器', 'scope_probe': '示波器探头', 'multimeter': '万用表', 'mcu': '开发板', 'esp32_devkit': 'ESP32 开发板', 'stm32_bluepill': 'STM32 Blue Pill',
        'npn': 'NPN 三极管', 'nmos': 'N 沟道 MOSFET', 'pmos': 'P 沟道 MOSFET', 'relay': '继电器', 'buzzer': '蜂鸣器',
        'motor': '电机', 'ldr': '光敏电阻', 'ntc': 'NTC 热敏电阻', 'ldo': 'LDO 稳压器', 'power_module': '电源模块',
        'coin_cell': '纽扣电池', 'voltmeter': '电压表', 'zener': '稳压二极管', 'schottky': '肖特基二极管'}
def tname(t): return TYPE.get(t, t)

# ---------- challenges ----------
GROUPS = [
    ('g-intro', '入门课（第 1–8 课）', '认识面包板、电源、LED、电路图、串并联、按键、几种电源'),
    ('g-chal', '入门挑战（挑战 1–11）', '不给步骤，自己搭：分压、调光、选择开关、防反接、排错'),
    ('g-inst', '仪器课（第 9–16 课）', '万用表、电流表、稳压电源、信号发生器、示波器、LM358、开发板'),
    ('g-p1', '第 1 期实验（1-1 … 1-8）', 'KCL / KVL、分压分流、电桥、等效电阻、电源等效变换'),
    ('g-p2', '第 2 期实验（2-1 … 2-8）', '叠加、戴维宁、最大功率、结点法、运放四种基本电路'),
    ('g-p3', '第 3 期实验（3-1 … 3-7）', 'RC / RL / RLC 暂态，方波 + 示波器'),
    ('g-p4', '第 4 期实验（4-1 … 4-8）', '正弦稳态：滤波器、相移、谐振、有源滤波'),
    ('g-p5', '第 5 期实验（5-1 … 5-18）', '单片机外围电路：GPIO、ADC、三极管 / MOSFET 开关、电源预算'),
]
def group_of(fn, d):
    n = int(re.match(r'(\d+)', fn).group(1))
    if n <= 8: return 'g-intro'
    if n < 100: return 'g-chal'
    if n < 200: return 'g-inst'
    return 'g-p%d' % d.get('phase', 1)

CH = []
for f in sorted(glob.glob('challenges/*.json'), key=lambda p: (int(re.match(r'(\d+)', os.path.basename(p)).group(1)))):
    d = json.load(open(f)); fn = os.path.basename(f)
    d['_fn'] = fn; d['_g'] = group_of(fn, d); CH.append(d)
BYID = {d['id']: d for d in CH}

def indicators(d):
    desc = txt(d['description']); ms = d.get('measurements', []); st = d.get('steps', [])
    return {
        'steps': len(st), 'checked': sum(1 for s in st if s.get('check')),
        'predict': ('先预测' in desc) or any(m.get('predict') for m in ms),
        'think': '想一想' in desc,
        'meas': len(ms), 'meas_pred': sum(1 for m in ms if m.get('predict')),
        'meas_choice': sum(1 for m in ms if 'choices' in m), 'meas_formula': sum(1 for m in ms if 'formula' in m),
        'compare': bool(d.get('compare')),
        'real': bool(re.search(r'真实|实际项目经验|模型说明', desc)),
        'start': bool(d.get('start')), 'tests': len(d['tests']), 'multi': sum(1 for t in d['tests'] if t.get('set')),
        'hints': len(d['hints']), 'prereq': d.get('prereq') or [],
    }
for d in CH: d['_i'] = indicators(d)

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
        cond = '；改变条件：' + '、'.join(f"{k}（{'/'.join(v.keys()) if isinstance(v, dict) else v}）" for k, v in t['set'].items())
    return f"<li><b>{esc(t.get('name', ''))}</b><span class='dim'> — 判据：{esc('；'.join(kinds) or '拓扑')}{esc(cond)}</span></li>"

def check_line(c):
    if not c: return "<span class='tag off'>无自动检查</span>"
    parts = []
    for x in c:
        if 'scope' in x: parts.append('示波器旋钮 ' + '、'.join(f"{k}={v}" for k, v in x['scope'].items()))
        elif x.get('empty'): parts.append('指定孔位为空')
        else:
            p = tname(x.get('type', '?'))
            if x.get('pins'): p += ' @ ' + '–'.join(x['pins'].values())
            elif x.get('at'): p += ' @ ' + str(x['at'])
            props = [f"{k}={x[k]}" for k in x if k not in ('type', 'pins', 'at', 'props')]
            if x.get('props'): props += [f"{k}={v}" for k, v in x['props'].items()]
            if props: p += '（' + '，'.join(str(q) for q in props) + '）'
            parts.append(p)
    return "<span class='tag on'>自动检查</span> <span class='dim'>" + esc('；'.join(parts)) + '</span>'

def meas_line(m):
    if 'choices' in m: kind = '选择题'
    elif 'formula' in m: kind = f"推算（{m['formula']}）"
    elif 'scope' in m: kind = f"示波器读数 {m['scope']}"
    elif 'voltage' in m: kind = '电压读数'
    elif 'current' in m: kind = '电流读数'
    elif 'solve' in m: kind = '求解'
    else: kind = '读数'
    pre = " <span class='tag on'>先预测</span>" if m.get('predict') else ''
    ex = f"<div class='dim'>讲解：{md(m['explain'])}</div>" if m.get('explain') else ''
    ch = ''
    if 'choices' in m:
        ch = '<ol class="choices">' + ''.join(f"<li{' class=ok' if i == m.get('correct') else ''}>{md(c)}</li>" for i, c in enumerate(m['choices'])) + '</ol>'
    return f"<li><span class='tag'>{esc(kind)}</span>{pre} {md(m['ask'])}{ch}{ex}</li>"

def interactions(d):
    i = d['_i']; out = []
    types = collections.Counter(p['type'] for p in d['solution'].get('parts', []))
    out.append('放置与连线：' + '、'.join(f"{tname(t)}×{n}" for t, n in types.items()))
    sets = collections.OrderedDict()
    for t in d['tests']:
        for k, v in (t.get('set') or {}).items():
            for kk in (v.keys() if isinstance(v, dict) else ['值']): sets[f"{k}.{kk}"] = 1
    if sets: out.append('需要操作 / 测试会改变的状态：' + '、'.join(sets))
    if i['steps']: out.append(f"分步引导 {i['steps']} 步，其中 {i['checked']} 步由程序判断是否完成（高亮目标孔位）")
    if i['start']: out.append('开局已有预置电路（学生在它上面改或排错）')
    out.append(f"“检查我的电路”：{i['tests']} 组行为测试" + (f"，其中 {i['multi']} 组会切换工况" if i['multi'] else ''))
    if i['meas']: out.append(f"电路通过后进入测量题 {i['meas']} 道（先预测 {i['meas_pred']}、用自己读数推算 {i['meas_formula']}、选择 {i['meas_choice']}），期望值按学生自己搭的电路仿真")
    out.append(f"分级提示 {i['hints']} 条；可看参考答案（需确认）")
    if i['prereq']: out.append('先修课：' + '、'.join(esc(BYID[p]['title']) if p in BYID else p for p in i['prereq']))
    return out

def divergent(d):
    i = d['_i']; out = []
    desc = txt(d['description'])
    for key, label in (('先预测', '先预测再动手'), ('想一想', '想一想（开放追问）'), ('真实电路里', '真实电路里'), ('实际项目经验', '实际项目经验'),
                       ('模型说明', '模型说明（仿真的边界）'), ('仿真和真实', '仿真和真实仪器的差别'), ('接线检查清单', '通电前检查清单')):
        if key in desc: out.append(label)
    if i['compare']: out.append('做完后的计算对比')
    if i['meas_formula']: out.append('用自己的读数推导结论')
    if i['meas_choice']: out.append('“为什么”选择题')
    if i['multi'] >= 2: out.append('同一电路多种工况对照')
    if i['start'] and re.search('错|找出|修', d['summary'] + desc[:200]): out.append('排错（从错误电路出发）')
    return out

def dots(i, lesson):
    cells = [
        ('步骤检查', None if not i['steps'] else (i['checked'] >= i['steps'] - 1)),
        ('先预测', i['predict']), ('测量题', i['meas'] > 0), ('对比', i['compare']), ('真实/模型', i['real']),
        ('多工况', i['multi'] >= 1), ('提示≥3', i['hints'] >= 3), ('先修', None if lesson else bool(i['prereq'])),
    ]
    return cells

def challenge_card(d):
    i = d['_i']; lesson = d['kind'] == 'lesson'
    badges = [f"难度 {d['level']}/5", '课程' if lesson else '实验 / 挑战']
    if i['steps']: badges.append(f"{i['steps']} 步")
    badges.append(f"{i['tests']} 组测试")
    if i['meas']: badges.append(f"{i['meas']} 道测量题")
    steps = ''
    if d.get('steps'):
        steps = '<h5>步骤（学生看到的引导）</h5><ol class="steps">' + ''.join(
            f"<li>{md(s['text'])}<div>{check_line(s.get('check'))}" +
            (f" <span class='dim'>高亮孔位：{esc('、'.join(s['highlight']))}</span>" if s.get('highlight') else '') + '</div></li>' for s in d['steps']) + '</ol>'
    topo = d.get('nets') or d.get('connections') or []
    meas = ('<h5>测量题</h5><ul class="meas">' + ''.join(meas_line(m) for m in d['measurements']) + '</ul>') if d.get('measurements') else ''
    cmp_ = f"<h5>对比（答完后显示）</h5><p>{md(d['compare'])}</p>" if d.get('compare') else ''
    dv = divergent(d)
    return f"""<details class="unit" id="{esc(d['id'])}"><summary><span class="ut">{esc(d['title'])}</span><span class="bd">{''.join(f'<span class="tag">{esc(b)}</span>' for b in badges)}</span><span class="us">{esc(d['summary'])}</span></summary>
<div class="ub">
<p class="dim">文件 <code>challenges/{esc(d['_fn'])}</code> · id <code>{esc(d['id'])}</code> · 路由 <code>#/{'learn' if lesson else 'challenges'}/{esc(d['id'])}</code></p>
<h5>知识点</h5><p>{'　'.join(f'<span class="tag">{esc(c)}</span>' for c in d['concepts'])}</p>
<h5>内容（题面全文）</h5><p>{md(d['description'])}</p>
<h5>怎么做的（实现）</h5>
<ul><li>目标电路元件：{'；'.join(comp_line(c) for c in d['components'])}</li>
<li>目标拓扑：{len(topo)} 个{'结点（nets）' if d.get('nets') else '连接（connections）'}；判分按拓扑等价，不要求和参考答案摆在同样的孔位</li>
<li>参考答案布局：{len(d['solution'].get('parts', []))} 个零件（校验脚本会把它放进仿真器，必须通过本题全部测试）</li>
{'<li>预置电路：' + str(len(d['start'].get('parts', []))) + ' 个零件</li>' if d.get('start') else ''}
{'<li>判分选项：' + esc(json.dumps(d['options'], ensure_ascii=False)) + '</li>' if d.get('options') else ''}</ul>
{steps}
<h5>行为测试（“检查我的电路”时运行）</h5><ul>{''.join(test_line(t) for t in d['tests'])}</ul>
{meas}{cmp_}
<h5>允许的交互</h5><ul>{''.join(f'<li>{x}</li>' for x in interactions(d))}</ul>
<h5>拓展 / 发散思维的手段</h5><p>{'　'.join(f'<span class="tag on">{esc(x)}</span>' for x in dv) if dv else '<span class="tag off">本单元没有（只有搭建和通过测试）</span>'}</p>
<h5>提示（逐级展开）</h5><ol>{''.join(f'<li>{md(h)}</li>' for h in d['hints'])}</ol>
</div></details>"""

# ---------- theory ----------
CHAPS = []
src = open('src/core/problem/chapters.ts').read()
for m in re.finditer(r"\{ id: '([^']+)', phase: (\d), title: \(\) => tr\('([^']+)'", src):
    CHAPS.append({'id': m.group(1), 'phase': int(m.group(2)), 'title': m.group(3), 'problems': []})
CB = {c['id']: c for c in CHAPS}
for f in sorted(glob.glob('problems/*/*.json')):
    d = json.load(open(f)); d['_fn'] = f; CB[d['chapter']]['problems'].append(d)
for c in CHAPS:
    c['problems'].sort(key=lambda d: (d['level'], d['_fn']))
    p = f"summaries/{c['id']}.json"
    c['summary'] = json.load(open(p)) if os.path.exists(p) else None
TEXTBOOK = {'basics': '第 1 章', 'equivalence': '第 2 章', 'methods': '第 3 章', 'theorems': '第 4 章', 'opamp': '第 5 章', 'storage': '第 6 章',
            'first-order': '第 7 章', 'second-order': '第 7 章', 'phasors': '第 8 章', 'ac-analysis': '第 9 章', 'ac-power': '第 9 章',
            'coupled': '第 10 章', 'frequency': '第 11 章', 'three-phase': '第 12 章', 'non-sinusoidal': '第 13 章', 's-domain': '第 14 章',
            'matrix-form': '第 15 章', 'two-port': '第 16 章', 'nonlinear': '第 17 章', 'transmission-line': '第 18 章'}
AN = {'dc': '直流', 'ac': '正弦稳态', 'tran': '暂态', 'periodic': '非正弦周期'}

def lvbar(ps):
    c = collections.Counter(p['level'] for p in ps); n = len(ps)
    return '<span class="lvbar" role="img" aria-label="难度分布 ' + ' '.join(f'{k}级{c[k]}题' for k in range(1, 6)) + '">' + ''.join(
        f'<i class="l{k}" style="flex:{c[k]}" title="难度 {k}：{c[k]} 题">{c[k] if c[k] else ""}</i>' for k in range(1, 6) if c[k]) + '</span>'

def chapter_block(c):
    ps = c['problems']; s = c['summary']
    nq = sum(len(p['questions']) for p in ps); nc = sum(1 for p in ps for q in p['questions'] if 'choices' in q)
    an = collections.Counter(AN.get(p['analysis']['type'], p['analysis']['type']) for p in ps)
    rows = ''.join(
        f"<tr><td><code>{esc(p['id'])}</code></td><td>{esc(p['title'])}</td><td class='n'>{p['level']}</td><td>{esc('、'.join(p['tags']))}</td>"
        f"<td class='n'>{sum(1 for q in p['questions'] if 'choices' not in q)}</td><td class='n'>{sum(1 for q in p['questions'] if 'choices' in q)}</td>"
        f"<td class='n'>{len(p['hints'])}</td><td class='n'>{len(p['solution'])}</td></tr>" for p in ps)
    sm = ''
    if s:
        ideas = ''.join(f"<li><b>{esc(i['title'])}</b> <span class='dim'>（对应 {len(i.get('problems', []))} 题）</span></li>" for i in s['ideas'])
        mist = ''.join(f"<li>{md(m['text'])}</li>" for m in s.get('mistakes', []))
        forms = ''.join(f"<li><b>{esc(f['name'])}</b>：{md(f['expr'])}<span class='dim'> — {md(f.get('when', ''))}</span></li>" for f in s.get('formulas', []))
        sm = f"""<h5>本章要点页（<code>#/practice/summary/{c['id']}</code>）</h5><p>{md(s['intro'])}</p>
<div class="cols"><div><h6>核心思路 {len(s['ideas'])} 条</h6><ul>{ideas}</ul></div><div><h6>易错点 {len(s.get('mistakes', []))} 条（学生最可能出现的偏差）</h6><ul>{mist}</ul></div></div>
<details class="sub"><summary>公式表 {len(s.get('formulas', []))} 条 · 例题 {len(s.get('examples', []))} 道</summary><ul>{forms}</ul>
<ul>{''.join('<li>例题：' + esc(e['title']) + '</li>' for e in s.get('examples', []))}</ul></details>"""
    return f"""<details class="unit" id="ch-{c['id']}"><summary><span class="ut">{esc(c['title'])}</span><span class="bd"><span class="tag">第 {c['phase']} 期</span><span class="tag">教材{TEXTBOOK.get(c['id'], '')}</span><span class="tag">{len(ps)} 题 / {nq} 小问</span>{lvbar(ps)}</span><span class="us">分析类型：{esc('、'.join(f'{k} {v}' for k, v in an.items()))}；数值小问 {nq - nc}，选择小问 {nc}</span></summary>
<div class="ub">{sm}
<h5>题目清单</h5><div class="tw"><table><thead><tr><th>id</th><th>题目</th><th>难度</th><th>标签</th><th>数值问</th><th>选择问</th><th>提示</th><th>解答步数</th></tr></thead><tbody>{rows}</tbody></table></div>
</div></details>"""

# ---------- stats ----------
S = {}
S['units'] = len(CH); S['lessons'] = sum(1 for d in CH if d['kind'] == 'lesson'); S['labs'] = S['units'] - S['lessons']
S['problems'] = sum(len(c['problems']) for c in CHAPS); S['chapters'] = len(CHAPS)
S['subq'] = sum(len(p['questions']) for c in CHAPS for p in c['problems'])
S['choice'] = sum(1 for c in CHAPS for p in c['problems'] for q in p['questions'] if 'choices' in q)
S['steps'] = sum(d['_i']['steps'] for d in CH); S['checked'] = sum(d['_i']['checked'] for d in CH)
S['meas'] = sum(d['_i']['meas'] for d in CH); S['meas_pred'] = sum(d['_i']['meas_pred'] for d in CH)
S['meas_formula'] = sum(d['_i']['meas_formula'] for d in CH); S['meas_choice'] = sum(d['_i']['meas_choice'] for d in CH)
S['tests'] = sum(d['_i']['tests'] for d in CH); S['multi'] = sum(d['_i']['multi'] for d in CH)
S['u_pred'] = sum(1 for d in CH if d['_i']['predict']); S['u_cmp'] = sum(1 for d in CH if d['_i']['compare'])
S['u_meas'] = sum(1 for d in CH if d['_i']['meas']); S['u_real'] = sum(1 for d in CH if d['_i']['real'])
S['u_think'] = sum(1 for d in CH if d['_i']['think']); S['u_start'] = sum(1 for d in CH if d['_i']['start'])
S['u_prereq'] = sum(1 for d in CH if d['_i']['prereq'])
S['ideas'] = sum(len(c['summary']['ideas']) for c in CHAPS if c['summary'])
S['mistakes'] = sum(len(c['summary'].get('mistakes', [])) for c in CHAPS if c['summary'])
S['formulas'] = sum(len(c['summary'].get('formulas', [])) for c in CHAPS if c['summary'])
S['examples'] = sum(len(c['summary'].get('examples', [])) for c in CHAPS if c['summary'])
S['hints_p'] = sum(len(p['hints']) for c in CHAPS for p in c['problems'])
print(json.dumps(S, ensure_ascii=False))

G = collections.OrderedDict((g[0], [d for d in CH if d['_g'] == g[0]]) for g in GROUPS)
PREQ = collections.Counter(p for d in CH for p in d['_i']['prereq'])

# ---------- matrix ----------
def matrix():
    out = []
    for gid, gt, _ in GROUPS:
        rows = ''
        for d in G[gid]:
            cells = ''
            for name, v in dots(d['_i'], d['kind'] == 'lesson'):
                cls = 'na' if v is None else ('y' if v else 'n')
                cells += f'<td class="dot {cls}" title="{name}：{"不适用" if v is None else ("有" if v else "无")}"><span>{"–" if v is None else ("●" if v else "○")}</span></td>'
            rows += f'<tr><td><a href="#{esc(d["id"])}">{esc(d["title"])}</a></td><td class="n">{d["level"]}</td>{cells}</tr>'
        out.append(f'<tr class="gh"><th colspan="10">{esc(gt)}</th></tr>{rows}')
    head = ''.join(f'<th class="rot">{n}</th>' for n in ['步骤检查', '先预测', '测量题', '对比', '真实/模型', '多工况', '提示≥3', '先修'])
    return f'<div class="tw"><table class="mx"><thead><tr><th>单元</th><th>难度</th>{head}</tr></thead><tbody>{"".join(out)}</tbody></table></div>'

# ---------- learning path ----------
def est(lessons, labs, probs): return lessons * 0.25 + labs * 0.5 + probs * 0.17
def pcount(ids): return sum(len(CB[i]['problems']) for i in ids)
def chips(ids): return ''.join(f'<a class="chip th" href="#ch-{i}">{esc(CB[i]["title"])} <b>{len(CB[i]["problems"])}</b></a>' for i in ids)
def uchips(gid, sel=None):
    return ''.join(f'<a class="chip bb" href="#{esc(d["id"])}">{esc(re.sub(r"^(第 \d+ 课|挑战 \d+|实验 [\d-]+) · ", lambda m: m.group(1) + " ", d["title"]))}</a>' for d in G[gid] if sel is None or d['id'] in sel)
STAGES = [
    ('0', '上手', '不需要任何基础。目标：能把一张简单电路图搭到面包板上并点亮 LED。', uchips('g-intro'), uchips('g-chal'), '', (8, 11, 0),
     '8 节课全部做完；入门挑战至少做完“分压器”“找错”两题。'),
    ('1', '第 1 期 · 基本定律与等效', '先学三件仪器，再做理论，最后到面包板上实测验证。',
     uchips('g-inst', {'lesson-multimeter', 'lesson-ammeter', 'lesson-bench-supply'}), uchips('g-p1'), chips(['basics', 'equivalence']), (3, 8, pcount(['basics', 'equivalence'])),
     '两章各做对 ≥ 80% 的小问；实验 1-1、1-2、1-3 的测量题全部答对。'),
    ('2', '第 2 期 · 分析方法、定理、运放', '结点法 / 网孔法是后面所有章节的工具，这一期不要跳。',
     uchips('g-inst', {'lesson-lm358', 'lesson-generator-scope'}), uchips('g-p2'), chips(['methods', 'theorems', 'opamp']), (2, 8, pcount(['methods', 'theorems', 'opamp'])),
     '能不看提示独立列出结点方程；戴维宁实验里用自己的读数算出 Req。'),
    ('3', '第 3 期 · 动态电路', '第一次用到时间轴：方波激励 + 示波器。',
     uchips('g-inst', {'lesson-generator-scope'}), uchips('g-p3'), chips(['storage', 'first-order', 'second-order']), (0, 7, pcount(['storage', 'first-order', 'second-order'])),
     '三要素法的三个量能分别说出从哪张等效电路求；能从示波器读出 τ。'),
    ('4a', '第 4 期（上）· 正弦稳态', '相量法是入口；功率、耦合、三相只有理论题，没有对应的面包板实验。',
     uchips('g-inst', {'lesson-scope-two-channels'}), uchips('g-p4'), chips(['phasors', 'ac-analysis', 'ac-power', 'coupled', 'frequency', 'three-phase']),
     (1, 8, pcount(['phasors', 'ac-analysis', 'ac-power', 'coupled', 'frequency', 'three-phase'])),
     '能用双通道读出相位差并和相量计算对上；章末小测每章 ≥ 70%。'),
    ('4b', '第 4 期（下）· 进阶理论', '教材第 13–18 章，纯理论练习，按考试范围选做。', '', '', chips(['non-sinusoidal', 's-domain', 'matrix-form', 'two-port', 'nonlinear', 'transmission-line']),
     (0, 0, pcount(['non-sinusoidal', 's-domain', 'matrix-form', 'two-port', 'nonlinear', 'transmission-line'])),
     '按学校大纲取舍；每章先读要点页，再按难度 1 → 5 做。'),
    ('5', '第 5 期 · 单片机外围电路', '只依赖第 1–2 期（欧姆定律、分压、戴维宁）。想做项目的学生可以在第 2 期之后直接进入。',
     uchips('g-inst', {'lesson-mcu-gpio', 'lesson-mcu-pwm-adc'}), uchips('g-p5'), '', (2, 18, 0),
     '综合实验 5-17（NTC 温控风扇）独立完成，并能列出电源预算表。'),
]
def path():
    out = ''
    for sid, title, note, pre, labs, th, (nl, nb, npb), gate in STAGES:
        h = est(nl, nb, npb)
        cols = ''
        if pre: cols += f'<div class="pc"><h6>先上的课</h6><div class="chips">{pre}</div></div>'
        if th: cols += f'<div class="pc"><h6>理论章节（题数）</h6><div class="chips">{th}</div></div>'
        if labs: cols += f'<div class="pc"><h6>{"自主挑战" if sid == "0" else "面包板实验"}</h6><div class="chips">{labs}</div></div>'
        out += f"""<li class="stage"><div class="sn">{sid}</div><div class="sb"><h4>{esc(title)}</h4><p>{esc(note)}</p>
<p class="meta"><span>课程 {nl}</span><span>实验 / 挑战 {nb}</span><span>理论题 {npb}</span><span>估计 {h:.0f} 小时</span></p>
<div class="pcs">{cols}</div><p class="gate"><b>过关标准（建议）</b>　{esc(gate)}</p></div></li>"""
    return f'<ol class="path">{out}</ol>'

def prereq_table():
    rows = ''
    for d in G['g-inst']:
        n = PREQ.get(d['id'], 0)
        rows += f'<tr><td><a href="#{d["id"]}">{esc(d["title"])}</a></td><td class="n">{n}</td><td><span class="bar" style="width:{n * 3.2}%"></span></td></tr>'
    return f'<div class="tw"><table><thead><tr><th>仪器课</th><th>被多少个实验列为先修</th><th></th></tr></thead><tbody>{rows}</tbody></table></div>'

def phase_table():
    rows = ''
    for ph in range(1, 5):
        cs = [c for c in CHAPS if c['phase'] == ph]
        for c in cs:
            ps = c['problems']; nq = sum(len(p['questions']) for p in ps); nc = sum(1 for p in ps for q in p['questions'] if 'choices' in q)
            s = c['summary'] or {}
            rows += f"<tr><td class='n'>{ph}</td><td><a href='#ch-{c['id']}'>{esc(c['title'])}</a></td><td>{TEXTBOOK.get(c['id'], '')}</td><td class='n'>{len(ps)}</td><td>{lvbar(ps)}</td><td class='n'>{nq}</td><td class='n'>{nc * 100 // nq}%</td><td class='n'>{len(s.get('ideas', []))}</td><td class='n'>{len(s.get('mistakes', []))}</td></tr>"
    return f"<div class='tw'><table><thead><tr><th>期</th><th>章节</th><th>教材</th><th>题数</th><th>难度分布（1 → 5）</th><th>小问</th><th>选择题占比</th><th>要点</th><th>易错点</th></tr></thead><tbody>{rows}</tbody></table></div>"

NARR = open(sys.argv[3]).read()
def fill(t):
    for k, v in S.items(): t = t.replace('{{' + k + '}}', str(v))
    return t
catalog = ''.join(f'<section class="grp" id="{gid}"><h3>{esc(gt)} <span class="cnt">{len(G[gid])} 个</span></h3><p class="dim">{esc(gs)}</p>{"".join(challenge_card(d) for d in G[gid])}</section>' for gid, gt, gs in GROUPS)
theory = ''.join(chapter_block(c) for c in CHAPS)
page = fill(NARR).replace('<!--PATH-->', path()).replace('<!--PREREQ-->', prereq_table()).replace('<!--PHASES-->', phase_table()) \
    .replace('<!--MATRIX-->', matrix()).replace('<!--CATALOG-->', catalog).replace('<!--THEORY-->', theory)
open(OUT, 'w').write(page)
print(len(page))
