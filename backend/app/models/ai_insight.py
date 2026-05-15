from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    match_id: Mapped[int] = mapped_column(Integer, ForeignKey("matches.id"), nullable=False)
    insight_text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    model_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    match: Mapped["Match"] = relationship("Match", back_populates="ai_insights")
