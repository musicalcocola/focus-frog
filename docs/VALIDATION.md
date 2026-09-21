# Validation report

## Automated baseline

Verified locally on September 21, 2026: **7/7 unit tests, 9/9 Chromium browser tests, and production build passed.** Browser tests also cover keyboard focus in the distraction dialog and unavailable fullscreen support.

- `npm test`: seven tests for clock-based timing, running/expired session recovery, extension accounting, early completion, invalid storage, display rounding, and translation-key completeness.
- `npm run test:e2e`: browser task-flow tests using Playwright and Chromium. Includes English and Chinese, distraction return, persistence, expiry, extensions, storage unavailability, and desktop/phone viewport layouts.
- `npm run build`: Vite production build.

Viewport checks: 1440 × 1000 (desktop), 390 × 844 (phone portrait), 844 × 390 (phone landscape). Screenshots are generated locally under `test-results/` and are not committed.

## Limits and manual follow-up

Automated viewport checks use desktop Chromium; they are not physical-device tests. Real iOS Safari/Android Chrome behavior, device sleep, operating-system notification settings, and screen-reader usability require manual checks. Browsers can suspend a page while it is hidden: the timer corrects itself on return, but the app does not promise a background alarm. Changing the system clock can affect a wall-clock-based timer.

The current session is stored per browser origin. Concurrent tabs can overwrite one another; multi-tab coordination is in the future backlog. Clearing site data removes session recovery. No cloud backup is provided.
