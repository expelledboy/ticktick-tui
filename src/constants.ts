export const DEBUG = process.env.TICKTICK_DEBUG === "true";

export const TEST = process.env.TICKTICK_TEST === "true" || DEBUG;

export const SHOW_NUM_LOGS = 10;
