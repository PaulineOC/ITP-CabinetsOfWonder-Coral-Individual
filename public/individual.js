let STATION_TYPE = null;
let GameState = STATES.START;
let newCoral = null;

      
let ctx;
//Image resources:
let oceanBg;
let welcomeScreen;

//Videos

let SRVid;
let hasLoadedSRVid;
let SRVidDom;
let isSRVidPlaying;

let PRVid;
let hasLoadedPRVid;
let PRVidDom;
let isPRVidPlaying;


//Timer
let hasStarted = false;
let timer;
let timeLeft = 30;

var serial;          // variable to hold an instance of the serialport library
var portName = '/dev/tty.usbmodem14101'; // fill in your serial port name here
var inData;                            // for incoming serial data

//Video Functions Declarations
const SRPreloadFn = () => {
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
      
    });
  SRVid.size(window.innerWidth, window.innerHeight);
	};

const PRReloadFn = () => {
	  console.log("Setting up PR Vid");
	  PRVid = createVideo(
	    [PRVidPathHighRes], () => { 
	      
	      console.log("PR Vid has loaded");
	      PRVid.size(window.innerWidth, window.innerHeight);

	      hasLoadedPRVid = true;
	      const AllVids = document.getElementsByTagName("video");
	      PRVidDom = AllVids[0];

	      PRVidDom.addEventListener('playing', videoIsPlaying.bind(this, RESTORATION_TYPE[`Physical`]));
	      PRVidDom.addEventListener('ended', videoIsDoneCallback);
	      PRVidDom.classList.add("hidden");

	      PRVidDom.loop = true;
	      PRVidDom.pause();
	    });
	  PRVid.size(window.innerWidth, window.innerHeight);
	};

const turnOnVideo = () => {
  GameState = STATES.PLAYING;
  let canvas = document.getElementsByTagName("canvas")[0];
  switch(STATION_TYPE){
      case RESTORATION_TYPE.PHYSICAL: 
        console.log("playing physical");
        PRVidDom.muted = true;
        PRVidDom.play();
      break;
      case RESTORATION_TYPE.STRUCTURAL: 
        console.log("playing structural");
        SRVidDom.muted = true;
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

  timer = setInterval(runTimer, timeLeft * 1000);
};


function preload() {
  oceanBg = loadImage('Assets/ocean.png');
  welcome = loadImage('Assets/welcome.png');

  const currLocation = window.location.pathname;
  if(currLocation.includes("physical")){
    STATION_TYPE = RESTORATION_TYPE.PHYSICAL;
    PRPreloadFn();
  }
  else if(currLocation.includes("structural")){
    STATION_TYPE = RESTORATION_TYPE.STRUCTURAL;
    SRPreloadFn();
  }
};

function setup() {
  console.log("Setup");
  ctx = createCanvas(window.innerWidth, window.innerHeight);
  setupMQTT();
}

function draw() {
  let currVid = STATION_TYPE ===  RESTORATION_TYPE.STRUCTURAL ? SRVid : PRVid;
  switch(GameState){
    case STATES.END:
      image(oceanBg, 0, 0, window.innerWidth, window.innerHeight);
      drawTimerText();
      break;
    case STATES.START:
      image(welcome, 0,0, window.innerWidth, window.innerHeight);
    case STATES.PLAYING:
      image(currVid, 0,0, window.innerWidth, window.innerHeight);
      break;
  }
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
  else if(keyCode=== ENTER){
    if(userCoral){
		setupMQTT(userCoral);
	}
  }

  else if(keyCode=== RIGHT_ARROW){
    console.log("Sending p5 -> p5 MQTT Test message");
    sendMqttMessage(topic2);
  }
}


// window.addEventListener("keyup", (event) => {

// 	//SPACE - receive coral
// 	if (event.keyCode === 65) {


// 	}
// 	//ENTER - send new coral
// 	if (event.keyCode === 13) {

// 		if(newCoral){
// 			setupMQTT(newCoral);

// 		}
// 	}

// });


