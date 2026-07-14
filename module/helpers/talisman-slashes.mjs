/**
 * Procedural, animated talisman slashes.
 *
 * Instead of swapping between the 27 pre-rendered Talisman-A-<N>.png images,
 * this module draws each slash as an SVG brush stroke overlaid on the base
 * (unmarked) talisman art. Every slash is stored as a small data record on the
 * talisman object:
 *
 *   { v, x, y, rot, len, seed }
 *
 * where x/y are fractions of the talisman artwork box (so every client can
 * render the same slash at any display size), rot is the stroke angle in
 * degrees, len is the stroke length as a fraction of the artwork width, and
 * seed deterministically drives the stroke's ragged geometry. Two clients
 * holding the same record draw pixel-identical slashes — nothing but these
 * few numbers ever crosses the wire.
 *
 * The talisman's `currMarkAmount` remains the source of truth for the COUNT.
 * `reconcileSlashes()` brings the slashes array in line with it, so code
 * paths that only bump the counter (slider, hunt-tracker sync, old saved
 * data) keep working: missing slashes are generated deterministically from
 * the talisman name, extras are trimmed.
 *
 * Everything here is plain DOM/SVG with no Foundry dependencies except the
 * two settings getters, which fall back gracefully outside Foundry so the
 * module can be exercised in a bare test page.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Bump to re-roll the geometry of every stored slash on load. */
export const SLASH_VERSION = 1;

/**
 * Unit space: the talisman artwork is NOMINAL_W units wide. The stroke
 * generator's absolute tuning (amplitudes, stroke widths, canvas height)
 * is calibrated for strokes ~75-100 units long, matching the ~150px-wide
 * talisman images the sheets actually render, so a unit is roughly a pixel.
 */
const NOMINAL_W = 150;

/** Aspect (w/h) of the Talisman-A artwork; used for placement heuristics. */
const DEFAULT_ASPECT = 613 / 920;

/**
 * The paper strip is baked into a wider transparent canvas in the talisman
 * art. Slash CENTRES stay clamped to the paper band; the strokes themselves
 * overhang it on both sides, like the pre-rendered marks do.
 */
const PAPER_X_MIN = 0.33;
const PAPER_X_MAX = 0.66;

const FILTER_VARIANTS = 6;
const REDS = ['#e60a02', '#ff2a16', '#d40600', '#f5160a', '#c50400'];

/* -------------------------------------------- */
/*  Deterministic randomness                    */
/* -------------------------------------------- */

/** Small fast seeded PRNG (mulberry32). */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a hash of a string to a 31-bit seed, for deterministic auto-layout. */
function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 1;
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/**
 * The unmarked variant of a pre-rendered talisman image path
 * (…/Talisman-A-7.png → …/Talisman-A-0.png). Paths that don't follow the
 * -<N>.png convention pass through untouched.
 */
export function talismanBaseImage(imagePath) {
  return String(imagePath ?? '').replace(/-(\d+)\.png$/, '-0.png');
}

/* -------------------------------------------- */
/*  Settings access (safe outside Foundry)      */
/* -------------------------------------------- */

/** Whether the world renders procedural animated slashes at all. */
export function animatedTalismansEnabled() {
  try {
    return game.settings.get('cain', 'animatedTalismans');
  } catch (e) {
    return true;
  }
}

/**
 * Per-client effect quality: 'full' | 'reduced' | 'none'.
 * OS-level reduced-motion preference caps the result at 'reduced'.
 */
export function getEffectQuality() {
  let quality = 'full';
  try {
    quality = game.settings.get('cain', 'talismanEffectQuality') ?? 'full';
  } catch (e) { /* outside Foundry or setting not registered yet */ }
  if (
    quality === 'full' &&
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    quality = 'reduced';
  }
  return quality;
}

/* -------------------------------------------- */
/*  Slash records                               */
/* -------------------------------------------- */

/**
 * Create a slash record. x/y are fractions of the artwork box; the click
 * handlers pass the pointer position, the auto-layout passes a tally-stack
 * position. Angle and length derive deterministically from the seed (via an
 * independent stream, so the geometry stream below stays untouched).
 *
 * @param {number} fx      Horizontal centre, fraction of artwork width.
 * @param {number} fy      Vertical centre, fraction of artwork height.
 * @param {number} [seed]  31-bit seed; random when omitted (manual placement).
 * @param {number} [aspect] Artwork w/h, for the vertical overhang clamp.
 */
