import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    // Add or modify this section:
    externalProviders: {
      // You MUST configure callback and logout URLs
      callbackUrls: [
        "http://localhost:5173/", // For local dev (adjust port if needed)
        "https://main.dabou03zwfwya.amplifyapp.com/", // PRODUCTION URL!
      ],
      logoutUrls: [
        "http://localhost:5173/logout", // Or '/' depending on your flow
        "https://main.dabou03zwfwya.amplifyapp.com/logout", // PRODUCTION URL!
      ],
      // Other external provider config if you have them (Google, etc.)
    },
  },
  groups: ["AUTHORS", "READERS"],
});
