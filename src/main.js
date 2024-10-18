import { Water } from "/src/three.js-master/examples/jsm/objects/Water.js";
import { Sky } from "/src/three.js-master/examples/jsm/objects/Sky.js";

document.addEventListener("DOMContentLoaded", function() {
    init();
    animate();
});

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

let scene;
let camera;
let renderer;
let cube;
let pointLight;
let ambientLight;

let water, sun;


var maxAngle = 0;
var minAngle = 100;


const cameraPosition = [30, 20, 100];

let boat1 = new THREE.Group();
let boat2 = new THREE.Group();
let boat3 = new THREE.Group();

var boatList = [];

let boatSpeed = 0.1; // Adjust this value to control the boat's speed
let boatDirection = new THREE.Vector3(0, 0, 1); // The forward direction of the boat

const textureLoader = new THREE.TextureLoader();

const woodTexture1 = textureLoader.load('textures/wood1.jpg');
const woodTexture2 = textureLoader.load('textures/wood2.jpg');
const woodTexture3 = textureLoader.load('textures/wood3.jpg');
const sailTexture = textureLoader.load('textures/sail2.jpg');

let isMovingForward = false;
let isMovingBackward = false;
let isTurningLeft = false;
let isTurningRight = false;



function init() {

    window.addEventListener('resize', onWindowResize);

    scene = new THREE.Scene();

    // const axesHelper = new THREE.AxesHelper(10);
    // scene.add(axesHelper); 

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

    camera.lookAt(0, 0, 0);

    ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    boat1 = new THREE.Group();
    boat2 = new THREE.Group();
    boat3 = new THREE.Group();

    boat1 = new Boat(boatSpeed * 2, boatDirection, new THREE.Vector3(0, 0, -20), 1);

    boat2 = new Boat(boatSpeed, boatDirection, new THREE.Vector3(0, 0, 0), 1);

    boat3 = new Boat(boatSpeed * 0.75, boatDirection, new THREE.Vector3(0, 0, 20), 1);

    boatList.push(boat1);
    boatList.push(boat2);
    boatList.push(boat3);

    scene.add(boat1.boat);
    scene.add(boat2.boat);
    scene.add(boat3.boat);



    // Water and Sky Code from three.js examples
    const waterAndSky = createWaterAndSky();
    scene.add(waterAndSky);
    ////////////////////////////////////////////

}

// Water and Sky Code from three.js examples
function createWaterAndSky() {

    const waterAndSky = new THREE.Group();

    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }
            ),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined,
        }
    );

    water.position.y = -1.5;

    water.rotation.x = -Math.PI / 2;

    waterAndSky.add(water);

    sun = new THREE.Vector3();

    const sky = new Sky();
    sky.scale.setScalar(10000);
    waterAndSky.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const parameters = {
        elevation: 0.0,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun() {
            
            const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
            const theta = THREE.MathUtils.degToRad(parameters.azimuth);
    
            sun.setFromSphericalCoords(1, phi, theta);
    
            sky.material.uniforms['sunPosition'].value.copy(sun);
            water.material.uniforms['sunDirection'].value.copy(sun).normalize();
    
            scene.environment = pmremGenerator.fromScene(sky).texture;
    
        }

    updateSun(); 

    return waterAndSky;
}

class Boat {
    constructor(boatSpeed, boatDirection, boatPosition, boatScale) {
        this.position = boatPosition;
        this.speed = boatSpeed;
        this.direction = boatDirection;
        this.scale = boatScale;
        this.boat = new THREE.Group();
        this.mastGroup = new THREE.Group();
        this.forwardDirection = new THREE.Vector3(0, 0, 1);
        
        this.createBoat();
    }

