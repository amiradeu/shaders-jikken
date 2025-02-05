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

const debugObject = {
    color: '#c4d6ff',
    crossColor: '#a7bbff',
    fogColor: '#c3dce2',
    backgroundColor: '#e9f6f8',
    floorColor: '#ffffff',
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
        // Floor
        uFloorColor: { value: new THREE.Color(debugObject.floorColor) },

        // Grid
        uGridThickness: { value: 0.02 },
        uGridColor: { value: new THREE.Color(debugObject.color) },

        // Cross
        uCrossThickness: { value: 0.02 },
        uCross: { value: 0.2 },
        uCrossColor: { value: new THREE.Color(debugObject.crossColor) },

        // Fog
        fogColor: { value: new THREE.Color(debugObject.fogColor) },
        fogNear: { value: 1 },
        fogFar: { value: 5 },
    },
    fog: true,
})

const gridFolder = gui.addFolder({ title: '🌐 Grid Floor' })
gridFolder.addBinding(material.uniforms.uGridThickness, 'value', {
    label: 'thickness',
    min: 0,
    max: 1,
    step: 0.001,
})
gridFolder
    .addBinding(debugObject, 'color', {
        label: 'color',
    })
    .on('change', () => {
        material.uniforms.uGridColor.value.set(debugObject.color)
    })

const crossFolder = gui.addFolder({ title: '❎ Cross Floor' })
crossFolder.addBinding(material.uniforms.uCrossThickness, 'value', {
    label: 'thickness',
    min: 0,
    max: 1,
    step: 0.001,
})
crossFolder.addBinding(material.uniforms.uCross, 'value', {
    label: 'cross',
    min: 0,
    max: 1,
    step: 0.01,
})
crossFolder
    .addBinding(debugObject, 'crossColor', {
        label: 'color',
    })
    .on('change', () => {
        material.uniforms.uCrossColor.value.set(debugObject.crossColor)
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
    max: 50,
    step: 0.1,
})
fogFolder
    .addBinding(debugObject, 'fogColor', {
        label: 'color',
    })
    .on('change', () => {
        scene.fog.color.set(debugObject.fogColor)
    })

const envFolder = gui.addFolder({ title: '🏡 Environment' })
envFolder
    .addBinding(debugObject, 'backgroundColor', {
        label: 'sky',
    })
    .on('change', () => {
        scene.background = new THREE.Color(debugObject.backgroundColor)
    })

envFolder
    .addBinding(debugObject, 'floorColor', {
        label: 'Floor',
    })
    .on('change', () => {
        material.uniforms.uFloorColor.value.set(debugObject.floorColor)
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
