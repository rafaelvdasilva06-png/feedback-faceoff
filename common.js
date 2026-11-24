/* Shared: networking (Firebase or local mock), scoring, and the sky scene. */
(function(){
const U = {};
U.$ = s => document.querySelector(s);
U.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
U.fmt = n => Math.round(n).toLocaleString('en-US');
U.rid = (n=8) => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
U.norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
U.ls = {get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const COLORS = ['#f28c38','#58a6ff','#d7f25c','#ff6b8b','#a78bfa','#2dd4bf','#fbbf24','#f472b6','#60a5fa','#34d399','#fb7185','#c084fc'];
U.color = id => COLORS[[...String(id)].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7) % COLORS.length];

/* ---------- networking ---------- */
function makeNet(){
  const cfg = window.FIREBASE_CONFIG;
  if (cfg && cfg.databaseURL && window.firebase && !/[?&]mock/.test(location.search)) {
    firebase.initializeApp(cfg);
    const db = firebase.database(); let off = 0;
    db.ref('.info/serverTimeOffset').on('value', s => { off = s.val() || 0 });
    return {
      live: true,
      now: () => Date.now() + off,
      TS: () => firebase.database.ServerValue.TIMESTAMP,
      set: (p,v) => db.ref(p).set(v),
      update: (p,v) => db.ref(p).update(v),
      remove: p => db.ref(p).remove(),
      on: (p,cb) => { const r = db.ref(p), h = s => cb(s.val()); r.on('value', h); return () => r.off('value', h) },
      connected: cb => db.ref('.info/connected').on('value', s => cb(!!s.val()))
    };
  }
  // Local mock: shared through localStorage, so tabs on one computer can rehearse together.
  const KEY = 'altitude_mockdb', subs = [];
  const read = () => U.ls.get(KEY, {});
  const get = (t,p) => p.split('/').filter(Boolean).reduce((o,k) => o == null ? null : o[k], t) ?? null;
  const put = (t,p,v) => { const ks = p.split('/').filter(Boolean); let o = t; ks.slice(0,-1).forEach(k => { if (typeof o[k] !== 'object' || o[k] === null) o[k] = {}; o = o[k] }); if (v === null) delete o[ks[ks.length-1]]; else o[ks[ks.length-1]] = v };
  const fire = () => { const t = read(); subs.forEach(s => { const v = JSON.stringify(get(t, s.p)); if (v !== s.last) { s.last = v; s.cb(JSON.parse(v)) } }) };
  window.addEventListener('storage', e => { if (e.key === KEY) fire() });
  const write = fn => { const t = read(); fn(t); U.ls.set(KEY, t); fire(); return Promise.resolve() };
  return {
    live: false,
    now: () => Date.now(),
    TS: () => Date.now(),
    set: (p,v) => write(t => put(t,p,v)),
    update: (p,v) => write(t => Object.entries(v).forEach(([k,x]) => put(t, p + '/' + k, x))),
    remove: p => write(t => put(t,p,null)),
    on: (p,cb) => { const s = {p, cb, last: undefined}; subs.push(s); setTimeout(fire, 0); return () => subs.splice(subs.indexOf(s),1) },
    connected: cb => cb(true)
  };
}
U.net = makeNet;

/* ---------- scoring, Plain-style ---------- */
const K = [[0,100],[Math.log(1.01),98],[Math.log(1.10),83],[Math.log(1.35),55],[Math.log(2),25],[Math.log(6),0]];
U.parseNum = v => { let s = String(v ?? '').toLowerCase().replace(/[\s,']/g,''), m = 1;
  if (/k$/.test(s)) { m = 1e3; s = s.slice(0,-1) }
  else if (/(million|mil|m)$/.test(s)) { m = 1e6; s = s.replace(/(million|mil|m)$/,'') }
  else if (/(bn|b)$/.test(s)) { m = 1e9; s = s.replace(/(bn|b)$/,'') }
  const n = parseFloat(s); return isFinite(n) ? n*m : NaN };
const lev = (a,b) => { const d = Array.from({length:a.length+1}, (_,i) => [i]); for (let j=1;j<=b.length;j++) d[0][j]=j;
  for (let i=1;i<=a.length;i++) for (let j=1;j<=b.length;j++) d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return d[a.length][b.length] };
U.score = (q, raw) => {
  if (raw == null || raw === '') return {pts:0, tier:'No answer'};
  if (q.type === 'word') {
    const g = U.norm(raw), toks = g.split(' '), ok = [q.answer, ...String(q.accept||'').split(',')].map(U.norm).filter(Boolean), nr = String(q.near||'').split(',').map(U.norm).filter(Boolean);
    const hit = k => g === k || (' '+g+' ').includes(' '+k+' ') || (k.length >= 4 && toks.some(t => t.startsWith(k))) || (k.length >= 5 && (lev(k,g) <= 1 || toks.some(t => lev(t,k) <= 1)));
    if (ok.some(hit)) return {pts:125, tier:'Dialed'};
    if (nr.some(hit)) return {pts:60, tier:'Warm'};
    return {pts:0, tier:'Miss'};
  }
  const g = U.parseNum(raw), t = U.parseNum(q.answer);
  if (!isFinite(g)) return {pts:0, tier:'Miss'};
  if (q.type === 'year') { const o = Math.abs(Math.round(g) - Math.round(t));
    if (o === 0) return {pts:125, tier:'Dialed'}; if (o <= 3) return {pts:97-(o-1)*5, tier:'Close'};
    if (o <= 10) return {pts:82-(o-4)*4, tier:'Warm'}; if (o <= 25) return {pts:54-(o-11)*2, tier:'Cold'};
    return {pts:Math.max(0,24-(o-26)), tier:'Miss'} }
  if (t === 0) return g === 0 ? {pts:125, tier:'Dialed'} : {pts:0, tier:'Miss'};
  if (g <= 0) return {pts:0, tier:'Miss'};
  const L = Math.abs(Math.log(g/t)); let pts = 0;
  for (let i=1;i<K.length;i++) if (L <= K[i][0]) { const [a,pa] = K[i-1], [b,pb] = K[i]; pts = pa + (pb-pa)*(L-a)/(b-a); break }
  const tier = L<=K[1][0]?'Dialed':L<=K[2][0]?'Close':L<=K[3][0]?'Warm':L<=K[4][0]?'Cold':'Miss';
  return {pts: Math.round(pts) + (tier === 'Dialed' ? 25 : 0), tier};
};
U.showAns = (q, a) => q.type === 'word' ? a : (q.type === 'year' ? String(Math.round(U.parseNum(a))) : U.fmt(U.parseNum(a)));

/* ---------- plane art ---------- */
U.planeSVG = c => `<svg viewBox="0 0 260 96" aria-hidden="true">
 <defs><linearGradient id="fz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e9edf3"/><stop offset="1" stop-color="#b9c1cd"/></linearGradient></defs>
 <path d="M20 46 L6 8 Q5 4 10 4 L24 4 Q30 4 34 10 L62 44 Z" fill="${c}"/>
 <path d="M14 47 L52 47 L40 38 L22 39 Z" fill="#9aa4b4"/>
 <path d="M18 42 Q14 52 22 58 L210 60 Q240 60 252 53 Q256 50 250 46 Q236 38 205 38 L40 38 Q24 38 18 42 Z" fill="url(#fz)"/>
 <path d="M226 41 Q240 42 246 47 L232 47 Z" fill="#1d2433"/>
 <g fill="#3a4458">${Array.from({length:22},(_,i)=>`<rect x="${56+i*7.3}" y="44" width="3.2" height="3.6" rx="1"/>`).join('')}</g>
 <path d="M30 56 L210 56" stroke="${c}" stroke-width="2.2" opacity=".85"/>
 <path d="M104 54 L150 54 L120 86 L104 86 Z" fill="#a9b2c0"/>
 <rect x="112" y="60" width="44" height="13" rx="6.5" fill="#d3d9e2"/><rect x="150" y="62" width="8" height="9" rx="3" fill="#7d8798"/>
 <circle cx="130" cy="37" r="3" fill="#ff4d4d" class="blink"/>
 <circle cx="112" cy="86" r="2.5" fill="#7cffb2" class="blink"/>
</svg>`;

/* ---------- scene ---------- */
U.scene = (root, opts={}) => {
  root.className = 'scene';
  const cloudsAt = [[700,.12,1.1],[1400,.62,1.4],[2300,.30,1],[3100,.80,1.2],[4000,.08,1.3],[5200,.55,1.5],[6400,.25,1],[7600,.75,1.3],[8900,.45,1.2],[10200,.15,1]];
  const cloud = s => Array.from({length:6},(_,i)=>`<i style="left:${i*16*s}px;top:${(i%2?8:0)+Math.abs(2.5-i)*5}px;width:${(70+((i*37)%40))*s}px;height:${(60+((i*23)%30))*s}px"></i>`).join('');
  const buildings = Array.from({length:44},(_,i)=>{const w=26+(i*37%40),h=12+(i*53%46),x=i*48+(i*13%20);return `<rect x="${x}" y="${60-h}" width="${w}" height="${h}" fill="#1c2232"/>`+(i%3===0?`<rect x="${x+6}" y="${60-h+6}" width="2" height="2" fill="#f6d27a"/>`:'')+(i%7===2?`<rect x="${x+w/2}" y="${60-h-14}" width="3" height="14" fill="#1c2232"/><circle cx="${x+w/2+1.5}" cy="${60-h-15}" r="2" fill="#ff4d4d" class="blink"/>`:'')}).join('');
  const lightRows = [[30,26,.9],[70,40,.8],[130,62,.65],[220,100,.5],[350,150,.4]].map(([y,g,o])=>`<div class="lights" style="top:${y}px;--g:${g}px;--o:${o}"></div>`).join('');
  root.innerHTML = `<div class="beam" style="left:22%"></div><div class="beam" style="left:62%"></div>
    ${Array.from({length:6},(_,i)=>`<div class="streak ${i%3==0?'or':''}" style="top:${12+i*13}%;animation-delay:${-i*.37}s;animation-duration:${1.3+i*.21}s"></div>`).join('')}
    <div class="world"><div class="clouds"></div>
      <div class="ground"><svg class="skyline" viewBox="0 0 2160 60" preserveAspectRatio="xMidYMax slice">${buildings}</svg><div class="runway">${lightRows}</div></div></div>
    <div class="planes"></div>`;
  const world = root.querySelector('.world'), cl = root.querySelector('.clouds'), pl = root.querySelector('.planes');
  cl.innerHTML = cloudsAt.map(([a,x,s])=>`<div class="cloud" data-a="${a}" style="left:${x*100}%;width:${200*s}px;height:${80*s}px">${cloud(s)}</div>`).join('');
  let cam = {B:0, ppm:0.1};
  const H = () => root.clientHeight, W = () => root.clientWidth;
  const groundY = () => H()*(opts.ground ?? .50);   // screen px from bottom where altitude B sits
  function layout(){
    world.style.transform = `translateY(${-(groundY() - cam.B*cam.ppm)}px)`;
    cl.querySelectorAll('.cloud').forEach(c => { c.style.bottom = (+c.dataset.a * cam.ppm) + 'px' });
    const k = Math.min(1, cam.B/2500);
    root.style.background = `linear-gradient(to top, ${mix('#1a2030','#d5864a',k)} 0%, ${mix('#1c2333','#4a4a5e',k)} 38%, #141a26 72%, #0f131c 100%)`;
    root.classList.toggle('flying', cam.B > 50 || opts.alwaysFly);
  }
  function mix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const x=p(a),y=p(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')}
  let setPlanes = function(list, o={}){
    // list: [{id,name,alt,gain,color}]
    const alts = list.map(p => p.alt||0), lo = Math.min(0, ...alts.length?alts:[0]), mn = alts.length?Math.min(...alts):0, mx = alts.length?Math.max(...alts):0;
    const B = Math.max(0, mn - 350), span = Math.max(1800, mx - B + 700);
    const band = H()*(opts.band ?? .36);
    cam = {B, ppm: band/span}; layout();
    const n = Math.max(1, list.length), area = opts.area || [.06,.58];
    const spc = (W()*(area[1]-area[0]))/Math.max(1,n-1); const pw = n===1 ? (opts.maxW||190) : Math.max(64, Math.min(opts.maxW||190, spc*1.15));
    root.style.setProperty('--pw', pw+'px'); root.style.setProperty('--tf', (pw<110?12:14)+'px');
    const ids = new Set(list.map(p=>p.id));
    [...pl.children].forEach(el => { if (!ids.has(el.dataset.id)) el.remove() });
    list.forEach((p,i) => {
      let el = pl.querySelector(`[data-id="${CSS.escape(p.id)}"]`);
      if (!el) { el = document.createElement('div'); el.className = 'plane'; el.dataset.id = p.id; el.style.bottom = groundY()+'px';
        el.innerHTML = `<div class="gain"></div>${U.planeSVG(p.color||U.color(p.id))}<div class="tag"></div>`; pl.appendChild(el) }
      el.style.setProperty('--c', p.color||U.color(p.id));
      const x = area[0] + (area[1]-area[0]) * (n===1 ? .5 : i/(n-1));
      el.style.left = (x*100)+'%';
      el.querySelector('.tag').textContent = p.name;
      el.querySelector('.tag').style.display = p.hideTag ? 'none' : '';
      el.querySelector('.gain').textContent = p.gain==null ? '' : (p.gain>=0?'+':'')+U.fmt(p.gain)+' m'; el.querySelector('.gain').style.color = p.gain<0 ? '#ff7b6b' : '';
      const prev = +el.dataset.alt || 0; el.dataset.alt = p.alt||0;
      el.classList.toggle('up', (p.alt||0) > prev + 1);
      setTimeout(()=>el.classList.remove('up'), 2600);
      const stag = (i%3) * Math.min(34, pw*.24);
      el.style.bottom = (groundY() + ((p.alt||0) - B)*cam.ppm - 6 + stag) + 'px';
    });
  }
  let last=null,lastO={}; const _sp=setPlanes; setPlanes=(l,o={})=>{last=l;lastO=o;_sp(l,o)};
  new ResizeObserver(()=>{ if(last) _sp(last,lastO); else layout() }).observe(root);
  return {setPlanes};
};
window.U = U;
})();

/* ---------- sound (synthesised with Web Audio, no files) ---------- */
(function(){
  let ctx = null, master = null, hum = null, muted = U.ls.get('alt_muted', false);
  const ok = () => { if (muted) return false; if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = .7; master.connect(ctx.destination) } catch(e) { return false } } if (ctx.state === 'suspended') ctx.resume(); return true };
  const noiseBuf = () => { const b = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate), d = b.getChannelData(0); let last = 0; for (let i=0;i<d.length;i++){ const w = Math.random()*2-1; last = (last + .02*w)/1.02; d[i] = last*3.5 } return b };
  let NB = null;
  const tone = (f, t0, dur, {type='sine', vol=.2, f2=null, attack=.005}={}) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0+dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0+attack); g.gain.exponentialRampToValueAtTime(.0001, t0+dur); o.connect(g); g.connect(master); o.start(t0); o.stop(t0+dur+.05) };
  const noise = (t0, dur, {from=400, to=3000, vol=.25, q=1.2, type='bandpass'}={}) => { NB = NB || noiseBuf(); const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = NB; s.loop = true;
    f.type = type; f.Q.value = q; f.frequency.setValueAtTime(from, t0); f.frequency.exponentialRampToValueAtTime(to, t0+dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0+dur*.35); g.gain.exponentialRampToValueAtTime(.0001, t0+dur); s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0+dur+.05) };
  const N = { C5:523.25, D5:587.33, E5:659.25, G5:783.99, A5:880, C6:1046.5, E6:1318.5, G6:1568, C7:2093 };
  const S = {
    get muted(){ return muted },
    toggle(){ muted = !muted; U.ls.set('alt_muted', muted); if (muted) S.hum(false); else ok(); return muted },
    unlock(){ ok() },
    pop(){ if(!ok())return; const t=ctx.currentTime; tone(620,t,.12,{f2:980,vol:.14}); tone(1240,t+.05,.1,{vol:.05}) },
    tick(last){ if(!ok())return; const t=ctx.currentTime; tone(last?1500:1150,t,.06,{type:'square',vol:.04}) },
    lock(){ if(!ok())return; const t=ctx.currentTime; tone(N.C5,t,.09,{type:'triangle',vol:.16}); tone(N.G5,t+.08,.16,{type:'triangle',vol:.16}) },
    soft(){ if(!ok())return; const t=ctx.currentTime; tone(880,t,.08,{vol:.05}) },
    takeoff(){ if(!ok())return; const t=ctx.currentTime; noise(t,2.4,{from:150,to:1800,vol:.35,q:.7,type:'lowpass'}); tone(70,t,2.4,{type:'sawtooth',f2:180,vol:.05,attack:.6}) },
    whoosh(){ if(!ok())return; const t=ctx.currentTime; noise(t,1.6,{from:300,to:4200,vol:.22,q:1.4}) },
    reveal(){ if(!ok())return; const t=ctx.currentTime; tone(330,t,1.2,{vol:.12}); tone(495,t,1.2,{vol:.08}); tone(660,t+.02,.9,{vol:.05}) },
    tier(tr){ if(!ok())return; const t=ctx.currentTime+.15;
      const seq = tr==='Dialed'?[N.C6,N.E6,N.G6,N.C7]: tr==='Close'?[N.E5,N.G5,N.C6]: tr==='Warm'?[N.C5,N.E5]: null;
      if (seq) seq.forEach((f,i)=>tone(f,t+i*.09,.35,{type:'triangle',vol:.13}));
      else { tone(180,t,.35,{f2:90,vol:.18}) } },
    drumroll(d=2.4){ if(!ok())return; const t=ctx.currentTime; for(let i=0;i<d*22;i++){ noise(t+i/22,.06,{from:1800,to:1600,vol:.06+.12*i/(d*22),q:.8}) } },
    hit(){ if(!ok())return; const t=ctx.currentTime; tone(110,t,.5,{f2:55,vol:.3}); noise(t,.25,{from:3000,to:800,vol:.15,q:.6}) },
    fanfare(){ if(!ok())return; const t=ctx.currentTime; [[N.C5,0],[N.E5,.12],[N.G5,.24],[N.C6,.36]].forEach(([f,d])=>tone(f,t+d,.5,{type:'sawtooth',vol:.06})); [N.C6,N.E6,N.G6].forEach(f=>tone(f,t+.5,1.6,{type:'triangle',vol:.09,attack:.02})) },
    hum(on){ if (on) { if (hum || !ok()) return; NB = NB || noiseBuf(); const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = NB; s.loop = true; f.type='lowpass'; f.frequency.value = 260; g.gain.value = 0; g.gain.linearRampToValueAtTime(.09, ctx.currentTime+2); s.connect(f); f.connect(g); g.connect(master); s.start(); hum = {s,g} }
      else if (hum && ctx) { const h = hum; hum = null; h.g.gain.linearRampToValueAtTime(0, ctx.currentTime+.8); setTimeout(()=>{ try{h.s.stop()}catch(e){} }, 900) } }
  };
  U.sfx = S;
  U.speakerSVG = m => m ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6m0-6 6 6"/></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';
})();

/* ---------- confetti ---------- */
U.confetti = (dur=4500) => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9'; document.body.appendChild(c);
  const x = c.getContext('2d'), W = c.width = innerWidth*devicePixelRatio, H = c.height = innerHeight*devicePixelRatio;
  const cols = ['#d7f25c','#f28c38','#58a6ff','#ff6b8b','#ffffff','#a78bfa'];
  const ps = Array.from({length:180}, () => ({x:W*Math.random(), y:-H*Math.random()*.5, vx:(Math.random()-.5)*4, vy:2+Math.random()*5, r:Math.random()*6, w:6+Math.random()*8, h:4+Math.random()*6, c:cols[Math.floor(Math.random()*cols.length)], s:(Math.random()-.5)*.3}));
  const t0 = performance.now();
  (function f(t){ x.clearRect(0,0,W,H); ps.forEach(p=>{ p.x+=p.vx*devicePixelRatio; p.y+=p.vy*devicePixelRatio; p.r+=p.s; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-p.w/2,-p.h/2,p.w,p.h); x.restore() });
    if (t - t0 < dur) requestAnimationFrame(f); else c.remove() })(t0);
};
