import { describe, expect, it } from 'vitest';
import { lightSvg, svgWidth } from './svgTheme';

describe('lightSvg', () => {
  it('turns the dark canvas light and light text / wires dark, by role', () => {
    const dark =
      '<svg viewBox="0 0 10 10" style="background:#0f172a"><rect width="10" height="10" fill="#0f172a"/>' +
      '<line stroke="#e2e8f0" x2="5"/><text fill="#f8fafc">v<tspan fill="#38bdf8">1</tspan></text>' +
      '<circle fill="#38bdf8" stroke="#334155"/><g fill="#cbd5e1"><text>a</text></g><rect fill="#e0f2fe"/></svg>';
    const out = lightSvg(dark);
    expect(out).toContain('style="background:#fbf7ef"');
    expect(out).toContain('<rect width="10" height="10" fill="#fbf7ef"/>');
    expect(out).toContain('<line stroke="#334155" x2="5"/>');
    expect(out).toContain('<text fill="#1f2a44">v<tspan fill="#0369a1">1</tspan></text>');
    expect(out).toContain('<circle fill="#0284c7" stroke="#d6c9ae"/>');
    expect(out).toContain('<g fill="#3a4560">');
    expect(out).toContain('<rect fill="#e0f2fe"/>');
  });
  it('keeps geometry, text and unknown colours', () => {
    const s = '<svg><path d="M0 0L1 1" fill="none" stroke="#123456"/><text x="1">R<tspan>1</tspan></text></svg>';
    expect(lightSvg(s)).toBe(s);
  });
});

describe('lightSvg styles', () => {
  it('recolours a style attribute that quotes a font name', () => {
    const s = `<svg style="background:#0f172a;border-radius:12px;font-family:'Segoe UI',sans-serif;"></svg>`;
    expect(lightSvg(s)).toBe(`<svg style="background:#fbf7ef;border-radius:12px;font-family:'Segoe UI',sans-serif;"></svg>`);
  });
});

describe('lightSvg junction dots', () => {
  it('inks small white dots, keeps large white circles as fills', () => {
    const s = '<svg><circle cx="1" cy="1" r="4" fill="#f8fafc"/><circle r="20" fill="#f8fafc"/></svg>';
    expect(lightSvg(s)).toBe('<svg><circle cx="1" cy="1" r="4" fill="#1f2a44"/><circle r="20" fill="#f8fafc"/></svg>');
  });
});

describe('svgWidth', () => {
  it('reads the viewBox width, else the width attribute', () => {
    expect(svgWidth('<svg viewBox="0 0 820 300"><rect width="5"/></svg>')).toBe(820);
    expect(svgWidth('<svg width="360" height="200"></svg>')).toBe(360);
    expect(Number.isNaN(svgWidth('<svg></svg>'))).toBe(true);
  });
});
