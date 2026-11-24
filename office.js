/* Feedback Face-Off: the 3D office ("Tejo & Partners", Lisbon).
   A stylised but well-lit office the camera walks through; colleagues walk up, talk and react. */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const EYE = 1.62;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const rnd = (a, b) => a + Math.random() * (b - a);

/* ---------- canvas textures ---------- */
function canvasTex(w, h, draw, repeat){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]) }
  return t;
}
const woodTex = () => canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#b08a5c'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) {
    const y = r * 64, off = (r % 2) * 180;
    for (let x = -off; x < w; x += 360) {
      const shade = 160 + Math.floor(Math.random() * 34);
      g.fillStyle = `rgb(${shade},${shade - 32},${shade - 78})`; g.fillRect(x, y, 356, 62);
      g.strokeStyle = 'rgba(90,60,30,.08)';
      for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(x, y + rnd(4, 58)); g.bezierCurveTo(x + 120, y + rnd(4, 58), x + 240, y + rnd(4, 58), x + 356, y + rnd(4, 58)); g.stroke() }
    }
  }
}, [6, 6]);
const carpetTex = () => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#7d848c'; g.fillRect(0, 0, w, h);
  const d = g.getImageData(0, 0, w, h);
  for (let i = 0; i < d.data.length; i += 4) { const n = rnd(-14, 14); d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n }
  g.putImageData(d, 0, 0);
}, [10, 10]);
const screenTex = () => canvasTex(256, 160, (g, w, h) => {
  g.fillStyle = '#eef2f7'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f3a5f'; g.fillRect(0, 0, w, 18);
  g.fillStyle = '#ffd84a'; g.fillRect(12, 32, 70, 46);
  g.fillStyle = '#3d6fb5'; for (let i = 0; i < 6; i++) g.fillRect(100 + i * 24, 120 - i * 12, 16, 12 + i * 12);
  g.fillStyle = '#c8d1dc'; for (let i = 0; i < 5; i++) g.fillRect(12, 92 + i * 12, 70, 5);
});
function signTex(){
  return canvasTex(1400, 300, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.textBaseline = 'middle';
    g.font = '800 130px Manrope, system-ui, sans-serif';
    const parts = [['TEJO ', '#101418'], ['& ', '#c08a1e'], ['PARTNERS', '#101418']];
    let x = 170; parts.forEach(([s, c]) => { g.fillStyle = c; g.fillText(s, x, 130); x += g.measureText(s).width });
    g.fillStyle = '#ffd84a'; g.fillRect(30, 76, 100, 110);
    g.fillStyle = '#101418'; g.fillRect(58, 108, 44, 46);
    g.font = '600 40px Manrope, system-ui, sans-serif'; g.fillStyle = '#5b6672'; g.fillText('Strategy · Advisory · Lisbon', 172, 240);
  });
}
function lisbonTex(){
  return canvasTex(2400, 900, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * .62);
    sky.addColorStop(0, '#7fb2e0'); sky.addColorStop(.7, '#cfe3f2'); sky.addColorStop(1, '#f6e7cf');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.7)';
    for (let i = 0; i < 9; i++) { const x = rnd(0, w), y = rnd(40, 260); for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + k * 40, y + rnd(-8, 8), rnd(50, 90), rnd(14, 24), 0, 0, 7); g.fill() } }
    // south bank hills + Cristo Rei
    g.fillStyle = '#9db1a8';
    g.beginPath(); g.moveTo(0, h * .55); for (let x = 0; x <= w; x += 60) g.lineTo(x, h * .52 - Math.sin(x / 300) * 22 - Math.sin(x / 90) * 6); g.lineTo(w, h * .62); g.lineTo(0, h * .62); g.fill();
    g.fillStyle = '#7f918a'; g.fillRect(w * .78, h * .37, 10, h * .15); g.fillRect(w * .78 - 26, h * .36, 62, 8); g.fillRect(w * .78 - 4, h * .33, 18, 22);
    // river
    const riv = g.createLinearGradient(0, h * .55, 0, h * .7); riv.addColorStop(0, '#8fb6cf'); riv.addColorStop(1, '#5f8fae');
    g.fillStyle = riv; g.fillRect(0, h * .56, w, h * .14);
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { const x = rnd(0, w), y = rnd(h * .58, h * .69); g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(20, 60), y); g.stroke() }
    // 25 de Abril bridge
    const red = '#c0392b', bx1 = w * .22, bx2 = w * .58, deck = h * .5, top = h * .2;
    g.fillStyle = red;
    [bx1, bx2].forEach(x => { g.fillRect(x - 12, top, 9, deck - top + 60); g.fillRect(x + 6, top, 9, deck - top + 60); for (let k = 0; k < 4; k++) g.fillRect(x - 12, top + 18 + k * 60, 27, 6) });
    g.fillRect(0, deck, w, 14); g.fillStyle = '#8e2a20'; g.fillRect(0, deck + 14, w, 6);
    g.strokeStyle = red; g.lineWidth = 5;
    const cable = (a, b, sag) => { g.beginPath(); g.moveTo(a, top + 6); g.quadraticCurveTo((a + b) / 2, deck + sag, b, top + 6); g.stroke() };
    cable(bx1, bx2, -60); g.beginPath(); g.moveTo(-50, deck - 30); g.quadraticCurveTo(bx1 * .5, deck - 10, bx1, top + 6); g.stroke();
    g.beginPath(); g.moveTo(bx2, top + 6); g.quadraticCurveTo(bx2 + (w - bx2) * .5, deck - 10, w + 50, deck - 30); g.stroke();
    g.lineWidth = 1.4; for (let x = bx1 + 20; x < bx2; x += 26) { const t = (x - bx1) / (bx2 - bx1), y = top + 6 + (deck - 60 - top) * (1 - Math.pow(2 * t - 1, 2)) * 1; g.beginPath(); g.moveTo(x, Math.min(deck, y + 0)); g.lineTo(x, deck); g.stroke() }
    // city in the foreground: pastel buildings, terracotta roofs
    const pal = ['#f4efe6', '#f1e3c8', '#e9d3c0', '#dfe6ea', '#f6dcc2', '#efe9df', '#e8c9a8', '#d9e4dc'];
    for (let row = 0; row < 4; row++) {
      const base = h * (.74 + row * .08);
      for (let x = -40; x < w; x += rnd(70, 150)) {
        const bw = rnd(70, 150), bh = rnd(60, 150) + row * 20;
        g.fillStyle = pal[Math.floor(Math.random() * pal.length)]; g.fillRect(x, base - bh, bw, bh + 200);
        g.fillStyle = '#b8583a'; g.beginPath(); g.moveTo(x - 6, base - bh); g.lineTo(x + bw / 2, base - bh - rnd(18, 34)); g.lineTo(x + bw + 6, base - bh); g.fill();
        g.fillStyle = 'rgba(60,80,100,.45)';
        for (let wy = base - bh + 14; wy < base - 10; wy += 26) for (let wx = x + 10; wx < x + bw - 14; wx += 22) g.fillRect(wx, wy, 10, 14);
      }
      if (row === 1) { g.fillStyle = '#6f8f5a'; for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(rnd(0, w), base - rnd(10, 40), rnd(16, 30), 0, 7); g.fill() } }
    }
  });
}

