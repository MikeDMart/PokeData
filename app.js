/* ═══════════════════════════════════════════════════════════════
   POKÉDEX FIELD GUIDE — app.js
   Dark mode · Sound (cry + chiptune) · Shiny · Animated sprite
   Simplified pokéball · Viewport-fit layout
   ═══════════════════════════════════════════════════════════════ */

const TYPE_COLORS = {
  normal:   { hex: '#9e9e9e', rgb: '158,158,158' },
  fire:     { hex: '#ef5350', rgb: '239,83,80' },
  water:    { hex: '#1e88e5', rgb: '30,136,229' },
  electric: { hex: '#f9a825', rgb: '249,168,37' },
  grass:    { hex: '#43a047', rgb: '67,160,71' },
  ice:      { hex: '#00acc1', rgb: '0,172,193' },
  fighting: { hex: '#c62828', rgb: '198,40,40' },
  poison:   { hex: '#8e24aa', rgb: '142,36,170' },
  ground:   { hex: '#d4a017', rgb: '212,160,23' },
  flying:   { hex: '#5c6bc0', rgb: '92,107,192' },
  psychic:  { hex: '#e91e8c', rgb: '233,30,140' },
  bug:      { hex: '#7cb342', rgb: '124,179,66' },
  rock:     { hex: '#8d6e63', rgb: '141,110,99' },
  ghost:    { hex: '#5e35b1', rgb: '94,53,177' },
  dragon:   { hex: '#1565c0', rgb: '21,101,192' },
  dark:     { hex: '#37474f', rgb: '55,71,79' },
  steel:    { hex: '#607d8b', rgb: '96,125,139' },
  fairy:    { hex: '#d81b60', rgb: '216,27,96' },
};

const TYPE_BG = {
  normal:'#fafafa', fire:'#fff8f7', water:'#f5f9ff', electric:'#fffde7',
  grass:'#f5fbf5', ice:'#f0fbfd', fighting:'#fff5f5', poison:'#fdf5ff',
  ground:'#fffbf0', flying:'#f5f7ff', psychic:'#fff5fb', bug:'#f8fdf0',
  rock:'#faf7f5', ghost:'#f8f5ff', dragon:'#f5f8ff', dark:'#f5f6f7',
  steel:'#f5f7f8', fairy:'#fff5f9',
};
const TYPE_BG_DARK = {
  normal:'#18181a', fire:'#1a1210', water:'#101420', electric:'#1a1800',
  grass:'#101a10', ice:'#101820', fighting:'#1a1010', poison:'#180010',
  ground:'#1a1600', flying:'#101218', psychic:'#1a1018', bug:'#121a10',
  rock:'#181410', ghost:'#120f1a', dragon:'#10121a', dark:'#121416',
  steel:'#121416', fairy:'#1a1018',
};

const STAT_LABELS = { hp:'HP', attack:'ATK', defense:'DEF', 'special-attack':'SP.ATK', 'special-defense':'SP.DEF', speed:'SPD' };
const STAT_MAX = 255;

const state = {
  current: null,
  currentData: null,
  recents: JSON.parse(localStorage.getItem('pd_recents') || '[]'),
  isFirstLoad: true,
  isShiny: false,
  muted: JSON.parse(localStorage.getItem('pd_muted') || 'false'),
  theme: localStorage.getItem('pd_theme') || 'light',
};

const $ = id => document.getElementById(id);
const show = el => el.classList.add('active');
const hide = el => el.classList.remove('active');
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
const delay = ms => new Promise(r => setTimeout(r, ms));
const padId = n => '#' + String(n).padStart(3, '0');
const formatHeight = dm => (dm / 10).toFixed(1) + ' m';
const formatWeight = hg => (hg / 10).toFixed(1) + ' kg';

/* ═══════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════ */
function applyTypeTheme(primaryType) {
  const color   = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
  const isDark  = document.documentElement.dataset.theme === 'dark';
  const bgMap   = isDark ? TYPE_BG_DARK : TYPE_BG;
  const bgColor = bgMap[primaryType] || (isDark ? '#161310' : '#f5f0e8');
  const root    = document.documentElement;
  root.style.setProperty('--accent',      color.hex);
  root.style.setProperty('--accent-rgb',  color.rgb);
  root.style.setProperty('--accent-soft', `rgba(${color.rgb},.09)`);
  root.style.setProperty('--accent-mid',  `rgba(${color.rgb},.2)`);
  document.body.style.backgroundColor = bgColor;
  $('bgOrb').style.background = `radial-gradient(circle, rgba(${color.rgb},.12) 0%, transparent 70%)`;
}

