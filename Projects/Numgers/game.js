var pjs = new PointJS('2D', 1280 / 2, 720 / 2); // 16:9
pjs.system.initFullPage(); // for Full Page mode
// pjs.system.initFullScreen(); // for Full Screen mode (only Desctop)

var log    = pjs.system.log;     // log = console.log;
var game   = pjs.game;           // Game Manager
var point  = pjs.vector.point;   // Constructor for Point
var camera = pjs.camera;         // Camera Manager
var brush  = pjs.brush;          // Brush, used for simple drawing
var OOP    = pjs.OOP;            // Object's manager
var math   = pjs.math;           // More Math-methods

var touch = pjs.touchControl.initTouchControl();

var width = game.getWH().w;
var height = game.getWH().h;
var r = game.getResolution();

var sizeText = r * 60;

game.newLoopFromClassObject('records', new Records());
game.newLoopFromClassObject('about', new About());
game.newLoopFromClassObject('lang', new Lang());
game.newLoopFromClassObject('logo', new Logo(0.06, 1.5, 'menu', '#222930', '#4EB1BA', ['SkanerSoft', 'PointJS', '"Numgers"']));
game.newLoopFromClassObject('menu', new Menu(pjs, {
	name  : 'the Numgers',
	author : 'SkanerSoft',
	radius : 15,
	items : {
		game  : 'Играть',
		records : 'Мой рекорд',
		about : 'Об игре',
		lang : 'Язык',
	}
}));

// Advanced Game Loop
var Game = function () {
	// Constructor Game Loop

	var score = 0;
	var record = 0;

	var formula = '';
	var time = 5; // seconds

	var result = 0;

	var a, b, opera;

	var operations = ['+', '-'];

	var max = 1;

	var gen = function () {

		opera = math.random(0, operations.length - 1);

		a = math.random(-max, max);
		b = math.random(0, max);

		eval('result = '+ a + ' ' + operations[opera].toString() + ' ' + b + ';');

		formula = a + ' ' + operations[opera] + ' ' + b + ' = ?';

		var tmp = math.random(1, 3);

		var1.value = tmp == 1 ? result : result + math.random(-5, 5);
		var2.value = tmp == 2 ? result : result + math.random(-5, 5);
		var3.value = tmp == 3 ? result : result + math.random(-5, 5);

		max++;

		back.setAlpha(0);

	};

	var h = 100 * r;
	var w = 150 * r;

	var sizeText = 50 * r;

	var var2 = game.newRoundRectObject({
		fillColor : '#DC3D24',
		radius : 10,
		w : w,
		h : h,
		positionC : point(width / 2, height - h)
	});
	var2.value = 0;

	var var1 = game.newRoundRectObject({
		fillColor : '#DC3D24',
		radius : 10,
		w : w,
		h : h,
		y : var2.y,
		x : var2.x - w - r*5
	});
	var1.value = 0;

	var var3 = game.newRoundRectObject({
		fillColor : '#DC3D24',
		radius : 10,
		w : w,
		h : h,
		y : var2.y,
		x : var2.x + w + r*5
	});
	var3.value = 0;

	var back = game.newRectObject({
		fillColor : '#E3AE57',
		w : width,
		h : height,
		y : 0,
		x : 0,
		alpha : 0
	});

	gen();

	this.update = function () {
		// Update function

		var dt = game.getDT(100);

		game.fill('#232B2B');

		back.draw();
		back.transparent(0.01 * dt);
		if (back.getAlpha() > 0.95) {
			game.setLoop('records');
		}

		var2.draw();
		var1.draw();
		var3.draw();

		brush.drawText({
			text : var1.value,
			color : 'white',
			size : sizeText,
			x : var1.getPositionC().x,
			y : var1.getPositionC().y - sizeText / 2,
			align : 'center'
		});

		brush.drawText({
			text : var2.value,
			color : 'white',
			size : sizeText,
			x : var2.getPositionC().x,
			y : var2.getPositionC().y - sizeText / 2,
			align : 'center'
		});

		brush.drawText({
			text : var3.value,
			color : 'white',
			size : sizeText,
			x : var3.getPositionC().x,
			y : var3.getPositionC().y - sizeText / 2,
			align : 'center'
		});

		brush.drawText({
			text : formula,
			color : 'white',
			size : sizeText * 1.5,
			x : width / 2,
			y : sizeText / 2,
			align : 'center'
		});

		if (touch.isPress()) {

			var tmp;

			if (touch.isPeekStatic(var1.getStaticBox())) {
				tmp = var1.value;
			} else if (touch.isPeekStatic(var2.getStaticBox())) {
				tmp = var2.value;
			}else  if (touch.isPeekStatic(var3.getStaticBox())) {
				tmp = var3.value;
			} else {
				return;
			}

			if (tmp == result) {
				gen();
				score++;
				if (score > record)
					pjs.memory.local.save('record', score);
			}
			else {
				game.setLoop('records');
			}
		}

	};

	this.entry = function () {
		score = 0;
		max = 1;
		record = pjs.memory.local.loadAsNumber('record') || 0;
		back.setAlpha(0);
	};

};

game.newLoopFromClassObject('game', new Game());

game.startLoop('logo');