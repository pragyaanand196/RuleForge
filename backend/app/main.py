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

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RuleForge Engine",
        "version": "1.0.0"
    }
