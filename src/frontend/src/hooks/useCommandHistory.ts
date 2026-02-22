import { create } from 'zustand';

export interface CommandHistoryEntry {
  id: string;
  timestamp: Date;
  type: 'command' | 'response' | 'error';
  content: string;
}

interface CommandHistoryState {
  entries: CommandHistoryEntry[];
  addCommand: (command: string) => void;
  addResponse: (response: string) => void;
  addError: (error: string) => void;
  clear: () => void;
}

export const useCommandHistory = create<CommandHistoryState>((set) => ({
  entries: [],
  addCommand: (command: string) =>
    set((state) => ({
      entries: [
        ...state.entries,
        {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          type: 'command',
          content: command,
        },
      ],
    })),
  addResponse: (response: string) =>
    set((state) => {
      const type = response.toLowerCase().includes('error') ? 'error' : 'response';
      return {
        entries: [
          ...state.entries,
          {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            type,
            content: response,
          },
        ],
      };
    }),
  addError: (error: string) =>
    set((state) => ({
      entries: [
        ...state.entries,
        {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          type: 'error',
          content: error,
        },
      ],
    })),
  clear: () => set({ entries: [] }),
}));
