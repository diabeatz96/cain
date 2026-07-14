/**
 * Dramatic talisman deletion: a FILLED talisman (marks at max) burns away
 * bottom-up, an unfilled one is torn into spinning paper ribbons.
 *
 * Both effects animate a CLONE of the talisman's rendered strip inside a
 * fixed-position overlay on document.body, so they survive the re-render
 * that immediately replaces the window's DOM — on the deleting client and
 * on remote clients that receive the update over the socket alike.
 *
 * Effect quality (see getEffectQuality) tones things down per client:
 * 'reduced' plays a simple fade/collapse, 'none' skips animation entirely.
 *
 * Performance note: unlike the effect this is ported from, the burn's
 * turbulence noise is generated ONCE — only the displacement scale, mask
 * position and transform change per frame. Regenerating the noise field
 * every frame (animating feTurbulence's baseFrequency) is what caused
 * frame drops in Chromium.
 */

import { getEffectQuality } from './talisman-slashes.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';

const rnd = (a, b) => a + Math.random() * (b - a);

/** A talisman counts as "filled" once its marks reach a positive maximum. */
export function isTalismanFilled(talisman) {
  const max = parseInt(talisman?.maxMarkAmount, 10);
  const curr = parseInt(talisman?.currMarkAmount, 10) || 0;
  return Number.isFinite(max) && max > 0 && curr >= max;
}

/**
 * Dissolve the talisman rendered in `cardEl` (a `.talisman` grid card or any
 * container holding the talisman art): the strip burns or rips via a clone,
 * the rest of the card just fades. Safe to call right before the data update
 * that removes the talisman — the clone outlives the re-render.
 *
 * @param {HTMLElement} cardEl
 * @param {object} [options]
 * @param {boolean} [options.filled]  Burn (true) or rip (false).
 */
export function dissolveTalismanCard(cardEl, { filled = false } = {}) {
  if (!cardEl || cardEl.dataset.cainDissolving) return;
  cardEl.dataset.cainDissolving = '1';
  const strip =
    cardEl.querySelector('.talisman-strip') ??
    cardEl.querySelector('img.talisman-image') ??
    cardEl.querySelector('img');
  cardEl.classList.add('cain-dissolving');
  if (!strip) return;
  dissolveStrip(strip, filled);
}

function dissolveStrip(strip, filled) {
  const quality = getEffectQuality();
  const rect = strip.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  // Fixed-position stage over the strip's current screen location; the
  // original hides underneath and is discarded by the coming re-render.
  const stage = document.createElement('div');
  stage.className = 'cain-dissolve-stage';
  stage.style.cssText =
    `position:fixed;left:${rect.left}px;top:${rect.top}px;` +
    `width:${rect.width}px;height:${rect.height}px;` +
    'z-index:10000;pointer-events:none;';
  const makeClone = () => {
    const clone = strip.cloneNode(true);
    clone.style.cssText =
      'position:absolute;left:0;top:0;width:100%;height:100%;margin:0;visibility:visible;';
    // The original's size comes from ancestor-scoped CSS (e.g. the
    // #talisman-management rules) that no longer matches under
    // document.body, so pin the artwork to the stage explicitly — the
    // stage already has the strip's exact on-screen geometry.
    const img = clone.matches('img') ? clone : clone.querySelector('img');
    if (img && img !== clone) {
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.margin = '0';
    }
    return clone;
  };
  strip.style.visibility = 'hidden';
  document.body.appendChild(stage);
  const finish = () => stage.remove();

  if (quality === 'none') {
    finish();
    return;
  }
  if (quality === 'reduced') {
    const clone = makeClone();
    stage.appendChild(clone);
    clone.getBoundingClientRect();
    clone.style.transition = 'opacity .3s ease, transform .3s ease';
    clone.style.opacity = '0';
    clone.style.transform = filled ? 'translateY(-14px) scale(.92)' : 'translateY(18px) scale(.94)';
    setTimeout(finish, 340);
    return;
  }
  if (filled) burnAway(stage, makeClone, rect.width, rect.height, finish);
  else ripApart(stage, makeClone, rect.width, rect.height, finish);
}

/* -------------------------------------------- */
/*  Rip: tear into ragged spinning ribbons      */
/* -------------------------------------------- */