export function createSlashData(fx, fy, seed, aspect = DEFAULT_ASPECT) {
  if (seed === undefined) seed = Math.floor(Math.random() * 0x7fffffff);
  const p = mulberry32(seed ^ 0x9e3779b9);
  const rnd = (a, b) => a + p() * (b - a);
  // Shallow book-style angle: every cut leans the same way ("\"), jittered.
  const rot = rnd(11, 28);
  // The stroke body crosses the paper band with a bold overhang each side —
  // proportioned between the book's cuts and the pre-rendered A-series art.
  const len = rnd(0.58, 0.75);
  // Vertical half-extent of the tilted stroke, as a fraction of artwork
  // height — keeps the whole stroke on the artwork.
  const vext = ((len * 0.95 * Math.sin((rot * Math.PI) / 180)) / 2) * aspect;
  return {
    v: SLASH_VERSION,
    x: Math.round(clamp(fx, PAPER_X_MIN, PAPER_X_MAX) * 1000) / 1000,
    y: Math.round(clamp(fy, vext + 0.015, 1 - vext - 0.015) * 1000) / 1000,
    rot: Math.round(rot * 10) / 10,
    len: Math.round(len * 1000) / 1000,
    seed,
  };
}

function isValidSlash(s) {
  return (
    s &&
    s.v === SLASH_VERSION &&
    Number.isFinite(s.x) &&
    Number.isFinite(s.y) &&
    Number.isFinite(s.rot) &&
    Number.isFinite(s.len) &&
    Number.isFinite(s.seed)
  );
}

/**
 * Deterministic placement for slashes nobody placed by hand (counter-only
 * updates, old saves): stack down the paper like tally marks, the way the
 * pre-rendered art does, wrapping into a second pass for very full talismans.
 */
function autoSlashData(talisman, index) {
  const seed = hashSeed(`${talisman.name ?? ''}|${index}`);
  const p = mulberry32(seed ^ 0x85ebca6b);
  const row = index % 14;
  const pass = Math.floor(index / 14);
  const fx = 0.5 + (p() * 2 - 1) * 0.1 + pass * 0.05;
  const fy = 0.085 + row * 0.058 + (p() * 2 - 1) * 0.012 + pass * 0.02;
  return createSlashData(fx, fy, seed);
}

/**
 * Bring `talisman.slashes` in line with `talisman.currMarkAmount`: trim
 * extras from the end (newest first, mirroring right-click removal), pad
 * missing ones deterministically, and re-roll records from other geometry
 * versions. Mutates the talisman in place.
 *
 * Deterministic on purpose: read-only callers (rendering on player clients)
 * converge on the same padding a GM client would persist.
 *
 * @returns {boolean} true if anything changed.
 */
export function reconcileSlashes(talisman) {
  const target = Math.max(0, parseInt(talisman.currMarkAmount, 10) || 0);
  let changed = false;
  if (!Array.isArray(talisman.slashes)) {
    talisman.slashes = [];
    changed = true;
  }
  const slashes = talisman.slashes;
  for (let i = 0; i < slashes.length; i++) {
    if (!isValidSlash(slashes[i])) {
      slashes[i] = autoSlashData(talisman, i);
      changed = true;
    }
  }
  while (slashes.length > target) {
    slashes.pop();
    changed = true;
  }
  for (let i = slashes.length; i < target; i++) {
    slashes.push(autoSlashData(talisman, i));
    changed = true;
  }
  return changed;
}

/* -------------------------------------------- */
/*  Stroke geometry                             */
/* -------------------------------------------- */

/**
 * One tapered "spindle" stroke: a filled outline that narrows to sharp tips.
 * plateauK > 1 turns the smooth taper into a marker-like plateau — the
 * stroke ramps to full width quickly, stays fat, and ends bluntly.
 */
