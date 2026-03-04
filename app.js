/* ═══════════════════════════════════════════════════════════════
   POKÉDEX FIELD GUIDE — app.js
   Fetches from pokeapi.co · Dynamic type theming · No backend needed
   ═══════════════════════════════════════════════════════════════ */

// ── TYPE COLOR PALETTE ────────────────────────────────────────────────────────
// Each type gets an accent color that drives the entire page theme

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
  normal:   '#fafafa',
  fire:     '#fff8f7',
  water:    '#f5f9ff',
  electric: '#fffde7',
  grass:    '#f5fbf5',
  ice:      '#f0fbfd',
  fighting: '#fff5f5',
  poison:   '#fdf5ff',
  ground:   '#fffbf0',
  flying:   '#f5f7ff',
  psychic:  '#fff5fb',
  bug:      '#f8fdf0',
  rock:     '#faf7f5',
  ghost:    '#f8f5ff',
  dragon:   '#f5f8ff',
  dark:     '#f5f6f7',
  steel:    '#f5f7f8',
  fairy:    '#fff5f9',
};

// ── STAT LABELS ───────────────────────────────────────────────────────────────

const STAT_LABELS = {
  hp:               'HP',
  attack:           'ATK',
  defense:          'DEF',
  'special-attack':  'SP.ATK',
  'special-defense': 'SP.DEF',
  speed:            'SPD',
};

// ── MAX STAT for bar scaling (gen highest known)
const STAT_MAX = 255;

// ── STATE ─────────────────────────────────────────────────────────────────────

const state = {
  current: null,
  recents: JSON.parse(localStorage.getItem('pd_recents') || '[]'),
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);
const show = el => el.classList.add('active');
const hide = el => el.classList.remove('active');
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');

function padId(n) {
  return '#' + String(n).padStart(3, '0');
}

function formatHeight(dm) {
  const m = dm / 10;
  return m.toFixed(1) + ' m';
}

function formatWeight(hg) {
  const kg = hg / 10;
  return kg.toFixed(1) + ' kg';
}

// ── THEME ENGINE ──────────────────────────────────────────────────────────────

function applyTheme(primaryType) {
  const color = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
  const bgColor = TYPE_BG_COLORS[primaryType] || '#f5f0e8';

  const root = document.documentElement;
  root.style.setProperty('--accent', color.hex);
  root.style.setProperty('--accent-rgb', color.rgb);
  root.style.setProperty('--accent-soft', `rgba(${color.rgb},.09)`);
  root.style.setProperty('--accent-mid', `rgba(${color.rgb},.2)`);

  // Subtle bg tint
  document.body.style.backgroundColor = bgColor;
  const orb = $('bgOrb');
  orb.style.background = `radial-gradient(circle, rgba(${color.rgb},.15) 0%, transparent 70%)`;
}

// ── API LAYER ─────────────────────────────────────────────────────────────────

async function fetchPokemon(nameOrId) {
  const key = String(nameOrId).toLowerCase().trim();
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
  if (!res.ok) throw new Error(`No Pokémon found: ${nameOrId}`);
  return res.json();
}

