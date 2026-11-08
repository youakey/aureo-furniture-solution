// Shared GTM bootstrap: keep initialization before the asynchronous container load.
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
const gtmScript = document.createElement('script');
gtmScript.async = true;
gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-WPVW74DV';
document.head.appendChild(gtmScript);