function setTheme(t) {
  state.theme = t;
  document.documentElement.dataset.theme = t;
  localStorage.setItem('pd_theme', t);
  // Re-apply bg color for dark/light
  if (state.currentData) {
    const type = state.currentData.types?.[0]?.type?.name || 'normal';
    applyTypeTheme(type);
  }
}

function initTheme() {
  setTheme(state.theme);
  $('btnTheme').addEventListener('click', () => {
    setTheme(state.theme === 'light' ? 'dark' : 'light');
  });
}

/* ═══════════════════════════════════════════════════
   SOUND SYSTEM
   ═══════════════════════════════════════════════════ */
let audioCtx = null;
let chiptuneNodes = [];

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/* Play Pokémon cry from API */
async function playCry(cryUrl) {
  if (state.muted || !cryUrl) return;
  const btn = $('btnCry');
  try {
    const ctx   = getAudioCtx();
    const res   = await fetch(cryUrl);
    const buf   = await res.arrayBuffer();
    const audio = await ctx.decodeAudioData(buf);
    const src   = ctx.createBufferSource();
    src.buffer  = audio;
    src.connect(ctx.destination);
    src.start();
    btn.classList.add('playing');
    src.onended = () => btn.classList.remove('playing');
  } catch (e) {
    btn.classList.remove('playing');
  }
}

/* 8-bit pentatonic chiptune — generated with Web Audio API */
function startChiptune() {
  if (state.muted || chiptuneNodes.length) return;
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    // Pentatonic notes (C major penta)
    const scale = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.26];
    const pattern = [0,2,4,5,4,2,0,1,3,5,7,5,3,1,0,2];
    let step = 0;
    const bpm = 140;
    const beatMs = (60 / bpm) * 1000;

    function playNote() {
      if (state.muted) { stopChiptune(); return; }
      const ctx2 = getAudioCtx();
      const freq  = scale[pattern[step % pattern.length]];
      step++;

      const osc  = ctx2.createOscillator();
      const gain = ctx2.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(.04, ctx2.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx2.currentTime + .18);
      osc.connect(gain);
      gain.connect(ctx2.destination);
      osc.start();
      osc.stop(ctx2.currentTime + .2);
      chiptuneNodes.push(osc);

      chiptuneNodes = chiptuneNodes.filter(n => { try { return n.playbackState !== 3; } catch { return false; } });
    }

    // Play a note every beat
    const interval = setInterval(() => {
      if (state.muted) { clearInterval(interval); stopChiptune(); }
      else playNote();
    }, beatMs / 2);

    chiptuneNodes.push({ _interval: interval }); // store interval ref
  } catch (e) { /* AudioContext blocked */ }
}

function stopChiptune() {
  chiptuneNodes.forEach(n => {
    if (n._interval) clearInterval(n._interval);
    else try { n.stop(); } catch {}
  });
  chiptuneNodes = [];
}

function setMute(muted) {
  state.muted = muted;
  localStorage.setItem('pd_muted', JSON.stringify(muted));
  document.body.classList.toggle('muted', muted);
  if (muted) stopChiptune();
  else startChiptune();
}

function initSound() {
  document.body.classList.toggle('muted', state.muted);
  $('btnMute').addEventListener('click', () => setMute(!state.muted));
  $('btnCry').addEventListener('click', () => {
    const url = state.currentData?.cries?.latest;
    playCry(url);
  });
  // Start music on first user interaction
  document.addEventListener('click', () => {
    if (!state.muted && !chiptuneNodes.length) startChiptune();
  }, { once: true });
}

/* ═══════════════════════════════════════════════════
   POKÉBALL — positioned over artwork
   ═══════════════════════════════════════════════════ */
function pbPos() {
  const wrap = $('artworkWrap');
  if (!wrap) return { x: window.innerWidth/2, y: window.innerHeight/2, size: 120 };
  const r = wrap.getBoundingClientRect();
  return {
    x: r.left + r.width / 2,
    y: r.top  + r.height / 2,
    size: Math.min(r.width * .72, 140),
  };
}

