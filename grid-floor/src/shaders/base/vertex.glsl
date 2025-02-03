#include <fog_pars_vertex>

varying vec2 vUv;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vUv = uv;

    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>
}