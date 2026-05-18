import { render, screen, waitFor } from "@testing-library/react";
import LeaderboardPage from "@/app/leaderboard/page";

jest.mock("next/navigation", () => ({
  usePathname: () => "/leaderboard",
  useRouter: () => ({ push: jest.fn() }),
}));

// Intentionally unordered to test that client sorts them
const mockLeaderboard = [
  { rank: 2, user_id: 2, username: "player_b", total_points: 55, avatar_url: null },
  { rank: 1, user_id: 1, username: "player_a", total_points: 120, avatar_url: null },
  { rank: 3, user_id: 3, username: "player_c", total_points: 30, avatar_url: null },
];

describe("Leaderboard", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockLeaderboard,
    } as unknown as Response);
  });

  afterEach(() => jest.resetAllMocks());

  it("renders a row for each player", async () => {
    render(<LeaderboardPage />);
    await waitFor(() => {
      const rows = screen.getAllByTestId("leaderboard-row");
      expect(rows).toHaveLength(3);
    });
  });

  it("shows the player with most points first", async () => {
    render(<LeaderboardPage />);
    await waitFor(() => {
      const rows = screen.getAllByTestId("leaderboard-row");
      expect(rows[0]).toHaveTextContent("player_a");
      expect(rows[0]).toHaveTextContent("120");
    });
  });

  it("shows player_b second and player_c third", async () => {
    render(<LeaderboardPage />);
    await waitFor(() => {
      const rows = screen.getAllByTestId("leaderboard-row");
      expect(rows[1]).toHaveTextContent("player_b");
      expect(rows[2]).toHaveTextContent("player_c");
    });
  });

  it("current user (user_id=1) is highlighted", async () => {
    render(<LeaderboardPage />);
    await waitFor(() => {
      expect(screen.getByText("(you)")).toBeInTheDocument();
    });
  });

  it("renders gold medal for rank 1", async () => {
    render(<LeaderboardPage />);
    await waitFor(() => {
      const rows = screen.getAllByTestId("leaderboard-row");
      expect(rows[0]).toHaveTextContent("🥇");
    });
  });
});
