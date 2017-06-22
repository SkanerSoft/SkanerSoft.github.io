var PlatformerJS = function (pjs) {
	'use strict';

	var _PlatformerJS = this;
	var log    = pjs.system.log;     // log = console.log;
	var game   = pjs.game;           // Game Manager
	var point  = pjs.vector.point;   // Constructor for Point
	var size  = pjs.vector.size;   // Constructor for Point
	var OOP    = pjs.OOP;            // Object's manager

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

		if (!obj.speed) obj.speed = point(0, 0);
		if (!obj.maxSpeed) obj.maxSpeed = point(0, 0);
		if (!obj.mass) obj.mass = 0;
		if (!obj.friction || obj.friction <= 0) obj.friction = 0;
		if (!obj.gravity) obj.gravity = 0;

		obj.jumped = false;
		obj.jump = function (s) {
			if (!obj.jumped) {
				obj.jumped = true;
				obj.speed.y = -s;
			}
		};

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

	var walls   = [];
	var enemies = [];
	var statics = [];
	var actions = [];
	var options = [];
	var cells   = [];

	var drawArray = [];

	this.getObjects = function () {
		return walls.concat(enemies).concat(statics).concat(actions).concat(options).concat(cells);
	};

	this.getCells = function () {
		return cells;
	};


	this.getOptions = function () {
		return options;
	};


	this.getActions = function () {
		return actions;
	};


	this.getStatics = function () {
		return statics;
	};


	this.getEnemies = function () {
		return enemies;
	};

	this.getWalls = function () {
		return walls;
	};


	this.del = function (obj) {
		OOP.forArr(obj.where, function (el, id) {
			if (el.id == obj.id) {
				obj.where.splice(id, 1);
			}
		});
	};

	this.addAction = function (obj) {
		obj.where = actions;
		if (!obj.speed) obj.speed = point(0, 0);
		if (!obj.maxSpeed) obj.maxSpeed = point(0, 0);
		if (!obj.mass) obj.mass = 0;
		if (!obj.friction || obj.friction <= 0) obj.friction = 0;
		if (!obj.gravity) obj.gravity = 0;

		obj.jumped = false;
		obj.jump = function (s) {
			if (!obj.jumped) {
				obj.jumped = true;
				obj.speed.y = -s;
			}
		};

		actions.push(obj);
	};

	this.addEnemy = function (obj) {
		obj.where = enemies;
		if (!obj.speed) obj.speed = point(0, 0);
		if (!obj.maxSpeed) obj.maxSpeed = point(0, 0);
		if (!obj.mass) obj.mass = 0;
		if (!obj.friction || obj.friction <= 0) obj.friction = 0;
		if (!obj.gravity) obj.gravity = 0;

		obj.jumped = false;
		obj.jump = function (s) {
			if (!obj.jumped) {
				obj.jumped = true;
				obj.speed.y = -s;
			}
		};

		enemies.push(obj);
	};

	this.addStatic = function (obj) { // type 0
		obj.where = statics;
		statics.push(obj);
	};

	this.addOption = function (obj) { // type 1
		obj.where = options;
		options.push(obj);
	};

	this.addWall = function (obj) { // type 2
		obj.where = walls;
		walls.push(obj);
	};

	this.addCell = function (obj) { // type 2
		obj.where = cells;
		obj.motionPosition = obj.getPositionC();
		if (!obj.jumpSpeed) obj.jumpSpeed = 0;
		cells.push(obj);
	};

	this.getDT = function () {
		return DT;
	};

	var collision = function (el1, el2, revert) {
		var box1 = el1.getStaticBox();
		var box2 = el2.getStaticBox();

		if (el1.isStaticIntersect(box2)) {

			if (box1.x + box1.w > box2.x + box1.w / 4 && box1.x < box2.x + box2.w - box1.w / 4) {
				if (el1.speed.y > 0 && box1.y + box1.h < box2.y + Math.abs(el1.speed.y) + box1.h / 4) {
					el1.y = -box1.h - el1.box.y + box2.y;
					el1.speed.y = 0;
					el1.jumped = false;
				} else if (el1.speed.y < 0 && box1.y > box2.y + box2.h - Math.abs(el1.speed.y) - box1.h / 4) {
					el1.speed.y *= -0.5;
					el1.jumped = true;
				}
			}

			if (box1.y + box1.h > box2.y + box1.h / 4 && box1.y < box2.y + box2.h - box1.h / 4) {
				if (el1.speed.x > 0 && box1.x + box1.w < box2.x + Math.abs(el1.speed.x) + box1.w / 4) {
					el1.x = box2.x - box1.w - el1.box.x + 1;
					el1.speed.x *= revert;
				} else if (el1.speed.x < 0 && box1.x > box2.x + box2.w - Math.abs(el1.speed.x) - box1.w / 4) {
					el1.x = box2.w + box2.x - el1.box.x - 1;
					el1.speed.x *= revert;
				}
			}

		}
	};

	var DT = 1;
	this.update = function () {

		drawArray.length = 0;

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

		if (player.id != -1) {

			if (_PlatformerJS.autoDraw) if (player.isInCameraStatic()) drawArray.push(player);

			player.speed.x = math.toZiro(player.speed.x, player.friction * DT);
			player.speed.y = math.toZiro(player.speed.y, player.friction * DT);

			if (player.gravity) {
				player.speed.y += player.gravity * DT;
			}

			OOP.forArr(walls, function (wall) {
				if (!wall.isInCameraStatic()) return;
				if (_PlatformerJS.autoDraw && wall.isInCameraStatic()) drawArray.push(wall);
				if (_PlatformerJS.onUpdate) _PlatformerJS.onUpdate(wall);

				if (player.getDistanceC(wall.getPositionC()) < player.w+player.h) {
					collision(player, wall, 0);
				}

			});

			if (player.maxSpeed.x) {
				if (Math.abs(player.speed.x) >= Math.abs(player.maxSpeed.x)) {
					player.speed.x = player.maxSpeed.x*pjs.math.sign(player.speed.x);
				}
			}

			if (player.maxSpeed.y) {
				if (Math.abs(player.speed.y) >= Math.abs(player.maxSpeed.y)) {
					player.speed.y = player.maxSpeed.y*pjs.math.sign(player.speed.y);
				}
			}

			if (player.speed.x) {
				player.x += player.speed.x * DT;
			}

			if (player.speed.y) {
				player.jumped = true;
				player.y += player.speed.y * DT;
			} else {
				player.jumped = false;
			}


		}

		if (enemies.length > 0)
			OOP.forArr(enemies, function (enemy) {
				if (_PlatformerJS.optMode) {
					if (!enemy.isInCameraStatic()) {
						return;
					}
				}
				if (_PlatformerJS.autoDraw) if (enemy.isInCameraStatic()) drawArray.push(enemy);
				if (_PlatformerJS.onUpdate) _PlatformerJS.onUpdate(enemy);

				if (enemy.speed.x > 0) {
					enemy.speed.x -= enemy.friction * DT;
					if (Math.abs(enemy.speed.x) < enemy.friction * 2)
						enemy.speed.x = 0;
				} else if (enemy.speed.x < 0) {
					enemy.speed.x += enemy.friction * DT;
					if (Math.abs(enemy.speed.x) < enemy.friction * 2)
						enemy.speed.x = 0;
				}

				if (enemy.speed.y > 0) {
					enemy.speed.y -= enemy.friction * DT;
					if (Math.abs(enemy.speed.y) < enemy.friction * 2)
						enemy.speed.y = 0;
				} else if (enemy.speed.y < 0) {
					enemy.speed.y += enemy.friction * DT;
					if (Math.abs(enemy.speed.y) < enemy.friction * 2)
						enemy.speed.y = 0;
				}

				if (enemy.gravity) {
					enemy.speed.y += enemy.gravity * DT;
				}

				OOP.forArr(walls, function (wall) {
					// if (_PlatformerJS.optMode) { if (!wall.isInCameraStatic()) return; }
					if (enemy.getDistanceC(wall.getPositionC()) < enemy.w+enemy.h) {
						collision(enemy, wall, -1);
					}
				});


				if (enemy.maxSpeed.x) {
					if (Math.abs(enemy.speed.x) >= Math.abs(enemy.maxSpeed.x)) {
						enemy.speed.x = enemy.maxSpeed.x*pjs.math.sign(enemy.speed.x);
					}
				}

				if (enemy.maxSpeed.y) {
					if (Math.abs(enemy.speed.y) >= Math.abs(enemy.maxSpeed.y)) {
						enemy.speed.y = enemy.maxSpeed.y*pjs.math.sign(enemy.speed.y);
					}
				}

				if (enemy.speed.x) {
					enemy.x += enemy.speed.x * DT;
				}

				if (enemy.speed.y) {
					enemy.jumped = true;
					enemy.y += enemy.speed.y * DT;
				} else {
					enemy.jumped = false;
				}

				if (_PlatformerJS.onEnemyCollision) {
					if (player.isStaticIntersect(enemy.getStaticBox())) {
						_PlatformerJS.onEnemyCollision(player, enemy);
					}
				}
			});

		if (cells.length > 0)
		OOP.forArr(cells, function (cell) {
			if (_PlatformerJS.optMode) { if (!cell.isInCameraStatic()) return; }
			if (_PlatformerJS.autoDraw) if (cell.isInCameraStatic()) drawArray.push(cell);
			if (_PlatformerJS.onUpdate) _PlatformerJS.onUpdate(cell);

			if (cell.jumpSpeed > 0)
				cell.motionC(cell.motionPosition, size(0, 2.5), cell.jumpSpeed * DT);

			if (_PlatformerJS.onCellCollision) {
				if (player.isStaticIntersect(cell.getStaticBox())) {
					_PlatformerJS.onCellCollision(player, cell);
				}
			}
		});

		if (options.length > 0)
		OOP.forArr(options, function (option) {
			if (_PlatformerJS.optMode) { if (!option.isInCameraStatic()) return; }
			if (_PlatformerJS.autoDraw) if (option.isInCameraStatic()) drawArray.push(option);
			if (_PlatformerJS.onUpdate) _PlatformerJS.onUpdate(option);
			if (_PlatformerJS.onOptionCollision) {
				if (player.isStaticIntersect(option.getStaticBox())) {
					_PlatformerJS.onOptionCollision(player, option);
				}
			}
		});

		if (actions.length > 0)
		OOP.forArr(actions, function (action) {
			if (_PlatformerJS.optMode) { if (!action.isInCameraStatic()) return; }
			if (_PlatformerJS.autoDraw) if (action.isInCameraStatic()) drawArray.push(action);
			if (_PlatformerJS.onUpdate) _PlatformerJS.onUpdate(action);
			if (_PlatformerJS.onOptionCollision) {
				if (player.isStaticIntersect(action.getStaticBox())) {
					_PlatformerJS.onOptionCollision(player, action);
				}
			}
		});

		OOP.drawArr(drawArray);

	};

};