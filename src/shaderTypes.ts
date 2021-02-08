export interface BasicShaderInfo {
    program: any,
    attribLocations: BasicShaderAttribLocations
    uniformLocations: BasicShaderUniformLocations
}

interface BasicShaderAttribLocations {
    vertexPosition: any,
    textureCoord: number
}
interface BasicShaderUniformLocations {
    projectionMatrix: any,
    modelViewMatrix: any,
    uSampler: any
}