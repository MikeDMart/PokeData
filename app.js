/* ═══════════════════════════════════════════════════════════════
   POKÉDEX FIELD GUIDE — app.js
   Cinematic pokéball capture & release transition (ACORTADA)
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

const TYPE_BG_COLORS = {
  normal:'#fafafa', fire:'#fff8f7', water:'#f5f9ff', electric:'#fffde7',
  grass:'#f5fbf5', ice:'#f0fbfd', fighting:'#fff5f5', poison:'#fdf5ff',
  ground:'#fffbf0', flying:'#f5f7ff', psychic:'#fff5fb', bug:'#f8fdf0',
  rock:'#faf7f5', ghost:'#f8f5ff', dragon:'#f5f8ff', dark:'#f5f6f7',
  steel:'#f5f7f8', fairy:'#fff5f9',
};

const STAT_LABELS = {
  hp:'HP', attack:'ATK', defense:'DEF',
  'special-attack':'SP.ATK', 'special-defense':'SP.DEF', speed:'SPD',
};
const STAT_MAX = 255;

const state = {
  current: null,
  recents: JSON.parse(localStorage.getItem('pd_recents') || '[]'),
  isFirstLoad: true,
};

const $ = id => document.getElementById(id);
const show = el => el.classList.add('active');
const hide = el => el.classList.remove('active');
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
const delay = ms => new Promise(r => setTimeout(r, ms));
const padId = n => '#' + String(n).padStart(3, '0');
const formatHeight = dm => (dm / 10).toFixed(1) + ' m';
const formatWeight = hg => (hg / 10).toFixed(1) + ' kg';

/* ═══════════════════════════════════════════════════
   CINEMATIC POKÉBALL SYSTEM (ACORTADO)
   ═══════════════════════════════════════════════════ */

function buildOverlay() {
  if ($('pb-overlay')) return;
  const el = document.createElement('div');
  el.id = 'pb-overlay';
  el.innerHTML = `
    <div class="pb-scene">
      <canvas class="pb-canvas" id="pbCanvas"></canvas>
      <div class="pb-ball" id="pbBall">
        <div class="pb-half pb-half--top">
          <div class="pb-shine"></div>
        </div>
        <div class="pb-seam">
          <div class="pb-button">
            <div class="pb-button-ring"></div>
            <div class="pb-button-core" id="pbCore"></div>
          </div>
        </div>
        <div class="pb-half pb-half--bot"></div>
      </div>
      <div class="pb-flash" id="pbFlash"></div>
    </div>
  `;
  document.body.appendChild(el);
}

