import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppConfigProvider } from './contexts/AppConfigContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.');
  },
  onOfflineReady() {
    console.log('PWA is ready to work offline.');
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="bizos-theme">
        <AppConfigProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppConfigProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