function positionBall() {
  const ball  = $('pbBall');
  const flash = $('pbFlash');
  const { x, y, size } = pbPos();
  ball.style.width  = size + 'px';
  ball.style.height = size + 'px';
  ball.style.left   = x + 'px';
  ball.style.top    = y + 'px';
  flash.style.left  = x + 'px';
  flash.style.top   = y + 'px';
}

/* Particles from artwork position */
function spawnParticles(color, mode) {
  const canvas = $('pbCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const { x: cx, y: cy } = pbPos();
  const count = mode === 'release' ? 32 : 20;
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 / count) * i + (Math.random() - .5) * .5;
    const dist  = mode === 'capture' ? 70 + Math.random() * 50 : 8;
    const speed = mode === 'capture' ? -(1.5 + Math.random() * 3) : (3 + Math.random() * 6);
    return {
      x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      size: 2.5 + Math.random() * 4, alpha: 1, color,
    };
  });
  let frame;
  (function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vx *= .9; p.vy *= .9; p.alpha -= .034;
      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
    });
    if (alive) frame = requestAnimationFrame(tick);
  })();
}

async function animateCapture(accentColor) {
  positionBall();
  const ball  = $('pbBall');
  const core  = $('pbCore');
  const flash = $('pbFlash');
  const art   = $('pokeArtwork');
  const name  = $('pokeName');
  const genus = $('pokeGenus');

  $('pb-overlay').classList.add('pb-active');

  // Name fades, ball appears
  name.style.transition  = 'opacity .3s ease, transform .3s ease';
  genus.style.transition = 'opacity .25s ease';
  name.style.opacity  = '0'; name.style.transform = 'translateY(-6px)';
  genus.style.opacity = '0';
  ball.classList.add('pb-open');
  await delay(60);
  ball.classList.add('pb-visible');

  // Artwork shrinks into ball
  spawnParticles(accentColor, 'capture');
  art.style.transition = 'transform .35s cubic-bezier(.55,.06,.68,.19), opacity .35s, filter .35s';
  art.style.transform  = 'scale(0.04)';
  art.style.opacity    = '0';
  art.style.filter     = `brightness(3) drop-shadow(0 0 20px ${accentColor})`;
  await delay(320);

  // Flash + close
  flash.style.background = `radial-gradient(circle, #fff 0%, ${accentColor} 60%, transparent 100%)`;
  flash.classList.add('pb-flash--on');
  await delay(70);
  flash.classList.remove('pb-flash--on');

  ball.classList.remove('pb-open');
  core.style.background = accentColor;
  core.style.boxShadow  = `0 0 12px 4px ${accentColor}88`;
  await delay(180);

  // Two shakes (shorter than before)
  for (let i = 0; i < 2; i++) {
    ball.classList.add('pb-shake');
    await delay(460);
    ball.classList.remove('pb-shake');
    await delay(200);
  }
}

async function animateRelease(accentColor) {
  const ball  = $('pbBall');
  const flash = $('pbFlash');
  const core  = $('pbCore');
  const art   = $('pokeArtwork');
  const name  = $('pokeName');
  const genus = $('pokeGenus');

  positionBall();

  // Core brightens
  core.style.transition = 'all .15s ease';
  core.style.background = '#fff';
  core.style.boxShadow  = '0 0 20px 8px #fff';
  await delay(150);

  // Burst
  ball.classList.add('pb-burst');
  flash.style.background = `radial-gradient(circle, #fff 0%, ${accentColor} 50%, transparent 80%)`;
  flash.classList.add('pb-flash--on');
  spawnParticles(accentColor, 'release');
  await delay(140);
  flash.classList.remove('pb-flash--on');

  // Artwork grows out
  art.style.transition = 'none';
  art.style.transform  = 'scale(0.04)';
  art.style.opacity    = '0';
  art.style.filter     = '';
  await delay(30);
  art.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1), opacity .35s ease';
  art.style.transform  = 'scale(1)';
  art.style.opacity    = '1';

  // Name rises in
  await delay(80);
  name.style.transform   = 'translateY(0)';
  name.style.opacity     = '1';
  genus.style.opacity    = '1';

  // Ball fades out
  await delay(160);
  ball.classList.add('pb-outro');
  await delay(320);

  ball.className = 'pb-ball';
  core.style.cssText = '';
  $('pb-overlay').classList.remove('pb-active');
}

