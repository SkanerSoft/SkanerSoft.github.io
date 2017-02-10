game.newLoopFromConstructor('game', function () {

	// Итак, в этом видео голоса не будет =)
	// Но вы не отчаивайтесь, вам всё будет понятно и так!

	// Добавим новый тип объекта
	// ВОДА

	// Но сперва я хочу сделать позиционирование
	// нашего персонажа непосредственно средствами редактор
	// карт и уровней

	// P - позиция нашего персонажа (стартовая)

	// Теперь, имея воду мы можем провернуть один хинт
	// Чтобы добраться до кольца, придется перейти по верху

	var map = {
		width : 50,
		height : 50,
		source : [
			'',
			'',
			'               0-',
			'    |     P  0000', // думаю, ясно
			'  00000 000 00000',
			'      0 0|     |0        |',
			'0000000 000000W00 000000000000',
			'      000    0W00 0 ',
			'             0W0  0 ',
			'             0W | 0 ',
			'             000000 ',
		]
	};

	// Играясь с водой, можно достигать самых разных результатов
	// У меня же всё, всем спасибо и всем пока =)

	// Теперь расширим пространство и добавим воды (буква W)

	// стартовая позиция (переменная)
	var plStartPosition = false;

	var walls = [];
	var cells = [];
	var waters = []; // тут будет вода

	OOP.forArr(map.source, function (string, Y) {
		OOP.forArr(string, function (symbol, X) {
			if (!symbol || symbol == ' ') return;

			if (symbol == 'P') {
				// Займемся игроком
				plStartPosition = point(map.width*X, map.height*Y);
			} else if (symbol == 'W') {
				waters.push(game.newRectObject({ // о котором я забыл
					w : map.width, h : map.height,
					x : map.width*X, y : map.height*Y,
					fillColor : '#084379',
					alpha : 0.5
				}));
			} else if (symbol == '|') {
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

	// При создании игрока мы смотрим
	// была ли задана позиция, и, если была
	// используем её, иначе устанавливаем в начало координат

	var player = game.newCircleObject({
		radius : 20,
		fillColor : '#FF9191',
		position : plStartPosition ? plStartPosition : point(0, 0)
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

		// зададим еще переменную флаг, определяющую находится ли
		// объект в воде

		var onWater = false;

		// Рисуем и обрабатываем воду
		OOP.drawArr(waters, function (water) {
			// Если наш игрок уже находится в воде, ничего не делаем
			if (onWater) return;
			// Тут нам надо определить стролкновение
			// и направить скорость вверх (выталкивание)
			// Надо хорошенько все продумать

			// Нам требуется учесть, что выталкивающая сила начинает
			// работать только тогда, когда шар опустится в воду
			// примерно на половину от его высоты
			if (water.isStaticIntersect(player) && player.y+player.h/2 > water.y) {
				player.speed.y -= 0.9; // определим оптимальную скорость
				onWater = true;

				// теперь надо правильно построить алгоритм

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