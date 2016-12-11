var Map = function (pjs, obj) {

	var log    = pjs.system.log;     // log = console.log;
	var game   = pjs.game;           // Game Manager
	var point  = pjs.vector.point;   // Constructor for Point
	var camera = pjs.camera;         // Camera Manager
	var brush  = pjs.brush;          // Brush, used for simple drawing
	var OOP    = pjs.OOP;            // Object's manager
	var math   = pjs.math;           // More Math-methods

	var width = obj.w || 50;
	var height = obj.h || 50;

	var size = obj.size || 10;
	var background = obj.background || 'white';
	var friend = obj.friend || '#7DD259';
	var enemy = obj.enemy || '#CD4141';

	var alpha = obj.alpha || 1;

	// var type = obj.type || 'Rectangle';
	var type = 'Rectangle';

	var mapWidth = obj.mapWidth || 1000;
	var mapHeight = obj.mapHeight || 1000;

	var x = obj.x || 0;
	var y = obj.y || 0;

	var radius = obj.radius || 100;

	var objs = [];

	var ctx = pjs.system.getContext();

	this.addItem = function (obj, type) {
		objs.push({
			obj : obj,
			type : type || 'Enemy'
		});
	};

	var pos, dx, dy;
	this.draw = function () {
		// log(ctx.globlAlpha)
		var oldAlpha = ctx.globlAlpha;
		ctx.globlAlpha = alpha;

		if (type == 'Rectangle')
			brush.drawRectS({
				x : x, y : y, w : width, h : height,
				fillColor : background
			});
		// else if (type == 'Circle')
		// 	brush.drawCircleS({
		// 		x : x, y : y, radius : radius,
		// 		fillColor : background
		// 	});


		OOP.forArr(objs, function (el) {
			pos = el.obj.getPositionC();
			dx = x + pos.x / (mapWidth / width) - size / 2;
			dy = y + pos.y / (mapHeight / height) - size / 2;

			if (type == 'Rectangle')
				if (dx > x && dy > y && dx < x + width && dy < y + height )
					brush.drawRectS({
						x : dx, y : dy, w : size, h : size,
						fillColor : el.type == 'Friend' ? friend : enemy
					});

			// else if (type == 'Circle')
			// 	if (pjs.vector.getDistance(point(dx, dy), point(x + radius, y + radius)) < radius)
			// 		brush.drawCircleS({
			// 			x : dx, y : dy, radius : size / 2,
			// 			fillColor : el.type == 'Friend' ? friend : enemy
			// 		});


		});
		ctx.globlAlpha = oldAlpha;
	};

};