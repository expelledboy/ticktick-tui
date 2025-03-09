import * as auth from "../core/auth";
import type { OAuth2Config } from "../utils/oauth2";

export const authenticate = async () => {
  if (!auth.haveCredentials()) {
    // Initialize credentials object to store user input
    const credentials: Record<string, string> = {};

    const questions = [
      { name: "clientId", message: "Client ID" },
      { name: "clientSecret", message: "Client Secret" },
    ];

    console.log(`Please enter your client ID and client secret.`);
    console.log(`You can get them from https://developer.ticktick.com/`);

    for (const question of questions) {
      // Display the message and get user input
      const answer = prompt(`${question.message}:`);
      credentials[question.name] = answer as string;
    }

    // Save the collected credentials
    await auth.saveOAuthCredentials({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
    });

    console.log("Requesting TickTick access in Browser...");

    const tokens = await auth.startOAuthFlow(
      credentials as unknown as OAuth2Config
    );

    await auth.saveOAuthTokens(tokens);

    console.log("Authentication successful!");
  }
};
