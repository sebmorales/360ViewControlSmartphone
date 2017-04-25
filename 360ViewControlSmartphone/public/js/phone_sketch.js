//phone side

var socket = io();
var rotations;
var oldxRot=0;
var oldyRot=0;
var oldzRot=0;

socket.on('connect', function(){
//  sendGyroData();
});

function sendGyroData(){
  setInterval(function(){
    var num= Math.floor(Math.random(0)*10);
    socket.emit('randomNum',num);
  }, 500);
}

function setup(){
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw(){
  background(200);
  var zRot=-rotationZ;
  var xRot=-rotationX;
  var yRot=-rotationY;

  rotations=xRot+","+yRot+","+zRot;
  //rotations="{ \"x\":"+xRot+",\"y\":"+yRot+",\"z\":"+zRot+"}";//json

  var range=0.005;
  var change=false;
  if(oldxRot-range<xRot && oldxRot+range>xRot){
    change=false;
  }else if(oldyRot-range<yRot && oldyRot+range>yRot){
    change=false;
  }else if(oldzRot-range<zRot && oldzRot+range>zRot){
    change=false;
  } else{
  	change=true;
    oldxRot=xRot;
    oldyRot=yRot;
    oldzRot=zRot;
  }

  if(change){
      socket.emit('rotations',rotations);
  }
  rotateX(radians(-rotationX));
  rotateY(radians(-rotationY));
  rotateZ(radians(-rotationZ));
  box(200, 200, 200);
}