function ripApart(stage, makeClone, W, H, done) {
  const N = 6;
  const ROWS = 9;
  // Shared ragged seam x-positions (%), so neighbouring ribbons interlock.
  const seams = [];
  for (let j = 0; j <= N; j++) {
    const base = (j / N) * 100;
    const col = [];
    for (let r = 0; r < ROWS; r++) {
      col.push(j === 0 || j === N ? base : base + rnd(-6, 6));
    }
    seams.push(col);
  }

  // Bright flash at the moment of the tear.
  const flash = document.createElement('div');
  flash.className = 'cain-tearflash';
  stage.appendChild(flash);

  for (let i = 0; i < N; i++) {
    const rib = document.createElement('div');
    rib.className = 'cain-ribbon';
    // Slice layer: jagged clip + long-axis spin. It spins about its OWN
    // centerline, not the strip's middle.
    const slice = document.createElement('div');
    slice.className = 'cain-rslice';
    slice.appendChild(makeClone());
    const pts = [];
    const yAt = (r) => ((r / (ROWS - 1)) * 100).toFixed(2);
    for (let r = 0; r < ROWS; r++) pts.push(`${seams[i][r].toFixed(2)}% ${yAt(r)}%`);
    for (let r = ROWS - 1; r >= 0; r--) pts.push(`${seams[i + 1][r].toFixed(2)}% ${yAt(r)}%`);
    slice.style.clipPath = `polygon(${pts.join(',')})`;
    slice.style.transformOrigin = `${(((i + 0.5) / N) * 100).toFixed(1)}% 50%`;
    slice.style.setProperty('--fsp', `${rnd(0.55, 0.95).toFixed(2)}s`);
    slice.style.setProperty('--fdl', `${rnd(0.08, 0.24).toFixed(2)}s`);
    slice.style.setProperty('--fdir', Math.random() < 0.5 ? '1turn' : '-1turn');
    rib.appendChild(slice);
    const centre = (i + 0.5) / N - 0.5; // -0.5 .. 0.5
    // Fan the strips apart first (so you SEE it tear), then they fall.
    rib.style.setProperty('--spread', `${(centre * rnd(55, 85)).toFixed(0)}px`);
    rib.style.setProperty('--dx', `${(centre * 190 + rnd(-30, 30)).toFixed(0)}px`);
    rib.style.setProperty('--dy', `${rnd(300, 520).toFixed(0)}px`);
    rib.style.setProperty('--rot', `${(centre * 90 + rnd(-30, 30)).toFixed(0)}deg`);
    rib.style.setProperty('--dur', `${rnd(0.88, 1.15).toFixed(2)}s`);
    rib.style.animationDelay = `${(i * 0.015).toFixed(3)}s`;
    stage.appendChild(rib);
  }

  // Exploding paper scraps, light-coloured so the tear reads on dark UIs.
  for (let i = 0; i < 30; i++) {
    const sh = document.createElement('div');
    sh.className = 'cain-shard';
    sh.style.width = `${rnd(6, 20).toFixed(0)}px`;
    sh.style.height = `${rnd(6, 22).toFixed(0)}px`;
    sh.style.left = `${rnd(-6, 94).toFixed(0)}%`;
    sh.style.top = `${rnd(0, 94).toFixed(0)}%`;
    sh.style.clipPath = `polygon(${rnd(0, 30).toFixed(0)}% 0%, 100% ${rnd(0, 40).toFixed(0)}%, ${rnd(55, 100).toFixed(0)}% 100%, 0% ${rnd(50, 100).toFixed(0)}%)`;
    sh.style.setProperty('--sx', `${rnd(-230, 230).toFixed(0)}px`);
    sh.style.setProperty('--sy', `${rnd(-150, 300).toFixed(0)}px`);
    sh.style.setProperty('--sr', `${rnd(-640, 640).toFixed(0)}deg`);
    sh.style.setProperty('--sd', `${rnd(0.62, 1.0).toFixed(2)}s`);
    sh.style.animationDelay = `${rnd(0, 0.077).toFixed(3)}s`;
    stage.appendChild(sh);
  }
  setTimeout(done, 1270);
}

/* -------------------------------------------- */
/*  Burn: bottom-up dissolve with live flame    */
/* -------------------------------------------- */

let burnSeq = 0;

