game.newLoopFromConstructor('game', function () {

	var map = LEVELS[0];

	var plStartPosition = false;

	var walls = [];
	var cells = [];
	var waters = [];
	var enemies = [];
	var checks = [];
	var doors = [];

	var player = game.newImageObject({
		w : 40, h : 40,
		file : 'img/ball.png',
		position : point(0, 0)
	});

	var restartGame = function () {
		player.setPositionC(plStartPosition);
		camera.setPositionC(plStartPosition);
	};

	var nextLevel = function () {
		if (level >= LEVELS.length)
			level = 1;

		level++;
		map = LEVELS[level - 1];
	};

	var EDITOR = game.newTextObject({
		text : 'Меню',
		color : 'white',
		size : 30
	});

	this.entry = function () {

		var snd = pjs.wAudio.newAudio(map.snd, 0.3);
		game.setLoopSound('game', [snd]);

		score = 0;
		OOP.clearArr(walls);
		OOP.clearArr(cells);
		OOP.clearArr(waters);
		OOP.clearArr(enemies);
		OOP.clearArr(checks);
		OOP.clearArr(doors);

		if (myLevel) {
			OOP.forArr(myLevel, function (el) {


				if (el.gameType == 'wall')
					walls.push(el);
				if (el.gameType == 'cell')
					cells.push(el);
				if (el.gameType == 'enemy1')
					enemies.push(el);
				if (el.gameType == 'enemy2') {
					var tmpP = el.getPosition();
					el.mp = point(tmpP.x, tmpP.y);
					enemies.push(el);
				}
				if (el.gameType == 'flag')
					checks.push(el);
				if (el.gameType == 'door')
					doors.push(el);

				if (el.gameType == 'player')
					plStartPosition = el.getPositionC();



			});
		} else {
			OOP.forArr(map.source, function (string, Y) {
				OOP.forArr(string, function (symbol, X) {
					if (!symbol || symbol == ' ') return;

					if (symbol == 'P') {
						plStartPosition = point(map.width*X, map.height*Y);
					} else if (symbol == 'W') {
						waters.push(game.newRectObject({
							w : map.width, h : map.height,
							x : map.width*X, y : map.height*Y,
							fillColor : '#084379',
							alpha : 0.5
						}));
					} else if (symbol == '|') {
						cells.push(game.newImageObject({
							w : map.width/4, h : map.height,
							x : map.width*X + map.width/4, y : map.height*Y,
							file : 'img/cell.png',
							userData : {
								active : true
							}
						}));
					} else if (symbol == '-') {
						cells.push(game.newImageObject({
							w : map.width/4, h : map.height,
							x : map.width*X+ map.width/3, y : map.height*Y,
							file : 'img/cell.png',
							angle : 90,
							userData : {
								active : true
							}
						}));
					} else if (symbol == '0') {
						walls.push(game.newImageObject({
							w : map.width, h : map.height,
							x : map.width*X, y : map.height*Y,
							file : 'img/block.jpg'
						}));
					} else if (symbol == 'E') {
						enemies.push(game.newImageObject({
							w : map.width/4, h : map.height / 2,
							x : map.width*X + map.width/3, y : map.height*Y + map.height / 2,
							file : 'img/enemy1.png'
						}));
					} else if (symbol == '/') {
						walls.push(game.newImageObject({
							w : map.width, h : map.height,
							x : map.width*X, y : map.height*Y,
							file : 'img/blockAngle.png',
							userData : {
								speedY : -1
							}
						}));
					} else if (symbol == '\\') {
						walls.push(game.newImageObject({
							w : map.width, h : map.height,
							x : map.width*X, y : map.height*Y,
							file : 'img/blockAngle.png',
							userData : {
								speedY : 1
							}
						}));
					} else if (symbol == '*') {
						enemies.push(game.newImageObject({
							w : map.width, h : map.height,
							x : map.width*X, y : map.height*Y,
							file : 'img/enemy2.png',
							userData : {
								mp : point(map.width*X, map.height*Y)
							}
						}));
					} else if (symbol == 'F') {
						checks.push(game.newImageObject({
							w : map.width, h : map.height * 2,
							x : map.width*X, y : map.height*Y - map.height,
							file : 'img/flag.png',
							userData : {
								active : true
							}
						}));
					} else if (symbol == 'X') {
						doors.push(game.newImageObject({
							w : map.width, h : map.height * 2,
							x : map.width*X, y : map.height*Y - map.height,
							file : 'img/door.png',
							userData : {
								bonus : false
							}
						}));
					}






				});
			});
		}

		player.gr = 0.5;
		player.speed = point(0, 0);

		if (plStartPosition) {
			player.setPositionC(plStartPosition);
		}

	};

	this.update = function () {
		game.clear();
		player.draw();

		player.speed.y += player.gr;

		if (key.isDown('RIGHT'))
			player.speed.x = 2;
		else if (key.isDown('LEFT'))
			player.speed.x = -2;
		else if (player.speed.y > 0)
			player.speed.x = math.toZiro(player.speed.x, 0.1);

		OOP.drawArr(walls, function (wall) {
			if (wall.isInCameraStatic()) {

				if (wall.speedY > 0)
					wall.setFlip(point(1, 0));

				if (wall.isStaticIntersect(player)) {

					if (wall.speedY) {
						player.speed.x = math.toZiro(player.speed.x, 0.1);

						if (player.getDistanceC(wall.getPositionC()) < 40)
							player.speed.y = wall.speedY * player.speed.x;

						return;
					}

					if (player.x+player.w > wall.x+wall.w/4 && player.x < wall.x+wall.w-wall.w/4) {
						if (player.speed.y > 0 && player.y+player.h < wall.y+wall.h/2) {
							if (key.isDown('UP'))
								player.speed.y = -10;
							else {
								player.y = wall.y - player.h;
								player.speed.y *= -0.3;
								if (Math.abs(player.speed.y) < 1)
									player.speed.y = 0;
							}
						} else if (player.speed.y < 0 && player.y > wall.y+wall.h/2) {
							player.y = wall.y+wall.h;
							player.speed.y *= -0.1;
						}
					}

					if (player.y+player.h > wall.y+wall.h/4 && player.y < wall.y+wall.h-wall.h/4) {

						if (player.speed.x > 0 && player.x+player.w < wall.x+wall.w/2) {
							player.x = wall.x-player.w;
							player.speed.x = 0;
						}

						if (player.speed.x < 0 && player.x > wall.x+wall.w/2) {
							player.x = wall.w+wall.x;
							player.speed.x = 0;
						}
					}

				}
			}
		});

		OOP.drawArr(doors, function (door) {
			if (door.isStaticIntersect(player)) {
				nextLevel();
				game.setLoop('game');
			}
		});

		OOP.drawArr(checks, function (check) {
			if (check.active) {
				if (check.isStaticIntersect(player)) {
					check.active = false;
					plStartPosition = check.getPositionC();
				}
			}
		});

		OOP.drawArr(cells, function (cell) {
			if (cell.active) {
				if (cell.isStaticIntersect(player)) {
					cell.active = false;
					cell.setImage('img/cell2.png');
					score++;
				}
			}
		});

		OOP.drawArr(enemies, function (enemy) {

			if (enemy.mp) {
				enemy.motion(enemy.mp, pjs.vector.size(map.width * 2.5, 0), 2);
			}

			if (enemy.isStaticIntersect(player)) {
				restartGame();
			}
		});

		var onWater = false;
		OOP.drawArr(waters, function (water) {
			if (onWater) return;
			if (water.isStaticIntersect(player) && player.y+player.h/2 > water.y) {
				player.speed.y -= 0.9;
				onWater = true;
			}
		});

		if (player.speed.y) {
			player.y += player.speed.y;
		}

		if (player.speed.x) {
			player.turn(player.speed.x * 2);
			player.x += player.speed.x;
		}


		brush.drawTextS({
			text : 'Level: '+level+' Score: '+score,
			size : 30,
			color : '#FFFFFF',
			strokeColor : '#002C5D',
			strokeWidth : 1,
			x : 10, y : 10,
			style : 'bold'
		});


		EDITOR.setPositionS(point(game.getWH().w - EDITOR.getSize().w, 0));
		EDITOR.draw();

		if (mouse.isPeekObject('LEFT', EDITOR)) {
			game.setLoop('menu');
			return;
		}

		camera.follow(player, 50);

	};
});