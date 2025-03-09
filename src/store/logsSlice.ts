import type { StateCreator } from "zustand";
import type { LogLevel } from "../core/logger";

type LogEntry = {
  timestamp: Date;
  level: LogLevel;
  message: string;
};

type LogsSlice = {
  logs: LogEntry[];
  logLines: number;
  addLog: (level: LogLevel, message: string) => void;
};

export const createLogsSlice: StateCreator<LogsSlice> = (set) => ({
  logs: [],
  logLines: 10,
  addLog: (level, message) =>
    set((state) => ({
      logs: [...state.logs, { timestamp: new Date(), level, message }].slice(
        -state.logLines
      ),
    })),
});
