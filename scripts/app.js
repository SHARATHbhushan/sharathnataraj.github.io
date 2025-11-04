/* scripts/app.js — zero-build site runtime */

// ----------------------------
// Tiny DOM helpers
// ----------------------------
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

/* ===== Brands & Stack data ===== */
// Put your logo PNG/SVGs in assets/img/brands/  (add or remove freely)
const ROBOT_BRANDS = [
  { name:'Unitree',   src:'assets/img/brands/unitree.png',   url:'https://www.unitree.com/' },
  { name:'UR',        src:'assets/img/brands/universal-robots.png', url:'https://www.universal-robots.com/' },
  { name:'Denso',     src:'assets/img/brands/denso.png',     url:'https://www.densorobotics.com/' },
  { name:'KUKA',      src:'assets/img/brands/kuka.png',      url:'https://www.kuka.com/' },
  { name:'ABB',      src:'assets/img/brands/abb.png',      url:'https://www.abb.com/' },
  { name:'fanuc',      src:'assets/img/brands/fanuc.png',      url:'https://www.fanuc.com/' }
];

const STACK = {
  "Operating Systems": ["Ubuntu 22.04","Windows 10/11","Real-time tuning basics", "JetPack OS", "Jetson/NVIDIA Linux"],
  "Robotics Middleware": ["ROS 2 (Humble/Foxy)","ROS 1","MoveIt","rosbridge","WebSockets", "MQTT", "ROS-I"],
  "Perception / ML": ["OpenCV","YOLO","OpenVINO","TensorRT","Pose Estimation (OpenPose/OpenNI)", "PoinClouds", "LiDAR processing", "3D Vision", "Intel RealSense"],
  "Simulation": ["Gazebo/Ignition","Isaac Sim","MuJoCo","Nvidia Omniverse"],
  "Embedded / RTOS": ["Microcontrollers (ARM/AVR)","FreeRTOS basics","PLC","ROS on microcontrollers"],
  "Control & Planning": ["PID/LQR basics","Trajectory gen.","Navigation stack"],
  "Tooling / DevOps": ["Git/GitHub","Docker","CI/CD","Python","C++", "MATLAB","LabVIEW","Bash scripting", "JavaScript","HTML/CSS" ]
};

/* ===== Automation & Sensors data ===== */
const AUTOMATION_SENSORS = [
  // PLCs
  { category:'PLC',    name:'SICK Safety PLC',  sub:'(Flexi Soft / Integration)',      icon:'shield' },
  { category:'PLC',    name:'Pilz PNOZmulti/PSS', sub:'Safety logic & interlocks',     icon:'shield' },
  { category:'PLC',    name:'Omron NX/NJ',      sub:'Sysmac / Safety tasks',           icon:'shield' },

  // Sensors
  { category:'Sensor', name:'SICK microScan3',  sub:'Safety laser scanner',            icon:'lidar'  },
  { category:'Sensor', name:'SICK deTec',       sub:'Safety light curtains',           icon:'curtain'},
  { category:'Sensor', name:'SICK SafeVisionary2', sub:'3D ToF safety camera',        icon:'depth'  },
  { category:'Sensor', name:'Force Sensors',    sub:'Load cells / Force plates',       icon:'force'  },
  { category:'Sensor', name:'Intel RealSense',  sub:'D435i / 3D vision',               icon:'depth'  },
  { category:'Sensor', name:'ZED 2i',           sub:'Stereo depth camera',             icon:'depth'  },
  { category:'Sensor', name:'Radar/LiDAR',      sub:'Environment perception',          icon:'lidar'  }
];
/* ==== Showcase data ==== */
const ACHIEVEMENTS = [
  { icon: "🏅", title: "Fraunhofer AHEAD Incubator Selection 2024", subtitle: "RoSA (RoboSafety Assist) project" },
  { icon: "🦾", title: "Developer — CARA", subtitle: "Computer-Aided Risk Assessment Tool" },
  { icon: "📊", title: "Architect — Robo-Dashcam", subtitle: "Safety analytics for robot cells" },
  { icon: "🤖", title: "Developed humanoid risk-prediction pipeline", subtitle: "Fraunhofer IPA" }
];

const WORKSHOPS = [
  { icon: "🎤", title: "Safe-HRC Workshop Speaker 2024", subtitle: "Fraunhofer IPA, Stuttgart" },
  { icon: "🏗️", title: "ERF Stuttgart 2023 — Robotics Forum" },
  { icon: "🧠", title: "Machine Learning Workshop", subtitle: "IIT Roorkee, 2019" }
];

