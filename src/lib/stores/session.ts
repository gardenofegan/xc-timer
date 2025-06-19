import { writable, derived } from 'svelte/store';
import type { TimingSession, Runner, Team, TimeEntry, Screen } from '../types';
import { browser } from '../utils/browser';

const STORAGE_KEY = 'xc-timer-session';

function createSessionStore() {
  const defaultSession: TimingSession = {
    id: crypto.randomUUID(),
    name: 'New Session',
    teams: [],
    runners: [],
    times: [],
    unit: 'km',
    created: Date.now(),
    updated: Date.now()
  };

  const { subscribe, set, update } = writable<TimingSession>(defaultSession);

  // Load from localStorage on initialization
  if (browser) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored);
        // Migrate old sessions that don't have teams
        if (!session.teams) {
          session.teams = [];
        }
        // Migrate old runners that have age instead of grade
        if (session.runners) {
          session.runners = session.runners.map((runner: any) => {
            if (runner.age && !runner.grade) {
              // Convert age to approximate grade
              let grade: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' = 'Freshman';
              if (runner.age >= 18) grade = 'Senior';
              else if (runner.age >= 17) grade = 'Junior';
              else if (runner.age >= 16) grade = 'Sophomore';
              
              return {
                ...runner,
                grade,
                teamId: runner.teamId || '',
                age: undefined
              };
            }
            return {
              ...runner,
              teamId: runner.teamId || ''
            };
          });
        }
        set(session);
      } catch (e) {
        console.error('Failed to load session from storage:', e);
      }
    }
  }

  // Save to localStorage whenever session changes
  subscribe((session) => {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  });

  return {
    subscribe,
    set,
    update,
    addTeam: (team: Omit<Team, 'id'>) => {
      update(session => ({
        ...session,
        teams: [...session.teams, { ...team, id: crypto.randomUUID() }],
        updated: Date.now()
      }));
    },
    removeTeam: (teamId: string) => {
      update(session => ({
        ...session,
        teams: session.teams.filter(t => t.id !== teamId),
        runners: session.runners.map(r => r.teamId === teamId ? { ...r, teamId: '' } : r),
        updated: Date.now()
      }));
    },
    addRunner: (runner: Omit<Runner, 'id'>) => {
      update(session => ({
        ...session,
        runners: [...session.runners, { ...runner, id: crypto.randomUUID() }],
        updated: Date.now()
      }));
    },
    removeRunner: (runnerId: string) => {
      update(session => ({
        ...session,
        runners: session.runners.filter(r => r.id !== runnerId),
        times: session.times.filter(t => t.runnerId !== runnerId),
        updated: Date.now()
      }));
    },
    addTime: (timeEntry: Omit<TimeEntry, 'timestamp'>) => {
      update(session => ({
        ...session,
        times: [...session.times.filter(t => 
          !(t.runnerId === timeEntry.runnerId && t.checkpoint === timeEntry.checkpoint)
        ), { ...timeEntry, timestamp: Date.now() }],
        updated: Date.now()
      }));
    },
    setUnit: (unit: 'km' | 'miles') => {
      update(session => ({
        ...session,
        unit,
        updated: Date.now()
      }));
    },
    importData: (importedSession: Partial<TimingSession>) => {
      update(session => ({
        ...session,
        ...importedSession,
        updated: Date.now()
      }));
    },
    reset: () => {
      const newSession = {
        ...defaultSession,
        id: crypto.randomUUID(),
        created: Date.now(),
        updated: Date.now()
      };
      set(newSession);
    }
  };
}

export const session = createSessionStore();
export const currentScreen = writable<Screen>('setup');

export const checkpoints = derived(session, ($session) => {
  return $session.unit === 'km' 
    ? ['1K', '2K', '3K', '4K', '5K']
    : ['1M', '2M', '3M', '3.1M'];
});