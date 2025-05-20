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

/**
 * Textures
 */
// Loaders
const textureLoader = new THREE.TextureLoader()

// Perlin Noise Texture
const perlinTexture = textureLoader.load('./perlin.png')
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping

const parameters = {
    // Fireflies
    color: '#e2ff0a',
    count: 100,
    size: 100,
    radius: 0.5,
    fillRadius: 0.8, // outer percent of circle to fill

    // Movement
    moveSpeed: 0.1,
    pathSize: 0.4,
    frequencyA: 2,
    frequencyB: 5,

    // Flicker
    flickerSpeed: 8,
    flickerSync: 80,
}

/**
 * Fireflies
 */
let firefliesGeometry = null
let firefliesMaterial = null
let fireflies = null

const generateFireflies = () => {
    // Destroy previous fireflies
    if (fireflies !== null) {
        firefliesGeometry.dispose()
        firefliesMaterial.dispose()
        scene.remove(fireflies)
    }

    const positionsArray = new Float32Array(parameters.count * 3)
    const randomness = new Float32Array(parameters.count * 1)

    // Geometry
    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        // Place in a spherical randomness, instead of cube
        // radius, phi, theta
        const spherical = new THREE.Spherical(
            parameters.radius *
                (1 -
                    parameters.fillRadius +
                    Math.random() * parameters.fillRadius),
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

    firefliesGeometry = new THREE.BufferGeometry()
    firefliesGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positionsArray, 3)
    )
    firefliesGeometry.setAttribute(
        'aRandomness',
        new THREE.Float32BufferAttribute(randomness, 1)
    )

    // Material
    firefliesMaterial = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: baseVertexShader,
        fragmentShader: baseFragmentShader,
        uniforms: {
            uPixelRatio: { value: sizes.pixelRatio },
            uTime: {
                value: 0,
            },

            // Fireflies
            uColor: { value: new THREE.Color(parameters.color) },
            uSize: { value: parameters.size },

            uPerlinTexture: { value: perlinTexture },
            uMoveSpeed: { value: parameters.moveSpeed },
            uFrequencyA: { value: parameters.frequencyA },
            uFrequencyB: { value: parameters.frequencyB },
            uPathSize: { value: parameters.pathSize },

            uFlickerSpeed: { value: parameters.flickerSpeed },
            uFlickerSync: { value: parameters.flickerSync },
        },
    })

    // Fireflies
    fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
    scene.add(fireflies)
}

generateFireflies()

// Test sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.05),
    new THREE.MeshBasicMaterial({ color: '#f544c3' })
)
scene.add(sphere)

// Axes helper
const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

/**
 * Debug
 */
// Fireflies
gui.addBinding(parameters, 'color').on('change', () => {
    firefliesMaterial.uniforms.uColor.value.set(parameters.color)
})
gui.addBinding(parameters, 'count', {
    min: 1,
    max: 1000,
    step: 1,
}).on('change', (ev) => {
    if (ev.last) generateFireflies()
})
gui.addBinding(parameters, 'radius', {
    min: 0.1,
    max: 10,
    step: 0.1,
}).on('change', (ev) => {
    if (ev.last) generateFireflies()
})
gui.addBinding(parameters, 'size', {
    label: 'Size',
    min: 1,
    max: 200,
    step: 1,
}).on('change', () => {
    firefliesMaterial.uniforms.uSize.value = parameters.size
})

// Movement
const moveGUI = gui.addFolder({ title: 'Movement' })
moveGUI
    .addBinding(parameters, 'moveSpeed', {
        label: 'speed',
        min: 0,
        max: 2,
        step: 0.01,
    })
    .on('change', () => {
        firefliesMaterial.uniforms.uMoveSpeed.value = parameters.moveSpeed
    })
moveGUI
    .addBinding(parameters, 'pathSize', {
        label: 'path size',
        min: 0,
        max: 5,
        step: 0.1,
    })
    .on('change', () => {
        firefliesMaterial.uniforms.uPathSize.value = parameters.pathSize
    })
moveGUI
    .addBinding(parameters, 'frequencyA', {
        label: 'Freq A',
        min: 1,
        max: 10,
        step: 1,
    })
    .on('change', () => {
        firefliesMaterial.uniforms.uFrequencyA.value = parameters.frequencyA
    })
moveGUI
    .addBinding(parameters, 'frequencyB', {
        label: 'Freq B',
        min: 1,
        max: 10,
        step: 1,
    })
    .on('change', () => {
        firefliesMaterial.uniforms.uFrequencyB.value = parameters.frequencyB
    })

// Flicker
const flickerGUI = gui.addFolder({ title: 'Flicker' })
flickerGUI
    .addBinding(parameters, 'flickerSpeed', {
        label: 'Speed',
        min: 1,
        max: 50,
        step: 1,
    })
    .on('change', () => {
        firefliesMaterial.uniforms.uFlickerSpeed.value = parameters.flickerSpeed
    })
flickerGUI
    .addBinding(parameters, 'flickerSync', {
        label: 'Sync',
        min: 1,
        max: 200,
        step: 1,
    })
    .on('change', () => {
        firefliesMaterial.uniforms.uFlickerSync.value = parameters.flickerSync
    })

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update materials
    firefliesMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
