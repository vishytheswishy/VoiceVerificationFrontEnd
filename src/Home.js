import "bulma/css/bulma.css";
import React, { useState, useEffect } from "react";
import Axios from "axios";

export const Home = (user) => {
  // get status of user and display buttons for verification and registration
  return (
    <div class="containers">
      <div class="column is-centered">
        <h1>
          Welcome to Amazon Identify's voice verification solution. Here is a
          cursory look at our architecture diagram.
        </h1>
        <img
          src={require("./images/architecture.png")}
          width="100%"
          height="103"
          alt="logo for amazon identify"
        />
      </div>
    </div>
  );
};

export default Home;
