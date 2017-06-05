function PointJS(D, w, h, s, NodeJS) { // GL2D/2D/3D, width, height, styleObject, NodeJS
	'use strict';

	this._logo = 'http://pointjs.ru/PjsMin.png';
	var version_of_engine = '0.1.2.0';

	var device = window;
	var _PointJS = this;

	var noFunction = function () {
		console.log('function is not supported in this object');
	};











	// settings ///////////////////////////////////////

	var isShowError = true,
		isZBuffer = false,
		isStopForError = true,
		isAutoClear = false,
		isRun = false,
		isOnlyInt = false,
		isSmooth = true,

		width = w,
		height = h,
		origWidth = w,
		origHeight = h,
		width2 = width / 2,
		height2 = height / 2,

		scale = 1,
		offset = {x : 0, y : 0},
		angle = 0,
		centerCamera = {x : 0, y : 0},

		contextSettings = {
			fillStyle : 'black',
			strokeStyle : 'black',
			globalAlpha : 1,
			font : 'sans-serif',
			textBaseline : 'top',
		};

	var log = function (obj) {
		console.log('[PointJS] : ', obj);
	};

	if (typeof POINTJS_USER_LOG != 'undefined') {
		log = POINTJS_USER_LOG;
	}

	var errorLog = function (e) {
		var stack = decodeURI(e.stack.toString().replace(/(@|[\(\)]|[\w]+:\/\/)/g, ''));
		stack = stack.split(/\n/);
		stack = (stack[2] == '' ? stack[0] : stack[1]).split('/');
		stack = stack[stack.length - 1].split(':');
		log('ERROR "' + e.toString() + '" \n in      ' + stack[0] + ' \n line :   ' + stack[1] + ' \n symbol : ' + stack[2]);
	};

	var DEPRECATED = function (f1, f2) {
		log('function "' + f1 + '" is DEPRECATED, use a "' + f2 + '"');
	};

	// end settings //////////////////////////////////////













	// reserved ///////////////////////////////////////////

	this.game =             {};
	this.levels =           {};
	this.camera =           {};
	this.keyControl =       {};
	this.mouseControl =     {};
	this.touchControl =     {};
	this.actionControl =    {};
	this.system =           {};
	this.vector =           {};
	this.math =             {};
	this.colors =           {};
	this.brush =            {};
	this.audio =            {};
	this.wAudio =           {};
	this.resources =        {};
	this.tiles =            {};
	this.OOP =              {};
	this.GL =               {};
	this.memory =           {};
	this.zList =            {};

	// end reserved ///////////////////////////////////////




















	this.system.log = log;

	this.system.consoleLog = function (bool) {
		if (bool === true) {
			this.log = console.log;
		} else {
			this.log = log;
		}
	};

	this.system.setTitle = function (title) {
		device.document.title = title;
	};

	this.system.setSettings = function (settings) {
		isShowError = isDef(settings.isShowError) ? settings.isShowError : true;
		isStopForError = isDef(settings.isStopForError) ? settings.isStopForError : true;
		isAutoClear = isDef(settings.isAutoClear) ? settings.isAutoClear : false;
		isZBuffer = isDef(settings.isZBuffer) ? settings.isZBuffer : false;
	};

	this.system.setDefaultSettings = function (obj) {
		for (var i in obj) {
			contextSettings[i] = obj[i];
		}
		context.save();
	};

	this.system.setSmoothing = function (bool) {
		isSmooth = bool;
		setSmooth();
	};

	// end settings ///////////////////////////////////


















	// info ///////////////////////////////////////////

	var info = {
		'name'    : 'PointJS',
		'desc'    : 'HTML5 2D Game Engine for JavaScript',
		'author'  : 'Skaner (skaner0@yandex.ru)',
		'version' : version_of_engine
	};

	this.system.getInfo = function () {
		return info;
	};

	// end info /////////////////////////////////////////



















	// WebGL ///////////////////////////////////////////
	// var webgl = false;


	var shader = {
		fr : '',
		vr : ''
	};

	var getShader = function (type, text) {
		var source = text;
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			log('Error shader compilation : ' + gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	};

	var shaderProgram;


	var gl = false;
	var glCanvas = false;
	var initGL = function () {

		glCanvas = device.document.createElement('canvas');
		glCanvas.width = canvas.width;
		glCanvas.height = canvas.height;
		glCanvas.style.position = 'fixed';
		glCanvas.style.left = 0;
		glCanvas.style.top = 0;
		glCanvas.style.zIndex = canvas.style.zIndex + 1;
		glCanvas.id = 'PointJS-canvas_1';
		glCanvas.style.backgroundColor = s.backgroundColor ? s.backgroundColor : 'black';

		dom.attach(glCanvas);

		dom.addEvent('onload', 'hideSourceCanvas', function () {
			canvas.style.display = 'none';
		});

		gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');

		gl.viewport(0, 0, width, height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	};

	var reinitGL = function () {


	};

	var initShaders = function () {
		shader.vr =
			'attribute vec2 aPosition; '+
			'attribute vec2 aTextCoord; '+
			'uniform vec2 uResolution; '+
			'uniform int uMirrorX; '+
			'varying vec2 vTextureCoord; '+
			'void main() { '+
			'   vec2 zeroToOne = aPosition / uResolution; '+
			'   vec2 zeroToTwo = zeroToOne * 2.0; '+
			'   vec2 clipSpace = zeroToTwo - 1.0; '+
			'   gl_Position = vec4(clipSpace * vec2((uMirrorX == 1 ? -1 : 1), -1), 0, 1); '+
			'   vTextureCoord = aTextCoord; '+
			'}';

		shader.fr =
			'precision mediump float; '+
			'uniform sampler2D texture; '+
			'varying vec2 vTextureCoord; '+
			'uniform int uInversion; '+
			'void main() { '+
			'	vec4 texColor = texture2D(texture,vTextureCoord.xy); '+
			'	vec4 finalColor; '+
			'	finalColor = texColor; '+
			'	if (uInversion == 1) '+
			'		finalColor = 1.0 - finalColor; '+
			'	gl_FragColor = finalColor; '+
			'}';

		// получаем шейдеры
		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, getShader(gl.VERTEX_SHADER, shader.vr));
		gl.attachShader(shaderProgram, getShader(gl.FRAGMENT_SHADER, shader.fr));
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			log('Can\'t install shader');
		}

		gl.useProgram(shaderProgram);
	};

	var initWebGL = function () {
		initGL();
		initShaders();
		initBuffer();

		glOn = true;

	};


	var aTextCoord,
		aPosition,
		uResolution,
		uColor,
		itemSize,
		texture,
		uInversion,
		uMirrorX;

	var initBuffer = function () {
		itemSize = 2;

		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0, 0,
			width, 0,
			0, height,
			0, height,
			width, 0,
			width, height
		]), gl.STATIC_DRAW);

		aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
		uResolution = gl.getUniformLocation(shaderProgram, "uResolution");
		aTextCoord = gl.getAttribLocation(shaderProgram, "aTextCoord");
		uInversion = gl.getUniformLocation(shaderProgram, "uInversion");
		uMirrorX = gl.getUniformLocation(shaderProgram, "uMirrorX");

		gl.uniform2f(uResolution, width, height);

		gl.enableVertexAttribArray(aPosition);
		gl.vertexAttribPointer(aPosition, itemSize, gl.FLOAT, false, 0, 0);

		var textureBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0.0,  0.0,
			1.0,  0.0,
			0.0,  1.0,
			0.0,  1.0,
			1.0,  0.0,
			1.0,  1.0]), gl.STATIC_DRAW);

		gl.enableVertexAttribArray(aTextCoord);
		gl.vertexAttribPointer(aTextCoord, 2, gl.FLOAT, false, 0, 0);

		texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	};


	// DRAW

	this.GL.filter = function (type, obj) {
		if (!gl) return log('GL is not inited. Use a initGL() function.');
		if (type == 'inversion') gl.uniform1i(uInversion, 1);
		if (type == 'mirror-x') gl.uniform1i(uMirrorX, 1);

	};

	var drawGL = function () {
		if (!gl) return log('GL is not inited. Use a initGL() function.');

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		gl.uniform1i(uInversion, 0);
		gl.uniform1i(uMirrorX, 0);
	};



	// end WebGL ///////////////////////////////////////


























// vector ///////////////////////////////////////////

	var Point = function (x, y) {
		this.x = x || 0;
		this.y = y || 0;
	};

	Point.prototype = {
		abs :    function () {return new Point(Math.abs(this.x), Math.abs(this.y));},
		invert : function () {return new Point(-this.x, -this.y);},
		plus :   function (p) {return new Point(this.x+p.x, this.y+p,y);},
		minus :  function (p) {return new Point(this.x-p.x, this.y-p,y);},
		inc :    function (p) {return new Point(this.x*p.x, this.y*p,y);},
		div :    function (p) {return new Point(this.x/p.x, this.y/p,y);}
	};

	var point = function (x, y) {
		return new Point(x, y);
	};

	var size = function (w, h) {
		return {
			w : w,
			h : h
		};
	};

	var pointPlus = function (p1, p2) {
		return {
			x : p1.x + p2.x,
			y : p1.y + p2.y
		};
	};

	var pointMinus = function (p1, p2) {
		return {
			x : p1.x - p2.x,
			y : p1.y - p2.y
		};
	};

	var pointInc = function (p1, p2) {
		return {
			x : p1.x * p2.x,
			y : p1.y * p2.y
		};
	};

	var pointDiv = function (p1, p2) {
		return {
			x : p1.x / (p2.x != 0 ? p2.x : 1),
			y : p1.y / (p2.y != 0 ? p2.y : 1)
		};
	};

	var pointAbs = function (p) {
		return {
			x : Math.abs(p.x),
			y : Math.abs(p.y)
		};
	};

	var getPointAngle = function (p, c, a) {
		if (a != 0) {
			var r = a2r(a);
			var dx = p.x - c.x;
			var dy = p.y - c.y;
			var cos = Math.cos(r);
			var sin = Math.sin(r);
			return point(dx * cos - dy * sin + c.x, dx * sin + dy * cos + c.y);
		} else {
			return point(p.x, p.y);
		}
	};

	var getAngle2Points = function (p1, p2) {
		return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
	};

	var isPointIn = function (p, points) {
		var i, j, pip = 0;
		for (i = 0, j = points.length - 1; i < points.length; j = i++) {
			if (((points[i].y > p.y) != (points[j].y > p.y)) && (p.x < (points[j].x - points[i].x) * (p.y - points[i].y) / (points[j].y - points[i].y) + points[i].x)) {
				pip = !pip;
			}
		}
		return pip;
	};

	// var isPointIn = function (point, points) {
	// 	if (points.length < 3) {
	// 		return false;
	// 	}
	// 	var intersections_num = 0;
	// 	var prev = points.length - 1;
	// 	var prev_under = points[prev].y < point.y;
	// 	var i, len;
	// 	for (i = 0, len = points.length; i < len; ++i) {
	// 		var cur_under = points[i].y < point.y;
	// 		var a = pointMinus(points[prev], point);
	// 		var b = pointMinus(points[i], point);
	// 		var t = (a.x * (b.y - a.y) - a.y * (b.x - a.x));
	// 		if (cur_under && !prev_under) {
	// 			if (t > 0) {
	// 				intersections_num += 1;
	// 			}
	// 		}
	// 		if (!cur_under && prev_under) {
	// 			if (t < 0) {
	// 				intersections_num += 1;
	// 			}
	// 		}
	// 		prev = i;
	// 		prev_under = cur_under;
	// 	}

	// 	return (intersections_num & 1) != 0;
	// };

	var getMidPoint = function (p1, p2) {
		if (!isDef(p2)) return 0;
		return (point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2));
	};

	var getDistance = function (p1, p2) {
		return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
	};

	var isSame = function (p1, p2) {
		if (!isDef(p2)) return false;
		return (p1.x == p2.x && p1.y == p2.y);
	};

	var newStaticBox = function (x, y, w, h) {
		return {
			x : x,
			y : y,
			w : x + w,
			h : y + h
		};
	};

	var newDynamicBoxRect = function (x, y, w, h) {
		return [
			point(x, y),
			point(x + w, y),
			point(x + w, y + h),
			point(x, y + h),
		];
	};


	this.vector.point = point;
	this.vector.v2d = point;
	this.vector.size = size;
	this.vector.getPointAngle = getPointAngle;
	this.vector.isPointIn = isPointIn;
	this.vector.pointMinus = pointMinus;
	this.vector.pointPlus = pointPlus;
	this.vector.pointInc = pointInc;
	this.vector.pointDiv = pointDiv;
	this.vector.pointAbs = pointAbs;
	this.vector.getMidPoint = getMidPoint;
	this.vector.getDistance = getDistance;
	this.vector.isSame = isSame;
	this.vector.getAngle2Points = getAngle2Points;
	this.vector.newStaticBox = newStaticBox;
	this.vector.newDynamicBoxRect = newDynamicBoxRect;

	this.vector.moveCollision = function (player, walls, speed, onCollision) {
		var newSpeed = point(speed.x, speed.y);
		var step = 10, i = 0, len = walls.length, wall;

		for (; i < len; i+= 1) {
			wall = walls[i];

			if (player.getDistanceC(wall.getPositionC()) > (wall.w + wall.h) / 2 + (player.w + player.h) / 2 ) continue;

			var boxWall = wall.getStaticBox();
			if (player.isIntersect(wall)) {
				var boxPlayer = player.getStaticBox();

				var aSpeedX = Math.abs(speed.x);
				var aSpeedY = Math.abs(speed.y);

				if (boxPlayer.x+boxPlayer.w > boxWall.x + step + aSpeedX && boxPlayer.x < boxWall.x + boxWall.w - step - aSpeedX) {
					if (speed.y > 0 && boxPlayer.y+boxPlayer.h < boxWall.y+boxWall.h/2+aSpeedY) {
						newSpeed.y = 0;
					} else if (speed.y < 0 && boxPlayer.y > boxWall.y+boxWall.h-boxWall.h/2-aSpeedY) {
						newSpeed.y = 0;
					}
				}

				if (boxPlayer.y+boxPlayer.h > boxWall.y + step + aSpeedY && boxPlayer.y < boxWall.y + boxWall.h - step - aSpeedY) {
					if (speed.x > 0 && boxPlayer.x+boxPlayer.w < boxWall.x+boxWall.w/2+aSpeedX) {
						newSpeed.x = 0;
					} else if (speed.x < 0 && boxPlayer.x > boxWall.x+boxWall.w-boxWall.w/2-aSpeedX) {
						newSpeed.x = 0;
					}
				}

				if (onCollision) onCollision(player, wall);
			}
		}

		player.move(newSpeed);

		return newSpeed;

	};

	this.vector.moveCollisionAngle = function (player, walls, speed, onCollision, angle) {
		var newSpeed = point();

		angle = math.a2r(OOP.isDef(angle) ? angle : player.angle);
		newSpeed.x = speed * Math.cos(angle);
		newSpeed.y = speed * Math.sin(angle);

		var step = 10, i = 0, len = walls.length, wall;

		for (; i < len; i+= 1) {
			wall = walls[i];

			if (player.getDistanceC(wall.getPositionC()) > (wall.w + wall.h) / 2 + (player.w + player.h) / 2 ) continue;

			var boxWall = wall.getStaticBox();
			if (player.isIntersect(wall)) {
				var boxPlayer = player.getStaticBox();

				var aSpeedX = Math.abs(newSpeed.x);
				var aSpeedY = Math.abs(newSpeed.y);

				if (boxPlayer.x+boxPlayer.w > boxWall.x + step + aSpeedX && boxPlayer.x < boxWall.x + boxWall.w - step - aSpeedX) {
					if (newSpeed.y > 0 && boxPlayer.y+boxPlayer.h < boxWall.y+boxWall.h/2+aSpeedY) {
						newSpeed.y = 0;
					} else if (newSpeed.y < 0 && boxPlayer.y > boxWall.y+boxWall.h-boxWall.h/2-aSpeedY) {
						newSpeed.y = 0;
					}
				}

				if (boxPlayer.y+boxPlayer.h > boxWall.y + step + aSpeedY && boxPlayer.y < boxWall.y + boxWall.h - step - aSpeedY) {
					if (newSpeed.x > 0 && boxPlayer.x+boxPlayer.w < boxWall.x+boxWall.w/2+aSpeedX) {
						newSpeed.x = 0;
					} else if (newSpeed.x < 0 && boxPlayer.x > boxWall.x+boxWall.w-boxWall.w/2-aSpeedX) {
						newSpeed.x = 0;
					}
				}

				if (onCollision) onCollision(player, wall);
			}
		}

		player.move(newSpeed);

		return newSpeed;

	};

