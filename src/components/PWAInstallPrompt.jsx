'use client';

import { useState, useEffect } from 'react';
import { checkIsPWAInstalled, checkIsInstallDismissed, handleInstallPrompt } from '@/lib/pwa-utils';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(checkIsPWAInstalled());

    // Listen for the beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      localStorage.setItem('pwa-installed', 'true');
      setDeferredPrompt(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      // For browsers that don't support beforeinstallprompt (Safari, Samsung Internet)
      setTimeout(() => {
        if (!deferredPrompt && !isInstalled) {
          setShowInstallButton(true);
        }
      }, 2000);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    await handleInstallPrompt(deferredPrompt);
    if (deferredPrompt) {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  // Don't show if already installed
  if (isInstalled || typeof window === 'undefined') {
    return null;
  }

  // Don't show if user has dismissed it
  if (checkIsInstallDismissed()) {
    return null;
  }

  return (
    <>
      {/* Simple floating install button - appears when PWA is installable */}
      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            zIndex: 1000,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: 'white',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          title="Install FacilityOps PWA"
        >
          📱
        </button>
      )}
    </>
  );
}