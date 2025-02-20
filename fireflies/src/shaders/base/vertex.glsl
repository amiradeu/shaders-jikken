uniform float uSize;
uniform vec2 uResolution;

attribute float aRandomness;

varying float vRandomness;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position = projectionMatrix * viewPosition;

    // size variation
    gl_PointSize = uSize * aRandomness;
    // scale point with window resize
    gl_PointSize *= uResolution.y;
    // scale point with camera perspective
    gl_PointSize *= 1.0 / - viewPosition.z;

    vRandomness = aRandomness;
}