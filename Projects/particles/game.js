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

pjs.modules.import('./particles.js', function () {
	pjs.particles.setLimit(100);
});

game.newLoopFromConstructor('myGame', function () {
	this.update = function () {
		if (!pjs.resources.isLoaded()) return;

		pjs.particles.add({
			type: 'gravity',
			position: point(width / 2, -10),
			size: math.random(1, 3, true),
			width : width,
			fillColor: '#b0b3b2',
			speed: 0.9,
			step: 0.01,
			density : 0
		});

		pjs.particles.add({
			type: 'fire',
			position: mouse.getPosition(),
			size: math.random(3, 10, true),
			fillColor: '#ffe374',
			speed: 0.6,
			step: 0.02,
			width: 6,
			density : 4
		});

		if (!mouse.isMove()) {
			pjs.particles.add({
				type: 'smoke',
				position: mouse.getPosition().minus(point(0, 10)),
				size: math.random(2, 10, true),
				fillColor: '#7e7e7e',
				speed: 0.8,
				step: 0.01,
				width: 1,
				density: 0
			});
		}

	};
});

game.startLoop('myGame');
