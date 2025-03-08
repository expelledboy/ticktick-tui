import { authenticate } from "./app/authenticate";
import { loadOAuthTokens } from "./auth";
import { api } from "./ticktick/api";

const main = async () => {
  await authenticate();

  const tokens = await loadOAuthTokens();

  if (!tokens?.access_token) {
    throw new Error("No access token found");
  } else {
    api.setAuthToken(tokens?.access_token);
  }

  const projects = await api.getProjects();

  console.log("Projects:");
  for (const project of projects) {
    console.log(`- ${project.name}`);
  }
};

main().catch(console.error);
