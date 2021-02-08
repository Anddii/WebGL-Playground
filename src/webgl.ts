//GAME SCRIPT

import { GameEngine } from './renderer.js';
import { GameObject } from './gameObject.js';

import { loadTexture } from './util.js'
import { Physics } from './physics.js';

declare global {
    const Matter: typeof Matter;
}

const Engine = Matter.Engine
const Bodies = Matter.Bodies
const World = Matter.World
var engine: Matter.Engine = Engine.create()

let currentAnimationFrame: number

const cameraScale: number = -100

let then: number = 0
let deltaTime: number = 0

let mouseX: number = 0
let mouseY: number = 0
let mouseXDist: number = 0
let mouseYDist: number = 0

let mouseMoveBall: boolean = false

// Start
function main() {

    document.title = 'Awesome Game';
    engine.world.gravity.y = -0.0981;

    try {
        const gameEngine: GameEngine = new GameEngine(document.body.clientWidth, document.body.clientHeight, cameraScale);
        gameEngine.clearCanvas();

        const texture: any = loadTexture(gameEngine.gl, './images/puffin.jpg');
        const textureB: any = loadTexture(gameEngine.gl, './images/ball.png');

        const firstO: GameObject = new GameObject([1, -10, -6], gameEngine.meshList["plane"], null)
        firstO.transform.scale=[10,1,1]
        const ground: any = Bodies.rectangle(1, -10, 20, 2, { isStatic: true });
        firstO.addComponent(ground)
        gameEngine.scene.push(firstO)

        const secondO: GameObject = new GameObject([1.5, -5, -6], gameEngine.meshList["plane"], null)
        const box: any = Bodies.rectangle(-1.5, -5, 2, 2, { isStatic: true });
        secondO.addComponent(box)
        gameEngine.scene.push(secondO)

        const ball: GameObject = new GameObject([3, 4, -6], gameEngine.meshList["plane"], textureB)
        var boxB = Bodies.circle(3,4,1, {}, 50);
        boxB.circleRadius=10000
        ball.addComponent(boxB)
        gameEngine.scene.push(ball)

        World.add(engine.world, [boxB, box, ground]);

        document.body.onkeypress = function (e) {
            if (e.code === 'Space') {
                ball.getComponent(Physics).addForce([1*deltaTime, 0, 0])
            }
        }

        //Stop drawing when tab not active
        document.addEventListener("visibilitychange", function() {
            if(document.hidden){
                cancelAnimationFrame(currentAnimationFrame);
            }else{
                currentAnimationFrame = requestAnimationFrame((time) => {
                    then = time * 0.001
                    update(gameEngine, time)
                });
            } 
        });

        // run the engine
        Engine.run(engine);
        currentAnimationFrame = requestAnimationFrame((time) => update(gameEngine, time));

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
    deltaTime = time - then;
    then = time;

    gameEngine.scene.forEach(gameObject => {
        gameObject.transform.update(gameObject)
        gameObject.components.forEach(component => {
            // component.update(deltaTime)
        })
    });

    gameEngine.drawScene();
    currentAnimationFrame = requestAnimationFrame((time) => update(gameEngine, time))
}

window.onload = main;