var Logo = function (time, scale, loop, backColor, color, textArr) {
	var game   = pjs.game;           // Game Manager
	var point  = pjs.vector.point;   // Constructor for Point
	var brush  = pjs.brush;          // Brush, used for simple drawing
	var OOP    = pjs.OOP;            // Object's manager

	var I = 0;
	var count = textArr.length - 1;
	var time = time || 0.02;
	var nextLoop = loop;
	var textArr = textArr;

	var width = game.getWH().w;
	var height = game.getWH().h;

	var R = game.getResolution() * (scale || 1);

	var text = game.newTextObject({
		text : textArr[0],
		size : 50 * R,
		color : color || 'white'
	});

	this.entry = function () {
		I = 0;
		text.setText(textArr[I]);
		text.setPositionC(point(width / 2, height / 2));
		text.setAlpha(0);
	};

	var timer = 0;

	this.update = function () {
		var DT = game.getDT(100);
		// Update function
		game.fill(backColor || 'black');

		text.draw();
		text.transparent(time * DT);

		if (time > 0) {
			if (text.getAlpha() > 0.9) {
				timer += 1 * DT;
				if (timer > 10) {
					time *= -1;
				}
			}
		}

		if (time < 0) {
			if (text.getAlpha() < 0.1) {
				timer -= 1 * DT;
				if (timer < 0) {
					time *= -1;
					I++;

					if (I > count) {
						game.setLoop(nextLoop);
						return;
					} else {
						text.setText(textArr[I]);
						text.setPositionC(point(width / 2, height / 2));
					}
				}
			}
		}


	};
};