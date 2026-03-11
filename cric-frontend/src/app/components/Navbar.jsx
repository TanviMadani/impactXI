import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { BarChart3, Menu, X } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const linkClass = (path) =>
    `font-['Inter'] transition-colors ${
      isActive(path) ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="font-['Poppins'] font-bold text-xl text-primary">impactXI</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>
            <Link to="/players" className={linkClass('/players')}>
              Players
            </Link>
            <Link to="/leaderboard" className={linkClass('/leaderboard')}>
              Leaderboard
            </Link>
            <Link to="/compare" className={linkClass('/compare')}>
              Compare
            </Link>
            <Link to="/matches" className={linkClass('/matches')}>
              Matches
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            onClick={() => setIsMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav links */}
        {isMobileOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-3 space-y-2">
              <Link
                to="/"
                className={`${linkClass('/')} block px-1`}
                onClick={() => setIsMobileOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/players"
                className={`${linkClass('/players')} block px-1`}
                onClick={() => setIsMobileOpen(false)}
              >
                Players
              </Link>
              <Link
                to="/leaderboard"
                className={`${linkClass('/leaderboard')} block px-1`}
                onClick={() => setIsMobileOpen(false)}
              >
                Leaderboard
              </Link>
              <Link
                to="/compare"
                className={`${linkClass('/compare')} block px-1`}
                onClick={() => setIsMobileOpen(false)}
              >
                Compare
              </Link>
              <Link
                to="/matches"
                className={`${linkClass('/matches')} block px-1`}
                onClick={() => setIsMobileOpen(false)}
              >
                Matches
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
