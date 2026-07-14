import uuid
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
