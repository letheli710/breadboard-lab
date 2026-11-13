declare module 'virtual:problem-index' {
  import type { ProblemIndexEntry } from '../scripts/problem-index-plugin';
  export const entries: ProblemIndexEntry[];
  export const broken: { file: string; error: string }[];
}
