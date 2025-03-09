// Import bootstrap file to fix React with Bun
import { authenticate } from "./app/authenticate";
import { runApp } from "./app/main";
import { loadOAuthTokens } from "./core/auth";
import { api } from "./ticktick/api";

const main = async () => {
  await authenticate();

  const tokens = await loadOAuthTokens();

  if (!tokens?.access_token) {
    throw new Error("No access token found");
  } else {
    api.setAuthToken(tokens?.access_token);
  }

  runApp().catch(console.error);
};

main().catch(console.error);
