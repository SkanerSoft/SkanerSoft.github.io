var pjs = new PointJS('2D', 1280 / 2, 720 / 2, { // 16:9
	backgroundColor : '#53769A' // if need
});
pjs.system.initFullPage(); // for Full Page mode
// pjs.system.initFullScreen(); // for Full Screen mode (only Desctop)

var tds = new TopDownJS(pjs);

var log    = pjs.system.log;     // log = console.log;
var game   = pjs.game;           // Game Manager
var point  = pjs.vector.point;   // Constructor for Point
var camera = pjs.camera;         // Camera Manager
var brush  = pjs.brush;          // Brush, used for simple drawing
var OOP    = pjs.OOP;            // Object's manager
var math   = pjs.math;           // More Math-methods
var levels = pjs.levels;         // Levels manager

var key   = pjs.keyControl.initKeyControl();
// var mouse = pjs.mouseControl.initMouseControl();
// var touch = pjs.touchControl.initTouchControl();
// var act   = pjs.actionControl.initActionControl();

var width  = game.getWH().w; // width of scene viewport
var height = game.getWH().h; // height of scene viewport

pjs.system.setTitle('TopDownJS Game'); // Set Title for Tab or Window

// Game Loop
game.newLoopFromConstructor('myGame', function () {
	// Constructor Game Loop

	var pl = tds.setPlayer(game.newImageObject({
		file : pjs._logo,
		w : 35, h : 35
	}));

	levels.forStringArray({
		size : pjs.vector.size(50, 40),
		source : [
			'0000000000000000000000000000',
			'0000000000000000000000000000',
			'0000000000000000000000000000',
			'0000000000000000000000000000',
			'0000000000000000000000000000',
			'0000000000000000000000000000',
			'0000000000000000000000000000',
			'0000000000000000000000000000',
			'0000000000000000000000000000',
			'0000000000000000000000000000',
			'0000000000000000000000000000',
		],

		onsymbol : function (s) {
			return game.newImageObject({
				file : 'ground.png'
			});
		},

		oncreate : function (obj) {
			tds.addStatic(obj);
		}

	});

	levels.forStringArray({
		size : pjs.vector.size(50, 40),
		grid : pjs.vector.size(45, 35),
		source : [
			'                            ',
			'                            ',
			'           0000             ',
			'           0                ',
			'          000    222        ',
			'           0     1 1        ',
			'           0000  1 1111          ',
			'              0       1      ',
			'              0       1      ',
			'              000000001      ',
		],

		onsymbol : function (s, pos) {
			if (s == '0')
				return game.newImageObject({
					file : 'block.png'
				});
			else if (s == '1')
				return game.newImageObject({
					file : 'block2.png'
				});

		},

		oncreate : function (obj) {
			tds.addWall(obj);
		}

	});

	tds.onWallCollision = function (player, wall) {

	};

	this.update = function () {
		// Update function
		game.clear(); // clear screen

		if (key.isDown('W'))
			pl.speed.y = -2;
		else if (key.isDown('S'))
			pl.speed.y = 2;
		else
			pl.speed.y = 0;

		if (key.isDown('A'))
			pl.speed.x = -2;
		else if (key.isDown('D'))
			pl.speed.x = 2;
		else
			pl.speed.x = 0;





		tds.update();
		camera.follow(pl, 10);

		if (tds.getPlayerDirection()) {
			brush.drawMultiTextS({
				x : 0, y : 0,
				text : 'Player Direction: ' + tds.getPlayerDirection(),
				size : 30,
				color : '#E8E9E4'
			});
		}



	};

});

game.startLoop('myGame');