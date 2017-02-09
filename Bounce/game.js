game.newLoopFromConstructor('game', function () {

	var map = {
		width : 50,
		height : 50,
		source : [
			'',
			'',
			'               0-',
			'    |         00',
			'  00000 000  000',
			'      0 0|               |',
			'0000000 000000 000000000000000',
			'      000    000 '
		]
	};

	var walls = [];
	var cells = [];

	OOP.forArr(map.source, function (string, Y) {
		OOP.forArr(string, function (symbol, X) {
			if (!symbol || symbol == ' ') return;

			if (symbol == '|') {
				cells.push(game.newRectObject({
					w : map.width/2, h : map.height,
					x : map.width*X, y : map.height*Y,
					fillColor : '#FFF953',
					userData : {
						active : true
					}
				}));
			} else if (symbol == '-') {
				cells.push(game.newRectObject({
					w : map.width, h : map.height/2,
					x : map.width*X, y : map.height*Y,
					fillColor : '#FFF953',
					userData : {
						active : true
					}
				}));
			} else if (symbol == '0') {
				walls.push(game.newRectObject({
					w : map.width, h : map.height,
					x : map.width*X, y : map.height*Y,
					fillColor : '#B64141'
				}));
			}

		});
	});

	var player = game.newCircleObject({
		radius : 20,
		fillColor : '#FF9191'
	});
	player.gr = 0.5;
	player.speed = point(0, 0);

	this.update = function () {
		game.clear();
		player.draw();

		player.speed.y += player.gr;

		if (key.isDown('RIGHT'))
			player.speed.x = 2;
		else if (key.isDown('LEFT'))
			player.speed.x = -2;
		else
			player.speed.x = 0;


		OOP.drawArr(walls, function (wall) {
			if (wall.isInCameraStatic()) {
				// wall.drawStaticBox();
				if (wall.isStaticIntersect(player)) {

					if (player.x+player.w > wall.x+wall.w/4 && player.x < wall.x+wall.w-wall.w/4) {
						if (player.speed.y > 0 && player.y+player.h < wall.y+wall.h/2) {
							if (key.isDown('UP'))
								player.speed.y = -10;
							else {
								player.y = wall.y - player.h;
								player.speed.y *= -0.3;
								if (player.speed.y > -0.3)
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

		OOP.drawArr(cells, function (cell) {
			if (cell.active) {
				if (cell.isStaticIntersect(player)) {
					cell.active = false;
					cell.fillColor = '#9A9A9A';
					score++;
				}
			}
		});

		if (player.speed.y) {
			player.y += player.speed.y;
		}

		if (player.speed.x) {
			player.x += player.speed.x;
		}



		brush.drawTextS({
			text : 'Score: '+score,
			size : 30,
			color : '#FFFFFF',
			strokeColor : '#002C5D',
			strokeWidth : 1,
			x : 10, y : 10,
			style : 'bold'
		});
		camera.follow(player, 50);

	};
});