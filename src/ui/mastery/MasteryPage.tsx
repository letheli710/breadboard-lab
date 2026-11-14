// Practice pages beside the problems (a lazy chunk): mistake notebook, today's review, the
// explainer and the quiz. Which one is open is the store's `practiceView` (route
// #/practice/review[/due|/how], #/practice/quiz — see state/router.ts).

import { useEffect } from 'react';
import { useLang, type PracticeView } from '../../state/store';
import { Notebook } from './Notebook';
import { QuizPage } from './Quiz';
import { HowItWorks, ReviewSession } from './Review';
import './mastery.css';

export default function MasteryPage({ view }: { view: PracticeView }) {
  useLang();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);
  return <div className="pr-main card ms-main">{view === 'notebook' ? <Notebook /> : view === 'due' ? <ReviewSession /> : view === 'how' ? <HowItWorks /> : <QuizPage />}</div>;
}
