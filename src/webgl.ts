//GAME SCRIPT

import { GameEngine } from './renderer.js';
import { GameObject } from './gameObject.js';

import { loadTexture } from './util.js'
import { Physics } from './physics.js';

// module aliases

const cameraScale: number = -100

let then: number = 0

let mouseX: number = 0
let mouseY: number = 0
let mouseXDist: number = 0
let mouseYDist: number = 0

let mouseMoveBall: boolean = false

// Start
function main() {

    try {
        const gameEngine: GameEngine = new GameEngine(document.body.clientWidth, document.body.clientHeight, cameraScale);
        gameEngine.clearCanvas();

        const texture: any = loadTexture(gameEngine.gl, './images/puffin.jpg');
        const textureB: any = loadTexture(gameEngine.gl, './images/ball.png');

        const firstO: GameObject = new GameObject([1, 0, -6], gameEngine.meshList["plane"], texture)
        gameEngine.scene.push(firstO)

        const secondO: GameObject = new GameObject([0, 9, -6], gameEngine.meshList["plane"], textureB)
        gameEngine.scene.push(secondO)

        const ball: GameObject = new GameObject([3, 4, -6], gameEngine.meshList["plane"], textureB)
        ball.addComponent(new Physics(ball));
        gameEngine.scene.push(ball)

        document.body.onkeypress = function (e) {
            if (e.code === 'Space') {
                ball.getComponent(Physics).addForce([0.01, 0.00, 0])
            }
        }

        requestAnimationFrame((time) => update(gameEngine, time));

    } catch (err: any) {
        console.error(err)
    }


    // gameEngine.scene = 

    // //Mouse
    // document.addEventListener("mousedown", (e) => {
    //     mouseX = -gameEngine.gl.canvas.width / cameraScale * (e.offsetX / gameEngine.gl.canvas.width * 2 - 1)
    //     mouseY = gameEngine.gl.canvas.height / cameraScale * (e.offsetY / gameEngine.gl.canvas.height * 2 - 1)
    // });
    // document.addEventListener("mouseup", () => { mouseMoveBall = false });
    // gameEngine.canvas.addEventListener('mousemove', e => {
    //     mouseX = -gameEngine.gl.canvas.width / cameraScale * (e.offsetX / gameEngine.gl.canvas.width * 2 - 1)
    //     mouseY = gameEngine.gl.canvas.height / cameraScale * (e.offsetY / gameEngine.gl.canvas.height * 2 - 1)
    // });

    // //Touch
    // document.addEventListener("touchstart", (e) => {
    //     mouseX = -gameEngine.gl.canvas.width / cameraScale * (e.targetTouches[0].clientX / gameEngine.gl.canvas.width * 2 - 1)
    //     mouseY = gameEngine.gl.canvas.height / cameraScale * (e.targetTouches[0].clientY / gameEngine.gl.canvas.height * 2 - 1)
    //     const distance = vec2.distance([mouseX, mouseY], gameEngine.scene[2].collider.position)
    //     if (distance <= gameEngine.scene[2].collider.radius) {
    //         mouseMoveBall = true
    //         mouseXDist = mouseX - gameEngine.scene[2].collider.position[0]
    //         mouseYDist = mouseY - gameEngine.scene[2].collider.position[1]
    //     }
    // });
    // document.addEventListener("touchend", () => { mouseMoveBall = false });
    // gameEngine.canvas.addEventListener('touchmove', e => {
    //     mouseX = -gameEngine.gl.canvas.width / cameraScale * (e.targetTouches[0].clientX / gameEngine.gl.canvas.width * 2 - 1)
    //     mouseY = gameEngine.gl.canvas.height / cameraScale * (e.targetTouches[0].clientY / gameEngine.gl.canvas.height * 2 - 1)
    // });

    // //Space key

    // document.body.onkeyup = function (e) {
    //     if (e.code === 'Space') {
    //         ball.getComponent(Physics).addForce([0.01, -0.01, 0])
    //     }
    // }
}

function update(gameEngine: GameEngine, time: number) {

    time *= 0.001;  // convert to seconds
    const deltaTime: number = time - then;
    then = time;

    gameEngine.scene.forEach(gameObject => {
        gameObject.components.forEach(component => {
            component.update(deltaTime)
        })
    });

    gameEngine.drawScene();
    requestAnimationFrame((time) => update(gameEngine, time))
}

window.onload = main;