from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    home_team_id: Mapped[int] = mapped_column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id: Mapped[int] = mapped_column(Integer, ForeignKey("teams.id"), nullable=False)
    match_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    venue: Mapped[str | None] = mapped_column(String(200), nullable=True)
    stage: Mapped[str] = mapped_column(String(50), nullable=False, default="group")
    home_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    away_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="scheduled")
    api_football_id: Mapped[int | None] = mapped_column(Integer, nullable=True, unique=True)

    home_team: Mapped["Team"] = relationship("Team", foreign_keys=[home_team_id], back_populates="home_matches")
    away_team: Mapped["Team"] = relationship("Team", foreign_keys=[away_team_id], back_populates="away_matches")
    predictions: Mapped[list["Prediction"]] = relationship("Prediction", back_populates="match")
    ai_insights: Mapped[list["AIInsight"]] = relationship("AIInsight", back_populates="match")