function spindlePath(len, x0, cy, amp, phase, drift, maxHalf, taperPow, plateauK = 1) {
  const segs = 16;
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const x = x0 + t * len;
    const y = cy + Math.sin(t * Math.PI * 1.15 + phase) * amp + drift * (t - 0.5) * 2;
    pts.push([x, y, t]);
  }
  const half = (t) =>
    maxHalf * Math.pow(Math.min(1, Math.sin(Math.PI * clamp(t, 0, 1)) * plateauK), taperPow);
  const top = [];
  const bot = [];
  for (let i = 0; i < pts.length; i++) {
    const [x, y, t] = pts[i];
    const p = pts[Math.max(0, i - 1)];
    const q = pts[Math.min(pts.length - 1, i + 1)];
    let tx = q[0] - p[0];
    let ty = q[1] - p[1];
    const m = Math.hypot(tx, ty) || 1;
    tx /= m;
    ty /= m;
    const nx = -ty;
    const ny = tx;
    const hw = half(t);
    top.push([x + nx * hw, y + ny * hw]);
    bot.push([x - nx * hw, y - ny * hw]);
  }
  const ring = top.concat(bot.reverse());
  let d = `M ${ring[0][0].toFixed(1)} ${ring[0][1].toFixed(1)}`;
  for (let i = 1; i < ring.length; i++) {
    d += ` L ${ring[i][0].toFixed(1)} ${ring[i][1].toFixed(1)}`;
  }
  return d + ' Z';
}

/**
 * Build the stroke bundle for one slash, modeled on the slashes in the CAIN
 * book: a solid ragged BODY (one or two strokes stacked nearly on top of
 * each other, mostly opaque, blunt ends) plus exactly ONE long thin hairline
 * through the same axis whose tips thin out past the body's ends.
 *
 * Deterministic: every random draw comes from the seed.
 *
 * @param {number} seed
 * @param {number} len  Body length in nominal units (NOMINAL_W-relative).
 * @returns {{thick: object[], hair: object[], w: number, h: number}}
 */
export function buildSlashGeometry(seed, len) {
  const p = mulberry32(seed);
  const rnd = (a, b) => a + p() * (b - a);

  const H = 46;
  const cy = H / 2;
  const hairLen = len * rnd(1.3, 1.55);
  const w = Math.ceil(hairLen) + 24;
  const cx = w / 2;
  // Near-straight: a whisper of bow, tiny phase jitter — the book's cuts
  // barely curve.
  const phase = rnd(-0.5, 0.5);
  const drift = rnd(-1.6, 1.6);
  const amp = rnd(0.9, 2.0);
  const baseOff = rnd(-1.2, 1.2);
  const thick = [];
  const hair = [];
  // Sometimes the brush doubles back: a second body stroke almost on top.
  const nThick = 1 + (p() < 0.35 ? 1 : 0);
  for (let k = 0; k < nThick; k++) {
    const L = len * rnd(0.8, 0.97);
    thick.push({
      d: spindlePath(
        L,
        cx - L / 2 + rnd(-len * 0.07, len * 0.07),
        cy + baseOff + rnd(-1.0, 1.0),
        amp * rnd(0.85, 1.1),
        phase + rnd(-0.2, 0.2),
        drift,
        len * rnd(0.026, 0.034), // fat: width scales with length
        0.8,
        2.4 // plateau: full width fast, blunt ragged ends
      ),
      fill: REDS[[0, 2][k % 2]],
      opacity: k === 0 ? rnd(0.96, 1) : rnd(0.85, 0.92),
    });
  }
  // The single hairline: runs the whole cut and well past both ends.
  hair.push({
    d: spindlePath(
      hairLen,
      cx - hairLen / 2,
      cy + baseOff + rnd(-1.1, 1.1),
      amp * rnd(0.95, 1.1),
      phase + rnd(-0.15, 0.15),
      drift * rnd(1.0, 1.3),
      rnd(0.55, 0.9),
      0.55
    ),
    fill: REDS[1],
    opacity: rnd(0.9, 0.98),
  });
  return { thick, hair, w, h: H };
}

/* -------------------------------------------- */
/*  Shared SVG filters                          */
/* -------------------------------------------- */

/**
 * Inject the shared, reusable stroke-texture filters (one small set of
 * variants for ALL slashes — far cheaper than a turbulence filter per
 * slash). "cain-sltex" = dry-brush texture (streaky transparency + rough
 * edges) for the thick strokes; "cain-slsharp" = a light roughen only,
 * keeping the hairlines crisp and continuous. Idempotent.
 */