    createBoat() {
        //Create a sailboat hull using laythe geometry
    
        const hull = createHullHelper();
        this.boat.add( hull ); 

        const deck = createDeckHelper();

        this.boat.add(deck);

        const bumpers = createBumpersHelper();

        this.boat.add(bumpers);

        const supports = createSupportsHelper();

        this.boat.add(supports);

        //Create Mast
        const mast = createMast();

        // Create Boom

        const boom = createBoom();

        const mainSail = createMainSail();

        this.mastGroup.add(mast);

        this.mastGroup.add(boom);

        this.mastGroup.add(mainSail);

        this.mastGroup.position.y = 1;

        this.boat.add(this.mastGroup);

        this.boat.rotation.x = -Math.PI/2;

        this.boat.rotation.z = Math.PI;

        this.boat.position.copy(this.position);
    }

    changeSailDirection(degrees) {

        const degreesNormalized = degrees / 2;

        var calculatedDegrees = 0;

        if(degreesNormalized < 0) {
            calculatedDegrees = (Math.PI/2) + degreesNormalized;
        }
        else if(degreesNormalized > 0) {
            calculatedDegrees = degreesNormalized - (Math.PI/2);
        }

        this.mastGroup.rotation.set(0, 0, calculatedDegrees);
    }

    turnBoat(degrees) {

        this.boat.rotateZ(degrees);
        this.forwardDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), degrees);
               

        const cameraDirection = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), camera.position).normalize();

        const angleDifference = getAngleBetweenVectors(cameraDirection, this.forwardDirection);

        this.changeSailDirection(angleDifference);
    }

    update(){
        if (isMovingForward) {
            this.boat.position.add(this.forwardDirection.clone().multiplyScalar(this.speed));        
        }
        if (isMovingBackward) {
            const backwardVector = this.forwardDirection.clone().multiplyScalar(-(this.speed));
            this.boat.position.add(backwardVector);
        }
        if (isTurningLeft) {
          this.turnBoat(0.01); // Adjust the turning angle as needed
        }
        if (isTurningRight) {
          this.turnBoat(-0.01); // Adjust the turning angle as needed
        }
    }

}

function getAngleBetweenVectors(vector1, vector2) {
    const vector1Projection = new THREE.Vector3(vector1.x, 0, vector1.z).normalize();
    const vector2Projection = new THREE.Vector3(vector2.x, 0, vector2.z).normalize();

    const angle = vector1Projection.angleTo(vector2Projection);

    const crossProduct = new THREE.Vector3().crossVectors(vector2Projection, vector1Projection);

    // console.log(crossProduct.y);

    const sign = Math.sign(crossProduct.y);

    // console.log(sign);

    return (angle) * sign;
}

function createHullHelper() {
    const startPoints = [
        new THREE.Vector2(0, 5),
        new THREE.Vector2(3, 1),
        new THREE.Vector2(3, -5),
        new THREE.Vector2(0, -5),
    ];
    
    const hull = createHull(startPoints);

    return hull;
}

function createDeckHelper() {
    // Create deck of hull

    const topEdgeCurvePoints1 = [
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(3, 1, 0),
        new THREE.Vector3(3, -5, 0),
    ];

    const topEdgeCurvePoints2 = [
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(-3, 1, 0),
        new THREE.Vector3(-3, -5, 0),
    ];

    const flatPoints1 = [
        new THREE.Vector3(3, -5, 0),
        new THREE.Vector3(0, -5, 0),
        new THREE.Vector3(0, 5, 0),
    ]

    const flatPoints2 = [
        new THREE.Vector3(-3, -5, 0),
        new THREE.Vector3(0, -5, 0),
        new THREE.Vector3(0, 5, 0),
    ]

    const deck = createDeck(topEdgeCurvePoints1, topEdgeCurvePoints2, flatPoints1, flatPoints2);

    return deck;
}

function createBumpersHelper() {

    const curvePoints = [
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(3, 1, 0),
        new THREE.Vector3(3, -5, 0),
    ];
     
    const curvePoints2 = [
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(-3, 1, 0),
        new THREE.Vector3(-3, -5, 0),
    ];

    const plank1 = createBoard(curvePoints);
    const plank2 = createBoard(curvePoints2);

    const bumperGroup = new THREE.Group();

    bumperGroup.add(plank1);
    bumperGroup.add(plank2);

    return bumperGroup;

}