const PUBLICATIONS = [
  { icon: "📜", title: "Use of Ground Penetrating Radars in Planetary Rovers (2019)", subtitle: "IJRESM", link: "https://www.ijresm.com/volume-1-issue-10-october-2019" },
  { icon: "📗", title: "Multipurpose Defense Robot (2020)", subtitle: "IRJET", link: "https://www.irjet.net/volume7-issue7" }
];


/* ===== Skills meters data (tune values anytime) ===== */
const SKILLS_CORE = [
  { name: "Safety Engineering", sub: "HRC, ISO 10218/TS15066 mindset", value: 92, colors: ["#6ee7b7","#22d3ee"] },
  { name: "Perception / CV",   sub: "OpenCV, YOLO, Pose, 3D",         value: 86, colors: ["#60a5fa","#a78bfa"] },
  { name: "Planning & Control", sub: "Nav stack, PID/LQR, traj",       value: 78, colors: ["#fbbf24","#34d399"] },
  { name: "Simulation",         sub: "Gazebo, Isaac Sim, Omniverse",   value: 82, colors: ["#93c5fd","#c084fc"] },
  { name: "Data & Analytics",   sub: "Power BI, ETL, KPIs",            value: 74, colors: ["#fb7185","#f472b6"] },
  { name: "Embedded / RT",      sub: "uC, PLC, RT basics",             value: 63, colors: ["#22d3ee","#4ade80"] }
];

// Footer meta
const now = new Date();
$('#year')    && ($('#year').textContent    = now.getFullYear());
$('#updated') && ($('#updated').textContent = now.toISOString().slice(0,10));

// ----------------------------
// Loaders (with graceful fallback)
// ----------------------------
async function loadJSON(candidates) {
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch (_) { /* ignore and try next */ }
  }
  return null;
}

// Site meta (hero/skills/etc.) – optional file
const SITE_META_PATHS = [
  'assets/data/contents.json',
  'data/contents.json'
];

// Projects manifest (groups with items)
const PROJECTS_PATHS = [
  'assets/data/contents.json',  // primary (your latest)
  'data/contents.json'          // fallback
];

// ----------------------------
// Boot
// ----------------------------
(async function boot() {
  // Load optional site meta (hero, skills, etc.)
  const meta = await loadJSON(SITE_META_PATHS);
  if (meta) renderSiteMeta(meta);
  renderBrands();
  renderStack();
  renderAutomationSensors();
  renderShowcase("achievements-grid", ACHIEVEMENTS, "achievement");
  renderShowcase("workshops-grid", WORKSHOPS, "workshop");
  renderShowcase("publications-grid", PUBLICATIONS, "publication");
  renderSkills();
  enhanceMediaCards();


  // Load grouped projects and render
  const contents = await loadJSON(PROJECTS_PATHS);
  if (contents?.groups) {
    renderProjectsFromContents(contents);
    // Ensure autoplay behavior after projects render
    setupAutoplay();
  } else {
    const root = $('#projects-root');
    if (root) {
      root.innerHTML = `<div class="panel">No <code>assets/data/contents.json</code> (or <code>data/contents.json</code>) found.</div>`;
    }
  }

  // Chart.js sample (safe if canvas missing)
  drawSampleGitChart();
})();

// ----------------------------
// Rendering: site meta sections
// ----------------------------
function renderSiteMeta(data) {
  // Hero tags
  const heroTags = $('#hero-tags');
  if (heroTags && Array.isArray(data.hero?.tags)) {
    heroTags.innerHTML = data.hero.tags.map(t => `<span class="pill">${escapeHtml(t)}</span>`).join('');
  }

  // Achievements
  const ach = $('#achievements');
  if (ach && Array.isArray(data.achievements)) {
    ach.innerHTML = data.achievements.map(a => `<li>${escapeHtml(a)}</li>`).join('');
  }

  // Skills
  const skills = $('#skills-tags');
  if (skills && Array.isArray(data.skills)) {
    skills.innerHTML = data.skills.map(s => `<span class="pill">${escapeHtml(s)}</span>`).join('');
  }

  // Workshops
  const workshops = $('#workshops');
  if (workshops && Array.isArray(data.workshops)) {
    workshops.innerHTML = data.workshops.map(w => `<li>${escapeHtml(w)}</li>`).join('');
  }

  // Publications
  const pubList = $('#pub-list');
  if (pubList && Array.isArray(data.publications)) {
    pubList.innerHTML = data.publications.map(p => `
      <div style="padding:12px 0;border-bottom:1px dashed var(--border)">
        <strong>${escapeHtml(p.title || '')}</strong><br/>
        <em>${escapeHtml(p.venue || '')}</em>
        ${p.link ? `<div><a href="${p.link}" target="_blank" rel="noopener">Link</a></div>` : ''}
      </div>
    `).join('');
  }

  // Toolkit
  const toolkit = $('#toolkit-tags');
  if (toolkit && Array.isArray(data.toolkit)) {
    toolkit.innerHTML = data.toolkit.map(t => `<span class="pill">${escapeHtml(t)}</span>`).join('');
  }


  // Optional legacy “professional/personal” arrays:
  if (Array.isArray(data.professionalProjects)) {
    const grid = $('#professional-grid');
    if (grid) grid.innerHTML = data.professionalProjects.map(toCardHTML).join('');
  }
  if (Array.isArray(data.personalProjects)) {
    const grid = $('#personal-grid');
    if (grid) grid.innerHTML = data.personalProjects.map(toCardHTML).join('');
  }
}

