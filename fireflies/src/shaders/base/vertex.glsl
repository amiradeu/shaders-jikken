uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;
uniform float uMoveSpeed;
uniform float uPathSize;
uniform float uFrequencyA;
uniform float uFrequencyB;

attribute float aRandomness;

varying float vRandomness;

vec2 lissajous(float t, float a, float b, float d)
{
	return vec2(sin(a*t+d), sin(b*t));
}

void main()
{
    vec3 newPosition = position;

    // base time input
    float t = uTime * uMoveSpeed + aRandomness * 6.2831;

    // Frequency multipliers for complexity
    float a = 3.0 + floor(aRandomness * uFrequencyA);
    float b = 2.0 + floor(aRandomness * uFrequencyB);
    float c = 1.5 + floor(aRandomness * 2.5);

    // Phase offset
    float delta = aRandomness * 3.14159; // phase difference (0 to π)

    // Lissajous movement
    newPosition.xy += uPathSize * lissajous(t, a, b, delta);
    newPosition.z += 0.2 * sin(c * t + delta * 0.5);

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // size variation
    gl_PointSize = uSize * aRandomness;
    // scale point with window resize
    gl_PointSize *= uPixelRatio;
    // scale point with camera perspective
    gl_PointSize *= 1.0 / - viewPosition.z;

    vRandomness = aRandomness;
}