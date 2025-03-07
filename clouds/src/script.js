import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane'
import Stats from 'stats-gl'

import baseVertexShader from './shaders/base/vertex.glsl'
import baseFragmentShader from './shaders/base/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new Pane()
const shaderGUI = gui.addFolder({ title: 'Clouds' })

const stats = new Stats({
    trackGPU: true,
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Debug Object
const debugObject = {
    sunColor: '#f2c59a',
    skyColor: '#d5d3f2',
    cloudsColor: '#cbcbdf',
}

/**
 * Clouds
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
        uNoise: { value: null },
        uBlueNoise: { value: null },
        uFrame: { value: 0 },

        uSunPosition: { value: new THREE.Vector3(1.0, 0.0, 0.0) },
        uSkyColor: { value: new THREE.Color(debugObject.skyColor) },
        uSunColor: { value: new THREE.Color(debugObject.sunColor) },
        uCloudsColor: { value: new THREE.Color(debugObject.cloudsColor) },
    },
})

shaderGUI.addBinding(material.uniforms.uSunPosition, 'value', {
    label: 'Sun pos.',
    min: -5,
    max: 5,
})

shaderGUI
    .addBinding(debugObject, 'sunColor', {
        label: 'Sun',
    })
    .on('change', (e) => {
        if (e.last) {
            // console.log('sun color change')
            material.uniforms.uSunColor.value.set(debugObject.sunColor)
        }
    })

shaderGUI
    .addBinding(debugObject, 'skyColor', {
        label: 'Sky',
    })
    .on('change', (e) => {
        if (e.last) {
            // console.log('sky color change')
            material.uniforms.uSkyColor.value.set(debugObject.skyColor)
        }
    })

shaderGUI
    .addBinding(debugObject, 'cloudsColor', {
        label: 'Clouds',
    })
    .on('change', (e) => {
        if (e.last) {
            // console.log('clouds color change')
            material.uniforms.uCloudsColor.value.set(debugObject.cloudsColor)
        }
    })

// Textures
const textureLoader = new THREE.TextureLoader()
const noiseTexture = textureLoader.load('noise2.png', (texture) => {
    material.uniforms.uNoise.value = texture
})
noiseTexture.wrapS = THREE.RepeatWrapping
noiseTexture.wrapT = THREE.RepeatWrapping
noiseTexture.minFilter = THREE.NearestMipmapLinearFilter
noiseTexture.magFilter = THREE.NearestMipmapLinearFilter
// console.log(noiseTexture)

const blueNoiseTexture = textureLoader.load('blue-noise.png', (texture) => {
    material.uniforms.uBlueNoise.value = texture
})
blueNoiseTexture.wrapS = THREE.RepeatWrapping
blueNoiseTexture.wrapT = THREE.RepeatWrapping
blueNoiseTexture.minFilter = THREE.NearestMipmapLinearFilter
blueNoiseTexture.magFilter = THREE.NearestMipmapLinearFilter

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
camera.position.set(0, 0, 0.5)
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

const container = document.querySelector('body')
stats.init(renderer)
container.appendChild(stats.dom)

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update materials
    material.uniforms.uTime.value = elapsedTime
    material.uniforms.uFrame.value += 1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Update Stats
    stats.update()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
