var WebSocket = require('ws')
var fs = require('fs')
var ws;
var RandomWords = require('random-words');
var wsUri = "ws://spaceclouds.herokuapp.com";
//var wsUri = "ws://localhost:8080";

function start(wsUri) {  // Create the websocket
    ws = new WebSocket(wsUri);

    ws.onopen = function(evt) {
        console.log("CONNECTED");

// To prevent crashing the browser on heavy traffic, only
// update the display every 700ms if a change is detected
setInterval( function(){
  var topic = "";
  for (var i = 0; i <= Math.ceil(Math.random() * 7); i++){
    topic += RandomWords() + " ";
  }
  console.log(topic);
  ws.send(topic);
}, 200);
    };

    ws.onclose = function(evt) {
        console.log("DISCONNECTED");
        setTimeout(function(){ start(wsUri) }, 3000); // try to reconnect every 3 secs... bit fast ?
    }

    // This expects a websocket message with data as a stringified object containing at least name, lat and lon
    ws.onmessage = function (evt) {
        words = JSON.parse(evt.data);
    }

    ws.onerror = function(evt) {
        console.log("ERROR",evt);
    }
}


start(wsUri);

