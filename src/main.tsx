import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Authenticator } from "@aws-amplify/ui-react";
import App from "./App.tsx";
import "@aws-amplify/ui-react/styles.css";
import outputs from "./../amplify_outputs.json";
import { Amplify } from "aws-amplify";

import "./index.css";

Amplify.configure(outputs);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
