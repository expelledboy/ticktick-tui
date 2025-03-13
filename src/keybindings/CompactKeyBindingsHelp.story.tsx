import CompactKeyBindingsHelp from "./CompactKeyBindingsHelp";
import type { StoryExport } from "@expelledboy/ink-storybook";

const storyExport: StoryExport = {
  stories: [
    {
      id: "all-keybindings",
      title: "All Keybindings",
      component: <CompactKeyBindingsHelp />,
      description: "Shows all available keybindings across all contexts",
    },
    {
      id: "global-context",
      title: "Global Context",
      component: <CompactKeyBindingsHelp contexts={["global"]} />,
      description: "Shows only global keybindings",
    },
    {
      id: "projects-context",
      title: "Projects Context",
      component: <CompactKeyBindingsHelp contexts={["projects"]} />,
      description: "Shows keybindings specific to the projects context",
    },
  ],
};

export default storyExport;
