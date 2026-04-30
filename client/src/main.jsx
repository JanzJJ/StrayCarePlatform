import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render( 
  <React.StrictMode>
    {/* Replace with your actual Google Client ID */}
    <GoogleOAuthProvider clientId="784469257846-88j86vscn24q3mlqa29hiibs33bd9h5u.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
