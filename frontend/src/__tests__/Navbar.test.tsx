import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

// next/navigation is used inside Navbar
jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Navbar", () => {
  it("renders the logo", () => {
    render(<Navbar />);
    expect(screen.getByText(/WCP 2026/i)).toBeInTheDocument();
  });

  it("renders Dashboard nav link", () => {
    render(<Navbar />);
    expect(screen.getByTestId("nav-link-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-dashboard")).toHaveAttribute("href", "/dashboard");
  });

  it("renders Leaderboard nav link", () => {
    render(<Navbar />);
    expect(screen.getByTestId("nav-link-leaderboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-leaderboard")).toHaveAttribute("href", "/leaderboard");
  });

  it("renders exactly 2 nav links", () => {
    render(<Navbar />);
    const links = screen.getAllByRole("link");
    // logo link + dashboard + leaderboard = 3
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId("nav-link-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-leaderboard")).toBeInTheDocument();
  });
});
