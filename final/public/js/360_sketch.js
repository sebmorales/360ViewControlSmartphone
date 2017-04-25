var zRot, xRot, yRot;
var oldZ,oldX,oldY;
var socket = io();
var socketActive=false;
var sceneNum=0;
var oldSceneNum=0;


//SOCKETS CODE
socket.on('connect', function(){
    console.log("Socket connected");
});
//data from server
socket.on('serverData', function(data){
    var dataParsed = data.split(',');
		xRot=Number(dataParsed[0]);
		yRot=Number(dataParsed[1]);
    zRot=Number(dataParsed[2]);


		socketActive=true;
    //console.log("x: "+xRot+" y: "+yRot+" z: "+zRot);
});

socket.on('scene', function(data){
    sceneNum=data;
		console.log(sceneNum);
});
//SOCKETS CODE FINISH

//Threejs code starts:
var gravity=true;
var oldGravity=true;
//var worldTexture="white.jpg";
// var worldTexture="clouds.jpg";
//var worldTexture="dunesE.jpg";
var wTextures=["dunes5.jpg","dunesE.jpg","sky2.jpg"]
var worldTexture=wTextures[1];

var camera, scene, renderer;
var container, mesh, material,geometry;

var isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0;

init();
animate();

function init() {
	container = document.getElementById( 'container' );
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
	camera.target = new THREE.Vector3( 0, 0, 0 );
	scene = new THREE.Scene();

	oldX=Number(10.0);
	oldY=Number(10.0);
	oldZ=Number(10.0);

	xRot=10.0;
	yRot=10.0;
	zRot=10.0;
	//geometry = new THREE.SphereGeometry( 500, 60, 40 );
	geometry = new THREE.SphereGeometry( 50,30, 20 );
	geometry.scale( - 1, 1, 1 );

	material = new THREE.MeshBasicMaterial( {
	map: new THREE.TextureLoader().load( worldTexture )
	} );
  // material = new THREE.MeshBasicMaterial( { wireframe: true } );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'wheel', onDocumentMouseWheel, false );
	document.addEventListener( 'dragover', function ( event ) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	}, false );
	document.addEventListener( 'dragenter', function ( event ) {
		document.body.style.opacity = 0.5;
	}, false );
	document.addEventListener( 'dragleave', function ( event ) {
		document.body.style.opacity = 1;
	}, false );
	document.addEventListener( 'drop', function ( event ) {
		event.preventDefault();
		var reader = new FileReader();
		reader.addEventListener( 'load', function ( event ) {
			material.map.image.src = event.target.result;
			material.map.needsUpdate = true;
		}, false );

	reader.readAsDataURL( event.dataTransfer.files[ 0 ] );
		document.body.style.opacity = 1;
	}, false );
	//
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseDown( event ) {
	event.preventDefault();
	isUserInteracting = true;
	onPointerDownPointerX = event.clientX;
	onPointerDownPointerY = event.clientY;
	onPointerDownLon = lon;
	onPointerDownLat = lat;
}

function onDocumentMouseMove( event ) {
	if ( isUserInteracting === true ) {
		lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
		lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
	}
}

function onDocumentMouseUp( event ) {
	isUserInteracting = false;
}

function onDocumentMouseWheel( event ) {
	camera.fov += event.deltaY * 0.05;
	camera.updateProjectionMatrix();
}

function animate() {
	requestAnimationFrame( animate );
	update();
}

function update() {
	if(sceneNum!=oldSceneNum){
		oldSceneNum=sceneNum;
		if(sceneNum==0){
			worldTexture=wTextures[sceneNum];
			mesh.material = new THREE.MeshBasicMaterial( {
			map: new THREE.TextureLoader().load(worldTexture )
			} );
			mesh.material.map.needsUpdate = true;

		}
		if(sceneNum==1){
			worldTexture=wTextures[sceneNum];
			mesh.material = new THREE.MeshBasicMaterial( {
			map: new THREE.TextureLoader().load(worldTexture )
			} );
			mesh.material.map.needsUpdate = true;

		}

		if(sceneNum==2){
			worldTexture=wTextures[sceneNum];
			mesh.material = new THREE.MeshBasicMaterial( {
			map: new THREE.TextureLoader().load(worldTexture )
			} );
			mesh.material.map.needsUpdate = true;

		}
		if(sceneNum==3){
			mesh.material = new THREE.MeshBasicMaterial( { wireframe: true } );
			mesh.material.needsUpdate = true;
		}
	}


	if ( isUserInteracting === false ) {
		//lon += 0.1;
	}
	if(Math.abs(oldX-xRot)>350){
		oldX=xRot;
	}
	if(Math.abs(oldY-yRot)>350){
		oldY=yRot;
	}
	if(Math.abs(oldZ-zRot)>350){
		oldZ=zRot;
	}


	if(oldX!=xRot){
		//console.log(oldX+" "+xRot);
		oldX=(Number(oldX)*9.5+Number(xRot)*0.5)/10.0;
	}
	if(oldY!=yRot){
		//console.log(oldX+" "+xRot);
		oldY=(Number(oldY)*9.5+Number(yRot)*0.50)/10.0;
	}
	if(oldZ!=zRot){
		oldZ=(Number(oldZ)*9.5+Number(zRot)*0.50)/10.0;
	}
	//console.log(Number(oldX)+" "+Number(oldY)+" "+Number(oldZ));

  lat = THREE.Math.degToRad(oldY);
  phi = THREE.Math.degToRad(oldX-90);
  theta = THREE.Math.degToRad(oldZ);

  if (gravity==false){
    phi = THREE.Math.degToRad(oldX);
		camera.fov=150;
		if(oldGravity!=gravity){
			oldGravity=gravity;
			camera.updateProjectionMatrix();
		}
  }


	camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	camera.target.y = -500 * Math.cos( phi )+300;
	camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
	camera.rotateZ(zRot);
	camera.lookAt( camera.target );
	renderer.render( scene, camera );
	socketActive=false;
}
