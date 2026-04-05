/* ═══════════════════════════════════════════════════════════════
   POKÉDEX FIELD GUIDE — app.js  v2
   + Prev/Next Navigation        + Favorites system
   + Type Matchups               + Evolution Chain
   + Flavor text cycling         + Species data row
   + Base stat total             + Generation badge
   ═══════════════════════════════════════════════════════════════ */

/* ── TYPE DATA ── */
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

/**
 * Defensive type chart.
 * TYPE_EFFECTIVENESS[defender][attacker] = damage multiplier
 */
const TYPE_EFFECTIVENESS = {
  normal:   { fighting: 2, ghost: 0 },
  fire:     { fire: 0.5, water: 2, grass: 0.5, ice: 0.5, ground: 2, bug: 0.5, rock: 2, steel: 0.5, fairy: 0.5 },
  water:    { fire: 0.5, water: 0.5, electric: 2, grass: 2, ice: 0.5, steel: 0.5 },
  electric: { electric: 0.5, flying: 0.5, ground: 2, steel: 0.5 },
  grass:    { fire: 2, water: 0.5, electric: 0.5, grass: 0.5, ice: 2, poison: 2, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ice:      { fire: 2, ice: 0.5, fighting: 2, rock: 2, steel: 2 },
  fighting: { flying: 2, psychic: 2, bug: 0.5, rock: 0.5, dark: 0.5, fairy: 2 },
  poison:   { grass: 0.5, fighting: 0.5, poison: 0.5, ground: 2, psychic: 2, bug: 0.5, fairy: 0.5 },
  ground:   { water: 2, electric: 0, grass: 2, ice: 2, poison: 0.5, rock: 0.5 },
  flying:   { electric: 2, grass: 0.5, ice: 2, fighting: 0.5, ground: 0, bug: 0.5, rock: 2 },
  psychic:  { fighting: 0.5, psychic: 0.5, bug: 2, ghost: 2, dark: 2 },
  bug:      { fire: 2, grass: 0.5, fighting: 0.5, ground: 0.5, flying: 2, rock: 2 },
  rock:     { normal: 0.5, fire: 0.5, water: 2, electric: 0.5, grass: 2, fighting: 2, poison: 0.5, ground: 2, flying: 0.5, steel: 2 },
  ghost:    { normal: 0, fighting: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 2 },
  dragon:   { fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5, ice: 2, dragon: 2, fairy: 2 },
  dark:     { fighting: 2, psychic: 0, bug: 2, ghost: 0.5, dark: 0.5, fairy: 2 },
  steel:    { normal: 0.5, fire: 2, grass: 0.5, ice: 0.5, fighting: 2, poison: 0, ground: 2, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5 },
  fairy:    { fighting: 0.5, poison: 2, bug: 0.5, dragon: 0, dark: 0.5, steel: 2 },
};

const GEN_LABELS = {
  'generation-i':    'Gen I',    'generation-ii':   'Gen II',
  'generation-iii':  'Gen III',  'generation-iv':   'Gen IV',
  'generation-v':    'Gen V',    'generation-vi':   'Gen VI',
  'generation-vii':  'Gen VII',  'generation-viii': 'Gen VIII',
  'generation-ix':   'Gen IX',
};

const STAT_LABELS = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
};
const STAT_MAX    = 255;
const MAX_DEX_ID  = 1025;

/* ── STATE ── */
const state = {
  currentData:    null,
  currentId:      null,
  recents:        JSON.parse(localStorage.getItem('pd_recents') || '[]'),
  favorites:      JSON.parse(localStorage.getItem('pd_favs')    || '[]'),
  isFirstLoad:    true,
  isShiny:        false,
  muted:          JSON.parse(localStorage.getItem('pd_muted')   || 'false'),
  theme:          localStorage.getItem('pd_theme') || 'light',
  flavorEntries:  [],
  flavorIdx:      0,
};

