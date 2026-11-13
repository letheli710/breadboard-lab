declare module 'virtual:problem-index' {
  import type { ProblemIndexEntry } from '../scripts/problem-index-plugin';
  export const entries: ProblemIndexEntry[];
  export const broken: { file: string; error: string }[];
  /** loaders of the full files, one per group (chunk): { [file]: json } */
  export const groups: Record<string, () => Promise<{ default: Record<string, unknown> }>>;
}

declare module 'virtual:challenge-index' {
  import type { ChallengeIndexEntry } from '../scripts/challenge-index-plugin';
  export const entries: ChallengeIndexEntry[];
  export const broken: { file: string; error: string }[];
  /** loaders of the full files, one per group (chunk): { [file]: json } */
  export const groups: Record<string, () => Promise<{ default: Record<string, unknown> }>>;
}
