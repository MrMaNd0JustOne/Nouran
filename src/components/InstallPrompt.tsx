import React, { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let appInstalledFlag = false;
let listenersInitialized = false;
const promptSubscribers = new Set<() => void>();

let swUpdateAvailableFlag = false;
let swRegistrationRef: ServiceWorkerRegistration | null = null;
const swSubscribers = new Set<() => void>();

function notifyPromptSubscribers() {
  promptSubscribers.forEach((cb) => cb());
}

function notifySwSubscribers() {
  swSubscribers.forEach((cb) => cb());
}

export function initPwaInstallListeners(): void {
  if (typeof window === 'undefined' || listenersInitialized) return;
  listenersInitialized = true;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    notifyPromptSubscribers();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    appInstalledFlag = true;
    notifyPromptSubscribers();
  });
}

export function markSwUpdateAvailable(registration?: ServiceWorkerRegistration): void {
  if (registration) {
    swRegistrationRef = registration;
  }
  if (!swUpdateAvailableFlag) {
    swUpdateAvailableFlag = true;
    notifySwSubscribers();
  }
}

export function useSwUpdate(): { updateAvailable: boolean; applyUpdate: () => void } {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(swUpdateAvailableFlag);

  useEffect(() => {
    const sync = () => setUpdateAvailable(swUpdateAvailableFlag);
    swSubscribers.add(sync);
    sync();
    return () => {
      swSubscribers.delete(sync);
    };
  }, []);

  const applyUpdate = () => {
    if (swRegistrationRef?.waiting) {
      swRegistrationRef.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  return { updateAvailable, applyUpdate };
}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function checkIsIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  );
}

export const InstallPrompt: React.FC = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    deferredInstallPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(
    () => appInstalledFlag || checkIsStandalone()
  );
  const [isIOS] = useState<boolean>(() => checkIsIOS());

  useEffect(() => {
    initPwaInstallListeners();

    const sync = () => {
      setPromptEvent(deferredInstallPrompt);
      setIsInstalled(appInstalledFlag || checkIsStandalone());
    };

    promptSubscribers.add(sync);
    sync();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = () => sync();
    mediaQuery.addEventListener?.('change', handleMediaChange);

    return () => {
      promptSubscribers.delete(sync);
      mediaQuery.removeEventListener?.('change', handleMediaChange);
    };
  }, []);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!promptEvent) return;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      deferredInstallPrompt = null;
      if (choice.outcome === 'accepted') {
        appInstalledFlag = true;
      }
      notifyPromptSubscribers();
    } catch {
      deferredInstallPrompt = null;
      notifyPromptSubscribers();
    }
  };

  if (promptEvent) {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between gap-3">
        <div className="text-xs">
          <p className="font-bold text-emerald-950 dark:text-emerald-100">تثبيت تطبيق نوران</p>
          <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
            ثبّت التطبيق للوصول السريع والعمل بدون إنترنت
          </p>
        </div>
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت التطبيق</span>
        </button>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2.5 text-xs text-emerald-950 dark:text-emerald-100">
        <Share className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span className="font-semibold">اضغط مشاركة ثم إضافة إلى الشاشة الرئيسية</span>
      </div>
    );
  }

  return null;
};
