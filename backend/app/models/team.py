from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    country_code: Mapped[str] = mapped_column(String(3), unique=True, nullable=False, index=True)
    group_name: Mapped[str | None] = mapped_column(String(10), nullable=True)
    flag_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    home_matches: Mapped[list["Match"]] = relationship("Match", foreign_keys="Match.home_team_id", back_populates="home_team")
    away_matches: Mapped[list["Match"]] = relationship("Match", foreign_keys="Match.away_team_id", back_populates="away_team")
