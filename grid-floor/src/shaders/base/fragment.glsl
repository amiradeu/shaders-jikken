#include <fog_pars_fragment>

uniform float uGridScale;
uniform float uGridThickness;
uniform float uGridCross;
uniform vec3 uGridColor;
uniform float uCrossScale;
uniform float uCrossThickness;
uniform float uCross;
uniform vec3 uCrossColor;

varying vec2 vUv;

float gridFloor(vec2 uv, vec2 lineWidth) {
    //💡 derivatives of original uv
    //   to create anti-aliasing line with smoothstep
    // how much a specific value is changing between one pixel and the next
    // width change depending on angle & distance from camera can be found with space partial derivatives
    // fwidth - approximation of derivatives
    //float lineAA = fwidth(uv.x);
    // vec2 uvDeriv = fwidth(uv);
    vec4 uvDDXY = vec4(dFdx(uv), dFdy(uv));
    vec2 uvDeriv = vec2(length(uvDDXY.xz), length(uvDDXY.yw));

    // 💡 Invert Line Trick
    // since 0.5 clamp was use, to handle line thickness > 0.5
    // draw black lines on white offset by half a grid width
    bool invertLine = lineWidth.x > 0.5;
    vec2 targetWidth = invertLine ? 1.0 - lineWidth : lineWidth;

    // 💡 Phone-wire AA
    // STEP 1: ensure line does not get smaller than one pixel
    // if so, we will clamp it to one pixel
    // vec2 drawWidth = max(uvDeriv, lineWidth);
    // clamp to 0.5 to ensure line fades to grey, not black
    vec2 drawWidth = clamp(targetWidth, uvDeriv, vec2(0.5));

    // 💡 1 pixel wide smoothstep can be too sharp causing aliasing
    // hence using 1.5 pixel wide smoothstep
    // AA - anti-aliasing
    vec2 lineAA = uvDeriv * 1.5;
    
    //💡 prepare uv for lines
    // 0-1(uv) 👉 0-2(multiply) 👉 -1-0-1(shift) 👉 1-0-1(absolute)
    // 👉 0-1-0(shift) make white at center(0,0) position
    // (fract) - make sawtooth wave
    //float lineUV = 1.0 - abs(fract(uv.x) * 2.0 - 1.0);
    vec2 gridUV = abs(fract(uv) * 2.0 - 1.0);
    gridUV = invertLine ? gridUV : 1.0 - gridUV;

    //💡 repeating lines
    // use the derivative to make the lines smooth
    //float line = smoothstep(lineWidth.x + lineAA, lineWidth.x - lineAA,lineUV);
    vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);

    // 💡 Phone-wire AA
    // STEP 2: fades the line out as it gets thinner
    // how thick we want divided by how thick we’re drawing
    grid2 *= clamp(targetWidth / drawWidth, 0.0, 1.0);

    // 💡 Moire Suppresion
    // grid cells < a pixel(when derivative > 1.0), moire pattern can appear
    // note: after the 0.5 clamp, moire would be more pronounced, but in my case, i do not see any moire
    // fade to solid color when 0.5 > derivative > 1.0 
    // anti-aliased lines start to merge
    grid2 = mix(grid2, targetWidth, clamp(uvDeriv * 2.0 - 1.0, 0.0, 1.0));
    grid2 = invertLine ? 1.0 - grid2 : grid2;

    // overlap xy lines
    float grid = mix(grid2.x, 1.0, grid2.y);

    return grid;
}

