var pjs = new PointJS('2D', 1280 / 2, 720 / 2, { // 16:9
	backgroundColor : '#53769A' // if need
});
pjs.system.initFullPage(); // for Full Page mode
// pjs.system.initFullScreen(); // for Full Screen mode (only Desctop)

var pljs = new PlatformerJS(pjs);
pljs.autoDraw = true;

var bg = new CSSBackground(pjs);
bg.setImage('img/back.jpg');

var joystick = new JoyStick(pjs, 'arrows', 0, 0, 50, 50, 0, 40);

var log    = pjs.system.log;     // log = console.log;
var game   = pjs.game;           // Game Manager
var point  = pjs.vector.point;   // Constructor for Point
var camera = pjs.camera;         // Camera Manager
var brush  = pjs.brush;          // Brush, used for simple drawing
var OOP    = pjs.OOP;            // Object's manager
var math   = pjs.math;           // More Math-methods
var levels = pjs.levels;         // Levels manager

var key    = pjs.keyControl.initKeyControl();

var width  = game.getWH().w; // width of scene viewport
var height = game.getWH().h; // height of scene viewport

pjs.system.setTitle('PointJS Platformer'); // Set Title for Tab or Window

var map = [
	'',
	'                     0000000  00',
	'                                 0 ',
	'                             000000 ',
	'                        0   00',
	'    P           CCCC|  00| 000  ',
	'0000000      000000000000000000000',
	'      00    00',
	'      000| 000',
	'      00000000'
];

game.newLoopFromConstructor('myGame', function () {

	var image = pjs.tiles.newImage('img/man.png');

	var animStand = image.getAnimation(202, 215, 92, 156, 1);
	var animGo    = image.getAnimation(0, 0, 103, 150, 6);

	var player = game.newAnimationObject({
		x : 100, y : 0,
		w : 30, h : 60,
		animation : animStand,
		delay : 8,
		box : {
			offset : point(8),
			size : pjs.vector.size(-16)
		}
	});

	pljs.setPlayer(player);
	player.gravity = 0.3;
	player.friction = 0.05;
	player.maxSpeed = point(2, 6);

	var score = 0;

	pljs.onCellCollision = function (player, cell) {
		pljs.del(cell);
		score++;
	}

	pljs.onOptionCollision = function (player, option) {
		game.setLoop('myGame');
	}


	this.entry = function () {

		if ('ontouchstart' in window) {

			joystick.setImage('btnLeft', 'img/left.png');
			joystick.setImage('btnRight', 'img/right.png');
			joystick.setImage('btnFire', 'img/jump.png');

			joystick.show();
		}

		joystick.hideBtn('btnUp, btnDown');


		levels.forStringArray({w : 30, h : 30, source : map}, function (symbol, x, y, w, h) {
			if (symbol == 'P') {
				player.setPositionC(point(x, y));
				return;
			} else if (symbol == '0') {
				pljs.addWall(game.newImageObject({
					x : x, y : y,
					w : w, h : h,
					file : 'img/block.png'
				}));
			} else if (symbol == 'C') {
				pljs.addCell(game.newImageObject({
					x : x, y : y - 20,
					w : w / 1.5, h : h / 1.5,
					file : 'img/bt.png',
					userData : {
						jumpSpeed : math.random(2, 10)
					}
				}));
			} else if (symbol == '|') {
				pljs.addOption(game.newImageObject({
					x : x, y : y + 10,
					w : w, h : h / 1.5,
					file : 'img/coll.png'
				}));
			}



		});

		score = 0;

	};

	joystick.on('btnLeft:down', function () {
		player.setFlip(1, 0);
		player.speed.x -= 0.3;
	});

	joystick.on('btnRight:down', function () {
		player.setFlip(0, 0);
		player.speed.x += 0.3;
	});

	joystick.on('btnFire:press', function () {
		player.jump(20);
	});

	this.update = function () {
		game.clear(); // clear screen

		if (key.isPress('UP')) {
			player.jump(20);
		}

		if (key.isDown('LEFT')) {
			player.setFlip(1, 0);
			player.speed.x -= 0.3;
		} else if (key.isDown('RIGHT')) {
			player.setFlip(0, 0);
			player.speed.x += 0.3;
		}

		if (player.speed.x) {
			player.setAnimation(animGo);
		} else {
			player.setAnimation(animStand);
		}


		bg.move(point(-player.speed.x / 2, -player.speed.x / 2));

		camera.follow(player, 30);
		pljs.update();

		brush.drawTextS({
			text : 'Собрано: ' + score,
			size : 30,
			color : '#FFFFFF',
			strokeColor : '#545454',
			strokeWidth : 1,
			style : 'bold',
			font : 'Arial'
		});

		// player.drawStaticBox('red');

	};


});

game.startLoop('myGame');