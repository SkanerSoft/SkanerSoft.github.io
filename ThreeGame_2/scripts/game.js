const game = new function () {
	const game = this;
	let scene, renderer, camera,
		keys = {},
		events = {
			'keydown' : null,
			'keypress' : null,
			'keyup' : null,
		};

	const v = this.v = (x, y, z) => {
		return new THREE.Vector3(x, y, z);
	};

	game.on = (event_name, processor) => {
		events[event_name] = processor;
	};

	const call_event = (evt, args) => {
		if (events[evt])
			events[evt](args);
	};

	const addCube = this.addCube = (conf) => {
		let cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({
				color : conf.color
			}
		));
		cube.position.copy(conf.position);
		scene.add(cube);
		return cube;
	};

	game.getCamera = () => {
		return camera;
	};

	const animate = this.animate = () => {
		call_event('keydown', keys);

		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	};

	this.init = () => {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);

		window.addEventListener('keydown', (e) => {
			if (!keys[e.code]) {
				keys[e.code] = true;
				call_event('keypress', keys);
			}
		});

		window.addEventListener('keyup', (e) => {
			keys[e.code] = false;
			call_event('keyup', keys);
		});

		document.body.appendChild(renderer.domElement);
		animate();
	};
};