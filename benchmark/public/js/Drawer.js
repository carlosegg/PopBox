
// Drawer Class

(function (PBDV, THREE, undefined) {

	"use strict";


	var Drawer = function() {

		// Private State

		var arrayScenes,
			arrayCameras,
			arrayRays,

			threeRenderer,

			canvas = $('#testing'),
			currentScene = 0,
			mouse = { 
				x : 0,
				y : 0
			};


		// Private Methods

		this.createScenes = function( tests ) {
			// TODO use this var for the next objects
			var size = {
				x : 3,
				y : 3,
				z : 3
			};

			/*
			var cap = function( string ) {
		    	return string.charAt(0).toUpperCase() + string.slice(1);
			}
			*/

			var scene1 = new PBDV.Scene();
			scene1.createGraph({
				size : {
					x : 3,
					y : 3,
					z : 3
				},

				titles : {
					x : 'Queues',
					y : 'TPS',
					z : 'Payload'
				},

				test : tests.push
			});

			var scene2 = new PBDV.Scene();
			scene2.createGraph({
				size : {
					x : 3,
					y : 3,
					z : 3
				},

				titles : {
					x : 'Clients',
					y : 'TPS',
					z : 'Payload'
				},

				test : tests.pop
			});

			arrayScenes = [ scene1, scene2 ];

		}


		this.createCameras = function() {
			arrayCameras = [];

			for (var i = 0; i < arrayScenes.length; i++) {
				var camera = new PBDV.Camera();
				
				camera.setCameraControls( this.render );
				if ( i !== 0 ) {
					camera.disableControls();
				}

				arrayCameras.push( camera );
			}

			canvas.mouseenter(onMouseEnter);
			canvas.mouseout(onMouseOut);
		}

		var onMouseMove = function( event ) {
			// update sprite position
			// sprite1.position.set( event.clientX, event.clientY, 0 );
			
			// update the mouse variable
			mouse.x = ( event.clientX / canvas.width() ) * 2 - 1;
			mouse.y = - ( event.clientY / canvas.height() ) * 2 + 1;
		}


		this.createRenderer = function() {
			// Rename
			var Rend = PBDV.Constants.Renderer;

			threeRenderer = new THREE.WebGLRenderer({
				antialias : true
			});

            threeRenderer.setSize( canvas.width(), canvas.height() ); 

			// TODO Add constants !!!
    		threeRenderer.setClearColorHex(0xEEEEEE, 1.0);

			// Attach the render-supplied DOM elements
			canvas.html( threeRenderer.domElement );
		}


		var requestAnimationFrame = function() {

			return window.requestAnimationFrame || 
			window.webkitRequestAnimationFrame  || 
			window.mozRequestAnimationFrame     || 
			window.oRequestAnimationFrame       || 
			window.msRequestAnimationFrame      || 
			function( callback, element) {
				window.setTimeout( callback, 1000 / 60 );
			}

		}

		var onWindowResize = function() {
			var camera = arrayCameras[ currentScene ];

			camera.threeCamera.aspect = canvas.width() / canvas.height();
			camera.threeCamera.updateProjectionMatrix();

			threeRenderer.setSize( canvas.width(), canvas.height() );
		}

		var onMouseEnter = function(event) {
			arrayCameras[ currentScene ].enableControls();
		}

		var onMouseOut = function(event) {
			for (var i = 0; i < arrayCameras.length; i++) {
				arrayCameras[i].disableControls();
			}
		}


		// Public API

		this.init = function() {

			//
			this.createRenderer();

			// 
			window.addEventListener( 'resize', onWindowResize, false);
			window.addEventListener( 'mousemove', onMouseMove, false );
		}

		//var projector;

		var detectCollision = function() {
			var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
			var projector = new THREE.Projector();
			var camera = arrayCameras[currentScene];
			projector.unprojectVector( vector, camera );
			var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

			// create an array containing all objects in the scene with which the ray intersects
			var plot = arrayScenes[currentScene].graph.plot.threePlot;
			var intersects = ray.intersectObject( plot );
			if (intersects.length > 0) {
				console.error("interseca");
				console.log(intersects[0].point);
			}
		}


		this.render = function() {
			var scene  = arrayScenes[ currentScene ];
			var camera = arrayCameras[ currentScene ];

			camera.threeCamera.lookAt(scene.graph.threeGraph.position);

			threeRenderer.render( scene.threeScene, camera.threeCamera );
		}


		this.animate = function() {

			var self = this;

			var raf = requestAnimationFrame();
			raf(function() {
				self.animate();
			});	

			var scene  = arrayScenes[ currentScene ];
			var camera = arrayCameras[ currentScene ];

			camera.animate();

			scene.animate( camera.threeCamera );

			this.render();

		}

		this.addDataTo = function( testNumber, point, lastPoint ) {
			var scene = arrayScenes[ testNumber ];
			scene.addDataToGraph( point, lastPoint );
		}

		this.changeToTest = function( testNumber ) {
			currentScene = testNumber;
			onWindowResize();
		}

		this.configTest = function( tests ) {

			//
			this.createScenes( tests );

			//
			this.createCameras();

			//
			this.animate();

		}

		this.restart = function( testNumber ) {
			var scene = arrayScenes[testNumber];
			scene.restart();
		}

		this.init();

	}

	// Exported to the namespace
	PBDV.Drawer = Drawer;


})( window.PBDV = window.PBDV || {}, 	// Namespace
	THREE);								// Dependencies