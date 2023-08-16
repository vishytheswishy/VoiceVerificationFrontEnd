import "bulma/css/bulma.css";
import MicRecorder from "mic-recorder-to-mp3";
import React, { useState } from "react";
import Axios from "axios";
var base64 = require('base-64');


const GET_OTP_ENDPOINT =
  "https://dewfiig392.execute-api.us-east-1.amazonaws.com/dev/otp";

const GET_URL_ENDPOINT =
  "https://dewfiig392.execute-api.us-east-1.amazonaws.com/dev/get-url";

const REGISTRATION_ENDPOINT =
  "https://dewfiig392.execute-api.us-east-1.amazonaws.com/dev/register";
  

// const STEP_FUNCTIONS_RESOLUTION =
//   "https://dewfiig392.execute-api.us-east-1.amazonaws.com/dev/resolution";

export const VoiceRegistration = (user) => {
  const [index, setIndex] = useState();
  const [state, setState] = useState({
    isRecording: false,
    blobURL: "",
    isBlocked: false,
    isDoneRecording: false,
    recorded_file: null,
    file_name: "",
  });

  const generate = async () => {
    let res = await Axios({
      method: "post",
      url: GET_OTP_ENDPOINT,
      data: {
        uid: user.user.attributes.sub,
        otp_seed: "Description of Business Representation of Transcation: Registration for " + user.user.attributes.sub,
        // needs to be unique  
        tid: "36c3a662-3eb1-4b98-b50d-8150f079702b", 
        // needs to be unique (generate uuid)
        otp_ttl : 300
      },
    });
    setIndex(res["data"]["body"]);
  };

  const [Mp3Recorder] = useState(new MicRecorder({ bitRate: 128 }));

  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  const start = () => {
    if (state.isBlocked) {
      console.log("Permission Denied");
    } else {
      Mp3Recorder.start()
        .then(() => {
          setState({ isRecording: true });
        })
        .catch((e) => console.error(e));
    }
  };

  const stop = () => {
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]) => {
        let uuid = window.crypto.randomUUID();
        const tempfilename = `${uuid}.flac`;
        const blobURL = URL.createObjectURL(blob);
        var temp = new File([blob], tempfilename);
        setState({
          blobURL,
          isRecording: false,
          isDoneRecording: true,
          recorded_file: temp,
          file_name: tempfilename,
        });
      })
      .catch((e) => console.log(e));
      
  };

  // upload allows users to upload a given file to a given
  const upload = async () => {
    
    console.log(state.recorded_file);
    console.log(user.user.attributes.email);
    console.log(state.recorded_file.name);
    // Presigned url
    let res = await Axios({
      method: "post",
      url: GET_URL_ENDPOINT,
      data: {
        uid: user.user.attributes.sub,
        key: state.recorded_file.name,
      },
    });
    console.log(res.data);
    var presignedUrl = res.data.body;
    console.log(presignedUrl);

    // put event
    console.log(state.recorded_file)

    let result = await Axios({
      method: "PUT",
      url: presignedUrl,
      data: state.recorded_file,
    }).catch((error) => console.error(error));
    console.log(result);

    var jsonResponseOfExecution;

    console.log(typeof(state.recorded_file.name))
    try {
      const response = await fetch(REGISTRATION_ENDPOINT, {
        method: "POST",
        body: { 
         voice_recording: state.recorded_file.name,
         uid: user.user.attributes.sub,
         tid: "36c3a662-3eb1-4b98-b50d-8150f079702b"
        }
      });
    
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    
     jsonResponseOfExecution = await response.json();
      // Process jsonResponseOfExecution here
    } catch (error) {
      // Handle errors here
      console.error("Error:", error);
    }
    


  document.getElementById("submit").innerHTML = "Re-submit";
  var mainContainer = document.getElementById("resultOfQuery");
  var div = document.createElement("div");
  mainContainer.appendChild(div);
  };

  return (
    <nav className="container is-centered">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      ></link>
      <div className="columns is-centered is-vcentered">
        <div className="column is-one-fifth ">
          <br></br>
          <br></br>
          <div id="voice-title">Voice Profile Registration</div>
          <br></br>
          <div id="instructions">
            <h2>
              Please say the following phrase and upload it to register your
              voice profile:
            </h2>
          </div>
          <br></br>
          <div className="NewQuoteGenerator container">
            <p className="container">{index}</p>
          </div>
          <br></br>
          <br></br>
          <div className="columns is-centered">
            <div className="container is-vcentered">
              <div>
                <button
                  className="button is-fullwidth is-2000"
                  onClick={generate}
                >
                  Request One-Time Password
                </button>
                <button
                  className="button is-fullwidth is-2000"
                  onClick={start}
                  disabled={state.isRecording}
                >
                  Start Recording
                </button>
              </div>
              <div>
                <button
                  className="button is-fullwidth column is-2000 is-danger"
                  onClick={stop}
                  disabled={!state.isRecording}
                >
                  Stop Recording
                </button>
              </div>
              <div>
                <button
                  id="submit"
                  className="button is-fullwidth is-2000 is-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    upload();
                    document.getElementById("submit").innerHTML =
                      '<i class="fa fa-circle-o-notch fa-spin"></i>Registering Your Voice';
                  }}
                  disabled={!state.isDoneRecording}
                >
                  Begin Registration
                </button>
                <div className="">
                  <audio src={state.blobURL} controls="controls" />
                </div>
              </div>
            </div>
            <br></br>
            <br></br>
          </div>
        </div>
      </div>
      <div className="columns is-centered">
        <div id="resultOfQuery"></div>
        <br></br>
      </div>
    </nav>
  );
};
export default VoiceRegistration;
