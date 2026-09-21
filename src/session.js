export const SESSION_KEY = 'focus-frog.session.v1';
export const LANGUAGE_KEY = 'focus-frog.language';
export function createSession(minutes, goal = '', now = Date.now()) {
  return { version: 1, stage: 'desk', goal: goal.trim().slice(0, 120), startedAt: now, endAt: now + minutes * 60000, durationMs: minutes * 60000, returns: 0, wandering: false };
}
export function remainingMs(session, now = Date.now()) {
  return Math.max(0, session.endAt - now);
}
export function advanceSession(session, now = Date.now()) {
  return session?.stage === 'desk' && remainingMs(session, now) === 0 ? { ...session, stage: 'timesup', wandering: false } : session;
}
export function extendSession(session, minutes, now = Date.now()) {
  return { ...session, stage: 'desk', endAt: now + minutes * 60000, durationMs: session.durationMs + minutes * 60000, wandering: false };
}
export function completeSession(session, now = Date.now()) {
  return { ...session, stage: 'complete', elapsedMs: session.durationMs - remainingMs(session, now), wandering: false };
}
export function restoreSession(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !['desk', 'timesup', 'complete'].includes(value.stage) || typeof value.goal !== 'string' || value.goal.length > 120 || typeof value.wandering !== 'boolean' || !Number.isSafeInteger(value.returns) || value.returns < 0 || ![value.startedAt, value.endAt, value.durationMs].every(Number.isFinite) || value.durationMs <= 0 || value.endAt < value.startedAt || (value.stage === 'complete' && (!Number.isFinite(value.elapsedMs) || value.elapsedMs < 0 || value.elapsedMs > value.durationMs))) return null;
    return advanceSession(value, now);
  } catch { return null; }
}
export function formatTime(ms) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
