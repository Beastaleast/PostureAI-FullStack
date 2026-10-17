# PostureAI Full Stack

The project is now separated cleanly into two applications:

```text
PostureAI-FullStack/
├── frontend/   # React + Vite + JavaScript + plain CSS
└── backend/    # Java + Spring Boot
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on the Vite development server, normally `http://localhost:5173`.

## Backend

```bash
cd backend
mvn spring-boot:run
```

Runs on `http://localhost:8080`.

Health check: `GET http://localhost:8080/api/health`

## Planned connection

```text
React frontend
     │
     ├── REST API ───────► Spring Boot
     │                         │
     └── WebSocket ────────────┤
                               ▼
                         Database / AI
```

The backend is intentionally a clean starting point rather than pretending authentication/database/AI are already implemented.
