
var GC_ANIMATIONS = {}, __LVL_ANIMATIONS = {
  'stay' : {file:'resources/sprite1.gif',x:6,y:53,w:45,h:60,frames:1},
  'go' : {file:'resources/sprite1.gif',x:51,y:55,w:45,h:60,frames:4},
  'attack' : {file:'resources/sprite1.gif',x:1,y:200,w:55,h:60,frames:3},
  'enemy_stay' : {file:'resources/sprite2.png',x:28,y:1,w:72,h:129,frames:1},
  'con' : {file:'resources/sprite2.png',x:158,y:1,w:72,h:129,frames:1}
};

var POINTJS_ENGINE_CREATED_EVENT = function (pjs) {
  if (typeof __LVL_ANIMATIONS === 'undefined') return false;
  pjs.OOP.forEach(__LVL_ANIMATIONS, function (a, name) {
    GC_ANIMATIONS[name] = pjs.tiles.newImage(a.file).getAnimation(a.x, a.y, a.w, a.h, a.frames);
  });
};

var pjs = new PointJS(640, 480, {
  backgroundColor : '#4b4843' // optional
});

pjs.system.initFullPage(); // for Full Page mode
pjs.system.setSmoothing(false);

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

var level;

game.newLoopFromConstructor('myGame', function () {

  var pl, back, enemy, speed = point();
  var shakeRaidus = 0;

  this.update = function () {
    back.draw();
    pl.draw();
    enemy.draw();

    if (key.isDown('D')) {
      pl.setFlip(0, 0);
      pl.setAnimation(GC_ANIMATIONS['go']);
      speed.x = 2;
    } else if (key.isDown('A')) {
      pl.setFlip(1, 0);
      pl.setAnimation(GC_ANIMATIONS['go']);
      speed.x = -2;
    } else if (key.isPress('ENTER')) {
      pl.setAnimation(GC_ANIMATIONS['attack']);
      pl.setFrame(0);
    } else {
      speed.x = 0;
      if (pl.getAnimation() === GC_ANIMATIONS['attack']) {

        if (pl.getDistanceC(enemy.getPositionC()) < 40 && pl.getFrame() == 1) {
          enemy.dataSet('hp', enemy.dataGet('hp') - 1);
          shakeRaidus = 10;
        }

        if (pl.getFrame() === pl.getLastFrame()) {
          pl.setAnimation(GC_ANIMATIONS['stay']);
        }
      } else {
        pl.setAnimation(GC_ANIMATIONS['stay']);
      }
    }

    if (speed.x) {
      pl.move(speed);
    }

    if (!shakeRaidus) {
      if (camera.getPosition().x < back.x) camera.setPosition(point(back.x,back.y));
      if (camera.getPosition().x+width >= back.x+back.w) camera.setPosition(point(back.x+back.w-width,back.y));
      camera.moveTime(point(pl.getPositionC().x - width/2, back.y), 10);
    } else {
      camera.shake(point(pl.getPositionC().x - width/2, back.y), pjs.vector.size(shakeRaidus / 5, shakeRaidus / 5));
      shakeRaidus--;
    }

    if (back.y < 0 || back.y + back.h < height) {
      camera.scale(point(1.01, 1.01));
      width = game.getWH().w;
      height = game.getWH().h;
    }

  };

  this.entry = function () {
    back = level.getObjectByName('back');
    pl = level.getObjectByName('player');
    pl.setDelay(15);
    enemy = level.getObjectByName('enemy');
    enemy.dataSet('hp', 100);
    enemy.ondraw = function () {

      if (this.dataGet('hp') <= 0) {
        game.stop();
        location.reload();
        return;
      }

      brush.drawText({
        x : enemy.getPositionC().x,
        y : enemy.y-30,
        align : 'center',
        text : this.dataGet('hp'),
        size : 30,
        color : '#102771'
      });

    }
  };

});

OOP.readJSON('resources/level.pjs', function (data) {
  level = pjs.levels.newLevelFromJSON(data);
  game.startLoop('myGame');
}, true);















