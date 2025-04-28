import type { PostConfirmationTriggerHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient();
const GROUP_NAME = "READERS";

export const handler: PostConfirmationTriggerHandler = async (event) => {
  // Don't run if triggered by admin actions like AdminCreateUser
  // Only run for user sign-up confirmation flows
  if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
    const params = {
      GroupName: GROUP_NAME,
      UserPoolId: event.userPoolId,
      Username: event.userName, // username passed from Cognito
    };

    const command = new AdminAddUserToGroupCommand(params);

    try {
      console.log(
        `Attempting to add user ${event.userName} to group ${GROUP_NAME}`
      );
      await client.send(command);
      console.log(
        `Successfully added user ${event.userName} to group ${GROUP_NAME}`
      );
    } catch (error) {
      console.error(
        `Error adding user ${event.userName} to group ${GROUP_NAME}:`,
        error
      );
      // Decide if you want to throw the error or just log it
      // Throwing might prevent user pool operations depending on settings
      // For group assignment, usually just logging is preferred unless it's critical
    }
  } else {
    console.log(
      `Trigger source is ${event.triggerSource}, skipping group assignment.`
    );
  }

  // IMPORTANT: Return the event object back to Cognito
  return event;
};
