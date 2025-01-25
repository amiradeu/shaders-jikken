uniform float uLineWidth;
varying vec2 vUv;

void main()
{
    vec2 lineWidth = vec2(uLineWidth);
    // width change depending on angle, distance from camera
    // screen space partial derivatives
    vec2 lineAA = fwidth(vUv);
    vec2 lineUV = 1.0 - abs(fract(vUv) * 2.0 - 1.0);
    float line = smoothstep(uLineWidth + lineAA.x, uLineWidth - lineAA.x, lineUV.x);
    line += smoothstep(uLineWidth + lineAA.y, uLineWidth - lineAA.y, lineUV.y);
    gl_FragColor = vec4(vec3(line), 1.0);
}