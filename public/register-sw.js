// Service Worker Registration - Essential for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(function(error) {
        console.log('Service Worker registration failed:', error);
      });
  });
}
