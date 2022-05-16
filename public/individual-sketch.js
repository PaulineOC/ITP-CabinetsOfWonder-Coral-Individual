const RESTORATION_TYPE = {
  PHYSICAL: "PHYSICAL",
  STRUCTURAL: "STRUCTURAL"
}; 
let STATION_TYPE = null;

const STATES = {
  START: "START",
  PLAYING: "PLAYING",
  END: "END",
}; 
let GameState = STATES.START;
      
let ctx;
//Image resources:
let oceanBg;
let welcomeScreen;

//Videos
let SRVidPathLowRes = 'Assets/SR-LR-S1.mp4';
let SRVidPathHighRes = 'Assets/SR-H-Test.mp4';

let SRVid;
let hasLoadedSRVid;
let SRVidDom;
let isSRVidPlaying;

let PRVidPathLowRes = 'Assets/PR-LR.mp4';
let PRVidPathHighRes = 'Assets/PR-H.mp4';

let PRVid;
let hasLoadedPRVid;
let PRVidDom;
let isPRVidPlaying;

let hasStarted = false;
let timer;
let timeLeft = 10;

var serial;          // variable to hold an instance of the serialport library
var portName = '/dev/tty.usbmodem14101'; // fill in your serial port name here
var inData;                            // for incoming serial data
var outByte = 0;


// MQTT client:
let client;

// topic to subscribe to when you connect:
const topic = 'ArduinoMessage';
const topic2 = 'IndividualVideoDone';
const topic3 = 'CoralCustomization';


function preload() {
  oceanBg = loadImage('Assets/ocean.png');
  welcomeScreen = loadImage('Assets/Frame-2.png');

  //TODO: replace with API call
  const currLocation = window.location.pathname;
  if(currLocation.includes("physical")){
    STATION_TYPE = RESTORATION_TYPE.PHYSICAL;
    PRPReloadFn();
  }

  else if(currLocation.includes("structural")){
    STATION_TYPE = RESTORATION_TYPE.STRUCTURAL;
    SRPReloadFn();
  }

};

const SRPReloadFn = () => {

  console.log("Setting up SR Vid");

   SRVid = createVideo(
    [SRVidPathHighRes], () => { 
      
      console.log("SR Vid has loaded");
      SRVid.size(window.innerWidth, window.innerHeight);

      hasLoadedSRVid = true;
      const AllVids = document.getElementsByTagName("video");
      SRVidDom = AllVids[0];
      SRVidDom.addEventListener('playing', videoIsPlaying);
      SRVidDom.addEventListener('ended', videoIsDoneCallback);
      SRVidDom.classList.add("hidden");

      SRVidDom.loop = true;
      SRVidDom.pause();
      image(SRVid, 0,0, SRVid.width, SRVid.height);
      
    });
  SRVid.size(window.innerWidth, window.innerHeight);
};

const PRPReloadFn = () => {
  console.log("Setting up PR Vid");
   PRVid = createVideo(
    [PRVidPathHighRes], () => { 
      
      console.log("PR Vid has loaded");
      PRVid.size(window.innerWidth, window.innerHeight);

      hasLoadedPRVid = true;
      const AllVids = document.getElementsByTagName("video");
      PRVidDom = AllVids[0];

      PRVidDom.addEventListener('playing', videoIsPlaying);
      PRVidDom.addEventListener('ended', videoIsDoneCallback);
      PRVidDom.classList.add("hidden");

      PRVidDom.loop = true;
      PRVidDom.pause();
      image(PRVid, 0,0, PRVid.width, PRVid.height);
      
    });
  PRVid.size(window.innerWidth, window.innerHeight);
};

function setupMQTT(){
  // MQTT client details:
  let MQTTBroker = {
      hostname: `itp-cow-coral.cloud.shiftr.io/mqtt`,
      port: `1883`
  };
  // client credentials:
  let MQTTCreds = {
      clientID: STATION_TYPE === RESTORATION_TYPE.STRUCTURAL ? 'Individual-Structural' : 'Individual-Physical',
      userName: 'itp-cow-coral',
      password: 'KfJGdpgNyNgxeDJX'
  }
    //MQTT - Private:

  client = new Paho.MQTT.Client(MQTTBroker.hostname, Number(MQTTBroker.port), MQTTCreds.clientID);
    // set callback handlers for the client:
    client.onConnectionLost = () => {
      console.log("lost connection");
    };
    client.onMessageArrived = onMQTTMessageArrived;

  // connect to the MQTT broker:
    client.connect(
        {
            onSuccess: () => {    
              client.subscribe(topic);
              client.subscribe(topic2);
            },       // callback function for when you connect
            userName: MQTTCreds.userName,   // username
            password: MQTTCreds.password,   // password
            useSSL: true                // use SSL
        }
    );
};

