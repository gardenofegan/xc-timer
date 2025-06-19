export interface Runner {
  id: string;
  name: string;
  grade: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface TimeEntry {
  runnerId: string;
  checkpoint: string; // '1K', '2K', '3K', '4K', '5K' or '1M', '2M', '3M', '3.1M'
  time: string; // MM:SS format
  timestamp: number;
}

export interface TimingSession {
  id: string;
  name: string;
  teams: Team[];
  runners: Runner[];
  times: TimeEntry[];
  unit: 'km' | 'miles';
  created: number;
  updated: number;
}

export type Screen = 'setup' | 'timing' | 'share' | 'import';