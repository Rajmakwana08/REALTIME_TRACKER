const express = require('express');
const app = express();

const http = require('http');
const path = require('path');

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server)

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

// Store last known locations by user name
const lastLocations = {};

io.on("connection", function(socket) {
  // When a new client connects, send all last known locations
  Object.values(lastLocations).forEach((data) => {
    socket.emit("receive-location", data);
  });

  socket.on("send-location", function(data){
    // Store/update the user's last location by name
    if (data.name) {
      lastLocations[data.name] = data;
    }
    // Broadcast the name with the location
    io.emit("receive-location", data);
  });
  
  socket.on("disconnect", function() {
    // Do not remove from lastLocations, so marker stays
  })
})

app.get('/', (req, res) => {
  res.render("index");
});

server.listen(3000);