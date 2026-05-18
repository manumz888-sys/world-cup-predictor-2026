import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PredictionForm from "@/components/PredictionForm";

describe("PredictionForm", () => {
  const defaultProps = { matchId: 1, userId: 1 };

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 99,
        user_id: 1,
        match_id: 1,
        predicted_home_score: 2,
        predicted_away_score: 1,
        points_earned: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    } as unknown as Response);
  });

  afterEach(() => jest.resetAllMocks());

  it("renders two numeric inputs and a submit button", () => {
    render(<PredictionForm {...defaultProps} />);
    expect(screen.getByTestId("input-home")).toBeInTheDocument();
    expect(screen.getByTestId("input-away")).toBeInTheDocument();
    expect(screen.getByTestId("btn-submit-prediction")).toBeInTheDocument();
  });

  it("inputs accept only numbers (type=number)", () => {
    render(<PredictionForm {...defaultProps} />);
    const homeInput = screen.getByTestId("input-home");
    const awayInput = screen.getByTestId("input-away");
    expect(homeInput).toHaveAttribute("type", "number");
    expect(awayInput).toHaveAttribute("type", "number");
  });

  it("inputs have min=0 constraint", () => {
    render(<PredictionForm {...defaultProps} />);
    expect(screen.getByTestId("input-home")).toHaveAttribute("min", "0");
    expect(screen.getByTestId("input-away")).toHaveAttribute("min", "0");
  });

  it("calls POST /api/predictions with correct payload on submit", async () => {
    render(<PredictionForm {...defaultProps} />);

    await userEvent.type(screen.getByTestId("input-home"), "2");
    await userEvent.type(screen.getByTestId("input-away"), "1");
    fireEvent.click(screen.getByTestId("btn-submit-prediction"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/predictions/",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            user_id: 1,
            match_id: 1,
            predicted_home_score: 2,
            predicted_away_score: 1,
          }),
        })
      );
    });
  });

  it("shows success message after successful submission", async () => {
    render(<PredictionForm {...defaultProps} />);

    await userEvent.type(screen.getByTestId("input-home"), "3");
    await userEvent.type(screen.getByTestId("input-away"), "0");
    fireEvent.click(screen.getByTestId("btn-submit-prediction"));

    await waitFor(() => {
      expect(screen.getByText(/Prediction saved/i)).toBeInTheDocument();
    });
  });

  it("shows error when submission fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: "Prediction already exists" }),
    } as unknown as Response);

    render(<PredictionForm {...defaultProps} />);
    await userEvent.type(screen.getByTestId("input-home"), "1");
    await userEvent.type(screen.getByTestId("input-away"), "0");
    fireEvent.click(screen.getByTestId("btn-submit-prediction"));

    await waitFor(() => {
      expect(screen.getByTestId("prediction-error")).toBeInTheDocument();
    });
  });
});
