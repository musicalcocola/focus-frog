# Focus Frog

A bilingual web app for starting and staying focused, created by **Yue Yin** as an individual project. Start small, place your phone on your desk, and let a little frog keep you company.

**Live app:** https://musicalcocola.github.io/focus-frog/  
**Portfolio:** https://musicalcocola.github.io/

## Main functionality

1. **Quick focus sessions:** choose 5, 10, or 20 minutes. A tiny goal is optional. A short setup screen explains landscape placement and asks you to check your device's notification settings.
2. **Desk Mode:** an original SVG frog scene with reading, writing, window-gazing, and tea states, a clock-based countdown, responsive portrait/landscape layouts, and optional browser fullscreen.
3. **Gentle distraction recovery:** select “I wandered off,” see your tiny goal, and choose “Back to it.” The timer keeps going; returning never removes a reward or records a failure.
4. **Finish or continue:** add 5 or 10 minutes when time runs out, or finish and see session time and the number of returns. Early finishing is also supported.
5. **English and Simplified Chinese:** switch the entire interface; the language and current session are saved locally when browser storage is available.

Screens: Home → Start Setup → Desk Mode → Time's Up → Session Complete.

## Run, build, and test

Requires Node.js 22.12+ (or Node.js 24) and npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

The dev server prints its local URL. The production build is written to `dist/`; `npm run preview` serves that build locally.

Browser tests:

```sh
npx playwright install chromium
npm run test:e2e
```

## Open-source reference and independent implementation

**Reference:** [krau5/pomo — Pomodoro Timer](https://github.com/krau5/pomo) (MIT license).

Its README describes a simple multiplatform browser focus timer built with React and Vite. Focus Frog targets a comparable small, client-side focus-timer scope: choosing a session, displaying a countdown, and controlling the end of a session. Focus Frog adds a bilingual desk companion and a gentle distraction-return flow tailored to this project's proposal. It is not intended to reproduce every reference-project feature.

The reference was used to understand product scope, not as a source of implementation code. The React components, timer state logic, translations, CSS, and SVG illustrations in this repository were independently developed. No code or visual assets were copied from the reference project. Forest, Focus Friend, and Study Bunny are conceptual comparators from the proposal, not the open-source reference for this assignment.

## AI tools used

**OpenAI Codex** assisted with implementation, original SVG/CSS visuals, English/Chinese interface text, tests, documentation, and GitHub setup. Yue Yin supplied the project proposal, academic profile, and product requirements. See [AI development notes](docs/AI_DEVELOPMENT.md) for the workflow and review checklist. The app itself has no AI feature or API integration.

## Technical decisions

- React + Vite, HTML/CSS/JavaScript; no backend or accounts.
- A session stores an absolute `endAt` timestamp. Each update computes remaining time from the clock, so timer ticks lost in a background tab do not accumulate drift. Returning to the page or reloading recalculates the current stage.
- Browser storage contains only language and the current/last session. A new session replaces the old session. Storage errors fall back to an in-memory session with a visible notice.
- Extension time starts when the user chooses the extension; time spent on the Time's Up screen is excluded. Session totals include distraction time and are not a productivity score.
- Native browser fullscreen is optional and has a fallback message. Web pages cannot activate system-wide Do Not Disturb; users control that setting themselves.
- Keyboard controls, visible focus, large touch targets, and reduced-motion styles are included. Physical iOS/Android device checks remain future work; automated mobile viewport tests run in Chromium.
- Fonts are requested from Google Fonts, with system-font fallbacks. No analytics are installed and no goal text is sent to a server by the app.

## Deployment and planning

The included GitHub Actions workflow tests, builds, and deploys to GitHub Pages. In repository Settings → Pages, choose **GitHub Actions** as the source.

See [development plan](docs/PLAN.md) and [validation report](docs/VALIDATION.md). Future issues are tracked on the public GitHub Project linked from the plan.

Out of scope: accounts, cloud synchronization, social features, detailed statistics, AI features, direct app blocking, and medical or ADHD-treatment claims.