function burnAway(stage, makeClone, W, H, done) {
  const fid = `cain-burn-${++burnSeq}`;
  // A per-burn displacement filter. The turbulence noise is generated once
  // (static baseFrequency); only the displacement SCALE ramps per frame.
  const fsvg = document.createElementNS(SVG_NS, 'svg');
  fsvg.setAttribute('width', '0');
  fsvg.setAttribute('height', '0');
  fsvg.style.cssText = 'position:absolute;width:0;height:0;';
  fsvg.innerHTML = `<defs><filter id="${fid}" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.022 0.06" numOctaves="2" seed="${Math.floor(rnd(1, 9999))}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
    </filter></defs>`;
  document.body.appendChild(fsvg);
  const disp = fsvg.querySelector('feDisplacementMap');

  const paper = makeClone();
  paper.classList.add('cain-burn-paper');
  paper.style.filter = `url(#${fid})`;
  // Scorched edge inside the clone: masked and transformed with it.
  const char = document.createElement('div');
  char.className = 'cain-char';
  paper.appendChild(char);
  stage.appendChild(paper);

  const flame = document.createElement('div');
  flame.className = 'cain-flame';
  stage.appendChild(flame);

  const DUR = 555; // ms — fast and violent
  // Particle factory: each emits from near the rising burn front.
  const spawn = (cls, n, opt) => {
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = cls;
      const delay = rnd(0, opt.maxDelay);
      const sz = rnd(opt.min, opt.max);
      el.style.width = el.style.height = `${sz.toFixed(1)}px`;
      el.style.left = `${rnd(0, 100).toFixed(1)}%`;
      el.style.bottom = `${((delay / (DUR / 1000)) * 100 + rnd(-4, 8)).toFixed(1)}%`;
      el.style.setProperty('--ax', `${rnd(-opt.spread, opt.spread).toFixed(0)}px`);
      el.style.setProperty('--ay', `${rnd(opt.riseMin, opt.riseMax).toFixed(0)}px`);
      el.style.setProperty('--ad', `${rnd(opt.durMin, opt.durMax).toFixed(2)}s`);
      el.style.setProperty('--adl', `${delay.toFixed(2)}s`);
      stage.appendChild(el);
    }
  };
  spawn('cain-spark', 30, { min: 2, max: 4, maxDelay: 0.42, spread: 80, riseMin: -210, riseMax: -110, durMin: 0.35, durMax: 0.62 });
  spawn('cain-ember', 24, { min: 3, max: 7, maxDelay: 0.46, spread: 45, riseMin: -160, riseMax: -80, durMin: 0.54, durMax: 0.92 });
  spawn('cain-smoke', 9, { min: 20, max: 42, maxDelay: 0.46, spread: 34, riseMin: -130, riseMax: -70, durMin: 0.69, durMax: 1.08 });

  let start = null;
  const ph1 = rnd(0, 6.28);
  const ph2 = rnd(0, 6.28);
  function frame(now) {
    if (start == null) start = now;
    const p = Math.min(1, (now - start) / DUR);
    const t = (now - start) / 1000;
    // Bottom-up consumption via the mask (see .cain-burn-paper CSS).
    paper.style.setProperty('--burn', `${(-16 + p * 140).toFixed(1)}%`);
    // Heat-warp that intensifies as it burns — scale only, the noise field
    // itself is static.
    disp.setAttribute('scale', (5 + p * p * 38).toFixed(1));
    // Violent flutter/curl of the shrinking remnant.
    const flx = Math.sin(t * 33 + ph1) * 8 * p + Math.sin(t * 12) * 5;
    const rot = Math.sin(t * 25 + ph2) * 10 * p + p * 9;
    const skew = Math.sin(t * 29 + 1) * 10 * p;
    const lift = -p * 56;
    const sc = 1 - p * 0.16;
    paper.style.transform = `translate(${flx.toFixed(1)}px, ${lift.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) skewX(${skew.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
    paper.style.opacity = p > 0.82 ? (1 - (p - 0.82) / 0.18).toFixed(2) : '1';
    // The dissolving edge in LOCAL paper space: the mask band spans
    // (--burn..+8%) from the bottom, so its centre sits at ~(112 - 140p)%
    // from the top; the char band hugs the edge from above, inside the
    // clone (capped so it never dangles below the paper before ignition).
    const edgeLocal = H * (1.09 - 1.4 * p);
    char.style.top = `${(Math.min(edgeLocal, H) - 22).toFixed(1)}px`;
    // The flame lives OUTSIDE the transformed clone, so project the edge
    // into stage space: scale is centred on the transform origin (50% 12%),
    // then the whole remnant lifts. (Rotation/skew only wobble the edge a
    // few px — the flicker covers that.)
    const originY = H * 0.12;
    const edgeStage = originY + (edgeLocal - originY) * sc + lift;
    flame.style.top = `${edgeStage.toFixed(1)}px`;
    flame.style.opacity = (p < 0.06 ? p / 0.06 : p > 0.92 ? (1 - p) / 0.08 : 1).toFixed(2);
    flame.style.transform = `translateY(-50%) scaleY(${(1 + Math.sin(t * 42) * 0.3).toFixed(2)})`;
    if (p < 1) requestAnimationFrame(frame);
    else fsvg.remove();
  }
  requestAnimationFrame(frame);
  setTimeout(done, 850);
}
