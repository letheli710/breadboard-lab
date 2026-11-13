import React from 'react';
import ReactDOM from 'react-dom/client';
// latin subset only: the UI text is Chinese (system CJK font) and English; the other subsets
// (latin-ext, vietnamese) are never needed and only bloat the build
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import './styles.css';
import App from './App';
import { ErrorBoundary } from './ui/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary scope="app">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
