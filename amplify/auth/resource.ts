import { defineAuth } from "@aws-amplify/backend";
import { addUserToGroup } from "../functions/add-user-to-group/resource";

const currentBranch = process.env.AWS_BRANCH;
const defaultCallbackUrl = "http://localhost:5173/";
const defaultLogoutUrl = "http://localhost:5173/logout"; // Or just '/'

let effectiveCallbackUrls: string[];
let effectiveLogoutUrls: string[];

if (currentBranch === "main") {
  const prodCallback = process.env.PROD_CALLBACK_URL || defaultCallbackUrl;
  const prodLogout = process.env.PROD_LOGOUT_URL || defaultLogoutUrl;

  effectiveCallbackUrls = [prodCallback]; // Production only needs its own URL
  effectiveLogoutUrls = [prodLogout];
}

// }
else {
  console.log(
    `Using Default URLs for branch '${currentBranch || "local/sandbox"}'`
  );
  effectiveCallbackUrls = [defaultCallbackUrl];
  effectiveLogoutUrls = [defaultLogoutUrl];
}
export const auth = defineAuth({
  loginWith: {
    email: true,

    externalProviders: {
      callbackUrls: effectiveCallbackUrls,
      logoutUrls: effectiveLogoutUrls,
    },
  },
  userAttributes: {
    email: { mutable: true, required: true },
    givenName: { mutable: true, required: true },
    familyName: { mutable: true, required: true },
  },
  groups: ["AUTHORS", "READERS"],
  triggers: {
    postConfirmation: addUserToGroup,
  },
});
