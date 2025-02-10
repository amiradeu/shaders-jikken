import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane'
import baseVertexShader from './shaders/base/vertex.glsl'
import baseFragmentShader from './shaders/base/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new Pane()
const patternDebug = gui.addFolder({ title: 'Pattern' })
const paletteDebug = gui.addFolder({ title: 'Palette' })
const palette = {
    color1: '#5deea8',
    color2: '#ef31e3',
}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: baseVertexShader,
    fragmentShader: baseFragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: 0.2 },
        uFrequency: { value: 40 },
        uSpeed: { value: 8 },

        // Palette
        uColor1: { value: new THREE.Color(palette.color1) },
        uColor2: { value: new THREE.Color(palette.color2) },
    },
})

patternDebug.addBinding(material.uniforms.uAmplitude, 'value', {
    label: 'amplitude',
    min: 0,
    max: 2,
})
patternDebug.addBinding(material.uniforms.uFrequency, 'value', {
    label: 'frequency',
    min: 0,
    max: 100,
})
patternDebug.addBinding(material.uniforms.uSpeed, 'value', {
    label: 'speed',
    min: 0,
    max: 20,
})

paletteDebug.addBinding(palette, 'color1').on('change', () => {
    material.uniforms.uColor1.value.set(palette.color1)
})
paletteDebug.addBinding(palette, 'color2').on('change', () => {
    material.uniforms.uColor2.value.set(palette.color2)
})

// Mesh
const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)

// Axes helper
const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
)
camera.position.set(0, 0, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update materials
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
