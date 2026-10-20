# PostureAI Frontend

React + Vite frontend for the PostureAI posture-awareness prototype.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Allow camera access on the Live Monitor page. The first camera start loads the MediaPipe WebAssembly runtime and a pose model from public CDNs, so an internet connection is required on first load.

For the current heuristic to be most meaningful, sit in a front-side view and keep your neck/ear point, both shoulders, hips, knees, and feet visible. The pose overlay shows detected landmarks. The status is a basic wellness cue and is not a medical assessment.

## Commands

```bash
npm run lint
npm run build
npm run preview
```

## Current implementation notes

- Pose landmark inference runs in the browser; video frames are not sent to the Spring Boot backend by this version.
- Completed sessions are saved to browser `localStorage`, under the current prototype user ID.
- Login and registration are frontend-only prototypes, not secure authentication.
- The Spring Boot backend currently provides a health check only; backend authentication, persistent storage, and WebSocket posture APIs remain future work.
