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


	var tasks = {};
	_TopDownJS.newTask = function (key, level, success) {
		tasks[key] = {
			level : level,
			score : 0,
			end : success,

			progress : function () {
				return Math.ceil(this.score / this.level * 100);
			},

			up : function (s) {
				this.score+= s || 1;
				if (this.score >= this.level) {
					this.end();
				}
			}
		};
	};

	_TopDownJS.task = function (key) {
		return tasks[key];
	};



	var statics = [];
	_TopDownJS.addStatic = function (obj) {
		statics.push(obj);
	};

	var walls = [];
	_TopDownJS.addWall = function (obj) {
		obj.where = walls;
		walls.push(obj);
	};

	var options = [];
	_TopDownJS.addOption = function (obj) {
		obj.where = options;
		options.push(obj);
	};

	var actions = [];
	_TopDownJS.addAction = function (obj) {
		obj.where = actions;
		obj.speed = point(0, 0);

		obj.run = function (p, s) {
			var a = pjs.math.a2r(pjs.vector.getAngle2Points(this.getPositionC(), p));
			this.prevPosition = this.getPosition();
			this.speed.x = s * Math.cos(a);
			this.speed.y = s * Math.sin(a);
		};

		obj.runAngle = function (s, a) {
			a = math.a2r(OOP.isDef(a) ? a : this.angle);
			this.prevPosition = this.getPosition();
			this.speed.x = s * Math.cos(a);
			this.speed.y = s * Math.sin(a);
		};

		obj.stop = function () {
			this.speed = point(0, 0);
		};

		actions.push(obj);
	};

	_TopDownJS.del = function (obj) {
		if (!obj.where) return;
		OOP.forArr(obj.where, function (el, i) {
			if (obj.id == el.id) {
				obj.where.splice(i, 1);
			}
		});
	};

	_TopDownJS.onActionUpdate = false;
	_TopDownJS.onWallCollision = false;
	_TopDownJS.onWallUpdate = false;
	_TopDownJS.onActionCollision = false;
	_TopDownJS.onActionWallCollisionX = false;
	_TopDownJS.onActionWallCollisionY = false;
	_TopDownJS.onOptionCollision = false;
	_TopDownJS.onOptionUpdate = false;
	_TopDownJS.onStaticUpdate = false;

	var player = false;
	_TopDownJS.setPlayer = function (obj) {

		obj.run = function (p, s) {
			var a = pjs.math.a2r(pjs.vector.getAngle2Points(this.getPositionC(), p));
			this.prevPosition = this.getPosition();
			this.speed.x = s * Math.cos(a);
			this.speed.y = s * Math.sin(a);
		};

		obj.runAngle = function (s, a) {
			a = math.a2r(OOP.isDef(a) ? a : this.angle);
			this.prevPosition = this.getPosition();
			this.speed.x = s * Math.cos(a);
			this.speed.y = s * Math.sin(a);
		};

		obj.stop = function () {
			this.speed = point(0, 0);
		};

		obj.speed = point(0, 0);
		player = obj;
		return player;
	};

	_TopDownJS.getPlayerDirection = function () {
		if (!player || (!player.speed.y && !player.speed.x)) return false;
		if (!player.speed.x) return player.speed.y > 0 ? 'DOWN' : 'UP';
		if (!player.speed.y) return player.speed.x > 0 ? 'RIGHT' : 'LEFT';

		if (player.speed.x > 0) return player.speed.y > 0 ? 'RIGHT_DOWN' : 'RIGHT_UP';
		if (player.speed.x < 0) return player.speed.y > 0 ? 'LEFT_DOWN' : 'LEFT_UP';
	};




	_TopDownJS.update = function () {

		// statics
		OOP.forArr(statics, function (st) {
			if (st.isInCameraStatic()) {
				st.draw();
				if (_TopDownJS.onStaticUpdate) {
					_TopDownJS.onStaticUpdate(st);
				}
			}
		});

		//options
		OOP.forArr(options, function (opt) {
			if (opt.isInCameraStatic())
				opt.draw();

			if (_TopDownJS.onStaticUpdate) {
				_TopDownJS.onStaticUpdate(st);
			}

			if (player) {
				if (_TopDownJS.onOptionCollision) {
					if (opt.isStaticIntersect(player)) {
						_TopDownJS.onOptionCollision(player, opt);
					}
				}
			}
		});

		// draw player
		if (player)
			player.draw();


		// actions
		OOP.forArr(actions, function (act) {
			if (act.isInCameraStatic())
				act.draw();

			if (player) {
				if (_TopDownJS.onActionCollision) {
					if (act.isStaticIntersect(player)) {
						_TopDownJS.onActionCollision(player, act);
					}
				}
			}

			if (_TopDownJS.onActionUpdate) {

				var direction;
				if (!act || (!act.speed.y && !act.speed.x)) direction = false;
				if (Math.abs(act.speed.x) < Math.abs(act.speed.y)) direction = act.speed.y > 0 ? 'DOWN' : 'UP';
				if (Math.abs(act.speed.y) < Math.abs(act.speed.x)) direction = act.speed.x > 0 ? 'RIGHT' : 'LEFT';
				_TopDownJS.onActionUpdate(act, direction);
			}

			if (_TopDownJS.onActionWallCollisionX || _TopDownJS.onActionWallCollisionY) {
				OOP.forArr(walls, function (wall) {

					var boxWall = wall.getStaticBox();
					if (act.isStaticIntersect(boxWall)) {
						var boxAct = act.getStaticBox();


						if (boxAct.x+boxAct.w > boxWall.x+boxWall.w/5 && boxAct.x < boxWall.x+boxWall.w-boxWall.w/5) {
							if ((act.speed.y > 0 && boxAct.y+boxAct.h < boxWall.y+boxWall.h/2)
								|| (act.speed.y < 0 && boxAct.y > boxWall.y+boxWall.h-boxWall.h/2)) {
								if (_TopDownJS.onActionWallCollisionY) {
									_TopDownJS.onActionWallCollisionY(act, wall);
								} else {
									act.speed.y = 0;
								}
							}
						}

						if (boxAct.y+boxAct.h > boxWall.y+boxWall.h/5 && boxAct.y < boxWall.y+boxWall.h-boxWall.h/5) {
							if ((act.speed.x > 0 && boxAct.x+boxAct.w < boxWall.x+boxWall.w/2)
								|| (act.speed.x < 0 && boxAct.x > boxWall.x+boxWall.w-boxWall.w/2)) {
								if (_TopDownJS.onActionWallCollisionX) {
									_TopDownJS.onActionWallCollisionX(act, wall);
								} else {
									act.speed.x = 0;
								}
							}
						}


					}
				});
			}

			if (act.speed.x) {
				act.x += act.speed.x;
			}

			if (act.speed.y) {
				act.y += act.speed.y;
			}

		});


		// walls
		OOP.forArr(walls, function (wall, idEl) {
			if (wall.isInCameraStatic())
				wall.draw();
			// wall.drawStaticBox();

			if (_TopDownJS.onWallUpdate) {
				_TopDownJS.onWallUpdate(wall);
			}

			if (player) {
				var boxWall = wall.getStaticBox();
				if (player.isStaticIntersect(boxWall)) {
					var boxPlayer = player.getStaticBox();

					if (boxPlayer.x+boxPlayer.w > boxWall.x+boxWall.w/5 && boxPlayer.x < boxWall.x+boxWall.w-boxWall.w/5) {
						if (player.speed.y > 0 && boxPlayer.y+boxPlayer.h < boxWall.y+boxWall.h/2) {
							//player.y = -boxPlayer.h-player.box.y+boxWall.y;
							player.speed.y = 0;
						} else if (player.speed.y < 0 && boxPlayer.y > boxWall.y+boxWall.h-boxWall.h/2) {
							player.speed.y = 0;
						}
					}

					if (boxPlayer.y+boxPlayer.h > boxWall.y+boxWall.h/5 && boxPlayer.y < boxWall.y+boxWall.h-boxWall.h/5) {
						if (player.speed.x > 0 && boxPlayer.x+boxPlayer.w < boxWall.x+boxWall.w/2) {
							// player.x = box2.x-boxPlayer.w-player.box.x+1;
							player.speed.x = 0;
						} else if (player.speed.x < 0 && boxPlayer.x > boxWall.x+boxWall.w-boxWall.w/2) {
							// player.x = box2.w+box2.x-player.box.x-1;
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

		}

	};

};