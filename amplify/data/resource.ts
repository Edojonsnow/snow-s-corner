import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { addUserToGroup } from "../functions/add-user-to-group/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Blogpost: a
    .model({
      title: a.string().required(),
      content: a.string().required(),
      author: a.string().required(),
      category: a.string().required(),
      header_image: a.url(),
      comments: a.hasMany("Comments", "blogpost_id"),
      date: a.date(),
    })
    .authorization((allow) => [
      // Authors group: Allow all operations (create, read, update, delete)
      allow.group("AUTHORS").to(["create", "read", "update", "delete"]),

      // Readers group: Allow only the 'read' operation
      allow.group("READERS").to(["read"]),
    ]),

  Category: a
    .model({
      category_name: a.string(),
    })
    .authorization((allow) => [allow.guest().to(["create"])]),
  Comments: a
    .model({
      comment: a.string(),
      user: a.string(),
      blogpost_id: a.id(),
      blogpost: a.belongsTo("Blogpost", "blogpost_id"),
    })
    .authorization((allow) => [
      allow.owner().to(["create", "read"]),
      allow.authenticated().to(["read"]),
    ]),
  User: a
    .model({
      author_id: a.id().required(),
      author: a.boolean(),
    })
    .authorization((allow) => [
      allow.owner().to(["create", "read", "update", "delete"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
