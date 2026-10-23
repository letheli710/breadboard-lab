import type { PartType } from '../core/types';

const S = { stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function PartIcon({ type, size = 34 }: { type: PartType | 'select' | 'probe'; size?: number }) {
  let g: JSX.Element;
  switch (type) {
    case 'select':
      g = <path d="M12 8 L12 30 L17 25 L21 33 L25 31 L21 23 L28 23 Z" {...S} fill="#fff" />;
      break;
    case 'probe':
      g = (
        <g {...S}>
          <rect x="9" y="6" width="22" height="28" rx="4" fill="#f2c14e" />
          <rect x="13" y="10" width="14" height="7" rx="1" fill="#dff5e3" />
          <circle cx="20" cy="26" r="4" />
        </g>
      );
      break;
    case 'wire':
      g = <path d="M6 32 C 8 8, 32 8, 34 32" {...S} stroke="#2a9d8f" strokeWidth={3.5} />;
      break;
    case 'resistor':
      g = (
        <g>
          <line x1="3" y1="20" x2="37" y2="20" {...S} stroke="#9aa0a6" />
          <rect x="11" y="14" width="18" height="12" rx="5" fill="#dcc59c" stroke="#1f2a44" strokeWidth={1.5} />
          <rect x="14" y="14" width="2.4" height="12" fill="#ec7a1c" />
          <rect x="18" y="14" width="2.4" height="12" fill="#ec7a1c" />
          <rect x="22" y="14" width="2.4" height="12" fill="#7a4a24" />
          <rect x="25.6" y="14" width="2" height="12" fill="#c9a227" />
        </g>
      );
      break;
    case 'led':
      g = (
        <g>
          <line x1="16" y1="24" x2="16" y2="37" {...S} stroke="#9aa0a6" />
          <line x1="24" y1="24" x2="24" y2="33" {...S} stroke="#9aa0a6" />
          <path d="M12 24 L12 13 A8 8 0 0 1 28 13 L28 24 Z" fill="#ff5a4f" stroke="#1f2a44" strokeWidth={1.5} />
          <rect x="10" y="23" width="20" height="3" rx="1" fill="#ff5a4f" stroke="#1f2a44" strokeWidth={1.2} />
        </g>
      );
      break;
    case 'diode':
      g = (
        <g>
          <line x1="3" y1="20" x2="37" y2="20" {...S} stroke="#9aa0a6" />
          <rect x="12" y="15" width="16" height="10" rx="3" fill="#202226" />
          <rect x="23" y="15" width="3" height="10" fill="#d7dade" />
        </g>
      );
      break;
    case 'capacitor':
      g = (
        <g>
          <line x1="16" y1="26" x2="14" y2="37" {...S} stroke="#9aa0a6" />
          <line x1="24" y1="26" x2="26" y2="37" {...S} stroke="#9aa0a6" />
          <ellipse cx="20" cy="17" rx="10" ry="10" fill="#e9a23b" stroke="#1f2a44" strokeWidth={1.5} />
        </g>
      );
      break;
    case 'pushbutton':
      g = (
        <g>
          <rect x="8" y="12" width="24" height="20" rx="2" fill="#2b2d33" />
          <circle cx="20" cy="20" r="7" fill="#e63946" stroke="#1f2a44" strokeWidth={1.5} />
        </g>
      );
      break;
    case 'switch':
      g = (
        <g>
          <rect x="5" y="15" width="30" height="13" rx="2" fill="#3d5a80" />
          <rect x="10" y="9" width="8" height="9" rx="1.5" fill="#f1f1f1" stroke="#1f2a44" strokeWidth={1.2} />
        </g>
      );
      break;
    case 'potentiometer':
      g = (
        <g>
          <rect x="7" y="9" width="26" height="24" rx="2" fill="#2b59c3" />
          <circle cx="20" cy="21" r="8" fill="#f4f1ea" stroke="#1f2a44" strokeWidth={1.5} />
          <line x1="20" y1="21" x2="15" y2="15" stroke="#1f2a44" strokeWidth={2} />
        </g>
      );
      break;
    case 'battery':
      g = (
        <g>
          <rect x="11" y="9" width="18" height="27" rx="2" fill="#26303f" />
          <rect x="11" y="25" width="18" height="11" fill="#f2b134" />
          <rect x="14" y="5" width="4" height="4" fill="#9aa0a6" />
          <rect x="22" y="5" width="4" height="4" fill="#9aa0a6" />
          <text x="20" y="21" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">
            9V
          </text>
        </g>
      );
      break;
    case 'bench_supply':
      g = (
        <g>
          <rect x="4" y="9" width="32" height="24" rx="3" fill="#e9e4d8" stroke="#1f2a44" strokeWidth={1.5} />
          <rect x="8" y="13" width="15" height="9" fill="#0f1a12" />
          <text x="15.5" y="20" textAnchor="middle" fontSize="6.5" fill="#7dff9b" fontWeight="700">
            5.00
          </text>
          <circle cx="27" cy="27" r="2.6" fill="#d62828" />
          <circle cx="33" cy="27" r="2.6" fill="#1b1b1b" />
        </g>
      );
      break;
    case 'power_module':
      g = (
        <g>
          <rect x="12" y="4" width="16" height="33" rx="2" fill="#c0392b" />
          <rect x="15" y="8" width="10" height="7" fill="#c9ccd1" />
          <rect x="15" y="22" width="10" height="7" fill="#1b1b1b" />
          <circle cx="20" cy="33" r="1.8" fill="#5cff7a" />
        </g>
      );
      break;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      {g}
    </svg>
  );
}

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const p: Record<string, JSX.Element> = {
    left: <path d="M5 12a7 7 0 1 0 2-5M5 4v4h4" {...S} />,
    right: <path d="M19 12a7 7 0 1 1-2-5M19 4v4h-4" {...S} />,
    in: <path d="M5 12h14M12 5v14" {...S} />,
    out: <path d="M5 12h14" {...S} />,
    reset: <path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" {...S} />,
    top: <path d="M4 7l8-4 8 4-8 4zM4 12l8 4 8-4M4 17l8 4 8-4" {...S} />,
    nets: <path d="M4 6h6v4H4zM14 14h6v4h-6zM7 10v6h7" {...S} />,
    label: <path d="M4 6h16v9H9l-5 4z" {...S} />,
    undo: <path d="M9 7H4V2M4 7a9 9 0 1 1-1 7" {...S} />,
    trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" {...S} />,
    check: <path d="M4 12l5 5L20 6" {...S} />,
    book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16" {...S} />,
    target: <path d="M12 3a9 9 0 1 0 .01 0M12 7a5 5 0 1 0 .01 0M12 11a1 1 0 1 0 .01 0" {...S} />,
    edit: <path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" {...S} />,
    folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...S} />,
    bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z" {...S} />,
    download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" {...S} />,
    upload: <path d="M12 20V9M7 14l5-5 5 5M5 4h14" {...S} />,
    eye: <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 .01 0" {...S} />,
    practice: <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 8.5h3M10 7v3M13 8.5h2.5M8.5 15l3-3M8.5 12l3 3M13 13h2.5M13 15h2.5" {...S} />,
    next: <path d="M9 5l7 7-7 7" {...S} />,
    prev: <path d="M15 5l-7 7 7 7" {...S} />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {p[name]}
    </svg>
  );
}
