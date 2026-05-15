def calculate_points(
    predicted_home: int,
    predicted_away: int,
    actual_home: int,
    actual_away: int,
) -> int:
    if predicted_home == actual_home and predicted_away == actual_away:
        return 10

    pred_diff = predicted_home - predicted_away
    actual_diff = actual_home - actual_away
    pred_winner = _winner(predicted_home, predicted_away)
    actual_winner = _winner(actual_home, actual_away)

    if pred_winner == actual_winner and pred_diff == actual_diff:
        return 5

    if pred_winner == actual_winner:
        return 3

    return 0


def _winner(home: int, away: int) -> str:
    if home > away:
        return "home"
    if away > home:
        return "away"
    return "draw"