function createSupportsHelper() {

    const supportsGroup = new THREE.Group();

    //Create Forestay

    const boatBowInitial = new THREE.Vector3(0, 5, 0);
    const forestayTop = new THREE.Vector3(0, 1, 7);

    const forestay = createShroud(boatBowInitial, forestayTop);
    supportsGroup.add(forestay);
    
    // Create Shrouds

    const mastTopInitial = new THREE.Vector3(0, 1, 8);

    const shroudRightBase = new THREE.Vector3(3, 1, 0);

    const shroud1 = createShroud(shroudRightBase, mastTopInitial);

    supportsGroup.add(shroud1);

    const shroudLeftBase = new THREE.Vector3(-3, 1, 0);

    const shroud2 = createShroud(shroudLeftBase, mastTopInitial);

    supportsGroup.add(shroud2);

    return supportsGroup;
}

var j = 0;

const DeckUVGenerator = {
    generateTopUV: function (geometry, vertices, indexA, indexB, indexC) {

        // if(j < 5) {
        //     console.log(vertices)
        //     console.log("index A", indexA)
        //     indexA = indexA * 3;
        //     console.log(indexA)
        //     console.log("index B", indexB)
        //     indexB = indexB * 3;
        //     console.log(indexB)
        //     console.log("index C",indexC)
        //     indexC = indexC * 3;
        //     console.log(indexC)
        //     j++;
        // }

        indexA = indexA * 3;
        indexB = indexB * 3;
        indexC = indexC * 3;

        // Find the position of the current vertex in the range [0, 1]
        const position = (index) => (index - startCurveIndex) / (endCurveIndex - startCurveIndex);
        
        // Calculate UV coordinates based on the position of the vertices
        const a_u = normalizeX(vertices[indexA], -3, 3);
        const a_v = normalizeY(vertices[indexA + 1], -5, 5);
        const b_u = normalizeX(vertices[indexB], -3, 3);
        const b_v = normalizeY(vertices[indexB + 1], -5, 5);
        const c_u = normalizeX(vertices[indexC], -3, 3);
        const c_v = normalizeY(vertices[indexC + 1], -5, 5);
        
        // console.log("AU", a_u)
        // console.log("BU", b_u)
        // console.log("CU", c_u)

        // if(j < 5) {
        //     console.log("A", a_u, a_v)
        //     console.log(vertices[indexA], vertices[indexA + 1])
        //     console.log("B", b_u, b_v)
        //     console.log("C", c_u, c_v)
        //     j++;
        // }
        
        return [
          new THREE.Vector2(a_u, a_v),
          new THREE.Vector2(b_u, b_v),
          new THREE.Vector2(c_u, c_v),
        ];
    },
  
    generateSideWallUV: function ( geometry, vertices, indexA, indexB, indexC, indexD ) {

		const a_x = vertices[ indexA * 3 ];
		const a_y = vertices[ indexA * 3 + 1 ];
		const a_z = vertices[ indexA * 3 + 2 ];
		const b_x = vertices[ indexB * 3 ];
		const b_y = vertices[ indexB * 3 + 1 ];
		const b_z = vertices[ indexB * 3 + 2 ];
		const c_x = vertices[ indexC * 3 ];
		const c_y = vertices[ indexC * 3 + 1 ];
		const c_z = vertices[ indexC * 3 + 2 ];
		const d_x = vertices[ indexD * 3 ];
		const d_y = vertices[ indexD * 3 + 1 ];
		const d_z = vertices[ indexD * 3 + 2 ];

		if ( Math.abs( a_y - b_y ) < Math.abs( a_x - b_x ) ) {

			return [
				new THREE.Vector2( a_x, 1 - a_z ),
				new THREE.Vector2( b_x, 1 - b_z ),
				new THREE.Vector2( c_x, 1 - c_z ),
				new THREE.Vector2( d_x, 1 - d_z )
			];

		} else {

			return [
				new THREE.Vector2( a_y, 1 - a_z ),
				new THREE.Vector2( b_y, 1 - b_z ),
				new THREE.Vector2( c_y, 1 - c_z ),
				new THREE.Vector2( d_y, 1 - d_z )
			];

		}

	}
};

