import { Amplify } from "aws-amplify";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import VoiceRegistration from "./voiceModule/voiceRegistration.js";
import VoiceVerification from "./voiceModule/voiceVerification.js";
import NavBar from "./assets/NavBar.js";
import Home from "./Home.js";
import "@aws-amplify/ui-react/styles.css";
import "bulma/css/bulma.css";

import awsExports from "./aws-exports";

Amplify.configure(awsExports);

function App({ signOut, user }) {
  return (
    <nav>
      <NavBar user={user} signOut={signOut} />
      <div className="App">
        <React.StrictMode>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route
                path="/registration"
                element={<VoiceRegistration user={user} />}
              />
              <Route
                path="/verification"
                element={<VoiceVerification user={user} />}
              />
            </Routes>
          </BrowserRouter>
        </React.StrictMode>
      </div>
    </nav>
  );
}

export default withAuthenticator(App);