/* ── UTILS ── */
const $         = id => document.getElementById(id);
const show      = el => el.classList.add('active');
const hide      = el => el.classList.remove('active');
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
const delay     = ms => new Promise(r => setTimeout(r, ms));
const padId     = n  => '#' + String(n).padStart(3, '0');
const formatHeight = dm => (dm / 10).toFixed(1) + ' m';
const formatWeight = hg => (hg / 10).toFixed(1) + ' kg';
const getIdFromUrl = url => parseInt(url.split('/').filter(Boolean).pop());

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
  $('bgOrb').style.background =
    `radial-gradient(circle, rgba(${color.rgb},.12) 0%, transparent 70%)`;
}

function setTheme(t) {
  state.theme = t;
  document.documentElement.dataset.theme = t;
  localStorage.setItem('pd_theme', t);
  if (state.currentData) {
    const type = state.currentData.types?.[0]?.type?.name || 'normal';
    applyTypeTheme(type);
  }
}

function initTheme() {
  setTheme(state.theme);
  $('btnTheme').addEventListener('click', () =>
    setTheme(state.theme === 'light' ? 'dark' : 'light'));
}

/* ═══════════════════════════════════════════════════
   SOUND
   ═══════════════════════════════════════════════════ */
let audioCtx = null;
let chiptuneNodes = [];

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

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
  } catch { btn.classList.remove('playing'); }
}

function startChiptune() {
  if (state.muted || chiptuneNodes.length) return;
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const scale   = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.26];
    const pattern = [0,2,4,5,4,2,0,1,3,5,7,5,3,1,0,2];
    let step = 0;
    const beatMs = (60 / 140) * 1000;

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
      chiptuneNodes = chiptuneNodes.filter(n => {
        try { return n.playbackState !== 3; } catch { return false; }
      });
    }

    const interval = setInterval(() => {
      if (state.muted) { clearInterval(interval); stopChiptune(); }
      else playNote();
    }, beatMs / 2);

    chiptuneNodes.push({ _interval: interval });
  } catch {}
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
  $('btnCry').addEventListener('click', () => playCry(state.currentData?.cries?.latest));
  document.addEventListener('click', () => {
    if (!state.muted && !chiptuneNodes.length) startChiptune();
  }, { once: true });
}

/* ═══════════════════════════════════════════════════
   FAVORITES
   ═══════════════════════════════════════════════════ */
function isFavorite(name) {
  return state.favorites.some(f => f.name === name);
}

function toggleFavorite(name, id) {
  const was = isFavorite(name);
  if (was) {
    state.favorites = state.favorites.filter(f => f.name !== name);
  } else {
    state.favorites.unshift({ name, id });
  }
  localStorage.setItem('pd_favs', JSON.stringify(state.favorites));
  updateFavBtn(name);
  renderRecents();
  return !was;
}

function updateFavBtn(name) {
  const btn = $('favBtn');
  if (!btn) return;
  const active = isFavorite(name);
  btn.classList.toggle('active', active);
}

function initFavorites() {
  $('favBtn').addEventListener('click', () => {
    if (!state.currentData) return;
    const added = toggleFavorite(state.currentData.name, state.currentData.id);
    $('favBtn').classList.add('pop');
    setTimeout(() => $('favBtn').classList.remove('pop'), 320);
  });
}

/* ═══════════════════════════════════════════════════
   PREV / NEXT NAVIGATION
   ═══════════════════════════════════════════════════ */
function updateNavButtons(id) {
  const prev = $('btnPrev');
  const next = $('btnNext');
  prev.disabled = id <= 1;
  next.disabled = id >= MAX_DEX_ID;
}

function initNav() {
  $('btnPrev').addEventListener('click', () => {
    if (state.currentId && state.currentId > 1) loadPokemon(state.currentId - 1);
  });
  $('btnNext').addEventListener('click', () => {
    if (state.currentId && state.currentId < MAX_DEX_ID) loadPokemon(state.currentId + 1);
  });
  $('btnErrorRandom').addEventListener('click', loadRandom);
}

