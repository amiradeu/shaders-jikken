uniform float uLineThickness;
uniform vec3 uColor;

varying vec2 vUv;

float pristineGrid(vec2 uv, vec2 lineWidth) {
    vec2 uvDeriv = fwidth(uv);
    vec2 lineAA = uvDeriv * 1.5;
    vec2 gridUV = 1.0 - abs(fract(uv) * 2.0 - 1.0);
    vec2 grid2 = smoothstep(lineWidth + lineAA, lineWidth - lineAA,gridUV);
    return mix(grid2.x, 1.0, grid2.y);
}

void main()
{
    vec2 lineWidth = vec2(uLineThickness);
    //💡 scaling uv to get multiple repeating lines
    vec2 uv = vUv * 50.0;


    //💡 derivatives of original uv
    //   to create anti-aliasing line with smoothstep
    // how much a specific value is changing between one pixel and the next
    // width change depending on angle & distance from camera can be found with space partial derivatives
    //float lineAA = fwidth(uv.x);
    vec2 uvDeriv = fwidth(uv);

    // 💡 constant pixel width for the line
    // 💡 Phone-wire AA
    // STEP 1: ensure line does not get smaller than one pixel
    // if so, we will clamp it to one pixel
    vec2 drawWidth = max(uvDeriv, lineWidth);

    // 💡 1 pixel wide smoothstep can be too sharp causing aliasing
    // hence using 1.5 pixel wide smoothstep
    // AA - anti-aliasing
    vec2 lineAA = uvDeriv * 1.5;
    
    //💡 prepare uv for lines
    // 0-1(uv) 👉 0-2(multiply) 👉 -1-0-1(shift) 👉 1-0-1(absolute)
    // 👉 0-1-0(shift) make white at center(0,0) position
    // (fract) - make sawtooth wave
    //float lineUV = 1.0 - abs(fract(uv.x) * 2.0 - 1.0);
    vec2 gridUV = 1.0 - abs(fract(uv) * 2.0 - 1.0);

    //💡 repeating lines
    // use the derivative to make the lines smooth
    //float line = smoothstep(lineWidth.x + lineAA, lineWidth.x - lineAA,lineUV);
    vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);

    // 💡 Phone-wire AA
    // STEP 2: fades the line out as it gets thinner
    // how thick we want divided by how thick we’re drawing
    grid2 *= clamp(lineWidth / drawWidth, 0.0, 1.0);

    // overlap xy lines
    float grid = mix(grid2.x, 1.0, grid2.y);
    
    vec3 color = vec3(grid) * uColor;
    // using the function to make multiple squares?
    // vec3 color = vec3(pristineGrid(uv, lineWidth)) * uColor;

    gl_FragColor = vec4(color, 1.0);
}