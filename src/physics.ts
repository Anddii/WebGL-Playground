import * as vec3 from '../node_modules/gl-matrix/esm/vec3.js';
import { GameObject } from './gameObject.js';

export class Physics {

    gravityScale: number = -0.981

    gameObject: GameObject

    mass: number = 1
    location: vec3 = [0, 0, 0]
    velocity: vec3 = [0, 0, 0]
    acceleration: vec3 = [0, 0, 0]

    constructor(gameObject: any) {
        this.gameObject = gameObject
        this.location = gameObject.transform.position
    }

    update(deltaTime: number) {
        vec3.add(this.acceleration, this.acceleration, [0,this.gravityScale*deltaTime,0])

        vec3.add(this.velocity, this.velocity, this.acceleration)
        vec3.add(this.location, this.location, this.velocity)
        this.acceleration = [0, 0, 0]

        if (this.location[1] < -5) {
            vec3.mul(this.velocity, this.velocity, [1, -0.8, 1])
            this.location[1] = -5
        }

        this.gameObject.transform.position = this.location
    }

    addForce(force: vec3) {
        const f: vec3 = [0, 0, 0]
        vec3.div(f, force, [this.mass, this.mass, this.mass])
        vec3.add(this.acceleration, this.acceleration, f)
    }
}