var CSSBackground = function (pjs, type) {
	'use sctrict';

	var log    = pjs.system.log;     // log = console.log;

	var positionX = 0;
	var positionY = 0;
	var sizeX = '', sizeY = '';

	if (!type) type = 'horizontal';

	if (type == 'multi')
		sizeX = sizeY = 'cover';
	else if (type == 'horizontal') {
		sizeY = 'contain';
	} else if (type == 'original') {
		sizeX = sizeY = 'auto';
	} else if (type == 'vertical') {
		sizeX = 'contain';
	}

	this.setImage = function (name, altSizeX, altSizeY) {
		positionX = 0;
		positionY = 0;

		if (altSizeX) sizeX = altSizeX + 'px';
		if (altSizeY) sizeY = altSizeY + 'px';

		var c = pjs.system.getCanvas().style;
		c.background = 'url('+name+')';
		c.backgroundSize = sizeX + ' ' + sizeY;
		c.backgroundPosition = positionX + 'px ' + positionY + 'px';
		c.backgroundRepeat = 'repeat';
	};

	this.move = function (speed) {
		positionX += speed.x;
		positionY += speed.y;
		if (type != 'vertical')
			pjs.system.getCanvas().style.backgroundPositionX = positionX+'px';
		if (type != 'horizontal')
			pjs.system.getCanvas().style.backgroundPositionY = positionY+'px';
	};


};