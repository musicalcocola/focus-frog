import { useEffect, useState } from 'react';

// The preference lasts only for the current running session. The OS may still
// release a lock; visibility changes retry only while the user has opted in.
export function useWakeLock(active) {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('off');
  const supported = typeof navigator.wakeLock?.request === 'function';

  useEffect(() => {
    if (!active) setEnabled(false);
    if (!active || !enabled) { setStatus('off'); return; }
    if (!supported) { setStatus('unsupported'); return; }

    let cancelled = false;
    let sentinel = null;
    let requesting = false;
    const release = () => {
      const previous = sentinel;
      sentinel = null;
      if (previous && !previous.released) void previous.release().catch(() => {});
    };
    const reconcile = async () => {
      if (cancelled) return;
      if (document.visibilityState !== 'visible') {
        release();
        setStatus('paused');
        return;
      }
      if (sentinel || requesting) return;
      requesting = true;
      setStatus('requesting');
      try {
        const acquired = await navigator.wakeLock.request('screen');
        if (cancelled || document.visibilityState !== 'visible') {
          await acquired.release();
          return;
        }
        sentinel = acquired.released ? null : acquired;
        setStatus(acquired.released ? 'paused' : 'active');
        acquired.addEventListener('release', () => {
          if (sentinel !== acquired) return;
          sentinel = null;
          if (!cancelled) setStatus('paused');
        }, { once: true });
      } catch {
        if (!cancelled) setStatus('error');
      } finally { requesting = false; }
    };
    document.addEventListener('visibilitychange', reconcile);
    void reconcile();
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', reconcile);
      release();
    };
  }, [active, enabled, supported]);

  return { enabled, status: supported ? status : 'unsupported', toggle: () => setEnabled(value => !value), supported };
}
