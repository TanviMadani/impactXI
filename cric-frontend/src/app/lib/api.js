const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  // Backward-compatible with older env var name
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

/** Message shown when backend is not running (connection refused / failed to fetch). */
export const API_OFFLINE_MESSAGE =
  "Backend not reachable. Start it from the BACKEND folder with: uvicorn app.main:app --reload --port 8000";

function isConnectionError(err) {
  return (
    err?.message === "Failed to fetch" ||
    err?.name === "TypeError" ||
    (err?.message && err.message.toLowerCase().includes("network")) 

    
  );
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    if (isConnectionError(err)) {
      throw new Error(API_OFFLINE_MESSAGE);
    }
    throw err;
  }

  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${path}`);
  }

  return res.json();
}

// Players search / leaderboard
export function fetchImpactLeaderboard(limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) }).toString();
  return request(`/leaderboards/impact?${params}`);
}

export function fetchPlayersSearch(q = "", limit = 20) {
  const params = new URLSearchParams({ q, limit: String(limit) }).toString();
  return request(`/players?${params}`);
}

export function fetchPlayerSummary(playerId) {
  return request(`/players/${playerId}`);
}

export function fetchPlayerImpact(playerId, window = 10) {
  const params = new URLSearchParams({ window: String(window) }).toString();
  return request(`/players/${playerId}/impact?${params}`);
}

export function fetchPlayerInnings(playerId, limit = 20) {
  const params = new URLSearchParams({ limit: String(limit) }).toString();
  return request(`/players/${playerId}/innings?${params}`);
}

// Matches
export function fetchMatchDetails(matchId) {
  return request(`/matches/${matchId}`);
}

export function fetchMatchesList(limit = 50, offset = 0) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) }).toString();
  return request(`/matches?${params}`);
}

