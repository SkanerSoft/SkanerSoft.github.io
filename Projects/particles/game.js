const pjs = new PointJS(640, 480, {
	backgroundColor : '#363636' // optional
});
pjs.system.initFullPage(); // for Full Page mode
// pjs.system.initFullScreen(); // for Full Screen mode (only Desctop)

const log    = pjs.system.log;     // log = console.log;
const game   = pjs.game;           // Game Manager
const point  = pjs.vector.point;   // Constructor for Point
const camera = pjs.camera;         // Camera Manager
const brush  = pjs.brush;          // Brush, used for simple drawing
const OOP    = pjs.OOP;            // Objects manager
const math   = pjs.math;           // More Math-methods

pjs.modules.importSync('modules/particles.js');

const key   = pjs.keyControl.initKeyControl();

let width  = game.getWH().w; // width of scene viewport
let height = game.getWH().h; // height of scene viewport

game.newLoopFromConstructor('myGame', function () {
  let level, player, speed = point(), jumpCount;

	this.update = function () {
    if (!level || !player) return;
    let map = level.getObjectsInCamera();
    OOP.drawArr(map);

		OOP.addParticle(player.getPositionC(), 20, '#b8b8b8', 0.5, 2, 30, true);

    if (key.isDown('A')) speed.x = -3;
    else if (key.isDown('D')) speed.x = 3;
    else speed.x = 0;
    
    if (key.isPress('W') && !jumpCount) {
      jumpCount++;
      speed.y = -6;
    }
    if (speed.y < 5) speed.y += 0.2;
    
    pjs.vector.moveCollision(player, map, speed, function (pl, w, isX, isY) {
      if (isY) jumpCount = 0;
    }, true);

    camera.follow(player);
	};

	this.entry = function () { // optional
    OOP.readJSON('level.pjs', function (data) {
      level = pjs.levels.newLevelFromJSON(data);
      player = level.getObjectByName('player');
      level.del(player);
    }, true);
	};

});

game.startLoop('myGame');