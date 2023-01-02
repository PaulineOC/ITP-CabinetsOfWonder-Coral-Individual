const RESTORATION_TYPE = {
  PHYSICAL: "PHYSICAL",
  STRUCTURAL: "STRUCTURAL"
}; 

const STATES = {
  START: "START",
  PLAYING: "PLAYING",
  END: "END",
}; 

const MQTT_TOPICS = {
  CUSTOMIZER : 'CUSTOMIZER',
  VIDEO_TRIGGER : 'VIDEO_TRIGGER',
  SPAWN_CORAL: `SPAWN_CORAL`,
  PREVENT_TIMEOUT: `PREVENT_TIMEOUT`,
};


const CORAL_SPECIES = {
  FUNGIA_SCUTARIA: "FUNGIA_SCUTARIA",
  ACROPORA_LORIPES: "ACROPORA_LORIPES",
  ACROPORA_MILLEPORA: "ACROPORA_MILLEPORA"
}; 

const COLORS = {
  RED: "RED",
  ORANGE: "ORANGE",
  YELLOW: "YELLOW",
  GREEN: "GREEN",
  CYAN: "CYAN",
  BLUE: "BLUE",
  PURPLE: "PURPLE",
  PINK: "PINK"
};

const TEST_CORAL = {
  species: CORAL_SPECIES[`ACROPORA_LORIPES`],
  color: COLORS[`GREEN`],
  name: `Jennifer`
};

const FONT_SIZE = 50;

//VIDEOS

const testVidPath = `Assets/Up.mp4`;
const SRVidPathLowRes = 'Assets/SR-LR-S1.mp4';
const SRVidPathHighRes = 'Assets/st-2.mp4';
//const SRVidPathHighRes = testVidPath;

const PRVidPathLowRes = 'Assets/PR-LR.mp4';
const PRVidPathHighRes = 'Assets/ph-2.mp4';
const soundPath = `Assets/underwater.mp3`;