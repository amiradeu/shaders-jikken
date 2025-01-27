uniform float uLineThickness;
uniform vec3 uColor;

varying vec2 vUv;

void main()
{
    vec2 lineWidth = vec2(uLineThickness);

    //💡 derivatives of original uv
    //   to create anti-aliasing line with smoothstep
    // how much a specific value is changing between one pixel and the next
    // width change depending on angle & distance from camera can be found with space partial derivatives
    //float lineAA = fwidth(vUv.x);
    vec2 gridDeriv = fwidth(vUv);
    // 1 pixel wide smoothstep can be too sharp
    // hence using 1.5 pixel wide smoothstep
    vec2 gridAA = gridDeriv * 1.5;
    
    //💡 prepare uv for lines
    // 0-1(uv) 👉 0-2(multiply) 👉 -1-0-1(shift) 👉 1-0-1(absolute)
    // 👉 0-1-0(shift) make white at center(0,0) position
    // (fract) - make sawtooth wave
    //float lineUV = 1.0 - abs(fract(vUv.x) * 2.0 - 1.0);
    vec2 gridUV = 1.0 - abs(fract(vUv) * 2.0 - 1.0);

    //💡 repeating lines
    // use the derivative to make the lines smooth
    //float line = smoothstep(lineWidth.x + lineAA, lineWidth.x - lineAA,lineUV);
    vec2 grid2 = smoothstep(lineWidth + gridAA, lineWidth - gridAA,gridUV);
    // overlap xy lines
    float grid = max(grid2.x, grid2.y);
    
    vec3 color = vec3(grid) * uColor;
    gl_FragColor = vec4(color, 1.0);
}