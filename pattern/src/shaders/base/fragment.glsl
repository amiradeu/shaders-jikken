uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;

varying vec2 vUv;

float square(vec2 uv, float size) {
    float halfSize = size / 2.0;

    // >value -> 1
    float bottom = step(0.5 - halfSize, uv.y);
    // 💡 trick: flip step result -> flip parameters
    float top = step(uv.y, 0.5 + halfSize);

    float left = step(0.5 - halfSize, uv.x);
    float right = step(uv.x, 0.5 + halfSize);

    return bottom * top * left * right;
}

float normalSin(float val) {
    // sin goes from -1 to 0
    // we change it to 0 to 1
    return sin(val) * 0.5 + 0.5;
}

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ){
  return a + b*cos( 6.28318*(c*t+d) );
}

void main()
{
    vec2 uv = vUv;

    // modify uvs
    float distanceUv = distance(vec2(0.5), uv);
    float repeat = normalSin(uTime);

    // radial uvs
    // using mix - appear & dissapear distortion. 0 - apply, 1 - no distortion
    uv.x += mix(sin(distanceUv * uFrequency - uTime * uSpeed) * uAmplitude, 0.0, repeat);
    uv.y += mix(cos(distanceUv * uFrequency - uTime * uSpeed) * uAmplitude, 0.0, repeat);

    // radial circles
    float squares = square(uv, 0.6 + sin(uTime) * 0.2);
    squares -= square(uv, 0.2 + cos(uTime) * 0.2);
    vec3 color = vec3(squares);

    // palette
    float paletteOffset = distanceUv - uTime * 0.2;
    vec3 firstPalette = palette(paletteOffset, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 1.0), vec3(0.5, 0.2, 0.25));
    vec3 secondPalette = palette(paletteOffset * 2.0, vec3(0.8, 0.5, 0.4), vec3(0.2, 0.4, 0.2), vec3(2.0, 1.0, 1.0), vec3(0.0, 0.25, 0.25));
    color = mix(firstPalette, secondPalette, smoothstep(0.4, 0.6, vUv.x));

    // mix with squares
    float cornerFade = smoothstep(0.5, 0.2, distanceUv);
    color = mix(vec3(0.0), color, squares * cornerFade);

    gl_FragColor = vec4(color, 1.0);
}

// 📝 terminologies
// frequency. how often waves repeat/appear - sin(uv.x * freq)
// how fast wave move - uTime * speed
// amplitude. how big waves/height - sin(uv.x) * amplitude
// displacemen/time offset. move the wave - sin(uv.x + uTime)
// length - distance to origin(0, 0)
// distance between 2 points
// mix. blend color with intensity. mix(vec3(0.0, 0.0, 1.0), color, vUv.y);
// multiplication gives a more vibrant color blend. color * uV