import os
from pathlib import Path

base_dir = Path(r"c:\Users\shiva\OneDrive\Desktop\AI SaaS\ai-service")

files = {
    "pyproject.toml": """[project]
name = "supportgpt-ai-service"
version = "0.1.0"
description = "SupportGPT AI Orchestration Service"
requires-python = ">=3.12"
dependencies = [
    "fastapi[standard]>=0.115.0",
    "sqlalchemy>=2.0.0",
    "asyncpg>=0.30.0",
    "alembic>=1.14.0",
    "pgvector>=0.3.0",
    "pydantic-settings>=2.0.0",
    "langchain>=0.3.0",
    "langchain-openai>=0.3.0",
    "langchain-core>=0.3.0",
    "langchain-community>=0.3.0",
    "langchain-text-splitters>=0.3.0",
    "redis>=5.0.0",
    "python-multipart>=0.0.9",
    "cryptography>=43.0.0",
    "httpx>=0.27.0",
    "langchain-postgres>=0.0.12",
]

[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.24.0",
    "httpx>=0.27.0",
    "ruff>=0.8.0",
    "mypy>=1.13.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
""",

    "app/__init__.py": "",

    "app/main.py": """from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.api.v1.health import router as health_router
# from app.api.v1.knowledge_base.router import router as kb_router
# from app.api.v1.chat.router import router as chat_router
# from app.api.v1.ai_keys.router import router as ai_keys_router

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
# app.include_router(kb_router, prefix=settings.api_v1_prefix)
# app.include_router(chat_router, prefix=settings.api_v1_prefix)
# app.include_router(ai_keys_router, prefix=settings.api_v1_prefix)
""",

    "app/core/__init__.py": "",

    "app/core/config.py": """from functools import lru_cache
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    app_name: str = "SupportGPT AI Service"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    database_url: str = Field(..., validation_alias="DATABASE_URL_ASYNC")
    redis_url: str = "redis://localhost:6379/0"

    secret_key: SecretStr = SecretStr("change-me-to-a-random-64-char-string-in-production")
    service_auth_key: SecretStr = SecretStr("change-me-inter-service-secret")
    encryption_master_key: SecretStr = SecretStr("change-me-to-a-random-32-byte-hex-string")

    default_embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    chunk_size: int = 512
    chunk_overlap: int = 50

    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:4000"]

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
""",

    "app/core/database.py": """from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(
    settings.database_url,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    echo=settings.debug,
)

async_session = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
""",

    "app/core/security.py": """import os
import base64
from fastapi import Header, HTTPException
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

async def verify_service_auth(x_service_key: str = Header(...)):
    if x_service_key != settings.service_auth_key.get_secret_value():
        raise HTTPException(status_code=401, detail="Invalid service key")
    return True

def get_aesgcm() -> AESGCM:
    key_bytes = settings.encryption_master_key.get_secret_value().encode("utf-8")
    if len(key_bytes) < 32:
        key_bytes = key_bytes.ljust(32, b'0')
    elif len(key_bytes) > 32:
        key_bytes = key_bytes[:32]
    return AESGCM(key_bytes)

def encrypt_key(plaintext: str) -> str:
    aesgcm = get_aesgcm()
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
    return base64.b64encode(nonce + ciphertext).decode('utf-8')

def decrypt_key(encrypted_payload: str) -> str:
    aesgcm = get_aesgcm()
    payload = base64.b64decode(encrypted_payload)
    nonce, ciphertext = payload[:12], payload[12:]
    return aesgcm.decrypt(nonce, ciphertext, None).decode('utf-8')
""",

    "app/core/exceptions.py": """from fastapi import HTTPException

class CreditExhaustedException(HTTPException):
    def __init__(self, detail: str = "Daily credit limit exhausted"):
        super().__init__(status_code=402, detail=detail)

class KeyInvalidException(HTTPException):
    def __init__(self, detail: str = "Provider key is invalid"):
        super().__init__(status_code=424, detail=detail)
""",

    "app/models/__init__.py": """from app.models.base import Base
from app.models.document import Document
from app.models.embedding import Embedding
from app.models.ai_provider_key import AiProviderKey
from app.models.ai_usage_daily import AiUsageDaily
""",

    "app/models/base.py": """from app.core.database import Base""",

    "app/models/document.py": """import uuid
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    knowledge_base_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String, nullable=False)
    source_type = Column(String, nullable=False)
    storage_url = Column(String, nullable=False)
    status = Column(String, nullable=False, default="processing")
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
""",

    "app/models/embedding.py": """import uuid
from sqlalchemy import Column, Integer, Text, ForeignKey, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from app.models.base import Base

class Embedding(Base):
    __tablename__ = "embeddings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(1536))

    __table_args__ = (
        UniqueConstraint("document_id", "chunk_index"),
        Index("ix_embeddings_hnsw", "embedding", postgresql_using="hnsw", postgresql_with={"m": 16, "ef_construction": 64}, postgresql_ops={"embedding": "vector_cosine_ops"}),
    )
""",

    "app/models/ai_provider_key.py": """import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base

class AiProviderKey(Base):
    __tablename__ = "ai_provider_keys"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), nullable=False)
    provider = Column(String, nullable=False)
    encrypted_key = Column(String, nullable=False)
    key_last4 = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    last_validated_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint("org_id", "provider"),
    )
""",

    "app/models/ai_usage_daily.py": """import uuid
from sqlalchemy import Column, Integer, Date, DateTime, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base

class AiUsageDaily(Base):
    __tablename__ = "ai_usage_daily"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), nullable=False)
    usage_date = Column(Date, nullable=False)
    tokens_used = Column(Integer, default=0)
    credits_used = Column(Integer, default=0)
    daily_credit_limit = Column(Integer, default=1000)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("org_id", "usage_date"),
    )
""",

    "app/api/__init__.py": "",
    "app/api/dependencies.py": """from app.core.database import get_db
from app.core.security import verify_service_auth
""",
    "app/api/v1/__init__.py": "",
    
    "app/api/v1/health.py": """from fastapi import APIRouter
router = APIRouter(tags=["health"])

@router.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-service"}
""",

    "Dockerfile": """FROM python:3.12-slim as builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY pyproject.toml .
RUN uv sync --no-dev
COPY . .

FROM python:3.12-slim as runtime
WORKDIR /app
COPY --from=builder /app /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
}

for rel_path, content in files.items():
    p = base_dir / rel_path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')
    print(f"Created {rel_path}")
