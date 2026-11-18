import {
  BookmarkCheck,
  Calculator,
  Check,
  ChevronLeft,
  CircleCheck,
  Download,
  Eye,
  FlaskConical,
  Layers,
  Lock,
  Map as MapIcon,
  Minus,
  Network,
  Plus,
  Redo2,
  RotateCcw,
  RotateCw,
  Search,
  Tag,
  Trash2,
  TriangleAlert,
  Undo2,
  Upload,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { PartType } from '../core/types';
import { CORE_ICONS } from './IconCore';

const S = { stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function PartIcon({ type, size = 34 }: { type: PartType | 'select' | 'probe' | 'eraser'; size?: number }) {
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
    case 'eraser':
      g = (
        <g {...S}>
          <g transform="rotate(-35 20 20)">
            <rect x="8" y="14" width="26" height="13" rx="3" fill="#f3a6a6" />
            <rect x="8" y="14" width="9" height="13" rx="3" fill="#1f2a44" />
          </g>
          <line x1="9" y1="34" x2="31" y2="34" />
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
    case 'inductor':
      g = (
        <g>
          <line x1="16" y1="30" x2="14" y2="38" {...S} stroke="#9aa0a6" />
          <line x1="24" y1="30" x2="26" y2="38" {...S} stroke="#9aa0a6" />
          <rect x="9" y="27" width="22" height="4" rx="1.5" fill="#3b3d43" />
          <rect x="9" y="6" width="22" height="4" rx="1.5" fill="#3b3d43" />
          <rect x="12" y="10" width="16" height="17" fill="#b8743a" />
          {[12, 15, 18, 21, 24].map((y) => (
            <line key={y} x1="11.5" y1={y} x2="28.5" y2={y + 1.5} stroke="#7a4518" strokeWidth={1.2} />
          ))}
        </g>
      );
      break;
    case 'ammeter':
      g = (
        <g>
          <rect x="9" y="4" width="22" height="32" rx="4" fill="#f2c14e" stroke="#1f2a44" strokeWidth={1.5} />
          <rect x="12" y="7" width="16" height="8" rx="1" fill="#cfdcc0" stroke="#1f2a44" strokeWidth={1} />
          <text x="20" y="13.5" textAnchor="middle" fontSize="6" fill="#1d281e" fontWeight="700">
            mA
          </text>
          <circle cx="20" cy="22" r="4.5" fill="#1e2128" />
          <line x1="20" y1="22" x2="23" y2="19" stroke="#fff" strokeWidth={1.5} />
          <circle cx="15" cy="31" r="1.8" fill="#d62828" />
          <circle cx="20" cy="31" r="1.8" fill="#1b1b1b" />
        </g>
      );
      break;
    case 'opamp':
      g = (
        <g>
          {[11, 17, 23, 29].map((x) => (
            <g key={x}>
              <rect x={x - 1.3} y="4" width="2.6" height="6" fill="#9aa0a6" />
              <rect x={x - 1.3} y="30" width="2.6" height="6" fill="#9aa0a6" />
            </g>
          ))}
          <rect x="6" y="9" width="28" height="22" rx="2" fill="#1c1d21" />
          <path d="M6 16 A4 4 0 0 1 6 24" fill="#555" />
          <circle cx="10" cy="13" r="1.4" fill="#5a5c63" />
          <text x="21" y="23" textAnchor="middle" fontSize="7" fill="#d9dce2" fontWeight="700">
            358
          </text>
        </g>
      );
      break;
    case 'function_gen':
      g = (
        <g>
          <rect x="3" y="9" width="34" height="24" rx="3" fill="#3a4a5c" stroke="#1f2a44" strokeWidth={1.5} />
          <rect x="6" y="12" width="18" height="11" rx="1" fill="#0d1b2a" />
          <path d="M8 17.5 Q 10.5 12, 13 17.5 T 18 17.5 T 22 17" fill="none" stroke="#7fdbff" strokeWidth={1.6} />
          <circle cx="30" cy="18" r="3.6" fill="#23262d" stroke="#b9bec6" strokeWidth={1.2} />
          <circle cx="29" cy="28.5" r="2.2" fill="#d62828" />
          <circle cx="34" cy="28.5" r="2.2" fill="#1b1b1b" />
        </g>
      );
      break;
    case 'scope_probe':
      g = (
        <g>
          <path d="M26 4 C 26 8, 24 9, 24 11" fill="none" stroke="#2b2d33" strokeWidth={2} />
          <rect x="21" y="10" width="6" height="15" rx="2" fill="#33363e" transform="rotate(25 24 18)" />
          <rect x="21" y="11" width="6" height="3" fill="#f5d90a" transform="rotate(25 24 18)" />
          <line x1="19" y1="26" x2="15" y2="35" stroke="#c9ccd1" strokeWidth={2} strokeLinecap="round" />
          <path d="M19 25 C 10 24, 8 30, 9 35" fill="none" stroke="#1b1b1b" strokeWidth={1.6} />
          <rect x="6" y="33" width="5" height="4" rx="1" fill="#1b1b1b" />
        </g>
      );
      break;
    case 'esp32_devkit':
      g = (
        <g>
          <rect x="3" y="9" width="34" height="22" rx="1.5" fill="#17181c" />
          {[6, 10, 14, 18, 22, 26, 30, 34].map((x) => (
            <g key={x}>
              <rect x={x - 0.9} y="10" width="1.8" height="1.8" fill="#d9c27c" />
              <rect x={x - 0.9} y="28.2" width="1.8" height="1.8" fill="#d9c27c" />
            </g>
          ))}
          <rect x="1" y="13.5" width="18" height="13" rx="0.8" fill="#101113" />
          <rect x="6" y="14.5" width="12" height="11" rx="0.6" fill="#c3c7cd" />
          <path d="M2.2 15 H4.6 V17 H2.2 V19 H4.6 V21 H2.2 V23 H4.6" fill="none" stroke="#d6b15a" strokeWidth={0.9} />
          <rect x="33" y="17" width="5" height="6" rx="0.6" fill="#c3c7cd" />
          <circle cx="27" cy="16" r="1.2" fill="#ff3b30" />
        </g>
      );
      break;
    case 'stm32_bluepill':
      g = (
        <g>
          <rect x="3" y="10" width="34" height="20" rx="1.5" fill="#1c55b8" />
          {[6, 10, 14, 18, 22, 26, 30, 34].map((x) => (
            <g key={x}>
              <rect x={x - 0.9} y="11" width="1.8" height="1.8" fill="#d9c27c" />
              <rect x={x - 0.9} y="27.2" width="1.8" height="1.8" fill="#d9c27c" />
            </g>
          ))}
          <rect x="15" y="14" width="10" height="10" fill="#1c1d21" transform="rotate(45 20 19.5)" />
          <rect x="1" y="17" width="5" height="6" rx="0.6" fill="#c3c7cd" />
          <rect x="29" y="16" width="5" height="3" fill="#f2c418" />
          <rect x="29" y="20.5" width="5" height="3" fill="#f2c418" />
          <circle cx="35.5" cy="22" r="1" fill="#4ade80" />
        </g>
      );
      break;
    case 'npn':
      g = (
        <g>
          {[14, 20, 26].map((x) => (
            <line key={x} x1={x} y1="24" x2={x} y2="37" {...S} stroke="#9aa0a6" />
          ))}
          <path d="M11 25 V12 A9 9 0 0 1 29 12 V25 Z" fill="#1a1b1f" />
          <text x="20" y="21" textAnchor="middle" fontSize="6.5" fill="#c9ccd1" fontWeight="700">
            NPN
          </text>
        </g>
      );
      break;
    case 'nmos':
    case 'ldo':
      g = (
        <g>
          {[14, 20, 26].map((x) => (
            <line key={x} x1={x} y1="28" x2={x} y2="38" {...S} stroke="#9aa0a6" />
          ))}
          <rect x="9" y="2" width="22" height="12" rx="1" fill="#c9ccd1" />
          <circle cx="20" cy="8" r="3" fill="var(--paper, #fbf7ef)" />
          <rect x="9" y="12" width="22" height="17" rx="1" fill="#1a1b1f" />
          <text x="20" y="23.5" textAnchor="middle" fontSize="6.5" fill="#d9dce2" fontWeight="700">
            {type === 'ldo' ? '3V3' : 'FET'}
          </text>
        </g>
      );
      break;
    case 'relay':
      g = (
        <g>
          <rect x="5" y="8" width="30" height="24" rx="2" fill="#2457c5" />
          <rect x="10" y="14" width="7" height="12" fill="none" stroke="#eaf2ff" strokeWidth={1.3} />
          <path d="M10 26 L17 14" stroke="#eaf2ff" strokeWidth={1.1} />
          <circle cx="27" cy="27" r="1.4" fill="none" stroke="#eaf2ff" strokeWidth={1.1} />
          <circle cx="23" cy="13" r="1.4" fill="none" stroke="#eaf2ff" strokeWidth={1.1} />
          <circle cx="31" cy="13" r="1.4" fill="none" stroke="#eaf2ff" strokeWidth={1.1} />
          <line x1="27" y1="26" x2="23.5" y2="14.5" stroke="#ffd37d" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      );
      break;
    case 'motor':
      g = (
        <g>
          <rect x="4" y="11" width="24" height="18" rx="7" fill="#c8ccd2" stroke="#1f2a44" strokeWidth={1.3} />
          <rect x="4" y="11" width="6" height="18" rx="3" fill="#f1efe8" stroke="#1f2a44" strokeWidth={1.1} />
          <line x1="28" y1="20" x2="33" y2="20" stroke="#5a5f66" strokeWidth={1.6} />
          <ellipse cx="34" cy="20" rx="2" ry="9" fill="#e63946" />
          <text x="18" y="23.5" textAnchor="middle" fontSize="9" fill="#1f2a44" fontWeight="800">
            M
          </text>
        </g>
      );
      break;
    case 'buzzer':
      g = (
        <g>
          <line x1="15" y1="30" x2="15" y2="38" {...S} stroke="#9aa0a6" />
          <line x1="25" y1="30" x2="25" y2="36" {...S} stroke="#9aa0a6" />
          <ellipse cx="20" cy="30" rx="12" ry="4" fill="#111" />
          <rect x="8" y="14" width="24" height="16" fill="#18191c" />
          <ellipse cx="20" cy="14" rx="12" ry="4" fill="#2a2b30" />
          <circle cx="20" cy="14" r="1.4" fill="#000" />
          <text x="12" y="25" fontSize="8" fill="#e9ecef" fontWeight="800">
            +
          </text>
          <path d="M33 6 q3 4 0 8 M36 4 q4 6 0 12" fill="none" stroke="#f4b400" strokeWidth={1.4} strokeLinecap="round" />
        </g>
      );
      break;
    case 'ldr':
      g = (
        <g>
          <line x1="16" y1="26" x2="15" y2="38" {...S} stroke="#9aa0a6" />
          <line x1="24" y1="26" x2="25" y2="38" {...S} stroke="#9aa0a6" />
          <circle cx="20" cy="17" r="10" fill="#e38b2c" stroke="#1f2a44" strokeWidth={1.3} />
          <path d="M13 12 H27 V14.5 H13 V17 H27 V19.5 H13 V22 H27" fill="none" stroke="#8a2b10" strokeWidth={1.3} />
          <path d="M3 3 L9 8 M6.5 8.2 L9 8 L8.6 5.6" fill="none" stroke="#f4b400" strokeWidth={1.4} strokeLinecap="round" />
        </g>
      );
      break;
    case 'ntc':
      g = (
        <g>
          <line x1="18" y1="22" x2="14" y2="38" {...S} stroke="#c9a46b" />
          <line x1="22" y1="22" x2="26" y2="38" {...S} stroke="#c9a46b" />
          <ellipse cx="20" cy="16" rx="6" ry="7.5" fill="#1e3a2a" stroke="#1f2a44" strokeWidth={1.2} />
          <text x="30" y="12" fontSize="8" fill="#d64545" fontWeight="800">
            °C
          </text>
        </g>
      );
      break;
    default:
      g = <g />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      {g}
    </svg>
  );
}

// UI icons are Lucide (lucide.dev); `name` keeps the app's own short names so call sites stay
// readable. No emoji anywhere in the interface: use an icon from here instead.
const LUCIDE: Record<string, LucideIcon> = {
  ...CORE_ICONS,
  left: RotateCcw,
  right: RotateCw,
  in: Plus,
  out: Minus,
  reset: RotateCcw,
  top: Layers,
  nets: Network,
  label: Tag,
  undo: Undo2,
  redo: Redo2,
  trash: Trash2,
  check: Check,
  download: Download,
  upload: Upload,
  eye: Eye,
  prev: ChevronLeft,
  map: MapIcon,
  lock: Lock,
  alert: TriangleAlert,
  ok: CircleCheck,
  burst: Zap,
  try: FlaskConical,
  build: Wrench,
  wrap: BookmarkCheck,
  search: Search,
  layers: Layers,
  calc: Calculator,
};

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const L = LUCIDE[name];
  return L ? <L size={size} strokeWidth={2} aria-hidden focusable={false} className="icon" /> : null;
}
