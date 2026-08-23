import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import create_tables
from fastapi.middleware.cors import CORSMiddleware
from routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(
    title = "youtube thumbnail generator api",
    lifespan=lifespan
)

_extra_origins = os.getenv("ALLOWED_ORIGINS", "")
allow_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    *[origin.strip() for origin in _extra_origins.split(",") if origin.strip()],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