/* ---------- people ---------- */
const SKIN = ['#f1c9a5', '#e0ac85', '#c68863', '#8d5a3b', '#f5d6bd'];
export function makePerson(o = {}){
  const p = Object.assign({ skin: SKIN[0], hair: '#3b2a20', style: 'short', top: '#2f4f7f', jacket: null, bottom: '#2a2f38', shoes: '#1b1b1b', h: 1.74, female: false, glasses: false }, o);
  const M = c => new THREE.MeshStandardMaterial({ color: c, roughness: .7, metalness: 0 });
  const skin = M(p.skin), hairM = M(p.hair), topM = M(p.jacket || p.top), botM = M(p.bottom), shoeM = M(p.shoes), dark = M('#1a1a1a');
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const s = p.h / 1.74; body.scale.setScalar(s);
  const cap = (r, l, m) => { const x = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 14), m); x.castShadow = true; return x };
  // legs
  const legs = [-1, 1].map(side => {
    const g = new THREE.Group(); g.position.set(side * .095, .92, 0); body.add(g);
    const thigh = cap(.072, .74, botM); thigh.position.y = -.43; g.add(thigh);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(.11, .07, .26), shoeM); shoe.position.set(0, -.88, .05); shoe.castShadow = true; g.add(shoe);
    return g;
  });
  // torso
  const torso = cap(p.female ? .155 : .175, .42, topM); torso.position.y = 1.2; torso.scale.set(1.12, 1, .72); body.add(torso);
  const hipM = cap(p.female ? .15 : .16, .08, botM); hipM.position.y = .95; hipM.scale.set(1.12, 1, .75); body.add(hipM);
  if (p.jacket) { const shirt = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, .22, 12), M(p.top)); shirt.position.set(0, 1.33, .1); shirt.rotation.x = -.25; shirt.scale.z = .4; body.add(shirt) }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.05, .055, .12, 12), skin); neck.position.y = 1.47; body.add(neck);
  // head
  const head = new THREE.Group(); head.position.y = 1.6; body.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(.112, 28, 22), skin); skull.scale.set(.9, 1.08, .98); skull.castShadow = true; head.add(skull);
  const ears = [-1, 1].map(sd => { const e = new THREE.Mesh(new THREE.SphereGeometry(.024, 10, 8), skin); e.position.set(sd * .1, 0, 0); e.scale.set(.5, 1, .8); head.add(e); return e });
  const eyeW = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .3 });
  const eyes = [-1, 1].map(sd => {
    const g = new THREE.Group(); g.position.set(sd * .037, .018, .094); head.add(g);
    const w = new THREE.Mesh(new THREE.SphereGeometry(.016, 12, 10), eyeW); w.scale.z = .5; g.add(w);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(.0085, 10, 8), dark); pu.position.z = .007; g.add(pu);
    return g;
  });
  [-1, 1].forEach(sd => { const b = new THREE.Mesh(new THREE.BoxGeometry(.034, .007, .01), hairM); b.position.set(sd * .038, .048, .1); b.rotation.z = sd * -.08; head.add(b) });
  const nose = new THREE.Mesh(new THREE.SphereGeometry(.016, 10, 8), skin); nose.position.set(0, -.008, .11); nose.scale.set(.8, 1.1, 1); head.add(nose);
  const mouthM = new THREE.MeshStandardMaterial({ color: '#7a3b34', roughness: .6 });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(.042, .008, .01), mouthM); mouth.position.set(0, -.048, .1); head.add(mouth);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(.024, .0045, 6, 16, Math.PI * .8), mouthM); smile.rotation.z = Math.PI * 1.1; smile.position.set(0, -.04, .102); smile.visible = false; head.add(smile);
  const frown = new THREE.Mesh(new THREE.TorusGeometry(.022, .0045, 6, 16, Math.PI * .7), mouthM); frown.rotation.z = Math.PI * .15; frown.position.set(0, -.062, .1); frown.visible = false; head.add(frown);
  // hair
  if (p.style !== 'bald') {
    const cap1 = new THREE.Mesh(new THREE.SphereGeometry(.118, 26, 18, 0, Math.PI * 2, 0, Math.PI * .52), hairM);
    cap1.scale.set(.93, 1.1, 1.02); cap1.position.set(0, .012, -.006); cap1.rotation.x = -.18; cap1.castShadow = true; head.add(cap1);
    const back = new THREE.Mesh(new THREE.SphereGeometry(.116, 20, 14, 0, Math.PI * 2, Math.PI * .35, Math.PI * .4), hairM); back.scale.set(.93, 1.05, 1); back.position.z = -.012; back.rotation.x = .5; head.add(back);
  }
  if (p.style === 'long') { const l = cap(.1, .2, hairM); l.position.set(0, -.12, -.06); l.scale.set(1.05, 1, .55); head.add(l) }
  if (p.style === 'bun') { const b = new THREE.Mesh(new THREE.SphereGeometry(.052, 14, 12), hairM); b.position.set(0, .07, -.11); head.add(b) }
  if (p.style === 'ponytail') { const b = cap(.035, .14, hairM); b.position.set(0, -.04, -.12); b.rotation.x = .3; head.add(b) }
  if (p.glasses) {
    const gm = new THREE.MeshStandardMaterial({ color: '#222', roughness: .4, metalness: .3 });
    [-1, 1].forEach(sd => { const r = new THREE.Mesh(new THREE.TorusGeometry(.022, .003, 6, 20), gm); r.position.set(sd * .038, .018, .108); head.add(r) });
    const br = new THREE.Mesh(new THREE.BoxGeometry(.03, .004, .004), gm); br.position.set(0, .022, .11); head.add(br);
  }
  // arms
  const arms = [-1, 1].map(side => {
    const sh = new THREE.Group(); sh.position.set(side * (p.female ? .2 : .225), 1.38, 0); body.add(sh);
    const up = cap(.052, .24, topM); up.position.y = -.16; sh.add(up);
    const el = new THREE.Group(); el.position.y = -.32; sh.add(el);
    const fo = cap(.046, .22, topM); fo.position.y = -.14; el.add(fo);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 10), skin); hand.position.y = -.3; hand.scale.set(.8, 1.1, .6); el.add(hand);
    sh.rotation.z = side * .07;
    return { sh, el, side };
  });

  const st = { walk: 0, moving: false, talking: false, pose: 'idle', nod: 0, blink: 0, t: Math.random() * 10, seated: false, typing: false, look: null };
  function setFace(f){ mouth.visible = f === 'neutral'; smile.visible = f === 'smile'; frown.visible = f === 'frown' }
  function sit(){
    st.seated = true; legs.forEach(g => { g.rotation.x = -1.45 }); body.position.y = -.43;
  }
  function update(dt, cam){
    st.t += dt;
    const t = st.t;
    if (st.moving) {
      st.walk += dt * 6.4;
      legs[0].rotation.x = Math.sin(st.walk) * .5; legs[1].rotation.x = -Math.sin(st.walk) * .5;
      arms[0].sh.rotation.x = -Math.sin(st.walk) * .4; arms[1].sh.rotation.x = Math.sin(st.walk) * .4;
      arms.forEach(a => { a.el.rotation.x = -.25; a.sh.rotation.z = a.side * .07 });
      body.position.y = Math.abs(Math.sin(st.walk)) * .025;
    } else if (!st.seated) {
      legs.forEach(g => g.rotation.x *= .8);
      body.position.y *= .8;
      const target = {
        idle: { x: .05, z: .07, ex: -.15, ez: 0 },
        crossed: { x: -.35, z: .1, ex: -1.2, ez: 1.3 },
        open: { x: -.3, z: .22, ex: -1.0, ez: -.35 },
        shrug: { x: -.15, z: .3, ex: -1.3, ez: -.55 }
      }[st.pose] || { x: .05, z: .07, ex: -.15, ez: 0 };
      arms.forEach((a, i) => {
        const k = 1 - Math.pow(.02, dt);
        a.sh.rotation.x += (target.x + (st.talking ? Math.sin(t * 3 + i) * .06 : 0) - a.sh.rotation.x) * k;
        a.sh.rotation.z += (a.side * target.z - a.sh.rotation.z) * k;
        a.el.rotation.x += (target.ex - a.el.rotation.x) * k;
        a.el.rotation.z += (-a.side * target.ez * (st.pose === 'crossed' && i === 1 ? .85 : 1) - a.el.rotation.z) * k;
        a.el.rotation.y += (0 - a.el.rotation.y) * k;
      });
      torso.scale.y = 1 + Math.sin(t * 1.7) * .012;
      body.rotation.z = Math.sin(t * .6) * .012;
      if (st.pose === 'shrug') arms.forEach(a => a.sh.position.y = 1.38 + Math.max(0, Math.sin(t * 4)) * .03); else arms.forEach(a => a.sh.position.y = 1.38);
    }
    if (st.seated && st.typing) arms.forEach((a, i) => { a.sh.rotation.x = -.7; a.el.rotation.x = -.9 + Math.sin(t * 14 + i * 2) * .06; a.sh.rotation.z = a.side * .2 });
    // head: look at camera when arrived, nod, idle micro-motion
    let yaw = Math.sin(t * .5) * .05, pitch = Math.sin(t * .8) * .02;
    if (st.look && cam) {
      const wp = new THREE.Vector3(); head.getWorldPosition(wp);
      const local = root.worldToLocal(cam.position.clone());
      yaw = Math.max(-.8, Math.min(.8, Math.atan2(local.x, local.z)));
      pitch = Math.max(-.3, Math.min(.3, -Math.atan2(cam.position.y - wp.y, Math.hypot(local.x, local.z)) * .7));
    }
    if (st.nod > 0) { st.nod -= dt; pitch += Math.sin(st.nod * 12) * .14 }
    if (st.pose === 'crossed') pitch += .12;
    head.rotation.y += (yaw - head.rotation.y) * .12; head.rotation.x += (pitch - head.rotation.x) * .12;
    // talking mouth + blink
    mouth.scale.y = st.talking ? 1 + Math.abs(Math.sin(t * 17)) * 2.6 + Math.abs(Math.sin(t * 7)) * 1.4 : 1;
    st.blink -= dt; if (st.blink < 0) st.blink = rnd(2, 5);
    const bl = st.blink < .12 ? .1 : 1; eyes.forEach(e => e.scale.y = bl);
  }
  return { root, update, st, setFace, sit, p };
}

