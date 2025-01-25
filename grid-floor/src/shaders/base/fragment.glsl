uniform float uLineThickness;
uniform vec3 uColor;

varying vec2 vUv;

void main()
{
    vec2 lineWidth = vec2(uLineThickness);
    /* width change depending on angle & distance from camera
    using screen space partial derivatives */
    vec2 lineAA = fwidth(vUv);
    vec2 lineUV = 1.0 - abs(fract(vUv) * 2.0 - 1.0);
    float line = smoothstep(uLineThickness + lineAA.x, uLineThickness - lineAA.x, lineUV.x);
    line += smoothstep(uLineThickness + lineAA.y, uLineThickness - lineAA.y, lineUV.y);

    vec3 color = vec3(line) * uColor;
    gl_FragColor = vec4(color, 1.0);
}