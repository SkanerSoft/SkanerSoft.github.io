// FPS Checker Module
PointJS.Module = function (pjs) {
	'use strict';
	pjs.system.initFPSCheck();

	this.draw = function () {
		pjs.brush.drawTextS({
			text: 'FPS: ' + pjs.system.getFPS(),
			size: 20, color: 'white'
		});
	};
};