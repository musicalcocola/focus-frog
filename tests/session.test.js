import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, remainingMs, advanceSession, extendSession, completeSession, restoreSession, formatTime } from '../src/session.js';
import { translations } from '../src/translations.js';

test('uses clock deadlines even when no interval ticks occur', () => {
  const s = createSession(5, '  Read a page  ', 1000);
  assert.equal(s.goal, 'Read a page');
  assert.equal(remainingMs(s, 121000), 180000);
  assert.equal(advanceSession(s, 900000).stage, 'timesup');
  assert.equal(remainingMs(s, 900000), 0);
});
test('reload recovers a running session and advances expired sessions', () => {
  const s = { ...createSession(10, '', 1000), returns: 2 };
  assert.deepEqual(restoreSession(JSON.stringify(s), 2000), s);
  assert.equal(restoreSession(JSON.stringify(s), 800000).stage, 'timesup');
  assert.equal(restoreSession(JSON.stringify(s), 800000).returns, 2);
});
test('extension excludes time spent on the time-up screen', () => {
  const s = createSession(5, '', 0);
  const extended = extendSession(advanceSession(s, 600000), 10, 600000);
  assert.equal(extended.endAt, 1200000);
  assert.equal(extended.durationMs, 900000);
  assert.equal(completeSession(extended, 1200000).elapsedMs, 900000);
});
test('early finish only includes elapsed session time', () => {
  assert.equal(completeSession(createSession(5, '', 1000), 61000).elapsedMs, 60000);
});
test('corrupt browser storage is ignored', () => {
  for (const raw of ['{', 'null', '{}', JSON.stringify({ ...createSession(5), returns: -1 }), JSON.stringify({ ...createSession(5), stage: 'complete', elapsedMs: -1 })]) assert.equal(restoreSession(raw), null);
});
test('timer is never negative and rounds up fractional seconds', () => {
  assert.equal(formatTime(-1), '00:00');
  assert.equal(formatTime(299999), '05:00');
  assert.equal(formatTime(1), '00:01');
});
test('every interface translation exists in both languages', () => {
  assert.deepEqual(Object.keys(translations.en).sort(), Object.keys(translations.zh).sort());
  for (const locale of Object.values(translations)) for (const value of Object.values(locale)) assert.ok(value.length > 0);
});
