function Editor () {
	var cellW = 30,
			cellH = 30;

	var curPos = point();

	var tiles = [];
	var type  = 0;

	var moveCamera = function () {
		if (key.isDown('A'))
			camera.move(point(-5, 0));
		if (key.isDown('D'))
			camera.move(point(5, 0));
		if (key.isDown('W'))
			camera.move(point(0, -5));
		if (key.isDown('S'))
			camera.move(point(0, 5));
	};

	var updateCursor = function (mp) {
		curPos.x = cellW * Math.floor(mp.x / cellW);
		curPos.y = cellH * Math.floor(mp.y / cellH);
	};

	var drawCell = function (mp) {
		brush.drawRect({
			x : curPos.x,
			y : curPos.y,
			w : cellW,
			h : cellH,
			strokeColor : '#FF0000',
			strokeWidth : 1
		});

	};

	var addTile = function () {
		if (!type) {
			tiles.push(game.newRectObject({
				x : curPos.x,
				y : curPos.y,
				w : cellW,
				h : cellH,
				fillColor : pjs.colors.randomColor(100, 200)
			}));
		}
	};

	var drawTiles = function () {
		OOP.forArr(tiles, function (el, id) {
			el.draw();

			if (mouse.isPeekObject('RIGHT', el)) {
				return tiles.splice(id, 1);
			}

		});
	};

	this.update = function () {
		game.clear();
		updateCursor(mouse.getPosition());
		moveCamera();

		drawCell();
		drawTiles();

		if (mouse.isPress('LEFT'))
			addTile();

	};

}

game.newLoopFromClassObject('editor', new Editor());