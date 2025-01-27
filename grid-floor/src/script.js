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
const gridFolder = gui.addFolder({ title: '🌐 Grid Floor' })
const debugObject = {
    color: '#ffffff',
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
        uLineThickness: { value: 0.01 },
        uColor: { value: new THREE.Color(debugObject.color) },
    },
})

gridFolder.addBinding(material.uniforms.uLineThickness, 'value', {
    label: 'thickness',
    min: 0,
    max: 0.1,
    step: 0.001,
})
gridFolder
    .addBinding(debugObject, 'color', {
        label: 'color',
        picker: 'inline',
    })
    .on('change', () => {
        material.uniforms.uColor.value.set(debugObject.color)
    })

// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.rotation.x = Math.PI * 0.5
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
    0.001,
    50
)
camera.position.set(0.4, 0.4, 0.4)
// camera.position.set(1.0, 1.0, 1.0)
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
const tick = () => {
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
