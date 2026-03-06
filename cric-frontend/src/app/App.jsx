import { BrowserRouter, Routes, Route } from 'react-router';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { PlayersPage } from './pages/PlayersPage';
import { PlayerDetailPage } from './pages/PlayerDetailPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MatchesPage } from './pages/MatchesPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { ComparePage } from './pages/ComparePage';
import { MethodologyPage } from './pages/MethodologyPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:playerId" element={<PlayerDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/matches/:matchId" element={<MatchDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
