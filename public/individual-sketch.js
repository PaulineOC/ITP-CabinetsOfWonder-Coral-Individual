let STATION_TYPE = null;
let GameState = STATES.START;
let userCoral = null;

const serial = new p5.WebSerial();
let portButton;

let ctx;

//Image resources:
let oceanBg;
let welcomeScreen;

let bgSound;

//Videos: 
let SRVid;
let hasLoadedSRVid;
let SRVidDom;
let isSRVidPlaying;

let PRVid;
let hasLoadedPRVid;
let PRVidDom;
let isPRVidPlaying;

let hasVideoStarted = false;

let hasTimerStarted = false;
let timeLeft = 10;

function preload() {
  oceanBg = loadImage('Assets/ocean.png');
  welcome = loadImage('Assets/welcome.png');

  soundFormats('mp3');
  bgSound = loadSound(soundPath);
  bgSound.setVolume(5);

  videoPreload();
  
};

function setup() {
  console.log("Setup");
  ctx = createCanvas(window.innerWidth, window.innerHeight);
  setupMQTT();

  setupWebSerial(makePortButton, onWebSerialRead);
}

function draw() {
  let currVid = STATION_TYPE ===  RESTORATION_TYPE.STRUCTURAL ? SRVid : PRVid;
  switch(GameState){
    case STATES.START:
      image(oceanBg, 0,0, window.innerWidth, window.innerHeight);
      drawBeginningText();
      break;
    case STATES.PLAYING:
      image(currVid, 0,0, window.innerWidth, window.innerHeight);
      break;
    case STATES.END:
      image(oceanBg, 0, 0, window.innerWidth, window.innerHeight);
      drawTimerText();

      if(hasTimerStarted){
        let fCount = frameCount;
        timer(frameCount);
      }
      break;
  }
}


/* PRELOAD */
const videoPreload = () => {

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
      
    });
  PRVid.size(window.innerWidth, window.innerHeight);
};

/* START */
function drawBeginningText(){
  textSize(FONT_SIZE);
  const phrase1 = `Welcome to the Coral Restoration Interactive`;
  const phrase1Width = textWidth(phrase1);
  const phrase2 = `Place your coral on the platform to learn about coral restoration`;
  const phrase2Width = textWidth(phrase2);
  text(phrase1, window.innerWidth/2-phrase1Width/2, window.innerHeight/2-FONT_SIZE);
  text(phrase2, window.innerWidth/2-phrase2Width/2, window.innerHeight/2+FONT_SIZE);
}

/* PLAYING */
const turnOnVideo = () => {
  GameState = STATES.PLAYING;
  // let canvas = document.getElementsByTagName("canvas")[0];
  switch(STATION_TYPE){
      case RESTORATION_TYPE.PHYSICAL: 
        console.log("Starting video - physical");
        PRVidDom.muted = true;
        PRVidDom.currentTime = 0;
        PRVidDom.play();
      break;
      case RESTORATION_TYPE.STRUCTURAL: 
        console.log("Starting video - structural");
        SRVidDom.muted = true;
        SRVidDom.currentTime = 0;
        console.log('Current time: ',SRVidDom.currentTime);
        SRVidDom.play();
      break;
  }

  bgSound.loop();
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
  bgSound.pause();
  switch(STATION_TYPE){
      case RESTORATION_TYPE.PHYSICAL: 
        isPRVidPlaying = false;
      break;
      case RESTORATION_TYPE.STRUCTURAL: 
        isSRVidPlaying = false;
      break;
  }

  console.log('Video is done');
  console.log(userCoral);

  if(userCoral){
    sendMqttMessage(userCoral);
  }

  GameState = STATES.END;
  hasTimerStarted = true;
};

/* END */
const timer = (frameCount) => {
  if (frameCount % 60 == 0 && timeLeft > 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
    timeLeft --;
  }
  else if(timeLeft <= 0){
    resetInteractive();
  }
}

/* RESET */ 
const resetInteractive = () => {
  console.log('Resetting Interactive');
  GameState = STATES.START;
  hasTimerStarted = false;
  timeLeft = 10;
  bgSound.pause();
  resetVideo();
};

const resetVideo = () => {
  switch(STATION_TYPE){
    case STATION_TYPE.STRUCTURAL: 
      SRVidDom.pause();
      // SRVidDom.currentTime = 0;
      break;
    case STATION_TYPE.PHYSICAL: 
      PRVidDom.pause();
      // PRVidDom.currentTime = 0;
      break;
  }
  isSRVidPlaying = false;
  isPRVidPlaying = false;
  hasVideoStarted = false;
}

function drawTimerText(){
  textSize(FONT_SIZE);
  const phrase1 = "Resetting in:";
  const phrase1Width = textWidth(phrase1);
  const phrase2 = `${timeLeft} seconds`;
  const phrase2Width = textWidth(phrase2);

  text(phrase1, window.innerWidth/2-phrase1Width/2, window.innerHeight/2-FONT_SIZE);
  text(phrase2, window.innerWidth/2-phrase2Width/2, window.innerHeight/2+FONT_SIZE);
}


/* KEY CODES */

function keyPressed() {
  if (keyCode === UP_ARROW) {
    console.log("UP pressed: playing video");
    turnOnVideo();
  }

}

/* WEB SERIAL */

function onWebSerialRead(){
  const inData =  serial.readString();
  console.log(`Receiving Webserial Data: ${inData}`);

  //Turn on Video 
  if((inData == "1" || inData == "01") && !hasVideoStarted && GameState === STATES.START){
      turnOnVideo();
      hasVideoStarted = true;
      return;
  }

  if(inData == "0" && hasVideoStarted && GameState === STATES.PLAYING ){
    resetInteractive();
    return;
  }

}

function makePortButton() {
  // create and position a port chooser button:
  portButton = createButton("choose port");
  portButton.position(10, 10);
  // give the port button a mousepressed handler:
  portButton.mousePressed(()=>{
    if (portButton) portButton.show();
    serial.requestPort();
  });
}
