uniform float uTime;
uniform float uAmplite;
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
    uv.x = normalSin(uv.x * 10.);
    uv.y = normalSin(uv.y * 10.);

    // moves origin point: vec2 + uv
    // vec2 pos = vec2(0.2, 0.1);

    // 💡 square
    // float result = square(uv + pos, 0.7);

    // flip result -> flip 2 parameters
    // float result = smoothstep(0.7, 0.3, uv.x);

    // 💡 moving circle
    vec2 circlePos = vec2(cos(uTime), sin(uTime)) * 0.2;
    float sizeChange = sin(uTime) * 0.2;

    // 💡 radial gradient
    // length - distance to origin(0, 0)
    // distance between 2 points
    float circleGradient = distance(vec2(0.5), uv + circlePos);
    float circle = smoothstep(0.2 + sizeChange, 0.4 + sizeChange, circleGradient);
    float result = circle;
    vec3 color = vec3(result);

    // 0-1 gradient
    // float edge = normalSin(uTime);    
    // infinite gradient
    // float infinite = normalSin(uv.x + uTime);
    // make it infinite, frequent, fast
    // float fastAndFrequent = sin(uv.x * 5. + uTime * 3.) * 0.5 + 0.5;

    // 📝 terminologies
    // frequency. how often waves repeat/appear - sin(uv.x * freq)
    // how fast wave move - uTime * speed
    // amplitude. how big waves/height - sin(uv.x) * amplitude
    // displacemen/time offset. move the wave - sin(uv.x + uTime)

    // float gradient = step(edge, uv.x);
    // result = gradient;

    // vec3 color = vec3(result);
    // vec3 color = vec3(edge);
    // vec3 color = vec3(infinite);
    // vec3 color = vec3(fastAndFrequent);

    // Palette
    float paletteOffset = vUv.x * 0.3 + vUv.y + uTime * 0.2;
    // flip technique: 1.0 - variable
    result = 1.0 - result;
    color = result * palette(paletteOffset, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.2, 0.25));

    color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), distance(vec2(0.5), vUv));
    // color = mix(vec3(0.0, 0.0, 1.0), color, vUv.y);
    // multiplication gives a more vibrant color blend
    color = color + vec3(0.0, 0.0, 1.0) * vUv.y;

    gl_FragColor = vec4(color, 1.0);
}