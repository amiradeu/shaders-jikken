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
const grassDebug = gui.addFolder({ title: '🌿 Grass' })
const parameters = {
    count: 100,
    width: 0.4,
}

grassDebug.addBinding(parameters, 'count', {
    min: 1,
    max: 500,
})

grassDebug.addBinding(parameters, 'width', {
    min: 0.1,
    max: 0.5,
    step: 0.01,
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Grass
 */
// Geometry
const geometry = new THREE.BufferGeometry()

// the center of triangle at the bottom (x,z)
const centers = new Float32Array(parameters.count * 2)
// the offset of triangle (3 vertex) * (3 axis)
const positions = new Float32Array(parameters.count * 3 * 3)

for (let i = 0; i < parameters.count * 2; i++) {
    centers[i] = (Math.random() - 0.5) * 5
}

// for (let i = 0; i < parameters.count; i++) {
//     const i2 = i * 2
//     console.log('center ', i2, ': ', centers[i2], centers[i2 + 1])
// }

for (let i = 0; i < parameters.count; i++) {
    const i2 = i * 2
    const i9 = i * 3 * 3

    //left
    positions[i9 + 0] = centers[i2] - parameters.width
    positions[i9 + 1] = 0
    positions[i9 + 2] = centers[i2 + 1]

    //right
    positions[i9 + 3] = centers[i2] + parameters.width
    positions[i9 + 4] = 0
    positions[i9 + 5] = centers[i2 + 1]

    //top
    positions[i9 + 6] = centers[i2]
    positions[i9 + 7] = parameters.width * 2
    positions[i9 + 8] = centers[i2 + 1]
}

// for (let i = 0; i < parameters.count * 3; i++) {
//     const i3 = i * 3

//     console.log(
//         'vertex ',
//         i3,
//         ': ',
//         positions[i3],
//         positions[i3 + 1],
//         positions[i3 + 2]
//     )
// }

geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
)
// geometry.setAttribute('center', new THREE.Float32BufferAttribute(centers, 1))
// geometry.setAttribute('center', new THREE.Float32BufferAttribute(offsetsFromCenters, 3))

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: baseVertexShader,
    fragmentShader: baseFragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uTime: { value: 0 },
    },
})

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Cube
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)
cube.position.y = 1
// scene.add(cube)

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
camera.position.set(1, 1, 1)
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

    // Update Material
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
