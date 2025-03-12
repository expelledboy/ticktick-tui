import { Box, Text, useApp, type Key } from "ink";
import { Layout } from "./screens/Layout";
import { useAppStore } from "../store";
import { CompactKeyBindingsHelp, KeyBindingsHelp } from "../keybindings";

// Features
import { useSyncState } from "../hooks/useSyncState";
import { useDebugLogs } from "../hooks/useDebugLogs";
import { useGlobalKeybindings } from "../keybindings/useGlobalKeybindings";

// Screens
import ProjectList from "./screens/ProjectList";
import Project from "./screens/Project";
import DebugPanel from "./screens/DebugPanel";
import LogsPanel from "./screens/LogsPanel";
import TaskPanel from "./screens/TaskPanel";
import { useKeyLogger } from "../keybindings/useKeyLogger";

const micDrops = [
  "Awesome! Task mastery is your superpower! ✨",
  "Well done! Your organized mind is changing the world! 🌱",
  "Tasks conquered, vibes elevated! Keep flowing! 🌊",
  "You're a productivity guru in the making! ✌️",
  "Mindful task management is self-care! You rock! 💫",
  "Crushing goals and raising consciousness! Radical! 🔥",
  "Your organized energy is totally contagious! 🌈",
  "Task by task, you're creating your best life! So cool! 🌟",
  "High fives for mindful productivity! Keep that energy! ⚡",
  "You just leveled up your life admin game! Groovy! 🎵",
];

export const byeMsg = micDrops[Math.floor(Math.random() * micDrops.length)];

/**
 * Main application component
 * Handles initialization, keyboard navigation, and renders the layout
 */
export const App = () => {
  const viewApp = useAppStore((s) => s.viewApp);

  useDebugLogs("App");
  useGlobalKeybindings();
  useKeyLogger();
  useSyncState();

  return viewApp ? (
    <Layout
      Projects={<ProjectList />}
      Project={<Project />}
      Task={<TaskPanel />}
      Debug={<DebugPanel />}
      Logs={<LogsPanel />}
      StatusBar={<StatusBar />}
      Help={<KeyBindingsHelp />}
    />
  ) : (
    <Text>{byeMsg}</Text>
  );
};

const StatusBar = () => {
  const activeView = useAppStore((s) => s.activeView);

  return (
    <Box justifyContent="space-between" gap={1}>
      <CompactKeyBindingsHelp contexts={["global", "navigation"]} />
      <CompactKeyBindingsHelp contexts={[activeView]} />
    </Box>
  );
};
