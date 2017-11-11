// Particles Module
Module.constructor = function (pjs) {
	'use strict';

	const M = pjs.math;
	const particles = [];
	const limit = 200;
	const updateParticles = function () {
		let i = particles.length - 1;
		for(; i>=0; i--) {
			particles[i].draw();
			if (particles[i].isExit() || particles[i].alpha <= 0 || particles.length > limit) {
				particles.splice(i, 1);
			}
		}
	};

	class Particle {

		constructor (x, y, clr, size, speed, max, isAlpha) {
			speed *= 100;
			this.dx = M.random(-speed, speed, true) / 100;
			this.dy = M.random(-speed, speed, true) / 100;
			this.startX = this.x = x + M.random(-speed, speed) / 100;
			this.startY = this.y = y + M.random(-speed, speed) / 100;
			this.color = clr;
			this.radius = size;
			this.max = max || 100;
			this.isAlpha = isAlpha;
			this.alpha = 1;
		}

		isExit () {
			return Math.sqrt(Math.pow(this.startX - this.x, 2) + Math.pow(this.startY - this.y, 2)) > this.max;
		}

		getDist () {
			return Math.sqrt(Math.pow(this.startX - this.x, 2) + Math.pow(this.startY - this.y, 2));
		}

		draw () {
			this.x += this.dx * pjs.game.getDT(10);
			this.y += this.dy * pjs.game.getDT(10);

			if (this.isAlpha) {
				this.alpha -= 1 / this.max;
			}

			pjs.brush.drawCircle({
				x : this.x - this.radius, y : this.y - this.radius,
				radius : this.radius,
				fillColor : pjs.colors.hex2rgba(this.color, this.alpha)
			});
		}

	}

	pjs.OOP.addParticle = function (pos, size, color, speed, den, max, isAlpha) {
		// if (particles.length > limit) return;
		if (den) {
			let i = den;
			for (; i>=0; i--) {
				particles.push(new Particle(pos.x || 0, pos.y || 0, color, size, speed || 10, max || 10, isAlpha || 0));
			}
		} else
			particles.push(new Particle(pos.x || 0, pos.y || 0, color, size, speed || 10, max || 10, isAlpha || 0));
	};

	pjs.system.addEvent('postLoop', 'updateParticles', function () {
		updateParticles();
		pjs.brush.drawTextS({
			text : 'Particles: ' + particles.length,
			size : 30, color : 'white'
		});
	});

};
