import { Link, useLocation } from 'react-router';
import { BarChart3 } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

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
              <span className="font-['Poppins'] font-bold text-xl text-primary">IPL Meter</span>
              <span className="font-['Inter'] text-xs text-muted-foreground -mt-1">
                Impact Metric
              </span>
            </div>
          </Link>

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
            <Link to="/#about-metric" className={linkClass('/methodology')}>
              About Metric
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
