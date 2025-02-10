uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;

uniform float uGridSize;

uniform vec3 uColor1;
uniform vec3 uColor2;

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

vec3 backgroundSketch(){
 
  vec2 uv = vUv;
  float gridSize = 20.;
  uv *= gridSize;
  uv = fract(uv);
 
  vec2 gridIndex = floor(vUv * gridSize + uTime);
  gridIndex = floor(vUv * gridSize );
 
  float distToCenter = distance(vec2(gridSize/2. - 0.5), gridIndex);
  float size =  0.3 + 0.3* sin(distToCenter - uTime * 4. );
  float sq = square(uv, size);
 
  float paletteOffset = vUv.x * 0.2 + uTime * 0.2;
  return sq * palette(paletteOffset, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(2.0,1.0,0.0), vec3(0.5,0.20,0.25));
 
}

vec3 backgroundSketch(vec2 uv, float gridSize) {
    uv = fract(uv * gridSize);
 
  vec2 gridIndex = floor(vUv * gridSize + uTime);
  gridIndex = floor(vUv * gridSize );
 
  float distToCenter = distance(vec2(gridSize/2. - 0.5), gridIndex);
  float size =  0.3 + 0.3* sin(distToCenter - uTime * 4. );
  float sq = square(uv, size);
 
  float paletteOffset = vUv.x * 0.2 + uTime * 0.2;
  return sq * palette(paletteOffset, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(2.0,1.0,0.0), vec3(0.5,0.20,0.25));
}

void main()
{
    // UV
    vec2 uv = vUv;

    // Small Big Grids
    uv.x = normalSin(uv.x * uGridSize);
    uv.y = normalSin(uv.y * uGridSize);

    // Square Grid
    uv = fract(uv * uGridSize);

    // Grid Cell
    vec2 gridIndex = floor(vUv * uGridSize * uTime);
    gridIndex = floor(vUv * gridIndex);

    // Position
    float angle = uTime + uv.x + uv.y;
    vec2 pos = vec2(cos(angle), sin(angle)) * uAmplitude;

    // Size Formula
    float gridCenter = distance(vec2(uGridSize / 2.0 - 0.5), gridIndex);
    float sizeChange = sin(uTime * uSpeed + gridCenter) * uAmplitude;
    float circle = smoothstep(0.2 + sizeChange, 0.4 + sizeChange, distance(vec2(0.5), uv + pos));

    float result = 1.0 - circle;

    // Color offset
    float paletteOffset = gridCenter * 0.1 + uTime * 0.2;

    vec3 frontColor = (result) * palette(paletteOffset, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.2, 0.25));

    vec3 backColor = backgroundSketch(uv, uGridSize);

    vec3 test = vec3(result);
    vec3 color = mix(backColor, frontColor, result);

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