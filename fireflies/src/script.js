import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane'
import baseVertexShader from './shaders/base/vertex.glsl'
import baseFragmentShader from './shaders/base/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new Pane({ title: 'Fireflies' })

const debugObject = {
    color: '#e2ff0a',
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
}
sizes.resolution = new THREE.Vector2(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
)

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    sizes.resolution.set(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
    )

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
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
camera.position.set(1, 0, 1)
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
renderer.setPixelRatio(sizes.pixelRatio)
// renderer.setClearColor(new THREE.Color('#bb3131'))

/**
 * Fireflies
 */

const count = 100
const radius = 0.5
const fillRadius = 0.8 // outer percent of circle to fill

// Geometry
const positionsArray = new Float32Array(count * 3)
const randomness = new Float32Array(count * 1)

for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // Place in a spherical randomness, instead of cube
    // radius, phi, theta
    const spherical = new THREE.Spherical(
        radius * (1 - fillRadius + Math.random() * fillRadius),
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2
    )

    const position = new THREE.Vector3()
    position.setFromSpherical(spherical)

    // Random spherical position
    positionsArray[i3] = position.x
    positionsArray[i3 + 1] = position.y
    positionsArray[i3 + 2] = position.z

    // Random cube position
    // positionsArray[i3] = Math.random() - 0.5
    // positionsArray[i3 + 1] = Math.random() - 0.5
    // positionsArray[i3 + 2] = Math.random() - 0.5

    randomness[i] = Math.random()
}

const geometry = new THREE.BufferGeometry()
geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positionsArray, 3)
)
geometry.setAttribute(
    'aRandomness',
    new THREE.Float32BufferAttribute(randomness, 1)
)

// Material
const material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: baseVertexShader,
    fragmentShader: baseFragmentShader,
    uniforms: {
        uColor: { value: new THREE.Color(debugObject.color) },
        uSize: { value: 0.1 },
        uResolution: {
            value: sizes.resolution,
        },
        uTime: {
            value: 0,
        },
        uSpeed: {
            value: 2,
        },
        uPhaseShift: {
            value: 80,
        },
    },
})

// Fireflies
const fireflies = new THREE.Points(geometry, material)
scene.add(fireflies)

// Destroy fireflies
const destroy = () => {
    scene.remove(fireflies)
    geometry.dispose()
    material.dispose()
}

// Axes helper
const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

/**
 * Debug
 */

gui.addBinding(debugObject, 'color').on('change', () => {
    material.uniforms.uColor.value.set(debugObject.color)
})
gui.addBinding(material.uniforms.uSize, 'value', {
    label: 'size',
    min: 0.01,
    max: 1,
    step: 0.01,
})

const flickerGUI = gui.addFolder({ title: 'Flicker Animation' })
flickerGUI.addBinding(material.uniforms.uSpeed, 'value', {
    label: 'speed',
    min: 1,
    max: 10,
    step: 1,
})
flickerGUI.addBinding(material.uniforms.uPhaseShift, 'value', {
    label: 'phase shift',
    min: 1,
    max: 100,
    step: 1,
})

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