export function ensureSlashFilters() {
  if (document.getElementById('cain-slash-filters')) return;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.id = 'cain-slash-filters';
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
  let defs = '';
  for (let i = 0; i < FILTER_VARIANTS; i++) {
    defs += `
    <filter id="cain-sltex${i}" x="-15%" y="-180%" width="130%" height="460%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${(0.018 + 0.004 * i).toFixed(3)} ${(0.42 + 0.04 * i).toFixed(3)}" numOctaves="2" seed="${i * 7 + 3}" result="n"/>
      <feColorMatrix in="n" type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  5 0 0 0 -0.45" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in" result="tx"/>
      <feDisplacementMap in="tx" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="cain-slsharp${i}" x="-15%" y="-180%" width="130%" height="460%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${(0.05 + 0.006 * i).toFixed(3)} 0.18" numOctaves="2" seed="${i * 5 + 1}" result="n"/>
      <feColorMatrix in="n" type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.35 0 0 0 -0.18" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in" result="tx"/>
      <feDisplacementMap in="tx" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
  }
  svg.innerHTML = `<defs>${defs}</defs>`;
  document.body.appendChild(svg);
}

/* -------------------------------------------- */
/*  Slash elements                              */
/* -------------------------------------------- */

/**
 * Build the positioned <svg> element for one slash record. All sizing is in
 * PERCENT of the overlay layer, so the element scales with whatever box the
 * talisman art is rendered in (sheet, window, pinned container).
 *
 * @param {object} slash    Slash record ({x, y, rot, len, seed}).
 * @param {number} aspect   Artwork w/h — needed because percentage heights
 *                          resolve against the layer height, not its width.
 */
export function buildSlashElement(slash, aspect = DEFAULT_ASPECT) {
  const lenUnits = slash.len * NOMINAL_W;
  const geo = buildSlashGeometry(slash.seed, lenUnits);
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'cain-slash');
  svg.setAttribute('viewBox', `0 0 ${geo.w} ${geo.h}`);
  svg.dataset.slashSeed = String(slash.seed);
  const nominalH = NOMINAL_W / aspect;
  svg.style.left = `${(slash.x * 100).toFixed(2)}%`;
  svg.style.top = `${(slash.y * 100).toFixed(2)}%`;
  svg.style.width = `${((geo.w / NOMINAL_W) * 100).toFixed(2)}%`;
  svg.style.height = `${((geo.h / nominalH) * 100).toFixed(2)}%`;
  svg.style.transform = `translate(-50%,-50%) rotate(${slash.rot}deg)`;

  const variant = (slash.seed >>> 0) % FILTER_VARIANTS;
  const paths = (list, filterId) =>
    `<g filter="url(#${filterId}${variant})">` +
    list
      .map((s) => `<path d="${s.d}" fill="${s.fill}" fill-opacity="${s.opacity}"/>`)
      .join('') +
    '</g>';
  svg.innerHTML = paths(geo.thick, 'cain-sltex') + paths(geo.hair, 'cain-slsharp');
  return svg;
}

/** Reveal a freshly carved slash: a fast knife-stroke wipe plus a hot flash. */
function animateSlashIn(svg, quality) {
  if (quality === 'none') return;
  if (quality === 'reduced') {
    svg.style.opacity = '0';
    requestAnimationFrame(() => {
      svg.style.transition = 'opacity .2s ease';
      svg.style.opacity = '1';
    });
    return;
  }
  svg.style.clipPath = 'inset(-90% 102% -90% -8%)';
  svg.classList.add('fresh');
  svg.getBoundingClientRect(); // commit the hidden state before transitioning
  requestAnimationFrame(() => {
    svg.style.transition = 'clip-path .13s cubic-bezier(.3,.1,.2,1)';
    svg.style.clipPath = 'inset(-90% -8% -90% -8%)';
  });
}

/** Un-cut: the wipe retreats back up the stroke the way it came. */
function animateSlashOut(layer, slash, aspect, quality) {
  if (quality === 'none') return;
  const svg = buildSlashElement(slash, aspect);
  svg.classList.add('dying');
  layer.appendChild(svg);
  if (quality === 'reduced') {
    svg.getBoundingClientRect();
    svg.style.transition = 'opacity .18s ease';
    svg.style.opacity = '0';
  } else {
    svg.style.clipPath = 'inset(-90% -8% -90% -8%)';
    svg.getBoundingClientRect();
    svg.style.transition =
      'clip-path .18s cubic-bezier(.55,0,.8,.4), opacity .18s ease';
    svg.style.clipPath = 'inset(-90% 102% -90% -8%)';
    svg.style.opacity = '0.3';
  }
  setTimeout(() => svg.remove(), 220);
}

/* -------------------------------------------- */
/*  Overlay rendering                           */
/* -------------------------------------------- */

/**
 * Last-rendered slash records per overlay key, so a re-render can tell which
 * slashes are new (carve them in) and which vanished (retreat them out) —
 * including on clients that merely RECEIVED the update over the socket.
 * Unknown keys prime silently: the worst failure mode is a missing
 * animation, never a spurious one.
 *
 * @type {Map<string, Map<number, object>>}
 */
const lastRendered = new Map();

/**
 * Render (or re-render) the slash overlay for one talisman into a
 * `.talisman-slash-layer` element sitting on top of the talisman art.
 *
 * @param {HTMLElement} layer   The overlay element (position:absolute,
 *                              inset:0 over the artwork box).
 * @param {object} talisman     The talisman record; reconciled in-memory
 *                              (not persisted) before drawing.
 * @param {object} [options]
 * @param {string} [options.key]      Stable identity for animation diffing,
 *                                    e.g. `gtw:Tension`. Omit to skip diffing.
 * @param {number} [options.aspect]   Artwork w/h if already known.
 */
export function renderSlashLayer(layer, talisman, { key, aspect } = {}) {
  ensureSlashFilters();
  const working = { ...talisman, slashes: (talisman.slashes ?? []).map((s) => ({ ...s })) };
  reconcileSlashes(working);
  const quality = getEffectQuality();

  // Prefer the real artwork aspect from the sibling <img> when it's loaded.
  if (!aspect) {
    const img = layer.parentElement?.querySelector('img');
    if (img?.naturalWidth && img?.naturalHeight) {
      aspect = img.naturalWidth / img.naturalHeight;
    } else {
      aspect = DEFAULT_ASPECT;
      // Redraw once the art arrives so percentage heights are exact.
      if (img && !img.dataset.cainSlashReflow) {
        img.dataset.cainSlashReflow = '1';
        img.addEventListener(
          'load',
          () => renderSlashLayer(layer, talisman, { key }),
          { once: true }
        );
      }
    }
  }

  const prev = key ? lastRendered.get(key) : undefined;
  const seen = new Map();

  layer.textContent = '';
  for (const slash of working.slashes) {
    const svg = buildSlashElement(slash, aspect);
    layer.appendChild(svg);
    seen.set(slash.seed, slash);
    if (prev && !prev.has(slash.seed)) {
      animateSlashIn(svg, quality);
      const strip = layer.closest('.talisman-strip');
      if (strip && quality === 'full') {
        strip.classList.remove('cut');
        void strip.offsetWidth; // restart the animation if one is running
        strip.classList.add('cut');
      }
    }
  }
  if (prev) {
    for (const [seed, slash] of prev) {
      if (!seen.has(seed)) animateSlashOut(layer, slash, aspect, quality);
    }
  }
  if (key) lastRendered.set(key, seen);
}

/**
 * Translate a pointer event on a talisman <img> into artwork-box fractions,
 * accounting for object-fit letterboxing. Returns null when the click landed
 * on padding outside the artwork.
 *
 * @param {MouseEvent} event
 * @param {HTMLImageElement} img
 */
export function slashPointFromEvent(event, img) {
  const rect = img.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  let content = rect;
  if (img.naturalWidth && img.naturalHeight) {
    const fit = getComputedStyle(img).objectFit;
    if (fit === 'contain' || fit === 'scale-down' || fit === 'none') {
      const scale = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      content = {
        left: rect.left + (rect.width - w) / 2,
        top: rect.top + (rect.height - h) / 2,
        width: w,
        height: h,
      };
    }
  }
  return {
    fx: (event.clientX - content.left) / content.width,
    fy: (event.clientY - content.top) / content.height,
  };
}
