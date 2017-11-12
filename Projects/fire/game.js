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
const mouse  = pjs.mouseControl.initControl();

let width  = game.getWH().w; // width of scene viewport
let height = game.getWH().h; // height of scene viewport

pjs.modules.importSync('modules/particles.js');
pjs.particles.setLimit(3000);
pjs.system.setSettings({
	isAutoClear : false
});

game.newLoopFromConstructor('myGame', function () {
	this.update = function () {
		game.fill(pjs.colors.hex2rgba('#1f1f1f', 0.8));

		if (mouse.isMove() || 1) {
			pjs.particles.add('fire', mouse.getPosition(), math.random(1, 10, true), '#ffcc72', 1, 20, 0.03);
		}

	};
});

game.startLoop('myGame');