/* ═══════════════════════════════════════════════════
   TYPE MATCHUPS
   ═══════════════════════════════════════════════════ */
function calcTypeMatchups(types) {
  const allTypes = Object.keys(TYPE_COLORS);
  const buckets  = { 4: [], 2: [], 0.5: [], 0.25: [], 0: [] };

  allTypes.forEach(attacker => {
    let mult = 1;
    types.forEach(defender => {
      mult *= (TYPE_EFFECTIVENESS[defender]?.[attacker] ?? 1);
    });
    if (buckets[mult] !== undefined) buckets[mult].push(attacker);
  });

  return buckets;
}

function renderMatchups(types) {
  const buckets = calcTypeMatchups(types);
  const el      = $('pokeMatchups');

  const rows = [
    { mult: 4,    key: '4×',   cls: 'm4x'   },
    { mult: 2,    key: '2×',   cls: 'm2x'   },
    { mult: 0.5,  key: '½×',   cls: 'mhalf' },
    { mult: 0.25, key: '¼×',   cls: 'mqtr'  },
    { mult: 0,    key: '0×',   cls: 'mzero' },
  ];

  el.innerHTML = rows
    .filter(r => buckets[r.mult]?.length)
    .map(r => `
      <div class="matchup-row">
        <span class="matchup-label ${r.cls}">${r.key}</span>
        <div class="matchup-chips">
          ${buckets[r.mult].map(t => {
            const c = TYPE_COLORS[t] || TYPE_COLORS.normal;
            return `<span class="matchup-chip" style="background:${c.hex}">${t}</span>`;
          }).join('')}
        </div>
      </div>
    `).join('');
}

/* ═══════════════════════════════════════════════════
   EVOLUTION CHAIN
   ═══════════════════════════════════════════════════ */
async function fetchEvoChain(url) {
  try {
    const r = await fetch(url);
    return r.ok ? r.json() : null;
  } catch { return null; }
}

/** Parse chain into stages: [[stage0Mons], [stage1Mons], ...] */
function getEvoStages(chainNode) {
  const stages = [];

  function traverse(node, depth) {
    if (!stages[depth]) stages[depth] = [];
    const id = getIdFromUrl(node.species.url);
    stages[depth].push({
      name:    node.species.name,
      id,
      sprite:  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      details: node.evolution_details?.[0] ?? null,
    });
    node.evolves_to.forEach(next => traverse(next, depth + 1));
  }

  traverse(chainNode, 0);
  return stages;
}

/** Build a human-readable label for how a Pokémon evolves */
function evoDetailLabel(details) {
  if (!details) return '';
  if (details.min_level)         return `Lv. ${details.min_level}`;
  if (details.item)              return capitalize(details.item.name);
  if (details.held_item)         return `Hold: ${capitalize(details.held_item.name)}`;
  if (details.min_happiness)     return 'Happiness';
  if (details.min_beauty)        return 'Beauty';
  if (details.min_affection)     return 'Affection';
  if (details.time_of_day === 'day')   return 'Daytime';
  if (details.time_of_day === 'night') return 'Night';
  if (details.known_move)        return capitalize(details.known_move.name);
  if (details.location)          return 'Location';
  if (details.trade_species)     return 'Trade';
  if (details.trigger?.name === 'trade')  return 'Trade';
  if (details.trigger?.name === 'level-up') return details.min_level ? `Lv. ${details.min_level}` : 'Level Up';
  if (details.trigger?.name === 'use-item') {
    return details.item ? capitalize(details.item.name) : 'Item';
  }
  return '';
}

