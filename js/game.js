// Game state variables
let scene, camera, renderer, clock;
let playerCar, playerCarGroup;
let enemyCars = [];
let gameRunning = true;
let score = 0;
let gameStartTime;

// Physics variables
let velocity = 0;
let acceleration = 0;
let maxSpeed = 50;
let minSpeed = -20;
let friction = 0.95;
let steerSpeed = 0;
const maxSteerSpeed = 30;
const steerAcceleration = 2;
const steerFriction = 0.9;

// Control state
const keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

// Enemy spawning variables
let lastSpawnTime = 0;
let spawnDelay = 2000; // milliseconds
const lanes = [-15, 0, 15]; // lane positions

// Environment constants
const roadWidth = 60;
const roadLength = 500;

// Initialize the game
function init() {
    console.log("Initializing game...");
    
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 100, 1000);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 50);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87CEEB);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('gameContainer').appendChild(renderer.domElement);
    
    // Create clock
    clock = new THREE.Clock();
    gameStartTime = Date.now();
    
    // Create game components
    createLights();
    createEnvironment();
    createPlayerCar();
    
    // Setup event listeners
    addEventListeners();
    
    // Start game loop
    animate();
    
    console.log("Game initialized successfully!");
}

function createLights() {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // Directional light for shadows (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
}

function createEnvironment() {
    // Create main road
    const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);
    
    // Create grass areas on both sides
    const grassGeometry = new THREE.PlaneGeometry(100, roadLength);
    const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    
    const leftGrass = new THREE.Mesh(grassGeometry, grassMaterial);
    leftGrass.rotation.x = -Math.PI / 2;
    leftGrass.position.x = -80;
    leftGrass.receiveShadow = true;
    scene.add(leftGrass);
    
    const rightGrass = new THREE.Mesh(grassGeometry, grassMaterial);
    rightGrass.rotation.x = -Math.PI / 2;
    rightGrass.position.x = 80;
    rightGrass.receiveShadow = true;
    scene.add(rightGrass);
    
    // Create dashed center line
    createDashedLine();
}

function createDashedLine() {
    const dashLength = 5;
    const gapLength = 3;
    const dashWidth = 0.5;
    
    for (let z = -roadLength/2; z < roadLength/2; z += (dashLength + gapLength)) {
        const dashGeometry = new THREE.PlaneGeometry(dashWidth, dashLength);
        const dashMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const dash = new THREE.Mesh(dashGeometry, dashMaterial);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.01, z);
        scene.add(dash);
    }
}

function createPlayerCar() {
    playerCarGroup = new THREE.Group();
    
    // Main car body
    const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    playerCarGroup.add(body);
    
    // Car cabin/windshield
    const cabinGeometry = new THREE.BoxGeometry(3, 1.2, 4);
    const cabinMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 2, -1);
    cabin.castShadow = true;
    playerCarGroup.add(cabin);
    
    // Create wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    
    const wheels = [];
    const wheelPositions = [
        [-1.8, 0.8, 3], [1.8, 0.8, 3],    // Front wheels
        [-1.8, 0.8, -3], [1.8, 0.8, -3]   // Back wheels
    ];
    
    wheelPositions.forEach((pos, index) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        playerCarGroup.add(wheel);
        wheels.push(wheel);
    });
    
    // Add headlights
    const headlightGeometry = new THREE.SphereGeometry(0.3);
    const headlightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.5
    });
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-1.2, 1.2, 4.2);
    playerCarGroup.add(leftHeadlight);
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(1.2, 1.2, 4.2);
    playerCarGroup.add(rightHeadlight);
    
    // Position the car and store wheel references
    playerCarGroup.position.set(0, 0, 200);
    playerCarGroup.userData.wheels = wheels;
    scene.add(playerCarGroup);
    
    playerCar = playerCarGroup;
}

function makeEnemyCar() {
    const enemyCarGroup = new THREE.Group();
    
    // Random color (excluding red)
    const colors = [0x0000FF, 0x00FF00, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500, 0x800080];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: randomColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    enemyCarGroup.add(body);
    
    // Car cabin
    const cabinGeometry = new THREE.BoxGeometry(3, 1.2, 4);
    const cabinMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 2, 1);
    cabin.castShadow = true;
    enemyCarGroup.add(cabin);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    
    const wheelPositions = [
        [-1.8, 0.8, 3], [1.8, 0.8, 3],
        [-1.8, 0.8, -3], [1.8, 0.8, -3]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        enemyCarGroup.add(wheel);
    });
    
    // Face toward player (rotate 180 degrees)
    enemyCarGroup.rotation.y = Math.PI;
    
    // Position in random lane
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    enemyCarGroup.position.set(lane, 0, -250);
    
    // Set random speed
    enemyCarGroup.userData.speed = 30 + Math.random() * 20;
    
    scene.add(enemyCarGroup);
    enemyCars.push(enemyCarGroup);
    
    return enemyCarGroup;
}

