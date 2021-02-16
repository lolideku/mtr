function addLights(scene) {
	const sun = new THREE.DirectionalLight(0xffffff, 1.0);
	sun.position.set(1, 2, 2);
	sun.castShadow = true;
	sun.shadow.camera.near = 0.05;
	sun.shadow.camera.far = 5;
	sun.shadow.normalBias = 0.05;
	scene.add(sun);

	const bounce = new THREE.DirectionalLight(0xffffff, 0.2);
	bounce.position.set(-3, -2, 1);
	scene.add(bounce);

	const bounce2 = new THREE.DirectionalLight(0xffffff, 0.1);
	bounce2.position.set(2, -3, 1);
	scene.add(bounce2);
}

function makeScene(parent, modelPath) {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(25, 242 / 290, 0.1, 100);

	const renderer = new THREE.WebGLRenderer({ 'antialias': true });
	renderer.setSize(242, 290);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	parent.appendChild(renderer.domElement);

	const loader = new THREE.GLTFLoader();

	var banditMixer;
	var banditIdle;
	var banditActive;
	loader.load(modelPath, function (gltf) {
		var bandit = gltf;

		bandit.scene.traverse(function(node) {
			if (node.isMesh) {
				node.castShadow = true;
				node.receiveShadow = true;
			}
		});
		scene.add(bandit.scene);

		clipIdle = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
		clipActive = THREE.AnimationClip.findByName(gltf.animations, 'Active');

		if (clipIdle) {
			banditMixer = new THREE.AnimationMixer(bandit.scene);
			banditIdle = banditMixer.clipAction(clipIdle);
			if (clipActive)
			{
				banditActive = banditMixer.clipAction(clipActive);
				banditActive.loop = THREE.LoopOnce;	
			}

			banditIdle.play();
		}
	}, undefined, function (error) {
		console.error(error);
	});

	camera.position.set(0, 1.15, 5.8);

	addLights(scene);

	var prev_t = 0;
	function animate(t) {
		requestAnimationFrame(animate);

		const dt = (t - prev_t) / 1000.0;
		prev_t = t;

		if (banditMixer) {
			banditMixer.update(dt);

			if (banditActive && banditActive.time + 0.25 >= banditActive.getClip().duration && banditActive.getEffectiveWeight() == 1.0) {
				banditActive.crossFadeTo(banditIdle.reset().play(), 0.25);
			}
		}

		renderer.render(scene, camera);
	};

	requestAnimationFrame(animate);

	renderer.domElement.onclick = function () {
		if (banditActive) {
			banditIdle.crossFadeTo(banditActive.reset().play(), 0.25);
		}
	}
}

function main() {
	const renderers = document.getElementsByClassName('renderer');

	for (var i = 0; i < renderers.length; i++) {
		const div = renderers[i];
		makeScene(div, div.dataset.model);
	}
}

main();
