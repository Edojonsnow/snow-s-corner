import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import { addUserToGroup } from "./functions/add-user-to-group/resource";
import * as iam from "aws-cdk-lib/aws-iam";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  addUserToGroup,
});

const { cfnIdentityPool } = backend.auth.resources.cfnResources;
cfnIdentityPool.allowUnauthenticatedIdentities = true;

const lambdaFunction = backend.addUserToGroup.resources.lambda;

// Access the instantiated Auth resource's underlying User Pool ARN
// Note the access via backend.auth.resources.userPool
const userPoolArn = backend.auth.resources.userPool.userPoolArn;

// Get the Lambda function's execution role
const functionExecutionRole = lambdaFunction.role;

// Add the policy statement to the function's role
if (functionExecutionRole) {
  functionExecutionRole.addToPrincipalPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "cognito-idp:AdminAddUserToGroup", // Action needed
      ],
      resources: [
        userPoolArn, // Target specific User Pool
      ],
    })
  );
  console.log(
    "Successfully added AdminAddUserToGroup policy to function role via backend.ts."
  );
} else {
  console.error(
    "Could not resolve execution role for the addUserToGroup function via backend.ts."
  );
  // Potentially throw error to stop deployment
  // throw new Error("Execution role for addUserToGroup function not found.");
}