/* ═══════════════════════════════════════════════════
   API
   ═══════════════════════════════════════════════════ */
async function fetchPokemon(q) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(q).toLowerCase().trim()}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}
async function fetchSpecies(url) {
  try { const r = await fetch(url); return r.ok ? r.json() : null; } catch { return null; }
}

/* ═══════════════════════════════════════════════════
   RECENTS
   ═══════════════════════════════════════════════════ */
function addToRecents(name, id) {
  state.recents = state.recents.filter(r => r.name !== name);
  state.recents.unshift({ name, id });
  if (state.recents.length > 10) state.recents = state.recents.slice(0, 10);
  localStorage.setItem('pd_recents', JSON.stringify(state.recents));
  renderRecents();
}
function renderRecents() {
  const el = $('recents');
  if (!state.recents.length) { el.innerHTML = ''; return; }
  el.innerHTML = state.recents.map(r => `
    <button class="recent-chip" data-name="${r.name}">
      <span class="recent-chip-num">${padId(r.id)}</span> ${capitalize(r.name)}
    </button>`).join('');
  el.querySelectorAll('.recent-chip').forEach(c =>
    c.addEventListener('click', () => loadPokemon(c.dataset.name)));
}

/* ═══════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════ */
function renderPokemon(data, species) {
  const types       = data.types.map(t => t.type.name);
  const primaryType = types[0];

  // Artwork — normal or shiny
  const sprites  = data.sprites?.other?.['official-artwork'];
  const artNormal = sprites?.front_default || data.sprites?.front_default || '';
  const artShiny  = sprites?.front_shiny  || data.sprites?.front_shiny  || artNormal;

  // Animated sprite (gen-v)
  const animSprite = data.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default || '';

  state.isShiny = false;
  const shinyBtn = $('shinyBtn');
  shinyBtn.classList.remove('active');
  shinyBtn.onclick = () => {
    state.isShiny = !state.isShiny;
    shinyBtn.classList.toggle('active', state.isShiny);
    const artEl = $('pokeArtwork');
    artEl.style.opacity = '0';
    setTimeout(() => {
      artEl.src = state.isShiny ? artShiny : artNormal;
      artEl.style.transition = 'opacity .3s ease';
      artEl.style.opacity = '1';
    }, 150);
  };

  // Animated sprite badge
  const badge    = $('spriteBadge');
  const animEl   = $('spriteAnim');
  if (animSprite) {
    animEl.src = animSprite;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }

  applyTypeTheme(primaryType);

  $('pokeNumber').textContent = padId(data.id);

  // Flavor text
  let flavor = '';
  if (species) {
    const entry = species.flavor_text_entries?.find(e => e.language.name === 'en');
    if (entry) flavor = entry.flavor_text.replace(/\f|\n/g, ' ').trim();
  }
  let genus = '';
  if (species) {
    const g = species.genera?.find(g => g.language.name === 'en');
    if (g) genus = g.genus;
  }

  $('pokeName').textContent  = data.name;
  $('pokeGenus').textContent = genus;
  $('pokeFlavor').textContent = flavor || 'No entry found.';
  $('pokeHeight').textContent = formatHeight(data.height);
  $('pokeWeight').textContent = formatWeight(data.weight);
  $('pokeExp').textContent    = data.base_experience ?? '—';

  $('pokeTypes').innerHTML = types.map(t => {
    const c = TYPE_COLORS[t] || TYPE_COLORS.normal;
    return `<span class="type-badge" style="background:${c.hex}">${t}</span>`;
  }).join('');

  $('pokeAbilities').innerHTML = data.abilities.map(a => `
    <span class="ability-tag${a.is_hidden ? ' hidden-ability' : ''}">
      ${capitalize(a.ability.name)}${a.is_hidden ? ' ✦' : ''}
    </span>`).join('');

  $('pokeStats').innerHTML = data.stats.map(s => {
    const label = STAT_LABELS[s.stat.name] || s.stat.name;
    const pct   = Math.min((s.base_stat / STAT_MAX) * 100, 100);
    return `
      <div class="stat-row">
        <span class="stat-name">${label}</span>
        <span class="stat-val">${s.base_stat}</span>
        <div class="stat-bar-wrap"><div class="stat-bar" data-pct="${pct}"></div></div>
      </div>`;
  }).join('');

  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.stat-bar').forEach(b => b.style.width = b.dataset.pct + '%');
  }));

  $('pokeMoves').innerHTML = data.moves.slice(0, 12)
    .map(m => `<span class="move-tag">${capitalize(m.move.name)}</span>`).join('');
}

