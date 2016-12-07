var pjs = new PointJS('2D', 1280 / 2, 720 / 2); // 16:9
pjs.system.initFullPage(); // for Full Page mode

var log    = pjs.system.log;     // log = console.log;
var game   = pjs.game;           // Game Manager
var point  = pjs.vector.point;   // Constructor for Point
var camera = pjs.camera;         // Camera Manager
var brush  = pjs.brush;          // Brush, used for simple drawing
var OOP    = pjs.OOP;            // Object's manager
var math   = pjs.math;           // More Math-methods

// создадим экземпляр таблицы рекордов
var records = new Records(10); // максимальное количество участников

// Заполним таблицу рекордов случайными значениями
OOP.forInt(10, function (i) { // это цикл в 10 итераций
	records.addRecord(pjs.math.random(0, 100), 'Игрок ' + i); // это добавление рекорда
});


// Advanced Game Loop
var MyGame = function () {
	// Constructor Game Loop

	this.update = function () {
		// Update function

		game.fill('#D9D9D9');

		var recArr = [];
		OOP.forArr(records.getRecords(), function (el) {
			recArr.push(el.info + ' - ' + el.record);
		}); // этим собираем данные в одну строку (ПРОСТО ДЛЯ ПРИМЕРА)

		recArr.push('');

		recArr.push('Чтобы добавить рекорд, используй команду в консоли');
		recArr.push('    records.addRecord(200, "Вася");');
		recArr.push('Где идет Рекорд (число) и Имя игрока или {} - объект с данными');

		recArr.push('');

		recArr.push('Для получения рекордов:');
		recArr.push('records.getRecords()');
		recArr.push('records.getAsJSON()');
		recArr.push('records.getAsNumbers()');

		recArr.push('');

		recArr.push('Для добавления рекордов:');
		recArr.push('records.addRecord(record, nameOrObject)');
		recArr.push('records.setAsJSON(jsonString) // перезапишет все рекорды');

		brush.drawTextLines({
			x : 10, y : 10,
			lines : recArr,
			size : 20 * game.getResolution(),
			color : '#515151'
		});

	};
};
game.newLoopFromClassObject('myGame', new MyGame());

game.startLoop('myGame');