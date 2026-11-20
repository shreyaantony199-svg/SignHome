"""
SignHome FastAPI Application
AI-Powered Indian Sign Language Communication and Learning Platform
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database.mongodb import db_manager
from .routes import auth, vocabulary, recognition, practice, emergency, medical, communication, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed initial ISL vocabulary and sources metadata
    print("[SignHome] Initializing platform services...")
    db_manager.seed_initial_vocabulary()
    yield
    print("[SignHome] Shutting down platform services.")

app = FastAPI(
    title="SignHome API",
    description="Backend API for SignHome: AI-Powered Indian Sign Language Communication and Learning Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular Routers
app.include_router(auth.router, prefix="/api")
app.include_router(vocabulary.router, prefix="/api")
app.include_router(recognition.router, prefix="/api")
app.include_router(practice.router, prefix="/api")
app.include_router(emergency.router, prefix="/api")
app.include_router(medical.router, prefix="/api")
app.include_router(communication.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "SignHome",
        "tagline": "Every Sign Has a Voice. Every Person Has a Place.",
        "status": "online",
        "documentation": "/docs",
        "sources": [
            "ARGISL / RKMVERI (https://cs.rkmvu.ac.in/~isl/)",
            "Indian Sign Language Portal (https://indiansignlanguage.org/)"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
