// Advanced Game Loop
var Lang = function () {
	// Constructor Game Loop

	this.update = function () {
		// Update function

		game.fill('#D9D9D9');

		brush.drawText({
			x : 10, y : 10,
			text : 'Привет, Мир!',
			size : 30,
			color : '#515151'
		});

	};

};