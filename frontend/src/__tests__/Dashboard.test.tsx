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
    away_team: { id: 2, name: "Brazil", country_code: "BRA", group_name: "B", flag_url: null },
    match_date: "2026-06-15T18:00:00",
    venue: "MetLife Stadium",
    stage: "group",
    home_score: null,
    away_score: null,
    status: "scheduled",
  },
  {
    id: 2,
    home_team_id: 3,
    away_team_id: 4,
    home_team: { id: 3, name: "France", country_code: "FRA", group_name: "C", flag_url: null },
    away_team: { id: 4, name: "Germany", country_code: "GER", group_name: "C", flag_url: null },
    match_date: "2026-06-16T20:00:00",
    venue: "Rose Bowl",
    stage: "group",
    home_score: 2,
    away_score: 1,
    status: "finished",
  },
];

describe("Dashboard", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMatches,
    } as unknown as Response);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders team names after fetch", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("Argentina")).toBeInTheDocument();
      expect(screen.getByText("Brazil")).toBeInTheDocument();
    });
  });

  it("renders both match cards", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const cards = screen.getAllByTestId("match-card");
      expect(cards).toHaveLength(2);
    });
  });

  it("shows finished result for completed match", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/2 – 1/)).toBeInTheDocument();
    });
  });

  it("shows prediction form for scheduled match", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getAllByTestId("prediction-form").length).toBeGreaterThanOrEqual(1);
    });
  });
});
