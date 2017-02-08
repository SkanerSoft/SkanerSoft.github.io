var pjs = new PointJS('2D', 1280 / 2, 720 / 2, { // 16:9
	backgroundColor : '#1176B3' // if need
});
pjs.system.initFullPage(); // for Full Page mode
// pjs.system.initFullScreen(); // for Full Screen mode (only Desctop)

pjs.system.initFPSCheck();

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
	// Constructor

	var pl = tds.setPlayer(game.newImageObject({
		file : pjs._logo,
		w : 35, h : 30
	}));


	var background = game.newBackgroundObject({
		file : 'ground.png',
		w : 60, h : 40,
		countX : 30,
		countY : 12,
	});


	levels.forStringArray({
		size : pjs.vector.size(62, 42),
		grid : pjs.vector.size(60, 40),
		source : [
			'000000000000000000000000000000',
			'0                            0',
			'0 0000000000000     9        0',
			'0          0          8      0',
			'0         000    222         0',
			'0          0     1 1         0',
			'0          0000  1 1111      0',
			'0             0       1      0',
			'0             0  P    1      0',
			'0         8 8 0       1      0',
			'0         88  0     8 1   8  0',
			'000000000000000000000000000000',
		],

		onsymbol : function (s, pos) {
			if (s == 'P') {
				pl.setPosition(pos);
			}
			else if (s == '0')
				return game.newImageObject({
					file : 'block.png'
				});
			else if (s == '1')
				return game.newImageObject({
					file : 'block2.png'
				});
			else if (s == '8')
				return game.newImageObject({
					file : 'flower.png'
				});
			else if (s == '9')
				return game.newImageObject({
					file : 'enemy.png'
				});

		},

		oncreate : function (obj, symbol) {
			if (symbol in ['0', '1']) {
				tds.addWall(obj);
				obj.setBox({
					offset : point(0, 5),
					size : pjs.vector.size(0, -5)
				});
			} else if (symbol == '9') {
				tds.addAction(obj);
				obj.setSize(pjs.vector.size(30, 30));
				obj.speed.x = 1;
			} else if (symbol == '8') {
				tds.addOption(obj);
				obj.setSize(pjs.vector.size(25, 25));
			}
		}

	});

	tds.newTask('findFlower', 7, function () {
		document.location.reload();
	});

	// tds.onWallUpdate = function (wall) {

	// };

	tds.onActionWallCollisionX = function (action, wall) {
		action.speed.x *= -1;
	};

	tds.onActionWallCollisionY = function (action, wall) {
		action.speed.y *= -1;
	};

	tds.onOptionCollision = function (player, option) {
		tds.del(option);
		tds.task('findFlower').up();
	};

	tds.onActionCollision = function (player, action) {
		document.location.reload();
	};

	tds.onActionUpdate = function (action, direction) {
		if (action.isInCameraStatic()) {

			if (action.getDistance(pl) < 150) {
				action.rotateForObject(pl, 10);
				action.runAngle(1);
			} else {
				if (direction == 'RIGHT')
					action.angle = 0;
				else if (direction == 'LEFT')
					action.angle = 180;
				else if (direction == 'UP')
					action.angle = -90;
				else if (direction == 'DOWN')
					action.angle = 90;
			}


		}
	};

	this.update = function () {
		// Update function
		game.clear(); // clear screen
		background.draw();

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

		brush.drawTextLinesS({
			x : 0, y : 0,
			lines : [
							'FPS: '+pjs.system.getFPS(),
						  'Собрано цветочков: '+tds.task('findFlower').progress()+'%',
						  'Player Direction: ' + tds.getPlayerDirection(),
						 ],
			size : 40,
			style : 'bold',
			color : '#E8E9E4',
			strokeColor : 'black',
			strokeWidth : 1
		});

	};

});

game.startLoop('myGame');