# TickTick TUI

### Objective

We want feature parity for the TickTick UI in the terminal.
TickTick is a task manager, with projects, tasks, sub-tasks, and checklists.

The TUI should be heavily inspired by vim.

Primarily we work with tasks, that should be the primary view. However, there should be:
- List of projects in left panel (nerdtree style)
- Task detail to the right (50% of the view)
- Command palette / status bar at the bottom

You should be able to:
- Scroll within your task list using `j` `k` keybindings.
- Scroll to other projects using `ctrl-n` `ctrl-p`
- Mark your task as complete with `c`
- Move the task up or down in the list with `ctrl-j` `ctrl-k`
- Add a new task with `a`
- Exit the program with `ctrl-c` or `q`
- Edit a task title `i`
- Edit the tasks other properties with `e`
- Start search with `/` (using `ctrl-g` as global search toggle)
- Switch to logs mode using `ctrl-l`
- Switch to debug mode using `ctrl-d`

These keybinding should be configurable, as settings.
The credentials and settings need to be stored seperately.

We should be attempting to cache locally the data, between application restarts.

The app should be able to run in 3 different ways.
1. Via cli commands eg. `tt list` `tt add {task}` `tt switch {project}`
2. As a terminal application `tt`
3. In daemon mode `tt -d`

The cli should have terminal completions, for `bash` `zsh` and `fish`

The daemon exists to keep local state in sync with remote state.
You should also be able to trigger a sync directly with `tt sync`

### Context

The API: https://api.ticktick.com/open/v1
Developer documentation: https://developer.ticktick.com/docs#/openapi
It uses OAuth2 to establish its credentials.

### Architecture

As we are a sub-domain of TickTick with need to conform to thier schemas.

TickTick is the source of truth for the data.

Read Operations (Queries)
- GET `/open/v1/project` - Get all user projects
- GET `/open/v1/project/{projectId}` - Get a specific project by ID
- GET `/open/v1/project/{projectId}/data` - Get project with all its data (tasks and columns)
- GET `/open/v1/project/{projectId}/task/{taskId}` - Get a specific task by project ID and task ID

Write Operations (Commands)
- POST `/open/v1/project` - Create a new project
- POST `/open/v1/project/{projectId}` - Update an existing project
- DELETE `/open/v1/project/{projectId}` - Delete a project
- POST `/open/v1/task` - Create a new task
- POST `/open/v1/task/{taskId}` - Update an existing task
- POST `/open/v1/project/{projectId}/task/{taskId}/complete` - Mark a task as complete
- DELETE `/open/v1/project/{projectId}/task/{taskId}` - Delete a task

Remote state should be fetched on demand, but locally persisted into a cache.

### Design

- Use `bun` runtime for maximum performance.
- Use `zod` for schema validation, generated from the API documentation.
- Save and retrieve settings from `.config/ticktick-tui/settings.json`
- Save and retrieve credentials from `.config/ticktick-tui/credentials.json`
- Use Reacts `useQuery` library for remote data caching and invalidation patterns.
- Runtime state will be stored in a simple react `Context` pattern

The auth workflow is once-off, lets use basic readline behaviour to establish credentials.

It will "provide" the auth token into the `api.ts` for consumption in `dataLayer.ts`

The `app.ts` will consume the `dataLayer`, creating a contract we mock for e2e testing.