function renderEvoChain(stages, currentName) {
  const section = $('evoSection');
  const el      = $('evoChain');

  // Hide if only one stage (no evolution)
  if (stages.length <= 1) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';
  el.innerHTML = '';

  stages.forEach((stageMons, stageIdx) => {
    if (stageIdx > 0) {
      // Build connector(s) — one per mon in this stage
      const connWrap = document.createElement('div');
      connWrap.style.cssText = 'display:flex;flex-direction:column;gap:.35rem;align-self:center;';
      stageMons.forEach(mon => {
        const label = evoDetailLabel(mon.details);
        connWrap.innerHTML += `
          <div class="evo-connector">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            ${label ? `<span class="evo-connector-detail">${label}</span>` : ''}
          </div>`;
      });
      el.appendChild(connWrap);
    }

    // Stage column
    const stageEl = document.createElement('div');
    stageEl.className = 'evo-stage';

    stageMons.forEach(mon => {
      const node = document.createElement('div');
      node.className = 'evo-node' + (mon.name === currentName ? ' current' : '');
      node.dataset.name = mon.name;
      node.innerHTML = `
        <img src="${mon.sprite}" alt="${mon.name}" loading="lazy" />
        <span class="evo-node-name">${capitalize(mon.name)}</span>
      `;
      node.addEventListener('click', () => {
        if (mon.name !== state.currentData?.name) loadPokemon(mon.name);
      });
      stageEl.appendChild(node);
    });

    el.appendChild(stageEl);
  });
}

/* ═══════════════════════════════════════════════════
   FLAVOR TEXT CYCLING
   ═══════════════════════════════════════════════════ */
function setFlavor(idx) {
  if (!state.flavorEntries.length) return;
  state.flavorIdx = idx % state.flavorEntries.length;
  const fl = $('pokeFlavor');
  fl.style.opacity = '0';
  setTimeout(() => {
    fl.textContent = state.flavorEntries[state.flavorIdx];
    fl.style.opacity = '1';
  }, 140);
}

function initFlavorCycle() {
  $('btnFlavorCycle').addEventListener('click', () => {
    setFlavor(state.flavorIdx + 1);
  });
}

/* ═══════════════════════════════════════════════════
   SPECIES DATA ROW
   ═══════════════════════════════════════════════════ */
