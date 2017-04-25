
        'use strict';

        var mouse = {
            x: 0,
            y: 0
        };
        var map, canvas, ctx;
        var marker = null;
        var container, mesh, renderer, camera, scene, material;
        var myShapeGeometry, myShapeMesh, myShapeMaterial;
        var fov = 100,
            nFov = 70;
        var oDist = 0,
            oFov;
        var lat = 0,
            lon = 0,
            nLat = 0,
            nLon = 0;
        var zoom;
        var geocoder;
        var error, errorDiv;
        var message, messageDiv;
        var activeLocation = null;
        var preloader = document.getElementById('preloader');
        var bar = document.getElementById('bar');
        var cd = new Date();
        var time = cd.getTime();
        var position = {
            x: 0,
            y: 0
        };
        var loader = new GSVPANO.PanoLoader();
        var icosahedron;

        function setProgress(progress) {
            bar.style.width = (preloader.clientWidth - 6) * progress / 100 + 'px';
        }

        function showProgress(show) {
            preloader.style.opacity = (show == true) ? 1 : 0;
            preloader.style.display = (show == true) ? 'block' : 'none';
        }

        function setZoom(z) {
            zoom = z;
            loader.setZoom(z);
            if (activeLocation) loader.load(activeLocation);
        }

        function geoSuccess(position) {
            var currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            // map.panTo( currentLocation );
            // addMarker( currentLocation ); // move to position (thanks @theCole!)
        }

        function geoError(message) {
            showError(message);
        }

        function initialize() {

            var locations = [{
                    lat: 40.7292736,
                    lng: -73.9935553
                },
                {
                    lat: 48.8577086,
                    lng: 2.2950612
                },
            ];

            var pos;
            if (window.location.hash) {
                var parts = window.location.hash.substr(1).split(',');
                pos = {
                    lat: parts[0],
                    lng: parts[1]
                };
            } else {
                pos = locations[Math.floor(Math.random() * locations.length)];
            }
            var myLatlng = new google.maps.LatLng(pos.lat, pos.lng);

            // background street view
            canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
            container = document.getElementById('pano');
            camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1100);
            camera.target = new THREE.Vector3(0, 0, 0);

            scene = new THREE.Scene();
            scene.add(camera);

            try {
                var isWebGL = !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
            } catch (e) {}

            renderer = new THREE.WebGLRenderer();
            renderer.autoClearColor = false;
            renderer.setSize(window.innerWidth, window.innerHeight);

            material = new THREE.ShaderMaterial({
                uniforms: {
                    map: {
                        type: "t",
                        // value: THREE.ImageUtils.loadTexture('placeholder.jpg')
                    },
                },
                vertexShader: document.getElementById('vs-sphere').textContent,
                fragmentShader: document.getElementById('fs-sphere').textContent,
                side: THREE.DoubleSide
            });

            var faces = 50;
            mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40), material);
            scene.add(mesh);
            container.appendChild(renderer.domElement);

            var myOptions = {
                zoom: 14,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                streetViewControl: false
            }
            map = new google.maps.Map(document.getElementById("map"), myOptions);
            google.maps.event.addListener(map, 'click', function(event) {
                addMarker(event.latLng);
            });

            geocoder = new google.maps.Geocoder();

            // foreground object
            var icogeometry = new THREE.IcosahedronGeometry(50, 0);
            var icomaterial = new THREE.MeshNormalMaterial();
            icosahedron = new THREE.Mesh(icogeometry, icomaterial);
            icosahedron.position.set(200, 50, -50);
            scene.add(icosahedron);
            icosahedron.rotation.y = -0.25;
            camera.position.z = 50;



            container.addEventListener('mousedown', onContainerMouseDown, false);
            container.addEventListener('mousemove', onContainerMouseMove, false);
            container.addEventListener('mouseup', onContainerMouseUp, false);
            container.addEventListener('touchstart', onTouchStart, false);
            container.addEventListener('touchmove', onTouchMove, false);
            container.addEventListener('touchend', onTouchEnd, false);
            container.addEventListener('touchcancel', onTouchEnd, false);
            container.addEventListener('mousewheel', onContainerMouseWheel, false);
            container.addEventListener('DOMMouseScroll', onContainerMouseWheel, false);
            window.addEventListener('resize', onWindowResized, false);

            onWindowResized(null);

            var el = document.getElementById('myLocationButton');
            el.addEventListener('click', function(event) {
                event.preventDefault();
                navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
            }, false);

            navigator.pointer = navigator.pointer || navigator.webkitPointer || navigator.mozPointer;

            var el = document.getElementById('searchButton');
            el.addEventListener('click', function(event) {
                event.preventDefault();
                findAddress(document.getElementById("address").value);
            }, false);

            errorDiv = document.getElementById('error');
            messageDiv = document.getElementById('message');

            showMessage('Ready. <b>Click a street in the map.</b>');

            loader.onProgress = function(p) {
                setProgress(p);
            };

            loader.onPanoramaData = function(result) {
                showProgress(true);
                showMessage('Panorama OK. Loading and composing tiles...');
            }

            loader.onNoPanoramaData = function(status) {
                showError("Could not retrieve panorama for the following reason: " + status);
            }

            loader.onPanoramaLoad = function() {
                activeLocation = this.location;
                mesh.material.uniforms.map.value = new THREE.Texture(this.canvas[0]);
                mesh.material.uniforms.map.value.needsUpdate = true;
                showMessage('Panorama is loaded.<br/>The images are ' + this.copyright);
                showProgress(false);
            };

            setZoom(4);
            addMarker(myLatlng); // initial position (thanks @mrdoob!)
            animate();
        }

        window.addEventListener('load', initialize, false);


        function findAddress(address) {

            showMessage('Getting coordinates...');
            geocoder.geocode({
                'address': address
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    showMessage('Address found.');
                    addMarker(results[0].geometry.location); // move to position (thanks @jocabola!)
                } else {
                    showError("Geocode was not successful for the following reason: " + status);
                    showProgress(false);
                }
            });
        }

        function showError(message) {
            errorDiv.innerHTML = message;
        }

        function showMessage(message) {
            showError('');
            messageDiv.innerHTML = message;
        }

        function onWindowResized(event) {
            renderer.setSize(container.clientWidth, container.clientHeight);
            camera.projectionMatrix.makePerspective(fov, window.innerWidth / window.innerHeight, camera.near, camera.far);
        }

        var isUserInteracting = false;
        var onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat;

        function onContainerMouseDown(event) {

            event.preventDefault();

            isUserInteracting = true;
            var el = document.querySelectorAll('.hide');
            for (var j = 0; j < el.length; j++) {
                el[j].style.opacity = 0;
                el[j].style.pointerEvents = 'none';
            }

            onPointerDownPointerX = event.clientX;
            onPointerDownPointerY = event.clientY;

            onPointerDownLon = lon;
            onPointerDownLat = lat;


            // icosahedron.position.set(-event.clientX/10, -event.clientY/10, -50);

        }

        function onContainerMouseMove(event) {

            event.preventDefault();

            var lookSpeed = .15;
            var f = fov / 500;
            if (navigator.pointer && navigator.pointer.isLocked) {
                nLon = event.webkitMovementX * f;
                nLat += event.webkitMovementY * f;
            } else if (document.mozPointerLockElement == container) {
                if (Math.abs(event.mozMovementX) < 100 || Math.abs(event.mozMovementY) < 100) {
                    nLon = event.mozMovementX * f;
                    nLat -= event.mozMovementY * f;
                }
            } else {
                if (isUserInteracting) {
                    var dx = (onPointerDownPointerX - event.clientX) * f;
                    var dy = (event.clientY - onPointerDownPointerY) * f;
                    nLon = dx + onPointerDownLon; // reversed dragging direction (thanks @mrdoob!)
                    nLat = dy + onPointerDownLat;
                }
            }

            event.preventDefault();

            // move foreground object
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            vector.unproject(camera);
            var dir = vector.sub(camera.position).normalize();
            var distance = camera.position.z + 150;
            var pos = camera.position.clone().add(dir.multiplyScalar(distance));
            icosahedron.position.copy(pos);

        }

        function onContainerMouseWheel(event) {
            event = event ? event : window.event;
            nFov = fov - (event.detail ? event.detail * -5 : event.wheelDelta / 8);
        }

        function onTouchStart(event) {
            isUserInteracting = true;
            var el = document.querySelectorAll('.hide');
            for (var j = 0; j < el.length; j++) {
                el[j].style.opacity = 0;
                el[j].style.pointerEvents = 'none';
            }
            if (event.touches.length == 2) {
                var t = event.touches;
                oDist = Math.sqrt(
                    Math.pow(t[0].clientX - t[1].clientX, 2) +
                    Math.pow(t[0].clientY - t[1].clientY, 2));
                oFov = nfov;
                isUserPinching = true;
            } else {
                var t = event.touches[0];
                onPointerDownPointerX = t.clientX;
                onPointerDownPointerY = t.clientY;
                onPointerDownLon = lon;
                onPointerDownLat = lat;
            }
            event.preventDefault();
        }

        function onTouchMove(event) {
            if (event.touches.length == 2) {
                var t = event.touches;
                var dist = Math.sqrt(
                    Math.pow(t[0].clientX - t[1].clientX, 2) +
                    Math.pow(t[0].clientY - t[1].clientY, 2));
                nFov = oFov + .1 * (oDist - dist);
            } else {
                var t = event.touches[0];
                nLon = -.1 * (t.clientX - onPointerDownPointerX) + onPointerDownLon;
                nLat = .1 * (t.clientY - onPointerDownPointerY) + onPointerDownLat;
            }
            event.preventDefault();

        }

        function onTouchEnd(event) {
            event.preventDefault();
            isUserInteracting = false;
            var el = document.querySelectorAll('.hide');
            for (var j = 0; j < el.length; j++) {
                el[j].style.opacity = 1;
                el[j].style.pointerEvents = 'auto';
            }
        }

        function onContainerMouseUp(event) {
            event.preventDefault();
            isUserInteracting = false;
            var el = document.querySelectorAll('.hide');
            for (var j = 0; j < el.length; j++) {
                el[j].style.opacity = 1;
                el[j].style.pointerEvents = 'auto';
            }
        }

        function addMarker(location) {
            if (marker) marker.setMap(null);
            marker = new google.maps.Marker({
                position: location,
                map: map
            });
            marker.setMap(map);
            showMessage('Loading panorama for zoom ' + zoom + '...');
            loader.load(location);
        }

        var panoramas = [];
        var circle = null;
        var copyright;


        function animate() {
            requestAnimationFrame(animate);
            render();

            // foreground move
            icosahedron.rotation.x += 0.05;
        }


        var ellapsedTime, ellapsedFactor, phi, theta;

        function render() {

            var cd = new Date();
            var ctime = cd.getTime();

            ellapsedTime = (ctime - time);
            ellapsedFactor = ellapsedTime / 16;

            var s = .15 * ellapsedFactor;
            lon += (nLon - lon) * s;
            lat += (nLat - lat) * s;
            fov += (nFov - fov) * s;

            camera.fov = fov;
            camera.updateProjectionMatrix();

            lat = Math.max(-85, Math.min(85, lat));
            phi = (90 - lat) * Math.PI / 180;
            theta = lon * Math.PI / 180;

            camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
            camera.target.y = 500 * Math.cos(phi);
            camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
            camera.lookAt(camera.target);
            renderer.render(scene, camera);

            time = ctime;
        }