/* ═══════════════════════════════════════════════════
   LOAD
   ═══════════════════════════════════════════════════ */
async function loadPokemon(nameOrId) {
  const currentType   = state.currentData?.types?.[0]?.type?.name || 'normal';
  const currentAccent = TYPE_COLORS[currentType]?.hex || '#9e9e9e';
  const isFirst       = state.isFirstLoad;
  state.isFirstLoad   = false;

  try {
    if (isFirst) {
      hide($('welcomeState')); hide($('errorState'));
      show($('loadingState'));
      const data = await fetchPokemon(nameOrId);
      let species = null;
      if (data.species?.url) species = await fetchSpecies(data.species.url);
      hide($('loadingState'));

      // Reset artwork styles
      const art = $('pokeArtwork');
      art.style.cssText = '';
      art.src = data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || '';
      art.onload = () => { art.style.opacity = '1'; };
      art.style.opacity = '0';
      art.style.transition = 'opacity .4s ease';

      renderPokemon(data, species);
      show($('pokeCard'));
      addToRecents(data.name, data.id);
      state.currentData = data;
      $('searchInput').value = capitalize(data.name);

      // Auto-play cry on first load
      setTimeout(() => playCry(data.cries?.latest), 600);

    } else {
      // Capture animation
      await animateCapture(currentAccent);

      const [data] = await Promise.all([fetchPokemon(nameOrId), delay(150)]);
      let species = null;
      if (data.species?.url) species = await fetchSpecies(data.species.url);

      const newType   = data.types?.[0]?.type?.name || 'normal';
      const newAccent = TYPE_COLORS[newType]?.hex || '#9e9e9e';

      // Set artwork src while hidden
      const art = $('pokeArtwork');
      const artUrl = data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || '';
      art.src = artUrl;

      hide($('welcomeState')); hide($('errorState'));
      renderPokemon(data, species);
      show($('pokeCard'));

      // Keep hidden for release
      $('pokeName').style.opacity  = '0';
      $('pokeGenus').style.opacity = '0';
      art.style.transform = 'scale(0.04)';
      art.style.opacity   = '0';

      await animateRelease(newAccent);

      addToRecents(data.name, data.id);
      state.currentData = data;
      $('searchInput').value = capitalize(data.name);

      // Play cry
      playCry(data.cries?.latest);
    }

  } catch {
    const ball = $('pbBall');
    if (ball) { ball.className = 'pb-ball'; }
    $('pb-overlay').classList.remove('pb-active');
    const art = $('pokeArtwork');
    if (art) { art.style.cssText = ''; }
    [$('pokeName'), $('pokeGenus')].forEach(el => { if (el) el.style.cssText = ''; });
    hide($('loadingState'));
    $('errorMsg').textContent = `"${nameOrId}" was not found. Check the name or number.`;
    show($('errorState'));
  }
}

async function loadRandom() {
  await loadPokemon(Math.floor(Math.random() * 1025) + 1);
}

/* ═══════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════ */
function initSearch() {
  const form  = $('searchForm');
  const input = $('searchInput');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = input.value.trim();
    if (val) loadPokemon(val.toLowerCase());
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== input) { e.preventDefault(); input.focus(); }
    if (e.key === 'Escape') input.blur();
  });
}

function initStarters() {
  document.querySelectorAll('.starter-chip').forEach(c =>
    c.addEventListener('click', () => loadPokemon(c.dataset.name)));
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSound();
  initSearch();
  initStarters();
  renderRecents();
  $('btnRandom').addEventListener('click', loadRandom);

  // Compute header height for CSS var
  const setHeaderH = () => {
    document.documentElement.style.setProperty('--header-h', $('header')?.offsetHeight + 'px' || '104px');
  };
  setHeaderH();
  window.addEventListener('resize', setHeaderH);

  show($('welcomeState'));
  if (!state.recents.length) setTimeout(() => loadPokemon('pikachu'), 500);
  else loadPokemon(state.recents[0].name);
});
