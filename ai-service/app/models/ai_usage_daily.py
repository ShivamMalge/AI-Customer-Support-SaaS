import uuid
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
