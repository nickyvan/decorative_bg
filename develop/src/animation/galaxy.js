import * as THREE from 'three';
import { TweenMax, Power0 } from 'gsap';
class galaxy {
	constructor() {
		this.canvas = document.querySelector('canvas');
		this.width = this.canvas.offsetWidth;
		this.height = this.canvas.offsetHeight;
		this.colors = [
			new THREE.Color(0xac1122),
			new THREE.Color(0x96789f),
			new THREE.Color(0x535353)
		];
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		});
		this.renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
		this.renderer.setSize(this.width, this.height);
		this.renderer.setClearColor(0x000000);

		this.scene = new THREE.Scene();
		// raycasting assits for mouse picking
		this.raycaster = new THREE.Raycaster();
		// threshold should be smaller than your point size
		this.raycaster.params.Points.threshold = 5;
		this.camera = new THREE.PerspectiveCamera(
			50,
			this.width / this.height,
			0.1,
			2000
		);
		// // group contains your points
		// this.galaxygroup = new THREE.Group();
		// this.scene.add(this.galaxygroup);
    let loader = new THREE.TextureLoader();
		loader.crossOrigin = '';
		loader.load('/texture/dotTexture.png',(texture)=>{
			this.dotTexture = texture;
			this.createDots();
			requestAnimationFrame(this.render);
		});
		
	
		// window.addEventListener('resize', function() {
		// 	// resizeTm = clearTimeout(resizeTm);
		// 	// resizeTm = setTimeout(onResize, 200);
		// });
	}
	createDots = () => {
		
		let dotsAmount = 3000;
		this.dotsGeometry = new THREE.Geometry();
		// use Float32Array for reducing better performance
		this.positions = new Float32Array(dotsAmount * 3);

		this.sizes = new Float32Array(dotsAmount);
		this.colorsAttribute = new Float32Array(dotsAmount * 3);
		// random point position on sphere with sphere point picking.
		for (let i = 0; i < dotsAmount; i++) {
			let vector = new THREE.Vector3();

			vector.color = Math.floor(Math.random() * this.colors.length);
			vector.theta = Math.random() * Math.PI * 2;
			vector.phi =
				(((1 - Math.sqrt(Math.random())) * Math.PI) / 2) *
				(Math.random() > 0.5 ? 1 : -1);

			vector.x = Math.cos(vector.theta) * Math.cos(vector.phi);
			vector.y = Math.sin(vector.phi);
			vector.z = Math.sin(vector.theta) * Math.cos(vector.phi);
			// radius is 120 and add some random
			vector.multiplyScalar(120 + (Math.random() - 0.5) * 5);
			vector.scaleX = 5;

			if (Math.random() > 0.5) {
				this.moveDot(vector, i);
			}
			this.dotsGeometry.vertices.push(vector);
			vector.toArray(this.positions, i * 3);
			this.colors[vector.color].toArray(this.colorsAttribute, i * 3);
			this.sizes[i] = 5;
		}

		this.bufferWrapGeom = new THREE.BufferGeometry();
		this.attributePositions = new THREE.BufferAttribute(this.positions, 3);
		this.attributeSizes = new THREE.BufferAttribute(this.sizes, 1);
		this.attributeColors = new THREE.BufferAttribute(
			this.colorsAttribute,
			3
		);

		this.bufferWrapGeom.addAttribute('position', this.attributePositions);
		this.bufferWrapGeom.addAttribute('size', this.attributeSizes);
		this.bufferWrapGeom.addAttribute('color', this.attributeColors);
		this.shaderMaterial = new THREE.ShaderMaterial({
			uniforms: {
				texture: {
					value: this.dotTexture
				}
			},
			vertexShader: `attribute float size;
			attribute vec3 color;
			varying vec3 vColor;
			void main() {
				vColor = color;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_PointSize = size * ( 350.0 / - mvPosition.z );
				gl_Position = projectionMatrix * mvPosition;
			}
		`,
			fragmentShader: `
			varying vec3 vColor;
			uniform sampler2D texture;
			void main(){
				vec4 textureColor = texture2D( texture, gl_PointCoord );
				if ( textureColor.a < 0.3 ) discard;
				vec4 color = vec4(vColor.xyz, 1.0) * textureColor;
				gl_FragColor = color;
			}`,
			transparent: true
		});

		this.wrap = new THREE.Points(this.bufferWrapGeom, this.shaderMaterial);
    this.scene.add(this.wrap);
	};

	moveDot = (vector, index) => {
		var tempVector = vector.clone();
		tempVector.multiplyScalar((Math.random() - 0.5) * 0.2 + 1);
		TweenMax.to(vector, Math.random() * 3 + 3, {
			x: tempVector.x,
			y: tempVector.y,
			z: tempVector.z,
			yoyo: true,
			repeat: -1,
			delay: -Math.random() * 3,
			ease: Power0.easeNone,
			onUpdate: ()=> {
				this.attributePositions.array[index * 3] = vector.x;
				this.attributePositions.array[index * 3 + 1] = vector.y;
				this.attributePositions.array[index * 3 + 2] = vector.z;
			}
		});
	};
	onResize = () => {
		this.canvas.style.width = '';
		this.canvas.style.height = '';
		let width = this.canvas.offsetWidth;
		let height = this.canvas.offsetHeight;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	};
	// render everything
	render = () => {
		// let i;
		this.dotsGeometry.verticesNeedUpdate = true;
		// this.segmentsGeom.verticesNeedUpdate = true;

		// this.raycaster.setFromCamera(this.mouse, this.camera);
		// var intersections = raycaster.intersectObjects([wrap]);
		// hovered = [];
		// if (intersections.length) {
		// 	for (i = 0; i < intersections.length; i++) {
		// 		var index = intersections[i].index;
		// 		hovered.push(index);
		// 		if (prevHovered.indexOf(index) === -1) {
		// 			onDotHover(index);
		// 		}
		// 	}
		// }
		// for (i = 0; i < prevHovered.length; i++) {
		// 	if (hovered.indexOf(prevHovered[i]) === -1) {
		// 		mouseOut(prevHovered[i]);
		// 	}
		// }
		// prevHovered = hovered.slice(0);
		this.attributeSizes.needsUpdate = true;
		this.attributePositions.needsUpdate = true;
		this.renderer.render(this.scene, this.camera);
	};
}

export default galaxy;