function createBoard(points) {
    const curve = new THREE.CatmullRomCurve3(points);

    const plankWidth = 1;
    const plankHeight = 0.2;
    const plankDepth = 0.2;

    const plankShape = new THREE.Shape();
    plankShape.moveTo(-plankWidth / 2, -plankHeight / 2);
    plankShape.lineTo(plankWidth / 2, -plankHeight / 2);
    plankShape.lineTo(plankWidth / 2, plankHeight / 2);
    plankShape.lineTo(-plankWidth / 2, plankHeight / 2);
    plankShape.lineTo(-plankWidth / 2, -plankHeight / 2);

    const extrudeSettings = {
        steps: 20,
        bevelEnabled: false,
        extrudePath: curve,
        UVGenerator: DeckUVGenerator // Use this to keep UVs consistent
    };

    const plankGeometry = new THREE.ExtrudeGeometry(plankShape, extrudeSettings);
    const plankMaterial = new THREE.MeshPhongMaterial({ map: woodTexture3, side : THREE.DoubleSide});

    return new THREE.Mesh(plankGeometry, plankMaterial);
}

function createHull( points ) {
    const sailboatHullGeometry = new THREE.LatheGeometry( points, 4, 0, Math.PI);

    const sailboatHullMaterial = new THREE.MeshPhongMaterial( { map: woodTexture2, side: THREE.DoubleSide } );

    const sailboatHull = new THREE.Mesh( sailboatHullGeometry, sailboatHullMaterial );

    sailboatHull.rotation.y = Math.PI / 2;

    return sailboatHull;
}

function normalizeX( x, start, end ) {
    return (x + end) / ( end - start );
}

function normalizeY( y, start, end ) {
    return (y + end) / ( end - start );
}

function createDeck(curvePoints1, curvePoints2, flatPoints1, flatPoints2) {

    const topEdgeCurve1 = new THREE.CatmullRomCurve3(curvePoints1);
    const topEdgeCurve2 = new THREE.CatmullRomCurve3(curvePoints2);

    const curvePointsArray1 = topEdgeCurve1.getPoints(50);
    const curvePointsArray2 = topEdgeCurve2.getPoints(50);

    const topPoints1 = curvePointsArray1.concat(flatPoints1);
    const topPoints2 = curvePointsArray2.concat(flatPoints2);

    const topShape1 = new THREE.Shape();
    const topShape2 = new THREE.Shape();

    topShape1.moveTo(topPoints1[0].x, topPoints1[0].y);
    topShape2.moveTo(topPoints2[0].x, topPoints2[0].y);

    for (let i = 1; i < topPoints1.length; i++) {
        topShape1.lineTo(topPoints1[i].x, topPoints1[i].y);
        topShape2.lineTo(topPoints2[i].x, topPoints2[i].y);
    }

    const topExtrudeSettings = {
        steps: 500,
        depth: 0.2,
        bevelEnabled: false,
        UVGenerator: DeckUVGenerator
    }

    const topGeometry1 = new THREE.ExtrudeGeometry(topShape1, topExtrudeSettings);
    const topGeometry2 = new THREE.ExtrudeGeometry(topShape2, topExtrudeSettings);
    
    const topMaterial = new THREE.MeshPhongMaterial({ map: woodTexture1, side: THREE.DoubleSide });

    const topMesh1 = new THREE.Mesh(topGeometry1, topMaterial);
    const topMesh2 = new THREE.Mesh(topGeometry2, topMaterial);

    const topMeshGroup = new THREE.Group();

    topMeshGroup.add(topMesh1);
    topMeshGroup.add(topMesh2);

    return topMeshGroup;

}

