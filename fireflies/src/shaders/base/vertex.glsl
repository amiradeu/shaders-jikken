uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;
uniform float uSpeedVertical;

attribute float aRandomness;

varying float vRandomness;

void main()
{
    vec3 newPosition = position;
    newPosition.y += sin(uTime * uSpeedVertical * newPosition.x * 2.0) * aRandomness * 0.2;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // size variation
    gl_PointSize = uSize * aRandomness;
    // scale point with window resize
    gl_PointSize *= uPixelRatio;
    // scale point with camera perspective
    gl_PointSize *= 1.0 / - viewPosition.z;

    vRandomness = aRandomness;
}