// ----------------------------
// Rendering: grouped projects (contents.json)
// ----------------------------
function renderProjectsFromContents(contents) {
    const root = $('#projects-root');
    if (!root) return;

    root.innerHTML = (contents.groups || []).map(g => {
        const header = escapeHtml(g.title || g.id || '');
        const cards = (g.items || []).map(toCardHTML).join('');
        return `
            <h3 class="small" style="margin-top:18px; font-weight:700; color:var(--text); font-size:1.05rem; letter-spacing:0.2px">
                ${header}
            </h3>
            <div class="grid cols-2">${cards}</div>
        `;
    }).join('');
}

// ----------------------------
// Card helpers
// ----------------------------
function toCardHTML(item){
  const m = item.media || {};
  const title = escapeHtml(item.title || '');
  const desc  = escapeHtml(item.desc || '');
  const type  = (m.type || 'video').toLowerCase();
  const posterAttr = m.poster ? `poster="${m.poster}"` : '';

  const badges = (item.badges || []).map(b => `<span class="pill">${escapeHtml(b)}</span>`).join('');

  let mediaEl = '';
  if (type === 'image'){
    mediaEl = `<img src="${m.src}" alt="${title}">`;
  } else {
    const mime = getMimeFromExt(m.src);
    mediaEl = `
      <video class="mvid" muted playsinline preload="metadata" ${posterAttr}>
        <source src="${m.src}" type="${mime}">
      </video>`;
  }

  return `
    <article class="mcard">
      <div class="mstage loading" data-kind="${type}">
        ${mediaEl}
        <div class="mgrad-top"></div>
        <div class="mgrad-bottom"></div>
        <div class="mglow"></div>
        <div class="mbadge"><span class="dot"></span> <span class="mlabel">Video</span> · <span class="mdur">--:--</span></div>
        <div class="mplay">
          <div class="btn" aria-label="Play/Pause">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="mbody">
        <h3 class="mtitle">${title}</h3>
        <p class="mdesc">${desc}</p>
        ${badges ? `<div class="mtags">${badges}</div>` : ``}
      </div>
    </article>`;
}

/* Enhance media cards: duration, portrait class, hover/btn play, graceful loading */
function enhanceMediaCards(){
  const cards = Array.from(document.querySelectorAll('.mcard'));
  cards.forEach(card => {
    const stage = card.querySelector('.mstage');
    const vid   = card.querySelector('video.mvid');
    const durEl = card.querySelector('.mdur');
    const label = card.querySelector('.mlabel');
    const btn   = card.querySelector('.mplay .btn');

    // if image card
    if (!vid){
      stage.classList.remove('loading');
      if (label) label.textContent = 'Image';
      card.querySelector('.mplay')?.remove();
      card.querySelector('.mbadge .mdur')?.remove();
      return;
    }

    // metadata → duration + portrait detection
    vid.addEventListener('loadedmetadata', () => {
      stage.classList.remove('loading');
      // duration
      const d = Math.round(vid.duration || 0);
      const mm = String(Math.floor(d/60)).padStart(2, '0');
      const ss = String(d%60).padStart(2, '0');
      if (durEl) durEl.textContent = `${mm}:${ss}`;

      // portrait?
      const isPortrait = vid.videoHeight > vid.videoWidth;
      if (isPortrait) stage.classList.add('is-portrait');
    }, { once:true });

    // hover play/pause (muted)
    stage.addEventListener('mouseenter', () => { if (vid.paused) vid.play().catch(()=>{}); });
    stage.addEventListener('mouseleave', () => { if (!vid.paused) vid.pause(); });

    // button toggles play/pause
    btn?.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (vid.paused) vid.play().catch(()=>{}); else vid.pause();
    });

    // ensure muted inline
    vid.muted = true; vid.playsInline = true; vid.setAttribute('muted',''); vid.setAttribute('playsinline','');
  });
}


