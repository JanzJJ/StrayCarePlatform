// Core React and DOM rendering imports
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Google OAuth authentication provider
import { GoogleOAuthProvider } from "@react-oauth/google";

// Mount React app to DOM root element with StrictMode for development checks
ReactDOM.createRoot(document.getElementById("root")).render( 
  <React.StrictMode>
    {/* Google OAuth provider wrapper with client ID for authentication */}
    <GoogleOAuthProvider clientId="784469257846-88j86vscn24q3mlqa29hiibs33bd9h5u.apps.googleusercontent.com">
      {/* Main application component */}
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
