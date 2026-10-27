import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { initPwaInstallListeners, markSwUpdateAvailable } from './components/InstallPrompt';

initPwaInstallListeners();

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const hadController = Boolean(navigator.serviceWorker.controller);

    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          markSwUpdateAvailable(registration);
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              markSwUpdateAvailable(registration);
            }
          });
        });
      })
      .catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) {
        markSwUpdateAvailable();
      }
    });
  });
}

