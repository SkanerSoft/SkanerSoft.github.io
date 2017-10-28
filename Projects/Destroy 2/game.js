var pjs = new PointJS(640, 480, {
	backgroundColor : '#4b4843' // optional
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
var mouse = pjs.mouseControl.initMouseControl();

var width  = game.getWH().w; // width of scene viewport
var height = game.getWH().h; // height of scene viewport

var BW = 40, BH = 40;

pjs.system.initFPSCheck();

game.newLoopFromConstructor('myGame', function () {

  var pPos;

  var world = [];
  pjs.levels.forStringArray({w : BW, h : BH, source : [
    '0000000000000000000000000000',
    '0000000000000000000000000000',
    '0000000000000000000000000000',
    '0000000000000000000000000000',
    '000000        00000000000000',
    '000           00000000000000',
    '000  P    000000000000000000',
    '000       000000000000000000',
    '0000000000000000000000000000',
    '0000000000000000000000000000'
  ]}, function (S, X, Y, W, H) {
    if (S === '0') {
      world.push(game.newRectObject({
        x : X, y : Y,
        w : W, h : H,
        fillColor : '#bcbcbc'
      }));
    } else if (S === 'P') {
      pPos = point(X, Y);
    }
    
  });
  
  var pl = game.newRectObject({
    x : pPos.x, y : pPos.y,
    w : 30, h : 50,
    fillColor : 'white'
  });

  var speed = point();
  
	this.update = function () {

    if (key.isDown('A')) speed.x = -2;
    else if (key.isDown('D')) speed.x = 2;
    else speed.x = 0;

    if (speed.x < 5) speed.y += 0.5;
    if (key.isPress('W')) speed.y = -7;

    pl.draw();

    var collisionBlocks = [];
    var drawBlocks = [];
    var selBlocks = [];

    var R = mouse.isPress('RIGHT');
    var L = mouse.isPress('LEFT');
    var MP = mouse.getPosition();
    
    var createPos = point(BW * Math.floor(MP.x / BW), BH * Math.floor(MP.y / BH));

    OOP.forArr(world, function (w, idW) {
      if (w.isInCameraStatic()) {
        drawBlocks.push(w);
        
        if (pl.getDistanceC(w.getPositionC()) < 80) {
          
          if (mouse.isInStatic(w.getStaticBox())) {
            selBlocks.push(w);
            if (L) {
              world.splice(idW, 1);
            }
          }
        }
        
      }
    });
    
    OOP.forArr(drawBlocks, function (d) {
      
      d.setAlpha(1 - pl.getDistanceC(d.getPositionC()) / 250);
      
      d.draw();
      
      if (pl.getDistanceC(d.getPositionC()) < 100) {
        collisionBlocks.push(d);
      }
      
    });
    
    OOP.forArr(selBlocks, function (s) {
      brush.drawRect({
        x : s.x, y : s.y,
        w : s.w, h : s.h,
        strokeColor : '#ac5a5a',
        strokeWidth : 2
      });
    });
    
    
    var canCreate = false;
    var dist = pl.getDistanceC(MP);
    if (!selBlocks.length && dist > 50 && dist < 100) {
      canCreate = true;
      brush.drawRect({
        x : createPos.x, y : createPos.y,
        w : BW, h : BH,
        strokeColor : '#69ac5a',
        strokeWidth : 2
      });
    }
    
    if (L && canCreate) {
      world.push(game.newRectObject({
        x : createPos.x, y : createPos.y,
        w : BW, h : BH,
        fillColor : '#e2e2e2'
      }));
    }
    
    pjs.vector.moveCollision(pl, collisionBlocks, speed);
    
    camera.follow(pl, 10);
    
    brush.drawTextS({
      text : pjs.system.getFPS(),
      color : 'white',
      size : 50
    });

	};


});

game.startLoop('myGame');