/* ---------- the office ---------- */
export function createOffice(container, opts = {}){
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .82;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#cfe3f2');
  scene.fog = new THREE.Fog('#e9eef3', 40, 110);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const cam = new THREE.PerspectiveCamera(58, 1, .05, 200);
  cam.position.set(0, EYE, 10);
  const look = new THREE.Vector3(0, 1.9, 0);

  scene.add(new THREE.HemisphereLight('#ffffff', '#b9a68f', .35));
  const sun = new THREE.DirectionalLight('#fff3dd', 2.2);
  sun.position.set(8, 14, -30); sun.target.position.set(-2, 0, -8); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 }); sun.shadow.bias = -.0006;
  const fill = new THREE.PointLight('#fff1dc', 18, 18, 1.6); fill.position.set(0, 3, -4); scene.add(fill);
  const fill2 = new THREE.PointLight('#fff1dc', 16, 20, 1.6); fill2.position.set(-4, 3, -14); scene.add(fill2);
  const fill3 = new THREE.PointLight('#fff1dc', 14, 18, 1.6); fill3.position.set(6, 3, -16); scene.add(fill3);

  const M = (c, r = .7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const box = (w, h, d, mat, x, y, z, cast = true) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); b.position.set(x, y, z); b.castShadow = cast; b.receiveShadow = true; scene.add(b); return b };
  const white = M('#f3f2ee', .85), metal = M('#9aa3ad', .35, .7), darkM = M('#23272e', .5), oak = M('#c9a77c', .6);
  const glass = new THREE.MeshStandardMaterial({ color: '#cfe4ee', transparent: true, opacity: .18, roughness: .05, metalness: .1, depthWrite: false });
  const frameM = M('#2b3036', .4, .5);

  // floors
  const wood = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshStandardMaterial({ map: woodTex(), roughness: .45 }));
  wood.rotation.x = -Math.PI / 2; wood.position.set(0, 0, -12); wood.receiveShadow = true; scene.add(wood);
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(11, 13), new THREE.MeshStandardMaterial({ map: carpetTex(), roughness: 1 }));
  carpet.rotation.x = -Math.PI / 2; carpet.position.set(-5, .005, -12.5); carpet.receiveShadow = true; scene.add(carpet);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), M('#d8d2c6', .95)); street.rotation.x = -Math.PI / 2; street.position.set(0, -.01, 14); street.receiveShadow = true; scene.add(street);
  for (let x = -24; x < 24; x += 1.2) box(.02, .002, 30, M('#cbc4b6', .95), x, 0, 14, false);
  // ceiling + light panels
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(26, 25), white); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.2, -12); scene.add(ceil);
  const panelM = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff8ec', emissiveIntensity: 1.1 });
  for (let x = -10; x <= 10; x += 4) for (let z = -2.5; z >= -22; z -= 3.5) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .5), panelM); pl.rotation.x = Math.PI / 2; pl.position.set(x, 3.19, z); scene.add(pl) }
  // side walls
  box(.2, 3.2, 24.5, white, -12.6, 1.6, -12); box(.2, 3.2, 24.5, white, 12.6, 1.6, -12);
  // entrance facade (z = 0): glass + mullions, sliding doors, sign band
  const facadeTop = box(26, 4.4, .4, M('#e9e6df', .9), 0, 5.4, 0);
  for (let x = -13; x <= 13; x += 2) if (Math.abs(x) > 1) box(.08, 3.2, .1, frameM, x, 1.6, 0);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(26, 3.2), glass); gl.position.set(0, 1.6, 0); scene.add(gl);
  const doorL = box(1.1, 2.6, .04, glass, -.55, 1.3, .08, false), doorR = box(1.1, 2.6, .04, glass, .55, 1.3, .08, false);
  const dfL = box(.05, 2.6, .06, frameM, -1.08, 1.3, .1), dfR = box(.05, 2.6, .06, frameM, 1.08, 1.3, .1);
  box(2.4, .1, .12, frameM, 0, 2.65, .1);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.5), new THREE.MeshBasicMaterial({ map: signTex(), transparent: true })); sign.position.set(0, 4.3, .21); scene.add(sign);
  [-5, 5].forEach(x => { const pot = box(.7, .8, .7, M('#3a3f45', .6), x, .4, 1.2); const bush = new THREE.Mesh(new THREE.SphereGeometry(.55, 16, 12), M('#4c7a45', .9)); bush.position.set(x, 1.15, 1.2); bush.castShadow = true; scene.add(bush) });
  // back wall: floor-to-ceiling windows with the Lisbon view
  for (let x = -12.5; x <= 12.5; x += 2.5) box(.1, 3.2, .12, frameM, x, 1.6, -24.4);
  box(26, .12, .14, frameM, 0, .06, -24.4); box(26, .2, .14, frameM, 0, 3.1, -24.4);
  const view = new THREE.Mesh(new THREE.PlaneGeometry(110, 41), new THREE.MeshBasicMaterial({ map: lisbonTex(), fog: false }));
  view.position.set(0, 2, -60); scene.add(view);
  const outsideFloor = new THREE.Mesh(new THREE.PlaneGeometry(30, 6), M('#b9b3a8', .9)); outsideFloor.rotation.x = -Math.PI / 2; outsideFloor.position.set(0, -.02, -27.5); scene.add(outsideFloor);

  // reception
  box(3.4, 1.08, .8, white, 0, .54, -4.2); box(3.4, .9, .06, oak, 0, .5, -3.79);
  box(3.6, .05, .9, M('#ffffff', .3), 0, 1.1, -4.2);
  const recSign = new THREE.Mesh(new THREE.PlaneGeometry(3.6, .77), new THREE.MeshBasicMaterial({ map: signTex(), transparent: true }));
  box(5, 3.2, .2, oak, 0, 1.6, -6.4); recSign.position.set(0, 2.2, -6.28); scene.add(recSign);
  box(.5, .02, .35, darkM, .9, 1.13, -4.3);

  // desks
  const scrT = screenTex();
  const chairs = [];
  function desk(x, z, ry){
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    const add = (geo, mat, px, py, pz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.castShadow = true; m.receiveShadow = true; g.add(m); return m };
    add(new THREE.BoxGeometry(1.5, .04, .75), white, 0, .74, 0);
    [-1, 1].forEach(s => add(new THREE.BoxGeometry(.05, .72, .6), metal, s * .7, .36, 0));
    add(new THREE.BoxGeometry(.56, .34, .03), darkM, 0, 1.08, -.22);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(.52, .3), new THREE.MeshStandardMaterial({ map: scrT, emissive: '#ffffff', emissiveMap: scrT, emissiveIntensity: .5 })); sc.position.set(0, 1.08, -.203); g.add(sc);
    add(new THREE.BoxGeometry(.04, .2, .04), metal, 0, .86, -.24);
    add(new THREE.BoxGeometry(.4, .015, .14), M('#dfe3e8', .5), 0, .76, .08);
    add(new THREE.BoxGeometry(.5, .06, .3), M('#e7e1d3', .9), .5, .79, -.1);
    // chair
    const ch = new THREE.Group(); ch.position.set(0, 0, .62); g.add(ch);
    const cm = M('#2e333a', .8);
    [[.48, .07, .46, 0, .48, 0], [.46, .5, .06, 0, .78, .22], [.05, .4, .05, 0, .24, 0]].forEach(([w, h, d, px, py, pz]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cm); m.position.set(px, py, pz); m.castShadow = true; ch.add(m) });
    chairs.push({ g, ch });
    return g;
  }
  const deskSpots = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const x = -9 + c * 1.6, z = -9 - r * 3.4;
    desk(x, z, 0); desk(x, z - 1.4, Math.PI);
    deskSpots.push([x, z], [x, z - 1.4]);
  }
  // meeting room (glass)
  const mr = { x1: 3.5, x2: 11.5, z1: -6.5, z2: -13 };
  [[mr.x1, (mr.z1 + mr.z2) / 2, .04, Math.abs(mr.z2 - mr.z1)], [(mr.x1 + mr.x2) / 2, mr.z1, mr.x2 - mr.x1, .04], [(mr.x1 + mr.x2) / 2, mr.z2, mr.x2 - mr.x1, .04]].forEach(([x, z, w, d]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 3.2, d), glass); m.position.set(x, 1.6, z); scene.add(m);
  });
  for (let z = mr.z1; z >= mr.z2; z -= 1.6) box(.06, 3.2, .06, frameM, mr.x1, 1.6, z);
  box(.04, .12, Math.abs(mr.z2 - mr.z1), M('#ffd84a', .5), mr.x1 - .01, 1.2, (mr.z1 + mr.z2) / 2, false);
  box(3.6, .06, 1.3, oak, 7.5, .75, -9.8); box(.1, .72, .1, metal, 6, .36, -9.8); box(.1, .72, .1, metal, 9, .36, -9.8);
  box(2.2, 1.24, .06, darkM, 7.5, 1.6, -12.85);
  const tv = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.16), new THREE.MeshStandardMaterial({ map: screenTex(), emissive: '#ffffff', emissiveMap: screenTex(), emissiveIntensity: .6 })); tv.position.set(7.5, 1.6, -12.81); scene.add(tv);
  [[6.2, -8.8], [7.5, -8.8], [8.8, -8.8], [6.2, -10.8], [7.5, -10.8], [8.8, -10.8]].forEach(([x, z]) => box(.46, .5, .46, M('#3d6fb5', .8), x, .25, z));
  // coffee bar
  box(4.2, 1, .7, M('#2b3036', .5), 8.5, .5, -20.6); box(4.4, .05, .8, M('#f2f2f2', .25), 8.5, 1.02, -20.6);
  box(.45, .5, .4, metal, 7.4, 1.3, -20.7); box(.3, .3, .3, M('#c0392b', .4), 9.4, 1.2, -20.7);
  [7.2, 8.2, 9.2].forEach(x => { const st = box(.38, .05, .38, oak, x, .72, -19.8); box(.05, .7, .05, metal, x, .35, -19.8) });
  [7.4, 8.5, 9.6].forEach(x => { const l = new THREE.Mesh(new THREE.ConeGeometry(.18, .22, 18, 1, true), M('#ffd84a', .5)); l.position.set(x, 2.4, -20.4); scene.add(l); box(.01, .8, .01, darkM, x, 2.8, -20.4, false) });
  // lounge by the window
  box(3, .42, .9, M('#d9d4cb', .95), -3, .21, -21.6); box(3, .5, .2, M('#d9d4cb', .95), -3, .6, -22.0);
  box(1.2, .38, .7, oak, -3, .19, -20.3);
  const plants = [[-11.5, -2], [11.5, -2], [-11.6, -23.4], [11.6, -23.4], [2.6, -17], [-6.5, -23.4], [4.5, -23.4], [2.8, -3]];
  plants.forEach(([x, z]) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(.28, .22, .55, 18), M('#e8e2d6', .7)); pot.position.set(x, .27, z); pot.castShadow = true; scene.add(pot);
    for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(rnd(.2, .32), 12, 10), M(i % 2 ? '#4c7a45' : '#5f8f4f', .9)); l.position.set(x + rnd(-.2, .2), .8 + i * .14, z + rnd(-.2, .2)); l.castShadow = true; scene.add(l) }
  });
  // columns
  [[-2, -11], [2.5, -15], [-2, -18]].forEach(([x, z]) => box(.45, 3.2, .45, white, x, 1.6, z));

  // background people: seated workers + receptionist
  const people = [];
  const workerLooks = [
    { skin: SKIN[1], hair: '#2b1d15', style: 'short', top: '#ffffff', jacket: '#3a4656' },
    { skin: SKIN[0], hair: '#8a5a2b', style: 'long', female: true, top: '#c9d6e3' },
    { skin: SKIN[3], hair: '#111', style: 'short', top: '#e8e2d6' },
    { skin: SKIN[4], hair: '#d8b56a', style: 'bun', female: true, top: '#2f4f7f' },
    { skin: SKIN[2], hair: '#1b1b1b', style: 'ponytail', female: true, top: '#7d4f8c' },
    { skin: SKIN[0], hair: '#4a3a2a', style: 'short', top: '#5f8f4f', glasses: true }
  ];
  [0, 3, 5, 8, 10, 13, 15].forEach((di, i) => {
    const [x, z] = deskSpots[di], back = di % 2 === 1;
    const w = makePerson(workerLooks[i % workerLooks.length]); w.sit(); w.st.typing = true;
    w.root.position.set(x, 0, z + (back ? -.62 : .62)); w.root.rotation.y = back ? 0 : Math.PI;
    scene.add(w.root); people.push(w);
  });
  const recep = makePerson({ skin: SKIN[1], hair: '#2b1d15', style: 'bun', female: true, top: '#ffffff', jacket: '#101418', h: 1.68 });
  recep.root.position.set(.4, 0, -4.95); scene.add(recep.root); people.push(recep);
  // meeting in the glass room
  [[6.2, -8.8, Math.PI], [8.8, -10.8, 0]].forEach(([x, z, r], i) => { const w = makePerson(workerLooks[(i + 2) % 6]); w.sit(); w.root.position.set(x, 0, z); w.root.rotation.y = r; w.st.talking = i === 0; scene.add(w.root); people.push(w) });

  /* ---------- camera + actor control ---------- */
  let camTween = null, actors = [], extras = [];
  function moveCam(pos, tgt, dur = 2.2){
    return new Promise(res => {
      const safety = setTimeout(() => { if (camTween && camTween.res === r2) { cam.position.set(...pos); look.set(...tgt); camTween = null; res() } }, dur * 1000 + 2500);
      const r2 = () => { clearTimeout(safety); res() };
      camTween = { from: cam.position.clone(), to: new THREE.Vector3(...pos), lf: look.clone(), lt: new THREE.Vector3(...tgt), t: 0, dur, res: r2 };
    });
  }
  function setCam(pos, tgt){ cam.position.set(...pos); look.set(...tgt); camTween = null }
  function walkTo(a, x, z, speed = 1.15){
    return new Promise(res => {
      const d = Math.hypot(x - a.root.position.x, z - a.root.position.z);
      const safety = setTimeout(() => { if (a.path) { a.root.position.set(x, 0, z); a.st.moving = false; a.path = null; res() } }, (d / speed) * 1000 + 2500);
      a.path = { x, z, speed, res: () => { clearTimeout(safety); res() } }; a.st.moving = true; a.st.look = null;
    });
  }
  const spots = [
    { cam: [-4.4, EYE, -15.2], end: [-4.4, -16.7], start: [-8.5, -20.5] },
    { cam: [6.6, EYE, -16.6], end: [7.4, -18.0], start: [10.5, -19.2] },
    { cam: [2.2, EYE, -9.6], end: [3.0, -10.95], start: [3.2, -16] },
    { cam: [-1.2, EYE, -19.2], end: [-1.0, -20.65], start: [-6.5, -19.2] },
    { cam: [-6.6, EYE, -6.0], end: [-6.6, -7.45], start: [-10.6, -6.8] }
  ];
  spots.forEach(s => { const dx = s.end[0] - s.cam[0], dz = s.end[1] - s.cam[2], d = Math.hypot(dx, dz); s.end = [s.cam[0] + dx / d * 1.9, s.cam[2] + dz / d * 1.9] });
  function frame(spot, px, pz){
    const c = new THREE.Vector3(...spot.cam), p = new THREE.Vector3(px, 1.45, pz);
    const dir = p.clone().sub(c).setY(0).normalize(), right = new THREE.Vector3(-dir.z, 0, dir.x);
    return p.clone().add(right.multiplyScalar(.7)).setY(1.36).toArray();
  }
  async function approach(look_, spotIdx, opts2 = {}){
    leaveAll(true);
    const spot = spots[spotIdx % spots.length];
    const a = makePerson(look_); actors.push(a); scene.add(a.root);
    a.root.position.set(spot.start[0], 0, spot.start[1]);
    (opts2.extras || []).forEach((lk, i) => { const e = makePerson(lk); e.root.position.set(spot.end[0] + (i - 1) * .75, 0, spot.end[1] - 1.1 - (i % 2) * .4); e.st.look = true; scene.add(e.root); extras.push(e) });
    const tgt = frame(spot, spot.end[0], spot.end[1]);
    if (opts2.instant) { setCam(spot.cam, tgt); a.root.position.set(spot.end[0], 0, spot.end[1]); faceCam(a); a.st.look = true; return a }
    await moveCam(spot.cam, tgt, opts2.camDur || 2.4);
    await walkTo(a, spot.end[0], spot.end[1]);
    faceCam(a); a.st.look = true;
    return a;
  }
  function faceCam(a){ a.root.rotation.y = Math.atan2(cam.position.x - a.root.position.x, cam.position.z - a.root.position.z) }
  function current(){ return actors[actors.length - 1] }
  function react(tier){
    const a = current(); if (!a) return;
    if (tier === 'good') { a.st.pose = 'open'; a.setFace('smile'); a.st.nod = 1.1 }
    else if (tier === 'mid') { a.st.pose = 'shrug'; a.setFace('neutral') }
    else { a.st.pose = 'crossed'; a.setFace('frown') }
  }
  function leaveAll(instant){
    const go = actors.splice(0); const ex = extras.splice(0);
    ex.forEach(e => scene.remove(e.root));
    go.forEach(a => {
      if (instant) { scene.remove(a.root); return }
      a.st.pose = 'idle';
      const away = a.root.position.clone().add(new THREE.Vector3(rnd(-3, 3), 0, -5));
      walkTo(a, away.x, away.z, 1.3).then(() => scene.remove(a.root));
      setTimeout(() => scene.remove(a.root), 6000);
    });
  }
  function talking(on){ const a = current(); if (a) a.st.talking = on }
  function setPose(p){ const a = current(); if (a) a.st.pose = p }
  const lobbyView = () => setCam([0, EYE, 10.5], [0, 2.6, 0]);
  async function entry(say){
    lobbyView();
    await moveCam([0, EYE, 3.2], [0, 1.7, -4], 2.4);
    doorsOpen = true;
    await moveCam([0, EYE, -1.6], [0, 1.45, -4.9], 2.6);
    recep.st.look = true;
    if (say) await say(recep);
    await moveCam([-3.6, EYE, -4.8], [-6, 1.3, -12], 2.6);
  }
  const finalView = () => moveCam([0, EYE + .1, -18.6], [0, 2.2, -40], 3);
  const setupView = () => setCam([3.5, EYE + .4, 12], [0, 2.8, 0]);

  /* ---------- loop ---------- */
  let doorsOpen = false, last = performance.now(), running = true;
  function resize(){ const w = container.clientWidth, h = container.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix() }
  new ResizeObserver(resize).observe(container); resize();
  function tick(now){
    if (!running) return;
    const dt = Math.min(.25, (now - last) / 1000); last = now;
    if (camTween) {
      camTween.t += dt / camTween.dur; const k = ease(Math.min(1, camTween.t));
      cam.position.lerpVectors(camTween.from, camTween.to, k); look.lerpVectors(camTween.lf, camTween.lt, k);
      cam.position.y += Math.sin(camTween.t * Math.PI * 6) * .012 * Math.sin(Math.PI * Math.min(1, camTween.t));
      if (camTween.t >= 1) { const r = camTween.res; camTween = null; r() }
    } else { cam.position.y = EYE + Math.sin(now / 1400) * .006 }
    cam.lookAt(look);
    const dx = doorsOpen ? 1.05 : 0;
    doorL.position.x += (-.55 - dx - doorL.position.x) * .06; doorR.position.x += (.55 + dx - doorR.position.x) * .06;
    [...people, ...actors, ...extras].forEach(a => {
      if (a.path) {
        const p = a.root.position, d = new THREE.Vector3(a.path.x - p.x, 0, a.path.z - p.z), dist = d.length();
        if (dist < .05) { a.st.moving = false; const r = a.path.res; a.path = null; r() }
        else { d.normalize(); p.addScaledVector(d, Math.min(dist, a.path.speed * dt)); const ry = Math.atan2(d.x, d.z); a.root.rotation.y += (((ry - a.root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * .15 }
      }
      a.update(dt, cam);
    });
    renderer.render(scene, cam);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  setupView();
  return { approach, react, leaveAll, talking, setPose, entry, lobbyView, finalView, setupView, recep, moveCam, current, renderer };
}

/* ---------- ambience: soft office murmur and keyboards (Web Audio, no files) ---------- */
export function ambience(isMuted){
  let ctx = null, gain = null, on = false;
  function start(){
    if (on) return; on = true;
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)() } catch (e) { return }
    if (ctx.state === 'suspended') ctx.resume();
    gain = ctx.createGain(); gain.gain.value = 0; gain.connect(ctx.destination);
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); let l = 0;
    for (let i = 0; i < len; i++) { l = (l + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3 }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'bandpass'; lp.frequency.value = 420; lp.Q.value = .6;
    src.connect(lp); lp.connect(gain); src.start();
    gain.gain.linearRampToValueAtTime(.05, ctx.currentTime + 2);
    (function keys(){
      if (!on) return;
      if (!isMuted()) for (let i = 0; i < 2 + Math.random() * 5; i++) {
        const t = ctx.currentTime + i * rnd(.06, .14), o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = 'square'; o.frequency.value = rnd(1800, 2600); f.type = 'highpass'; f.frequency.value = 1500;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.006, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .03);
        o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .05);
      }
      setTimeout(keys, rnd(600, 2200));
    })();
  }
  function setMuted(m){ if (gain && ctx) gain.gain.linearRampToValueAtTime(m ? 0 : .05, ctx.currentTime + .4) }
  return { start, setMuted };
}
