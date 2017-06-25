function Editor () {
	var cellW = 50,
			cellH = 50;

	var curPos = point();

	var tiles = [];
	var type  = 0;
	var onTile = false;

	var nodes = [

		{
			file : 'img/block.jpg',
			w : 0, h : 0,
			gameType : 'wall',
			angle : 0
		},

		{
			file : 'img/blockAngle.png',
			w : 0, h : 0,
			gameType : 'wall',
			angle : 0,
			speedY : -1,
			flipX : false
		},

		{
			file : 'img/blockAngle.png',
			w : 0, h : 0,
			gameType : 'wall',
			angle : 0,
			speedY : 1,
			flipX : true
		},

		{
			file : 'img/cell.png',
			w : 35, h : 0,
			gameType : 'cell',
			angle : 0,
			active : true
		},

		{
			file : 'img/enemy1.png',
			w : 35, h : 25,
			gameType : 'enemy1',
			angle : 0
		},

		{
			file : 'img/enemy2.png',
			w : 0, h : 0,
			gameType : 'enemy2',
			angle : 0
		},

		{
			file : 'img/cell.png',
			w : 35, h : 0,
			gameType : 'cell',
			angle : 90,
			active : true
		},

		{
			file : 'img/flag.png',
			w : 0, h : -50,
			gameType : 'flag',
			angle : 0,
			active : true
		},

		{
			file : 'img/door.png',
			w : 0, h : -50,
			gameType : 'door',
			angle : 0
		},

		{
			file : 'img/ball.png',
			w : 10, h : 10,
			gameType : 'player',
			angle : 0
		},

	];

	var moveCamera = function () {
		if (key.isDown('A'))
			camera.move(point(-5, 0));
		if (key.isDown('D'))
			camera.move(point(5, 0));
		if (key.isDown('W'))
			camera.move(point(0, -5));
		if (key.isDown('S'))
			camera.move(point(0, 5));

		if (mouse.isDown('MIDDLE')) {
			camera.move(point(-mouse.getSpeed().x, -mouse.getSpeed().y));
		}

	};

	var updateCursor = function (mp) {
		curPos.x = cellW * Math.floor(mp.x / cellW);
		curPos.y = cellH * Math.floor(mp.y / cellH);
	};

	var cellView = game.newImageObject({
		file : nodes[0].file,
		w : cellW - nodes[0].w,
		h : cellH - nodes[0].h,
		alpha : 0.5
	});

	var playerPos = game.newImageObject({
		file : 'img/ball.png',
		w : cellW - 10,
		h : cellH - 10,
		userData : {
			gameType : 'player'
		}
	});

	var drawCell = function (mp) {

		if (mouse.isWheel('UP')) {
			type--;
		}

		if (mouse.isWheel('DOWN')) {
			type++;
		}

		if (type < 0) type = 0;
		if (type >= nodes.length) type = nodes.length - 1;

		cellView.x = curPos.x;
		cellView.y = curPos.y + nodes[type].h;
		cellView.w = cellW - nodes[type].w;
		cellView.h = cellH - nodes[type].h;
		cellView.setImage(nodes[type].file);
		cellView.setFlip(nodes[type].flipX, 0);
		cellView.setAngle(nodes[type].angle);
		cellView.draw();

	};

	var addTile = function () {

		if (nodes[type].gameType == 'player') {
			playerPos.setPosition(curPos);
			return;
		}

		var tmpObject = game.newImageObject({
			x : curPos.x,
			y : curPos.y + nodes[type].h,
			w : cellW - nodes[type].w,
			h : cellH - nodes[type].h,
			file : nodes[type].file,
			angle : nodes[type].angle,
			userData : {
				gameType : nodes[type].gameType
			}
		});
		if (nodes[type].speedY) tmpObject.speedY = nodes[type].speedY;
		if (nodes[type].active) tmpObject.active = nodes[type].active;
		if (nodes[type].flipX) tmpObject.setFlip(nodes[type].flipX, 0);
		tiles.push(tmpObject);
	};

	var drawTiles = function () {
		OOP.forArr(tiles, function (el, id) {
			el.draw();

			if (mouse.isInObject(el)) {
				onTile = true;
			}

			if (mouse.isPeekObject('RIGHT', el)) {
				return tiles.splice(id, 1);
			}

		});
	};

	var RUN = game.newTextObject({
		text : 'Запуск',
		color : 'white',
		size : 30
	});

	var MENU = game.newTextObject({
		text : 'Меню',
		color : 'white',
		size : 30
	});

	this.entry = function () {
		camera.setPositionC(playerPos.getPositionC());
	};

	this.update = function () {

		if (mouse.isPeekObject('LEFT', RUN)) {
			tiles.push(playerPos);
			myLevel = tiles;
			game.setLoop('game');
			return;
		}

		if (mouse.isPeekObject('LEFT', MENU)) {
			myLevel = false;
			game.setLoop('menu');
			return;
		}

		game.clear();
		updateCursor(mouse.getPosition());
		moveCamera();

		onTile = false;

		drawCell();
		drawTiles();
		playerPos.draw();

		if (mouse.isPress('LEFT') && !onTile)
			addTile();

		RUN.setPositionS(point(0, 0));
		RUN.draw();

		MENU.setPositionS(point(game.getWH().w - MENU.getSize().w, 0));
		MENU.draw();

	};

}

game.newLoopFromClassObject('editor', new Editor());