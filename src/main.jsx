import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { isTnDOSExperimentEnabled } from './tndos/feature.js';
import TnDOSGlow from './tndos/TnDOSGlow.jsx';
import 'uno.css';
import './styles.css';

const TnDOSDesktop = import.meta.env.DEV
  ? lazy(() => import('./tndos/TnDOSDesktop.jsx'))
  : null;

function RootApp() {
  const useDesktopExperiment = isTnDOSExperimentEnabled(import.meta.env.DEV, window.location.search);
  return useDesktopExperiment
    ? <Suspense fallback={<TnDOSGlow label="Starting TnDOS" />}><TnDOSDesktop /></Suspense>
    : <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
