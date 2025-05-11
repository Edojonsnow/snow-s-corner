import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

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

      userID: a.id().required(),
      author: a.belongsTo("User", "userID"),
      category: a.string().required(),
      header_image: a.url(),
      comments: a.hasMany("Comments", "blogpost_id"),
      date: a.date(),
    })
    .authorization((allow) => [
      // Authors group: Allow all operations (create, read, update, delete)
      allow.group("AUTHORS").to(["create", "read", "update", "delete"]),

      // Readers group: Allow only the 'read' operation
      allow.authenticated().to(["read"]),
    ]),

  Category: a
    .model({
      category_name: a.string(),
    })
    .authorization((allow) => [allow.guest().to(["create"])]),
  Comments: a
    .model({
      comment: a.string(),
      userID: a.id().required(),
      user: a.belongsTo("User", "userID"),
      blogpost_id: a.id(),
      blogpost: a.belongsTo("Blogpost", "blogpost_id"),
      created_at: a.date(),
    })
    .authorization((allow) => [
      allow.owner().to(["create", "read"]),
      allow.authenticated().to(["read"]),
    ]),
  User: a
    .model({
      firstName: a.string(),
      lastName: a.string(),
      postsAuthored: a.hasMany("Blogpost", "userID"),
      commentsPosted: a.hasMany("Comments", "userID"),
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
