//Projector side
var socket = io();
var rotations;
var zRot=0;
var xRot=0;
var yRot=0;
var oldxRot=0;
var oldyRot=0;
var oldzRot=0;

socket.on('connect', function(){
    console.log("Socket connected");
    //Some three.js crazy shit happening!!
});

socket.on('serverData', function(data){
    var dataParsed = split(data, ",");
    zRot=dataParsed[2];
    yRot=dataParsed[1];
    xRot=dataParsed[0];
    //console.log("x: "+xRot+" y: "+yRot+" z: "+zRot);
});

function setup(){
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw(){
  background(200);
  rotateX(radians(xRot));
  rotateY(radians(yRot));
  rotateZ(radians(zRot));
  box(200, 200, 200);
}
