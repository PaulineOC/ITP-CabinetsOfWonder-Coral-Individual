require('dotenv').config();

const express = require("express");
const app = express();
const path = require('path');

var publicPath = path.join(__dirname, 'public')

// Serve P5 files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/structural', express.static(path.join(__dirname, 'public')));
app.use('/physical', express.static(path.join(__dirname, 'public')));

const socketIO = require("socket.io");

const server = app.listen(3000, () => {
	console.log("listening on port 3000!");
});

const io = socketIO(server);


