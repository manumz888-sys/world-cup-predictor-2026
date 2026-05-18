import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: jest.fn() }),
}));

const mockMatches = [
  {
    id: 1,
    home_team_id: 1,
    away_team_id: 2,
    home_team: { id: 1, name: "Argentina", country_code: "ARG", group_name: "A", flag_url: null },
    away_team: { id: 2, name: "Brazil",    country_code: "BRA", group_name: "B", flag_url: null },
    match_date: "2026-06-15T18:00:00",
    venue: "MetLife Stadium",
    stage: "group",
    home_score: 2,
    away_score: 1,
    status: "finished",
  },
  {
    id: 2,
    home_team_id: 3,
    away_team_id: 4,
    home_team: { id: 3, name: "France",  country_code: "FRA", group_name: "C", flag_url: null },
    away_team: { id: 4, name: "Germany", country_code: "GER", group_name: "C", flag_url: null },
    match_date: "2026-06-16T20:00:00",
    venue: "Rose Bowl",
    stage: "group",
    home_score: null,
    away_score: null,
    status: "scheduled",
  },
];

const mockLeaderboard = [
  { rank: 1, user_id: 1, username: "leo_predictor", total_points: 47, avatar_url: null },
  { rank: 2, user_id: 2, username: "maria_gol",     total_points: 35, avatar_url: null },
];

describe("Dashboard", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes("leaderboard")) {
        return Promise.resolve({ ok: true, json: async () => mockLeaderboard } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => mockMatches } as Response);
    });
  });

  afterEach(() => jest.resetAllMocks());

  it("renders team names of the featured match", async () => {
    render(<DashboardPage />);
    // featured = first "scheduled" match → France vs Germany
    await waitFor(() => {
      expect(screen.getByText("France")).toBeInTheDocument();
      expect(screen.getByText("Germany")).toBeInTheDocument();
    });
  });

  it("renders match cards in the bracket panel", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const cards = screen.getAllByTestId("match-card");
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows finished result in the featured match card", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      // 2-1 result shown in featured card hero
      expect(screen.getByText(/2\s*[–-]\s*1/)).toBeInTheDocument();
    });
  });

  it("renders top predictors from leaderboard data", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("leo_predictor")).toBeInTheDocument();
    });
  });

  it("renders leaderboard rows in top predictors panel", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const rows = screen.getAllByTestId("leaderboard-row");
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });
  });
});
