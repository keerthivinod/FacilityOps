export const checkIsPWAInstalled = () => {
  if (typeof window === 'undefined') return false;

  const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const isInWebAppiOS = window.navigator && window.navigator.standalone === true;
  const isInstalled = typeof localStorage !== 'undefined' && localStorage.getItem('pwa-installed') === 'true';

  return !!(isStandalone || isInWebAppiOS || isInstalled);
};

export const checkIsInstallDismissed = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
  return localStorage.getItem('pwa-install-dismissed') === 'true';
};

export const handleInstallPrompt = async (deferredPrompt) => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    return choiceResult;
  }

  if (typeof window !== 'undefined' && window.alert) {
    window.alert('To install this app:\n\n• Chrome/Edge: Look for the install icon in the address bar\n• Samsung Internet: Tap ⋮ Menu → Add to Home screen\n• Safari (iOS): Tap Share button → Add to Home Screen');
  }
  return null;
};