function getMimeFromExt(src = '') {
  const ext = src.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4':  return 'video/mp4';
    case 'webm': return 'video/webm';
    case 'ogv':
    case 'ogg':  return 'video/ogg';
    case 'avi':  return 'video/avi';        // some browsers may not play this
    case 'mov':  return 'video/quicktime';
    default:     return 'video/mp4';
  }
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

// ----------------------------
// Video autoplay (muted, loop, playsinline)
// ----------------------------
function setupAutoplay() {
  const vids = $$('video');
  vids.forEach(v => {
    v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted',''); v.setAttribute('playsinline','');
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = /** @type {HTMLVideoElement} */ (e.target);
      if (e.isIntersecting) v.play().catch(()=>{});
      else v.pause();
    });
  }, { threshold: 0.6 });
  vids.forEach(v => io.observe(v));
}

// ----------------------------
// Chart.js sample
// ----------------------------
function drawSampleGitChart() {
  const cvs = $('#gitChart');
  if (!cvs || !window.Chart) return;
  new Chart(cvs, {
    type: 'bar',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{ label: 'Commits', data: [5, 9, 4, 7, 6, 2, 1] }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}



/* ===== Render: Brands carousel ===== */
/* ===== Render: Brands carousel (center highlight, infinite) ===== */
function renderBrands() {
  const wrap = document.getElementById('car-slides');
  const vp   = wrap?.closest('.car-viewport');
  if (!wrap || !vp) return;

  // 1) Build 3x list for seamless wrap
  const data = ROBOT_BRANDS.slice();
  const N = data.length;
  const triple = [];
  for (let i = 0; i < 3 * N; i++) {
    const b = data[i % N];
    triple.push(`
      <a class="car-item" data-i="${i}" href="${b.url}" target="_blank" rel="noopener" title="${escapeHtml(b.name)}">
        <img src="${b.src}" alt="${escapeHtml(b.name)} logo" />
      </a>
    `);
  }
  wrap.innerHTML = triple.join('');
  const items = Array.from(wrap.querySelectorAll('.car-item'));

  // Start centered on the middle copy
  let idx = N;                 // current centered index (in [0..3N-1])
  let paused = false;

  function centerTo(i, withTransition = true) {
    // Toggle transition on demand (for instant teleports)
    wrap.style.transition = withTransition ? '' : 'none';

    // Mark centered item
    items.forEach(el => el.classList.remove('is-center'));
    const target = items[i];
    if (target) target.classList.add('is-center');

    // Compute translate so the selected item is centered in viewport
    // position inside slides: centerX_of_item = offsetLeft + width/2
    const itemCenter = target.offsetLeft + target.offsetWidth / 2;
    const vpCenter   = vp.clientWidth / 2;
    const translateX = vpCenter - itemCenter;

    wrap.style.transform = `translateX(${translateX}px)`;

    // Reset transition after a frame if we disabled it
    if (!withTransition) requestAnimationFrame(() => { wrap.style.transition = ''; });
  }

  // initial layout pass (after images load for accurate sizes)
  const ensureLayout = () => centerTo(idx, false);
  if (document.readyState === 'complete') ensureLayout();
  else window.addEventListener('load', ensureLayout);
  window.addEventListener('resize', () => centerTo(idx, false));

  // 2) Infinite wrap logic with instant teleports
  function goTo(newIdx) {
    idx = newIdx;

    // If we drift into the third copy, teleport back by -N (same visual spot)
    if (idx >= 2 * N) {
      centerTo(idx, true);              // animate to requested
      idx -= N;                         // logical teleport target
      // after animation ends, jump without transition to equivalent position
      setTimeout(() => centerTo(idx, false), 560);
      return;
    }
    // If we drift into the first copy, teleport forward by +N
    if (idx < N) {
      centerTo(idx, true);
      idx += N;
      setTimeout(() => centerTo(idx, false), 560);
      return;
    }
    centerTo(idx, true);
  }

  // 3) Controls + autoplay (one-by-one)
  document.querySelector('.car-prev')?.addEventListener('click', () => goTo(idx - 1));
  document.querySelector('.car-next')?.addEventListener('click', () => goTo(idx + 1));
  vp.addEventListener('mouseenter', () => paused = true);
  vp.addEventListener('mouseleave', () => paused = false);

  // auto-step every 2.8s
  setInterval(() => { if (!paused) goTo(idx + 1); }, 2800);
}


/* ===== Render: Software stack ===== */
/* Pretty gradients per category + emoji badges */
const STACK_THEME = [
  {from:"#6ee7b7", to:"#60a5fa", icon:"🧠"},
  {from:"#fca5a5", to:"#fbbf24", icon:"⚙️"},
  {from:"#a78bfa", to:"#60a5fa", icon:"🛰️"},
  {from:"#f59e0b", to:"#34d399", icon:"📦"},
  {from:"#93c5fd", to:"#c084fc", icon:"👁️"},
  {from:"#f472b6", to:"#fb7185", icon:"🧰"},
  {from:"#22d3ee", to:"#4ade80", icon:"🖥️"}
];

/* Render colorful, animated toolkit */
function renderStack() {
  const root = document.getElementById('stack-grid'); if (!root) return;

  const cats = Object.entries(STACK);
  root.innerHTML = cats.map(([cat, items], i) => {
    const t = STACK_THEME[i % STACK_THEME.length];
    const iconStyle = `--chip-bg: linear-gradient(135deg, ${t.from}, ${t.to});`;
    const chips = items.map((txt, k) => {
      // stagger animation delays through inline style
      return `<span class="chip" style="--from:${t.from};--to:${t.to};transition-delay:${80+ k*30}ms">${escapeHtml(txt)}</span>`;
    }).join('');
    return `
      <div class="stack-card" style="transition-delay:${i*80}ms">
        <div class="stack-head">
          <div class="stack-icon" style="${iconStyle}">${t.icon}</div>
          <h3 class="stack-title">${escapeHtml(cat)}</h3>
        </div>
        <div class="stack-chips">
          ${chips}
        </div>
      </div>`;
  }).join('');

  // Animate in when visible
  const cards = Array.from(root.querySelectorAll('.stack-card'));
  const chips = Array.from(root.querySelectorAll('.chip'));
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        // if it's a card, also reveal its chips
        if(e.target.classList.contains('stack-card')){
          e.target.querySelectorAll('.chip').forEach(c=>c.classList.add('in'));
        }
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(el=>io.observe(el));
  chips.forEach(el=>io.observe(el)); // fallback if card not observed
}


function asIcon(kind){
  switch(kind){
    case 'shield': return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" stroke="#0b0d10" stroke-width="1.5" fill="none"/>
        <path d="M9 12l2 2 4-4" stroke="#10b981" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    case 'lidar': return `
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="#0b0d10" stroke-width="1.5"/>
        <path d="M3 12h4M17 12h4M12 3v4M12 17v4" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5 5l2.5 2.5M19 19l-2.5-2.5M19 5l-2.5 2.5M5 19l2.5-2.5" stroke="#93c5fd" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`;
    case 'curtain': return `
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="#0b0d10" stroke-width="1.5"/>
        <path d="M8 4v16M12 4v16M16 4v16" stroke="#f59e0b" stroke-width="1.2"/>
      </svg>`;
    case 'depth': return `
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="5" y="7" width="14" height="10" rx="2" stroke="#0b0d10" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="2.5" stroke="#22d3ee" stroke-width="1.5"/>
        <path d="M2 12h3M19 12h3" stroke="#22d3ee" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`;
    case 'force': return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 18h12" stroke="#0b0d10" stroke-width="1.5" stroke-linecap="round"/>
        <rect x="10" y="6" width="4" height="9" rx="1" stroke="#10b981" stroke-width="1.5"/>
        <path d="M12 3v3" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
    default: return `<svg viewBox="0 0 24 24"></svg>`;
  }
}


function renderAutomationSensors(){
  const root = document.getElementById('as-honeycomb'); if(!root) return;

  // Build tiles
  root.innerHTML = AUTOMATION_SENSORS.map((it, i) => `
    <div class="hex" data-category="${it.category}" style="transition-delay:${i*40}ms">
      <div class="hex-content">
        ${asIcon(it.icon)}
        <span class="badge">${it.category}</span>
        <h4>${escapeHtml(it.name)}</h4>
        <p>${escapeHtml(it.sub || '')}</p>
      </div>
    </div>
  `).join('');

  // Animate in on view
  const hexes = Array.from(root.querySelectorAll('.hex'));
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .15 });
  hexes.forEach(h => io.observe(h));

  // Filters
  const tabs = Array.from(document.querySelectorAll('.as-tab'));
  tabs.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    tabs.forEach(t => t.classList.remove('is-active'));
    btn.classList.add('is-active');

    hexes.forEach(h => {
      if (f === 'all') h.classList.remove('is-hidden');
      else h.classList.toggle('is-hidden', h.dataset.category !== f);
    });
  }));
}


