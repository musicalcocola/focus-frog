# Development plan

**Public Kanban:** https://github.com/users/musicalcocola/projects/1

## Initial milestone

Deliver a buildable, independently implemented Focus Frog prototype and a public portfolio for the Project Setup and Initial Development assignment, due September 21, 2026 at 11:59 pm (course timezone should be checked separately).

| Phase | Scope | Acceptance criteria |
| --- | --- | --- |
| Interface | Home, Setup, Desk, Time's Up, Complete | One complete session is possible without entering a goal |
| Core timer | Timestamp countdown, recovery, extension | Reload and background time do not reset the countdown |
| Bilingual and fallback support | EN/中文, storage, fullscreen, responsive CSS | Both languages work; unavailable APIs do not block a session |
| Validation and delivery | Automated tests, README, portfolio, Kanban | Build succeeds, public links resolve, and issues have owners and labels |

## Kanban process

Statuses: **To Do**, **In Progress**, **Done**. Each future development issue is assigned to `musicalcocola`, has a relevant label, and includes acceptance criteria. Move an issue to In Progress when implementation starts, and to Done only after its acceptance criteria are met. Future work should remain To Do until actually started.

## Future development backlog

1. **Physical mobile-browser QA:** test Safari on iOS and Chrome on Android, including landscape, background/resume, and fullscreen fallback; record devices and results.
2. **Screen Wake Lock:** offer an opt-in keep-awake control with feature detection, visibility recovery, localized fallback, and tests.
3. **Offline access:** add a versioned service worker and a safe update experience; verify offline reload without losing a current session.
4. **Multi-tab coordination:** detect a session modified in another tab and provide a gentle choice to resume or keep the local session; avoid silently overwriting progress.
5. **Accessibility audit:** check screen readers, keyboard focus, 200% zoom, contrast, reduced motion, and all five screens in both languages; document and address findings.

These are intentionally future enhancements, not claims that the current prototype implements them.