function updatePlayerMovement() {
    if (!gameRunning) return;
    
    // Handle forward/backward acceleration
    if (keys.up) {
        acceleration = 1.5;
    } else if (keys.down) {
        acceleration = -0.8;
    } else {
        acceleration = 0;
    }
    
    // Update velocity with acceleration and friction
    velocity += acceleration;
    velocity *= friction;
    velocity = Math.max(minSpeed, Math.min(maxSpeed, velocity));
    
    // Handle steering
    if (keys.left) {
        steerSpeed = Math.max(steerSpeed - steerAcceleration, -maxSteerSpeed);
    } else if (keys.right) {
        steerSpeed = Math.min(steerSpeed + steerAcceleration, maxSteerSpeed);
    } else {
        steerSpeed *= steerFriction;
    }
    
    // Update car position
    playerCar.position.z -= velocity * 0.1;
    playerCar.position.x += steerSpeed * 0.1;
    
    // Clamp car to road boundaries
    playerCar.position.x = Math.max(-25, Math.min(25, playerCar.position.x));
    
    // Animate wheels based on speed
    if (playerCar.userData.wheels && velocity !== 0) {
        const wheelRotation = velocity * 0.02;
        playerCar.userData.wheels.forEach(wheel => {
            wheel.rotation.x += wheelRotation;
        });
    }
}

function updateCamera() {
    // Calculate target camera position behind the car
    const targetPosition = new THREE.Vector3(
        playerCar.position.x,
        playerCar.position.y + 15,
        playerCar.position.z + 40
    );
    
    // Calculate where camera should look
    const targetLookAt = new THREE.Vector3(
        playerCar.position.x,
        playerCar.position.y + 5,
        playerCar.position.z - 20
    );
    
    // Smoothly move camera
    camera.position.lerp(targetPosition, 0.05);
    
    // Smoothly adjust camera look direction
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(-1);
    currentLookAt.add(camera.position);
    currentLookAt.lerp(targetLookAt, 0.05);
    camera.lookAt(currentLookAt);
}

function spawnEnemies() {
    const currentTime = Date.now();
    if (currentTime - lastSpawnTime > spawnDelay) {
        makeEnemyCar();
        lastSpawnTime = currentTime;
        
        // Increase difficulty over time
        const gameTime = (currentTime - gameStartTime) / 1000;
        spawnDelay = Math.max(800, 2000 - gameTime * 20);
    }
}

function updateEnemies() {
    for (let i = enemyCars.length - 1; i >= 0; i--) {
        const enemy = enemyCars[i];
        enemy.position.z += enemy.userData.speed * 0.1;
        
        // Remove enemies that are too far behind player
        if (enemy.position.z > playerCar.position.z + 100) {
            scene.remove(enemy);
            enemyCars.splice(i, 1);
        }
    }
}

function checkCollisions() {
    if (!gameRunning) return;
    
    const playerBox = new THREE.Box3().setFromObject(playerCar);
    
    for (let enemy of enemyCars) {
        const enemyBox = new THREE.Box3().setFromObject(enemy);
        if (playerBox.intersectsBox(enemyBox)) {
            gameOver();
            return;
        }
    }
}

function updateHUD() {
    const currentTime = Date.now();
    const gameTime = Math.floor((currentTime - gameStartTime) / 1000);
    const speedBonus = Math.max(0, velocity) / 10;
    score = Math.floor(gameTime + speedBonus * gameTime);
    
    document.getElementById('score').textContent = score;
    document.getElementById('speed').textContent = Math.floor(Math.abs(velocity * 2));
}

function gameOver() {
    console.log("Game Over! Final Score:", score);
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function restartGame() {
    console.log("Restarting game...");
    
    // Reset all game state
    gameRunning = true;
    score = 0;
    velocity = 0;
    acceleration = 0;
    steerSpeed = 0;
    gameStartTime = Date.now();
    lastSpawnTime = 0;
    spawnDelay = 2000;
    
    // Reset player car position
    playerCar.position.set(0, 0, 200);
    
    // Remove all enemy cars
    enemyCars.forEach(enemy => scene.remove(enemy));
    enemyCars = [];
    
    // Hide game over screen
    document.getElementById('gameOverScreen').style.display = 'none';
}

function addEventListeners() {
    // Keyboard event handlers
    document.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'ArrowLeft':
                keys.left = true;
                event.preventDefault();
                break;
            case 'ArrowRight':
                keys.right = true;
                event.preventDefault();
                break;
            case 'ArrowUp':
                keys.up = true;
                event.preventDefault();
                break;
            case 'ArrowDown':
                keys.down = true;
                event.preventDefault();
                break;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        switch(event.code) {
            case 'ArrowLeft':
                keys.left = false;
                break;
            case 'ArrowRight':
                keys.right = false;
                break;
            case 'ArrowUp':
                keys.up = false;
                break;
            case 'ArrowDown':
                keys.down = false;
                break;
        }
    });
    
    // Restart button handler
    document.getElementById('restartButton').addEventListener('click', restartGame);
    
    // Window resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    if (gameRunning) {
        updatePlayerMovement();
        updateCamera();
        spawnEnemies();
        updateEnemies();
        checkCollisions();
        updateHUD();
    }
    
    renderer.render(scene, camera);
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    init();
});

// Also start immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}