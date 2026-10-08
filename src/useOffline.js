import { useEffect, useRef, useState } from 'react';

export function useOffline(busy) {
  const [online, setOnline] = useState(navigator.onLine);
  const [state, setState] = useState('preparing');
  const [waiting, setWaiting] = useState(null);
  const [applying, setApplying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const busyRef = useRef(busy);
  const requested = useRef(false);
  busyRef.current = busy;

  useEffect(() => {
    const onlineChanged = () => setOnline(navigator.onLine);
    window.addEventListener('online', onlineChanged);
    window.addEventListener('offline', onlineChanged);
    if (!import.meta.env.PROD) return () => {
      window.removeEventListener('online', onlineChanged);
      window.removeEventListener('offline', onlineChanged);
    };
    if (!('serviceWorker' in navigator)) { setState('unavailable'); return; }
    let disposed = false;
    let registration;
    let interval;
    const detect = () => { if (!disposed && registration?.waiting) setWaiting(registration.waiting); };
    const message = event => {
      if (event.data?.type === 'FOCUS_FROG_CHECK_BUSY') event.ports[0]?.postMessage({ busy: busyRef.current });
    };
    const changed = () => {
      setState('ready');
      if (requested.current && !busyRef.current) location.reload();
    };
    navigator.serviceWorker.addEventListener('message', message);
    navigator.serviceWorker.addEventListener('controllerchange', changed);
    navigator.serviceWorker.register(new URL('sw.js', document.baseURI), { updateViaCache: 'none' }).then(async reg => {
      if (disposed) return;
      registration = reg;
      detect();
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        installing?.addEventListener('statechange', () => {
          detect();
          if (installing.state === 'redundant' && !reg.active && !disposed) setState('unavailable');
        });
      });
      if (reg.active) setState('ready');
      await navigator.serviceWorker.ready;
      if (disposed) return;
      setState('ready');
      interval = setInterval(() => { if (navigator.onLine) void reg.update().catch(() => {}); }, 60000);
    }).catch(() => { if (!disposed) setState('unavailable'); });
    return () => {
      disposed = true;
      clearInterval(interval);
      window.removeEventListener('online', onlineChanged);
      window.removeEventListener('offline', onlineChanged);
      navigator.serviceWorker.removeEventListener('message', message);
      navigator.serviceWorker.removeEventListener('controllerchange', changed);
    };
  }, []);

  async function applyUpdate() {
    if (!waiting || busyRef.current || applying) return;
    setBlocked(false);
    setApplying(true);
    requested.current = true;
    const channel = new MessageChannel();
    const timeout = setTimeout(() => { requested.current = false; setApplying(false); setBlocked(true); channel.port1.close(); }, 5000);
    channel.port1.onmessage = event => {
      clearTimeout(timeout);
      channel.port1.close();
      if (!event.data?.ok) { requested.current = false; setApplying(false); setBlocked(true); }
    };
    waiting.postMessage({ type: 'FOCUS_FROG_ACTIVATE' }, [channel.port2]);
  }
  return { online, state, waiting, applying, blocked, applyUpdate, enabled: import.meta.env.PROD };
}