// end vector ///////////////////////////////////////
























	// math /////////////////////////////////////////////

	var uids = {};
	var uid = function () {
		var id = new Date().getTime();
		if (uids[id]) {
			id = uid();
		}
		uids[id] = true;
		return id;
	};

	var toInt = function (n) { // number
		return n >> 0;
	};

	var a2r = function (a) {
		return a * (Math.PI / 180);
	};

	var random = function (min, max, z) {
		var rnd = Math.floor(Math.random() * (max - min + 1) + min);
		return (z && rnd == 0) ? random(min, max, z) : rnd;
	};

	var limit = function (n, m) {
		n = Math.abs(n);
		m = Math.abs(m);
		var s = sign(n);
		return n < m ? (n * s) : (m * s);
	};

	var sign = function (a) {
		return a < 0 ? -1 : 1;
	};

	this.math.limit = limit;
	this.math.sign = sign;
	this.math.a2r = a2r;
	this.math.random = random;
	this.math.toInt = toInt;
	this.math.uid = uid;

	this.math.toZiro = function (num, step) {
		if (num == 0) return 0;

		var s = sign(num);
		step = Math.abs(step);
		num = Math.abs(num);

		if (num > 0) {
			num -= step;
			if (num < step) {
				return 0;
			}
		}

		return num*s;
	};

	// end math /////////////////////////////////////////






















	// DOM /////////////////////////////////////////////

	var eventCount = 0;

	var dom = {
		loaded : false,

		events : {
			'onload' : [],         // загрузка DOM
			'preLoop' : [],								// перед Engine
			'postLoop' : [],							// после Engine
			'gameBlur' : [],							// при покидании окна игры, расфокусировке
			'gameFocus' : [],						// при фокусировке
			'gameResize' : []						// при изменении размеров окна
		},

		addEvent : function (evt, key, func) {
			if (evt == 'onload' && dom.loaded) {
				func();
			} else {
				dom.events[evt].push({
					id : key,
					func : func
				});
			}
		},

		delEvent : function (evt, key) {
			forArr(dom.events[evt], function (el, i, arr) {
				if (el.id == key) {
					arr.splice(i, 1);
				}
			});
		},

		runEvent : function (evt) {
			forArr(dom.events[evt], function (el) {
				if (typeof el.func == 'function') {
					el.func();
				}
			});
		},

		attach : function (element) {
			var attach = function () {
				device.document.body.appendChild(element);
			};
			if (dom.loaded) {
				attach();
			} else {
				dom.addEvent('onload', 'attachElement_PointJS' + (eventCount+= 1), attach);
			}
		},

		getWH : function () {
			return {
				w : parseInt(device.document.documentElement.clientWidth  || device.innerWidth  || device.document.body.clientWidth),
				h : parseInt(device.document.documentElement.clientHeight || device.innerHeight || device.document.body.clientHeight)
			};
		}

	};

	this.system.delEvent = function (evt, key) {
		dom.delEvent(evt, key);
	};

	this.system.addEvent = function (evt, key, func) {
		dom.addEvent(evt, key, func);
	};

	this.system.attachDOM = function (element) {
		dom.attach(element);
	};

	this.system.newDOM = function (tag) {
		var element = device.document.createElement(tag);
		element.style.position = 'fixed';
		element.style.left = 0;
		element.style.top = 0;
		element.style.zIndex = canvas.style.zIndex + 1;
		element.style.border = 'none';
		dom.attach(element);
		return element;
	};





	// create canvas
	var canvas = device.document.createElement('canvas');
	canvas.crossOrigin = 'anonymous';
	canvas.width = parseInt(w);
	canvas.height = parseInt(h);
	canvas.style.position = 'fixed';
	canvas.style.left = 0;
	canvas.style.top = 0;
	canvas.style.zIndex = 1000;
	canvas.id = 'PointJS-canvas_0';
	canvas.style.backgroundColor = 'black';


	if (typeof s == 'object') {
		for (var i in s) {
			if (!i.match(/margin|padding|position/))
				canvas.style[i] = s[i];
		}
	}

	dom.addEvent('onload', 'Window_Hide_Scroll', function () {
		device.document.body.style.overflow = 'hidden';
		canvasOffset = {
			x : parseInt(canvas.style.left),
			y : parseInt(canvas.style.top)
		};
	});

	var canvasOffset = point(0, 0);

	var context = null;
	var gl = null;
	var glOn = false;

	context = canvas.getContext('2d');

	if (D == 'GL2D') {
		initWebGL();

		dom.addEvent('postLoop', 'drawGL', function () {
			drawGL();
		});

	} else {
		dom.attach(canvas);
		context.textBaseline = contextSettings.textBaseline;
	}


	var nowFillStyle = 'black';
	var nowStrokeStyle = 'black';
	var setFillColor = function (color) {
		// if (nowFillStyle != color) {
		// nowFillStyle = color;
		context.fillStyle = color;
		// }
	};

	var setStrokeColor = function (color) {
		// if (nowStrokeStyle != color) {
		// nowStrokeStyle = color;
		context.strokeStyle = color;
		// }
	};


	this.system.setStyle = function (s) {
		if (typeof s == 'object') {
			for (var i in s) {
				canvas.style[i] = s[i];
			}
		}
	};

	this.system.getCanvas = function () {
		return canvas;
	};

	this.system.getContext = function () {
		return context;
	};

	this.system.resize = function (w, h) {
		width = w || origWidth;
		height = h || origHeight;
		width2 = width / 2;
		height2 = height / 2;
		canvas.width = width;
		canvas.height = height;

		if (glOn) {
			glCanvas.width = canvas.width;
			glCanvas.height = canvas.height;
			gl.viewport(0,0, width, height);
		}

	};

	this.system.initFullPage = function () {
		dom.addEvent('gameResize', 'PointJS_resizeGame', function () {
			width = dom.getWH().w;
			height = dom.getWH().h;
			width2 = width / 2;
			height2 = height / 2;
			canvas.width = width;
			canvas.height = height;

			if (glOn) {
				glCanvas.width = canvas.width;
				glCanvas.height = canvas.height;
				gl.viewport(0,0, width, height);
			}

			context.textBaseline = contextSettings.textBaseline;
		});
		dom.runEvent('gameResize', 'PointJS_resizeGame');
	};


	var fullScreen = false;
	var launchFullScreen = function () {
		if (fullScreen) return;
		if (this.requestFullscreen) {
			this.requestFullscreen();
			fullScreen = true;
		} else if (this.mozRequestFullScreen) {
			this.mozRequestFullScreen();
			fullScreen = true;
		} else if (this.webkitRequestFullscreen) {
			this.webkitRequestFullscreen();
			fullScreen = true;
		}
		width = dom.getWH().w;
		height = dom.getWH().h;
		width2 = width / 2;
		height2 = height / 2;
		canvas.width = width;
		canvas.height = height;
		if (glOn) {
			glCanvas.width = canvas.width;
			glCanvas.height = canvas.height;
			gl.viewport(0,0, width, height);
		}

	};

	var cancelFullscreen = function () {
		if (device.document.exitFullscreen) {
			device.document.exitFullscreen();
			fullScreen = false;
		} else if (device.document.mozCancelFullScreen) {
			device.document.mozCancelFullScreen();
			fullScreen = false;
		} else if (device.document.webkitExitFullscreen) {
			device.document.webkitExitFullscreen();
			fullScreen = false;
		}
	};

	var onfullscreenchange = function (e) {
		var isFull = device.document.fullscreenElement ||
			device.document.mozFullScreenElement || device.document.webkitFullscreenElement;
		fullScreen = isSet(isFull);
	}

	// Событие об изменениии режима
	device.document.addEventListener("webkitfullscreenchange", onfullscreenchange);
	device.document.addEventListener("mozfullscreenchange", onfullscreenchange);
	device.document.addEventListener("fullscreenchange", onfullscreenchange);

	this.system.initFullScreen = function () {
		if (fullScreen) return;
		device.document.documentElement.onclick = launchFullScreen;
		if (fullScale) return;
		dom.addEvent('gameResize', 'PointJS_initFullScreen', function () {
			width = dom.getWH().w;
			height = dom.getWH().h;
			width2 = width / 2;
			height2 = height / 2;
			canvas.width = width;
			canvas.height = height;
			if (glOn) {
				glCanvas.width = canvas.width;
				glCanvas.height = canvas.height;
				gl.viewport(0,0, width, height);
			}

			context.textBaseline = contextSettings.textBaseline;
		});
		dom.runEvent('gameResize', 'PointJS_initFullScreen');
	};

	this.system.exitFullScreen = function () {
		if (!fullScreen) return;
		dom.delEvent('gameResize', 'PointJS_initFullScreen');
		cancelFullscreen();
		width = origWidth;
		height = origHeight;
		width2 = width / 2;
		height2 = height / 2;
		canvas.width = width;
		canvas.height = height;
		if (glOn) {
			glCanvas.width = canvas.width;
			glCanvas.height = canvas.height;
			gl.viewport(0,0, width, height);
		}
		device.document.documentElement.onclick = function () {};
	};

	this.system.isFullScreen = function () {
		return fullScreen;
	};

	this.system.exitFullPage = function () {
		width = origWidth;
		height = origHeight;
		width2 = width / 2;
		height2 = height / 2;
		canvas.width = width;
		canvas.height = height;
		if (glOn) {
			glCanvas.width = canvas.width;
			glCanvas.height = canvas.height;
			gl.viewport(0,0, width, height);
		}

	};


	var scaleScreen = false;
	var fullScale = false;
	var scaleWidth = origWidth, scaleHeight = origHeight;
	var scaleNoProp = false;
	this.system.initFullScale = function (no_pr) { // no proportional
		if (fullScale) return;

		if (no_pr)
			scaleNoProp = true;

		dom.addEvent('gameResize', 'PointJS_initFullScale', function () {
			var w = scaleWidth,
				h = scaleHeight;

			var screen = dom.getWH();

			if (!scaleNoProp) {
				if (screen.w < screen.h) {
					var dh = screen.w / width;
					w = screen.w;
					h = height * dh;
				} else if (screen.h < screen.w) {
					var dw = screen.h / height;
					h = screen.h;
					w = width * dw;
				}
			} else {
				w = screen.w;
				h = screen.h;
			}

			scaleWidth = w;
			scaleHeight = h;

			scaleScreen = {
				w : w / width,
				h : h / height
			};

			canvas.style.width = w + 'px';
			canvas.style.height = h + 'px';
			if (glOn) {
				glCanvas.style.width = canvas.style.width;
				glCanvas.style.height = canvas.style.height;
				gl.viewport(0,0, width, height);
			}
		});
		dom.runEvent('gameResize', 'PointJS_initFullScale');
		fullScale = true;
	};

	this.system.exitFullScale = function () {
		if (!fullScale) return;
		fullScale = false;
		dom.delEvent('gameResize', 'PointJS_initFullScale');
		canvas.style.width = origWidth + 'px';
		canvas.style.height = origHeight + 'px';
		if (glOn) {
			glCanvas.style.width = canvas.style.width;
			glCanvas.style.height = canvas.style.height;
			gl.viewport(0,0, width, height);
		}
	};

	this.system.getWH = function () {
		return dom.getWH();
	};

	// end DOM //////////////////////////////////////////




















	// GUI //////////////////////////////////////////////



	// end GUI //////////////////////////////////////////














	// actionControl ////////////////////////////////////

	var touchInited = false;
	this.actionControl.initActionControl = function () {

		if (_PointJS.touchControl.isTouchSupported()) {
			touchInited = true;
			_PointJS.touchControl.initTouchControl();
		}

		_PointJS.mouseControl.initMouseControl();

		return this;
	};

	this.actionControl.isPress = function () {
		if (touchInited) return _PointJS.touchControl.isPress();
		return _PointJS.mouseControl.isPress('LEFT');
	};

	this.actionControl.isDown = function () {
		if (touchInited) return _PointJS.touchControl.isDown();
		return _PointJS.mouseControl.isDown('LEFT');
	};

	this.actionControl.isUp = function () {
		if (touchInited) return _PointJS.touchControl.isUp();
		return _PointJS.mouseControl.isUp('LEFT');
	};

	this.actionControl.isInObject = function (obj) {
		if (touchInited) return _PointJS.touchControl.isInObject(obj);
		return _PointJS.mouseControl.isInObject(obj);
	};

	this.actionControl.isInStatic = function (obj) {
		if (touchInited) return _PointJS.touchControl.isInStatic(obj);
		return _PointJS.mouseControl.isInStatic(obj);
	};

	this.actionControl.isInDynamic = function (obj) {
		if (touchInited) return _PointJS.touchControl.isInDynamic(obj);
		return _PointJS.mouseControl.isInDynamic(obj);
	};

	this.actionControl.isPeekObject = function (obj) {
		if (touchInited) return _PointJS.touchControl.isPeekObject(obj);
		return _PointJS.mouseControl.isPeekObject('LEFT', obj);
	};

	this.actionControl.isPeekStatic = function (obj) {
		if (touchInited) return _PointJS.touchControl.isPeekStatic(obj);
		return _PointJS.mouseControl.isPeekStatic('LEFT', obj);
	};

	this.actionControl.isPeekDynamic = function (obj) {
		if (touchInited) return _PointJS.touchControl.isPeekDynamic(obj);
		return _PointJS.mouseControl.isPeekDynamic('LEFT', obj);
	};

	this.actionControl.getPosition = function (obj) {
		if (touchInited) return _PointJS.touchControl.getPosition();
		return _PointJS.mouseControl.getPosition();
	};

	this.actionControl.getPositionS = function (obj) {
		if (touchInited) return _PointJS.touchControl.getPositionS();
		return _PointJS.mouseControl.getPositionS();
	};

	this.actionControl.getMouse = function () {
		return _PointJS.mouseControl;
	};

	this.actionControl.getTouch = function () {
		if (touchInited)
			return _PointJS.touchControl;
		else
			return false;
	};

	this.actionControl.getActiveControl = function () {
		return touchInited ? _PointJS.touchControl : _PointJS.mouseControl;
	};

	this.actionControl.getActiveControlName = function () {
		return touchInited ? 'touchControl' : 'mouseControl';
	};

	this.actionControl.getSpeed = function () {
		if (touchInited) return ;
		return _PointJS.mouseControl.getSpeed() || _PointJS.touchControl.getSpeed();
	};

	// end actionControl ////////////////////////////////






















	// keyControl /////////////////////////////////////

	var initedKey = false;

	var keyList = {
		'LEFT' : 37,
		'RIGHT' : 39,
		'UP' : 38,
		'DOWN' : 40,
		'SPACE' : 32,
		'CTRL' : 17,
		'SHIFT' : 16,
		'ALT' : 18,
		'ESC' : 27,
		'ENTER' : 13,
		'MINUS' : 189,
		'PLUS' : 187,
		'CAPS_LOCK' : 20,
		'BACKSPACE' : 8,
		'TAB' : 9,
		'Q' : 81,
		'W' : 87,
		'E' : 69,
		'R' : 82,
		'T' : 84,
		'Y' : 89,
		'U' : 85,
		'I' : 73,
		'O' : 79,
		'P' : 80,
		'A' : 65,
		'S' : 83,
		'D' : 68,
		'F' : 70,
		'G' : 71,
		'H' : 72,
		'J' : 74,
		'K' : 75,
		'L' : 76,
		'Z' : 90,
		'X' : 88,
		'V' : 86,
		'B' : 66,
		'N' : 78,
		'M' : 77,
		'0' : 48,
		'1' : 49,
		'2' : 50,
		'3' : 51,
		'4' : 52,
		'5' : 53,
		'6' : 54,
		'7' : 55,
		'8' : 56,
		'C' : 67,
		'9' : 57,
		/*			'NUM_0'     : 45,
		 'NUM_1'     : 35,
		 'NUM_2'     : 40,
		 'NUM_3'     : 34,
		 'NUM_4'     : 37,
		 'NUM_5'     : 12,
		 'NUM_6'     : 39,
		 'NUM_7'     : 36,
		 'NUM_8'     : 38,
		 'NUM_9'     : 33,
		 'NUM_MINUS' : 109,
		 'NUM_PLUS'  : 107,
		 'NUM_LOCK'  : 144,*/
		'F1' : 112,
		'F2' : 113,
		'F3' : 114,
		'F4' : 115,
		'F5' : 116,
		'F6' : 117,
		'F7' : 118,
		'F8' : 119,
		'F9' : 120,
		'F10' : 121,
		'F11' : 122,
		'F12' : 123
	};

	var codeList = {
		'37' : 'LEFT',
		'39' : 'RIGHT',
		'38' : 'UP',
		'40' : 'DOWN',
		'32' : 'SPACE',
		'17' : 'CTRL',
		'16' : 'SHIFT',
		'18' : 'ALT',
		'27' : 'ESC',
		'13' : 'ENTER',
		'189' : 'MINUS',
		'187' : 'PLUS',
		'20' : 'CAPS_LOCK',
		'8' : 'BACKSPACE',
		'9' : 'TAB',
		'81' : 'Q',
		'87' : 'W',
		'69' : 'E',
		'82' : 'R',
		'84' : 'T',
		'89' : 'Y',
		'85' : 'U',
		'73' : 'I',
		'79' : 'O',
		'80' : 'P',
		'65' : 'A',
		'83' : 'S',
		'68' : 'D',
		'70' : 'F',
		'71' : 'G',
		'72' : 'H',
		'74' : 'J',
		'75' : 'K',
		'76' : 'L',
		'90' : 'Z',
		'88' : 'X',
		'86' : 'V',
		'66' : 'B',
		'78' : 'N',
		'77' : 'M',
		'48' : '0',
		'49' : '1',
		'50' : '2',
		'51' : '3',
		'52' : '4',
		'53' : '5',
		'54' : '6',
		'55' : '7',
		'56' : '8',
		'67' : 'C',
		'57' : '9',
		/*			'45'  : 'NUM_0',
		 '35'  : 'NUM_1',
		 '40'  : 'NUM_2',
		 '34'  : 'NUM_3',
		 '37' :   'NUM_4',
		 '12'  : 'NUM_5',
		 '39'  : 'NUM_6',
		 '36'  : 'NUM_7',
		 '38'  : 'NUM_8',
		 '33'  : 'NUM_9',
		 '109' : 'NUM_MINUS',
		 '107' : 'NUM_PLUS',
		 '144' : 'NUM_LOCK',*/
		'112' : 'F1',
		'113' : 'F2',
		'114' : 'F3',
		'115' : 'F4',
		'116' : 'F5',
		'117' : 'F6',
		'118' : 'F7',
		'119' : 'F8',
		'120' : 'F9',
		'121' : 'F10',
		'122' : 'F11',
		'123' : 'F12'
	};

	var stopInputKeys = {
		'8' : true,
		'9' : true,
		'13' : true,
		'18' : true,
		'16' : true,
		'17' : true,
		'27' : true,
		'112' : true,
		'113' : true,
		'114' : true,
		'115' : true,
		'116' : true,
		'117' : true,
		'118' : true,
		'119' : true,
		'120' : true,
		'121' : true,
		'122' : true,
		'123' : true
	};

	this.keyControl.getKeyList = function () {
		var i, t = [];
		for (i in keyList) {
			t.push(i);
		}
		return t;
	};

	var arrKeyDown = {},
		arrKeyUp = {},
		arrKeyPress = {},
		inputPressChar = false,
		inputPressKey = false,
		inputMode = false;

	var setKeyDown = function (keyCode) {
		arrKeyDown[keyCode] = true;
	};

	var stopKeyPress = function (keyCode) {
		forEach(arrKeyPress, function (el, i, arr) {
			if (el == 1) arr[i] = 2;
		});
	};

	var clearKeyDown = function (keyCode) {
		arrKeyDown[keyCode] = false;
	};

	var clearAllKey = function () {
		arrKeyUp = {};
	};

	var clearAllKeys = function () {
		arrKeyDown = {};
		arrKeyUp = {};
		arrKeyPress = {};
		inputPressChar = false;
		inputPressKey = false;
	};

	this.keyControl.isDown = function (keyName) {
		return arrKeyDown[keyList[keyName]] == true;
	};

	this.keyControl.isUp = function (keyName) {
		return arrKeyUp[keyList[keyName]] == true;
	};

	this.keyControl.isPress = function (keyName) {
		return arrKeyPress[keyList[keyName]] == 1;
	};

	this.keyControl.getInputChar = function () {
		return inputPressChar;
	};

	this.keyControl.getInputKey = function () {
		return codeList[inputPressKey];
	};

	this.keyControl.setInputMode = function (bool) {
		inputMode = bool;
	};

	this.keyControl.isInputMode = function () {
		return inputMode;
	};

	this.keyControl.exitKeyControl = function () {
		device.onkeydown = function () {}
		device.onkeypress = function () {};
		device.onkeyup = function () {};

		dom.delEvent('postLoop', 'PointJS_clearAllKeyUp');
		arrKeyDown = {};
		arrKeyUp = {};
		arrKeyPress = {};
		inputPressChar = false;
		inputPressKey = false;
		inputMode = false;

		initedKey = false;

	};

	this.keyControl.initControl = this.keyControl.initKeyControl = function () {

		if (initedKey) return this;

		initedKey = true;

		device.onkeydown = function (e) {
			if (inputMode) {
				inputPressKey = e.keyCode;
				if (stopInputKeys[e.keyCode]) {
					e.preventDefault();
					return false;
				}
				return true;
			}
			e.preventDefault();
			if (arrKeyPress[e.keyCode] != 2) arrKeyPress[e.keyCode] = 1;
			setKeyDown(e.keyCode);
			return false;
		};

		device.onkeypress = function (e) {
			var char = false;
			if (e.which != 0 && e.charCode != 0)
				if (e.which >= 32) {
					char = String.fromCharCode(e.which);
				}
			inputPressChar = char;
		};

		device.onkeyup = function (e) {
			e.preventDefault();
			if (arrKeyDown[e.keyCode] == true) {
				arrKeyUp[e.keyCode] = true;
			}
			clearKeyDown(e.keyCode);
			delete arrKeyPress[e.keyCode];
			return false;
		};

		dom.addEvent('postLoop', 'PointJS_clearAllKeyUp', function () {
			clearAllKey();
			stopKeyPress();
			inputPressChar = false;
			inputPressKey = false;
		});

		return this;

	};

	// end keyControl /////////////////////////////////























	// mouseControl ///////////////////////////////////

	var initedMouse = false;

	var mouse = {
		pos : point(0, 0),
		prevPos : point(0, 0),
		oldPos : point(0, 0),
		visible : true,
		image : '',
		locked : false,
		speed : point(0, 0),
		moving : false
	};

	var mouseList = {
		'LEFT' : 1,
		'RIGHT' : 3,
		'MIDDLE' : 2
	};

	var mouseDown = {},
		mouseUp = {},
		mousePress = {},
		mouseWheel = 0;

	var clearMouseAction = function () {
		mouseDown = {};
		mouseUp = {};
		mousePress = {};
		mouseWheel = 0;
		mouse.moving = false;
	};

	var stopMousePress = function () {
		forEach(mousePress, function (el, i, arr) {
			if (el == 1)
				arr[i] = 2;
		});
	};

	var getMousePosition = function (abs) {
		var dx = 0,
			dy = 0;
		if (abs) {
			dx = offset.x;
			dy = offset.y;
		}
		return point(dx + mouse.pos.x, dy + mouse.pos.y);
	};

	this.mouseControl.getPosition = function () {
		return getMousePosition(1);
	};

	this.mouseControl.getPositionS = function () {
		return getMousePosition();
	};

	var setMouseImage = function (img) {
		img = 'url(\'' + img + '\'), auto';
		if (mouse.image == img) return;
		mouse.image = img;
		device.document.body.style.cursor = mouse.image;
	};

	this.mouseControl.setCursorImage = setMouseImage;

	this.mouseControl.setVisible = function (bool) {
		if ((!mouse.visible && !bool) || mouse.visible && bool) return;
		mouse.visible = bool == true;
		device.document.body.style.cursor = mouse.visible ? mouse.image : 'none';
	};

	this.mouseControl.isVisible = function () {
		return mouse.visible;
	};

	this.mouseControl.isDown = function (key) {
		return mouseDown[mouseList[key]];
	};

	this.mouseControl.isUp = function (key) {
		return mouseUp[mouseList[key]];
	};

	this.mouseControl.isPress = function (key) {
		return mousePress[mouseList[key]] == 1;
	};

	this.mouseControl.isMove = function () {
		return mouse.moving;
	};

	this.mouseControl.isInStatic = function (box) {
		var pos = getMousePosition(1);
		return (pos.x >= box.x && pos.x <= box.x + box.w && pos.y >= box.y && pos.y <= box.y + box.h);
	};

	this.mouseControl.isInDynamic = function (box) {
		return isPointIn(getMousePosition(1), box);
	};

	this.mouseControl.isInObject = function (obj) {
		if (!obj.visible) return false;
		if (!obj.angle) {
			return this.isInStatic(obj.getStaticBox());
		} else {
			return this.isInDynamic(obj.getDynamicBox());
		}
	};

	this.mouseControl.isWheel = function (key) {
		return (key == 'UP' && mouseWheel > 0) || (key == 'DOWN' && mouseWheel < 0)
	};

	var onMouseWheel = function (e) {
		e.preventDefault();
		mouseWheel = ((e.wheelDelta) ? e.wheelDelta : -e.detail);
		return false;
	};

	var clearAllMouseUp = function () {
		mouseUp = {};
	};

	var requestMouseLock = false;

	var onMouseLock = function () {
		if (!requestMouseLock) return;
		if (isDef(device.document.pointerLockElement) || isDef(device.document.mozPointerLockElement)) {
			mouse.locked = true;
		} else {
			mouse.locked = false;
		}
	};

	this.mouseControl.initMouseLock = function () {
		dom.addEvent('onload', 'initPointerLock', function () {
			requestMouseLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || false;
			device.document.exitPointerLock = device.document.exitPointerLock || device.document.mozExitPointerLock || false;

			if ('onpointerlockchange' in device.document) {
				device.document.addEventListener('pointerlockchange', onMouseLock, false);
			} else if ('onmozpointerlockchange' in device.document) {
				device.document.addEventListener('mozpointerlockchange', onMouseLock, false);
			}

			if (!requestMouseLock) return log('error in initMouseLock : not supported');
			if (mouse.locked) return;
			canvas.onclick = requestMouseLock;

		});
	};

	this.mouseControl.exitMouseLock = function () {
		device.document.exitPointerLock();
		canvas.onclick = function () {
		};
		mouse.speed = point(0, 0);
	};

	this.mouseControl.unlockMouse = function () {
		mouse.speed = point(0, 0);
		device.document.exitPointerLock();
	};

	this.mouseControl.isMouseLock = function () {
		return mouse.locked;
	};

	this.mouseControl.getSpeed = function () {
		return point(mouse.speed.x, mouse.speed.y);
	};

	this.mouseControl.isPeekStatic = function (key, box) {
		if (!this.isPress(key)) return false;
		return (this.isInStatic(box));
	};

	this.mouseControl.isPeekDynamic = function (key, box) {
		if (!this.isPress(key)) return false;
		return (this.isInDynamic(box));
	};

	this.mouseControl.isPeekObject = function (key, obj) {
		if (!this.isPress(key) || !obj.visible) return false;
		return this.isInDynamic(obj.getDynamicBox());
	};

	this.mouseControl.initControl = this.mouseControl.initMouseControl = function () {
		if (initedMouse) return this;

		initedMouse = true;

		device.onmousemove = function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (mouse.locked) {
				var movementX = e.movementX || e.mozMovementX || 0;
				var movementY = e.movementY || e.mozMovementY || 0;
				mouse.pos.x += movementX;
				mouse.pos.y += movementY;
				return false;
			} else {
				mouse.pos.x = e.pageX - canvasOffset.x;
				mouse.pos.y = e.pageY - canvasOffset.y;
				if (scaleScreen) {
					mouse.pos.x /=  scaleScreen.w;
					mouse.pos.y /= scaleScreen.h;
				}
			}

			mouse.speed.x = mouse.pos.x - mouse.prevPos.x;
			mouse.speed.y = mouse.pos.y - mouse.prevPos.y;
			mouse.prevPos.x = mouse.pos.x;
			mouse.prevPos.y = mouse.pos.y;

			mouse.moving = true;
			return false;
		};

		device.onmousedown = function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (!e.which && e.button) {
				if (e.button & 1) e.which = 1;
				else if (e.button & 4) e.which = 2;
				else if (e.button & 2) e.which = 3;
			}

			mouseDown[e.which] = true;
			mousePress[e.which] = 1;
		};

		device.onmouseup = function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (!e.which && e.button) {
				if (e.button & 1) e.which = 1;
				else if (e.button & 4) e.which = 2;
				else if (e.button & 2) e.which = 3;
			}

			mouseDown[e.which] = false;
			mouseUp[e.which] = true;
			delete mousePress[e.which];

		};

		device.oncontextmenu = device.onselectstart = device.ondragstart = function () {
			return false;
		};

		device.onmousewheel = onMouseWheel;
		device.addEventListener("DOMMouseScroll", onMouseWheel, false);

		dom.addEvent('postLoop', 'PointJS_clearAllMouseUp', function () {
			clearAllMouseUp();
			stopMousePress();
			mouseWheel = 0;
			mouse.moving = false;
			mouse.speed = point(0, 0);
		});

		return this;

	};

	this.mouseControl.exitMouseControl = function () {
		device.onmousemove =
			device.onmousedown =
				device.onmouseup =
					device.oncontextmenu =
						device.onselectstart =
							device.ondragstart =
								device.onmousewheel = function () {
								};
		dom.delEvent('postLoop', 'PointJS_clearAllMouseUp');
		clearMouseAction();
		initedMouse = false;
	};

	// end mouseControl ///////////////////////////////



















	// touchControl ///////////////////////////////////
	var initedTouch = false;
	var touch = {
		down : false,
		press : 0,
		up : 0,
		x : 0,
		y : 0,
		fix : point(0, 0),
		contacts : [],
		speed : point(0, 0),
		prevPos : point(0, 0)
	};

	this.touchControl.isTouchSupported = function () {
		return !!('ontouchstart' in window);
	};

	this.touchControl.isMobileDevice = function () {
		return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(device.navigator.userAgent));
	};

	var touchStopPress = function () {
		touch.press = 0;
		touch.up = 0;
	};

	var clearTouchAction = function () {
		touch.down = false;
		touch.press = 0;
		touch.up = 0;
		touch.fix = point(0, 0);
		touch.contacts = [];
		touch.x = 0;
		touch.y = 0;
	};

	this.touchControl.getFixPositionS = function () {
		if (!touch.fix.x && !touch.fix.y) return false;
		return point(touch.fix.x, touch.fix.y);
	};

	this.touchControl.getFixPosition = function () {
		if (!touch.fix.x && !touch.fix.y) return false;
		return point(touch.fix.x + offset.x, touch.fix.y + offset.y);
	};

	this.touchControl.getRun = function () {
		var x = 0, y = 0;
		if (touch.fix.x && touch.fix.x != touch.x) {
			x = touch.x - touch.fix.x;
		}
		if (touch.fix.y && touch.fix.y != touch.y) {
			y = touch.y - touch.fix.y;
		}

		return point(x, y);
	};

	this.touchControl.getVector = function () {
		var x = 0, y = 0;
		if (touch.fix.x && touch.fix.x != touch.x) {
			x = touch.x > touch.fix.x ? 1 : -1;
		}
		if (touch.fix.y && touch.fix.y != touch.y) {
			y = touch.y > touch.fix.y ? 1 : -1;
		}

		return point(x, y);
	};

	this.touchControl.getSpeed = function () {
		return point(touch.speed.x, touch.speed.y);
	};

	this.touchControl.isDown = function () {
		return touch.down;
	};

	this.touchControl.isPress = function () {
		return touch.press == 1;
	};

	this.touchControl.isUp = function () {
		return touch.up == 1;
	};

	this.touchControl.getPosition = function () {
		return point(touch.x + offset.x, touch.y + offset.y);
	};

	this.touchControl.getPositionS = function () {
		return point(touch.x, touch.y);
	};

	this.touchControl.isPeekStatic = function (box) { // staticBox
		if (!this.isPress()) return false;
		return (this.isInStatic(box));
	};

	this.touchControl.isPeekDynamic = function (box) { // dynamicBox
		if (!this.isPress()) return false;
		return (this.isInDynamic(box));
	};

	this.touchControl.isPeekObject = function (obj) {
		if (!this.isPress() || !obj.visible) return false;
		return this.isInDynamic(obj.getDynamicBox());
	};

	this.touchControl.isInStatic = function (box) {
		var pos = this.getPosition();
		return (pos.x >= box.x && pos.x <= box.x + box.w && pos.y >= box.y && pos.y <= box.y + box.h);
	};

	this.touchControl.isInDynamic = function (box) {
		return isPointIn(this.getPosition(), box);
	};

	this.touchControl.isInObject = function (obj) {
		if (!obj.visible) return false;
		if (!obj.angle) {
			return this.isInStatic(obj.getStaticBox());
		} else {
			return this.isInDynamic(obj.getDynamicBox());
		}
	};


	this.touchControl.getTouches = function () {
		return touch.contacts;
	};


	this.touchControl.initControl = this.touchControl.initTouchControl = function () {
		if (initedTouch) return this;

		initedTouch = true;

		device.addEventListener('touchstart', function (e) {
			e.preventDefault();
			touch.x = e.targetTouches[0].pageX;
			touch.y = e.targetTouches[0].pageY;
			touch.contacts = e.targetTouches;

			if (scaleScreen) {
				touch.x /=  scaleScreen.w;
				touch.y /= scaleScreen.h;
			}

			touch.fix.x = touch.x;
			touch.fix.y = touch.y;
			touch.down = true;
			touch.press = 1;
			return false;
		}, {passive : false});

		device.addEventListener('touchmove', function (e) {
			touch.x = e.targetTouches[0].pageX;
			touch.y = e.targetTouches[0].pageY;
			touch.contacts = e.targetTouches;

			if (scaleScreen) {
				touch.x /=  scaleScreen.w;
				touch.y /= scaleScreen.h;
			}

			touch.speed.x = touch.x - touch.prevPos.x;
			touch.speed.y = touch.y - touch.prevPos.y;
			return false;
		}, false);

		device.addEventListener('touchend', function (e) {
			touch.fix.x = 0;
			touch.fix.y = 0;
			touch.down = false;
			touch.up = 1;
			return false;
		}, false);

		_PointJS.touchControl.vibrate = function (t) { // t - time mls
			if (device.navigator.vibrate)             return device.navigator.vibrate(t);
			if (device.navigator.oVibrate)           return device.navigator.oVibrate(t);
			if (device.navigator.mozVibrate)       return device.navigator.mozVibrate(t);
			if (device.navigator.webkitVibrate) return device.navigator.webkitVibrate(t);
		};

		dom.addEvent('postLoop', 'PointJS_touchStopPress', function () {
			touchStopPress();
			touch.prevPos.x = touch.x;
			touch.prevPos.y = touch.y;
			touch.speed = point(0, 0);
		});

		return this;

	};


	this.touchControl.exitTouchControl = function () {
		device.ontouchstart =
			device.ontouchmove =
				device.ontouchend = function (e) {
				};
		dom.delEvent('postLoop', 'PointJS_touchStopPress');
		clearTouchAction();
		initedTouch = false;
	};

	// end touchControl ///////////////////////////////


















	// colors ///////////////////////////////////////////

	var color = function (r, g, b, a) {
		// if (webgl) return {
		// 	r : r / 255,
		// 	g : g / 255,
		// 	b : b / 255,
		// 	a : isDef(a) ? a : 1.0,
		// };
		return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (a ? a : 1) + ')';
	};

	var hex2rgb = function (hex, a) {
		hex = hex[0] == '#' ? hex.substr(1, 6) : hex;
		var r = parseInt(hex.substr(0, 2), 16);
		var g = parseInt(hex.substr(2, 2), 16);
		var b = parseInt(hex.substr(4, 2), 16);
		return color(r, g, b, a);
	};

	this.colors.rgb = function (r, g, b) {
		return color(r, g, b, 1);
	};
	this.colors.rgba = function (r, g, b, a) {
		return color(r, g, b, a);
	};
	this.colors.hex2rgb = function (hex) {
		return hex2rgb(hex, 1);
	};
	this.colors.hex2rgba = function (hex, a) {
		return hex2rgb(hex, a);
	};
	this.colors.randomColor = function (min, max, a) {
		return color(random(min, max), random(min, max), random(min, max), a || 1);
	};


	// end colors ///////////////////////////////////////















	// OOP ///////////////////////////////////////////////

	var isDef = function (val) {
		if (typeof val == 'undefined' || val == null) return false;
		return true;
	};

	var isSet = function (val) {
		if (!isDef(val) || val === '' || val === 0) return false;
		return true;
	};

	var toString = function (obj, flag) {
		var i, j = 0, val, str = '[';
		for (i in obj) {
			if (!obj.hasOwnProperty(i)) continue;
			val = obj[i];
			if (typeof val == 'number' && flag) {
				val = parseInt(val);
			}
			str += (j > 0 ? ', ' : '') + i + ' : ' + val;
			j+= 1;
		}
		return str + ']';
	};

	var toJSON = function (obj, flag) {
		return JSON.stringify(obj);
	};

	var forEach = function (arr, func) {
		var i, res;
		for (i in arr) {
			if (typeof arr[i] == 'undefined') continue;
			res = func(arr[i], i, arr);
			if (res) {
				if (res == 'break') break;
			}
		}
	};

	var forArr = function (arr, func) { // only Array!
		if (!arr.length) return;
		var i, len, res;
		for (i = 0, len = arr.length; i < len; i+= 1) {
			if (typeof arr[i] == 'undefined') continue;
			res = func(arr[i], i, arr, i > 0 ? arr[i-1] : arr[arr.length-1]) || false;
			if (res) {
				if (res == 'break') break;
			}
		}
	};

	var forInt = function (i, func) {
		var _i, res;
		for (_i = 0; _i < i; _i+= 1) {
			res = func(_i);
			if (res) {
				if (res == 'break') break;
			}
		}
	};

	var forXY = function (i, j, func) {
		var _i, _j, res;
		for (_j = 0; _j < j; _j+= 1)
			for (_i = 0; _i < i; _i+= 1) {
				res = func(_i, _j);
				if (res) {
					if (res == 'break') break;
				}
			}
	};

	var randArrElement = function (arr) {
		return arr[random(0, arr.length - 1)];
	};

	var readJSONSync = function (f) { // file
		var JSONObject = {};
		var getter = new XMLHttpRequest();

		getter.open('GET', f, false);
		getter.send();

		JSONObject = getter.responseText;
		JSONObject = JSON.parse(JSONObject);

		return JSONObject;
	};

	var readJSON = function (f, func) { // file, callback
		var JSONObject = {};
		var getter = new XMLHttpRequest();
		getter.open('GET', f, true);
		resources.add();

		getter.onreadystatechange = function () {
			if (getter.readyState == 4) {
				JSONObject = getter.responseText;
				JSONObject = JSON.parse(JSONObject);
				resources.load();
				func(JSONObject);
			}
		};

		getter.send();
	};

	this.OOP.insertArrElement = function (arr, i) {
		var el = arr[i];
		arr.splice(i, 1);
		return el;
	};

	this.OOP.insertRandArrElement = function (arr) {
		var i = random(0, arr.length - 1);
		var el = arr[i];
		arr.splice(i, 1);
		return el;
	};

	this.OOP.drawEach = function (arr, func) {
		forEach(arr, function (el) {
			if (!el || !el.draw) return;

			if (el.isInCamera()) {
				el.draw();
				if (func) func(el);
			}

		});
	};

	this.OOP.drawArr = function (arr, func) {
		var i, len, res;
		for (i = 0, len = arr.length; i < len; i+= 1) {
			if (!arr[i] || !arr[i].draw) continue;
			if (arr[i].isInCamera()) {
				arr[i].draw();
				if (func) func(arr[i], i);
			}
		}
	};

	var sendGET = function (f, p, func) { // file, params, callback
		var JSONObject = {};
		var getter = new XMLHttpRequest();

		var href = '?';

		forEach(p, function(el, key) {
			href+= (key + '=' + encodeURIComponent(el)) + '&';
		});

		getter.open('GET', f + href, true);

		getter.onreadystatechange = function () {
			if (getter.readyState == 4) {
				func(getter.responseText);
			}
		};

		getter.send();
	};

	var sendGETSync = function (f, p) { // file, params
		var JSONObject = {};
		var getter = new XMLHttpRequest();

		var href = '?';

		forEach(p, function(el, key) {
			href+= (key + '=' + encodeURIComponent(el)) + '&';
		});

		getter.open('GET', f + href, false);
		getter.send();

		return getter.responseText;
	};

	var sendPOSTSync = function (f, p) { // file, params
		var JSONObject = {};
		var getter = new XMLHttpRequest();

		var href = '';

		forEach(p, function(el, key) {
			href+= (key + '=' + encodeURIComponent(el)) + '&';
		});

		getter.open('POST', f, false);
		getter.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		getter.send(href);

		return getter.responseText;
	};

	var sendPOST = function (f, p, func) { // file, params, callback
		var JSONObject = {};
		var getter = new XMLHttpRequest();

		var href = '';

		forEach(p, function(el, key) {
			href+= (key + '=' + encodeURIComponent(el)) + '&';
		});

		getter.open('POST', f, true);
		getter.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		getter.onreadystatechange = function () {
			if (getter.readyState == 4) {
				func(getter.responseText);
			}
		};

		getter.send(href);
	};

	var sendPOSTScreen = function (f, name, func) { // file, params, callback
		var JSONObject = {};
		var getter = new XMLHttpRequest();

		var href = name + '=' + canvas.toDataURL('image/png');

		getter.open('POST', f, true);
		getter.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		getter.onreadystatechange = function () {
			if (getter.readyState == 4) {
				func(getter.responseText);
			}
		};

		getter.send(href);
	};


	var clearArr = function (arr) {
		arr.length = 0;
	};

	var fillArr = function (arr, i, func) {
		arr.length = 0;
		var _i;
		for (_i = 0; _i < i; _i+= 1) {
			arr.push(func(_i, _i > 0 ? arr[_i-1] : false));
		}

		return arr;
	};

	var delObject = function (arr, obj) {
		var i, len;
		for (i = 0, len = arr.length; i < len; i+= 1) {
			if (arr[i].id == obj.id) {
				arr.splice(i, 1);
				return true;
			}
		}
	};

	var Listener = function (link, func) {
		var link = link;
		var func = func;
		var active = false;
		var session_id = uid();
		var interval = false;

		var getter = new XMLHttpRequest();

		var update = function () {
			getter.open('GET', link, true);
			getter.send();
		};

		getter.onreadystatechange = function () {
			if (getter.readyState == 4) {
				func(getter.responseText);
				if (active) {
					if (!interval) {
						update();
					} else {
						setTimeout(update, interval);
					}
				}
			}
		};

		this.start = function () {
			if (link.match(/\?/)) {
				link += '&session_id='+session_id;
			} else {
				link += '?session_id='+session_id;
			}

			update();
			active = true;
		};

		this.setSID = function (sid) {
			session_id = sid;
		};

		this.setTime = function (i) {
			interval = i;
		};

		this.stop = function () {
			active = false;
		};

		this.isActive = function () {
			return active;
		};
	};

	this.OOP.readJSON = readJSON;
	this.OOP.toString = toString;
	this.OOP.sendGET = sendGET;
	this.OOP.sendPOST = sendPOST;
	this.OOP.sendPOSTScreen = sendPOSTScreen;
	this.OOP.isDef = isDef;
	this.OOP.isSet = isSet;
	this.OOP.forEach = forEach;
	this.OOP.forInt = forInt;
	this.OOP.forXY = forXY;
	this.OOP.forArr = forArr;
	this.OOP.clearArr = clearArr;
	this.OOP.fillArr = fillArr;
	this.OOP.delObject = delObject;

	this.OOP.randArrElement = randArrElement;
	this.OOP.readJSONSync = readJSONSync;
	this.OOP.sendGETSync = sendGETSync;
	this.OOP.sendPOSTSync = sendPOSTSync;

	this.OOP.newAJAXListener = function (link, func) {
		return new Listener(link, func);
	};

	this.OOP.runCode = function (code) {
		var func = new Function('', code);
		func();
	};

	var includes = {};

	this.OOP.includeSync = function (file, once) {
		if (!includes[file]) {

			includes[file] = {
				loaded : false,
				code : function () { console.log(file + ' is loading'); }
			};

			var getter = new XMLHttpRequest();

			getter.open('GET', file, false);
			getter.send();

			var code = getter.responseText;

			includes[file].code = new Function ('', code);
			includes[file].loaded = true;
			includes[file].code();
		} else {
			if (includes[file].loaded && !once)
				includes[file].code();
		}
	};


	this.OOP.include = function (file, func, once) {
		if (!includes[file]) {

			includes[file] = {
				loaded : false,
				code : function () { console.log(file + ' is loading'); }
			};

			var getter = new XMLHttpRequest();
			getter.open('GET', file, true);

			getter.onreadystatechange = function () {
				if (getter.readyState == 4) {
					var code = getter.responseText;
					includes[file].code = new Function ('', code);
					includes[file].loaded = true;
					includes[file].code();

					if (func) func();
				}
			};

			getter.send();
		} else {
			if (includes[file].loaded && !once)
				includes[file].code();

			if (func) func();
		}
	};


	this.OOP.clone = function (orig, func) {
		var cl = newObjectFromType(orig);

		forEach(orig, function (val, key) {
			if (['id', 'type'].indexOf(key) !== -1) return;
			cl[key] = val;
		});

		if (func) {
			cl.onClone = func;
			cl.onClone(cl);
			delete cl.onClone;
		}

		return cl;
	};






	// end OOP ///////////////////////////////////////////












	// game engine //////////////////////////////////////

	var fps = 60,
		time = Date.now(),
		dt = 0,
		startTime = -1,
		endTime = time,
		loops = {};

	var setFPS = function (newFps) {
		fps = newFps;
	};

	this.game.setFPS = function (newFps) {
		setFPS(newFps > 0 ? newFps : 60);
	};

	this.game.getFPS = function () {
		return fps;
	};

	this.game.getDT = function (delta) {
		if (!delta) delta = 1000;
		return dt / delta;
	};

	this.game.getTime = function () {
		return time;
	};

	var getRequestAnimationFrame = function () {
		return device.requestAnimationFrame  ||
			device.webkitRequestAnimationFrame ||
			device.mozRequestAnimationFrame    ||
			device.oRequestAnimationFrame      ||
			device.msRequestAnimationFrame     ||
			function (callback) {
				device.setTimeout(callback, 1000 / fps);
			};
	};

	var next = getRequestAnimationFrame();

	var preEngine = function () {
		time = Date.now();
		if (isAutoClear) {
			clearContext(point(0, 0), point(width, height));
		}
		dom.runEvent('preLoop');
	};

	var postEngine = function () {
		dom.runEvent('postLoop');
		if (startTime != -1) {
			dt = time - startTime;
		}
		startTime = time;
	};

	var engine = {
		func : function () {
			console.log('please, use a "setLoop" function.');
			next = function () {/* stop engine */
			};
		},
		start : false,
		end : false,
		audio : false,
		fps : false,
		name : 'NotLoop'
	};

	var stopLoopAudio = function () {
		if (!engine.audio) return;
		var i;
		forArr(engine.audio, function(el) {
			el.stop();
		});
	};

	var playLoopAudio = function () {
		if (!engine.audio) return;
		engine.audio[0].play();
	};

	this.game.newLoop = function (key, func, start, end) {
		if (typeof func == 'function') {
			loops[key] = {
				func : func,
				start : start || false,
				end : end || false,
				audio : false,
				fps : false,
				name : key
			};
		} else {
			stop('error in newLoop : ' + func + ' is not a function');
		}
	};

	this.game.newLoopFromClassObject = function (key, obj) {
		if (!obj.update) return stop('error in newLoopFromClassObject : function "update" not found');
		loops[key] = {
			func : obj.update,
			start : obj.entry || false,
			end : obj.exit || false,
			audio : false,
			fps : false,
			name : key
		};
	};

	this.game.newLoopFromConstructor = function (key, Obj) {
		var obj = new Obj();
		if (!obj.update) return stop('error in newLoopFromConstructor : function "update" not found');
		loops[key] = {
			func : obj.update,
			start : obj.entry || false,
			end : obj.exit || false,
			audio : false,
			fps : false,
			name : key
		};
	};

	this.game.setLoopSound = function (key, arrAudio) { // key, array audios
		var i;
		if (!loops[key].audio) {
			loops[key].audio = [];
		}
		for (i = 0; i < arrAudio.length; i+= 1) {
			arrAudio[i].setNextPlay(arrAudio[i + 1 == arrAudio.length ? 0 : i + 1]);
			loops[key].audio.push(arrAudio[i]);
		}
	};

	this.game.setLoop = function (key) {
		if (!loops[key]) return stop('setLoop : ' + key + ' is no a Loop');
		stopLoopAudio();
		clearMouseAction();
		clearAllKeys();
		clearTouchAction();
		setOffset(point(0, 0));
		if (engine.end) engine.end();
		engine = loops[key];
		if (engine.start) engine.start();
		playLoopAudio();
	};

	var loop = function () {

		if (fps < 60) {
			var pauseTime = 1000/fps;
			try {
				time = Date.now();
				if (time - endTime > pauseTime) {
					preEngine();
					engine.func(dt);
					endTime = time;
					postEngine();
				}
			} catch (e) {
				if (isShowError) errorLog(e);
				if (isStopForError) {
					if (!isShowError) errorLog(e);
					stop();
				}
			}
			next(loop);
			return;
		} else {
			try {
				preEngine();
				engine.func(dt);
				postEngine();
			} catch (e) {
				if (isShowError) errorLog(e);
				if (isStopForError) {
					if (!isShowError) errorLog(e);
					stop();
				}
			}
			next(loop);
		}
	};

	var start = function (fps) {
		if (isRun) return;
		isRun = true;
		setFPS(fps || 60);
		next(loop);
	};

	var stop = function (msg) {
		if (!isRun) return log(isDef(msg) ? msg : 'game is stop');
		isRun = false;
		stopLoopAudio();
		next = function () {
			log(isDef(msg) ? msg : 'game is stop');
		};
	};

	var resume = function (msg) {
		if (isRun) return;
		playLoopAudio();
		log(msg || 'game is run');
		next = getRequestAnimationFrame();
		startTime = -1;
		start();
		return;
	};

	this.game.getWH = function () {
		return {
			w : width,
			h : height,
			w2 : width2,
			h2 : height2
		};
	};

	this.game.getWH2 = function () {
		return {
			w : width / 2,
			h : height / 2
		};
	};

	this.game.getResolution = function () {
		return Math.min(width / origWidth, height / origHeight);
	};

	this.game.startLoop = function (l, f) { // loop, fps
		this.setLoop(l);
		this.start(f);
	};

	this.game.start = start;
	this.game.stop = stop;
	this.game.resume = resume;

	// end game engine ///////////////////////////////////














	// object manager ////////////////////////////////////

	var objectList = [];
	var objectCount = 0;

	var drawAllObjects = function () {
		forArr(objectList, function (el) {
			if (typeof el.draw == 'function') {
				el.draw();
			}
		});
	};

	var inherit = function (Parent, Child) {
		Child.prototype = Object.create(Parent.prototype);
		Child.prototype.constructor = Child;
	};

	// BaseObject
	var BaseObject = function (obj) {
		this.type = 'BaseObject';
		this.id = objectCount+= 1;
		this.x = obj.x || 0;
		this.y = obj.y || 0;
		this.w = obj.w || 0;
		this.h = obj.h || 0;
		this.ondraw = obj.ondraw ? obj.ondraw : false;
		this.parent = false;
		this.children = [];
		this.fillColor = obj.fillColor || false;
		this.strokeColor = obj.strokeColor || contextSettings.strokeStyle;
		this.strokeWidth = obj.strokeWidth || 0;
		this.angle = obj.angle || 0;
		this.alpha = isDef(obj.alpha) ? obj.alpha : 1;
		this.center = point(0, 0);
		this.box = {
			x : 0, y : 0,
			w : 0, h : 0
		};
		this.visible = isDef(obj.visible) ? obj.visible : true;
		this.flip = point(0, 0);

		this.setShadow(obj);

		if (obj.userData) {
			this.setUserData(obj.userData);
		}

		if (obj.center) {
			this.setCenter(obj.center);
		}

		if (obj.box) {
			this.setBox(obj.box);
		}

		if (obj.size) {
			this.setSize(obj.size);
		}

		if (obj.sizeC) {
			this.setSizeC(obj.sizeC);
		}

		if (obj.position) {
			this.setPosition(obj.position);
		}

		if (obj.positionC) {
			this.setPositionC(obj.positionC);
		}

		objectList.push(this);
	};

	BaseObject.prototype = {

		getID : function () {
			return this.id;
		},

		getType : function () {
			return this.type;
		},

		getParent : function () {
			return this.parent;
		},

		addChild : function (obj) {
			if (!obj || obj.id == this.id) return;
			obj.parent = this;
			this.children.push(obj);
			obj.move(this.getPosition());
			obj.setPositionC(getPointAngle(obj.getPositionC(), this.getPositionC(), this.angle));
			obj.turn(this.angle);
		},

		delChild : function (obj) {
			obj.parent = false;
			var i, len;
			for (i = 0, len = this.children.length; i < len; i += 1) {
				if (this.children[i].id == obj.id) {
					this.children.splice(i, 1);
					break;
				}
			}
		},

		delParent : function () {
			this.parent.delChild(this);
		},

		setBox : function (obj) {
			if (obj.offset) {
				this.box.x = obj.offset.x || 0;
				this.box.y = obj.offset.y || 0;
			}
			if (obj.size) {
				this.box.w = obj.size.w || 0;
				this.box.h = obj.size.h || 0;
			}
		},

		isArrIntersect : function (arr) { // array of Objects
			var i, len;
			for (i = 0, len = arr.length; i < len; i+= 1) {
				if (arr[i].id != this.id)
					if (this.isIntersect(arr[i])) {
						return arr[i];
					}
			}
			return false;
		},

		isArrInside : function (arr) { // array of Objects
			var i, len;
			for (i = 0, len = arr.length; i < len; i+= 1) {
				if (this.isDynamicInside(arr[i].getDynamicBox())) {
					return arr[i];
				}
			}
			return false;
		},

		getNearest : function (arr) { // array of Objects
			var i = 0,
				id = 0,
				min = false,
				len = 0;
			for (i = 0, len = arr.length; i < len; i+= 1) {
				if (this.id != arr[i].id) {
					if (min === false) {
						min = this.getDistanceC(arr[i].getPositionC());
						id = i;
					}
					var tmp = this.getDistanceC(arr[i].getPositionC());
					if (tmp < min) {
						min = tmp;
						id = i;
					}
				}
			}
			return arr[id];
		},

		setFlip : function (x, y) {
			if (isDef(x) && this.flip.x != x) {
				this.flip.x = x;
			}

			if (isDef(y) && this.flip.y != y) {
				this.flip.y = y;
			}
		},

		setUserData : function (obj) {
			var i;
			for (i in obj) {
				if (isDef(this[i])) continue;
				this[i] = obj[i];
			}
		},

		setShadow : function (obj) {
			this.shadowColor = obj.shadowColor || false;
			this.shadowBlur = isDef(obj.shadowBlur) ? obj.shadowBlur : 3;
			this.shadowX = obj.shadowX || 0;
			this.shadowY = obj.shadowY || 0;
		},

		getDynamicBox : function () {
			var center = this.getPosition(1);
			if (this.angle == 0) {
				return [
					point(this.x + this.box.x, this.y + this.box.y),
					point(this.x + this.box.x + this.w + this.box.w, this.y + this.box.y),
					point(this.x + this.box.x + this.w + this.box.w, this.y + this.box.y + this.h + this.box.h),
					point(this.x + this.box.x, this.y + this.box.y + this.h + this.box.h),
				];
			}
			return [
				getPointAngle(point(this.x + this.box.x, this.y + this.box.y), center, this.getAngle()),
				getPointAngle(point(this.x + this.box.x + this.w + this.box.w, this.y + this.box.y), center, this.getAngle()),
				getPointAngle(point(this.x + this.box.x + this.w + this.box.w, this.y + this.box.y + this.h + this.box.h), center, this.getAngle()),
				getPointAngle(point(this.x + this.box.x, this.y + this.box.y + this.h + this.box.h), center, this.getAngle())
			];
		},

		isDynamicIntersect : function (box2) {
			if (box2.length < 3) return false;
			var box1 = this.getDynamicBox();
			var i, len;
			for (i = 0, len = box1.length; i < len; i+= 1) {
				if (isPointIn(box1[i], box2)) {
					return true;
				}
			}
			for (i = 0, len = box2.length; i < len; i+= 1) {
				if (isPointIn(box2[i], box1)) {
					return true;
				}
			}
			return false;
		},

		isIntersect : function (obj) {
			if (!obj.visible) return false;
			return (!this.angle && !obj.angle) ? this.isStaticIntersect(obj.getStaticBox()) : this.isDynamicIntersect(obj.getDynamicBox());
		},

		isDynamicInside : function (box2) {
			if (box2.length < 3) return false;
			var box1 = this.getDynamicBox();
			var i, len, count = 0;
			for (i = 0, len = box1.length; i < len; i+= 1) {
				if (isPointIn(box1[i], box2)) {
					count+= 1;
				}
			}
			if (count == box1.length) {
				return true;
			}
			return false;
		},

		drawDynamicBox : function (c) {
			editContext(this, 1);
			context.shadowColor = 'transparent';
			drawRect(point(this.x + this.box.x, this.y + this.box.y), size(this.w + this.box.w, this.h + this.box.h), false, c || 'yellow', 2);
			drawCenter(point(this.x + this.w / 2 + this.center.x, this.y + this.h / 2 + this.center.y), 10, c || 'yellow');
			restoreContext();
		},

		drawStaticBox : function (c) {
			context.shadowColor = 'transparent';
			drawRect(point(this.x + this.box.x, this.y + this.box.y), size(this.w + this.box.w, this.h + this.box.h), false, c || 'yellow', 2);
			drawCenter(point(this.x + this.w / 2 + this.center.x, this.y + this.h / 2 + this.center.y), 10, c || 'yellow');
		},

		isStaticIntersect : function (box) {
			return ((this.y + this.box.y + this.h + this.box.h >= box.y) && (this.x + this.box.x + this.w + this.box.w >= box.x)) && ((this.x + this.box.x < box.x + box.w) && (this.y + this.box.y < box.y + box.h));
		},

		getStaticBox : function () {
			return {
				x : this.x + this.box.x,
				y : this.y + this.box.y,
				w : this.w + this.box.w,
				h : this.h + this.box.h
			};
		},

		setAlpha : function (a) {
			if (this.alpha != a)
				this.alpha = a >= 0 ? (a <= 1 ? a : 1) : 0;
		},

		transparent : function (step) {
			this.setAlpha(this.alpha + step);
		},

		getAlpha : function () {
			return this.alpha;
		},

		rotate : function (p) {
			this.setAngle(Math.atan2(p.y - this.getPosition(1).y, p.x - this.getPosition(1).x) * (180 / Math.PI));
		},

		setCenter : function (p) {
			this.center = point(p.x, p.y);
		},

		nullCenter : function (p) {
			if (!p) p = point(0, 0);
			this.center = point(-this.w / 2 + p.x, -this.h / 2 + p.y);
		},

		getCenter : function () {
			return point(this.center.x, this.center.y);
		},

		getBox : function () {
			return this.box;
		},

		move : function (p) {
			this.prevPosition = this.getPosition();
			this.x += p.x;
			this.y += p.y;
		},

		circling : function (p, r, s) { // point, radius, speed
			if (!isDef(this.circlingAnglePointJS)) {
				this.circlingAnglePointJS = 0;
			}
			this.x = p.x + r * Math.cos(a2r(this.circlingAnglePointJS));
			this.y = p.y + r * Math.sin(a2r(this.circlingAnglePointJS));
			this.circlingAnglePointJS = this.circlingAnglePointJS > 360 ? 0 : this.circlingAnglePointJS + s;
		},

		circlingC : function (p, r, s) { // point, radius, speed
			if (!isDef(this.circlingAnglePointJS)) {
				this.circlingAnglePointJS = 0;
			}
			this.setPositionC(point(p.x + r * Math.cos(a2r(this.circlingAnglePointJS)), p.y + r * Math.sin(a2r(this.circlingAnglePointJS))));
			this.circlingAnglePointJS = this.circlingAnglePointJS > 360 ? 0 : this.circlingAnglePointJS + s;
		},

		motion : function (p, s, sp) { // point, size, speed
			if (!isDef(this.motionPercentPointJS)) {
				this.motionPercentPointJS = 0;
			}
			this.x = p.x + s.w * Math.cos(a2r(this.motionPercentPointJS));
			this.y = p.y + s.h * Math.sin(a2r(this.motionPercentPointJS));
			this.motionPercentPointJS = this.motionPercentPointJS > 360 ? 0 : this.motionPercentPointJS + sp;
		},

		motionC : function (p, s, sp) { // point, size, speed
			if (!isDef(this.motionPercentPointJS)) {
				this.motionPercentPointJS = 0;
			}
			this.setPositionC(point(p.x + s.w * Math.cos(a2r(this.motionPercentPointJS)), p.y + s.h * Math.sin(a2r(this.motionPercentPointJS))));
			this.motionPercentPointJS = this.motionPercentPointJS > 360 ? 0 : this.motionPercentPointJS + sp;
		},

		scale : function (s) {
			this.w *= s;
			this.h *= s;
		},

		scaleC : function (s) {
			var oldW = this.w, oldH = this.h;
			this.scale(s);
			this.move(point(-((this.w - oldW) / 2), -((this.h - oldH) / 2)));
		},

		getPosition : function (fmt) {
			if (fmt == 1) {
				return point(this.x + (this.w / 2 + this.center.x), this.y + (this.h / 2 + this.center.y));
			} else if (fmt == 2) {
				var p = point(this.x + (this.w / 2), this.y + (this.h / 2));
				if (this.angle) {
					p = getPointAngle(p, this.getPosition(1), this.angle);
				}
				return point(p.x, p.y);
			} else { // fmt empty or 0
				return point(this.x, this.y);
			}
		},

		getPositionC : function () {
			return point(this.x + (this.w / 2 + this.center.x), this.y + (this.h / 2 + this.center.y));
		},

		getPositionS : function () {
			return point(this.x + offset.x, this.y + offset.x);
		},

		getPositionCS : function () {
			return point(this.x + (this.w / 2 + this.center.x) + offset.x, this.y + (this.h / 2 + this.center.y) + offset.y);
		},

		setPosition : function (p) {
			var pPos = this.getPosition();
			if (p.x !== false) this.x = p.x;
			if (p.y !== false) this.y = p.y;
		},

		setPositionS : function (p) {
			var pPos = this.getPosition();
			if (p.x !== false) this.x = p.x + offset.x;
			if (p.y !== false) this.y = p.y + offset.y;
		},

		setPositionC : function (p) {
			var pPos = this.getPosition();
			if (p.x !== false) this.x = (-(this.w / 2 + this.center.x) + p.x);
			if (p.y !== false) this.y = (-(this.h / 2 + this.center.y) + p.y);
		},

		setPositionCS : function (p) {
			var pPos = this.getPosition();
			if (p.x !== false) this.x = (-(this.w / 2 + this.center.x) + p.x) + offset.x;
			if (p.y !== false) this.y = (-(this.h / 2 + this.center.y) + p.y) + offset.y;
		},

		getSize : function () {
			return size(this.w, this.h);
		},

		setSize : function (s) {
			this.w = s.w;
			this.h = s.h;
		},

		setSizeC : function (s) {
			this.w = s.w;
			this.h = s.h;
			this.move(point(-(s.w / 2), -(s.h / 2)));
		},

		turn : function (a) {
			this.angle += a;
		},

		rotateForAngle : function (a, s) { // angle, speed
			if (this.angle < 0) {
				this.angle = this.angle + 360;
			}

			if (a < 0) {
				a += 360;
			}

			var aa = this.angle - a;

			if (aa > 180) {
				aa = aa - 360;
			} else if (aa < -180) {
				aa = aa + 360;
			}

			if (aa >= -s - 0.5 && aa <= s + 0.5) {
				this.angle = a;
			} else if (aa > s + 0.5) {
				this.angle = this.angle - s
			} else if (aa < -s - 0.5) {
				this.angle = this.angle + s;
			}
		},

		rotateForPoint : function (p, speed) {
			var angle = getAngle2Points(this.getPositionC(), p);
			this.rotateForAngle(angle, speed);
		},

		rotateForObject : function (obj, speed) {
			var angle = getAngle2Points(this.getPositionC(), obj.getPositionC());
			this.rotateForAngle(angle, speed);
		},

		moveTo : function (p, s) {
			var a = a2r(getAngle2Points(this.getPosition(), p));
			this.prevPosition = this.getPosition();
			this.x += s * Math.cos(a);
			this.y += s * Math.sin(a);
		},

		moveToC : function (p, s) {
			var a = a2r(getAngle2Points(this.getPositionC(), p));
			this.prevPosition = this.getPosition();
			this.x += s * Math.cos(a);
			this.y += s * Math.sin(a);
		},

		moveAngle : function (s, a) {
			a = a2r(isDef(a) ? a : this.angle);
			this.prevPosition = this.getPosition();
			this.x += s * Math.cos(a);
			this.y += s * Math.sin(a);
		},

		moveTime : function (p, t) {
			t = t || 1;
			var pos = this.getPosition();
			this.move(point((p.x - pos.x) / t, (p.y - pos.y) / t));
		},

		moveTimeC : function (p, t) {
			t = t || 1;
			var pos = this.getPosition(1);
			this.move(point((p.x - pos.x) / t, (p.y - pos.y) / t));
		},

		getAngle : function () {
			return this.angle;
		},

		setAngle : function (a) {
			if (this.angle != a)
				this.angle = a % 360;
		},

		getDistance : function (p) {
			return Math.sqrt(Math.pow(p.x - this.getPosition(2).x, 2) + Math.pow(p.y - this.getPosition(2).y, 2));
		},

		getDistanceC : function (p) {
			return Math.sqrt(Math.pow(p.x - this.getPosition(1).x, 2) + Math.pow(p.y - this.getPosition(1).y, 2));
		},

		setVisible : function (bool) {
			this.visible = bool == true;
		},

		isVisible : function () {
			return this.visible;
		},

		isInCamera : function () {
			return this.angle ? this.isInCameraDynamic() : this.isInCameraStatic();
		},

		isInCameraStatic : function () {
			if (this.x + this.w < offset.x || this.x > offset.x + width) return false;
			if (this.y + this.h < offset.y || this.y > offset.y + height) return false;
			return true;
		},

		isInCameraDynamic : function () {
			var box = this.getDynamicBox();
			var camera = [point(offset.x, offset.y), point(offset.x + width, offset.y),
				point(offset.x + width, offset.y + height), point(offset.x, offset.y + height)
			];
			var i, len, count = 0;
			for (i = 0, len = box.length; i < len; i+= 1) {
				if (isPointIn(box[i], camera)) {
					count+= 1;
				}
			}
			return count > 0;
		},

		onCollision : function (obj) {
			DEPRECATED('onCollision, onArrCollision', 'isIntersect, isArrIntersect');
		},

		onArrCollision : function (arr) {
			var i, len;
			for (i = 0, len = arr.length; i < len; i+= 1) {
				if (this.id == arr[i].id) continue;
				this.onCollision(arr[i]);
			}
		},

		draw : function () {
			// 0-function
		}


	};

	this.game.newBaseObject = function (obj) {
		return new BaseObject(obj);
	};



	// TriangleObject
	var TriangleObject = function (obj) {
		BaseObject.call(this, obj);
		this.type = 'TriangleObject';
	};
	inherit(BaseObject, TriangleObject);

	TriangleObject.prototype.draw = function () {
		if (!this.visible) return;
		if (!this.alpha) return;
		var ctx = false;
		if (this.angle || this.alpha != 1 || this.shadowColor) {
			editContext(this);
			ctx = true;
		}

		drawPolygonXY(
			this.x,
			this.y,
			[point(this.w/2, 0), point(this.w, this.h), point(0, this.h)],
			this.fillColor,
			this.strokeWidth ? this.strokeColor : false,
			this.strokeWidth
		);

		if (this.ondraw) this.ondraw();

		if (ctx) {
			restoreContext();
		}
	};

	this.game.newTriangleObject = function (obj) {
		return new TriangleObject(obj);
	};




	// RectObject
	var RectObject = function (obj) {
		BaseObject.call(this, obj);
		this.type = 'RectObject';
	};
	inherit(BaseObject, RectObject);

	RectObject.prototype.draw = function () {
		if (!this.visible) return;
		if (!this.alpha) return;
		var ctx = false;
		if (this.angle || this.alpha != 1 || this.shadowColor) {
			editContext(this);
			ctx = true;
		}

		drawRect(point(this.x, this.y), size(this.w, this.h), this.fillColor, this.strokeColor, this.strokeWidth);
		if (this.ondraw) this.ondraw();

		if (ctx) {
			restoreContext();
		}
	};

	this.game.newRectObject = function (obj) {
		return new RectObject(obj);
	};




	// RoundRectObject
	var RoundRectObject = function (obj) {
		BaseObject.call(this, obj);
		this.type = 'RoundRectObject';
		this.radius = obj.radius || 1;
	};
	inherit(BaseObject, RoundRectObject);

	RoundRectObject.prototype.draw = function () {
		if (!this.visible) return;
		if (!this.alpha) return;
		var ctx = false;
		if (this.angle || this.alpha != 1 || this.shadowColor) {
			editContext(this);
			ctx = true;
		}

		drawRoundRect(point(this.x, this.y), size(this.w, this.h), this.radius, this.fillColor, this.strokeColor, this.strokeWidth);
		if (this.ondraw) this.ondraw();

		if (ctx) {
			restoreContext();
		}
	};

	this.game.newRoundRectObject = function (obj) {
		return new RoundRectObject(obj);
	};













	// CircleObject
	var CircleObject = function (obj) {
		BaseObject.call(this, obj);
		this.radius = obj.radius || 5;

		if (obj.scale) {
			this.radius *= obj.scale;
		}

		this.w = this.radius * 2;
		this.h = this.radius * 2;
		this.type = 'CircleObject';

		if (obj.positionC) {
			this.setPositionC(obj.positionC);
		}

	};
	inherit(BaseObject, CircleObject);

	CircleObject.prototype.draw = function () {
		if (!this.visible) return;
		if (!this.alpha) return;
		var ctx = false;
		if (this.angle || this.alpha != 1 || this.shadowColor) {
			editContext(this);
			ctx = true;
		}

		drawCircle(point(this.x, this.y), this.radius, this.fillColor, this.strokeColor, this.strokeWidth);
		if (this.ondraw) this.ondraw();

		if (ctx) {
			restoreContext();
		}
	};

	CircleObject.prototype.scale = function (s) {
		this.w *= s || 0;
		this.h *= s || 0;
		this.radius *= s ? s / 2 : 0;
	};

	CircleObject.prototype.scaleC = function (s) {
		var oldW = this.w, oldH = this.h;
		this.w *= s || 0;
		this.h *= s || 0;
		this.radius *= s;
		this.move(point(-((this.w - oldW) / 2), -((this.h - oldH) / 2)));
	};

	CircleObject.prototype.getRadius = function () {
		return this.radius;
	};

	CircleObject.prototype.setRadius = function (r) {
		if (!r || this.radius == r) return;
		this.radius = r;
		this.w = r * 2;
		this.h = r * 2;
	};

	this.game.newCircleObject = function (obj) {
		return new CircleObject(obj);
	};


	// BackgroundObject
	var BackgroundObject = function (obj) {
		this.file = obj.file;
		this.w = obj.w;
		this.h = obj.h;
		this.read = {
			x : 0, y : 0,
			w : 0, h : 0
		};

		if (obj.read) {
			this.read.w = obj.read.w || 0;
			this.read.h = obj.read.h || 0;
			this.read.x = obj.read.x || 0;
			this.read.y = obj.read.y || 0;
		}

		this.countX = obj.countX;
		this.countY = obj.countY;
		this.fullW = this.countX * this.w;
		this.fullH = this.countY * this.h;
		this.cnv = device.document.createElement('canvas');
		this.cnv.width = this.w;
		this.cnv.height = this.h;
		this.ctx = this.cnv.getContext('2d');
		this.loaded = false;
		this.x = obj.x || 0;
		this.y = obj.y || 0;

		var img = device.document.createElement('img');
		var that = this;
		img.onload = function () {
			that.ctx.drawImage(this, that.read.x ? that.read.x : 0, that.read.y ? that.read.y : 0, that.read.w ? that.read.w : this.width, that.read.h ? that.read.h : this.height, 0, 0, that.w, that.h);
			that.loaded = true;
			resources.load();
		};
		img.src = this.file;
		resources.add();
	};

	BackgroundObject.prototype.draw = function () {
		if (!this.loaded) return;
		var dx = -offset.x + this.x;
		var dy = -offset.y + this.y;
		var x, y;
		for (y = 0; y < this.countY; y+= 1) {
			if (this.y + y * this.h + this.h < offset.y || this.y + y * this.h > offset.y + height) continue;
			for (x = 0; x < this.countX; x+= 1) {
				if (this.x + x * this.w + this.w < offset.x || this.x + x * this.w > offset.x + width) continue;
				context.drawImage(this.cnv, dx + x * this.w, dy + y * this.h, this.w, this.h);
			}
		}
	};

	BackgroundObject.prototype.getSize = function () {
		if (!this.loaded) return size();
		return size(this.fullW, this.fullH);
	};

	this.game.newBackgroundObject = function (obj) {
		return new BackgroundObject(obj);
	};


	// EllipsObject
	var EllipsObject = function (obj) {
		BaseObject.call(this, obj);
		this.type = 'EllipsObject';
	};
	inherit(BaseObject, EllipsObject);

	EllipsObject.prototype.draw = function () {
		if (!this.visible) return;
		if (!this.alpha) return;
		editContext(this);

		drawCircle(point(this.x, this.y), this.h / 2, this.fillColor, this.strokeColor, this.strokeWidth);
		if (this.ondraw) this.ondraw();

		restoreContext();
	};

	this.game.newEllipsObject = function (obj) {
		return new EllipsObject(obj);
	};


	// TextObject
	var TextObject = function (obj) {
		BaseObject.call(this, obj);
		this.type = 'TextObject';
		this.text = obj.text || 'TextObject';
		this.color = obj.color || '';
		this.size = obj.size || 10;

		if (obj.scale) {
			this.size *= obj.scale;
		}

		this.font = obj.font || 'sans-serif';
		this.style = obj.style || '';
		this.align = 'left';
		this.padding = obj.padding || 2;
		this.w = getTextWidth(this.text, this.style, this.size, this.font) + this.padding * 2;
		this.h = this.size + this.padding * 2;
		this.strokeColorText = obj.strokeColorText || false;
		this.strokeWidthText = obj.strokeWidthText || false;
		this.textDY = -this.size / 7;


		if (obj.positionC) {
			this.setPositionC(obj.positionC);
		}

	};
	inherit(BaseObject, TextObject);

	TextObject.prototype.reStyle = function (obj) {
		this.text = obj.text || this.text;
		this.color = obj.color || this.color;
		this.size = obj.size || this.size;
		this.font = obj.font || this.font;
		this.style = obj.style || this.style;
		this.padding = obj.padding || this.padding;
		this.w = getTextWidth(this.text, this.style, this.size, this.font) + this.padding * 2;
		this.h = this.size + this.padding * 2;
		this.strokeColorText = obj.strokeColorText || this.strokeColorText;
		this.strokeWidthText = obj.strokeWidthText || this.strokeWidthText;
		this.strokeColor = obj.strokeColor || this.strokeColor;
		this.strokeWidth = obj.strokeWidth || this.strokeWidth;
		this.fillColor = obj.fillColor || this.fillColor;
		this.textDY = -this.size / 7;
	};

	TextObject.prototype.setText = function (t) { // text
		if (this.text == t) return;
		this.reStyle({
			text : t
		});
	};

	TextObject.prototype.getText = function () {
		return this.text;
	};

	TextObject.prototype.draw = function () {
		if (!this.visible) return;
		if (!this.alpha) return;
		var ctx = false;
		if (this.angle || this.alpha != 1 || this.shadowColor) {
			editContext(this);
			ctx = true;
		}

		if (this.fillColor || this.strokeColor)
			drawRect(point(this.x, this.y), size(this.w, this.h), this.fillColor, this.strokeColor, this.strokeWidth);


		drawText(point(this.x + this.padding, this.textDY + this.y + this.padding),
			this.text,
			this.color,
			this.size,
			this.font,
			this.style,
			this.align,
			this.strokeColorText,
			this.strokeWidthText);

		if (this.ondraw) this.ondraw();

		if (ctx) {
			restoreContext();
		}
	};

	TextObject.prototype.scale = function (s) { // dSize number
		this.reStyle({
			size : this.size * s
		});
	};

	TextObject.prototype.scaleC = function (s) { // dSize number
		var oldW = this.w, oldH = this.h;
		this.reStyle({
			size : this.size * s
		});
		this.move(point(-((this.w - oldW) / 2), -((this.h - oldH) / 2)));
	};

	TextObject.prototype.setSize = function (s) { // size number
		if (this.size == s) return;
		this.reStyle({
			size : s
		});
	};


	TextObject.prototype.setSizeC = function (s) { // size number
		if (this.size == s) return;
		this.reStyle({
			size : s
		});
		this.move(point(-s / 2, -s / 2));
	};


	var getTextWidth = function (text, style, size, font) { // text
		var ctx = device.document.createElement('canvas').getContext('2d');
		ctx.font = style + size + 'px ' + font;
		return ctx.measureText(text).width;
	};

	this.OOP.getTextWidth = function (obj) {
		return getTextWidth(obj.text, obj.style || '', obj.size || 10, obj.font || 'sans-serif');
	};


	this.game.newTextObject = function (obj) {
		return new TextObject(obj);
	};


	// PolygonObject
	var PolygonObject = function (obj) {
		BaseObject.call(this, obj);
		this.type = 'PolygonObject';
		this.points = [];
		this.dY = 0;
		this.dX = 0;
		var i;
		var that = this;
		if (obj.points) {
			forArr(obj.points, function (el) {
				that.addPoint(el);
			});
		}

		this.pointColor = obj.pointColor || false;
	};
	inherit(BaseObject, PolygonObject);

	PolygonObject.prototype.addPoint = function (p) {
		this.dX = 0;
		this.dY = 0;
		var i;
		var that = this;
		if (this.y + p.y < this.y) {
			this.dY = Math.abs(this.y + p.y - this.y);
			forArr(this.points, function (el) {
				el.y += that.dY;
			})
		}

		if (this.x + p.x < this.x) {
			this.dX = Math.abs(this.x + p.x - this.x);
			var that = this;
			forArr(this.points, function (el) {
				el.x += that.dX;
			});
		}

		this.points.push(point(p.x + this.dX, p.y + this.dY));

		this.w = 0;
		this.h = 0;
		var that = this;
		forArr(this.points, function (el) {
			that.h += that.y + el.y > that.y + that.h ? el.y - that.h : 0;
			that.w += that.x + el.x > that.x + that.w ? el.x - that.w : 0;
		});
	};

	PolygonObject.prototype.delPoint = function (N) {
		var i, len, p = this.getPoints();
		this.clearPoints();
		for (i = 0, len = p.length; i < len; i+= 1) {
			if (i != N) {
				this.addPoint(p[i]);
			}
		}
	};

	PolygonObject.prototype.clearPoints = function () {
		this.points = [];
		this.count = 0;
	};

	PolygonObject.prototype.getPoints = function () {
		return this.points;
	};

	PolygonObject.prototype.getCount = function () {
		return this.points.length;
	};

	PolygonObject.prototype.getPoint = function (N) {
		return this.points[N];
	};

	PolygonObject.prototype.scale = function (s) {
		return;
	};

	PolygonObject.prototype.drawDynamicBox = function (c) {
		var ctx = false;
		if (this.angle || this.alpha != 1 || this.shadowColor) {
			editContext(this);
			ctx = true;
		}
		drawPolygonXY(this.x, this.y, this.points, this.fillColor, c || 'yellow', 2, 'red');
		if (ctx) {
			restoreContext();
		}
	};

	PolygonObject.prototype.getDynamicBox = function () {
		var points = [], i;
		if (!this.angle) {
			var that = this;
			forArr(this.points, function (el) {
				points.push(pointPlus(el, point(that.x, that.y)));
			});
		} else {
			var center = this.getPosition(1);
			var that = this;
			forArr(this.points, function (el) {
				points.push(
					getPointAngle(pointPlus(el, point(that.x, that.y)), center, that.getAngle())
				);
			});
		}
		return points;
	},

		PolygonObject.prototype.draw = function () {
			if (!this.visible) return;
			if (!this.alpha) return;
			var ctx = false;
			if (this.angle || this.alpha != 1 || this.shadowColor) {
				editContext(this);
				ctx = true;
			}

			drawPolygonXY(this.x, this.y, this.points, this.fillColor, this.strokeColor, this.strokeWidth, this.pointColor);
			if (this.ondraw) this.ondraw();

			if (ctx) {
				restoreContext();
			}
		};

	this.game.newPolygonObject = function (obj) {
		return new PolygonObject(obj);
	};


	// ImageObject
	var ImageObject = function (obj) {
		BaseObject.call(this, obj);
		// this.w = 0;
		// this.h = 0;
		this.type = 'ImageObject';
		this.loaded = false;
		this.file = '';
		this.forOnLoad = obj.onload || false;

		addImage(obj.file, this, obj.scale || 1);
	};
	inherit(BaseObject, ImageObject);

	ImageObject.prototype.draw = function () {
		if (!this.visible) return;
		if (!this.alpha) return;
		if (!this.loaded) return;

		var ctx = false;
		if (this.angle || this.alpha != 1 || this.shadowColor || this.flip.x || this.flip.y) {
			editContext(this);
			ctx = true;
		}

		drawImage(point(this.x, this.y), size(this.w, this.h), this.file);
		if (this.ondraw) this.ondraw();
		if (ctx) {
			restoreContext();
		}
	};

	ImageObject.prototype.simpleDraw = function (p) {
		if (!this.loaded) return;
		var ctx = false;
		if (this.angle || this.alpha != 1 || this.shadowColor) {
			editContext(this);
			ctx = true;
		}
		drawImage(point(p.x, p.y), size(this.w, this.h), this.file);
		if (ctx) {
			restoreContext();
		}
	};

	ImageObject.prototype.setImage = function (f, func) { // file, onload function
		if (this.file == f) return;
		if (!isDef(imageList[f])) {
			this.loaded = false;
			this.origWidth = 0;
			this.origHeight = 0;
			this.forOnLoad = func || false;
			addImage(f, this);
		} else {
			this.file = f;
			if (func) func();
		}
	};

	ImageObject.prototype.getImage = function () {
		return this.file;
	};

	ImageObject.prototype.resize = function (s) {

		if (s.w !== false && s.h === false) {
			var dh = s.w / this.w;
			this.w = s.w;
			this.h = this.h * dh;
		} else if (s.h !== false && s.w === false) {
			var dw = s.h / this.h;
			this.h = s.h;
			this.w = this.w * dw;
		} else if (s.w !== false && s.h !== false) {
			this.w = s.w;
			this.h = s.h;
		}


	};

	this.game.newImageObject = function (obj) {
		return new ImageObject(obj);
	};


	// AnimationObject
	var AnimationObject = function (obj) {
		BaseObject.call(this, obj);
		this.type = 'AnimationObject';
		this.frame = 0;
		this.anim = obj.animation;
		this.step = obj.delay || 10;
		this.difStep = 0;
		this.toFrameStep = 0;

		if (obj.scale) {
			this.w *= obj.scale;
			this.h *= obj.scale;
		}

	};
	inherit(BaseObject, AnimationObject);

	AnimationObject.prototype.draw = function () {
		if (!this.visible) return;
		if (!this.alpha) return;
		var ctx = false;
		if (this.angle || this.alpha != 1 || this.flip.x || this.flip.y || this.shadowColor) {
			editContext(this);
			ctx = true;
		}

		drawAnimation(this.anim, point(this.x, this.y), size(this.w, this.h), this.frame);
		if (this.ondraw) this.ondraw();

		if (this.difStep > this.step) {
			this.frame = this.frame < this.anim.r ? this.frame + 1 : 0;
			this.difStep = 0;
		}
		else {
			this.difStep+= 1;
		}
		if (ctx) {
			restoreContext();
		}
	};


	AnimationObject.prototype.drawFrames = function (min, max, obj) {
		if (!this.visible) return;
		if (!this.alpha) return;
		if (this.frame < min || this.frame > max) this.frame = min;
		var ctx = false;
		if (this.angle || this.alpha != 1 || this.flip.x || this.flip.y || this.shadowColor) {
			editContext(this);
			ctx = true;
		}

		drawAnimation(this.anim, point(this.x, this.y), size(this.w, this.h), this.frame);
		if (this.ondraw) this.ondraw();

		if (this.difStep > this.step) {
			this.frame = this.frame < max ? this.frame + 1 : min;
			this.difStep = 0;
		}
		else {
			this.difStep+= 1;
		}
		if (ctx) {
			restoreContext();
		}
	};

	AnimationObject.prototype.drawFrame = function (f) {
		if (!this.visible) return;
		if (!this.alpha) return;
		var ctx = false;
		if (this.angle || this.alpha != 1 || this.flip.x || this.flip.y || this.shadowColor) {
			editContext(this);
			ctx = true;
		}

		drawAnimation(this.anim, point(this.x, this.y), size(this.w, this.h), f);
		if (this.ondraw) this.ondraw();

		if (ctx) {
			restoreContext();
		}
	};

	AnimationObject.prototype.drawToFrame = function (f) { // to frame
		if (!this.visible) return;
		if (!this.alpha) return;

		if (this.frame < f)
			this.toFrameStep = 1;
		else if (this.frame > f)
			this.toFrameStep = -1;
		else {
			this.drawFrame(f);
			return;
		}

		this.drawFrame(this.frame);
		if (this.ondraw) this.ondraw();

		if (this.difStep > this.step) {
			this.frame = this.frame < this.anim.r ? this.frame + this.toFrameStep : 0;
			this.difStep = 0;
		}
		else {
			this.difStep+= 1;
		}
	};

	AnimationObject.prototype.drawReverFrames = function (min, max) { // to frame
		if (!this.visible) return;
		if (!this.alpha) return;

		this.drawFrame(this.frame);
		if (this.ondraw) this.ondraw();

		if (this.difStep > this.step) {

			if (this.frame <= min)
				this.toFrameStep = 1;
			else if (this.frame >= max)
				this.toFrameStep = -1;

			this.frame += this.toFrameStep;
			this.difStep = 0;
		}
		else {
			this.difStep+= 1;
		}


	};

	AnimationObject.prototype.setAnimation = function (t) { // tile
		if (t.id == this.anim.id) return;
		this.frame = 0;
		this.anim = t;
	};

	AnimationObject.prototype.getAnimation = function () {
		return this.anim;
	};

	AnimationObject.prototype.setDelay = function (d) {
		this.step = d > 0 ? d : this.step;
	};

	AnimationObject.prototype.getDelay = function () {
		return this.step;
	};

	this.game.newAnimationObject = function (obj) {
		return new AnimationObject(obj);
	};


	var newObjectFromType = function (obj) {
		var cl = false;
		if (obj.type == 'RectObject') cl = _PointJS.game.newRectObject({});
		else if (obj.type == 'CircleObject') cl = _PointJS.game.newCircleObject({});
		else if (obj.type == 'RoundRectObject') cl = _PointJS.game.newRoundRectObject({});
		else if (obj.type == 'TextObject') cl = _PointJS.game.newTextObject({});
		else if (obj.type == 'EllipsObject') cl = _PointJS.game.newEllipsObject({});
		else if (obj.type == 'ImageObject') cl = _PointJS.game.newImageObject({file:obj.file});
		else if (obj.type == 'TriangleObject') cl = _PointJS.game.newTriangleObject({});
		else if (obj.type == 'AnimationObject') cl = _PointJS.game.newAnimationObject({animation:obj.animation});

		return cl;
	};

	// end object manager ////////////////////////////////

















	// tiles ///////////////////////////////////////////

	var imageCount = 0;
	var Image = function (f, onLoad) { // file
		this.file = f;
		this.loaded = false;
		this.w = 0;
		this.h = 0;
		this.id = imageCount++;
		this.toLoad = [];
		var img = device.document.createElement('img');
		var that = this;
		img.onload = function () {
			that.loaded = true;
			that.w = this.width;
			that.h = this.height;
			that.img = device.document.createElement('canvas');
			that.img.width = this.width;
			that.img.height = this.height;
			that.context = that.img.getContext('2d');
			that.context.drawImage(this, 0, 0);
			if (that.toLoad.length)
				forArr(that.toLoad, function (i) {
					i.func(that.context, i.w, i.h, i.r);
				});
			if (onLoad) {
				that.onLoad = onLoad;
				that.onLoad();
			}
			resources.load();
		};
		img.src = f;
		resources.add();
	};

	Image.prototype.onContext = function (func) {
		if (this.loaded) {
			func(this.context, this.w, this.h, 1);
		} else {
			this.toLoad.push({
				w : this.w,
				h : this.h,
				r : 1,
				func : func
			});
		}
	};

	Image.prototype.getCanvas = function () {
		return this.img;
	};

	var animCount = 0;
	Image.prototype.getAnimation = function (x, y, w, h, r) { // r - repeat

		var Animation = function (that, x, y, w, h, r) {
			this.id = animCount++;
			this.image = that;
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.r = r ? r - 1 : 0;
			this.endFrame = this.r;
			this.frameCount = this.r+1;
		};

		Animation.prototype = {
			onContext : function (func) { // frame, function
				if (this.image.loaded)
					func(this.image.context, this.w, this.h, this.r);
				else
					this.image.toLoad.push({
						w : this.w,
						h : this.h,
						r : this.r,
						func : func
					});
			},

			getImage : function () {
				return this.image;
			},

			getCount : function () {
				return this.r;
			}
		};

		return new Animation(this, x, y, w, h, r);
	};

	var DrawImage = function (w, h) { // file
		this.loaded = true;
		this.w = w;
		this.h = h;
		this.img = device.document.createElement('canvas');
		this.img.width = w;
		this.img.height = h;
		this.context = this.img.getContext('2d');
	};

	DrawImage.prototype.onContext = Image.prototype.onContext;
	DrawImage.prototype.getAnimation = Image.prototype.getAnimation;

	this.tiles.newDrawImage = function (w, h) {
		return new DrawImage(w, h);
	};

	this.tiles.newImage = function (f, onLoad) {
		return new Image(f, onLoad);
	};

	this.tiles.newAnimation = function (f, w, h, r) {	// file, width-frame, height-frame, repeats (frames)
		return new Image(f).getAnimation(0, 0, w, h, r);
	};

	var drawAnimation = function (tile, p, s, f) { // tile, pos, size, frame
		if (!tile || !tile.image.loaded) return;
		var dx = -offset.x;
		var dy = -offset.y;
		if (tile.image.img)
			context.drawImage(tile.image.img, tile.x + (tile.w * f), tile.y, tile.w, tile.h, p.x + dx, p.y + dy, s.w, s.h);
	};


	// end tiles ///////////////////////////////////////

















	// image ///////////////////////////////


	var imageList = {};

	var addImage = function (file, obj, scale) {
		if (isDef(imageList[file])) {
			obj.loaded = true;
			obj.file = file;
			var w, h;
			if (obj.w && !obj.h) {
				var dh = obj.w / imageList[file].w;
				w = obj.w;
				h = imageList[file].h * dh;
			} else if (!obj.w && obj.h) {
				var dh = obj.h / imageList[file].h;
				h = obj.h;
				w = imageList[file].w * dh;
			} else if (obj.w && obj.h) {
				w = obj.w;
				h = obj.h;
			} else {
				w = imageList[file].w;
				h = imageList[file].h;
			}

			if (scale) {
				w *= scale;
				h *= scale;
			}

			obj.w = w;
			obj.h = h;

			if (obj.forOnLoad) {
				obj.forOnLoad();
			}

			return;
		}

		var img = device.document.createElement('img');
		img.onload = function () {
			imageList[file] = {};
			imageList[file].loaded = true;
			imageList[file].img = this;
			imageList[file].w = this.width;
			imageList[file].h = this.height;

			if (isDef(obj)) {
				obj.loaded = true;
				var w, h;
				if (obj.w && !obj.h) {
					var dh = obj.w / imageList[file].w;
					w = obj.w;
					h = imageList[file].h * dh;
				} else if (!obj.w && obj.h) {
					var dh = obj.h / imageList[file].h;
					h = obj.h;
					w = imageList[file].w * dh;
				} else if (obj.w && obj.h) {
					w = obj.w;
					h = obj.h;
				} else {
					w = imageList[file].w;
					h = imageList[file].h;
				}

				if (scale) {
					w *= scale;
					h *= scale;
				}

				obj.w = w;
				obj.h = h;

				obj.file = file;
				if (obj.forOnLoad) {
					obj.forOnLoad();
				}
			}
			resources.load();
		};

		img.src = file;
		resources.add();
	};

	var getImageList = function () {
		return imageList;
	};


	// this.images = {
	// 	getImageList : getImageList
	// };


	var drawImage = function (p, s, img) { // pos, size, img, imgPos, imgSize
		if (!img) return;
		var dx = -offset.x;
		var dy = -offset.y;
		if (imageList[img]) context.drawImage(imageList[img].img, 0, 0, imageList[img].w, imageList[img].h, p.x + dx, p.y + dy, s.w, s.h);
	};


	// end image ///////////////////////////














	// mesh system ///////////////////////////////////////


	var Mesh = function (obj) {
		this.type = 'Mesh';
		this.objs = [];
		this.x = obj.x || 0;
		this.y = obj.y || 0;
		this.angle = obj.angle || 0;
		this.count = 0;

		var that = this;

		if (obj.add) {
			var i;
			forArr(obj.add, function (el) {
				that.add(el);
			});
		}

		if (this.angle) {
			this.setAngle(this.angle);
		}

	};

	Mesh.prototype = {

		getCount : function () {
			return this.count;
		},

		getObjects : function () {
			return this.objs;
		},

		add : function (obj) {
			this.count+= 1;
			this.objs.push(obj);
			obj.offsetMesh = obj.getPosition(1);
			obj.turn(this.angle);
			obj.setPositionC(point(this.x + obj.offsetMesh.x, this.y + obj.offsetMesh.y));
		},

		del : function (obj) {
			var i;
			var that = this;
			forArr(this.objs, function (el) {
				if (el.id == obj.id) {
					that.objs.splice(i, 1);
					that.count--;
				}
			});
		},

		draw : function (p) {
			var i;
			forArr(this.objs, function (el) {
				el.draw();
			});
		},

		move : function (p) {
			this.x += p.x || 0;
			this.y += p.y || 0;
			var that = this;
			forArr(this.objs, function (el) {
				el.setPositionC(point(that.x + el.offsetMesh.x, that.y + el.offsetMesh.y));
			});
		},

		turn : function (a) {
			if (a == 0) return;
			this.angle = this.angle % 360;
			this.angle += a;
			var i, obj,
				center = point(this.x, this.y);

			var that = this;

			forArr(this.objs, function (el) {
				el.turn(a);
				el.setPositionC(getPointAngle(point(that.x + el.offsetMesh.x, that.y + el.offsetMesh.y), center, that.angle));
			});
		},

		setAngle : function (a) {
			if (a == this.angle) return;
			a = a % 360;
			this.angle = a;
			var i, obj,
				center = point(this.x, this.y);

			var that = this;
			forArr(this.objs, function (el) {
				el.setAngle(a);
				el.setPositionC(getPointAngle(point(that.x + el.offsetMesh.x, that.y + el.offsetMesh.y), center, that.angle));
			});
		},

		setPosition : function (p) {
			if (this.x == p.x && this.y == p.y) return;
			this.x = p.x || this.x;
			this.y = p.y || this.y;
			var i, obj;
			var that = this;
			forArr(this.objs, function (el) {
				if (!that.angle) {
					el.setPositionC(point(that.x + el.offsetMesh.x, that.y + el.offsetMesh.y));
				}
				else {
					el.setPositionC(getPointAngle(point(that.x + el.offsetMesh.x, that.y + el.offsetMesh.y), point(that.x, that.y), that.angle));
				}
			});
		},

		isDynamicIntersect : function (box) {
			if (box.length < 3) return false;
			var obj = false;
			forArr(this.objs, function (el) {
				if (el.isDynamicIntersect(box)) {
					return obj = el;
				}
			});
			return obj;
		},

		isStaticIntersect : function (box) {
			var obj = false;
			forArr(this.objs, function (el) {
				if (el.isStaticIntersect(box)) {
					return obj = el;
				}
			});
			return obj;
		},

		isIntersect : function (box) {
			var obj = false;
			forArr(this.objs, function (el) {
				if (el.isIntersect(box)) {
					return obj = el;
				}
			});
			return obj;
		}


	};

	this.game.newMesh = function (obj) {
		return new Mesh(obj);
	};


	// end mesh system ///////////////////////////////////
















	// camera /////////////////////////////////////////////

	this.camera.setScale = function (s) { // scale
		scale = s;
	};

	this.camera.circling = function (p, r, s) { // point, radius, speed
		if (!isDef(this.circlingAnglePointJS)) {
			this.circlingAnglePointJS = s;
		}
		offset.x = p.x + r * Math.cos(a2r(this.circlingAnglePointJS));
		offset.y = p.y + r * Math.sin(a2r(this.circlingAnglePointJS));
		this.circlingAnglePointJS = this.circlingAnglePointJS >= 360 ? s : this.circlingAnglePointJS + s;
	};

	this.camera.circlingC = function (p, r, s) { // point, radius, speed
		if (!isDef(this.circlingAnglePointJS)) {
			this.circlingAnglePointJS = s;
		}
		offset.x = -width2 + p.x + r * Math.cos(a2r(this.circlingAnglePointJS));
		offset.y = -height2 + p.y + r * Math.sin(a2r(this.circlingAnglePointJS));
		this.circlingAnglePointJS = this.circlingAnglePointJS >= 360 ? s : this.circlingAnglePointJS + s;
	};

	this.camera.motion = function (p, s, sp) { // point, size, speed
		if (!isDef(this.motionPercentPointJS)) {
			this.motionPercentPointJS = s;
		}
		offset.x = p.x + s.w * Math.cos(a2r(this.motionPercentPointJS));
		offset.y = p.y + s.h * Math.sin(a2r(this.motionPercentPointJS));
		this.motionPercentPointJS = this.motionPercentPointJS >= 360 ? s : this.motionPercentPointJS + sp;
	};

	this.camera.motionC = function (p, s, sp) { // point, size, speed
		if (!isDef(this.motionPercentPointJS)) {
			this.motionPercentPointJS = s;
		}
		this.setPositionC(point(p.x + s.w * Math.cos(a2r(this.motionPercentPointJS)), p.y + s.h * Math.sin(a2r(this.motionPercentPointJS))));
		this.motionPercentPointJS = this.motionPercentPointJS >= 360 ? s : this.motionPercentPointJS + sp;
	};

	this.camera.follow = function (obj) {
		this.moveTimeC(obj.getPositionC(), 10);
	};

	this.camera.move = function (p) {
		offset.x += p.x || 0;
		offset.y += p.y || 0;
	};

	this.camera.moveTime = function (p, t) {
		t = t || 1;
		var pos = point(offset.x, offset.y);
		this.move(point((p.x - pos.x) / t, (p.y - pos.y) / t));
	};

	this.camera.moveTimeC = function (p, t) {
		t = t || 1;
		var pos = point(offset.x + width2, offset.y + height2);
		this.move(point((p.x - pos.x) / t, (p.y - pos.y) / t));
	};

	this.camera.setPosition = function (p) {
		var dx = p.x !== false ? p.x : offset.x;
		var dy = p.y !== false ? p.y : offset.y;
		setOffset(point(dx, dy));
	};

	this.camera.setPositionC = function (p) {
		var dx = p.x !== false ? p.x - width2 : offset.x;
		var dy = p.y !== false ? p.y - height2 : offset.y;
		setOffset(point(dx, dy));
	};

	this.camera.getPosition = function (fmt) { // format
		if (!fmt)
			return point(offset.x, offset.y);
		else
			return point(offset.x + width2, offset.y + height2);
	};

	this.camera.getPositionC = function () {
		return point(offset.x + width2, offset.y + height2);
	};

	this.camera.getStaticBox = function () {
		return {
			x : offset.x,
			y : offset.y,
			w : offset.x + width,
			h : offset.y + height
		};
	};

	this.camera.getDynamicBox = function () {
		return [
			point(offset.x, offset.y),
			point(offset.x + width, offset.y),
			point(offset.x + width, offset.y + height),
			point(offset.x, offset.y + height),
		];
	};


	// end camera /////////////////////////////////////////























	// 2D /////////////////////////////////////////////////

	var setOffset = function (p) {
		offset = point(p.x, p.y);
	};

	var setSmooth = function () {
		context.mozImageSmoothingEnabled = isSmooth;
		context.msImageSmoothingEnabled = isSmooth;
		context.imageSmoothingEnabled = isSmooth;
	};

	var restoreContext = function (obj) {
		context.restore();

		context.globalAlpha = contextSettings.globalAlpha;
		context.fillStyle = nowFillStyle;
		context.strokeStyle = nowStrokeStyle;

		setSmooth();

	};

	var editContext = function (obj, box) {
		context.save();

		var p = obj.getPositionC();
		if (obj.angle) {
			context.translate(-offset.x + p.x, -offset.y + p.y);
			context.rotate(a2r(obj.angle));
			context.translate(-p.x + offset.x, -p.y + offset.y);
		}

		if (obj.alpha != 1) {
			context.globalAlpha = obj.alpha;
		}

		if (obj.flip.x || obj.flip.y) {
			context.translate(-offset.x + p.x, -offset.y + p.y);
			context.scale(obj.flip.x ? -1 : 1, obj.flip.y ? -1 : 1);
			context.translate(-p.x + offset.x, -p.y + offset.y);
		}

		if (obj.shadowColor) {
			context.shadowBlur = obj.shadowBlur;
			context.shadowColor = obj.shadowColor;
			context.shadowOffsetX = obj.shadowX;
			context.shadowOffsetY = obj.shadowY;
		}

		if (obj.type == 'EllipsObject' && !box) {
			var a = obj.w / 2,
				b = obj.h / 2,
				pos = point(-offset.x + obj.x, -offset.y + obj.y);

			context.translate(pos.x, pos.y);
			context.scale(a / b, 1);
			context.translate(-pos.x, -pos.y);
		}

	};

	this.system.setContextSettings = function (obj) {
		context.save();
		for (var i in obj) {
			context[i] = obj[i];
		}
	};

	this.system.defaultSettings = function () {
		restoreContext();
	};

	var clearContext = function (p, s) {
		context.clearRect(p.x, p.y, s.x, s.y);
	};

	this.game.clear = function () {
		clearContext(point(0, 0), point(width, height));
	};


	var fillContext = function (c) {
		setFillColor(c);
		context.fillRect(0, 0, width, height);
	};

	this.game.fill = function (c) {
		fillContext(c);
	};


	var drawPoly = function (points, fillColor) {
		if (points.length < 3) return;
		setFillColor(fillColor);
		var dx = -offset.x;
		var dy = -offset.y;
		var i;
		context.beginPath();
		context.moveTo(dx + points[0].x, dy + points[0].y);
		for (i = 1; i < points.length; i+= 1) {
			context.lineTo(dx + points[i].x, dy + points[i].y);
		}
		context.closePath();
		context.fill();
	};

	var drawPolyXY = function (x, y, points, fillColor) {
		if (points.length < 3) return;
		setFillColor(fillColor);
		var dx = -offset.x + x;
		var dy = -offset.y + y;
		var i;
		context.beginPath();
		context.moveTo(dx + points[0].x, dy + points[0].y);
		for (i = 1; i < points.length; i+= 1) {
			context.lineTo(dx + points[i].x, dy + points[i].y);
		}
		context.closePath();
		context.fill();
	};

	var drawPolygonXY = function (x, y, points, fillColor, strokeColor, strokeWidth, pointColor) {
		if (points.length < 3) return;
		var i, j;
		if (fillColor) {
			drawPolyXY(x, y, points, fillColor);
		}
		for (i = 0; i < points.length; i+= 1) {
			j = (i + 1) < points.length ? (i + 1) : 0;
			if (strokeColor) {
				drawLine(pointPlus(points[i], point(x, y)), pointPlus(points[j], point(x, y)), strokeColor, strokeWidth);
			}
			if (pointColor) {
				drawPoint(pointPlus(points[i], point(x, y)), pointColor);
			}
		}
	};

	var drawPolygon = function (points, fillColor, strokeColor, strokeWidth, pointColor) {
		if (points.length < 3) return;
		var i, j;
		if (fillColor) {
			drawPoly(points, fillColor);
		}
		for (i = 0; i < points.length; i+= 1) {
			j = (i + 1) < points.length ? (i + 1) : 0;
			if (strokeColor) {
				drawLine(points[i], points[j], strokeColor, strokeWidth);
			}
			if (pointColor) {
				drawPoint(points[i], pointColor);
			}
		}
	};
	this.brush.drawPolygon = function (obj) {
		drawPolygon(
			obj.points || [],
			obj.fillColor || false,
			obj.strokeColor || false,
			obj.strokeWidth || 1,
			obj.pointColor || false
		);
	};

	this.brush.drawTriangle = function (obj) {
		drawPolygonXY(
			obj.x || 0,
			obj.y || 0,
			[point(obj.w/2, 0), point(obj.w, obj.h), point(0, obj.h)],
			obj.fillColor,
			obj.strokeColor,
			obj.strokeWidth
		);
	};

	this.brush.drawTriangleS = function (obj) {
		drawPolygonXY(
			offset.x + (obj.x || 0),
			offset.y + (obj.y || 0),
			[point(obj.w/2, 0), point(obj.w, obj.h), point(0, obj.h)],
			obj.fillColor,
			obj.strokeColor,
			obj.strokeWidth
		);
	};

	var drawText = function (p, text, color, size, font, style, align, strokeColor, strokeWidth) {
		context.textAlign = align;
		context.lineWidth = strokeWidth;
		context.font = (style ? (style + ' ') : '') + size + 'px ' + font;
		var dx = -offset.x;
		var dy = -offset.y;
		if (color) {
			setFillColor(color);
			context.fillText(text, dx + p.x, dy + p.y);
		}
		if (strokeColor) {
			setStrokeColor(strokeColor);
			context.strokeText(text, dx + p.x, dy + p.y);
		}
	};

	this.brush.drawMultiText = function (obj) {
		var i, lines = obj.text.split('\n');
		for (i = 0; i < lines.length; i+= 1) {
			drawText(point(obj.x, obj.y + (obj.size * i)),
				lines[i],
				obj.color || contextSettings.fillStyle,
				obj.size  || 10,
				obj.font  || contextSettings.font,
				obj.style || false,
				obj.align || 'left',
				obj.strokeColor || false,
				obj.strokeWidth || 2);
		}
	};

	this.brush.drawMultiTextS = function (obj) {
		var i, lines = obj.text.split('\n');
		var size = obj.size || 10;
		for (i = 0; i < lines.length; i+= 1) {
			drawText(point(obj.x + offset.x, obj.y + offset.y + (size * i)),
				lines[i],
				obj.color || contextSettings.fillStyle,
				size      || 10,
				obj.font  || contextSettings.font,
				obj.style || false,
				obj.align || 'left',
				obj.strokeColor || false,
				obj.strokeWidth || 2);
		}
	};

	this.brush.drawText = function (obj) {
		drawText(point(obj.x || 0, obj.y || 0),
			obj.text,
			obj.color || false,
			obj.size || 10,
			obj.font || contextSettings.font,
			obj.style || false,
			obj.align || 'left',
			obj.strokeColor || false,
			obj.strokeWidth || 2);
	};

	this.brush.drawTextS = function (obj) {
		drawText(point((obj.x || 0) + offset.x, (obj.y || 0) + offset.y),
			obj.text,
			obj.color || contextSettings.fillStyle,
			obj.size || 10,
			obj.font || contextSettings.font,
			obj.style || false,
			obj.align || 'left',
			obj.strokeColor || false,
			obj.strokeWidth || 2);
	};

	this.brush.drawTextLines = function (obj) {
		if (!obj.lines) return;
		var i, size = obj.size || 10;
		for (i = 0; i < obj.lines.length; i+= 1) {
			drawText(point(obj.x, obj.y + (size * i)),
				obj.lines[i],
				obj.color || contextSettings.fillStyle,
				size,
				obj.font || contextSettings.font,
				obj.style || false,
				obj.align || 'left',
				obj.strokeColor || false,
				obj.strokeWidth || 2);
		}
	};

	this.brush.drawTextLinesS = function (obj) {
		if (!obj.lines) return;
		var i, size = obj.size || 10;
		for (i = 0; i < obj.lines.length; i+= 1) {
			drawText(point(obj.x + offset.x, obj.y + offset.y + (size * i)),
				obj.lines[i],
				obj.color || contextSettings.fillStyle,
				size,
				obj.font || contextSettings.font,
				obj.style || false,
				obj.align || 'left',
				obj.strokeColor || false,
				obj.strokeWidth || 2);
		}
	};

	var drawCenter = function (p, s, c) { // pos, size, color
		drawLine(point(p.x - s, p.y), point(p.x + s, p.y), c, 2);
		drawLine(point(p.x, p.y - s), point(p.x, p.y + s), c, 2);
	};

	var drawRect = function (p, s, fillColor, strokeColor, strokeWidth) {
		setFillColor(fillColor);
		setStrokeColor(strokeColor);
		context.lineWidth = strokeWidth;
		var dx = -offset.x + (strokeWidth ? strokeWidth / 2 : 0);
		var dy = -offset.y + (strokeWidth ? strokeWidth / 2 : 0);
		if (fillColor) {
			context.fillRect(p.x + dx, p.y + dy, s.w, s.h);
		}
		if (strokeWidth) {
			context.strokeRect(p.x + dx, p.y + dy, s.w, s.h);
		}
	};

	this.brush.drawRect = function (obj) {
		drawRect(point(obj.x, obj.y),
			size(obj.w, obj.h),
			obj.fillColor || false,
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || false);
	};

	this.brush.drawRectS = function (obj) {
		drawRect(point(obj.x + offset.x, obj.y + offset.y),
			size(obj.w, obj.h),
			obj.fillColor || false,
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || false);
	};

	var drawPoint = function (p, fillColor) {
		setFillColor(fillColor);
		if (fillColor) {
			context.fillRect(-offset.x + p.x - 1, -offset.y + p.y - 1, 2, 2);
		}
	};

	this.brush.drawPoint = function (obj) {
		drawPoint(point(obj.x, obj.y),
			obj.fillColor || false)
	};

	this.brush.drawPointS = function (obj) {
		drawPoint(point(obj.x + offset.x, obj.y + offset.y),
			obj.fillColor || false)
	};

	var drawRoundRect = function (p, s, r, fillColor, strokeColor, strokeWidth) {
		setFillColor(fillColor);
		setStrokeColor(strokeColor);
		context.lineWidth = strokeWidth;
		var x = -offset.x + p.x + (strokeWidth ? strokeWidth / 2 : 0);
		var y = -offset.y + p.y + (strokeWidth ? strokeWidth / 2 : 0);

		context.beginPath();
		context.moveTo(x+r, y);
		context.lineTo(x+s.w-r, y);
		context.quadraticCurveTo(x+s.w, y, x+s.w, y+r);
		context.lineTo(x+s.w, y+s.h-r);
		context.quadraticCurveTo(x+s.w, y+s.h, x+s.w-r, y+s.h);
		context.lineTo(x+r, y+s.h);
		context.quadraticCurveTo(x, y+s.h, x, y+s.h-r);
		context.lineTo(x, y+r);
		context.quadraticCurveTo(x, y, x+r, y);
		context.closePath();

		if (fillColor) {
			context.fill();
		}

		if (strokeWidth) {
			context.stroke();
		}
	};

	this.brush.drawRoundRect = function (obj) {
		drawRoundRect(point(obj.x, obj.y),
			size(obj.w, obj.h),
			obj.radius || 2,
			obj.fillColor || false,
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || false);
	};

	this.brush.drawRoundRectS = function (obj) {
		drawRoundRect(point(offset.x + obj.x, offset.y + obj.y),
			size(obj.w, obj.h),
			obj.radius || 2,
			obj.fillColor || false,
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || false);
	};

	var drawCircle = function (p, r, fillColor, strokeColor, strokeWidth) {
		setFillColor(fillColor);
		setStrokeColor(strokeColor);
		context.lineWidth = strokeWidth;
		var dx = -offset.x + r + (strokeWidth ? strokeWidth / 2 : 0);
		var dy = -offset.y + r + (strokeWidth ? strokeWidth / 2 : 0);
		context.beginPath();
		context.arc(p.x + dx, p.y + dy, r, 0, Math.PI * 2, true);
		context.closePath();
		if (fillColor) {
			context.fill();
		}
		if (strokeWidth) {
			context.stroke();
		}
	};

	this.brush.drawCircle = function (obj) {
		drawCircle(point(obj.x, obj.y),
			obj.radius,
			obj.fillColor || false,
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || false);
	};

	this.brush.drawCircleS = function (obj) {
		drawCircle(point(obj.x + offset.x, obj.y + offset.y),
			obj.radius,
			obj.fillColor || false,
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || false);
	};

	var drawLine = function (p1, p2, strokeColor, strokeWidth) {
		setStrokeColor(strokeColor);
		context.lineWidth = strokeWidth;
		var dx = -offset.x;
		var dy = -offset.y;
		context.beginPath();
		context.moveTo(dx + p1.x, dy + p1.y);
		context.lineTo(dx + p2.x, dy + p2.y);
		context.closePath();
		context.stroke();
	};
	this.brush.drawLineAngle = function (obj) {
		var pos = getPointAngle(point(obj.x + obj.length, obj.y), point(obj.x, obj.y), obj.angle);
		drawLine(point(obj.x, obj.y),
			point(pos.x, pos.y),
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || 1);
	};
	this.brush.drawLineAngleS = function (obj) {
		var pos = getPointAngle(point(offset.x + obj.x + obj.length, offset.y + obj.y), point(offset.x + obj.x, offset.y + obj.y), obj.angle);
		drawLine(point(offset.x + obj.x, offset.y + obj.y),
			point(pos.x, pos.y),
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || 1);
	};
	this.brush.drawLine = function (obj) {
		drawLine(point(obj.x1, obj.y1),
			point(obj.x1 + obj.x2, obj.y1 + obj.y2),
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || 1);
	};
	this.brush.drawLineS = function (obj) {
		drawLine(point(offset.x + obj.x1, offset.y + obj.y1),
			point(offset.x + obj.x2, offset.y + obj.y2),
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || 1);
	};

	this.brush.drawLineA = function (obj) {
		drawLine(point(obj.x1, obj.y1),
			point(obj.x2, obj.y2),
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || 1);
	};
	this.brush.drawLineAS = function (obj) {
		drawLine(point(obj.x1 + offset.x, obj.y1 + offset.y),
			point(obj.x2 + offset.x, obj.y2 + offset.y),
			obj.strokeColor || contextSettings.strokeStyle,
			obj.strokeWidth || 1);
	};

	this.brush.drawEllips = function (obj) {
		var a = obj.w / 2,
			b = obj.h / 2,
			pos = point(-offset.x + obj.x, -offset.y + obj.y);

		context.save();
		context.translate(pos.x, pos.y);
		context.scale(a / b, 1);
		context.translate(-pos.x, -pos.y);

		drawCircle(point(obj.x, obj.y), b, obj.fillColor, obj.strokeColor, obj.strokeWidth);

		context.restore();
	};

	this.brush.drawEllipsS = function (obj) {
		var a = obj.w / 2,
			b = obj.h / 2,
			pos = point(obj.x, obj.y);

		context.save();
		context.translate(pos.x, pos.y);
		context.scale(a / b, 1);
		context.translate(-pos.x, -pos.y);

		drawCircle(point(offset.x + obj.x, offset.y + obj.y), b, obj.fillColor, obj.strokeColor, obj.strokeWidth);

		context.restore();
	};

	this.brush.drawImageS = function (obj) {
		if (!obj.file) return;
		if (isDef(imageList[obj.file])) {
			if (!imageList[obj.file].loaded) return;
			var x = obj.x || 0;
			var y = obj.y || 0;
			var w, h;
			if (obj.w && !obj.h) {
				var dh = obj.w / imageList[obj.file].w;
				w = obj.w;
				h = imageList[obj.file].h * dh;
			} else if (!obj.w && obj.h) {
				var dh = obj.h / imageList[obj.file].h;
				h = obj.h;
				w = imageList[obj.file].w * dh;
			} else if (obj.w && obj.h) {
				w = obj.w;
				h = obj.h;
			} else {
				w = imageList[obj.file].w;
				h = imageList[obj.file].h;
			}
			if (obj.scale) {
				w *= obj.scale;
				h *= obj.scale;
			}
			context.drawImage(imageList[obj.file].img, 0, 0, imageList[obj.file].w, imageList[obj.file].h, x, y, w, h);
			return;
		}

		imageList[obj.file] = {
			loaded : false
		};
		var img = device.document.createElement('img');
		img.onload = function () {
			imageList[obj.file].loaded = true;
			imageList[obj.file].img = this;
			imageList[obj.file].w = this.width;
			imageList[obj.file].h = this.height;
			resources.load();
		}
		img.src = obj.file;
		resources.add();
	};

	this.brush.drawImage = function (obj) {
		if (!obj.file) return;

		if (isDef(imageList[obj.file])) {
			if (!imageList[obj.file].loaded) return;
			var x = obj.x || 0;
			var y = obj.y || 0;
			var w, h;
			if (obj.w && !obj.h) {
				var dh = obj.w / imageList[obj.file].w;
				w = obj.w;
				h = imageList[obj.file].h * dh;
			} else if (!obj.w && obj.h) {
				var dh = obj.h / imageList[obj.file].h;
				h = obj.h;
				w = imageList[obj.file].w * dh;
			} else if (obj.w && obj.h) {
				w = obj.w;
				h = obj.h;
			} else {
				w = imageList[obj.file].w;
				h = imageList[obj.file].h;
			}

			if (obj.scale) {
				w *= obj.scale;
				h *= obj.scale;
			}
			context.drawImage(imageList[obj.file].img, 0, 0, imageList[obj.file].w, imageList[obj.file].h, -offset.x + x, -offset.y + y, w, h);
			return;
		}

		imageList[obj.file] = {};
		imageList[obj.file].loaded = false;
		var img = device.document.createElement('img');
		img.onload = function () {
			imageList[obj.file].loaded = true;
			imageList[obj.file].img = this;
			imageList[obj.file].w = this.width;
			imageList[obj.file].h = this.height;
			resources.load();
		}
		img.src = obj.file;
		resources.add();
	};


	var getPixelColor = function (x, y) {
		var pixel = context.getImageData(x, y, 1, 1).data;
		return 'rgb(' + pixel[0] + ', ' + pixel[1] + ', ' + pixel[2] + ')';
	};

	var setPixelColor = function (x, y, pixel) {
		var data = context.createImageData(1, 1);
		data.data[0] = pixel.r || data.data[0];
		data.data[1] = pixel.g || data.data[1];
		data.data[2] = pixel.b || data.data[2];
		data.data[3] = pixel.a || 255;
		context.putImageData(data, x, y);
	};

	var onPixel = function (x, y, func) { // function (pixel)
		var data = context.getImageData(x, y, 1, 1);
		var pixel = {
			r : data.data[0],
			g : data.data[1],
			b : data.data[2],
			a : data.data[3] ? data.data[3] : 255
		};
		func(pixel);
		data.data[0] = pixel.r;
		data.data[1] = pixel.g;
		data.data[2] = pixel.b;
		data.data[3] = pixel.a;
		context.putImageData(data, x, y);
	};

	var onPixels = function (x, y, w, h, func) { // function (pixel)
		var data = context.getImageData(x, y, w, h);
		var i, len;
		for (i = 0, len = data.data.length; i < len; i += 4) {
			var pixel = {
				r : data.data[i],
				g : data.data[i + 1],
				b : data.data[i + 2],
				a : data.data[i + 3] ? data.data[i + 3] : 255
			};
			func(pixel);
			data.data[i] = pixel.r;
			data.data[i + 1] = pixel.g;
			data.data[i + 2] = pixel.b;
			data.data[i + 3] = pixel.a;
		}

		context.putImageData(data, x, y);
	};

	var onRawPixels = function (x, y, w, h, func) { // function (pixel)
		var data = context.getImageData(x, y, w, h);
		func(data.data, data.data.length); // data, count
		context.putImageData(data, x, y);
	};

	this.brush.onContext = function (func) {
		func(context);
	};

	this.brush.getPixelColor = getPixelColor;
	this.brush.setPixelColor = setPixelColor;
	this.brush.onPixel = onPixel;
	this.brush.onPixels = onPixels;
	this.brush.onRawPixels = onRawPixels;

	// end 2D /////////////////////////////////////////////


















	// web audio ////////////////////////////////////////////

	var wAudioList = {};

	var wAContext = device.AudioContext || device.webkitAudioContext || false;
	wAContext = wAContext ? new wAContext() : false;

	if (wAContext) {
		wAContext.listener.setPosition(0, 0, 0);
	}

	var WAudio = function (f, v) { // file, volume
		if (!wAContext) log('module "wAudio" is not supported! use a "audio"');

		this.vol = (v && v <= 1 && v > 0) ? v : 1;
		this.playing = false;
		this.loaded = false;
		this.nextPlay = false;
		this.loadPLay = false;

		this.startTime = 0;
		this.duration = 0;
		this.pausedTime = 0;

		var that = this;

		var xhr = new XMLHttpRequest();
		xhr.open('GET', f, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function (e) {
			wAContext.decodeAudioData(this.response, function (decodedArrayBuffer) {
				that.wABuffer = decodedArrayBuffer;
				that.duration = that.wABuffer.duration;
				that.wAGain = wAContext.createGain();
				that.wAGain.gain.value = that.vol;
				that.wAPanner = wAContext.createPanner();
				that.wAPanner.setPosition(0, 0, 1);
				that.wAPanner.panningModel = "equalpower";
				resources.load();
				that.loaded = true;
				if (that.loadPlay) {
					that.replay();
				}
			}, function (e) {
				log('error in wAudio.newAudio : error decoding file', e);
			});
		};
		if (f) {
			xhr.send();
		} else {
			log('error in wAudio.newAudio : Where is file?');
		}

		resources.add();

	};

	WAudio.prototype.play = function (v) {
		if (!this.loaded) {
			this.loadPlay = true;
			return;
		}
		if (this.playing) return;
		this.playing = true;
		this.wASource = wAContext.createBufferSource();
		this.wASource.buffer = this.wABuffer;
		this.wAListener = wAContext.destination;
		this.wASource.connect(this.wAGain);
		this.wAGain.connect(this.wAPanner);
		this.wAPanner.connect(this.wAListener);
		this.wASource.start(0, this.pausedTime, this.duration);

		this.startTime = wAContext.currentTime;

		var that = this;
		this.wASource.onended = function () {
			that.playing = false;
			that.startTime = 0;
			that.pausedTime = 0;
			if (that.nextPlay) {
				that.nextPlay.replay();
			}
		};

	};

	WAudio.prototype.replay = function (v) {
		if (!this.loaded) {
			this.loadPlay = true;
			return;
		}
		this.stop();
		this.play();
	};

	WAudio.prototype.stop = function () {
		this.pause();
		this.startTime = 0;
		this.pausedTime = 0;
	};

	WAudio.prototype.pause = function () {
		if (!this.playing) return;
		this.pausedTime = this.getProgress();
		this.playing = false;
		this.wASource.stop(0);
		var that = this;
		this.wASource.onended = function () {
			that.playing = false;
		};
	};

	WAudio.prototype.getProgress = function () {
		if (!this.playing) return this.pausedTime;
		return wAContext.currentTime - this.startTime + this.pausedTime;
	};

	WAudio.prototype.playPause = function () {
		if (!this.playing) this.play();
		else this.pause();
	};

	WAudio.prototype.setNextPlay = function (a) {
		this.nextPlay = a;
	};

	WAudio.prototype.setVolume = function (v) {
		this.vol = (v && v <= 1 && v > 0) ? v : this.vol;
		this.wAGain.gain.value = this.vol;
	};

	WAudio.prototype.getVolume = function () {
		return this.vol;
	};

	WAudio.prototype.setSide = function (s) { // side -1 .. 0 .. 1
		this.side = s;
		if (!this.wAPanner) return;
		this.wAPanner.setPosition(this.side, 0, 1 - Math.abs(this.side));
	};

	WAudio.prototype.getSide = function () {
		return this.side;
	};


	this.wAudio.newAudio = function (f, v) {
		return new WAudio(f, v);
	};

	// end web audio ////////////////////////////////////////
















	// audio ////////////////////////////////////////////

	var audioList = {};


	var Audio = function (f, v) { // file, volume
		var i, len;
		var audio = device.document.createElement('audio');
		if (typeof f == 'string') {
			var source = device.document.createElement('source');
			source.src = f;
			audio.appendChild(source);
		} else {
			for (i = 0, len = f.length; i < len; i+= 1) {
				var source = device.document.createElement('source');
				source.src = f[i];
				audio.appendChild(source);
			}
		}
		this.vol = (v && v <= 1 && v > 0) ? v : 1;
		this.playing = 0;
		this.audio = audio;
		this.loaded = false;
		this.nextPlay = false;

		this.audio.volume = this.vol;

		var that = this;

		this.audio.onloadeddata = function () {
			that.loaded = true;
			resources.load();
		};

		this.audio.onended = function () {
			var i;
			that.playing = false;
			if (that.nextPlay) {
				that.nextPlay.play();
			}
		};

		this.audio.load();
		resources.add();
	};

	Audio.prototype.play = function (v) {
		if (this.playing) return;
		if (v) {
			this.vol = (v && v <= 1 && v > 0) ? v : this.vol;
			this.audio.volume = this.vol;
		}
		this.playing = true;
		this.audio.play();
	};

	Audio.prototype.replay = function (v) {
		if (v) {
			this.setVolume(v);
		}
		this.playing = true;
		this.audio.currentTime = 0;
		this.audio.play();
	};

	Audio.prototype.stop = function () {
		if (!this.playing) return;
		this.playing = false;
		this.audio.pause();
		this.audio.currentTime = 0;
	};

	Audio.prototype.pause = function () {
		if (!this.playing) return;
		this.playing = false;
		this.audio.pause();
	};

	Audio.prototype.playPause = function () {
		if (!this.playing) this.play();
		else this.pause();
	};

	Audio.prototype.setNextPlay = function (a) {
		this.nextPlay = a;
	};

	Audio.prototype.setVolume = function (v) {
		this.vol = (v && v <= 1 && v > 0) ? v : this.vol;
		this.audio.volume = this.vol;
	};

	Audio.prototype.getVolume = function () {
		return this.vol;
	};

	this.audio.newAudio = function (f, v) {
		return new Audio(f, v);
	};

	// end audio ////////////////////////////////////////













	// zIndex ////////////////////////////////////////////

	var zList = [];

	this.zList.add = function (obj) {
		zList.push(obj);
	};

	this.zList.init = function (arr) {
		OOP.forArr(arr, function (el) {
			_PointJS.zList.add(el);
		});
	};

	this.zList.update = function () {
		zList.sort(function (A, B) {
			return (A.y + A.h) - (B.y + B.h);
		});
	};

	this.zList.draw = function (onDraw) {
		OOP.drawArr(zList, onDraw);
	};

	this.zList.del = function (obj) {
		OOP.delObject(zList, obj);
	};

	// end zIndex ////////////////////////////////////////











	// resources ////////////////////////////////////////

	var resources = {
		count : 0,
		loaded : 0,
		errored : 0,

		add : function () {
			this.count += 1;
		},

		load : function () {
			this.loaded += 1;
		},

		error : function () {
			this.errored += 1;
		}

	};

	var isLoaded = function () {
		return resources.count == resources.loaded;
	};

	var getProgress = function () {
		return Math.ceil(resources.loaded / resources.count * 100);
	};

	this.resources.isLoaded = isLoaded;
	this.resources.getProgress = getProgress;

	// end resources ////////////////////////////////////








	// levels ///////////////////////////////////////////

	this.levels.forStringArray = function (obj, onsymbol) {
		var offset = obj.offset || point(0, 0);
		forArr(obj.source, function (string, Y) {
			forArr(string, function (symbol, X) {
				if (symbol == ' ') return;
				onsymbol(symbol, offset.x+obj.w*X, offset.y+obj.h*Y, obj.w, obj.h);
			});
		});
	};

	var createObject = function (el) {

		if (el.type == 'ImageObject' && typeof RESOURCES != 'undefined' && el.resFile) {
			el.file = RESOURCES[el.resFile];
		}

		if (el.type == 'AnimationObject' && typeof ANIMATIONS != 'undefined' && el.animId) {
			el.anim = ANIMATIONS[el.animId];
		}


		var cl = newObjectFromType(el);

		cl.name = '';

		forEach(el, function (val, key) {
			if (key == 'id') return;
			cl[key] = val;
		});

		return cl;
	};

	var loadLevelAsJSON = function (data, onCreate) {
		var lvl = {
			settings : {},
			objects : []
		};
		data = JSON.parse(data);

		lvl.settings = data.settings;

		forArr(data.objects, function (el) {
			var tmp = createObject(el);
			tmp.name = el.name;
			if (onCreate) {
				onCreate(tmp);
			}
			lvl.objects.push(tmp);
		});
		return lvl;
	};

	var Level = function (data, type, onCreate) {
		var lvl = [], settings = {};
		var origData;

		if (data && type == 'json') {
			var parseJSON = loadLevelAsJSON(data, onCreate);
			lvl = parseJSON.objects;
			settings = parseJSON.settings;
			origData = data;
		}

		this.backgroundColor = settings.backgroundColor ? settings.backgroundColor : false;

		this.reload = function () {
			lvl = loadLevelAsJSON(origData);
		};

		this.clear = function () {
			clearArr(lvl);
		};

		this.add = function (obj) {
			lvl.push(obj);
		};

		this.del = function (obj) {
			forArr(lvl, function (el, i) {
				if (obj.id == el.id) {
					lvl.splice(i, 1);
					return 'break';
				}
			});
		};

		this.delById = function (id) {
			lvl.splice(id, 1);
		};

		this.getObjects = function () {
			return lvl;
		};

		this.getObjectByName = function (name) {
			var i, len;
			for (i = 0, len = lvl.length; i < len; i+= 1) {
				if (lvl[i].name == name) {
					return lvl[i];
				}
			}

			return false;
		};

		this.getObjectById = function (id) {
			var i, len;
			for (i = 0, len = lvl.length; i < len; i+= 1) {
				if (lvl[i].id == id) {
					return lvl[i];
				}
			}

			return false;
		};

		this.draw = function (ondrawFunction) {
			if (this.backgroundColor) {
				_PointJS.game.fill(this.backgroundColor);
			}
			forArr(lvl, function (el) {
				if (ondrawFunction) {
					ondrawFunction(el);
				}
				el.draw();
			});
		};

		this.getLevelAsJSON = function (onGet, onSet) {
			var settings = JSON.stringify({
				backgroundColor : this.backgroundColor
			});

			var json = '{"settings":'+settings+',"objects":[';

			if (!lvl.length) {
				return json+']}';
			}

			forArr(lvl, function (el, i) {
				if (onGet) {
					onGet(el);
				}
				json += '{';
				forEach(el, function (val, key) {
					if (typeof val == 'function') {
						return;
					}
					json += '"'+key+'":'+JSON.stringify(val)+',';
				});
				json = json.substr(0, json.length - 1) + '},';
				if (onSet) {
					onSet(el);
				}
			});

			json = json.substr(0, json.length - 1);

			return json + ']}';

		};

	};

	this.levels.newLevelFromJSON = function (json, onCreate) {
		var level = new Level(json, 'json', onCreate || false);

		return level;
	};

	this.levels.newEmptyLevel = function (json) {
		var level = new Level(false);

		return level;
	};

	// end levels ///////////////////////////////////////























	// get FPS ////////////////////////////////////////////

	var fpsChecker = {
		fps : 0,
		time : 0,
		tmpFps : 0
	};

	var fpsUpdate = function () {
		fpsChecker.tmpFps += 1;
		if (time - fpsChecker.time >= 1000) {
			fpsChecker.fps = fpsChecker.tmpFps;
			fpsChecker.tmpFps = 0;
			fpsChecker.time = time;
		}
	};

	var initedFPSCheck = false;
	this.system.initFPSCheck = function () {
		if (initedFPSCheck) return;

		initedFPSCheck = true;

		dom.addEvent('postLoop', 'fpsCheckUpdate', function () {
			fpsUpdate();
		});
	};

	this.system.getFPS = function () {
		return fpsChecker.fps;
	};

	// end get FPS ////////////////////////////////////////












	// functions ////////////////////////////////////////////

	this.OOP.newRever = function (min, max, step) {
		var Rever = function (min, max, step) {
			this.min = min;
			this.max = max;
			this.step = step;
			this.value = min;
			this.to = step;
		};

		Rever.prototype = {
			update : function () {
				var old = this.value;
				if (this.value <= this.min)
					this.to = this.step;
				else if (this.value >= this.max)
					this.to = -this.step;

				this.value += this.to;
				return old;
			},

			getValue : function () {
				return this.value;
			},

			setValue : function (val) {
				this.value = parseFloat(val);
			},

			setStep : function (val) {
				this.step = val;
			},

			getStep : function () {
				return this.step;
			}

		};
		return new Rever(min, max, step);
	};

	var functionList = {};
	this.OOP.once = function (key, func) { // key, function
		if (functionList[key]) return;
		functionList[key] = true;
		func();
	};

	this.OOP.newTimer = function (t, f) { // time mls, function
		if (t <= 0) return stop('error in system.newTimer : variable < 0, Timer is not created');

		var tmp = {
			time : t > 0 ? t : 1000,
			func : f,
			startTime : false,
			ending : false,

			start : function () {
				if (this.ending) return;
				if (!this.startTime)
					this.startTime = time;
			},

			run : function () {
				if (this.ending || !this.startTime) return;
				if (time - this.startTime >= this.time) {
					this.func();
					this.ending = true;
				}
			},

			end : function () {
				if (this.ending) return;
				this.ending = true;
				this.func();
			},

			restart : function (newTime) {
				if (!this.startTime) this.start();
				if (!this.ending) return;

				if (newTime && newTime <= 0)
					return stop('error in Timer.restart : variable < 0');
				else if (newTime)
					this.time = newTime;

				this.ending = false;
				this.startTime = time;
			},

			stop : function () {
				if (this.ending) return;
				this.ending = true;
			}

		};

		dom.addEvent('postLoop', 'timer' + (random(-100, 100) * random(-100, 100)) + time, function () {
			tmp.run();
		});

		return tmp;
	};


	// end functions ////////////////////////////////////////











	// memory ///////////////////////////////////////////////

	this.memory.local = {
		storage : device.localStorage,

		clear : function () {
			this.storage.clear();
		},

		save : function (key, val) {
			this.storage.setItem(key, val);
		},

		saveAsObject : function (key, obj) {
			var tmp = JSON.stringify(obj);
			this.storage.setItem(key, tmp);
		},

		loadAsObject : function (key) {
			return JSON.parse(this.storage.getItem(key));
		},

		load : function (key) {
			return this.storage.getItem(key);
		},

		loadAsNumber : function (key) {
			return parseFloat(this.storage.getItem(key));
		},
	};

	this.memory.temp = {
		values : {},

		save : function (key, val) {
			this.values[key] = val;
		},

		load : function (key) {
			return this.values[key];
		},

		loadAsNumber : function (key) {
			return parseFloat(this.values[key]);
		}

	};



	// end memory ///////////////////////////////////////////





















	// system //////////////////////////////////////////////
	device.onload = function () {
		var i;
		for (i in contextSettings) {
			context[i] = contextSettings[i];
		}

		context.save();

		dom.runEvent('onload');
		dom.loaded = true;

		if (typeof POINTJS_USER_ONLOAD == 'function') {
			POINTJS_USER_ONLOAD();
		}

		return false;
	};

	device.onblur = function () {
		if (!isRun) return;
		dom.runEvent('gameBlur');
		return false;
	};

	device.onfocus = function () {
		if (isRun) return;
		device.document.activeElement.blur();
		device.focus();
		dom.runEvent('gameFocus');
		return false;
	};

	device.onresize = function () {
		dom.runEvent('gameResize');
		context.textBaseline = contextSettings.textBaseline;
		return false;
	};

	device.onclick = function () {
		device.document.activeElement.blur();
		device.focus();
	};


	if (typeof POINTJS_LOADED_DOM_IGNORE !== 'undefined') {
		device.onload();
	}


	// end system //////////////////////////////////////////


};