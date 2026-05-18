import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Navbar", () => {
  it("renders the brand text", () => {
    render(<Navbar />);
    expect(screen.getByText(/WORLD CUP PREDICTOR 2026/i)).toBeInTheDocument();
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

  it("renders at least 2 navigation links", () => {
    render(<Navbar />);
    expect(screen.getByTestId("nav-link-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-leaderboard")).toBeInTheDocument();
  });
});
