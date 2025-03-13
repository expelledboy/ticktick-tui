import KeyBindingsHelp from "./KeyBindingsHelp";
import type { StoryExport } from "@expelledboy/ink-storybook";

const storyExport: StoryExport = {
  stories: [
    {
      id: "all-keybindings",
      title: "All Keybindings",
      component: <KeyBindingsHelp contextual={false} />,
      description: "Shows all available keybindings across all contexts",
    },
    {
      id: "projects-context",
      title: "Projects Context",
      component: <KeyBindingsHelp contextual={true} context="projects" />,
      description: "Shows keybindings specific to the projects context",
    },
  ],
};

export default storyExport;
