/** Thrown for anything the ideal analysis engine cannot (or refuses to) compute. The message
 *  is plain English meant to be shown to a problem author. */
export class AnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalysisError';
  }
}
