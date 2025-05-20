import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane'
import Stats from 'stats-gl'

import getFullscreenTriangle from './utils.js'

import cloudsVertexShader from './shaders/clouds/vertex.glsl'
import cloudsFragmentShader from './shaders/clouds/fragment.glsl'

import bicubicFilterVertexShader from './shaders/bicubicFilter/vertex.glsl'
import bicubicFilterFragmentShader from './shaders/bicubicFilter/fragment.glsl'

/**
 * Debug
 */
// Debug
const gui = new Pane()
const cloudsGUI = gui.addFolder({ title: '☁️ Clouds' })
const envGUI = gui.addFolder({ title: '🌏 Environment' })

// Debug Object
const debugObject = {
    sunColor: '#f2c59a',
    skyColor: '#d5d3f2',
    skyColor2: '#f0dac5',
    cloudColor: '#d5d3f2',
    resolution: 2,
}

const colorScheme = {
    violet: {
        sunColor: '#f2c59a',
        skyColor: '#d5d3f2',
    },
    punk: {
        sunColor: '#fbaa5c',
        skyColor: '#928aff',
        cloudsColor: '#dbdbff',
    },
    blues: {
        sunColor: '#cadbe5',
        skyColor: '#a8c8eb',
        cloudsColor: '#efe7e4',
    },
    day: {
        sunColor: '#cadbe5',
        skyColor: '#d2ddf1',
    },
}

// SStats
const stats = new Stats({
    trackGPU: true,
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const noiseTexture = textureLoader.load('noise2.png', (texture) => {
    material.uniforms.uNoise.value = texture
})
noiseTexture.wrapS = THREE.RepeatWrapping
noiseTexture.wrapT = THREE.RepeatWrapping
noiseTexture.minFilter = THREE.NearestMipmapLinearFilter
noiseTexture.magFilter = THREE.NearestMipmapLinearFilter

const blueNoiseTexture = textureLoader.load('blue-noise.png', (texture) => {
    material.uniforms.uBlueNoise.value = texture
})
blueNoiseTexture.wrapS = THREE.RepeatWrapping
blueNoiseTexture.wrapT = THREE.RepeatWrapping
blueNoiseTexture.minFilter = THREE.NearestMipmapLinearFilter
blueNoiseTexture.magFilter = THREE.NearestMipmapLinearFilter

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

    // Update render target
    // 💡 prevent stretching
    renderTarget.setSize(
        sizes.width / debugObject.resolution,
        sizes.height / debugObject.resolution
    )
})

/**
 *  Render Target
 */
// controls the quality of render target,
// higher value means lower quality (low res)
const renderTarget = new THREE.WebGLRenderTarget(
    sizes.width / debugObject.resolution,
    sizes.height / debugObject.resolution
)
cloudsGUI
    .addBinding(debugObject, 'resolution', {
        options: {
            '1x': 1,
            '0.5x': 2,
            '0.25x': 4,
            '0.125x': 8,
        },
    })
    .on('change', () => {
        // update render target
        renderTarget.setSize(
            sizes.width / debugObject.resolution,
            sizes.height / debugObject.resolution
        )
    })

const rtScene = new THREE.Scene()
// rtScene.background = new THREE.Color('#fcfec0')

/**
 * Clouds
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: cloudsVertexShader,
    fragmentShader: cloudsFragmentShader,
    transparent: true,
    uniforms: {
        uTime: { value: 0 },
        uNoise: { value: null },
        uBlueNoise: { value: null },
        uFrame: { value: 0 },
        uAbsorptionCoeff: { value: 0.9 },
        uSpeed: { value: 0.5 },

        uSunPosition: { value: new THREE.Vector3(2.0, 2.0, -4.0) },
        uSkyColor: { value: new THREE.Color(debugObject.skyColor) },
        uSkyColor2: { value: new THREE.Color(debugObject.skyColor2) },
        uSunColor: { value: new THREE.Color(debugObject.sunColor) },
        uCloudColor: { value: new THREE.Color(debugObject.cloudColor) },
    },
})

// Mesh
const mesh = new THREE.Mesh(geometry, material)
rtScene.add(mesh)

cloudsGUI.addBinding(material.uniforms.uAbsorptionCoeff, 'value', {
    label: 'absorption',
    min: 0,
    max: 2,
    step: 0.1,
})

cloudsGUI.addBinding(material.uniforms.uSpeed, 'value', {
    label: 'speed',
    min: 0.1,
    max: 3,
    step: 0.1,
})

envGUI.addBinding(material.uniforms.uSunPosition, 'value', {
    label: 'Sun pos.',
    min: -5,
    max: 5,
})

envGUI
    .addBinding(debugObject, 'sunColor', {
        label: 'Sun',
    })
    .on('change', (e) => {
        if (e.last) {
            // console.log('sun color change')
            material.uniforms.uSunColor.value.set(debugObject.sunColor)
        }
    })

envGUI
    .addBinding(debugObject, 'skyColor', {
        label: 'Sky 1',
    })
    .on('change', (e) => {
        if (e.last) {
            // console.log('sky color change')
            material.uniforms.uSkyColor.value.set(debugObject.skyColor)
        }
    })

envGUI
    .addBinding(debugObject, 'skyColor2', {
        label: 'Sky 2',
    })
    .on('change', (e) => {
        if (e.last) {
            material.uniforms.uSkyColor2.value.set(debugObject.skyColor2)
        }
    })

envGUI
    .addBinding(debugObject, 'cloudColor', {
        label: 'Cloud',
    })
    .on('change', (e) => {
        if (e.last) {
            // console.log('cloud color change')
            material.uniforms.uSkyColor.value.set(debugObject.cloudColor)
        }
    })
//-- above objects are added to render target scene --//

// Main Scene
const scene = new THREE.Scene()

/**
 * Bicubic Filtering
 */
const bicubicFilterMaterial = new THREE.ShaderMaterial({
    vertexShader: bicubicFilterVertexShader,
    fragmentShader: bicubicFilterFragmentShader,
    uniforms: {
        uTexture: {
            value: renderTarget.texture,
        },
    },
    blending: THREE.NoBlending,
    depthWrite: false,
    depthTest: false,
})

const bicubicFilterMesh = new THREE.Mesh(
    getFullscreenTriangle(),
    bicubicFilterMaterial
)
// objects will be rendered even if it is not in the frustum of the camera
bicubicFilterMesh.frustumCulled = false
scene.add(bicubicFilterMesh)
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

/**
 * Stats
 */
const container = document.querySelector('body')
stats.init(renderer)
container.appendChild(stats.dom)

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update clouds material
    material.uniforms.uTime.value = elapsedTime
    material.uniforms.uFrame.value += 1

    // Update bicubic filter material
    bicubicFilterMaterial.uniforms.uTexture.value = renderTarget.texture
    bicubicFilterMesh.material = bicubicFilterMaterial

    // Update controls
    controls.update()

    // Draw render target scene to render target
    renderer.setRenderTarget(renderTarget)
    renderer.render(rtScene, camera)
    renderer.setRenderTarget(null)

    // Render scene to canvas
    renderer.render(scene, camera)

    // Update Stats
    stats.update()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
