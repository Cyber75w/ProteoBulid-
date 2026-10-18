/**
 * ProteoBuild — application core.
 *
 * Everything here runs without the 3D library. The Three.js model lives in
 * viewer.js and is imported dynamically, so an unreachable CDN can never stop
 * navigation, the amino-acid tools or the stability lab from working.
 */
const VIEWS = ['home', 'amino', 'secondary', 'folding', 'stability'];
const MODULES = ['amino', 'secondary', 'folding', 'stability'];

const STORE = {
  completed: 'proteobuild-completed',
  theme: 'proteobuild-theme',
  onboarded: 'proteobuild-onboarded',
  coachNever: 'proteobuild-coach-never'
};

const AMINO_ACIDS = [
  { code: 'A', name: 'Alanine', group: 'nonpolar' }, { code: 'R', name: 'Arginine', group: 'charged' },
  { code: 'N', name: 'Asparagine', group: 'polar' }, { code: 'D', name: 'Aspartic acid', group: 'charged' },
  { code: 'C', name: 'Cysteine', group: 'polar' }, { code: 'Q', name: 'Glutamine', group: 'polar' },
  { code: 'E', name: 'Glutamic acid', group: 'charged' }, { code: 'G', name: 'Glycine', group: 'nonpolar' },
  { code: 'H', name: 'Histidine', group: 'charged' }, { code: 'I', name: 'Isoleucine', group: 'nonpolar' },
  { code: 'L', name: 'Leucine', group: 'nonpolar' }, { code: 'K', name: 'Lysine', group: 'charged' },
  { code: 'M', name: 'Methionine', group: 'nonpolar' }, { code: 'F', name: 'Phenylalanine', group: 'nonpolar' },
  { code: 'P', name: 'Proline', group: 'nonpolar' }, { code: 'S', name: 'Serine', group: 'polar' },
  { code: 'T', name: 'Threonine', group: 'polar' }, { code: 'W', name: 'Tryptophan', group: 'nonpolar' },
  { code: 'Y', name: 'Tyrosine', group: 'polar' }, { code: 'V', name: 'Valine', group: 'nonpolar' }
];

const GROUP_LABEL = { nonpolar: 'Nonpolar', polar: 'Polar', charged: 'Charged' };

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => motionQuery.matches;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const store = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private mode */ } }
};

/* ══════════════════════════════════════════════════════════════
   Navigation & URL state
   ══════════════════════════════════════════════════════════════ */
let activeView = 'home';

// Returns a known view name, or null for unrelated hashes (#main, #about…)
function viewFromHash() {
  const hash = location.hash.replace('#', '');
  return VIEWS.includes(hash) ? hash : null;
}

function navigate(view, { push = true } = {}) {
  if (!VIEWS.includes(view)) view = 'home';

  $$('.view').forEach((el) => {
    const on = el.id === `view-${view}`;
    el.classList.toggle('active', on);
    el.hidden = !on;
  });

  $$('.nav-item').forEach((el) => {
    const on = el.dataset.view === view;
    el.classList.toggle('active', on);
    if (on) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });

  activeView = view;

  if (push && location.hash !== `#${view}`) {
    history.pushState({ view }, '', `#${view}`);
  }

  if (view === 'folding') loadViewer();

  const anchor = $(`#view-${view}`);
  if (anchor && !reduced()) window.scrollTo({ top: 0, behavior: 'smooth' });
  else window.scrollTo({ top: 0 });
}

$$('[data-go]').forEach((el) => {
  el.addEventListener('click', (event) => {
    event.preventDefault();
    navigate(el.dataset.go);
    closeDrawer();
  });
});

$$('.nav-item').forEach((el) => {
  el.addEventListener('click', () => {
    navigate(el.dataset.view);
    closeDrawer();
  });
});

function syncFromLocation() {
  const target = viewFromHash();
  if (target && target !== activeView) navigate(target, { push: false });
}

window.addEventListener('popstate', syncFromLocation);
window.addEventListener('hashchange', syncFromLocation);

/* ══════════════════════════════════════════════════════════════
   Sidebar: desktop rail + mobile drawer
   ══════════════════════════════════════════════════════════════ */
const sidebar = $('#sidebar');
const backdrop = $('#sidebar-backdrop');
const menuButton = $('#menu-button');
const railToggle = $('#rail-toggle');

