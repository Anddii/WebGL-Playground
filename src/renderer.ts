import { getFileContent, createWhiteTexture } from './util.js';
import { Mesh } from './mesh.js';
import { GameObject } from './gameObject.js';
import { BasicShaderInfo } from './shaderTypes.js';

import * as mat4 from '../node_modules/gl-matrix/esm/mat4.js';
import * as vec3 from '../node_modules/gl-matrix/esm/vec3.js';

// import { vec3, mat4 } from 'gl-matrix';

export class GameEngine {

    gl: any
    canvas: any

    readyToRender: boolean = false
    meshList: any = []
    scene: Array<GameObject> = []
    emptyTexture: any = null
    cameraScale: number = 0
    buffers: any = []

    shaderProgram: any
    programInfo: any

    constructor(canvasWidth: number, canvasHeight: number, cameraScale: number) {
        this.canvas = document.querySelector('#glCanvas');

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.cameraScale = cameraScale

        this.gl = this.canvas.getContext('webgl');

        // Only continue if WebGL is available and working
        if (this.gl === null) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }

        this.emptyTexture = createWhiteTexture(this.gl)

        //plane
        this.buffers = this.initBuffers('plane', [
            -1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0
        ], [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
        ])

        // Init Shader program
        const promiseVs: Promise<string> = getFileContent('../shaders/main.vs')
        const promiseFs: Promise<string> = getFileContent('../shaders/main.fs')

        Promise.all([promiseVs, promiseFs]).then((res: [string, string]) => {
            this.shaderProgram = this.initShaderProgram(this.gl, res[0], res[1])
            this.programInfo = {
                program: this.shaderProgram,
                attribLocations: {
                    vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                    textureCoord: this.gl.getAttribLocation(this.shaderProgram, 'aTextureCoord'),
                },
                uniformLocations: {
                    projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
                    modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
                    uSampler: this.gl.getUniformLocation(this.shaderProgram, 'uSampler'),
                },
            };

            this.readyToRender = true
        });
    }

    initBuffers(meshName: string, positions: number[], textureCoordinates: number[]): {position: any, textureCoord: any} {

        // Create a buffer for the square's positions.
        const positionBuffer: any = this.gl.createBuffer();

        // Select the positionBuffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

        //Pass the list of positions into WebG
        this.gl.bufferData(this.gl.ARRAY_BUFFER,
            new Float32Array(positions),
            this.gl.STATIC_DRAW);

        this.meshList[meshName] = new Mesh(0, positions)

        //Texture
        const textureCoordBuffer: any = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureCoordBuffer);

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
            this.gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            textureCoord: textureCoordBuffer,
        };
    }

    initShaderProgram(gl: any, vsSource: any, fsSource: any): any {
        const vertexShader: any = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader: any = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program
        const shaderProgram: any = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    loadShader(gl: any, type: any, source: any): any {
        const shader: any = gl.createShader(type);

        // Send the source to the shader object
        gl.shaderSource(shader, source);

        // Compile the shader program
        gl.compileShader(shader);

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    clearCanvas() {
        this.gl.clearColor(0.9, 0.9, 0.9, 1.0);  // Clear to black, fully opaque
        this.gl.clearDepth(1.0);                 // Clear everything
        this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things

        // Clear the canvas before we start drawing on it.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    drawScene() {

        if (!this.readyToRender) {
            console.log("Not Ready to Render")
            return
        }

        this.clearCanvas()

        // Create a perspective matrix
        const fieldOfView: number = 45 * Math.PI / 180;   // in radians
        const aspect: number = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const zNear: number = 0.1;
        const zFar: number = 1000.0;
        const projectionMatrix: mat4 = mat4.create();

        //Perspective
        // mat4.perspective(projectionMatrix,
        //     fieldOfView,
        //     aspect,
        //     zNear,
        //     zFar);

        // Orthographic
        mat4.ortho(projectionMatrix, this.canvas.width, -this.canvas.width, this.canvas.height, -this.canvas.height, 0.1, 100);
        mat4.scale(projectionMatrix, projectionMatrix, [this.cameraScale, this.cameraScale, 1])

        this.scene.forEach(element => {
            // Set the drawing position
            const modelViewMatrix: mat4 = mat4.create();
            mat4.translate(modelViewMatrix,
                modelViewMatrix,
                element.transform.position);
            
            mat4.scale(modelViewMatrix,
                modelViewMatrix,
                element.transform.scale);

            const normalizedRot: vec3 = [0,0,0]
            vec3.normalize(normalizedRot, element.transform.rotation)
            mat4.rotate(modelViewMatrix,
                modelViewMatrix,
                Math.abs(element.transform.rotation[0]) + Math.abs(element.transform.rotation[1]) + Math.abs(element.transform.rotation[2]),
                [normalizedRot[0], normalizedRot[1], normalizedRot[2]])

            // Tell WebGL how to pull out the positions from the position buffer
            {
                const numComponents: number = 3;  // pull out 2 values per iteration
                const type: any = this.gl.FLOAT;    // the data in the buffer is 32bit floats
                const normalize: boolean = false;  // don't normalize
                const stride: number = 0;         // how many bytes to get from one set of values to the next
                const offset: number = 0;         // how many bytes inside the buffer to start from
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
                this.gl.vertexAttribPointer(
                    this.programInfo.attribLocations.vertexPosition,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                this.gl.enableVertexAttribArray(
                    this.programInfo.attribLocations.vertexPosition);
            }

            // tell webgl how to pull out the texture coordinates from buffer
            {
                const num: number = 2; // every coordinate composed of 2 values
                const type: any = this.gl.FLOAT; // the data in the buffer is 32 bit float
                const normalize: boolean = false; // don't normalize
                const stride: number = 0; // how many bytes to get from one set to the next
                const offset: number = 0; // how many bytes inside the buffer to start from
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.textureCoord);
                this.gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
                this.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
            }

            // Tell WebGL to use our program when drawing
            this.gl.useProgram(this.programInfo.program);

            // Tell WebGL we want to affect texture unit 0
            this.gl.activeTexture(this.gl.TEXTURE0);
            // Bind the texture to texture unit 0
            this.gl.bindTexture(this.gl.TEXTURE_2D, element.texture != null ? element.texture : this.emptyTexture);
            // Tell the shader we bound the texture to texture unit 0
            this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);

            // Set the shader uniforms
            this.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.projectionMatrix,
                false,
                projectionMatrix);
            this.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.modelViewMatrix,
                false,
                modelViewMatrix);

            {
                const offset: number = element.mesh.offset;
                const vertexCount: number = element.mesh.vertexCount;
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
            }
        });
    }
}