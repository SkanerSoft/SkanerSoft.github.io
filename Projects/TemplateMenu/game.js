var pjs = new PointJS('2D', 500, 400);
// pjs.system.consoleLog(true);

pjs.system.initFullPage();

var log = pjs.system.log;
var game = pjs.game;
var point = pjs.vector.point;
var camera = pjs.camera;
var brush = pjs.brush;
var OOP = pjs.OOP;
var math = pjs.math;

// для добавления меню достаточно просто создать игровой цикл, передав конструктору два параметра:
// первый - экземпляр движка
// второй - объект, содержащий свойства, как указано в примере
// объект items содержит пункты меню в формате "название игрового цикла : надпись на пункте меню"

game.newLoopFromClassObject('menu', new Menu(pjs, {
	name  : 'Название моей игры',
	author : 'SkanerSoft',
	radius : 15,
	items : {
		game  : 'В игру',
		about : 'Об игре',
		gameLoop1 : 'Игровой цикл 1',
		gameLoop2 : 'Игровой цикл 2',
		gameLoopX : 'И так далее',
	}
}));


game.startLoop('menu');


