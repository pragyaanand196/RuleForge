import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.tasks import router as tasks_router
from .routes.infer import router as infer_router
from .routes.apply import router as apply_router
from .routes.generalize import router as generalize_router
from .routes.reflection import router as reflection_router
from .routes.challenge import router as challenge_router

app = FastAPI(
    title="RuleForge Engine API",
    description="Deterministic rule inference, evaluation, and generalization engine for Skill Acquisition from Demonstrations.",
    version="1.0.0"
)

# Configure CORS based on FRONTEND_URL environment variable
frontend_env = os.environ.get("FRONTEND_URL", "").strip()
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

if frontend_env and frontend_env != "*":
    for origin in frontend_env.split(","):
        cleaned = origin.strip().rstrip("/")
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Default open CORS for local development / testing
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include route handlers
app.include_router(tasks_router)
app.include_router(infer_router)
app.include_router(apply_router)
app.include_router(generalize_router)
app.include_router(reflection_router)
app.include_router(challenge_router)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok"
    }

