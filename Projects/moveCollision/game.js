var pjs = new PointJS(640, 480, {
	backgroundColor : '#adc6dc' // optional
});
pjs.system.initFullPage(); // for Full Page mode
// pjs.system.initFullScreen(); // for Full Screen mode (only Desctop)

var log    = pjs.system.log;     // log = console.log;
var game   = pjs.game;           // Game Manager
var point  = pjs.vector.point;   // Constructor for Point
var camera = pjs.camera;         // Camera Manager
var brush  = pjs.brush;          // Brush, used for simple drawing
var OOP    = pjs.OOP;            // Objects manager
var math   = pjs.math;           // More Math-methods

var key   = pjs.keyControl.initKeyControl();

var width  = game.getWH().w; // width of scene viewport
var height = game.getWH().h; // height of scene viewport

var level, ss;

// Game Loop
game.newLoopFromConstructor('myGame', function () {
	// Constructor Game Loop

  var pl;
  var speed = point(0, 3);
  var scaleCount = 0;
  var countJump = 0;

	this.update = function () {
		// Update function

		var visArr = level.getObjectsInCamera();

    if (key.isDown('D')) speed.x = 2;
    else if (key.isDown('A')) speed.x = -2;
    else speed.x = 0;

   if (key.isPress('W') && !speed.y && !countJump) {
      countJump++;
      speed.y = -6;
    }
    if (speed.y < 4) speed.y += 0.3;

    pjs.vector.moveCollision(pl, visArr, speed, function (pl, w, _x, _y) {
      if (_y) {
        if (pl.y < w.y)
        countJump = 0;
      }
    }, true, 60);


    OOP.drawArr(visArr);

    camera.follow(pl);

    if (countJump)
      pl.turn(speed.x * 2.3);
    else
      pl.setAngle(0);

    if (speed.x === 0 && scaleCount < 50) {
      camera.scaleC(point(1.005, 1.005));
      scaleCount++;
    } else if (speed.x !== 0 && scaleCount > -50) {
      camera.scaleC(point(0.995, 0.995));
      scaleCount--;
    }

	};

  this.entry = function () {
    pl = level.getObjectByName('player');
  };

});

OOP.readJSON('level1.pjs', function (data) {
  level = pjs.levels.newLevelFromJSON(data);
  game.startLoop('myGame');
}, true);

