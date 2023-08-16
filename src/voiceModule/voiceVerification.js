import "bulma/css/bulma.css";
import MicRecorder from "mic-recorder-to-mp3";
import React, { useState } from "react";
import Axios from "axios";

const GET_OTP_ENDPOINT =
  "https://dewfiig392.execute-api.us-east-1.amazonaws.com/dev/otp";

const GET_URL_ENDPOINT =
  "https://dewfiig392.execute-api.us-east-1.amazonaws.com/dev/get-url";

const STEP_FUNCTIONS_EXECUTION =
  "https://dewfiig392.execute-api.us-east-1.amazonaws.com/dev/execution";

const STEP_FUNCTIONS_RESOLUTION =
  "https://dewfiig392.execute-api.us-east-1.amazonaws.com/dev/resolution";

export const VoiceVerification = (user) => {
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

    let result = await Axios({
      method: "PUT",
      url: presignedUrl,
      data: state.recorded_file,
    }).catch((error) => console.error(error));
    console.log(result);


    let executionResult = await Axios({
      method: "POST",
      url: STEP_FUNCTIONS_EXECUTION,
      data: {
      input: JSON.stringify({
        user_id: user.user.attributes.sub,
        bucket_name: "vv-staging",
        file_key: user.user.attributes.sub + "/" + state.recorded_file.name
      }),
      name: state.recorded_file.name,
      stateMachineArn:
        "arn:aws:states:us-east-1:432795727339:stateMachine:voice-verification-step-function"
    }
    }).catch((error) => console.error(error));
    
    console.log(executionResult);
    
    var jsonResponseOfExecution;
    while(true) {
    jsonResponseOfExecution = await Axios({
      method: "POST",
      url: STEP_FUNCTIONS_RESOLUTION,
      data: {
      executionArn: executionResult.data.executionArn ,
      name: state.recorded_file.name,
      stateMachineArn:
        "arn:aws:states:us-east-1:432795727339:stateMachine:voice-verification-step-function"
    }
    }).catch((error) => console.error(error));
    if (jsonResponseOfExecution.data.status !== "RUNNING" || jsonResponseOfExecution.data.status === "FAILED"){
      break;
    }
      
  };
  console.log(jsonResponseOfExecution);
  document.getElementById("submit").innerHTML = "Re-submit";
  var mainContainer = document.getElementById("resultOfQuery");
  var div = document.createElement("div");
  console.log(jsonResponseOfExecution);
  div.innerHTML = JSON.stringify(jsonResponseOfExecution.data.output);
  // mainContainer.append(di)
  mainContainer.appendChild(div);
}


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
          <div id="voice-title">Voice Profile Verification</div>
          <br></br>
          <div id="instructions">
            <h2>
              Please say the following phrase and upload it to verify your voice:
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
                      '<i class="fa fa-circle-o-notch fa-spin"></i>Verifying Your Voice';
                  }}
                  disabled={!state.isDoneRecording}
                >
                  Begin Verification
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
export default VoiceVerification;
