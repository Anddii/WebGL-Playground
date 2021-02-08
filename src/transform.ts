import {vec3} from 'gl-matrix';

export class Transform {
    position: vec3 = [0, 0, 0]
    rotation: vec3 = [0, 0, 0]
    scale: vec3 = [1, 1, 1]

    constructor(position?: vec3, rotation?: vec3, scale?: vec3) {
        this.position = position != null ? position : this.position;
        this.rotation = rotation != null ? rotation : this.rotation;
        this.scale = scale != null ? scale : this.scale;;
    }
}