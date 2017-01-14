var PlatformerJS = function (pjs) {
	var _PlatformerJS = this;
	var log    = pjs.system.log;     // log = console.log;
	var game   = pjs.game;           // Game Manager
	var point  = pjs.vector.point;   // Constructor for Point
	var size  = pjs.vector.size;   // Constructor for Point
	var camera = pjs.camera;         // Camera Manager
	var brush  = pjs.brush;          // Brush, used for simple drawing
	var OOP    = pjs.OOP;            // Object's manager
	var math   = pjs.math;           // More Math-methods
	var levels = pjs.levels;         // Levels manager

	var objs = [];

	var width  = game.getWH().w; // width of scene viewport
	var height = game.getWH().h; // height of scene viewport

	// TYPES
	// 0 - sprite
	// 1 - floor
	// 2 - wall
	// 3 - cell
	// 10 - action
	// 11 - enemy


	// config
	_PlatformerJS.onCellDestroy = false;
	_PlatformerJS.autoDraw = true;
	_PlatformerJS.player = {
		id : -1
	};

	var backArray = false;
	var backImage = false;
	var scrollSpeed = 0;

	this.setBackImage = function (file) {
		game.newImageObject({
			file : file,
			onload : function () {
					this.resize(size(false, height));
					var that = this;
					var count = Math.ceil(width / this.w);
					backArray = [];
					OOP.fillArr(backArray, count+1, function () {
						return game.newImageObject({
							file : file,
							w : that.w,
							h : that.h
						});
					});
			}
		});
	};

	this.getObjects = function () {
		return objs;
	};

	this.del = function (obj) {
		OOP.forArr(objs, function (el, id) {
			if (el.id == obj.id)
				objs.splice(id, 1);
		});
	};

	this.addAction = function (obj) {
		if (!obj.speed) obj.speed = point(0, 0);
		if (!obj.maxSpeed) obj.maxSpeed = point(0, 0);
		if (!obj.mass) obj.mass = 0;
		if (!obj.friction || obj.friction <= 0) obj.friction = 0;
		if (!obj.gravity) obj.gravity = point(0, 0);

		obj.plType = 10;
		obj.jumped = false;
		obj.jump = function (s) {
			if (!obj.jumped) {
				obj.jumped = true;
				obj.speed.y = -s;
			}
		};

		objs.push(obj);
	};

	this.addEnemy = function (obj) {
		if (!obj.speed) obj.speed = point(0, 0);
		if (!obj.maxSpeed) obj.maxSpeed = point(0, 0);
		if (!obj.mass) obj.mass = 0;
		if (!obj.friction || obj.friction <= 0) obj.friction = 0;
		if (!obj.gravity) obj.gravity = point(0, 0);

		obj.plType = 11;
		obj.jumped = false;
		obj.jump = function (s) {
			if (!obj.jumped) {
				obj.jumped = true;
				obj.speed.y = -s;
			}
		};

		objs.push(obj);
	};

	this.addStatic = function (obj) { // type 0
		obj.plType = 0;
		objs.push(obj);
	};

	this.addWall = function (obj) { // type 2
		obj.plType = 2;
		objs.push(obj);
	};

	this.addCell = function (obj) { // type 2
		obj.motionPosition = obj.getPositionC();
		if (!obj.jumpSpeed) obj.jumpSpeed = 0;
		obj.plType = 3;
		objs.push(obj);
	};

	this.update = function () {

		if (backArray) {
			backArray[0].setPositionS(point(0, 0));
			OOP.forArr(backArray, function (el, i, arr, old) {

				if (i > 0) {
					el.setPosition(point(old.x + old.w, old.y));
				}

				if (el.isInCameraStatic()) {
					el.draw();
				}

			});
		}

		OOP.forArr(objs, function (el) {

			if (el.plType == 10 || el.plType == 11) {

				if (el.friction) {

					if (el.speed.x > 0) {
						el.speed.x -= el.friction;
						if (Math.abs(el.speed.x) < el.friction * 2)
							el.speed.x = 0;
					} else if (el.speed.x < 0) {
						el.speed.x += el.friction;
						if (Math.abs(el.speed.x) < el.friction * 2)
							el.speed.x = 0;
					}

					if (el.speed.y > 0) {
						el.speed.y -= el.friction;
						if (Math.abs(el.speed.y) < el.friction * 2)
							el.speed.y = 0;
					} else if (el.speed.y < 0) {
						el.speed.y += el.friction;
						if (Math.abs(el.speed.y) < el.friction * 2)
							el.speed.y = 0;
					}

				}

				if (el.gravity.y) {
					el.speed.y += el.gravity.y;
				}

				if (el.plType == 10 || el.plType == 11)
				OOP.forArr(objs, function (el2, idEl2) {
					if (el.id == el2.id) return;
					if (!el2.plType) return;

					if (el2.plType == 2) { // wall
						if (el.x < el2.x+el2.w && el.x+el.w > el2.x) {
							if (el.isStaticIntersect(el2.getStaticBox()) && el.speed.y > 0 && el.y+el.h-el.speed.y*2 < el2.y) {
								el.speed.y = 0;
								el.y = -el.h + el2.y;
								el.jumped = false;
							} else if (el.isStaticIntersect(el2.getStaticBox()) && el.speed.y < 0 && el.y-el.speed.y > el2.y+el2.h) {
								// el.y = el2.y+el2.h;
								// el.y -= el.speed.y;
								el.speed.y *= -0.5;
								el.jumped = true;
							}

						}
					}

					if (el2.plType == 2) { // wall
						if (el.y+el.h > el2.y) {
							if (el.isStaticIntersect(el2.getStaticBox()) && el.speed.x > 0 && el.x+el.w-el.speed.x < el2.x) {
								el.x -= el.speed.x;
								if (el.plType != 11)
									el.speed.x = 0;
								else
									el.speed.x = -el.speed.x;
							} else if (el.isStaticIntersect(el2.getStaticBox()) && el.speed.x < 0 && el.x-el.speed.x > el2.x+el2.w) {
								el.x -= el.speed.x;
								if (el.plType != 11)
									el.speed.x = 0;
								else
									el.speed.x = -el.speed.x;
							}
						}
					}

					if (_PlatformerJS.player.id != -1) {

						if (el2.plType == 3) { // cell
							if (_PlatformerJS.player.isStaticIntersect(el2.getStaticBox())) {
								if (_PlatformerJS.onCellDestroy) {
									_PlatformerJS.onCellDestroy(_PlatformerJS.player, el2);
								}
							}
						}

						if (el2.plType == 11) { // enemy
							if (_PlatformerJS.player.isStaticIntersect(el2.getStaticBox())) {
								if (_PlatformerJS.onEnemyCollision) {
									_PlatformerJS.onEnemyCollision(_PlatformerJS.player, el2);
								}
							}
						}

					}

				});

				if (el.maxSpeed.x) {
					if (el.speed.x > el.maxSpeed.x) {
						el.speed.x = el.maxSpeed.x;
					}
				}

				if (el.maxSpeed.y) {
					if (el.speed.y > el.maxSpeed.y) {
						el.speed.y = el.maxSpeed.y;
					}
				}

				if (el.speed.x) {
					el.x += el.speed.x;
				}

				if (el.speed.y) {
					el.jumped = true;
					el.y += el.speed.y;
				} else {
					el.jumped = false;
				}
			} else if (el.plType == 3) { // cell
				el.motionC(el.motionPosition, size(0, 2.5), el.jumpSpeed || 3);
			}

			if (_PlatformerJS.autoDraw) {
				if (el.isInCameraStatic()) {
					el.draw();
				}
				// el.drawStaticBox();
			}

		});

	};

};