function createMast() {
    const mastGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 32);

    const mastMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x919191, 
        metalness: 0.5,
        roughness: 0.5
    });

    const mast = new THREE.Mesh(mastGeometry, mastMaterial);

    mast.position.set(0,0,4);

    mast.rotation.x = Math.PI / 2;

    return mast;
}

function createShroud(initialPosition, endPosition) {
    const direction = new THREE.Vector3().subVectors(endPosition, initialPosition);
    const height = direction.length();
    const center = new THREE.Vector3().addVectors(initialPosition, direction.multiplyScalar(0.5));

    const geometry = new THREE.CylinderGeometry(0.01, 0.01, height, 32);

    const material = new THREE.MeshStandardMaterial({ 
        color: 0x919191,
        metalness: 0.5,
        roughness: 0.9,     
    });
    
    const shroud = new THREE.Mesh(geometry, material);
    
    shroud.position.copy(center);
    shroud.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return shroud;
}

function createBoom() {

    const booomStart = new THREE.Vector3(0, 0, 1.5);
    const boomEnd = new THREE.Vector3(0, -6, 1.5);

    const direction = new THREE.Vector3().subVectors(boomEnd, booomStart);
    const height = direction.length();
    const center = new THREE.Vector3().addVectors(booomStart, direction.multiplyScalar(0.5));

    const geometry = new THREE.CylinderGeometry(0.1, 0.1, height, 32);

    const material = new THREE.MeshStandardMaterial({ 
        color: 0x919191,
        metalness: 0.5,
        roughness: 0.9,      
    });
    
    const shroud = new THREE.Mesh(geometry, material);
    
    shroud.position.copy(center);
    shroud.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

    const boomPivot = new THREE.Object3D();

    boomPivot.add(shroud);

    return boomPivot;
}

function createMainSail() {
    const geometry = new THREE.BufferGeometry();

    const points = [
        new THREE.Vector3(0, 0, 8),
        new THREE.Vector3(0, -6, 1.5),
        new THREE.Vector3(0, 0, 1.5),
    ]

    const vertices = [
        points[0].x, points[0].y, points[0].z,
        points[1].x, points[1].y, points[1].z,
        points[2].x, points[2].y, points[2].z,
    ];

    const indices = [0, 1, 2];
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    geometry.setIndex(indices);
    const uvs = [
        0.5, 1,
        0, 0,
        1, 0,
    ]

    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    const sailMaterial = new THREE.MeshStandardMaterial({ map:sailTexture, side: THREE.DoubleSide });

    const mainSail = new THREE.Mesh(geometry, sailMaterial);

    return mainSail;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame(animate); 

    for(let i = 0; i < boatList.length; i++) {

        const boat = boatList[i];

        boat.update();

    }

    const time = performance.now() * 0.001;

    water.material.uniforms['time'].value += 1 / 200;

    renderer.render(scene, camera);
}

function onKeyDown(event) {

    console.log(event.key);
    switch (event.key) {
      case 'w': // W key for moving forward
        isMovingForward = true;
        break;
      case 's': // S key for moving backward
        isMovingBackward = true;
        break;
      case 'a': // A key for turning left
        isTurningLeft = true;
        break;
      case 'd': // D key for turning right
        isTurningRight = true;
        break;
    }
  }
  
  function onKeyUp(event) {
    switch (event.key) {
      case 'w': // W key for moving forward
        isMovingForward = false;
        break;
      case 's': // S key for moving backward
        isMovingBackward = false;
        break;
      case 'a': // A key for turning left
        isTurningLeft = false;
        break;
      case 'd': // D key for turning right
        isTurningRight = false;
        break;
    }
  }


