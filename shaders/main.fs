varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
    highp vec4 color = vec4(1.0,1.0,1.0,1.0);
    gl_FragColor = texture2D(uSampler, vTextureCoord);
}