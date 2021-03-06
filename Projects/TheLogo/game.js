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

// var key = pjs.keyControl.initKeyControl();
// var mouse = pjs.mouseControl.initMouseControl();
// var touch = pjs.touchControl.initTouchControl();


// скорость анимации, игровой цикл ПОСЛЕ всей анимации, цвет фона, цвет текст, массив надписей
game.newLoopFromClassObject('logo', new Logo(0.05, 1, 'myGame', '#222930', '#4EB1BA', ['SkanerSoft', 'При поддержке vk.com', '"The Logo" plugin', 'Расширение', 'Для PointJS']));


// Advanced Game Loop
var MyGame = function () {
	// Constructor Game Loop

	this.update = function () {
		// Update function

		game.fill('#D9D9D9');

		brush.drawText({
			x : 10, y : 10,
			text : 'Привет, Мир!',
			size : 30,
			color : '#515151'
		});

	};

	this.entry = function () {
		// Entry Function
		log('myGame is started');
	};

	this.exit = function () {
		// Exit function
		log('myGame is stopped');
	};

};
game.newLoopFromClassObject('myGame', new MyGame());

game.startLoop('logo');