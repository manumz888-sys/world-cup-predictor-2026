"""Seed script: inserts demo teams, matches, users, predictions and an AI insight."""
from datetime import datetime
from app.database import SessionLocal
from app.models import Base, User, Team, Match, Prediction, AIInsight
from app.database import engine

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ── Clear existing data (order matters for FK constraints) ──────────────────
db.query(AIInsight).delete()
db.query(Prediction).delete()
db.query(Match).delete()
db.query(Team).delete()
db.query(User).delete()
db.commit()

# ── Teams ────────────────────────────────────────────────────────────────────
teams_data = [
    ("Argentina",    "ARG", "A"),
    ("Brazil",       "BRA", "B"),
    ("France",       "FRA", "C"),
    ("Germany",      "GER", "C"),
    ("Spain",        "ESP", "D"),
    ("Portugal",     "POR", "D"),
    ("England",      "ENG", "E"),
    ("Netherlands",  "NED", "E"),
    ("USA",          "USA", "F"),
    ("Mexico",       "MEX", "F"),
    ("Japan",        "JPN", "G"),
    ("Morocco",      "MOR", "G"),
]
teams = {}
for name, code, group in teams_data:
    t = Team(name=name, country_code=code, group_name=group)
    db.add(t)
    db.flush()
    teams[code] = t

# ── Users ────────────────────────────────────────────────────────────────────
users_data = [
    ("leo_predictor",  "leo@wcp.com",    "hash1", 47),
    ("maria_gol",      "maria@wcp.com",  "hash2", 35),
    ("juan_crack",     "juan@wcp.com",   "hash3", 28),
    ("sofia_wc",       "sofia@wcp.com",  "hash4", 19),
    ("demo_user",      "demo@wcp.com",   "hash5",  0),
]
users = {}
for username, email, pw, pts in users_data:
    u = User(username=username, email=email, password_hash=pw, total_points=pts)
    db.add(u)
    db.flush()
    users[username] = u

# ── Matches ──────────────────────────────────────────────────────────────────
matches_data = [
    # (home, away, date, venue, stage, home_score, away_score, status)
    ("ARG", "BRA", datetime(2026, 6, 14, 18, 0), "MetLife Stadium, NJ",        "group",     2, 1, "finished"),
    ("FRA", "GER", datetime(2026, 6, 15, 21, 0), "SoFi Stadium, LA",           "group",     1, 1, "finished"),
    ("ESP", "POR", datetime(2026, 6, 18, 18, 0), "AT&T Stadium, Dallas",       "group",  None, None, "live"),
    ("ENG", "NED", datetime(2026, 6, 19, 21, 0), "Levi's Stadium, SF",         "group",  None, None, "scheduled"),
    ("USA", "MEX", datetime(2026, 6, 22, 18, 0), "Rose Bowl, Pasadena",        "group",  None, None, "scheduled"),
    ("JPN", "MOR", datetime(2026, 6, 25, 15, 0), "Estadio Azteca, CDMX",      "group",  None, None, "scheduled"),
    ("ARG", "FRA", datetime(2026, 7,  4, 20, 0), "Hard Rock Stadium, Miami",   "quarter_final", None, None, "scheduled"),
    ("ESP", "ENG", datetime(2026, 7,  5, 20, 0), "Gillette Stadium, Boston",   "quarter_final", None, None, "scheduled"),
]
match_objs = []
for home_code, away_code, dt, venue, stage, hs, as_, status in matches_data:
    m = Match(
        home_team_id=teams[home_code].id,
        away_team_id=teams[away_code].id,
        match_date=dt,
        venue=venue,
        stage=stage,
        home_score=hs,
        away_score=as_,
        status=status,
    )
    db.add(m)
    db.flush()
    match_objs.append(m)

arg_bra, fra_ger, esp_por, eng_ned, usa_mex, jpn_mor, arg_fra, esp_eng = match_objs

# ── Predictions (for finished matches) ───────────────────────────────────────
preds = [
    # ARG 2-1 BRA (exact) → leo 10 pts, maria 3 pts, juan 5 pts
    (users["leo_predictor"],  arg_bra, 2, 1, 10),
    (users["maria_gol"],      arg_bra, 1, 0, 3),
    (users["juan_crack"],     arg_bra, 3, 2, 5),
    (users["sofia_wc"],       arg_bra, 0, 1, 0),
    # FRA 1-1 GER → draw (maria exact 10, leo wrong 0, juan correct 3)
    (users["maria_gol"],      fra_ger, 1, 1, 10),
    (users["leo_predictor"],  fra_ger, 2, 0,  0),
    (users["juan_crack"],     fra_ger, 0, 0,  3),
    # Scheduled match predictions (no points yet)
    (users["demo_user"],      eng_ned, 2, 1, None),
    (users["demo_user"],      usa_mex, 1, 0, None),
    (users["leo_predictor"],  esp_por, 1, 0, None),
]
for user, match, ph, pa, pts in preds:
    p = Prediction(
        user_id=user.id,
        match_id=match.id,
        predicted_home_score=ph,
        predicted_away_score=pa,
        points_earned=pts,
    )
    db.add(p)

# ── AI Insight ────────────────────────────────────────────────────────────────
insight = AIInsight(
    match_id=esp_por.id,
    insight_text=(
        "🔥 Spain vs Portugal — Iberian Derby Analysis\n\n"
        "Tactical Overview: Spain's high press and tiki-taka possession game "
        "will challenge Portugal's counter-attacking strengths led by their "
        "experienced forward line.\n\n"
        "Win Probabilities:\n"
        "  • Spain (home): 48%\n"
        "  • Draw: 27%\n"
        "  • Portugal: 25%\n\n"
        "Key Battle: Spain's midfield trio dominates possession (avg 63%) "
        "while Portugal relies on pace in transition.\n\n"
        "Predicted Score: Spain 2–1 Portugal\n"
        "Confidence: High — historical H2H favors Spain in tournament play."
    ),
    confidence_score=0.74,
    model_version="gemini-1.5-pro",
)
db.add(insight)
db.commit()
db.close()
print("✅ Seed complete:")
print(f"   {len(teams_data)} teams | {len(users_data)} users | {len(match_objs)} matches | {len(preds)} predictions | 1 AI insight")
