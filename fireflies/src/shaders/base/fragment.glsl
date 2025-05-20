uniform vec3 uColor;
uniform float uTime;
uniform float uFlickerSpeed;
uniform float uFlickerSync;

varying float vRandomness;

// Generic Noise
float rand(float n){return fract(sin(n) * 43758.5453123);}

void main()
{
    // 💡 Glow effect
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    // 💡 Random phase per firefly
    // phase shift - higher value, less synchronised blinking pattern
    // sin oscillates from [0,1]
    float flicker = sin(uTime * uFlickerSpeed + vRandomness * uFlickerSync) * 0.5 + 0.5;

    // 💡 Colored point
    vec3 color = mix(vec3(0.0), uColor, strength) * flicker;

    gl_FragColor = vec4(color, flicker);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}