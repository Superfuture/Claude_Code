'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ── Shared vertex shader ────────────────────────────────────────────────────

const vert = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ── Orb fragment shader (matches peggygou.com technique exactly) ────────────
// Technique: simplex noise + HSV hue rotation + two-circle orbit per orb

const frag = /* glsl */`
  uniform float time;
  uniform vec2  resolution;

  // ── 2D Simplex noise (Stefan Gustavson) ──────────────────────────────────
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy  -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x  = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // ── HSV ↔ RGB (Peggy's exact implementation) ─────────────────────────────
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  vec3 rgb2hsv(vec3 c) {
    vec4 K  = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p  = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q  = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0*d + e)), d/(q.x + e), q.x);
  }

  // ── Soft circle SDF (Peggy's exact circle function) ──────────────────────
  // radius, blur, cx, cy in aspect-corrected UV space
  float circle(vec2 uv, float radius, float blur, float cx, float cy) {
    vec2 d = uv - vec2(cx, cy);
    return 1.0 - smoothstep(radius - radius*blur,
                            radius + radius*blur,
                            dot(d, d) * 4.0);
  }

  void main() {
    // Screen-space UV: (0,0) = bottom-left, (1,1) = top-right
    vec2 uv = gl_FragCoord.xy / resolution;
    float aspect = resolution.x / resolution.y;
    // aspect-corrected UV for circular (not oval) orbs
    vec2 aUV = vec2(uv.x * aspect, uv.y);

    vec3 col = vec3(0.0);

    // ── Orb 1 — electric cyan, left-center ───────────────────────────────
    {
      float cx  = 0.28 * aspect + 0.04 * sin(time * 0.05);
      float cy  = 0.55 + 0.03  * cos(time * 0.038);
      float spd = 2.0;   // orbit speed (rad/s)
      float ox  = cx + 0.03 * sin(time * spd);
      float oy  = cy + 0.03 * cos(time * spd);
      float va  = circle(aUV, 0.43, 0.88, cx, cy);
      float vb  = circle(aUV, 0.18, 1.00, ox, oy);
      vec3  c   = vec3(0.0, 0.831, 1.0); // #00D4FF
      vec3  hsv = rgb2hsv(c);
      hsv.x = fract(hsv.x + snoise(uv * 1.5 + time * 0.008) * 0.07);
      col += hsv2rgb(hsv) * (va * 0.41 + vb * 0.50);
    }

    // ── Orb 2 — hot pink, right-center ───────────────────────────────────
    {
      float cx  = 0.72 * aspect + 0.035 * cos(time * 0.042);
      float cy  = 0.50 + 0.040 * sin(time * 0.033);
      float spd = 1.8;
      float ox  = cx + 0.03 * sin(time * spd + 1.0);
      float oy  = cy - 0.03 * cos(time * spd + 1.0);
      float va  = circle(aUV, 0.40, 0.88, cx, cy);
      float vb  = circle(aUV, 0.16, 1.00, ox, oy);
      vec3  c   = vec3(1.0, 0.0, 0.42); // #FF006B
      vec3  hsv = rgb2hsv(c);
      hsv.x = fract(hsv.x + snoise(uv * 1.2 + time * 0.007 + vec2(5.2, 1.3)) * 0.07);
      col += hsv2rgb(hsv) * (va * 0.41 + vb * 0.50);
    }

    // ── Orb 3 — violet/purple, lower-center ──────────────────────────────
    {
      float cx  = 0.50 * aspect + 0.025 * sin(time * 0.029);
      float cy  = 0.30 + 0.030 * cos(time * 0.051);
      float spd = 2.2;
      float ox  = cx + 0.025 * sin(time * spd + 2.5);
      float oy  = cy + 0.025 * cos(time * spd + 2.5);
      float va  = circle(aUV, 0.38, 0.90, cx, cy);
      float vb  = circle(aUV, 0.14, 1.00, ox, oy);
      vec3  c   = vec3(0.263, 0.094, 0.388); // #431863 / deep purple
      vec3  hsv = rgb2hsv(c);
      hsv.x = fract(hsv.x + snoise(uv * 1.8 + time * 0.006 + vec2(3.1, 8.7)) * 0.06);
      col += hsv2rgb(hsv) * (va * 0.41 + vb * 0.50);
    }

    // ── Orb 4 — orange, upper-left ────────────────────────────────────────
    {
      float cx  = 0.18 * aspect + 0.030 * cos(time * 0.037 + 2.0);
      float cy  = 0.78 + 0.025 * sin(time * 0.044 + 2.0);
      float spd = 1.6;
      float ox  = cx + 0.025 * sin(time * spd + 4.0);
      float oy  = cy - 0.025 * cos(time * spd + 4.0);
      float va  = circle(aUV, 0.35, 0.90, cx, cy);
      float vb  = circle(aUV, 0.13, 1.00, ox, oy);
      vec3  c   = vec3(1.0, 0.420, 0.0); // #FF6B00
      vec3  hsv = rgb2hsv(c);
      hsv.x = fract(hsv.x + snoise(uv * 1.3 + time * 0.007 + vec2(7.5, 2.1)) * 0.06);
      col += hsv2rgb(hsv) * (va * 0.41 + vb * 0.50);
    }

    // ── Orb 5 — teal/green, right-lower ──────────────────────────────────
    {
      float cx  = 0.82 * aspect + 0.030 * sin(time * 0.031 + 4.0);
      float cy  = 0.22 + 0.035 * cos(time * 0.047 + 4.0);
      float spd = 2.1;
      float ox  = cx + 0.025 * sin(time * spd + 5.5);
      float oy  = cy + 0.025 * cos(time * spd + 5.5);
      float va  = circle(aUV, 0.32, 0.90, cx, cy);
      float vb  = circle(aUV, 0.12, 1.00, ox, oy);
      vec3  c   = vec3(0.141, 0.647, 0.467); // #24A577 teal
      vec3  hsv = rgb2hsv(c);
      hsv.x = fract(hsv.x + snoise(uv * 1.6 + time * 0.006 + vec2(1.8, 5.9)) * 0.05);
      col += hsv2rgb(hsv) * (va * 0.38 + vb * 0.50);
    }

    // overall dim so the hero stays dark and cinematic
    col *= 0.72;

    gl_FragColor = vec4(col, 1.0);
  }
`

