from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.api.v1.health import router as health_router
from app.api.v1.knowledge_base import router as kb_router
from app.api.v1.chat import router as chat_router
from app.api.v1.ai_keys import router as ai_keys_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()

app = FastAPI(
    title="SupportGPT AI Service",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.api_v1_prefix)
app.include_router(kb_router, prefix=f"{settings.api_v1_prefix}/knowledge_base", tags=["knowledge_base"])
app.include_router(chat_router, prefix=f"{settings.api_v1_prefix}/chat", tags=["chat"])
app.include_router(ai_keys_router, prefix=f"{settings.api_v1_prefix}/ai_keys", tags=["ai_keys"])
