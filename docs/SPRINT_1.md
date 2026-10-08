# Sprint 1 — Focus Frog reliability

Sprint date: October 8, 2026. Assignment due: 11:59 pm (America/Chicago).

## Sprint Goal

Make Focus Frog reliable for everyday desk use by adding opt-in Screen Wake Lock (#2), offline access with safe updates (#3), and multi-tab session coordination (#4). Deliver each feature through a tested feature branch and merged pull request.

Milestone: https://github.com/musicalcocola/focus-frog/milestone/1  
Board: https://github.com/users/musicalcocola/projects/1

| Existing issue | Feature branch | Acceptance |
| --- | --- | --- |
| #2 Screen Wake Lock | `feat/2-screen-wake-lock` | Opt-in, bilingual feedback, visibility recovery, release on finish, unsupported/rejected API tests |
| #3 Offline loading | `feat/3-offline-access` | Versioned cache, offline reload, persisted session, deferred updates during focus |
| #4 Multi-tab coordination | `feat/4-multi-tab-coordination` | Explicit conflict choice, preserved session data, coordinated writes, two-tab tests |

Each selected issue starts in To Do, moves to In Progress when implementation begins, and moves to Done after its tested PR is merged. All three are assigned to musicalcocola.

## Feature notes

### #2 — Screen Wake Lock

Desk Mode offers an optional Keep screen awake button. It shows actual lock status in English or Chinese, handles missing/rejected APIs, reacquires on return to a visible tab, and releases on timeout, early finish, or opt-out. A pending request that resolves after finishing is released immediately. The preference does not silently carry into a new session. Device power settings can still release or refuse the lock.

API reference: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