// ── Shooting-star pool ──────────────────────────────────────────────────────

const TRAIL = 24

interface SStar {
  geo: THREE.BufferGeometry
  mat: THREE.ShaderMaterial
  mesh: THREE.Points
  ox: number; oy: number
  dx: number; dy: number
  speed: number
  progress: number
  trailLen: number
  rainbow: boolean
  baseHue: number
  alive: boolean
}

const ssVert = /* glsl */`
  attribute float alpha;
  attribute vec3  starColor;
  varying float   vA;
  varying vec3    vC;
  void main() {
    vA = alpha; vC = starColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (1.5 + 4.0 * alpha) * (300.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`
const ssFrag = /* glsl */`
  varying float vA;
  varying vec3  vC;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.1, d) * vA;
    gl_FragColor = vec4(vC, a);
  }
`

function spawnStar(scene: THREE.Scene): SStar {
  const fromTop = Math.random() > 0.4
  const ox = fromTop ? (Math.random() - 0.5) * 14 : -7.5
  const oy = fromTop ? 6.0 : 1.5 + Math.random() * 4
  const angle = fromTop
    ? -(Math.PI / 2) + (Math.random() - 0.5) * 0.55
    : -(0.08 + Math.random() * 0.32)
  const speed    = 4 + Math.random() * 5
  const trailLen = 1.5 + Math.random() * 2.5
  const rainbow  = Math.random() > 0.38
  const baseHue  = Math.random()

  const positions = new Float32Array(TRAIL * 3)
  const alphas    = new Float32Array(TRAIL)
  const colors    = new Float32Array(TRAIL * 3)

  for (let i = 0; i < TRAIL; i++) {
    positions[i * 3] = ox; positions[i * 3 + 1] = oy
    if (rainbow) {
      const c = new THREE.Color().setHSL((baseHue + i / TRAIL * 0.3) % 1, 1.0, 0.72)
      colors[i*3]=c.r; colors[i*3+1]=c.g; colors[i*3+2]=c.b
    } else {
      colors[i*3]=0.85; colors[i*3+1]=0.92; colors[i*3+2]=1.0
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position',  new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('alpha',     new THREE.BufferAttribute(alphas, 1))
  geo.setAttribute('starColor', new THREE.BufferAttribute(colors, 3))

  const mat = new THREE.ShaderMaterial({
    vertexShader: ssVert, fragmentShader: ssFrag,
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const mesh = new THREE.Points(geo, mat)
  scene.add(mesh)
  return { geo, mat, mesh, ox, oy,
    dx: Math.cos(angle), dy: Math.sin(angle),
    speed, progress: 0, trailLen, rainbow, baseHue, alive: true }
}

function tickStar(s: SStar, dt: number, scene: THREE.Scene) {
  s.progress += s.speed * dt
  const hx = s.ox + s.dx * s.progress
  const hy = s.oy + s.dy * s.progress
  if (hx > 8 || hx < -8 || hy < -7) {
    s.alive = false
    scene.remove(s.mesh); s.geo.dispose(); s.mat.dispose()
    return
  }
  const posA   = s.geo.attributes.position as THREE.BufferAttribute
  const alphaA = s.geo.attributes.alpha    as THREE.BufferAttribute
  const maxD   = 16
  const env    = Math.min(s.progress * 3, Math.min((maxD - s.progress) * 0.6, 1))
  for (let i = 0; i < TRAIL; i++) {
    const frac = i / (TRAIL - 1)
    const back = (1 - frac) * s.trailLen
    posA.setXYZ(i, hx - s.dx * back, hy - s.dy * back, 0.1)
    alphaA.setX(i, Math.pow(frac, 1.4) * env)
  }
  posA.needsUpdate = true; alphaA.needsUpdate = true
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ParticleHero() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const container = mountRef.current
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100)
    camera.position.z = 4

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    renderer.setSize(innerWidth, innerHeight)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 1)
    container.appendChild(renderer.domElement)

    // ── Orb plane ─────────────────────────────────────────────────────────
    const orbUniforms = {
      time:       { value: 0 },
      resolution: { value: new THREE.Vector2(innerWidth, innerHeight) },
    }
    const orbGeo = new THREE.PlaneGeometry(22, 14)
    const orbMat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag,
      uniforms: orbUniforms,
      depthWrite: false,
    })
    const orbMesh = new THREE.Mesh(orbGeo, orbMat)
    orbMesh.position.z = -1
    scene.add(orbMesh)

    // ── Sparse star layer ─────────────────────────────────────────────────
    const NS   = 900
    const sPos = new Float32Array(NS * 3)
    const sCol = new Float32Array(NS * 3)
    const sTwk = new Float32Array(NS)

    for (let i = 0; i < NS; i++) {
      sPos[i*3]   = (Math.random() - 0.5) * 18
      sPos[i*3+1] = (Math.random() - 0.5) * 14
      sPos[i*3+2] = (Math.random() - 0.5) * 2
      sTwk[i] = Math.random() * Math.PI * 2
      const b = 0.5 + Math.random() * 0.5
      sCol[i*3]=b; sCol[i*3+1]=b; sCol[i*3+2]=b
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
    starGeo.setAttribute('color',    new THREE.BufferAttribute(sCol, 3))
    const starMat = new THREE.PointsMaterial({
      size: 0.012, vertexColors: true,
      transparent: true, opacity: 0.5, sizeAttenuation: true,
    })
    scene.add(new THREE.Points(starGeo, starMat))

    // ── Shooting stars ────────────────────────────────────────────────────
    const stars: SStar[] = []
    let nextSpawn = 0.5
    for (let i = 0; i < 2; i++) {
      const s = spawnStar(scene); s.progress = Math.random() * 4; stars.push(s)
    }

    // ── Loop ──────────────────────────────────────────────────────────────
    let t = 0, last = performance.now(), raf: number

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const now = performance.now()
      const dt  = Math.min((now - last) / 1000, 0.05)
      last = now; t += dt

      orbUniforms.time.value = t

      // star twinkle
      const cA = starGeo.attributes.color
      for (let i = 0; i < NS; i++) {
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.8 + sTwk[i] * 6.7))
        cA.setXYZ(i, tw, tw, tw)
      }
      cA.needsUpdate = true

      // shooting stars
      nextSpawn -= dt
      if (nextSpawn <= 0 && stars.filter(s => s.alive).length < 4) {
        stars.push(spawnStar(scene))
        nextSpawn = 1.8 + Math.random() * 3.5
      }
      for (const s of stars) if (s.alive) tickStar(s, dt, scene)
      for (let i = stars.length - 1; i >= 0; i--) {
        if (!stars[i].alive) stars.splice(i, 1)
      }

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = innerWidth / innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(innerWidth, innerHeight)
      orbUniforms.resolution.value.set(innerWidth, innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      for (const s of stars) { scene.remove(s.mesh); s.geo.dispose(); s.mat.dispose() }
      orbGeo.dispose(); orbMat.dispose()
      starGeo.dispose(); starMat.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 z-0" aria-hidden />
}