/* ==== Shared showcase renderer ==== */
function renderShowcase(sectionId, items, type) {
  const root = document.getElementById(sectionId);
  if (!root) return;

  root.innerHTML = items.map((it, i) => `
    <div class="showcase-card" data-type="${type}" style="transition-delay:${i * 80}ms">
      <div class="showcase-icon">${it.icon || "⭐"}</div>
      <h4>${escapeHtml(it.title || it.name)}</h4>
      ${it.subtitle ? `<p>${escapeHtml(it.subtitle)}</p>` : ""}
      ${it.link ? `<p><a href="${it.link}" target="_blank" rel="noopener">View →</a></p>` : ""}
    </div>
  `).join("");

  const cards = Array.from(root.querySelectorAll(".showcase-card"));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(c => io.observe(c));
}


/* Render animated radial skills */
function renderSkills(){
  const root = document.getElementById('skills-grid'); if(!root) return;
  const R = 58;                       // radius
  const C = 2 * Math.PI * R;          // circumference

  root.innerHTML = SKILLS_CORE.map((s,i)=>{
    const id = `sk${i}`;
    const [c1,c2] = s.colors || ["#6ee7b7","#60a5fa"];
    return `
      <div class="skill-card" style="transition-delay:${i*70}ms">
        <div class="skill-meter" aria-label="${escapeHtml(s.name)} ${s.value}%">
          <svg viewBox="0 0 140 140" role="img" aria-labelledby="${id}-title">
            <title id="${id}-title">${escapeHtml(s.name)} — ${s.value}%</title>
            <defs>
              <linearGradient id="grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${c1}"/>
                <stop offset="100%" stop-color="${c2}"/>
              </linearGradient>
            </defs>
            <!-- track -->
            <circle class="skill-bg" cx="70" cy="70" r="${R}" fill="none" stroke-width="10"/>
            <!-- value -->
            <circle class="skill-fg" cx="70" cy="70" r="${R}" fill="none" stroke="url(#grad-${id})"
                    stroke-width="10" stroke-dasharray="${C}" stroke-dashoffset="${C}"
                    transform="rotate(-90 70 70)"/>
          </svg>
          <div class="skill-value">${s.value}%</div>
        </div>
        <div class="skill-title">${escapeHtml(s.name)}</div>
        <div class="skill-sub">${escapeHtml(s.sub || "")}</div>
      </div>
    `;
  }).join('');

  // animate in when visible (stagger + stroke-dashoffset)
  const cards = Array.from(root.querySelectorAll('.skill-card'));
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      e.target.classList.add('in');
      // animate circle
      const fg = e.target.querySelector('.skill-fg');
      const title = e.target.querySelector('.skill-title')?.textContent || '';
      const data = SKILLS_CORE.find(x => x.name === title);
      const val = Math.max(0, Math.min(100, data?.value ?? 0));
      const R = 58, C = 2 * Math.PI * R;
      const targetOffset = C * (1 - val/100);
      fg.style.transition = 'stroke-dashoffset .9s cubic-bezier(.25,.8,.25,1)';
      requestAnimationFrame(()=>{ fg.style.strokeDashoffset = targetOffset; });
      io.unobserve(e.target);
    });
  }, { threshold: .2 });
  cards.forEach(c => io.observe(c));
}


function heroCountUp(){
  const nums = Array.from(document.querySelectorAll('.hero-card .n'));
  if(!nums.length) return;
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target;
      const target = Number(el.dataset.count||0);
      const start = performance.now();
      const dur = 900;
      function step(t){
        const p = Math.min(1, (t - start)/dur);
        el.textContent = Math.round(target * (0.1 + 0.9*p));
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, {threshold:.3});
  nums.forEach(n=>io.observe(n));
}

// In your boot/init:
heroCountUp();

/* === Minimal GLTF Robot Viewer (global THREE build) === */