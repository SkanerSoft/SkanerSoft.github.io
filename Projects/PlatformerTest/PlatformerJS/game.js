var pjs = new PointJS('2D', 1280 / 2, 720 / 2, { // 16:9
	backgroundColor : '#59AAC8' // if need
});
pjs.system.initFullPage(); // for Full Page mode
// pjs.system.initFullScreen(); // for Full Screen mode (only Desctop)

pjs.system.initFPSCheck();

var platformer = new PlatformerJS(pjs);

var log    = pjs.system.log;     // log = console.log;
var game   = pjs.game;           // Game Manager
var point  = pjs.vector.point;   // Constructor for Point
var camera = pjs.camera;         // Camera Manager
var brush  = pjs.brush;          // Brush, used for simple drawing
var OOP    = pjs.OOP;            // Object's manager
var math   = pjs.math;           // More Math-methods
var levels = pjs.levels;         // Levels manager

var key   = pjs.keyControl.initKeyControl();
var mouse = pjs.mouseControl.initMouseControl();
// var touch = pjs.touchControl.initTouchControl();
// var act   = pjs.actionControl.initActionControl();

var width  = game.getWH().w; // width of scene viewport
var height = game.getWH().h; // height of scene viewport

pjs.system.setTitle('PointJS Game'); // Set Title for Tab or Window

// Game Loop
game.newLoopFromConstructor('myGame', function () {
	// Constructor Game Loop
	var score = 0;

	var map = [
		'000000000000000000000000',
		'0 *      *******      10',
		'0          *** 8*      0',
		'0  *       11111       0',
		'0        11            0',
		'0                      0',
		'0      111111 ***      0',
		'0             111 **** 0',
		'0                 1111 0',
		'0   ***                0',
		'000000000000000000000000'
	];

	var tileSize = 35;

	platformer.onActionCollision = function (player, block) {

	};

	platformer.onCellDestroy = function (player, cell) {
		score += 1;
		platformer.del(cell);
	};

	platformer.onEnemyCollision = function (player, enemy) {
		if (player.y+player.h < enemy.y+enemy.h/2) {
			platformer.del(enemy);
			player.jumped = false;
			player.jump(5);
			score = 100;
		} else {
			score = -100;
		}
	};

	platformer.setBackImage('img/back.png');

	OOP.forArr(map, function (string, y) {
		OOP.forArr(string, function (cell, x) {
			if (cell == '0')
				platformer.addWall(game.newImageObject({
					positionC : point(tileSize * x, tileSize * y),
					w : tileSize, h : tileSize,
					file : 'img/ground.png'
				}));
			else if (cell == '1')
				platformer.addWall(game.newImageObject({
					positionC : point(tileSize * x, tileSize * y),
					w : tileSize, h : tileSize,
					file : 'img/brick.png'
				}));
			else if (cell == '*')
				platformer.addCell(game.newAnimationObject({
					positionC : point(tileSize * x, tileSize * y),
					animation : pjs.tiles.newAnimation('img/cell.png', 21, 33, 4),
					w : tileSize / 2, h : tileSize / 2,
					delay : math.random(50, 200) / 10,
					userData : {
						jumpSpeed : math.random(2, 10)
					}
				}));
			else if (cell == '8')
				platformer.addEnemy(game.newAnimationObject({
					positionC : point(tileSize * x, tileSize * y),
					animation : pjs.tiles.newAnimation('img/enemy.png', 44, 32, 2),
					w : 44 / 1.5, h : 32 / 1.5,
					delay : math.random(50, 200) / 10,
					userData : {
						jumpSpeed : math.random(2, 10),
						gravity : point(0, 2),
						speed : point(-1, 0)
					}
				}));

		});
	});

	var rect = game.newImageObject({
		positionC : point(150, 10), // central position of text
		w : tileSize / 1.5, h : tileSize / 1.5,
		file : pjs._logo
	});
	platformer.addAction(rect);
	rect.friction = 0.1;
	rect.gravity.y = 0.5;
	platformer.player = rect;




	this.update = function () {
		// Update function
		game.clear(); // clear screen

		if (key.isDown('LEFT'))
			rect.speed.x = -2;
		else if (key.isDown('RIGHT'))
			rect.speed.x = 2;
		// else
		// 	rect.speed.x = 0;

		rect.turn(rect.speed.x*3);

		if (key.isDown('UP'))
			rect.jump(10); //rect.speed.y = -2;
		else if (key.isDown('DOWN'))
			rect.speed.y += 2;
		// else
		// 	rect.speed.y = 0;

		if (rect.y > 1000) {
			rect.y = 10;
			rect.x = 150;
		}

		platformer.update();
		camera.follow(rect);

		var createAction = true;
		var object = false;
		OOP.forArr(platformer.getObjects(), function (el) {
			if (mouse.isInStatic(el.getStaticBox())) {
				object = el;
				createAction = false;
				return 'break';
			}
		});

		if (createAction) {
			brush.drawRect({
				x : mouse.getPosition().x - tileSize / 2,
				y : mouse.getPosition().y - tileSize / 2,
				w : tileSize, h : tileSize,
				strokeColor : 'green',
				strokeWidth : 1
			});

			if (mouse.isPress('LEFT')) {
				platformer.addWall(game.newImageObject({
					positionC : mouse.getPosition(),
					w : tileSize, h : tileSize,
					file : 'img/brick.png'
				}));
			}

		} else {
			brush.drawText({
				x : mouse.getPosition().x - tileSize / 2,
				y : mouse.getPosition().y - tileSize / 2,
				size : 20,
				color : 'white',
				text : 'ПКМ - удалить'
			});
			brush.drawRect({
				x : mouse.getPosition().x - tileSize / 2,
				y : mouse.getPosition().y - tileSize / 2,
				w : tileSize, h : tileSize,
				strokeColor : 'red',
				strokeWidth : 1
			});
			if (mouse.isPress('RIGHT')) {
				platformer.del(object);
			}
		}

		brush.drawTextS({
			text : 'FPS: ' + pjs.system.getFPS(),
			size : 30,
			color : 'white'
		});

		brush.drawTextS({
			y : 35,
			text : 'SCORE: ' + score,
			size : 30,
			color : 'white'
		});

	};

});

game.startLoop('myGame');