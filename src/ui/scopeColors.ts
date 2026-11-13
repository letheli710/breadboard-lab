// Oscilloscope channel colours — shared by the 3D scope, the scope panel and the inspector.
// Kept out of three/common so 2D-only code (the side panel, the Import page) does not pull in three.js.
export const CH_COLORS: Record<1 | 2, string> = { 1: '#f5d90a', 2: '#22d3ee' };
