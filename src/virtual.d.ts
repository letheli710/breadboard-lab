declare module 'virtual:problem-index' {
  import type { ProblemIndexEntry } from '../scripts/problem-index-plugin';
  /** the index is a chunk of its own (see contentIndexPlugin `lazyIndex`) */
  export const loadIndex: () => Promise<{ entries: ProblemIndexEntry[]; broken: { file: string; error: string }[] }>;
  /** loaders of the full files, one per group (chunk): { [file]: json } */
  export const groups: Record<string, () => Promise<{ default: Record<string, unknown> }>>;
}

declare module 'virtual:challenge-index' {
  import type { ChallengeIndexEntry } from '../scripts/challenge-index-plugin';
  /** the index is a chunk of its own (see contentIndexPlugin `lazyIndex`) */
  export const loadIndex: () => Promise<{ entries: ChallengeIndexEntry[]; broken: { file: string; error: string }[] }>;
  /** loaders of the full files, one per group (chunk): { [file]: json } */
  export const groups: Record<string, () => Promise<{ default: Record<string, unknown> }>>;
}

declare module 'virtual:summary-index' {
  import type { SummaryIndexEntry } from '../scripts/problem-index-plugin';
  export const entries: SummaryIndexEntry[];
  export const broken: { file: string; error: string }[];
  /** loader of each chapter's summary file (one chunk per chapter): { [file]: json } */
  export const groups: Record<string, () => Promise<{ default: Record<string, unknown> }>>;
}