async function fetchSpecies(url) {
  try {
    const res = await fetch(url);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

// ── RECENTS ───────────────────────────────────────────────────────────────────

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

// ── RENDER ────────────────────────────────────────────────────────────────────

function renderPokemon(data, species) {
  // Artwork — prefer official-artwork, fallback to front_default sprite
  const artwork =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.front_default ||
    '';

  // Types
  const types = data.types.map(t => t.type.name);
  const primaryType = types[0];

  // Flavor text (English, remove weird newlines)
  let flavorText = '';
  if (species) {
    const entry = species.flavor_text_entries?.find(e => e.language.name === 'en');
    if (entry) flavorText = entry.flavor_text.replace(/\f|\n/g, ' ').trim();
  }

  // Genus (English)
  let genus = '';
  if (species) {
    const gen = species.genera?.find(g => g.language.name === 'en');
    if (gen) genus = gen.genus;
  }

  // Apply dynamic theme
  applyTheme(primaryType);

  // Number
  $('pokeNumber').textContent = padId(data.id);

  // Artwork
  const artEl = $('pokeArtwork');
  artEl.style.opacity = '0';
  artEl.src = artwork;
  artEl.alt = data.name;
  artEl.onload = () => {
    artEl.style.transition = 'opacity .4s ease';
    artEl.style.opacity = '1';
  };

  // Types badges
  $('pokeTypes').innerHTML = types.map(t => {
    const c = TYPE_COLORS[t] || TYPE_COLORS.normal;
    return `<span class="type-badge" style="background:${c.hex}">${t}</span>`;
  }).join('');

  // Name & genus
  $('pokeName').textContent = data.name;
  $('pokeGenus').textContent = genus || '';

  // Flavor
  $('pokeFlavor').textContent = flavorText || 'No entry found.';

  // Metrics
  $('pokeHeight').textContent = formatHeight(data.height);
  $('pokeWeight').textContent = formatWeight(data.weight);
  $('pokeExp').textContent = data.base_experience ?? '—';

  // Abilities
  $('pokeAbilities').innerHTML = data.abilities.map(a => `
    <span class="ability-tag${a.is_hidden ? ' hidden-ability' : ''}">
      ${capitalize(a.ability.name)}${a.is_hidden ? ' ✦' : ''}
    </span>
  `).join('');

  // Stats
  $('pokeStats').innerHTML = data.stats.map(s => {
    const label = STAT_LABELS[s.stat.name] || s.stat.name;
    const val = s.base_stat;
    const pct = Math.min((val / STAT_MAX) * 100, 100);
    return `
      <div class="stat-row">
        <span class="stat-name">${label}</span>
        <span class="stat-val">${val}</span>
        <div class="stat-bar-wrap">
          <div class="stat-bar" data-pct="${pct}"></div>
        </div>
      </div>
    `;
  }).join('');

  // Animate stat bars after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.stat-bar').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    });
  });

  // Moves (first 12)
  const moves = data.moves.slice(0, 12);
  $('pokeMoves').innerHTML = moves.map(m =>
    `<span class="move-tag">${capitalize(m.move.name)}</span>`
  ).join('');
}

// ── LOAD POKEMON ─────────────────────────────────────────────────────────────

async function loadPokemon(nameOrId) {
  // Reset states
  hide($('welcomeState'));
  hide($('pokeCard'));
  hide($('errorState'));
  show($('loadingState'));

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    const data = await fetchPokemon(nameOrId);

    // Fetch species for flavor text & genus
    let species = null;
    if (data.species?.url) {
      species = await fetchSpecies(data.species.url);
    }

    hide($('loadingState'));
    renderPokemon(data, species);
    show($('pokeCard'));

    // Update recents
    addToRecents(data.name, data.id);
    state.current = data;

    // Update search input
    $('searchInput').value = capitalize(data.name);

  } catch (err) {
    hide($('loadingState'));
    $('errorMsg').textContent = `"${nameOrId}" was not found. Check the name or number.`;
    show($('errorState'));
  }
}

// ── RANDOM POKÉMON ────────────────────────────────────────────────────────────

async function loadRandom() {
  // 1025 is approx total Pokémon count as of Gen 9
  const id = Math.floor(Math.random() * 1025) + 1;
  await loadPokemon(id);
}

// ── SEARCH FORM ───────────────────────────────────────────────────────────────

function initSearch() {
  const form = $('searchForm');
  const input = $('searchInput');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = input.value.trim();
    if (val) loadPokemon(val.toLowerCase());
  });

  // Allow pressing Enter anywhere on page to focus search
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    }
    if (e.key === 'Escape') input.blur();
  });
}

// ── STARTERS ─────────────────────────────────────────────────────────────────

function initStarters() {
  document.querySelectorAll('.starter-chip').forEach(chip => {
    chip.addEventListener('click', () => loadPokemon(chip.dataset.name));
  });
}

// ── INIT ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Show welcome state
  show($('welcomeState'));

  // Init interactions
  initSearch();
  initStarters();
  renderRecents();

  // Random button
  $('btnRandom').addEventListener('click', loadRandom);

  // Load ditto on first visit as a demo if no recents
  if (!state.recents.length) {
    // Small delay so page paints first
    setTimeout(() => loadPokemon('ditto'), 600);
  } else {
    // Load last viewed
    loadPokemon(state.recents[0].name);
  }
});
