const RESTORATION_TYPE = {
  PHYSICAL: "PHYSICAL",
  STRUCTURAL: "STRUCTURAL"
}; 
const STATION_TYPE = RESTORATION_TYPE.PHYSICAL;

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
let SRVid;
let hasLoadedSRVid;
let SRVidDom;
let isSRVidPlaying;

let PRVid;
let hasLoadedPRVid;
let PRVidDom;
let isPRVidPlaying;

let hasStarted = false;




var serial;          // variable to hold an instance of the serialport library
var portName = '/dev/tty.usbmodem14101'; // fill in your serial port name here
var inData;                            // for incoming serial data
var outByte = 0;

function preload() {
  oceanBg = loadImage('Assets/ocean.png');
  welcomeScreen = loadImage('Assets/Frame-2.png');

  switch(STATION_TYPE){

    case RESTORATION_TYPE.PHYSICAL:
      PRPReloadFn();
      break;
    case RESTORATION_TYPE.STRUCTURAL:
      SRPReloadFn();
      break;
  }
  
};


const SRPReloadFn = () => {

  console.log("Setting up SR Vid");

   SRVid = createVideo(
    ['Assets/SR-LR-S1.mp4'], () => { 
      
      console.log("SR Vid has loaded");
      SRVid.size(window.innerWidth, window.innerHeight);

      hasLoadedSRVid = true;
      const AllVids = document.getElementsByTagName("video");
      SRVidDom = AllVids[0];

      SRVidDom.onplaying = (event) => {
        isSRVidPlaying = true;
        console.log("SR Vid Is Playing");
      };

      SRVidDom.addEventListener('ended', videoIsDoneCallback);

      SRVidDom.classList.add("instructionalVideos");
      SRVidDom.classList.add("hidden");
      
    });
  SRVid.size(window.innerWidth, window.innerHeight);
};


const PRPReloadFn = () => {

  console.log("Setting up PR Vid");

   PRVid = createVideo(
    ['Assets/PR-LR.mp4'], () => { 
      
      console.log("PR Vid has loaded");
      PRVid.size(window.innerWidth, window.innerHeight);

      hasLoadedPRVid = true;
      const AllVids = document.getElementsByTagName("video");
      PRVidDom = AllVids[0];

      PRVidDom.onplaying = (event) => {
        isPRVidPlaying = true;
        console.log("PR Vid Is Playing");
      };

      PRVidDom.addEventListener('ended', videoIsDoneCallback);

      PRVidDom.classList.add("instructionalVideos");
      PRVidDom.classList.add("hidden");
      
    });
  PRVid.size(window.innerWidth, window.innerHeight);
};



function setup() {
  ctx = createCanvas(window.innerWidth, window.innerHeight);
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
  //canvas.classList.add("hidden");
  
  switch(STATION_TYPE){
      case RESTORATION_TYPE.PHYSICAL: 
        PRVidDom.classList.remove("hidden");
        console.log("playing physical");
        PRVidDom.play();
      break;
      case RESTORATION_TYPE.STRUCTURAL: 
        SRVidDom.classList.remove("hidden");
        console.log("playing structural");
        SRVidDom.play();
      break;
  }
}

const videoIsDoneCallback = () => {

  switch(STATION_TYPE){
      case RESTORATION_TYPE.PHYSICAL: 
        PRVidDom.classList.add("hidden");
        console.log("PR Vid Done");
        isPRVidPlaying = false;
      break;
      case RESTORATION_TYPE.STRUCTURAL: 
        SRVidDom.classList.add("hidden");
        console.log("SR Vid done");
        isSRVidPlaying = false;
      break;
  }
  GameState = STATES.END;
};

function draw() {
  
  switch(GameState){
    case STATES.START:
      image(welcomeScreen, 0, 0, window.innerWidth, window.innerHeight);
      //image();
      break;
    case STATES.END:
      image(oceanBg, 0, 0, window.innerWidth, window.innerHeight);
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
}

