var Menu = function (pjs, obj) {
	var brush = pjs.brush;
	var game = pjs.game;
	var OOP = pjs.OOP;
	var p = pjs.vector.point;
	var width = game.getWH().w;
	var height = game.getWH().h;
	var mouse = pjs.mouseControl.initMouseControl();
	var r = game.getResolution();

	var gameName = obj.name || false;
	var author = obj.author || false;
	var radius = obj.radius * r / 2 || 0;

	var iHeight = r * 50;
	var iCount  = 0;
	var iPad = iHeight / 10;

	var items = [];

	var clr = {
		itemFill : '#DC3D24',
		itemHover : '#E3AE57',
		itemColor : 'white',
		itemColorHover : '#323232',
		background : '#232B2B',
		color : 'white'
	};

	var addName = function (obj, name) {
		obj.name = name;
		obj.color = 'white';
		obj.ondraw = function () {

			if (mouse.isInObject(this)) {
				this.fillColor = clr.itemHover;
				this.color = clr.itemColorHover;
			} else {
				this.fillColor = clr.itemFill;
				this.color = clr.itemColor;
			}

			brush.drawText({
				x : this.x + this.w/2,
				y : this.y + iHeight / 4,
				text : this.name,
				color : this.color,
				size : 20 * r,
				align : 'center'
			});
		};
	};

	OOP.forEach(obj.items, function () {
		iCount += 1;
	});

	var old = false, i = 0;
	OOP.forEach(obj.items, function (value, key) {

		var item = game.newRoundRectObject({
			w : width / 1.2, h : iHeight,
			radius : radius,
			fillColor : clr.itemFill,
			y : (old ? old.y + old.h : 0) + iPad,
			x : (width / 2) - width / 1.2 / 2
		});

		if (i == 0) {
			item.y = height / 2 - ((iHeight + iPad)*(iCount+1)) / 2;
			i += 1;
		}

		item.loop = key;
		addName(item, value);

		items.push(item);

		old = item;

	});







	this.update = function () {
		game.fill(clr.background);

		if (gameName)
		brush.drawText({
			text : gameName,
			x : width / 2, y : height / 50,
			color : clr.color,
			size : r * 50,
			align : 'center'
		});

		OOP.forArr(items, function (el) {
			el.draw();

			if (mouse.isPeekObject('LEFT', el)) {
				game.setLoop(el.loop);
			}

		});

		if (author)
		brush.drawText({
			text : author,
			x : width / 2, y : height - height / 80 - (r * 10),
			color : clr.color,
			size : r * 10,
			align : 'center'
		});


	};



	this.entry = function () {

	};

	this.exit = function () {

	};

};

game.newLoopFromClassObject('menu', new Menu(pjs, {
	name  : 'Bounce',
	author : 'SkanerSoft',
	radius : 15,
	items : {
		game  : 'В игру',
		editor : 'Редактор уровней',
	}
}));