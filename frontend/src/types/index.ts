export interface Team {
  id: number;
  name: string;
  country_code: string;
  group_name: string | null;
  flag_url: string | null;
}

export interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_team?: Team;
  away_team?: Team;
  match_date: string;
  venue: string | null;
  stage: string;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "live" | "finished";
}

export interface Prediction {
  id: number;
  user_id: number;
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_points: number;
  avatar_url: string | null;
}

export interface AIInsight {
  id: number;
  match_id: number;
  insight_text: string;
  confidence_score: number | null;
  model_version: string | null;
  generated_at: string;
  from_cache: boolean;
}
