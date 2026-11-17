import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import { ErrorBoundary } from './ui/ErrorBoundary';

// the UI font (HarmonyOS Sans, see fonts.css): a stylesheet of its own, fetched in parallel and
// never blocking the first paint
void import('./fonts.css');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary scope="app">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
