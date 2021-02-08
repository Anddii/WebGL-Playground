export class Mesh {
    positions: Array<number>
    offset: number
    vertexCount: number
    constructor(offset: number, positions: Array<number>) {
        this.offset = offset
        this.positions = positions
        this.vertexCount = positions.length/3
    }
}