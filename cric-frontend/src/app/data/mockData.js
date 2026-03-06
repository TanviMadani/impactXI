// Mock data for Mined26 Impact Metric application

export const mockPlayers = [
  {
    id: '1',
    name: 'Virat Kohli',
    team: 'India',
    role: 'Batsman',
    impactScore: 87,
    trend: [78, 82, 85, 81, 88, 86, 89, 85, 87, 90],
    consistency: 'High',
    season: '2024',
    innings: 45,
    performanceComponent: 88,
    contextComponent: 85,
    pressureComponent: 89,
    clutchIndex: 92,
    highPressureInnings: 18
  },
  {
    id: '2',
    name: 'Steve Smith',
    team: 'Australia',
    role: 'Batsman',
    impactScore: 84,
    trend: [80, 78, 85, 88, 82, 86, 84, 81, 87, 85],
    consistency: 'High',
    season: '2024',
    innings: 42,
    performanceComponent: 86,
    contextComponent: 82,
    pressureComponent: 84,
    clutchIndex: 87,
    highPressureInnings: 15
  },
  {
    id: '3',
    name: 'Ben Stokes',
    team: 'England',
    role: 'All-rounder',
    impactScore: 79,
    trend: [72, 75, 78, 81, 76, 80, 82, 78, 79, 83],
    consistency: 'Medium',
    season: '2024',
    innings: 38,
    performanceComponent: 78,
    contextComponent: 80,
    pressureComponent: 81,
    clutchIndex: 88,
    highPressureInnings: 16
  },
  {
    id: '4',
    name: 'Jasprit Bumrah',
    team: 'India',
    role: 'Bowler',
    impactScore: 91,
    trend: [85, 88, 90, 87, 92, 89, 91, 93, 90, 94],
    consistency: 'High',
    season: '2024',
    innings: 40,
    performanceComponent: 93,
    contextComponent: 89,
    pressureComponent: 92,
    clutchIndex: 95,
    highPressureInnings: 22
  },
  {
    id: '5',
    name: 'Kane Williamson',
    team: 'New Zealand',
    role: 'Batsman',
    impactScore: 81,
    trend: [76, 79, 82, 80, 83, 81, 84, 80, 82, 81],
    consistency: 'High',
    season: '2024',
    innings: 36,
    performanceComponent: 82,
    contextComponent: 81,
    pressureComponent: 80,
    clutchIndex: 84,
    highPressureInnings: 14
  },
  {
    id: '6',
    name: 'Pat Cummins',
    team: 'Australia',
    role: 'Bowler',
    impactScore: 86,
    trend: [82, 84, 85, 87, 83, 86, 88, 85, 87, 89],
    consistency: 'High',
    season: '2024',
    innings: 44,
    performanceComponent: 87,
    contextComponent: 85,
    pressureComponent: 86,
    clutchIndex: 89,
    highPressureInnings: 19
  },
  {
    id: '7',
    name: 'Babar Azam',
    team: 'Pakistan',
    role: 'Batsman',
    impactScore: 76,
    trend: [70, 73, 75, 77, 74, 78, 76, 75, 79, 78],
    consistency: 'Medium',
    season: '2024',
    innings: 41,
    performanceComponent: 77,
    contextComponent: 75,
    pressureComponent: 76,
    clutchIndex: 78,
    highPressureInnings: 12
  },
  {
    id: '8',
    name: 'Jos Buttler',
    team: 'England',
    role: 'Wicket-keeper',
    impactScore: 73,
    trend: [68, 70, 72, 71, 75, 73, 74, 72, 76, 75],
    consistency: 'Medium',
    season: '2024',
    innings: 35,
    performanceComponent: 74,
    contextComponent: 72,
    pressureComponent: 73,
    clutchIndex: 81,
    highPressureInnings: 13
  },
  {
    id: '9',
    name: 'Ravindra Jadeja',
    team: 'India',
    role: 'All-rounder',
    impactScore: 82,
    trend: [78, 80, 81, 79, 83, 82, 84, 81, 83, 85],
    consistency: 'High',
    season: '2024',
    innings: 43,
    performanceComponent: 81,
    contextComponent: 83,
    pressureComponent: 82,
    clutchIndex: 85,
    highPressureInnings: 17
  },
  {
    id: '10',
    name: 'Trent Boult',
    team: 'New Zealand',
    role: 'Bowler',
    impactScore: 78,
    trend: [74, 76, 77, 75, 79, 78, 80, 77, 79, 81],
    consistency: 'Medium',
    season: '2024',
    innings: 39,
    performanceComponent: 79,
    contextComponent: 77,
    pressureComponent: 78,
    clutchIndex: 82,
    highPressureInnings: 15
  }
];

export const mockMatches = [
  {
    id: 'm1',
    date: '2024-03-01',
    team1: 'India',
    team2: 'Australia',
    venue: 'Melbourne Cricket Ground',
    season: '2024',
    closeFinish: true
  },
  {
    id: 'm2',
    date: '2024-02-28',
    team1: 'England',
    team2: 'New Zealand',
    venue: "Lord's",
    season: '2024',
    closeFinish: false
  },
  {
    id: 'm3',
    date: '2024-02-25',
    team1: 'Pakistan',
    team2: 'India',
    venue: 'Dubai International Stadium',
    season: '2024',
    closeFinish: true
  },
  {
    id: 'm4',
    date: '2024-02-20',
    team1: 'Australia',
    team2: 'England',
    venue: 'Sydney Cricket Ground',
    season: '2024',
    closeFinish: false
  },
  {
    id: 'm5',
    date: '2024-02-15',
    team1: 'New Zealand',
    team2: 'Pakistan',
    venue: 'Eden Park',
    season: '2024',
    closeFinish: true
  }
];