function renderSpeciesRow(species) {
  const el = $('pokeSpeciesRow');
  if (!species) { el.innerHTML = ''; return; }

  const chips = [];

  // Generation
  const gen = GEN_LABELS[species.generation?.name];
  if (gen) chips.push({ label: 'Generation', val: gen });

  // Gender ratio
  const gr = species.gender_rate;
  if (gr === -1) {
    chips.push({ label: 'Gender', val: 'Genderless' });
  } else if (gr !== undefined) {
    const femPct = Math.round((gr / 8) * 100);
    chips.push({ label: 'Gender', val: `♂ ${100 - femPct}%  ♀ ${femPct}%` });
  }

  // Egg groups
  if (species.egg_groups?.length) {
    chips.push({ label: 'Egg Groups', val: species.egg_groups.map(e => capitalize(e.name)).join(', ') });
  }

  // Base friendship
  if (species.base_happiness !== undefined) {
    chips.push({ label: 'Friendship', val: species.base_happiness });
  }

  // Habitat
  if (species.habitat?.name) {
    chips.push({ label: 'Habitat', val: capitalize(species.habitat.name) });
  }

  el.innerHTML = chips.map(c => `
    <div class="species-chip">
      <span class="species-chip-label">${c.label}</span>
      <span>${c.val}</span>
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════
   POKÉBALL ANIMATION
   ═══════════════════════════════════════════════════ */
function pbPos() {
  const wrap = $('artworkWrap');
  if (!wrap) return { x: window.innerWidth / 2, y: window.innerHeight / 2, size: 120 };
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

function spawnParticles(color, mode) {
  const canvas = $('pbCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const { x: cx, y: cy } = pbPos();
  const count = mode === 'release' ? 32 : 20;
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 / count) * i + (Math.random() - .5) * .5;
    const dist  = mode === 'capture' ? 70 + Math.random() * 50 : 8;
    const speed = mode === 'capture' ? -(1.5 + Math.random() * 3) : (3 + Math.random() * 6);
    return {
      x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist,
      vx: Math.cos(angle) * speed,    vy: Math.sin(angle) * speed,
      size: 2.5 + Math.random() * 4,  alpha: 1, color,
    };
  });
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
        ctx.fillStyle   = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    });
    if (alive) requestAnimationFrame(tick);
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

  name.style.transition  = 'opacity .3s ease, transform .3s ease';
  genus.style.transition = 'opacity .25s ease';
  name.style.opacity     = '0'; name.style.transform = 'translateY(-6px)';
  genus.style.opacity    = '0';
  ball.classList.add('pb-open');
  await delay(60);
  ball.classList.add('pb-visible');

  spawnParticles(accentColor, 'capture');
  art.style.transition = 'transform .35s cubic-bezier(.55,.06,.68,.19), opacity .35s, filter .35s';
  art.style.transform  = 'scale(0.04)';
  art.style.opacity    = '0';
  art.style.filter     = `brightness(3) drop-shadow(0 0 20px ${accentColor})`;
  await delay(320);

  flash.style.background = `radial-gradient(circle, #fff 0%, ${accentColor} 60%, transparent 100%)`;
  flash.classList.add('pb-flash--on');
  await delay(70);
  flash.classList.remove('pb-flash--on');

  ball.classList.remove('pb-open');
  core.style.background = accentColor;
  core.style.boxShadow  = `0 0 12px 4px ${accentColor}88`;
  await delay(180);

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
  core.style.transition = 'all .15s ease';
  core.style.background = '#fff';
  core.style.boxShadow  = '0 0 20px 8px #fff';
  await delay(150);

  ball.classList.add('pb-burst');
  flash.style.background = `radial-gradient(circle, #fff 0%, ${accentColor} 50%, transparent 80%)`;
  flash.classList.add('pb-flash--on');
  spawnParticles(accentColor, 'release');
  await delay(140);
  flash.classList.remove('pb-flash--on');

  art.style.transition = 'none';
  art.style.transform  = 'scale(0.04)';
  art.style.opacity    = '0';
  art.style.filter     = '';
  await delay(30);
  art.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1), opacity .35s ease';
  art.style.transform  = 'scale(1)';
  art.style.opacity    = '1';

  await delay(80);
  name.style.transform  = 'translateY(0)';
  name.style.opacity    = '1';
  genus.style.opacity   = '1';

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
  if (state.recents.length > 12) state.recents = state.recents.slice(0, 12);
  localStorage.setItem('pd_recents', JSON.stringify(state.recents));
  renderRecents();
}

function renderRecents() {
  const el = $('recents');
  const favNames = new Set(state.favorites.map(f => f.name));

  const favChips = state.favorites.slice(0, 5).map(r => `
    <button class="recent-chip" data-name="${r.name}">
      <span class="recent-chip-fav">♥</span>
      <span class="recent-chip-num">${padId(r.id)}</span> ${capitalize(r.name)}
    </button>`).join('');

  const recentChips = state.recents
    .filter(r => !favNames.has(r.name))
    .slice(0, 8)
    .map(r => `
      <button class="recent-chip" data-name="${r.name}">
        <span class="recent-chip-num">${padId(r.id)}</span> ${capitalize(r.name)}
      </button>`).join('');

  const divider = (favChips && recentChips) ? '<div class="recents-divider"></div>' : '';
  el.innerHTML = favChips + divider + recentChips;

  el.querySelectorAll('.recent-chip').forEach(c =>
    c.addEventListener('click', () => loadPokemon(c.dataset.name)));
}

/* ═══════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════ */
function renderPokemon(data, species) {
  const types       = data.types.map(t => t.type.name);
  const primaryType = types[0];

  const sprites   = data.sprites?.other?.['official-artwork'];
  const artNormal = sprites?.front_default || data.sprites?.front_default || '';
  const artShiny  = sprites?.front_shiny   || data.sprites?.front_shiny  || artNormal;
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
  const badge  = $('spriteBadge');
  const animEl = $('spriteAnim');
  if (animSprite) {
    animEl.src = animSprite;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }

  applyTypeTheme(primaryType);

  $('pokeNumber').textContent = padId(data.id);

  // Flavor text — collect all English entries, deduplicate
  state.flavorEntries = [];
  state.flavorIdx     = 0;
  if (species?.flavor_text_entries) {
    const seen = new Set();
    species.flavor_text_entries
      .filter(e => e.language.name === 'en')
      .forEach(e => {
        const text = e.flavor_text.replace(/\f|\n/g, ' ').trim();
        if (!seen.has(text)) { seen.add(text); state.flavorEntries.push(text); }
      });
  }

  const flavorEl = $('pokeFlavor');
  flavorEl.style.opacity = '1';
  flavorEl.style.transition = 'opacity .2s';
  flavorEl.textContent = state.flavorEntries[0] || 'No entry found.';

  const cycleBtn = $('btnFlavorCycle');
  cycleBtn.disabled = state.flavorEntries.length <= 1;
  cycleBtn.title    = state.flavorEntries.length > 1
    ? `${state.flavorEntries.length} entries — click to cycle`
    : 'Only one entry';

  // Genus
  const genusEntry = species?.genera?.find(g => g.language.name === 'en');
  $('pokeGenus').textContent = genusEntry?.genus || '';

  // Name
  $('pokeName').textContent = data.name;

  // Metrics
  $('pokeHeight').textContent    = formatHeight(data.height);
  $('pokeWeight').textContent    = formatWeight(data.weight);
  $('pokeExp').textContent       = data.base_experience ?? '—';
  $('pokeCatchRate').textContent = species?.capture_rate ?? '—';

  // Species row
  renderSpeciesRow(species);

  // Gen badge
  const genLabel = GEN_LABELS[species?.generation?.name] || '';
  $('pokeGenBadge').textContent = genLabel;

  // Types
  $('pokeTypes').innerHTML = types.map(t => {
    const c = TYPE_COLORS[t] || TYPE_COLORS.normal;
    return `<span class="type-badge" style="background:${c.hex}">${t}</span>`;
  }).join('');

  // Abilities
  $('pokeAbilities').innerHTML = data.abilities.map(a => `
    <span class="ability-tag${a.is_hidden ? ' hidden-ability' : ''}">
      ${capitalize(a.ability.name)}${a.is_hidden ? ' ✦' : ''}
    </span>`).join('');

  // Type Matchups
  renderMatchups(types);

  // Stats
  const statTotal = data.stats.reduce((sum, s) => sum + s.base_stat, 0);
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

  $('pokeStatTotal').textContent = statTotal;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.stat-bar').forEach(b => b.style.width = b.dataset.pct + '%');
  }));

  // Moves (first 12)
  $('pokeMoves').innerHTML = data.moves.slice(0, 12)
    .map(m => `<span class="move-tag">${capitalize(m.move.name)}</span>`).join('');

  // Favorites button state
  updateFavBtn(data.name);

  // Nav button states
  updateNavButtons(data.id);
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

      // Fetch Pokémon + species in parallel
      const data = await fetchPokemon(nameOrId);
      const [species, evoChainData] = await Promise.all([
        data.species?.url ? fetchSpecies(data.species.url) : Promise.resolve(null),
        Promise.resolve(null), // placeholder
      ]);

      let evo = null;
      if (species?.evolution_chain?.url) {
        evo = await fetchEvoChain(species.evolution_chain.url);
      }

      hide($('loadingState'));

      const art = $('pokeArtwork');
      art.style.cssText = '';
      art.src = data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || '';
      art.style.opacity = '0';
      art.style.transition = 'opacity .4s ease';
      art.onload = () => { art.style.opacity = '1'; };

      renderPokemon(data, species);
      if (evo?.chain) {
        const stages = getEvoStages(evo.chain);
        renderEvoChain(stages, data.name);
      } else {
        $('evoSection').style.display = 'none';
      }

      show($('pokeCard'));
      addToRecents(data.name, data.id);
      state.currentData = data;
      state.currentId   = data.id;
      $('searchInput').value = capitalize(data.name);
      setTimeout(() => playCry(data.cries?.latest), 600);

    } else {
      await animateCapture(currentAccent);

      const data = await fetchPokemon(nameOrId);
      const [species] = await Promise.all([
        data.species?.url ? fetchSpecies(data.species.url) : Promise.resolve(null),
        delay(150),
      ]);

      let evo = null;
      if (species?.evolution_chain?.url) {
        evo = await fetchEvoChain(species.evolution_chain.url);
      }

      const newType   = data.types?.[0]?.type?.name || 'normal';
      const newAccent = TYPE_COLORS[newType]?.hex || '#9e9e9e';

      const art    = $('pokeArtwork');
      const artUrl = data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || '';
      art.src = artUrl;

      hide($('welcomeState')); hide($('errorState'));
      renderPokemon(data, species);

      if (evo?.chain) {
        const stages = getEvoStages(evo.chain);
        renderEvoChain(stages, data.name);
      } else {
        $('evoSection').style.display = 'none';
      }

      show($('pokeCard'));
      $('pokeName').style.opacity  = '0';
      $('pokeGenus').style.opacity = '0';
      art.style.transform = 'scale(0.04)';
      art.style.opacity   = '0';

      await animateRelease(newAccent);

      addToRecents(data.name, data.id);
      state.currentData = data;
      state.currentId   = data.id;
      $('searchInput').value = capitalize(data.name);
      playCry(data.cries?.latest);
    }

  } catch (err) {
    const ball = $('pbBall');
    if (ball) ball.className = 'pb-ball';
    $('pb-overlay').classList.remove('pb-active');
    const art = $('pokeArtwork');
    if (art) art.style.cssText = '';
    [$('pokeName'), $('pokeGenus')].forEach(el => { if (el) el.style.cssText = ''; });
    hide($('loadingState'));
    $('errorMsg').textContent = `"${nameOrId}" was not found in the Pokédex. Try a name or number.`;
    show($('errorState'));
  }
}

