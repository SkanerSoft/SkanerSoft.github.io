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

	var TYPES = {
		0 : 'Sprite',
		1 : 'Option',
		2 : 'Wall',
		3 : 'Cell',
		10 : 'Action',
		11 : 'Enemy'
	};

	// config
	_PlatformerJS.onCellCollision = false;
	_PlatformerJS.onWallCollision = false;
	_PlatformerJS.onEnemyCollision = false;
	_PlatformerJS.onOptionCollision = false;
	_PlatformerJS.onUpdate = false;
	_PlatformerJS.autoDraw = true;
	_PlatformerJS.debug = false;
	_PlatformerJS.optMode = false;
	_PlatformerJS.useDeltaTime = false;

	var player = {
		id : -1
	};

	this.setPlayer = function (obj) {
		player = obj;
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
			if (el.id == obj.id) {
				objs.splice(id, 1);
			}
		});
	};

	this.addAction = function (obj) {
		if (!obj.speed) obj.speed = point(0, 0);
		if (!obj.maxSpeed) obj.maxSpeed = point(0, 0);
		if (!obj.mass) obj.mass = 0;
		if (!obj.friction || obj.friction <= 0) obj.friction = 0;
		if (!obj.gravity) obj.gravity = 0;

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
		if (!obj.gravity) obj.gravity = 0;

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

	this.addOption = function (obj) { // type 1
		obj.plType = 1;
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

	this.getDT = function () {
		return DT;
	};

	var DT = 1;
	this.update = function () {

		if (_PlatformerJS.useDeltaTime) {
			DT = game.getDT(25);
			DT = DT > 1.5 ? 1 : DT;
		}

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
			if (_PlatformerJS.optMode) {
				if (!el.isInCameraStatic()) {
					return;
				}
			}

			if (el.plType == 10 || el.plType == 11) {

				if (el.friction) {

					if (el.speed.x > 0) {
						el.speed.x -= el.friction * DT;
						if (Math.abs(el.speed.x) < el.friction * 2)
							el.speed.x = 0;
					} else if (el.speed.x < 0) {
						el.speed.x += el.friction * DT;
						if (Math.abs(el.speed.x) < el.friction * 2)
							el.speed.x = 0;
					}

					if (el.speed.y > 0) {
						el.speed.y -= el.friction * DT;
						if (Math.abs(el.speed.y) < el.friction * 2)
							el.speed.y = 0;
					} else if (el.speed.y < 0) {
						el.speed.y += el.friction * DT;
						if (Math.abs(el.speed.y) < el.friction * 2)
							el.speed.y = 0;
					}

				}

				if (el.gravity) {
					el.speed.y += el.gravity * DT;
				}

				if (el.plType == 10 || el.plType == 11)
				OOP.forArr(objs, function (el2, idEl2) {
					if (el.id == el2.id) return;
					if (!el2.plType) return;
					var box2 = el2.getStaticBox();

					if (el2.plType == 2) { // wall
						var box1 = el.getStaticBox();

						if (el.isStaticIntersect(box2)) {

							if (box1.x+box1.w > box2.x+box1.w/4 && box1.x < box2.x+box2.w-box1.w/4) {
								if (el.speed.y > 0 && box1.y+box1.h < box2.y+box1.h/2) {
									el.y = -box1.h-el.box.y+box2.y;
									el.speed.y = 0;
									el.jumped = false;
								} else if (el.speed.y < 0 && box1.y > box2.y+box2.h-box1.h/2) {
									el.speed.y *= -0.5;
									el.jumped = true;
								}
							}

							if (box1.y+box1.h > box2.y+box1.h/4 && box1.y < box2.y+box2.h-box1.h/4) {
								if (el.speed.x > 0 && box1.x+box1.w < box2.x+box1.w/2) {
									el.x = box2.x-box1.w-el.box.x+1;
									if (el.plType != 11) el.speed.x = 0;
									else el.speed.x = -el.speed.x;
								} else if (el.speed.x < 0 && box1.x > box2.x+box2.w-box1.w/2) {
									el.x = box2.w+box2.x-el.box.x-1;
									if (el.plType != 11) el.speed.x = 0;
									else el.speed.x = -el.speed.x;
								}
							}

						}

						if (_PlatformerJS.onWallCollision && player.id != -1) {
							_PlatformerJS.onWallCollision(player, el2);
						}
					}

					if (player.id != -1 && el2.isInCameraStatic()) {

						if (el2.plType == 3) { // cell
							if (player.isStaticIntersect(box2)) {
								if (_PlatformerJS.onCellCollision) {
									_PlatformerJS.onCellCollision(player, el2);
								}
							}
						}

						if (el2.plType == 11) { // enemy
							if (player.isStaticIntersect(box2)) {
								if (_PlatformerJS.onEnemyCollision) {
									_PlatformerJS.onEnemyCollision(player, el2);
								}
							}
						}

						if (el2.plType == 1) { // option
							if (player.isStaticIntersect(box2)) {
								if (_PlatformerJS.onOptionCollision) {
									_PlatformerJS.onOptionCollision(player, el2);
								}
							}
						}

					}

				});

				if (el.maxSpeed.x) {
					if (Math.abs(el.speed.x) >= Math.abs(el.maxSpeed.x)) {
						el.speed.x = el.maxSpeed.x*pjs.math.sign(el.speed.x);
					}
				}

				if (el.maxSpeed.y) {
					if (Math.abs(el.speed.y) >= Math.abs(el.maxSpeed.y)) {
						el.speed.y = el.maxSpeed.y*pjs.math.sign(el.speed.y);
					}
				}

				if (el.speed.x) {
					el.x += el.speed.x * DT;
				}

				if (el.speed.y) {
					el.jumped = true;
					el.y += el.speed.y * DT;
				} else {
					el.jumped = false;
				}
			} else if (el.plType == 3) { // cell
				if (el.jumpSpeed > 0)
					el.motionC(el.motionPosition, size(0, 2.5), el.jumpSpeed * DT);
			}

			if (_PlatformerJS.autoDraw) {
				if (el.isInCameraStatic()) {
					el.draw();

					if (_PlatformerJS.onUpdate) {
						_PlatformerJS.onUpdate(el);
					}

					if (_PlatformerJS.debug) {
						el.drawStaticBox();
					}
				}
			}

		});

	};

};