
var Menu = function (pjs, obj) {
	var brush = pjs.brush;
	var game = pjs.game;
	var OOP = pjs.OOP;
	var p = pjs.vector.point;
	var width = game.getWH().w;
	var height = game.getWH().h;
	var touch = pjs.touchControl.initTouchControl();
	var r = game.getResolution();

	var gameName = obj.name || false;
	var author = obj.author || false;
	var radius = obj.radius * r / 2 || 0;

	var iHeight = r * 70;
	var iCount  = 0;
	var iPad = r * 5;
	var sizeText = 40 * r;

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

			if (touch.isInObject(this)) {
				this.fillColor = clr.itemHover;
				this.color = clr.itemColorHover;
			} else {
				this.fillColor = clr.itemFill;
				this.color = clr.itemColor;
			}

			brush.drawText({
				x : this.x + this.w/2,
				y : this.y + sizeText / 3,
				text : this.name,
				color : this.color,
				size : sizeText,
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
			item.y = height / 2 - ((iHeight + iPad) * iCount) / 2;
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
			x : width / 2, y : 0,
			color : clr.color,
			size : sizeText / 1.5,
			align : 'center'
		});

		OOP.forArr(items, function (el) {
			el.draw();

			if (touch.isPeekObject(el)) {
				game.setLoop(el.loop);
			}

		});

		if (author)
		brush.drawText({
			text : author,
			x : width / 2, y : height - sizeText  / 1.5,
			color : clr.color,
			size : sizeText / 1.5,
			align : 'center'
		});


	};



	this.entry = function () {

	};

	this.exit = function () {

	};

};