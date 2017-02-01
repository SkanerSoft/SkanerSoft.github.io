var TopDownJS = function (pjs) {
	'use strict';

	var log    = pjs.system.log;     // log = console.log;
	var game   = pjs.game;           // Game Manager
	var point  = pjs.vector.point;   // Constructor for Point
	var camera = pjs.camera;         // Camera Manager
	var brush  = pjs.brush;          // Brush, used for simple drawing
	var OOP    = pjs.OOP;            // Object's manager
	var math   = pjs.math;           // More Math-methods
	var levels = pjs.levels;         // Levels manager
	var _TopDownJS = this;

	var statics = [];
	_TopDownJS.addStatic = function (obj) {
		statics.push(obj);
	};

	var walls = [];
	_TopDownJS.addWall = function (obj) {
		walls.push(obj);
	};

	_TopDownJS.onWallCollision = false;

	var player = false;
	_TopDownJS.setPlayer = function (obj) {
		obj.speed = point(0, 0);
		player = obj;
		return player;
	};

	_TopDownJS.getPlayerDirection = function () {
		if (!player || (!player.speed.y && !player.speed.x)) return false;
		if (!player.speed.x) return player.speed.y > 0 ? 'DOWN' : 'TOP';
		if (!player.speed.y) return player.speed.x > 0 ? 'RIGHT' : 'LEFT';

		if (player.speed.x > 0) return player.speed.y > 0 ? 'RIGHT_DOWN' : 'RIGHT_TOP';
		if (player.speed.x < 0) return player.speed.y > 0 ? 'LEFT_DOWN' : 'LEFT_TOP';
	};




	_TopDownJS.update = function () {

		// statics
		OOP.forArr(statics, function (st) {
			if (st.isInCameraStatic())
				st.draw();
		});

		// walls
		OOP.forArr(walls, function (wall, idEl) {
			if (wall.isInCameraStatic())
				wall.draw();
			// wall.drawStaticBox();

			if (player) {
				var boxWall = wall.getStaticBox();
				if (player.isStaticIntersect(boxWall)) {
					var boxPlayer = player.getStaticBox();

					if (boxPlayer.x+boxPlayer.w > boxWall.x+boxWall.w/10 && boxPlayer.x < boxWall.x+boxWall.w-boxWall.w/10) {
						if (player.speed.y > 0 && boxPlayer.y+boxPlayer.h+player.speed.y < boxWall.y+boxWall.h/2) {
							player.speed.y = 0;
						} else if (player.speed.y <= 0 && boxPlayer.y+player.speed.y > boxWall.y+boxWall.h/2) {
							player.speed.y = 0;
						}
					}

					if (boxPlayer.y+boxPlayer.h > boxWall.y+boxWall.h/10 && boxPlayer.y < boxWall.y+boxWall.h-boxWall.h/10) {
						if (player.speed.x > 0 && boxPlayer.x+boxPlayer.w+player.speed.x < boxWall.x+boxWall.w/2) {
							player.speed.x = 0;
						} else if (player.speed.x <= 0 && boxPlayer.x+player.speed.x > boxWall.x+boxWall.w/2) {
							player.speed.x = 0;
						}
					}

					if (_TopDownJS.onWallCollision) {
						_TopDownJS.onWallCollision(player, wall);
					}
				}

			}

		});


		if (player) {

			if (player.speed.x) {
				player.x += player.speed.x;
			}

			if (player.speed.y) {
				player.y += player.speed.y;
			}


			player.draw();
			// player.drawStaticBox();
		}

	};

};