var pjs = new PointJS('2D', 1280 / 2, 720 / 2, {
	backgroundColor : '#8A8A8A'
}); // 16:9
pjs.system.initFullPage(); // for Full Page mode
// pjs.system.initFullScreen(); // for Full Screen mode (only Desctop)

var log    = pjs.system.log;     // log = console.log;
var game   = pjs.game;           // Game Manager
var point  = pjs.vector.point;   // Constructor for Point
var camera = pjs.camera;         // Camera Manager
var brush  = pjs.brush;          // Brush, used for simple drawing
var OOP    = pjs.OOP;            // Object's manager
var math   = pjs.math;           // More Math-methods

var width = game.getWH().w;
var height = game.getWH().h;

// var key = pjs.keyControl.initKeyControl();
var mouse = pjs.mouseControl.initMouseControl();
// var touch = pjs.touchControl.initTouchControl();

var mapWidth = 500;
var mapHeight = 1000;

var map = new Map(pjs, {
	background : '#2E2E2E',
	friend : '#11A81F',
	enemy : 'red',
	x : 0, y : 0,
	w : 200, h : 100,
	size : 5,
	mapWidth : mapWidth,
	mapHeight : mapHeight
});

objs = [];

OOP.fillArr(objs, 10, function (i) {

	var obj = game.newRectObject({
		w : 50, h : 50,
		positionC : point(math.random(0, mapWidth), math.random(0, mapHeight)),
		fillColor : i == 0 ? '#1B357F' : '#4D4D4D'
	});

	map.addItem(obj, i == 0 ? 'Friend' : 'Enemy');

	return obj;
});

// Advanced Game Loop
var MyGame = function () {
	// Constructor Game Loop

	this.update = function () {
		// Update function

		game.clear();

		OOP.forArr(objs, function (el) {
			el.moveToC(mouse.getPosition(), 1);
			el.draw();
		});

		map.draw();

	};
};
game.newLoopFromClassObject('myGame', new MyGame());


game.startLoop('myGame');