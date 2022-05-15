require('dotenv').config();

const express = require("express");
const app = express();
const socketIO = require("socket.io");


app.use(express.static("public"));//express in the public folder

const server = app.listen(3000, () => {
	console.log("listening on port 3000!");
});

const io = socketIO(server);

const mqtt = require('mqtt');
const client = mqtt.connect('https://itp-cow-coral.cloud.shiftr.io')  // create a client

// the broker you plan to connect to. 
// transport options: 
// 'mqtt', 'mqtts', 'tcp', 'tls', 'ws', or 'wss':
const broker = 'mqtt://itp-cow-coral.cloud.shiftr.io/';


// client options:
const options = {
  clientId: 'nodeClient',
  username: 'Pauline-COW-Individual',
  password: 'KfJGdpgNyNgxeDJX',
}
// topic and message payload:
let myTopic = 'lights';
let payload;

// make a client and connect:
let client2 = mqtt.connect(broker, options);
client2.on('connect', setupClient);

// connect handler:
function setupClient() {
  console.log('setup');
  client.subscribe(myTopic);
  client.on('message', readMqttMessage);
}

// new message handler:
function readMqttMessage(topic, message) {
  // message is a Buffer, so convert to a string:
  let msgString = message.toString();
  console.log(topic);
  console.log(msgString);
}

// message sender:
function sendMqttMessage(topic, msg) {
  if (client.connected) {
    let msgString = JSON.stringify(msg);
    client.publish(topic, msgString);
    console.log('update');
  }
}

// setInterval handler:
function update() {
  payload = Math.round(Math.random(254) * 254);
  sendMqttMessage(myTopic, payload);
}



// send a message every ten seconds:
setInterval(update, 10000);