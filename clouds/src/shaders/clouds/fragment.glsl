#define MAX_STEPS 60
#define MAX_STEPS_LIGHTS 6
#define SCATTERING_ANISO 0.3
#define PI 3.14159265359

uniform float uTime;
uniform sampler2D uNoise;
uniform sampler2D uBlueNoise;
uniform int uFrame;
uniform float uAbsorptionCoeff;

uniform vec3 uSunPosition;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;

varying vec2 vUv;

// 💧  Anisotropic Scattering
// light scatters in various direction & intensities due to water droplets
// using Phase Function
float HenyeyGreenstein(float g, float mu) {
    float gg = g * g;
    return (1.0 / (4.0 * PI)) * ((1.0 - gg) / pow(1.0 + gg - 2.0 * g * mu, 1.5));
}

// 💡 How much light get absorbed through a volume
// much more physically accurate
// the further to the medium light propagates,
// exponentially to distance it travels
float BeersLaw(float dist, float absorption) {
    return exp(-dist * absorption);
}

// transition between shapes
mat2 rotate2D( float a) {
    float s = sin(a);
    float c = cos(a);

    return mat2(c, -s, s, c);
}

// Timing sequence
// current time, how long to play it, how quick it changes
float nextStep(float t, float len, float smo) {
    float tt = mod(t += smo, len);
    float stp = floor(t / len) - 1.0;
    return smoothstep(0.0, smo, tt) + stp;
}

// SDF (Signed Distance Function) for Volumetric Raymarching
// various volume shapes
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);
    t = clamp(t, 0.0, 1.0);

    vec3 c = a + t * ab;

    float d = length(p - c) - r;

    return d;
}

float sdSphere(vec3 p, float radius) {
    return length(p) - radius;
}

float sdTorus(vec3 p, vec2 r) {
    float x = length(p.xz) - r.x;
    return length(vec2(x, p.y)) - r.y;
}

float sdCross(vec3 p, float s) {
    float da = max(abs(p.x), abs(p.y));
    float db = max(abs(p.y), abs(p.z));
    float dc = max(abs(p.z), abs(p.x));

    return min(da, min(db, dc)) - s;
}

// Custom Noise for Clouds ☁️
float noise(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  vec2 uv = (p.xy + vec2(37.0, 239.0) * p.z) + f.xy;
  // 💡 textureLod - explicitly higher detail
  vec2 tex = textureLod(uNoise,(uv + 0.5) / 256.0, 0.0).yx;

  return mix( tex.x, tex.y, f.z ) * 2.0 - 1.0;
}

// Fractal Brownian Motion
float fbm(vec3 p, bool lowRes) {
  vec3 q = p + uTime * 0.5 * vec3(1.0, -0.2, -1.0);
  float g = noise(q);

  float f = 0.0;
  float scale = 0.5;
  float factor = 2.02;

  int maxOctave = 6;

    if(lowRes) {
        maxOctave = 3;
    }

  for (int i = 0; i < maxOctave; i++) {
      f += scale * noise(q);
      q *= factor;
      factor += 0.21;
      scale *= 0.5;
  }

  return f;
}


// where we set up how to draw the shapes
// density: positive - inside, 0 - outside
float scene(vec3 p, bool lowRes) {
    // vec3 p1 = p;
    // p1.xz *= rotate2D(-PI * 0.1);
    // p1.yz *= rotate2D(PI * 0.3);

    // various volume shapes
    // float s1 = sdTorus(p1, vec2(1.3, 0.9));
    // float s2 = sdCross(p1 * 2.0, 0.6);
    // float s3 = sdSphere(p, 1.5);
    // float s4 = sdCapsule(p, vec3(-2.0, -1.5, 0.0), vec3(2.0, 1.5, 0.0), 1.0);

    // time sequence
    // float seconds = 10.0;    // how long to play a shape
    // float t = mod(nextStep(uTime, seconds, 1.2), 4.0);

    // float distance = mix(s3, s1, clamp(t, 0.0, 1.0));
    // distance = mix(distance, s2, clamp(t - 1.0, 0.0, 1.0));
    // distance = mix(distance, s3, clamp(t - 2.0, 0.0, 1.0));
    // distance = mix(distance, s4, clamp(t - 3.0, 0.0, 1.0));

    float distance = sdSphere(p, 1.2);

    float f = fbm(p, lowRes);

    return -distance + f;
}

const float MARCH_SIZE = 0.16;

// Sampling Lights
float lightmarch(vec3 position, vec3 rayDirection) {
    vec3 sunDirection = normalize(uSunPosition);
    float totalDensity = 0.0;
    float marchSize = 0.03;

    for(int step = 0; step < MAX_STEPS_LIGHTS; step++) {
        position += sunDirection * marchSize * float(step);

        float lightSample = scene(position, true);
        totalDensity += lightSample;
    }

    float transmittance = BeersLaw(totalDensity, uAbsorptionCoeff);
    return transmittance;
}

// Volumetric Raymarching
float raymarch(vec3 rayOrigin, vec3 rayDirection, float offset) {
    float depth = 0.0;
    // Blue Noise
    depth += MARCH_SIZE * offset;

    // Camera & Light source
    vec3 p = rayOrigin + depth * rayDirection;
    vec3 sunDirection = normalize(uSunPosition);

    // Light absorbance
    float totalTransmittance = 1.0;
    float lightEnergy = 0.0;

    // Anisotropic light scattering
    float phase = HenyeyGreenstein(SCATTERING_ANISO, dot(rayDirection, sunDirection));

    for(int i = 0; i < MAX_STEPS; i++) {
        float density = scene(p, false);

        // draw only when density >0 (inside clouds)
        if(density > 0.0) {
            float lightTransmittance = lightmarch(p, rayDirection);
            float luminance = 0.025 + density * phase;

            totalTransmittance *= lightTransmittance;
            lightEnergy += totalTransmittance * luminance;
        }

        depth += MARCH_SIZE;
        p = rayOrigin + depth * rayDirection;
    }

    // return res;
    return lightEnergy;
}

void main()
{
    vec2 uv = vUv;
    uv -= 0.5;

    // 💡 Ray origin (camera)
    vec3 ro = vec3(0.0, 0.0, 5.0);
    // Ray direction
    vec3 rd = normalize(vec3(uv, -1.0));

    vec3 color = vec3(0.0);

    // 🌞 Sun and Sky
    vec3 sunDirection = normalize(uSunPosition);
    float sun = clamp(dot(sunDirection, rd), 0.0, 1.0);
    // base sky color
    color = uSkyColor;
    // add vertical gradient to sky
    color -= 0.8 * vec3(0.90, 0.75, 0.90) * rd.y;
    // add sun color to sky
    color += 0.5 * uSunColor * pow(sun, 10.0);

    // 🌀 Blue Noise Dithering
    // remove artifacts
    float blueNoise = texture2D(uBlueNoise, gl_FragCoord.xy / 1024.0).r;
    // 📝 temporal aspect - reduce dithering pattern
    // but it's not showing any differences on my screen
    float offset = fract(blueNoise + float(uFrame % 32) / sqrt(0.5));

    // ☁️ Clouds
    float res = raymarch(ro, rd, offset);
    color = color + uSunColor * res;

    gl_FragColor = vec4(color, 1.0);

}