/* ── Particle system ── */
function spawnParticles(color, mode) {
  const canvas = $('pbCanvas');
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const particles = [];
  const count = mode === 'capture' ? 28 : 40;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + (Math.random() - .5) * .5;
    const dist = mode === 'capture' ? 180 + Math.random() * 100 : 20;
    const speed = mode === 'capture' ? -(3 + Math.random() * 5) : (4 + Math.random() * 8);
    particles.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
      alpha: 1,
      color,
      trail: [],
    });
  }

  let frame;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 6) p.trail.shift();
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= .92;
      p.vy *= .92;
      p.alpha -= .03;
      if (p.alpha > 0) {
        alive = true;
        // Draw trail
        p.trail.forEach((pt, i) => {
          ctx.save();
          ctx.globalAlpha = p.alpha * (i / p.trail.length) * .4;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size * (i / p.trail.length), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
    if (alive) frame = requestAnimationFrame(tick);
  }
  tick();
  return () => cancelAnimationFrame(frame);
}

/* ── Capture ACORTADO: artwork flies INTO the ball (350ms total) ── */
async function animateCapture(accentColor) {
  buildOverlay();
  const overlay = $('pb-overlay');
  const ball = $('pbBall');
  const core = $('pbCore');
  const flash = $('pbFlash');
  const artwork = $('pokeArtwork');

  const artRect = artwork.getBoundingClientRect();
  const scCX = window.innerWidth / 2;
  const scCY = window.innerHeight / 2;

  // Clone artwork as flying ghost
  const ghost = document.createElement('img');
  ghost.src = artwork.src;
  ghost.id = 'pb-ghost';
  ghost.style.cssText = `
    position:fixed;z-index:10002;pointer-events:none;
    width:${artRect.width}px;height:${artRect.height}px;
    left:${artRect.left}px;top:${artRect.top}px;
    object-fit:contain;will-change:transform,opacity;
    filter:drop-shadow(0 0 0px ${accentColor});
  `;
  document.body.appendChild(ghost);

  // Fade overlay in (más rápido)
  overlay.classList.add('pb-show');
  ball.className = 'pb-ball pb-ball--open';
  await delay(40); // Reducido de 80ms

  // Spawn inward particles
  spawnParticles(accentColor, 'capture');

  // Fly ghost into ball (más rápido)
  const targetW = artRect.width * 0.15;
  const targetH = artRect.height * 0.15;
  ghost.style.transition = 'all 0.3s cubic-bezier(.55,.06,.68,.19)'; // Reducido de 0.5s
  ghost.style.left = `${scCX - targetW / 2}px`;
  ghost.style.top = `${scCY - targetH / 2 - 20}px`;
  ghost.style.width = `${targetW}px`;
  ghost.style.height = `${targetH}px`;
  ghost.style.opacity = '0.5';
  ghost.style.filter = `drop-shadow(0 0 24px ${accentColor}) brightness(2)`;

  await delay(280); // Reducido de 460ms

  // Absorption flash (más rápido)
  ghost.style.transition = 'all 0.05s ease-in'; // Reducido de 0.08s
  ghost.style.opacity = '0';
  ghost.style.transform = 'scale(0)';

  flash.style.background = accentColor;
  flash.classList.add('pb-flash--on');
  await delay(50); // Reducido de 80ms
  flash.classList.remove('pb-flash--on');
  ghost.remove();

  // Close ball
  ball.className = 'pb-ball pb-ball--closed';
  core.style.background = accentColor;
  core.style.boxShadow = `0 0 20px 6px ${accentColor}, 0 0 40px 12px ${accentColor}44`;

  await delay(150); // Reducido de 250ms

  // 3 game-accurate shakes with pauses (acortados)
  for (let i = 0; i < 3; i++) {
    ball.classList.add('pb-ball--shake');
    await delay(250); // Reducido de 550ms
    ball.classList.remove('pb-ball--shake');
    await delay(120); // Reducido de 300ms
  }
  // Duración total aproximada: 40+280+50+150+(250+120)*3 ≈ 1.3 segundos
}

/* ── Release ACORTADO: ball opens, Pokémon bursts out (650ms total) ── */
async function animateRelease(accentColor) {
  const ball = $('pbBall');
  const flash = $('pbFlash');
  const core = $('pbCore');
  const overlay = $('pb-overlay');

  // Core pulses white (más rápido)
  core.style.transition = 'all 0.15s ease'; // Reducido de 0.2s
  core.style.background = '#ffffff';
  core.style.boxShadow = `0 0 30px 12px #ffffff`;
  await delay(150); // Reducido de 220ms

  // Ball bursts open
  ball.className = 'pb-ball pb-ball--burst';

  // Big type-colored flash
  flash.style.background = `radial-gradient(circle at center, #ffffff 0%, ${accentColor} 45%, transparent 75%)`;
  flash.classList.add('pb-flash--on');
  spawnParticles(accentColor, 'release');

  await delay(120); // Reducido de 200ms
  flash.classList.remove('pb-flash--on');
  await delay(150); // Reducido de 250ms

  overlay.classList.remove('pb-show');
  await delay(180); // Reducido de 350ms

  // Reset
  ball.className = 'pb-ball';
  core.style.cssText = '';
  // Duración total aproximada: 150+120+150+180 = 600ms
}

/* ═══════════════════════════════════════════════════
   THEME (sin cambios)
   ═══════════════════════════════════════════════════ */
function applyTheme(primaryType) {
  const color = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
  const bgColor = TYPE_BG_COLORS[primaryType] || '#f5f0e8';
  const root = document.documentElement;
  root.style.setProperty('--accent', color.hex);
  root.style.setProperty('--accent-rgb', color.rgb);
  root.style.setProperty('--accent-soft', `rgba(${color.rgb},.09)`);
  root.style.setProperty('--accent-mid', `rgba(${color.rgb},.2)`);
  document.body.style.backgroundColor = bgColor;
  $('bgOrb').style.background = `radial-gradient(circle, rgba(${color.rgb},.15) 0%, transparent 70%)`;
}

/* ═══════════════════════════════════════════════════
   API (sin cambios)
   ═══════════════════════════════════════════════════ */
async function fetchPokemon(nameOrId) {
  const key = String(nameOrId).toLowerCase().trim();
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
  if (!res.ok) throw new Error(`Not found: ${nameOrId}`);
  return res.json();
}

async function fetchSpecies(url) {
  try { const r = await fetch(url); return r.ok ? r.json() : null; }
  catch { return null; }
}

/* ═══════════════════════════════════════════════════
   RECENTS (sin cambios)
   ═══════════════════════════════════════════════════ */
function addToRecents(name, id) {
  state.recents = state.recents.filter(r => r.name !== name);
  state.recents.unshift({ name, id });
  if (state.recents.length > 8) state.recents = state.recents.slice(0, 8);
  localStorage.setItem('pd_recents', JSON.stringify(state.recents));
  renderRecents();
}

function renderRecents() {
  const container = $('recents');
  if (!state.recents.length) { container.innerHTML = ''; return; }
  container.innerHTML = state.recents.map(r => `
    <button class="recent-chip" data-name="${r.name}">
      <span class="recent-chip-num">${padId(r.id)}</span>
      ${capitalize(r.name)}
    </button>
  `).join('');
  container.querySelectorAll('.recent-chip').forEach(chip => {
    chip.addEventListener('click', () => loadPokemon(chip.dataset.name));
  });
}

/* ═══════════════════════════════════════════════════
   RENDER (sin cambios)
   ═══════════════════════════════════════════════════ */
function renderPokemon(data, species) {
  const artwork = data.sprites?.other?.['official-artwork']?.front_default
    || data.sprites?.front_default || '';
  const types = data.types.map(t => t.type.name);
  const primaryType = types[0];

  let flavorText = '';
  if (species) {
    const entry = species.flavor_text_entries?.find(e => e.language.name === 'en');
    if (entry) flavorText = entry.flavor_text.replace(/\f|\n/g, ' ').trim();
  }
  let genus = '';
  if (species) {
    const gen = species.genera?.find(g => g.language.name === 'en');
    if (gen) genus = gen.genus;
  }

  applyTheme(primaryType);
  $('pokeNumber').textContent = padId(data.id);

  const artEl = $('pokeArtwork');
  artEl.style.opacity = '0';
  artEl.src = artwork;
  artEl.alt = data.name;
  artEl.onload = () => {
    artEl.style.transition = 'opacity .35s ease';
    artEl.style.opacity = '1';
  };

  $('pokeTypes').innerHTML = types.map(t => {
    const c = TYPE_COLORS[t] || TYPE_COLORS.normal;
    return `<span class="type-badge" style="background:${c.hex}">${t}</span>`;
  }).join('');

  $('pokeName').textContent = data.name;
  $('pokeGenus').textContent = genus || '';
  $('pokeFlavor').textContent = flavorText || 'No entry found.';
  $('pokeHeight').textContent = formatHeight(data.height);
  $('pokeWeight').textContent = formatWeight(data.weight);
  $('pokeExp').textContent = data.base_experience ?? '—';

  $('pokeAbilities').innerHTML = data.abilities.map(a => `
    <span class="ability-tag${a.is_hidden ? ' hidden-ability' : ''}">
      ${capitalize(a.ability.name)}${a.is_hidden ? ' ✦' : ''}
    </span>
  `).join('');

  $('pokeStats').innerHTML = data.stats.map(s => {
    const label = STAT_LABELS[s.stat.name] || s.stat.name;
    const val = s.base_stat;
    const pct = Math.min((val / STAT_MAX) * 100, 100);
    return `
      <div class="stat-row">
        <span class="stat-name">${label}</span>
        <span class="stat-val">${val}</span>
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
   MAIN LOAD (sin cambios en lógica)
   ═══════════════════════════════════════════════════ */
async function loadPokemon(nameOrId) {
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const currentType = state.current?.types?.[0]?.type?.name || 'normal';
  const currentAccent = TYPE_COLORS[currentType]?.hex || '#9e9e9e';
  const isFirst = state.isFirstLoad;
  state.isFirstLoad = false;

  try {
    if (isFirst) {
      hide($('welcomeState'));
      hide($('errorState'));
      show($('loadingState'));

      const data = await fetchPokemon(nameOrId);
      let species = null;
      if (data.species?.url) species = await fetchSpecies(data.species.url);

      hide($('loadingState'));
      renderPokemon(data, species);
      show($('pokeCard'));
      addToRecents(data.name, data.id);
      state.current = data;
      $('searchInput').value = capitalize(data.name);

    } else {
      buildOverlay();

      // 1. Capture current Pokémon into ball (acortado)
      await animateCapture(currentAccent);

      // 2. Fetch new data while ball shakes (tiempo reducido)
      const [data] = await Promise.all([
        fetchPokemon(nameOrId),
        delay(150), // Reducido de 300ms
      ]);
      let species = null;
      if (data.species?.url) species = await fetchSpecies(data.species.url);

      const newType = data.types?.[0]?.type?.name || 'normal';
      const newAccent = TYPE_COLORS[newType]?.hex || '#9e9e9e';

      // 3. Render behind overlay
      hide($('welcomeState'));
      hide($('errorState'));
      renderPokemon(data, species);
      show($('pokeCard'));

      // 4. Open ball — Pokémon bursts out (acortado)
      await animateRelease(newAccent);

      // 5. Card entrance animation
      const card = $('pokeCard');
      card.classList.remove('active');
      void card.offsetWidth;
      card.classList.add('active');

      addToRecents(data.name, data.id);
      state.current = data;
      $('searchInput').value = capitalize(data.name);
    }

  } catch (err) {
    const overlay = $('pb-overlay');
    if (overlay?.classList.contains('pb-show')) {
      overlay.classList.remove('pb-show');
      await delay(180); // Reducido de 350ms
    }
    hide($('loadingState'));
    $('errorMsg').textContent = `"${nameOrId}" was not found. Check the name or number.`;
    show($('errorState'));
  }
}

async function loadRandom() {
  const id = Math.floor(Math.random() * 1025) + 1;
  await loadPokemon(id);
}

/* ═══════════════════════════════════════════════════
   INIT (sin cambios)
   ═══════════════════════════════════════════════════ */
function initSearch() {
  const form = $('searchForm');
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
  document.querySelectorAll('.starter-chip').forEach(chip => {
    chip.addEventListener('click', () => loadPokemon(chip.dataset.name));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  show($('welcomeState'));
  initSearch();
  initStarters();
  renderRecents();
  $('btnRandom').addEventListener('click', loadRandom);

  if (!state.recents.length) {
    setTimeout(() => loadPokemon('ditto'), 600);
  } else {
    loadPokemon(state.recents[0].name);
  }
});