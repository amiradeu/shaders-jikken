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
    crossColor: '#ffffff',
    fogColor: '#0b0c0b',
    backgroundColor: '#0a0a0a',
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(10, 10, 32, 32)

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: baseVertexShader,
    fragmentShader: baseFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
        uLineThickness: { value: 0.02 },
        uColor: { value: new THREE.Color(debugObject.color) },
        uCrossThickness: { value: 0.02 },
        uCross: { value: 0.03 },
        uCrossColor: { value: new THREE.Color(debugObject.crossColor) },

        fogColor: { value: new THREE.Color(debugObject.fogColor) },
        fogNear: { value: 1 },
        fogFar: { value: 5 },
    },
    fog: true,
})

gridFolder.addBinding(material.uniforms.uLineThickness, 'value', {
    label: 'line',
    min: 0,
    max: 1,
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

gridFolder.addBinding(material.uniforms.uCrossThickness, 'value', {
    label: 'cross thickness',
    min: 0,
    max: 1,
    step: 0.001,
})
gridFolder.addBinding(material.uniforms.uCross, 'value', {
    label: 'cross',
    min: 0,
    max: 1,
    step: 0.001,
})
gridFolder
    .addBinding(debugObject, 'crossColor', {
        label: 'color',
        picker: 'inline',
    })
    .on('change', () => {
        material.uniforms.uColor.value.set(debugObject.crossColor)
    })

// Grid Floor
const gridFloor = new THREE.Mesh(geometry, material)
gridFloor.rotation.x = Math.PI * 0.5
scene.add(gridFloor)

// Fog
// color, density
scene.fog = new THREE.Fog(debugObject.fogColor, 1, 10)
scene.background = new THREE.Color(debugObject.backgroundColor)

const fogFolder = gui.addFolder({ title: '💨 Fog' })

fogFolder.addBinding(scene.fog, 'near', {
    label: 'near',
    min: -5,
    max: 2,
    step: 0.1,
})
fogFolder.addBinding(scene.fog, 'far', {
    label: 'far',
    min: 2,
    max: 20,
    step: 0.1,
})
fogFolder
    .addBinding(debugObject, 'fogColor', {
        label: 'color',
    })
    .on('change', () => {
        scene.fog.color.set(debugObject.fogColor)
    })

gui.addBinding(debugObject, 'backgroundColor', {
    label: 'background',
}).on('change', () => {
    scene.background = new THREE.Color(debugObject.backgroundColor)
})

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
    50
)
camera.position.set(1, 1, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.minDistance = 0.5
controls.maxDistance = 15

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
