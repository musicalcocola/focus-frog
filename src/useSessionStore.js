import { useEffect, useRef, useState } from 'react';
import { SESSION_KEY, restoreSession } from './session';

const PRIVATE_KEY = 'focus-frog.tab-session.v1';
const WRITE_LOCK = 'focus-frog.session-write.v1';
function initialSnapshot() {
  let error = false;
  try {
    const privateRaw = sessionStorage.getItem(PRIVATE_KEY);
    if (privateRaw) {
      const value = JSON.parse(privateRaw);
      const session = restoreSession(JSON.stringify(value.session));
      if (value.version === 1 && (value.session === null || session)) return { session, raw: null, private: true, error: false };
    }
  } catch { error = true; }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return { raw, session: restoreSession(raw), private: !navigator.locks?.request, error };
  } catch { return { raw: null, session: null, private: true, error: true }; }
}

export function useSessionStore() {
  const [initial] = useState(initialSnapshot);
  const [session, setSession] = useState(initial.session);
  const [privateMode, setPrivateMode] = useState(initial.private);
  const [conflict, setConflict] = useState(null);
  const [storageError, setStorageError] = useState(initial.error);
  const expectedRaw = useRef(initial.raw);
  const savedSession = useRef(initial.session);
  const privateRef = useRef(initial.private);
  const conflictRef = useRef(null);
  const generation = useRef(0);
  const writer = useRef(crypto.randomUUID());
  const supported = typeof navigator.locks?.request === 'function';

  function changedElsewhere(raw) {
    if (privateRef.current || raw === expectedRaw.current) return;
    generation.current++;
    const value = { raw, session: restoreSession(raw) };
    conflictRef.current = value;
    setConflict(value);
  }

  useEffect(() => {
    const check = event => {
      if (event?.type === 'storage' && event.key !== SESSION_KEY && event.key !== null) return;
      try { changedElsewhere(localStorage.getItem(SESSION_KEY)); }
      catch { setStorageError(true); }
    };
    window.addEventListener('storage', check);
    window.addEventListener('pageshow', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      generation.current++;
      window.removeEventListener('storage', check);
      window.removeEventListener('pageshow', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  useEffect(() => {
    if (privateMode) {
      try { sessionStorage.setItem(PRIVATE_KEY, JSON.stringify({ version: 1, session })); }
      catch { setStorageError(true); }
      return;
    }
    if (conflictRef.current || savedSession.current === session) return;
    const requestGeneration = ++generation.current;
    void navigator.locks.request(WRITE_LOCK, () => {
      if (requestGeneration !== generation.current || privateRef.current || conflictRef.current) return;
      const latest = localStorage.getItem(SESSION_KEY);
      if (latest !== expectedRaw.current) { changedElsewhere(latest); return; }
      const raw = session ? JSON.stringify({ ...session, _revision: crypto.randomUUID(), _writer: writer.current }) : null;
      if (raw === null) localStorage.removeItem(SESSION_KEY);
      else localStorage.setItem(SESSION_KEY, raw);
      expectedRaw.current = raw;
      savedSession.current = session;
    }).catch(() => {
      setStorageError(true);
      privateRef.current = true;
      setPrivateMode(true);
    });
  }, [session, privateMode]);

  function keepLocal() {
    generation.current++;
    privateRef.current = true;
    conflictRef.current = null;
    setPrivateMode(true);
    setConflict(null);
  }

  async function resumeShared() {
    if (!supported) return;
    generation.current++;
    try {
      await navigator.locks.request(WRITE_LOCK, () => {
        const raw = localStorage.getItem(SESSION_KEY);
        const latest = restoreSession(raw);
        expectedRaw.current = raw;
        savedSession.current = latest;
        privateRef.current = false;
        conflictRef.current = null;
        sessionStorage.removeItem(PRIVATE_KEY);
        setSession(latest);
        setPrivateMode(false);
        setConflict(null);
      });
    } catch { setStorageError(true); }
  }

  return { session, setSession, conflict, privateMode, supported, storageError, keepLocal, resumeShared };
}
