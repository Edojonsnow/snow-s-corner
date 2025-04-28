import { defineFunction } from "@aws-amplify/backend-function";

export const addUserToGroup = defineFunction({
  name: "addUserToGroupOnConfirm",
  // Reference the handler file
  entry: "./handler.ts",
  resourceGroupName: "auth",
});
