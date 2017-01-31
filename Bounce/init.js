var pjs = new PointJS('2D', 400, 400, {
	backgroundColor : '#C9D6FF'
});
pjs.system.initFullPage();

var log = pjs.system.log;
var game = pjs.game;
var point = pjs.vector.point;
var camera = pjs.camera;
var brush = pjs.brush;
var OOP = pjs.OOP;
var math = pjs.math;

var key = pjs.keyControl.initKeyControl();
var mouse = pjs.mouseControl.initMouseControl();

var score = 0;
var record = 0;

//var touch = pjs.touchControl;
//touch.initTouchControl();