function setup() {
  console.log("Setup");
  ctx = createCanvas(window.innerWidth, window.innerHeight);
  setupMQTT();

  //OLD Serial Port

  /**

  serial = new p5.SerialPort();    // make a new instance of the serialport library
  
  serial.on('data', serialEvent);  // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.open(portName); 

  serial.on('connected', ()=>{
    console.log("connected to port!");
  });

  serial.on("open", (data) => {
    console.log("open port");
  });
  **/   
}

function serialEvent() {
  // read a byte from the serial port:
  var inByte = serial.readString();
  //var inByte = serial.readStringUntil("\r\n");
  //console.log(inByte);
  // store it in a global variable:
  inData = inByte;
  if(inByte == "1" && !hasStarted){
    console.log("Turn on video");
    hasStarted = true;
    turnOnVideo();
  }
  serial.write('r');
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

const turnOnVideo = () => {
  GameState = STATES.PLAYING;
  let canvas = document.getElementsByTagName("canvas")[0];
  switch(STATION_TYPE){
      case RESTORATION_TYPE.PHYSICAL: 
        console.log("playing physical");
        PRVidDom.play();
      break;
      case RESTORATION_TYPE.STRUCTURAL: 
        console.log("playing structural");
        SRVidDom.play();
      break;
  }
}

const videoIsPlaying = () => {
  switch(STATION_TYPE){
      case RESTORATION_TYPE.PHYSICAL: 
        if(isPRVidPlaying){
          console.log("PR Vid is Done");
          PRVidDom.pause();
          videoIsDoneCallback();
          return;
        }
        else{
          console.log("PR Vid Is Playing");
          isPRVidPlaying = true;
          return;
        }
        break;
      case RESTORATION_TYPE.STRUCTURAL: 
        if(isSRVidPlaying){
          console.log("SR Vid is Done");
          SRVidDom.pause();
          videoIsDoneCallback();
          return;
        }
        else{
          console.log("SR Vid Is Playing");
          isSRVidPlaying = true;
          return;
        }
      break;
  }

};

const videoIsDoneCallback = () => {

  switch(STATION_TYPE){
      case RESTORATION_TYPE.PHYSICAL: 
        isPRVidPlaying = false;
      break;
      case RESTORATION_TYPE.STRUCTURAL: 
        isSRVidPlaying = false;
      break;
  }
  sendMqttMessage(topic2);
  GameState = STATES.END;

  timer = setInterval(runTimer, 1000);
};

const runTimer = () => {
  timeLeft--;
  if(timeLeft <= 0 ){
    clearInterval(timer);
    resetInteractive();
  }
};

const resetInteractive = () => {
  GameState = STATES.START;
  isSRVidPlaying = false;
  isPRVidPlaying = false;
  timeLeft = 10;
};

function draw() {
  let currVid = STATION_TYPE ===  RESTORATION_TYPE.STRUCTURAL ? SRVid : PRVid; 

  switch(GameState){
    case STATES.END:
      image(oceanBg, 0, 0, window.innerWidth, window.innerHeight);
      drawTimerText();
      break;
    case STATES.START:
    case STATES.PLAYING: 
      image(currVid, 0,0, currVid.width, currVid.height);
      break;
  }
}

function drawTimerText(){
  const fontSize = 50;
  textSize(fontSize);
  const phrase1 = "Resetting in:";
  const phrase1Width = textWidth(phrase1);
  const phrase2 = `${timeLeft} seconds`;
  const phrase2Width = textWidth(phrase2);

  text(phrase1, window.innerWidth/2-phrase1Width/2, window.innerHeight/2-fontSize);
  text(phrase2, window.innerWidth/2-phrase2Width/2, window.innerHeight/2+fontSize);
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    console.log("Up pressed (fake switch)");
    turnOnVideo();
  }
  else if (keyCode === BACKSPACE) {
    console.log("BACKSPACE pressed");
      serial.write("g");
  }
  else if(keyCode=== LEFT_ARROW){
    console.log("sending ARDUINO MQTT Test message");
    sendMqttMessage(topic);
  }

  else if(keyCode=== RIGHT_ARROW){
    console.log("Sending p5 -> p5 MQTT Test message");
    sendMqttMessage(topic2);
  }
}

// MQTT: 
const onMQTTMessageArrived = (message) => {
  console.log("Message has arrived");
  const actualData = JSON.parse(message.payloadString);
  if(actualData.state === "ARDUINO-ON"){
    turnOnVideo();
  }
};

function sendMqttMessage(topicDestination) {
    // if the client is connected to the MQTT broker:
    if (client.isConnected()) {

        let msg = `${STATION_TYPE}-HI`;
        const finalData = {
          name: "Bob",
          red: "255",
          blue: "0",
          green: "255",
          state: "VID-DONE",
          type: STATION_TYPE,
        };
        const finalDataString = JSON.stringify(finalData);
        // start an MQTT message:
        message = new Paho.MQTT.Message(finalDataString);
        // choose the destination topic:
        message.destinationName = topicDestination;
        // send it:
        client.send(message);
    }
}