async function loadRandom() {
  await loadPokemon(Math.floor(Math.random() * MAX_DEX_ID) + 1);
}

/* ═══════════════════════════════════════════════════
   SEARCH
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
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault(); input.focus();
    }
    if (e.key === 'Escape') input.blur();
    if (e.key === 'ArrowLeft'  && document.activeElement !== input) {
      if (state.currentId && state.currentId > 1) loadPokemon(state.currentId - 1);
    }
    if (e.key === 'ArrowRight' && document.activeElement !== input) {
      if (state.currentId && state.currentId < MAX_DEX_ID) loadPokemon(state.currentId + 1);
    }
  });
}

function initStarters() {
  document.querySelectorAll('.starter-chip').forEach(c =>
    c.addEventListener('click', () => loadPokemon(c.dataset.name)));
}

/* ═══════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSound();
  initSearch();
  initStarters();
  initNav();
  initFavorites();
  initFlavorCycle();
  renderRecents();
  $('btnRandom').addEventListener('click', loadRandom);

  // Dynamic header height
  const setHeaderH = () => {
    document.documentElement.style.setProperty(
      '--header-h', ($('header')?.offsetHeight ?? 104) + 'px'
    );
  };
  setHeaderH();
  window.addEventListener('resize', setHeaderH);

  show($('welcomeState'));
  if (!state.recents.length) setTimeout(() => loadPokemon('pikachu'), 500);
  else loadPokemon(state.recents[0].name);
});