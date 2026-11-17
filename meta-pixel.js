// Keep this file identical to kitchen-dna/public/meta-pixel.js.
(() => {
  if (window.aureoMetaPixel) return;
  const PIXEL_ID = '2214716746140654';
  const PENDING_KEY = 'aureo:pending-meta-lead';
  const SENT_KEY = 'aureo:last-meta-lead';
  const sent = new Set();

  // Standard Meta queue: events wait here while the SDK loads asynchronously.
  if (!window.fbq) {
    const fbq = window.fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  window.fbq('init', PIXEL_ID);
  // Only explicit events; do not infer extra leads from button clicks.
  window.fbq('set', 'autoConfig', false, PIXEL_ID);
  window.fbq('trackSingle', PIXEL_ID, 'PageView');

  function trackLead(eventID) {
    try {
      if (sent.has(eventID)) return;
      try {
        if (window.sessionStorage.getItem(SENT_KEY) === eventID) return;
      } catch { /* Storage can be disabled; in-memory deduplication still works. */ }
      window.fbq('trackSingle', PIXEL_ID, 'Lead', {}, { eventID });
      sent.add(eventID);
      try { window.sessionStorage.setItem(SENT_KEY, eventID); } catch { /* Optional. */ }
    } catch { /* Analytics must never turn a delivered lead into a form error. */ }
  }

  function redirectAfterLead() {
    const eventID = window.crypto?.randomUUID?.() || `lead-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      window.sessionStorage.setItem(PENDING_KEY, JSON.stringify({ eventID, at: Date.now() }));
    } catch {
      // Without storage, dispatch here and give the request time before navigation.
      trackLead(eventID);
      window.setTimeout(() => window.location.assign('/thank-you.html'), 500);
      return;
    }
    // Dispatch on the next page so navigation cannot discard a queued event.
    window.location.assign('/thank-you.html');
  }

  window.aureoMetaPixel = { trackLead, redirectAfterLead };

  if (window.location.pathname === '/thank-you.html') {
    try {
      const pending = JSON.parse(window.sessionStorage.getItem(PENDING_KEY) || 'null');
      window.sessionStorage.removeItem(PENDING_KEY);
      if (pending && typeof pending.eventID === 'string' &&
          Date.now() - pending.at >= 0 && Date.now() - pending.at < 10 * 60 * 1000) {
        trackLead(pending.eventID);
      }
    } catch { /* A direct visit or refresh must not generate a lead. */ }
  }
})();
