// Which pages have portals or reverse links (from course/portals.json alone, no units): the
// lesson / lab panel, key-points pages and problems load the portal box (ui/course/Portals.tsx,
// with the units) only where there is something to show.

import raw from '../../course/portals.json';

const portals = (raw as { portals?: { from?: string; to?: string }[] }).portals ?? [];
const from = new Set(portals.map((p) => p.from ?? ''));
// a "pending:<id>" target connects automatically once a unit / lab with that id exists
const to = new Set(portals.flatMap((p) => (p.to?.startsWith('pending:') ? [`unit:${p.to.slice(8)}`, `challenge:${p.to.slice(8)}`] : [p.to ?? ''])));

export const hasPortals = (kind: string, id: string) => from.has(`${kind}:${id}`);
export const hasBacklinks = (kind: string, id: string) => to.has(`${kind}:${id}`);
