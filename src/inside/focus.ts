import { createContext, useContext } from 'react';

/** The part of the figure that is highlighted (hover / focus on a word, a table row, a callout or the part). */
export interface FocusState {
  focus: string | null;
  setFocus: (p: string | null) => void;
}
export const FocusCtx = createContext<FocusState>({ focus: null, setFocus: () => {} });
export const useFocusPart = () => useContext(FocusCtx);

/** does an element's data-part list contain `p`? */
export const hasPart = (list: string | null | undefined, p: string) => !!list && list.split(/\s+/).includes(p);
