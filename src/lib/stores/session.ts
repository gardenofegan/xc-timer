import { writable, derived } from 'svelte/store';
import type { TimingSession, Runner, TimeEntry, Screen } from '../types';
import { browser } from '../utils/browser';

const STORAGE_KEY = 'xc-timer-session';

function createSessionStore() {
  const defaultSession: TimingSession = {
    id: crypto.randomUUID(),
    name: 'New Session',
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