float crossFloor(vec2 uv, float scale, float thickness, float crossIntensity) {
    vec2 lineWidth = vec2(thickness);

    //💡 derivatives of original uv
    //   to create anti-aliasing line with smoothstep
    // how much a specific value is changing between one pixel and the next
    // width change depending on angle & distance from camera can be found with space partial derivatives
    // fwidth - approximation of derivatives
    //float lineAA = fwidth(uv.x);
    // vec2 uvDeriv = fwidth(uv);
    vec4 uvDDXY = vec4(dFdx(uv), dFdy(uv));
    vec2 uvDeriv = vec2(length(uvDDXY.xz), length(uvDDXY.yw));

    // 💡 Invert Line Trick
    // since 0.5 clamp was use, to handle line thickness > 0.5
    // draw black lines on white offset by half a grid width
    bool invertLine = lineWidth.x > 0.5;
    vec2 targetWidth = invertLine ? 1.0 - lineWidth : lineWidth;

    // 💡 Phone-wire AA
    // STEP 1: ensure line does not get smaller than one pixel
    // if so, we will clamp it to one pixel
    // vec2 drawWidth = max(uvDeriv, lineWidth);
    // clamp to 0.5 to ensure line fades to grey, not black
    vec2 drawWidth = clamp(targetWidth, uvDeriv, vec2(0.5));

    // 💡 1 pixel wide smoothstep can be too sharp causing aliasing
    // hence using 1.5 pixel wide smoothstep
    // AA - anti-aliasing
    vec2 lineAA = uvDeriv * 1.5;
    
    //💡 prepare uv for lines
    // 0-1(uv) 👉 0-2(multiply) 👉 -1-0-1(shift) 👉 1-0-1(absolute)
    // 👉 0-1-0(shift) make white at center(0,0) position
    // (fract) - make sawtooth wave
    //float lineUV = 1.0 - abs(fract(uv.x) * 2.0 - 1.0);
    // float barX = step(0.4, mod(uv.x * scale, 1.0)) * step(0.8, mod(uv.y * scale + 0.2, 1.0));
    // float barY = step(0.8, mod(uv.x * scale + 0.2, 1.0)) * step(0.4, mod(uv.y * scale, 1.0));

    float barX = smoothstep(0.5 - lineWidth.x, 0.50, fract(uv.x)) * smoothstep(0.5 + lineWidth.x, 0.50, fract(uv.x));
    float barY = smoothstep(0.5 - lineWidth.y, 0.50, fract(uv.y)) * smoothstep(0.5 + lineWidth.y, 0.50, fract(uv.y));
    // float barY = smoothstep(0.5 - lineWidth.x, 0.5 + lineWidth.x, uv.x) * smoothstep(0.5 - lineWidth.y, 0.5 + lineWidth.y, uv.y);
    // barX *= smoothstep(1.0 - lineWidth.y - lineAA.y, 1.0 - lineWidth.y + lineAA.y, mod(uv.y + lineWidth.y, 1.0));
    // float barY = smoothstep(1.0 - lineWidth.x - lineAA.x, 1.0 - lineWidth.x + lineAA.x, mod(uv.x + lineWidth.x, 1.0));
    // barY *= smoothstep(1.0 - crossIntensity - lineWidth.y - lineAA.y, 1.0 - crossIntensity - lineWidth.y + lineAA.y, mod(uv.y, 1.0));
    
    float strength = barX + barY;
    
    vec2 gridUV = vec2(strength);
    gridUV = invertLine ? gridUV : 1.0 - gridUV;

    //💡 repeating lines
    // use the derivative to make the lines smooth
    //float line = smoothstep(lineWidth.x + lineAA, lineWidth.x - lineAA,lineUV);
    vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);
    // grid2 = gridUV;

    // 💡 Phone-wire AA
    // STEP 2: fades the line out as it gets thinner
    // how thick we want divided by how thick we’re drawing
    grid2 *= clamp(targetWidth / drawWidth, 0.0, 1.0);

    // 💡 Moire Suppresion
    // grid cells < a pixel(when derivative > 1.0), moire pattern can appear
    // note: after the 0.5 clamp, moire would be more pronounced, but in my case, i do not see any moire
    // fade to solid color when 0.5 > derivative > 1.0 
    // anti-aliased lines start to merge
    grid2 = mix(grid2, targetWidth, clamp(uvDeriv * 2.0 - 1.0, 0.0, 1.0));
    grid2 = invertLine ? 1.0 - grid2 : grid2;

    // overlap xy lines
    float grid = mix(grid2.x, 1.0, grid2.y);

    return grid;
}

void main()
{
    vec2 lineWidth = vec2(uGridThickness);
    //💡 scaling uv to get multiple repeating lines
    vec2 uv = vUv * 1.0;

    // grid floor
    float grid = gridFloor(uv, lineWidth);
    vec3 gridColor = vec3(grid) * uGridColor;

    // cross grid
    float crossUv = crossFloor(uv, uCrossScale, uCrossThickness, uCross);
    vec3 crossColor = vec3(crossUv) * uCrossColor;
    
    vec3 color = gridColor + crossColor;

    gl_FragColor = vec4(color, 1.0);

    #include <fog_fragment>
}