export const getMatchDetail = (matchId) => {
  const match = mockMatches.find(m => m.id === matchId);
  if (!match) return undefined;

  return {
    ...match,
    innings1: {
      battingTeam: match.team1,
      players: [
        {
          playerId: '1',
          playerName: 'Virat Kohli',
          role: 'Batsman',
          runs: 89,
          impactScore: 88,
          performanceComponent: 87,
          contextComponent: 89,
          pressureComponent: 90
        },
        {
          playerId: '9',
          playerName: 'Ravindra Jadeja',
          role: 'All-rounder',
          runs: 45,
          wickets: 2,
          impactScore: 82,
          performanceComponent: 80,
          contextComponent: 83,
          pressureComponent: 84
        },
        {
          playerId: '4',
          playerName: 'Jasprit Bumrah',
          role: 'Bowler',
          wickets: 4,
          impactScore: 92,
          performanceComponent: 94,
          contextComponent: 91,
          pressureComponent: 91
        }
      ],
      pressureCurve: [
        { over: 1, pressure: 45 },
        { over: 5, pressure: 52 },
        { over: 10, pressure: 48 },
        { over: 15, pressure: 65 },
        { over: 20, pressure: 58 },
        { over: 25, pressure: 70 },
        { over: 30, pressure: 75 },
        { over: 35, pressure: 68 },
        { over: 40, pressure: 82 },
        { over: 45, pressure: 88 },
        { over: 50, pressure: 92 }
      ]
    },
    innings2: {
      battingTeam: match.team2,
      players: [
        {
          playerId: '2',
          playerName: 'Steve Smith',
          role: 'Batsman',
          runs: 76,
          impactScore: 85,
          performanceComponent: 84,
          contextComponent: 86,
          pressureComponent: 85
        },
        {
          playerId: '6',
          playerName: 'Pat Cummins',
          role: 'Bowler',
          runs: 23,
          wickets: 3,
          impactScore: 87,
          performanceComponent: 88,
          contextComponent: 86,
          pressureComponent: 87
        }
      ],
      pressureCurve: [
        { over: 1, pressure: 40 },
        { over: 5, pressure: 48 },
        { over: 10, pressure: 55 },
        { over: 15, pressure: 62 },
        { over: 20, pressure: 70 },
        { over: 25, pressure: 75 },
        { over: 30, pressure: 80 },
        { over: 35, pressure: 85 },
        { over: 40, pressure: 90 },
        { over: 45, pressure: 95 },
        { over: 50, pressure: 98 }
      ]
    }
  };
};

export const getPlayerInnings = (playerId) => {
  const baseInnings = [
    {
      inningsNumber: 1,
      date: '2024-03-01',
      opponent: 'Australia',
      runs: 89,
      impactScore: 88,
      pressure: 'High'
    },
    {
      inningsNumber: 2,
      date: '2024-02-25',
      opponent: 'Pakistan',
      runs: 67,
      impactScore: 82,
      pressure: 'Medium'
    },
    {
      inningsNumber: 3,
      date: '2024-02-20',
      opponent: 'England',
      runs: 91,
      impactScore: 90,
      pressure: 'High'
    },
    {
      inningsNumber: 4,
      date: '2024-02-15',
      opponent: 'New Zealand',
      runs: 54,
      impactScore: 75,
      pressure: 'Low'
    },
    {
      inningsNumber: 5,
      date: '2024-02-10',
      opponent: 'South Africa',
      runs: 78,
      impactScore: 85,
      pressure: 'Medium'
    },
    {
      inningsNumber: 6,
      date: '2024-02-05',
      opponent: 'Australia',
      runs: 103,
      impactScore: 94,
      pressure: 'High'
    },
    {
      inningsNumber: 7,
      date: '2024-01-30',
      opponent: 'Pakistan',
      runs: 45,
      impactScore: 68,
      pressure: 'Low'
    },
    {
      inningsNumber: 8,
      date: '2024-01-25',
      opponent: 'England',
      runs: 82,
      impactScore: 87,
      pressure: 'High'
    },
    {
      inningsNumber: 9,
      date: '2024-01-20',
      opponent: 'New Zealand',
      runs: 71,
      impactScore: 80,
      pressure: 'Medium'
    },
    {
      inningsNumber: 10,
      date: '2024-01-15',
      opponent: 'South Africa',
      runs: 88,
      impactScore: 89,
      pressure: 'High'
    }
  ];

  return baseInnings;
};

export const getImpactColor = (score) => {
  if (score >= 70) return 'var(--impact-high)';
  if (score >= 50) return 'var(--impact-neutral)';
  return 'var(--impact-low)';
};

export const getImpactLabel = (score) => {
  if (score >= 80) return 'Elite';
  if (score >= 70) return 'High';
  if (score >= 60) return 'Above Average';
  if (score >= 50) return 'Average';
  if (score >= 40) return 'Below Average';
  return 'Low';
};