function openDrawer() {
  sidebar.classList.add('open');
  backdrop.hidden = false;
  document.body.classList.add('menu-open');
  menuButton.setAttribute('aria-expanded', 'true');
}

function closeDrawer() {
  sidebar.classList.remove('open');
  backdrop.hidden = true;
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeDrawer() : openDrawer();
});
backdrop.addEventListener('click', closeDrawer);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDrawer();
    hideCoach();
    closeRamachandran();
  }
});

// Swipe-left closes the drawer on touch screens.
let swipeStart = null;
sidebar.addEventListener('touchstart', (event) => { swipeStart = event.touches[0].clientX; }, { passive: true });
sidebar.addEventListener('touchend', (event) => {
  if (swipeStart === null) return;
  const delta = event.changedTouches[0].clientX - swipeStart;
  swipeStart = null;
  if (delta < -60) closeDrawer();
}, { passive: true });

railToggle.addEventListener('click', () => {
  const collapsed = sidebar.classList.toggle('collapsed');
  railToggle.setAttribute('aria-expanded', String(!collapsed));
  railToggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
  railToggle.textContent = collapsed ? '»' : '«';
  railToggle.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  viewerCtl?.resize();
});

/* ══════════════════════════════════════════════════════════════
   Theme — system / light / dark, persisted
   ══════════════════════════════════════════════════════════════ */
const THEME_ORDER = ['system', 'light', 'dark'];
const themeToggle = $('#theme-toggle');
const systemDark = matchMedia('(prefers-color-scheme: dark)');
let themeMode = store.get(STORE.theme) || 'system';

function isDark() {
  return themeMode === 'dark' || (themeMode === 'system' && systemDark.matches);
}

function applyTheme() {
  const dark = isDark();
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const meta = $('#meta-theme');
  if (meta) meta.setAttribute('content', dark ? '#15171a' : '#f6f6f1');

  const next = THEME_ORDER[(THEME_ORDER.indexOf(themeMode) + 1) % THEME_ORDER.length];
  themeToggle.setAttribute('aria-label', `Colour theme: ${themeMode}. Switch to ${next}.`);
  themeToggle.title = `Theme: ${themeMode}`;
  viewerCtl?.setTheme(dark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  themeMode = THEME_ORDER[(THEME_ORDER.indexOf(themeMode) + 1) % THEME_ORDER.length];
  store.set(STORE.theme, themeMode);
  applyTheme();
});

systemDark.addEventListener?.('change', () => {
  if (themeMode === 'system') applyTheme();
});

/* ══════════════════════════════════════════════════════════════
   Progress — one "mark complete" per module, persisted
   ══════════════════════════════════════════════════════════════ */
const completed = new Set();
const progressText = $('#progress-text');
const progressBar = $('#progress-bar');

function loadCompleted() {
  let saved = [];
  try { saved = JSON.parse(store.get(STORE.completed) || '[]'); } catch (e) { saved = []; }
  saved.forEach((view) => { if (MODULES.includes(view)) completed.add(view); });
}

function saveCompleted() {
  store.set(STORE.completed, JSON.stringify([...completed]));
}

function updateProgress() {
  progressText.textContent = `${completed.size} / 4`;
  progressBar.style.width = `${completed.size * 25}%`;

  $$('.nav-item').forEach((el) => el.classList.toggle('done', completed.has(el.dataset.view)));

  $$('.complete-button').forEach((btn) => {
    const done = completed.has(btn.dataset.complete);
    btn.dataset.done = String(done);
    btn.disabled = done;
    if (btn.firstChild) {
      btn.firstChild.nodeValue = done ? 'Module completed ' : btn.dataset.label;
    }
  });
}

$$('.complete-button').forEach((btn) => {
  if (btn.firstChild) btn.dataset.label = btn.firstChild.nodeValue;
  btn.addEventListener('click', () => {
    const view = btn.dataset.complete;
    if (!MODULES.includes(view) || completed.has(view)) return;
    completed.add(view);
    saveCompleted();
    updateProgress();
    const message = $(`[data-complete-msg="${view}"]`);
    if (message) message.classList.add('show');
    burstConfetti(btn);
  });
});

