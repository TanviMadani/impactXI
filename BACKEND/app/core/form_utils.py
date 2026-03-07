# BACKEND/app/core/form_utils.py
# Batting/form classification from last N innings (e.g. impact scores or runs).
# Weights last 2-3 matches more to reflect current form.

from typing import List

# Threshold for "strong" innings (impact 0-100 scale; for runs you'd use e.g. 40-50)
STRONG_SCORE_THRESHOLD = 50.0
# Weights: last 3 innings get higher weight (oldest of last10 -> newest)
# Last 3 weights sum to ~0.5 so they can swing the category
WEIGHTS_LAST10 = [0.05, 0.05, 0.06, 0.06, 0.07, 0.07, 0.08, 0.12, 0.18, 0.26]  # last element = most recent


def batting_form_from_scores(scores: List[float], strong_threshold: float = STRONG_SCORE_THRESHOLD) -> str:
    """
    Determine form category from last 10 innings scores (most recent last).
    - EXCELLENT FORM: last 2-3 innings strong (e.g. above threshold).
    - PLAYING CONSISTENTLY: stable across most innings.
    - MODERATE FORM: mixed or mostly low scores.
    """
    if not scores:
        return "MODERATE FORM"

    # Use only last 10, pad from left if fewer
    tail = scores[-10:] if len(scores) >= 10 else scores
    n = len(tail)
    weights = WEIGHTS_LAST10[-n:]  # align weights with available scores (last n)

    # Last 3 scores (or fewer if not available)
    last3 = tail[-3:] if len(tail) >= 3 else tail
    strong_count_last3 = sum(1 for s in last3 if s is not None and float(s) >= strong_threshold)
    avg_last3 = sum(float(s) for s in last3 if s is not None) / len(last3) if last3 else 0.0

    # Weighted overall (so recent matters more)
    weighted_sum = 0.0
    weight_sum = 0.0
    for i, s in enumerate(tail):
        if s is not None:
            try:
                v = float(s)
                weighted_sum += v * weights[i]
                weight_sum += weights[i]
            except (TypeError, ValueError):
                pass
    weighted_avg = weighted_sum / weight_sum if weight_sum > 0 else 50.0

    # Rule 1: Last 3 strong -> EXCELLENT FORM
    if strong_count_last3 >= 2 and avg_last3 >= strong_threshold:
        return "EXCELLENT FORM"

    # Rule 2: Stable across most (low variance, decent average) -> PLAYING CONSISTENTLY
    if n >= 5:
        valid = [float(s) for s in tail if s is not None]
        if valid:
            avg_all = sum(valid) / len(valid)
            variance = sum((x - avg_all) ** 2 for x in valid) / len(valid)
            if variance < 400 and 35 <= weighted_avg <= 75:  # stable and mid-range
                return "PLAYING CONSISTENTLY"

    # Rule 3: Else MODERATE FORM
    if weighted_avg >= 55 and strong_count_last3 >= 1:
        return "PLAYING CONSISTENTLY"

    return "MODERATE FORM"
