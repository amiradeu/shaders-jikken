uniform vec3 uColor;
uniform float uTime;
uniform float uFlickerSpeed;
uniform float uFlickerSync;
uniform float uFlickerPattern;

varying float vRandomness;

#define PI 3.1415926535897932384626433832795

float lerp(float begin, float end, float value) {
    return (1.0 - value) * begin + value * end;
}


void main()
{
    float pattern = float(uFlickerPattern);

    // 💡 Glow effect
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);
    // prevent boxy circle blur
    strength = smoothstep(0.0, 0.99, strength);

    // 💡 Random phase per firefly
    // phase shift - higher value, less synchronised blinking pattern
    // sin oscillates from [0,1]
    float pattern0 = sin(uTime * uFlickerSpeed + vRandomness * uFlickerSync) * 0.5 + 0.5;
    
    // Interesting curve for blinking pattern
    // https://thebookofshaders.com/05/kynd.png
    float pattern1 = 1.0 - pow(abs(sin(PI * (uTime * uFlickerSpeed + vRandomness * uFlickerSync) / 2.0) * 0.5 + 0.5), 0.5);

    float pattern2 = pow(
                cos(
                    PI * 
                    (uTime * uFlickerSpeed + uFlickerSync * vRandomness) / 
                    2.0
                ),
                0.5
        );

    float pattern3 = 1.0 - pow(abs(sin(PI * (uTime * uFlickerSpeed + vRandomness * uFlickerSync) / 2.0) * 2.0 - 1.0), 0.5);

    // Chosen Pattern
    float flicker = 
        step(0.5, 0.5 - abs(pattern - 0.0)) * pattern0 +
        step(0.5, 0.5 - abs(pattern - 1.0)) * pattern1 +
        step(0.5, 0.5 - abs(pattern - 2.0)) * pattern2 +
        step(0.5, 0.5 - abs(pattern - 3.0)) * pattern3;

    // brightness range
    flicker = lerp(10.0, 0.1, flicker);

    // 💡 Colored point
    vec3 color = mix(vec3(0.0), uColor, strength) * flicker;

    gl_FragColor = vec4(color, flicker);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}