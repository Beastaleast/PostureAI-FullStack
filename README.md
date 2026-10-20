# PostureAI Full Stack

PostureAI is a posture-awareness prototype with a React frontend and a Spring Boot backend starter.

## Current capabilities

- React + Vite dashboard, profile, login/register screens, and session history UI.
- Webcam permission handling and a live camera panel.
- Browser-side body pose landmarks using MediaPipe Pose Landmarker.
- A basic screen-space alignment heuristic and posture-session summaries stored in browser `localStorage`.
- Responsive dashboard layout that expands when the sidebar is collapsed.
- Session-history deletion with a confirmation prompt and user-scoped local deletion.
- Spring Boot health endpoint at `GET http://localhost:8080/api/health`.

## Important limitations

- Posture classification currently uses simple landmark geometry thresholds for awareness only. It is not a medical assessment and has not been clinically validated. A front-side camera view that includes the neck/ear point, both shoulders, hips, knees, and feet works best for the current heuristic.
- The MediaPipe WebAssembly assets and pose model are downloaded from public CDNs when detection initializes, so the first load needs an internet connection. Video frames are processed in the browser by the MediaPipe task and are not sent to the Spring Boot backend by this implementation.
- Session history is browser-local and is not synchronized between devices or browsers. The current login/register screens use localStorage and are not secure server authentication.
- The backend is still a starter: it currently provides a health endpoint only. Database persistence, backend authentication, and backend AI/WebSocket APIs are not implemented yet.

## Frontend

Requires a recent Node.js version supported by the installed Vite version.

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`). Allow camera access. Start the camera and wait for the pose model to load, then use a front-side view that includes your neck/ear point, both shoulders, hips, knees, and feet. Click **Start Monitoring**, then **Stop & Save Session** to store a session locally. Visit **Session History** to review recorded sessions. Use the **Delete** action on a row to remove a saved session after confirming. Collapsing the sidebar gives the main dashboard its additional horizontal space on desktop; on mobile, the sidebar overlays the page.

Build and lint checks:

```bash
npm run build
npm run lint
```

## Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend runs on `http://localhost:8080`. Health check: `GET http://localhost:8080/api/health`.

## Current architecture

```text
Webcam
  │
  ▼
React / MediaPipe Pose Landmarker (browser-side inference)
  │
  ├── posture-alignment feedback
  └── session summaries → browser localStorage

Spring Boot starter
  └── GET /api/health
```

Future work includes a calibrated posture classifier, tests with different camera placements, persistent session storage, and secure backend authentication.


## Current posture checks

The browser-side pose detector uses body landmarks to estimate shoulder level, neck-forward offset (ear-to-shoulder displacement only; no facial-angle measurement), back lean, and seated hip/knee bend. Results are smoothed over recent frames and shown as **GOOD POSTURE**, **POOR POSTURE**, or a camera-position prompt when required landmarks are not visible.

These geometric thresholds are a basic posture-awareness heuristic, not a clinically validated assessment. Results depend on lighting, camera placement, and visibility of the shoulders, hips, knees, and feet. Session history records elapsed duration separately from time classified as good or poor, so frames with insufficient landmarks do not count as poor posture in the score. Short sessions show seconds rather than rounding to `0m`.
