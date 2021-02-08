// import * as vec3 from '../node_modules/gl-matrix/esm/vec3.js';

import { vec3 } from 'gl-matrix';

import { Mesh } from './mesh.js'
import { Transform } from './transform.js'

export class GameObject {
    transform: Transform
    mesh: Mesh
    texture: any

    components: Array<any> = []

    constructor(position: vec3, mesh: Mesh, texture: any) {
        this.transform = new Transform(position)
        this.mesh = mesh
        this.texture = texture
    }

    addComponent(component: any): any {
        this.components.push(component)
        return component
    }

    getComponent(component: any): any {
        return this.components.find(function (element) {
            return element.constructor == component
        });
    }
}