let client;


function setupMQTT(){
  // MQTT client details:
  let MQTTBroker = {
      hostname: `itp-cow-coral.cloud.shiftr.io`,
      port: `443`
  };
  // client credentials:
  let MQTTCreds = {
      clientID: 'Coral-Community',
      userName: 'itp-cow-coral',
      password: 'KfJGdpgNyNgxeDJX'
  }
    //MQTT - Private:

  client = new Paho.MQTT.Client(MQTTBroker.hostname, Number(MQTTBroker.port), MQTTCreds.clientID);
  // set callback handlers for the client:
  client.onConnectionLost = () => {
    console.log("lost connection");
  };

  client.onMessageArrived = onMQTTMessageArrive;

  // connect to the MQTT broker:
    client.connect(
        {
            onSuccess: () => {
            console.log("MQTT Connected Successfully ");  
            client.subscribe(`/${MQTT_TOPICS[`PREVENT_TIMEOUT`]}`);
            client.subscribe(`/${MQTT_TOPICS[`CUSTOMIZER`]}`);
            client.subscribe(`/${MQTT_TOPICS[`VIDEO_TRIGGER`]}`);
            client.subscribe(`/${MQTT_TOPICS[`SPAWN_CORAL`]}`);

            },
            userName: MQTTCreds.userName,   // username
            password: MQTTCreds.password,   // password
            useSSL: true                // use SSL
        }
    );
}

const onMQTTMessageArrive = (message) => {
  const actualData = JSON.parse(message.payloadString);

   if(actualData && actualData.state !== MQTT_TOPICS[`SPAWN_CORAL`]){
      console.log("MQTT message has arrived: ", actualData);
    }


  if(actualData && actualData.state === MQTT_TOPICS[`CUSTOMIZER`]){
    userCoral = actualData;
    window.userCoral = userCoral;
  }

};

function sendMqttMessage(data) {
    // if the client is connected to the MQTT broker:
    if (client.isConnected()) {

        const formattedData = {
          ...data,
          state: MQTT_TOPICS['SPAWN_CORAL']
        };
        console.log('Sending MQTT Msg: ', formattedData);

        const finalDataString = JSON.stringify(formattedData);
        // start an MQTT message:
        message = new Paho.MQTT.Message(finalDataString);
        // choose the destination topic:
        message.destinationName = MQTT_TOPICS['SPAWN_CORAL'];
        client.send(message);
        return true;
    }
    else{
      console.log("Not connected");
      return false;
    }
}