function burstConfetti(fromEl) {
  if (reduced()) return;
  const layer = $('#confetti-layer');
  const rect = fromEl.getBoundingClientRect();
  const colors = ['var(--peach)', 'var(--lilac)', 'var(--mint-strong)', 'var(--gold)', 'var(--accent)'];
  for (let i = 0; i < 12; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
    const distance = 55 + Math.random() * 75;
    piece.style.left = `${rect.left + rect.width / 2}px`;
    piece.style.top = `${rect.top + rect.height / 2}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--cx', `${Math.round(Math.cos(angle) * distance)}px`);
    piece.style.setProperty('--cy', `${Math.round(Math.sin(angle) * distance + 45)}px`);
    piece.style.setProperty('--cr', `${Math.round(Math.random() * 540 - 270)}deg`);
    piece.style.animationDelay = `${Math.round(Math.random() * 120)}ms`;
    layer.append(piece);
    setTimeout(() => piece.remove(), 1500);
  }
}

/* ══════════════════════════════════════════════════════════════
   Module 01 — amino acid grid, filters, search, sequence
   ══════════════════════════════════════════════════════════════ */
const grid = $('#amino-grid');
const gridEmpty = $('#grid-empty');
const searchInput = $('#amino-search');
const searchCount = $('#search-count');
const sequenceOutput = $('#sequence-output');
const sequenceCount = $('#sequence-count');
const sequenceCode = $('#sequence-code');

let activeFilter = 'all';
let searchTerm = '';
let sequence = [];

function matchingAmino() {
  const term = searchTerm.trim().toLowerCase();
  return AMINO_ACIDS.filter((acid) => {
    const inGroup = activeFilter === 'all' || acid.group === activeFilter;
    const inSearch = !term || acid.name.toLowerCase().includes(term) || acid.code.toLowerCase() === term;
    return inGroup && inSearch;
  });
}

function renderAmino() {
  const matches = matchingAmino();
  grid.replaceChildren();

  matches.forEach((acid) => {
    const tile = document.createElement('button');
    tile.className = 'amino-tile';
    tile.type = 'button';
    tile.title = `Add ${acid.name}`;
    tile.setAttribute('aria-label', `Add ${acid.name} (${GROUP_LABEL[acid.group]})`);
    tile.innerHTML = `<b>${acid.code}</b><span>${acid.name}</span><small>${acid.group.toUpperCase()}</small>`;
    tile.addEventListener('click', () => addResidue(acid));
    grid.append(tile);
  });

  gridEmpty.hidden = matches.length > 0;
  searchCount.textContent = `${matches.length} of ${AMINO_ACIDS.length}`;
}

function fillGroupCounts() {
  $$('.class-chip').forEach((chip) => {
    const group = chip.dataset.class;
    const count = group === 'all'
      ? AMINO_ACIDS.length
      : AMINO_ACIDS.filter((acid) => acid.group === group).length;
    const label = chip.querySelector('span');
    if (label) label.textContent = String(count);
    else chip.append(Object.assign(document.createElement('span'), { textContent: String(count) }));
  });
}

$$('.class-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    $$('.class-chip').forEach((other) => other.classList.toggle('active', other === chip));
    activeFilter = chip.dataset.class;
    renderAmino();
  });
});

let searchTimer = 0;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchTerm = searchInput.value;
    renderAmino();
  }, 150);
});

grid.addEventListener('keydown', (event) => {
  const tiles = $$('.amino-tile', grid);
  const index = tiles.indexOf(document.activeElement);
  if (index === -1) return;

  const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  let next = null;
  if (event.key === 'ArrowRight') next = index + 1;
  else if (event.key === 'ArrowLeft') next = index - 1;
  else if (event.key === 'ArrowDown') next = index + columns;
  else if (event.key === 'ArrowUp') next = index - columns;
  else if (event.key === 'Escape') {
    searchInput.value = '';
    searchTerm = '';
    renderAmino();
    return;
  } else return;

  event.preventDefault();
  if (tiles[next]) tiles[next].focus();
});

function addResidue(acid) {
  if (sequence.length >= 30) return;
  sequence.push(acid);
  renderSequence();
}

function removeResidue(index) {
  sequence.splice(index, 1);
  renderSequence();
}

function renderSequence() {
  sequenceOutput.replaceChildren();

  if (!sequence.length) {
    const empty = document.createElement('span');
    empty.className = 'empty-sequence';
    empty.textContent = 'Your sequence will appear here';
    sequenceOutput.append(empty);
  } else {
    sequence.forEach((acid, index) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'residue';
      chip.textContent = acid.code;
      chip.dataset.tooltip = `${acid.name} — ${GROUP_LABEL[acid.group]}`;
      chip.setAttribute('aria-label', `${acid.name}, ${GROUP_LABEL[acid.group]}. Remove from sequence.`);
      chip.addEventListener('click', () => removeResidue(index));
      sequenceOutput.append(chip);
    });
  }

  sequenceCount.textContent = `${sequence.length} ${sequence.length === 1 ? 'residue' : 'residues'}`;
  sequenceCode.textContent = sequence.map((acid) => acid.code).join('') || '—';
}

$('#clear-sequence').addEventListener('click', () => {
  sequence = [];
  renderSequence();
});

/* ══════════════════════════════════════════════════════════════
   Module 02 — secondary structure switch, orientation, reference
   ══════════════════════════════════════════════════════════════ */
const structureInfo = {
  helix: {
    title: 'The alpha helix',
    text: 'Hydrogen bonds form along the backbone, helping stabilize a coil. Side chains point outward from the helix.'
  },
  sheet: {
    title: 'The beta sheet',
    text: 'Hydrogen bonds connect neighboring strands. The strands may run in the same or opposite directions.'
  }
};

const secondaryVisual = $('#secondary-visual');
const orientationRow = $('#orientation-row');
let structureMode = 'helix';
let sheetOrientation = 'antiparallel';

function helixMarkup() {
  const ribs = '<i></i>'.repeat(11);
  const bonds = '<span></span>'.repeat(4);
  return `<div class="helix-ribbon">${ribs}</div><div class="h-bonds">${bonds}</div>`;
}

function sheetMarkup() {
  const strands = [0, 1, 2, 3].map((i) => {
    const reverse = sheetOrientation === 'antiparallel' && i % 2 ? ' reverse' : '';
    return `<div class="beta-strand${reverse}">${'<span></span>'.repeat(7)}</div>`;
  }).join('');
  return `<div class="beta-sheet">${strands}</div><div class="beta-bond"></div><div class="beta-bond two"></div>`;
}

function renderStructure() {
  secondaryVisual.innerHTML = structureMode === 'helix' ? helixMarkup() : sheetMarkup();
  secondaryVisual.className = `secondary-visual ${structureMode === 'helix' ? 'helix-visual' : 'sheet-visual'}`;
  secondaryVisual.setAttribute('aria-label',
    structureMode === 'helix' ? 'Conceptual diagram of an alpha helix' : 'Conceptual diagram of a beta sheet');
}

$$('.structure-option').forEach((btn) => {
  btn.addEventListener('click', () => {
    structureMode = btn.dataset.structure;
    $$('.structure-option').forEach((other) => {
      const on = other === btn;
      other.classList.toggle('active', on);
      other.querySelector('.option-check').textContent = on ? '●' : '○';
    });
    $('#structure-title').textContent = structureInfo[structureMode].title;
    $('#structure-explanation').textContent = structureInfo[structureMode].text;
    orientationRow.hidden = structureMode !== 'sheet';
    renderStructure();
  });
});

$$('.orientation-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    sheetOrientation = btn.dataset.orientation;
    $$('.orientation-btn').forEach((other) => other.classList.toggle('active', other === btn));
    renderStructure();
  });
});

const ramaPop = $('#rama-pop');
const ramaRef = $('#rama-ref');

function closeRamachandran() {
  if (!ramaPop || ramaPop.hidden) return;
  ramaPop.hidden = true;
  ramaRef.setAttribute('aria-expanded', 'false');
}

ramaRef.addEventListener('click', () => {
  const open = ramaPop.hidden;
  ramaPop.hidden = !open;
  ramaRef.setAttribute('aria-expanded', String(open));
  if (open) $('#rama-close').focus();
});

$('#rama-close').addEventListener('click', () => {
  closeRamachandran();
  ramaRef.focus();
});

/* ══════════════════════════════════════════════════════════════
   Module 03 — on-demand 3D viewer
   ══════════════════════════════════════════════════════════════ */
const viewerContainer = $('#protein-viewer');
const viewerLoading = $('#viewer-loading');
const viewerFallback = $('#viewer-fallback');

let viewerCtl = null;
let viewerLoadingState = null;
let viewerFailed = false;
let pendingSubunits = false;
let pendingQuality = 'medium';

function showFallback() {
  viewerLoading.hidden = true;
  viewerFallback.hidden = false;
}

async function loadViewer({ force = false } = {}) {
  if (viewerCtl) {
    viewerCtl.resize();
    return viewerCtl;
  }
  if (viewerFailed && !force) return null;
  if (viewerLoadingState) return viewerLoadingState;

  viewerLoading.hidden = false;
  viewerFallback.hidden = true;

  viewerLoadingState = (async () => {
    try {
      const mod = await import('./viewer.js'); // rejects when the CDN is unreachable
      viewerCtl = mod.createViewer(viewerContainer, {
        theme: isDark() ? 'dark' : 'light',
        quality: pendingQuality,
        subunits: pendingSubunits,
        reducedMotion: reduced()
      });
      viewerLoading.hidden = true;
      viewerFallback.hidden = true;
      viewerFailed = false;
      return viewerCtl;
    } catch (error) {
      console.error('3D model could not be loaded:', error);
      viewerFailed = true;
      showFallback();
      return null;
    } finally {
      viewerLoadingState = null;
    }
  })();

  return viewerLoadingState;
}

$('#viewer-retry').addEventListener('click', () => {
  viewerFailed = false;
  loadViewer({ force: true });
});

$('#offline-retry').addEventListener('click', () => {
  updateConnection();
  if (navigator.onLine) loadViewer({ force: true });
});

$('#reset-view').addEventListener('click', () => viewerCtl?.reset());

$('#quality-select').addEventListener('change', (event) => {
  pendingQuality = event.target.value;
  viewerCtl?.setQuality(pendingQuality);
});

$('#fullscreen-btn').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await viewerContainer.requestFullscreen();
  } catch (error) {
    console.warn('Fullscreen unavailable', error);
  }
});

document.addEventListener('fullscreenchange', () => {
  setTimeout(() => viewerCtl?.resize(), 60);
});

$('#screenshot-btn').addEventListener('click', () => {
  if (!viewerCtl) return;
  viewerCtl.screenshot((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'proteobuild-model.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
});

const CONCEPT_COPY = {
  tertiary: 'Interactions among side chains help stabilize the overall three-dimensional shape of one polypeptide chain.',
  quaternary: 'Some proteins contain multiple polypeptide subunits that associate to form a functional assembly.'
};

$$('.concept-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.concept-tab').forEach((other) => other.classList.toggle('active', other === btn));
    $('#concept-description').textContent = CONCEPT_COPY[btn.dataset.concept];
    pendingSubunits = btn.dataset.concept === 'quaternary';
    viewerCtl?.setSubunits(pendingSubunits);
  });
});

window.addEventListener('resize', () => viewerCtl?.resize());

motionQuery.addEventListener?.('change', (event) => viewerCtl?.setReducedMotion(event.matches));

// Warm the 3D module in the background so module 3 opens instantly.
if ('requestIdleCallback' in window && navigator.onLine) {
  requestIdleCallback(() => loadViewer(), { timeout: 5000 });
}

/* ══════════════════════════════════════════════════════════════
   Module 04 — stability lab (sliders, presets, undo/redo, export)
   ══════════════════════════════════════════════════════════════ */
const tempRange = $('#temp-range');
const phRange = $('#ph-range');
const saltRange = $('#salt-range');
const scoreEl = $('#stability-score');
const meter = $('.stability-meter');

const PRESETS = {
  physiological: { temp: 37, ph: 7, salt: 0.5 },
  heat: { temp: 42, ph: 7, salt: 0.5 },
  acid: { temp: 37, ph: 2, salt: 0.5 },
  base: { temp: 37, ph: 12, salt: 0.5 },
  salt: { temp: 37, ph: 7, salt: 2 }
};

const LABELS = [
  { min: 73, label: 'Familiar conditions', copy: 'The model remains compact under these selected conditions.' },
  { min: 44, label: 'Some stress on the structure', copy: 'The model shows some disruption as conditions move away from the reference range.' },
  { min: 0, label: 'High denaturation pressure', copy: 'The model appears more disrupted under these extreme conditions.' }
];

function snapshot() {
  return { temp: Number(tempRange.value), ph: Number(phRange.value), salt: Number(saltRange.value) };
}

let past = [];
let future = [];
let committed = snapshot();
let applyingHistory = false;
let displayedScore = Number(scoreEl.dataset.score || scoreEl.textContent);
let scoreRaf = 0;

function fillFor(range) {
  const min = Number(range.min);
  const max = Number(range.max);
  return ((Number(range.value) - min) / (max - min)) * 100;
}

function animateScore(to) {
  cancelAnimationFrame(scoreRaf);
  const from = displayedScore;
  if (reduced() || from === to) {
    displayedScore = to;
    scoreEl.textContent = String(to);
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / 500);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(from + (to - from) * eased);
    scoreEl.textContent = String(value);
    if (t < 1) scoreRaf = requestAnimationFrame(step);
    else displayedScore = to;
  };
  scoreRaf = requestAnimationFrame(step);
}

function updateLab() {
  const temp = Number(tempRange.value);
  const ph = Number(phRange.value);
  const salt = Number(saltRange.value);

  $('#temp-output').textContent = `${temp}°C`;
  $('#ph-output').textContent = ph.toFixed(1);
  $('#salt-output').textContent = `${salt.toFixed(2)} M`;

  [tempRange, phRange, saltRange].forEach((range) => {
    range.style.setProperty('--fill', `${fillFor(range).toFixed(1)}%`);
  });

  const tempPenalty = Math.max(0, temp - 37) * 0.86 + Math.max(0, 20 - temp) * 0.25;
  const phPenalty = Math.max(0, Math.abs(ph - 7) - 2) * 7.8;
  const saltPenalty = Math.max(0, Math.abs(salt - 0.5) - 0.5) * 12;
  const score = Math.max(8, Math.min(98, Math.round(94 - tempPenalty - phPenalty - saltPenalty)));

  meter.style.setProperty('--score-deg', `${score * 3.6}deg`);
  scoreEl.dataset.score = String(score);
  animateScore(score);

  const band = LABELS.find((entry) => score >= entry.min);
  $('#stability-label').textContent = band.label;
  $('#stability-copy').textContent = band.copy;

  $$('.preset-chip').forEach((chip) => {
    const preset = PRESETS[chip.dataset.preset];
    const active = preset && preset.temp === temp && preset.ph === ph && preset.salt === salt;
    chip.classList.toggle('active', Boolean(active));
  });
}

function commit(next) {
  if (applyingHistory) return;
  past.push(committed);
  if (past.length > 10) past.shift();
  future = [];
  committed = next;
  refreshHistoryButtons();
}

function refreshHistoryButtons() {
  $('#undo-btn').disabled = past.length === 0;
  $('#redo-btn').disabled = future.length === 0;
}

function applyState(state) {
  applyingHistory = true;
  tempRange.value = String(state.temp);
  phRange.value = String(state.ph);
  saltRange.value = String(state.salt);
  updateLab();
  applyingHistory = false;
}

[tempRange, phRange, saltRange].forEach((range) => {
  range.addEventListener('input', updateLab);
  range.addEventListener('change', () => {
    if (!applyingHistory) commit(snapshot());
    updateLab();
  });
});

$$('.preset-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const preset = PRESETS[chip.dataset.preset];
    if (!preset) return;
    applyState(preset);
    commit(snapshot());
    updateLab();
  });
});

$('#reset-lab').addEventListener('click', () => {
  applyState(PRESETS.physiological);
  commit(snapshot());
  updateLab();
});

$('#undo-btn').addEventListener('click', () => {
  if (!past.length) return;
  future.push(committed);
  committed = past.pop();
  applyState(committed);
  refreshHistoryButtons();
});

$('#redo-btn').addEventListener('click', () => {
  if (!future.length) return;
  past.push(committed);
  committed = future.pop();
  applyState(committed);
  refreshHistoryButtons();
});

$('#export-btn').addEventListener('click', () => {
  const payload = {
    temp: Number(tempRange.value),
    ph: Number(phRange.value),
    salt: Number(saltRange.value),
    score: Number(scoreEl.dataset.score),
    timestamp: new Date().toISOString(),
    note: 'ProteoBuild teaching model — illustrative only.'
  };
  download(JSON.stringify(payload, null, 2), 'proteobuild-stability.json', 'application/json');
});

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ══════════════════════════════════════════════════════════════
   Overview — expandable note, button ripple
   ══════════════════════════════════════════════════════════════ */
const aboutToggle = $('#about-toggle');
const aboutMore = $('#about-more');

aboutToggle.addEventListener('click', () => {
  const open = aboutMore.hidden;
  aboutMore.hidden = !open;
  aboutToggle.setAttribute('aria-expanded', String(open));
  aboutToggle.textContent = open ? 'SHOW LESS ↗' : 'ABOUT THIS SIMULATOR ↗';
});

document.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('.primary-button');
  if (!button) return;
  const rect = button.getBoundingClientRect();
  button.style.setProperty('--rx', `${event.clientX - rect.left}px`);
  button.style.setProperty('--ry', `${event.clientY - rect.top}px`);
  button.classList.remove('rippling');
  void button.offsetWidth;
  button.classList.add('rippling');
});

/* ══════════════════════════════════════════════════════════════
   Connection banner
   ══════════════════════════════════════════════════════════════ */
const offlineBanner = $('#offline-banner');

function updateConnection() {
  offlineBanner.hidden = navigator.onLine;
}

window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);

/* ══════════════════════════════════════════════════════════════
   Coach marks — first-visit tour
   ══════════════════════════════════════════════════════════════ */
const COACH_STEPS = [
  { view: 'home', target: '.module-nav', text: 'Switch modules here — four short steps from sequence to structure.' },
  { view: 'amino', target: '#amino-grid', text: 'Click amino acids to build a sequence. Click a residue to remove it.' },
  { view: 'folding', target: '#protein-viewer', text: 'Drag to rotate, scroll to zoom. Use the toolbar for quality and screenshots.' }
];

const coach = $('#coach');
const coachSpot = $('#coach-spot');
const coachCard = $('#coach-card');
const coachText = $('#coach-text');
const coachStepLabel = $('#coach-step');
const coachNext = $('#coach-next');
const coachNever = $('#coach-never');
let coachIndex = -1;

function positionCoach() {
  const step = COACH_STEPS[coachIndex];
  if (!step) return;
  const target = $(step.target);
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const pad = 8;

  coachSpot.style.left = `${rect.left - pad}px`;
  coachSpot.style.top = `${rect.top - pad}px`;
  coachSpot.style.width = `${rect.width + pad * 2}px`;
  coachSpot.style.height = `${rect.height + pad * 2}px`;

  const cardRect = coachCard.getBoundingClientRect();
  let top = rect.bottom + pad + 14;
  if (top + cardRect.height > window.innerHeight - 12) top = Math.max(12, rect.top - pad - 14 - cardRect.height);
  let left = rect.left;
  if (left + cardRect.width > window.innerWidth - 12) left = Math.max(12, window.innerWidth - cardRect.width - 12);

  coachCard.style.top = `${top}px`;
  coachCard.style.left = `${left}px`;
}

function showCoachStep(index) {
  coachIndex = index;
  const step = COACH_STEPS[index];
  if (!step) return hideCoach();

  navigate(step.view, { push: false });
  coach.hidden = false;
  coachStepLabel.textContent = `STEP ${index + 1} / ${COACH_STEPS.length}`;
  coachText.textContent = step.text;
  coachNext.firstChild.nodeValue = index === COACH_STEPS.length - 1 ? 'Finish ' : 'Next ';

  requestAnimationFrame(() => {
    const target = $(step.target);
    if (target) target.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
    setTimeout(positionCoach, reduced() ? 0 : 260);
  });
}

function hideCoach() {
  if (coach.hidden) return;
  coach.hidden = true;
  coachIndex = -1;
  store.set(STORE.onboarded, '1');
  if (coachNever.checked) store.set(STORE.coachNever, '1');
  navigate('home', { push: false });
}

coachNext.addEventListener('click', () => {
  if (coachIndex >= COACH_STEPS.length - 1) hideCoach();
  else showCoachStep(coachIndex + 1);
});

window.addEventListener('resize', () => { if (!coach.hidden) positionCoach(); });
window.addEventListener('scroll', () => { if (!coach.hidden) positionCoach(); }, { passive: true });

function startCoachIfFirstVisit() {
  if (store.get(STORE.onboarded) || store.get(STORE.coachNever)) return;
  setTimeout(() => showCoachStep(0), 700);
}

/* ══════════════════════════════════════════════════════════════
   Boot
   ══════════════════════════════════════════════════════════════ */
function boot() {
  loadCompleted();
  applyTheme();
  fillGroupCounts();
  renderAmino();
  renderSequence();
  renderStructure();
  updateProgress();
  updateLab();
  refreshHistoryButtons();
  updateConnection();

  navigate(viewFromHash(), { push: false });
  $('#main').setAttribute('tabindex', '-1');

  startCoachIfFirstVisit();

  if (activeView === 'folding') loadViewer();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
