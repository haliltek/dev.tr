import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('devcore_sess');
  if (!id) {
    id = `sess_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
    sessionStorage.setItem('devcore_sess', id);
  }
  return id;
}

export function useDevcoreTelemetry() {
  const router = useRouter();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sendPing = (pathOverride?: string) => {
      try {
        const sessionId = getSessionId();
        const path = pathOverride || window.location.pathname;
        const referrer = document.referrer;

        if (navigator.sendBeacon) {
          const blob = new Blob(
            [JSON.stringify({ sessionId, path, referrer })],
            { type: 'application/json' }
          );
          navigator.sendBeacon('/api/telemetry', blob);
        } else {
          fetch('/api/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, path, referrer }),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {}
    };

    // Send on route change
    const handleRouteChange = (url: string) => {
      const cleanPath = url.split('?')[0];
      if (cleanPath !== lastPathRef.current) {
        lastPathRef.current = cleanPath;
        sendPing(cleanPath);
      }
    };

    // Initial page load ping
    lastPathRef.current = window.location.pathname;
    sendPing();

    // Heartbeat every 45 seconds while tab is active to keep "Online" status fresh
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendPing();
      }
    }, 45000);

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      clearInterval(heartbeat);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);
}
