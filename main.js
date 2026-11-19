/* Rowan Vale — motion demo. GSAP + ScrollTrigger + SplitText + Lenis (vendored). */
(() => {
const html = document.documentElement;
html.classList.remove("no-js");
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const DESK = innerWidth > 991;
const FINE = matchMedia("(pointer: fine)").matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
if (REDUCED) html.classList.add("reduced");
if (!window.gsap) { html.classList.add("no-js"); return; }
gsap.registerPlugin(ScrollTrigger, SplitText);
history.scrollRestoration = "manual";
if (!location.hash) scrollTo(0, 0);

/* ---------- Lenis (values from the plan) ---------- */
let lenis = null;
if (!REDUCED && window.Lenis) {
  lenis = new Lenis({ infinite: false, lerp: 0.1, smoothWheel: true, touchMultiplier: 2, autoResize: true, syncTouch: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const vel = () => (lenis ? Math.abs(lenis.velocity) : 0);
let wasDesk = DESK, rT;
addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { if ((innerWidth > 991) !== wasDesk) location.reload(); }, 150); });

/* ---------- content builders ---------- */
const HELMETS = [["Lime Spots","2026"],["Pinstripe","2026"],["Contour","2026"],["Cloud Nine","2025"],["Nebula","2025"],["Checker Pop","2025"],["Gold Rush","2025"],["Coral Wave","2025"],["Tide","2024"],["Field","2024"],["Prism","2024"],["Doodle","2024"],["Stripes","2024"],["Night City","2024"],["Marble","2023"],["Halftone","2023"],["Hot Rod","2023"],["Sunset Strip","2023"],["Splash","2023"],["Tartan","2023"],["Bolt","2022"],["Spectrum","2022"],["Glow","2022"],["Wild Lime","2022"],["Copper","2021"],["Pastel","2021"],["Heritage","2021"],["Synth","2021"],["Ukiyo","2020"],["Smoke","2020"],["Dots","2019"],["Hypno","2018"]];
(function buildHelmets(){
  const grid = $("[data-helmet-grid]"), n = DESK ? 4 : 2, cols = [];
  for (let c = 0; c < n; c++) { const d = document.createElement("div"); d.className = "hel-col"; grid.appendChild(d); cols.push(d); }
  HELMETS.forEach(([name, yr], i) => {
    const el = document.createElement("div"); el.className = "hel-card"; el.setAttribute("data-helmet-item", "");
    el.innerHTML = `<svg class="hel-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M1 1H99V87H64L58 99H1Z"/></svg>
      <div class="hel-reveal" aria-hidden="true"></div>
      <div class="hel-img"><div class="hel-spr"><img src="assets/img/ht${String(i+1).padStart(2,"0")}.webp?v=3" width="1024" height="256" loading="lazy" decoding="async" alt="${name} helmet, ${yr}"></div></div>
      <div class="hel-label"><span>${name}</span><b>${yr}</b></div>
      <a href="#helmets" aria-label="${name} helmet ${yr}"></a>`;
    cols[i % n].appendChild(el);
  });
  // touch: spin the card that sits in the middle of the screen
  if (!matchMedia("(hover:hover) and (pointer:fine)").matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("is-spin", e.isIntersecting)), { rootMargin: "-40% 0px -40% 0px" });
    $$(".hel-card", grid).forEach(c => io.observe(c));
  }
})();
const LOGOS = [
  `<span class="logo lg1">NORTHWIND</span>`, `<span class="logo lg2">Kestrel</span>`, `<span class="logo lg3">VOLT<i>A</i></span>`,
  `<span class="logo lg4">halcyon</span>`, `<span class="logo lg5">ARCADIA</span>`, `<span class="logo lg6">orbit<i></i></span>`,
  `<span class="logo lg7">TESSERA</span>`, `<span class="logo lg8">LUMEN</span>`, `<span class="logo lg9">Brava&amp;Co</span>`];
$$("[data-mq] .mq-coll").forEach(c => c.innerHTML = LOGOS.join(""));

/* ---------- split text ---------- */
function splitAll(){
  $$("[data-split]").forEach(el => { el._split = SplitText.create(el, { type: "lines", linesClass: "line", aria: "none" }); });
  // single-line [data-high] elements: wrap content as one line
  $$("[data-high]").forEach(el => { if (!el.querySelector(".line")) { const s = document.createElement("span"); s.className = "line"; while (el.firstChild) s.appendChild(el.firstChild); el.appendChild(s); } });
  // hover texts: chars + duplicate copy
  $$("[data-hover] .t").forEach(t => {
    const txt = t.dataset.text || t.textContent; t.setAttribute("aria-hidden", "true");
    t.parentElement.setAttribute("aria-label", t.parentElement.getAttribute("aria-label") || txt.trim());
    const mk = () => [...txt].map(ch => `<span class="char">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
    t.innerHTML = mk() + `<span class="dup">${mk()}</span>`;
  });
  const mt = $(".msg-t"); mt.innerHTML = [...mt.textContent].map(c => `<span class="char">${c === " " ? "&nbsp;" : c}</span>`).join("");
}

/* ---------- 3.1 high-line reveal ---------- */
const COL = { lime:"#d2ff00", "lime-off":"#b2c73a", "dark-green":"#282c20", "dark-green-tint-1":"#3b3c38", black:"#111112", white:"#f4f4ed" };
function highLines(){
  $$("[data-high]").forEach(el => {
    const [dir = "right", col = "lime", d = "0"] = el.dataset.high.split(",").map(s => s.trim());
    const tl = gsap.timeline({ paused: true, delay: parseFloat(d) / 1000 });
    $$(".line", el).forEach((line, i) => {
      line.style.position = "relative";
      gsap.set(line, { clipPath: dir === "right" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" });
      const b = document.createElement("span"); b.className = "high-line-reveal";
      Object.assign(b.style, { position:"absolute", inset:"0", background: COL[col] || COL.lime, transformOrigin: dir === "right" ? "right center" : "left center", zIndex: 5 });
      line.appendChild(b);
      const t = i * 0.15;
      tl.to(line, { clipPath: "inset(0 0% 0 0%)", duration: .6, ease: "power2.out" }, t).to(b, { scaleX: 0, duration: .6, ease: "power2.inOut" }, t + .3);
    });
    el._hl = tl;
    if (!el.closest(".horiz-track")) ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => tl.play() });
  });
}

/* ---------- 3.3 text hover ---------- */
function textHover(){
  $$("[data-hover]").forEach(btn => {
    const chars = $$(".t > .char, .t .dup .char", btn);
    btn.addEventListener("mouseenter", () => gsap.to(chars, { yPercent: -100, duration: .6, stagger: .02, ease: "power3.out", overwrite: true }));
    btn.addEventListener("mouseleave", () => gsap.to(chars, { yPercent: 0, duration: .6, stagger: .02, ease: "power3.out", overwrite: true }));
  });
}

/* ---------- 3.4 hero helmet reveal ----------
   WebGL liquid reveal + depth parallax (hero-gl.js, loaded lazily after the loader). If WebGL or the script
   is unavailable, the same cursor trail is drawn with a 2D canvas. */
let heroActive = true;
function heroReveal(){
  const media = $(".hero-zoom"), faceImg = $(".hero-img"); let cvs = $(".hero-canvas");
  const load = src => new Promise((res, rej) => { const i = new Image(); i.decoding = "async"; i.onload = () => res(i); i.onerror = rej; i.src = src; });
  let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, DESK ? 1.25 : 1.25), inView = true, gl = null, ctx = null, mask, m, helmet, ready = false;
  const mouse = { x: -9, y: -9 }, eased = { x: -9, y: -9 }, par = { x: 0, y: 0 }, parT = { x: 0, y: 0 };
  let op = [.5, .4];
  let q = 1, slow = 0, last = 0, fade = 48, pres = 0, fr = 0;   // adaptive render scale: drops on slow (software) GPUs, stays 1 on real hardware
  const size = () => { op = getComputedStyle(faceImg).objectPosition.split(" ").map(v => (parseFloat(v) || 50) / 100);
    const r = { width: media.offsetWidth, height: media.offsetHeight }, k = gl ? Math.min(dpr, Math.sqrt(2.1e6 / (r.width * r.height))) * q : dpr; W = Math.round(r.width * k); H = Math.round(r.height * k);
    fade = parseFloat(getComputedStyle(document.documentElement).fontSize) * 3;
    if (gl) gl.resize(W, H); else if (ctx) { cvs.width = W; cvs.height = H; mask.width = Math.ceil(W / 2); mask.height = Math.ceil(H / 2); } };
  // pointer in 0..1 of the hero media box
  if (FINE) media.parentElement.addEventListener("pointermove", e => { if (auto) return; const r = media.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width; mouse.y = (e.clientY - r.top) / r.height;
    parT.x = (mouse.x - .5) * 2; parT.y = (mouse.y - .5) * 2; });
  let auto = true; const sweep = { p: 0 };
  const startSweep = () => {
    gsap.to(sweep, { p: 1, duration: 2.4, ease: "sine.inOut", onUpdate(){ const p = sweep.p;
      mouse.x = .40 + .2 * Math.sin(p * Math.PI * 1.5) * (1 - p * .6) + .1 * p; mouse.y = .22 + .14 * p + .05 * Math.sin(p * 8); parT.x = (mouse.x - .5) * 1.5; parT.y = (mouse.y - .5); },
      onComplete(){ auto = !FINE; if (!FINE) gsap.to(sweep, { p: 0, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.5, onUpdate(){ const p = sweep.p; mouse.x = .42 + .16 * p; mouse.y = .34 + .1 * Math.sin(p * 6); parT.x = (p - .5) * 1.2; } }); } });
  };
  const use2D = async () => {
    ctx = cvs.getContext("2d"); mask = document.createElement("canvas"); m = mask.getContext("2d"); size();
    helmet = await load("assets/img/hero_helmet.webp?v=3"); ready = true; cvs.dataset.mode = "2d";
  };
  const useGL = async (staged) => {
    await new Promise((res, rej) => { const sc = document.createElement("script"); sc.src = "hero-gl.js?v=3"; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); });
    const [helm, depth] = await Promise.all([load("assets/img/hero_helmet.webp?v=3"), load("assets/img/hero_depth.webp?v=3")]);
    await (faceImg.decode ? faceImg.decode().catch(() => {}) : 0);
    const g = window.RVHeroGL(cvs, { face: faceImg, helmet: helm, depth });
    if (staged) { while (!g.uploadNext()) await new Promise(r => staged(r)); await new Promise(r => staged(r)); }
    gl = g; size(); ready = true; cvs.dataset.mode = "webgl";
  };
  addEventListener("resize", () => size());
  const canGL = () => { if (/[?&]gl=0/.test(location.search)) return false; try { return !!document.createElement("canvas").getContext("webgl"); } catch (e) { return false; } };
  heroReveal.start = async () => {
    if (FINE) { try { if (!canGL()) throw 0; await useGL(); } catch (e) { gl = null; await use2D(); } }
    else {
      // touch devices: start with the light 2D trail; upgrade to WebGL on the first touch (keeps the first load cheap)
      await use2D();
      if (canGL()) {
        // the swap (script, textures, shader compile) is heavy on slow phones: never do it while the page is moving.
        // Wait for 0.5 s without scroll, the hero effect zone in view, and an idle slot.
        let lastS = 0, busy = false; addEventListener("scroll", () => { lastS = performance.now(); }, { passive: true });
        const idle = fn => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 200));
        // run fn in an idle slot once the page has been still for 0.5 s
        const calm = fn => { const w = () => (performance.now() - lastS < 500 ? setTimeout(w, 250) : idle(() => (performance.now() - lastS < 500 ? setTimeout(w, 250) : fn()))); w(); };
        const swap = async () => { const fresh = cvs.cloneNode(); fresh.removeAttribute("data-mode"); const oldC = cvs;
          try { cvs = fresh; await useGL(calm); oldC.replaceWith(fresh); ctx = null; } catch (e) { cvs = oldC; gl = null; ready = true; } };
        const tryUp = () => { if (performance.now() - lastS < 500 || !heroActive || !inView) { setTimeout(tryUp, 300); return; }
          idle(() => { if (performance.now() - lastS < 500 || !heroActive) { setTimeout(tryUp, 300); return; } swap(); }); };
        const up = () => { if (busy) return; busy = true; ["touchstart", "pointerdown", "keydown"].forEach(ev => removeEventListener(ev, up)); tryUp(); };
        ["touchstart", "pointerdown", "keydown"].forEach(ev => addEventListener(ev, up, { passive: true })); }
    }
    startSweep();
  };
  ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onToggle: s => inView = s.isActive });
  const cover = () => { const ir = helmet.width / helmet.height, cr = W / H; let w, h; if (cr > ir) { w = W; h = W / ir; } else { h = H; w = H * ir; } return [(W - w) * op[0], (H - h) * op[1], w, h]; };
  let t = 0; const trail = [];
  gsap.ticker.add(() => {
    if (!ready || !inView || !heroActive) return;
    t += .016;
    eased.x += (mouse.x - eased.x) * .18; eased.y += (mouse.y - eased.y) * .18;
    par.x += (parT.x - par.x) * .05; par.y += (parT.y - par.y) * .05;
    const asp = W / H, R = Math.min(asp, 1.6) * .085;   // radius in units of height
    const drops = [];
    for (let k = 0; k < 5; k++) {
      const a = t * (1.3 + k * .4) + k * 1.7, off = R * (.35 + .25 * Math.sin(t * 2 + k));
      drops.push([eased.x + Math.cos(a) * off / asp, eased.y + Math.sin(a * 1.2) * off, R * (.55 + .35 * Math.sin(t * 1.7 + k * 2))]);
    }
    if (gl) {
      if (!FINE && (++fr & 1)) return;   // phones: liquid at 30 fps, leaves the main thread free for scrolling
      const now = performance.now(), dt = now - last; last = now;
      if (dt > 28 && dt < 200) { if (++slow > 20 && q > .5) { q = Math.max(.5, q - .2); slow = 0; size(); } } else slow = Math.max(0, slow - 1);
      const r = media.getBoundingClientRect();
      const inside = eased.x > -.2 && eased.x < 1.2 && eased.y > -.2 && eased.y < 1.2; pres += ((inside ? 1 : 0) - pres) * .06;
      gl.render({ cur: [eased.x, eased.y], pres, drops: drops.map(b => [b[0], b[1], b[2] * .42]), op, par: [par.x, par.y], scale: gsap.getProperty(faceImg, "scale") || 1, cssW: r.width, cssH: r.height, t, fade });
      return;
    }
    // 2D trail: rebuilt every frame from recent points (an alpha-decay buffer leaves 8-bit ghosts that never clear)
    const now2 = performance.now();
    if (!trail.length || Math.hypot(eased.x - trail[trail.length - 1][0], eased.y - trail[trail.length - 1][1]) > .004) trail.push([eased.x, eased.y, now2]);
    while (trail.length && now2 - trail[0][2] > 1100) trail.shift();
    if (trail.length > 48) trail.splice(0, trail.length - 48);
    m.clearRect(0, 0, mask.width, mask.height);
    const MW = mask.width, MH = mask.height, blob = (x, y, rr, a) => { const g = m.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, `rgba(0,0,0,${.9 * a})`); g.addColorStop(.6, `rgba(0,0,0,${.7 * a})`); g.addColorStop(1, "rgba(0,0,0,0)");
      m.fillStyle = g; m.beginPath(); m.arc(x, y, rr, 0, 6.2832); m.fill(); };
    for (let i = 0; i < trail.length - 1; i += 2) { const [x, y, tt] = trail[i], a = Math.pow(1 - (now2 - tt) / 1100, 1.5); blob(x * MW, y * MH, R * MH * .9, a * .8); }
    drops.forEach(([bx, by, br]) => blob(bx * MW, by * MH, br * MH, 1));
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = "source-over"; ctx.drawImage(mask, 0, 0, W, H);
    ctx.globalCompositeOperation = "source-in"; const c = cover(); ctx.drawImage(helmet, c[0], c[1], c[2], c[3]);
  });
  // like the original: cursor effect switches off after ~44% of a screen
  ScrollTrigger.create({ trigger: ".hero", start: () => `top+=${innerHeight / 2.25} top`,
    onEnter: () => { heroActive = false; gsap.to(cvs, { autoAlpha: 0, duration: .25, ease: "power1.inOut" }); },
    onLeaveBack: () => { heroActive = true; gsap.to(cvs, { autoAlpha: 1, duration: .25, ease: "power1.inOut" }); } });
  heroReveal.canvas = () => cvs;
}

/* ---------- 3.5 hero → message card ---------- */
function heroToCard(){
  // transform/opacity only: the media box scales to the card (FLIP), the inner wrapper counter-scales so the
  // picture stays undistorted, and the dark background is an overlay that fades in (no layout, no full repaints)
  const media = $(".hero-media"), cs = $(".hero-cs"), target = $(".hero-target"), face = $(".hero-img:not(.hero-tint)"), tint = $(".hero-tint");
  const st = { a: 0, z: 0 }; let W0 = 1, H0 = 1, SX = 1, SY = 1, KE = 1, TW = 1, TH = 1, ZT = 0;
  const measure = () => { W0 = media.offsetWidth; H0 = media.offsetHeight; SX = target.offsetWidth / W0; SY = target.offsetHeight / H0; KE = Math.max(SX, SY);
    TW = target.offsetWidth / KE; TH = target.offsetHeight / KE; ZT = (parseFloat(getComputedStyle($(".hero")).getPropertyValue("--zt")) || 0) * parseFloat(getComputedStyle(document.documentElement).fontSize);
    gsap.set(tint, { width: TW, height: TH, left: (W0 - TW) / 2, top: (H0 - TH) / 2, right: "auto", bottom: "auto" }); apply(); };
  const apply = () => { const p = st.a, sx = 1 + (SX - 1) * p, sy = 1 + (SY - 1) * p, k = Math.max(sx, sy);
    gsap.set(media, { scaleX: sx, scaleY: sy }); gsap.set(cs, { y: ZT * (1 - st.z), scaleX: k / sx, scaleY: k / sy });
    const f = Math.max(W0 * sx / k / TW, H0 * sy / k / TH), zs = 1 + .15 * p; gsap.set(face, { scale: zs }); gsap.set(tint, { scale: f * zs }); };
  gsap.set(media, { xPercent: -50, yPercent: -50 });
  ScrollTrigger.addEventListener("refreshInit", () => gsap.set(media, { scaleX: 1, scaleY: 1 }));
  ScrollTrigger.addEventListener("refresh", measure); measure();
  const tl = gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: () => `+=${innerHeight}`, scrub: true, invalidateOnRefresh: true } });
  tl.fromTo(st, { a: 0 }, { a: 1, ease: "power1.inOut", onUpdate: apply }, 0)
    .fromTo(st, { z: 0 }, { z: 1, ease: "power1.inOut", duration: .5, onUpdate: apply, immediateRender: false }, 0)
    .fromTo(".hero-tint", { opacity: 0 }, { opacity: 1, ease: "power1.inOut", duration: .2, immediateRender: true }, .3)
    .fromTo(".hero-dark", { opacity: 0 }, { opacity: 1, ease: "power1.inOut" }, 0)
    .to(".topo-hero", { opacity: 0, ease: "none", duration: .5 }, 0)
    .to(".next-race", { autoAlpha: 0, ease: "none", duration: .3 }, 0)
    .fromTo(".hero-msg", { autoAlpha: 0, y: "1rem" }, { autoAlpha: 1, y: 0, duration: .3 }, .7)
    .fromTo(".msg-t .char", { yPercent: 100 }, { yPercent: 0, ease: "power3.out", stagger: .01, duration: .2 }, .75);
  // exit: card + everything slides up at the end of the hero track
  gsap.to(".hero-stick > *", { y: () => -innerHeight * .1, ease: "none", scrollTrigger: { trigger: ".hero", start: "bottom bottom", end: "bottom top", scrub: true } });
}
function velocityMarquee(row, dir, base){
  const inner = $(".row-inner", row); inner.innerHTML += inner.innerHTML;
  let x = dir > 0 ? -inner.scrollWidth / 2 : 0, on = true;
  ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onToggle: s => on = s.isActive });
  gsap.ticker.add((tt, dt) => { if (!on) return; const w = inner.scrollWidth / 2;
    x += dir * (base * dt / 1000 + vel() * .6); if (x <= -w) x += w; if (x >= 0) x -= w; gsap.set(inner, { x }); });
}
/* handwriting: every stroke of the word draws itself in writing order (stroke-dashoffset) */
function drawPaths(svg, opts, speed = 1){
  const ps = $$("path", svg), L = ps.map(p => p.getTotalLength()), tot = L.reduce((a, b) => a + b, 0);
  ps.forEach((p, i) => gsap.set(p, { strokeDasharray: L[i] + 1, strokeDashoffset: L[i] + 1 }));
  const tl = gsap.timeline(opts);
  ps.forEach((p, i) => tl.to(p, { strokeDashoffset: 0, duration: L[i] / tot * speed, ease: "none" }));
  return tl;
}

/* ---------- 3.7 horizontal gallery ---------- */
function horizontal(){
  const sec = $("[data-horizontal]"), track = $(".horiz-track", sec);
  const setH = () => { sec.style.height = `${track.offsetWidth - innerWidth + innerHeight}px`; };
  setH();
  const tween = gsap.to(track, { x: () => -(track.offsetWidth - innerWidth), ease: "none",
    scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true, onRefreshInit: setH } });
  $$(".h-img img", sec).forEach(img => {
    const t = gsap.fromTo(img, { x: 0 }, { x: "4rem", ease: "none", scrollTrigger: { trigger: img.closest(".h-item"), containerAnimation: tween, start: "left right", end: "right left", scrub: .6 } });
    // parallax waits for the clip reveal to finish (moving an image under an animated clip-path repaints it every frame), then eases in
    const w = img.closest("[data-img-hl]"); if (w) { w._st = t.scrollTrigger; t.scrollTrigger.disable(false); }
  });
  $$("[data-high]", sec).forEach((el, i) => {
    ScrollTrigger.create(i < 1 ? { trigger: sec, start: "top 60%", once: true, onEnter: () => el._hl && el._hl.play() }
      : { trigger: el, containerAnimation: tween, start: "left 95%", once: true, onEnter: () => el._hl && el._hl.play() });
  });
  $$("[data-img-hl]", sec).forEach(w => imgHL(w, { trigger: w, containerAnimation: tween, start: "left 90%" }));
  // dark → light: an opacity overlay instead of tweening the section background/text colour (no full-section repaints)
  const light = document.createElement("div"); light.className = "horiz-light"; light.setAttribute("aria-hidden", "true"); $(".horiz-stick", sec).prepend(light);
  gsap.fromTo(light, { opacity: 0 }, { opacity: 1, ease: "none",
    scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true, onUpdate: s => sec.classList.toggle("is-light", s.progress > .5) } });
  gsap.to(".topo-horiz", { opacity: .25, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true } });
  return tween;
}

/* ---------- 3.12 image highlight ---------- */
function imgHL(w, st){
  const cover = document.createElement("span");
  Object.assign(cover.style, { position: "absolute", inset: 0, background: w.closest(".horiz") ? "#3b3c38" : "#c8cbbd", zIndex: 2, pointerEvents: "none" });
  w.appendChild(cover);
  gsap.set(w, { clipPath: "ellipse(120% 0% at 50% 0%)" });
  gsap.set(cover, { clipPath: "ellipse(120% 120% at 50% 100%)" });
  // once revealed, drop the clip-path: a clipped parent forces its (parallax-moving) image to repaint every frame
  gsap.timeline({ scrollTrigger: { ...st, once: true }, onComplete(){ gsap.set(w, { clearProps: "clipPath" }); cover.remove(); if (w._st) w._st.enable(); } })
    .to(w, { clipPath: "ellipse(120% 120% at 50% 0%)", duration: .8, ease: "power2.out" })
    .to(cover, { clipPath: "ellipse(120% 0% at 50% 100%)", duration: .6, ease: "power2.out" }, "-=0.4");
}

/* ---------- 3.8 on/off track ---------- */
function otot(){
  const st = { trigger: ".otot", start: "top bottom", end: "bottom bottom", scrub: true };
  if (DESK) {
    gsap.fromTo(".otot-l", { x: "-20rem" }, { x: 0, ease: "power2.out", scrollTrigger: { trigger: ".otot-top", start: "top bottom", end: "bottom bottom", scrub: true } });
    gsap.fromTo(".otot-r", { x: "20rem" }, { x: 0, ease: "power2.out", scrollTrigger: { trigger: ".otot-top", start: "top bottom", end: "bottom bottom", scrub: true } });
    gsap.fromTo(".otot-c1", { x: "-5rem" }, { x: 0, ease: "none", scrollTrigger: { trigger: ".otot-top", start: "top bottom", end: "60% bottom", scrub: true } });
    gsap.fromTo(".otot-c2", { x: "5rem" }, { x: 0, ease: "none", scrollTrigger: { trigger: ".otot-top", start: "top bottom", end: "60% bottom", scrub: true } });
  }
  gsap.fromTo("[data-otot-bottom] img", { y: 0, scale: 1 }, { y: () => -innerHeight * .2, scale: 1.1, ease: "none", scrollTrigger: { trigger: "[data-otot-bottom]", start: "top bottom", end: "bottom top", scrub: true } });
  void st;
}
function scripts(){
  $$(".s-on,.s-off,.s-collab").forEach(w => drawPaths(w, { scrollTrigger: { trigger: w.parentElement, start: "top 70%", once: true } }, w.matches(".s-collab") ? 1.6 : 1.1));
}

/* ---------- 3.9 helmet grid ---------- */
function helmetGrid(){
  $$(".hel-col").forEach((c, n) => { if (!n) return;
    gsap.fromTo(c, { y: `${n * 5}rem` }, { y: 0, ease: "none", scrollTrigger: { trigger: "[data-helmet-grid]", start: "top bottom", end: "bottom top", scrub: true } }); });
}

/* ---------- 3.10 visor ---------- */
function visor(){
  gsap.fromTo("[data-visor]", { clipPath: "ellipse(70% 0% at 50% 0%)" }, { clipPath: "ellipse(70% 100% at 50% 0%)", ease: "none", scrollTrigger: { trigger: ".store", start: "top bottom", end: "top 15%", scrub: true } });
  $$(".store-img img").forEach((im, i) => gsap.fromTo(im, { y: 0 }, { y: `-${2 + i * 2}rem`, ease: "none", scrollTrigger: { trigger: ".store", start: "top bottom", end: "bottom top", scrub: true } }));
}

/* ---------- 3.11 marquee (direction flips with scroll) ---------- */
function marquee(root){
  const lane = $(".mq-lane", root), coll = $(".mq-coll", root);
  const s = +root.dataset.speed, dir = root.dataset.dir === "right" ? 1 : -1, n = +root.dataset.dup, ss = +root.dataset.ss;
  const f = innerWidth < 479 ? .25 : innerWidth < 991 ? .5 : 1;
  for (let i = 0; i < n; i++) lane.appendChild(coll.cloneNode(true));
  $$(".mq-coll", root).forEach((c, i) => { if (i) c.setAttribute("aria-hidden", "true"); });
  const all = $$(".mq-coll", root);
  const tw = gsap.to(all, { xPercent: -100, repeat: -1, duration: s * (coll.offsetWidth / innerWidth) * f, ease: "none" }).totalProgress(.5);
  tw.timeScale(dir);
  ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onUpdate: st => tw.timeScale(st.direction === 1 ? -dir : dir), onToggle: st => st.isActive ? tw.resume() : tw.pause() });
  gsap.fromTo(lane, { x: `${dir === -1 ? ss : -ss}vw` }, { x: `${dir === -1 ? -ss : ss}vw`, ease: "none", scrollTrigger: { trigger: root, start: "0% 100%", end: "100% 0%", scrub: 0 } });
}

/* ---------- 3.2 oval reveal ---------- */
function ovalScroll(el){
  const parts = $$(":scope > span", el); el.querySelectorAll("br").forEach(b => b.remove());
  const outer = document.createElement("div"); outer.style.overflow = "clip"; el.appendChild(outer);
  const wraps = parts.map(p => { const w = document.createElement("div"); w.className = "oval-line-clip-wrap"; w.appendChild(p); p.style.display = "block"; outer.appendChild(w);
    gsap.set(w, { clipPath: "ellipse(20% 0% at 50% 0%)" }); gsap.set(p, { yPercent: -40 }); return w; });
  ScrollTrigger.create({ trigger: el, start: "top 95%", once: true, onEnter: () => {
    gsap.to(wraps, { clipPath: "ellipse(100% 120% at 50% 0%)", duration: 1.5, ease: "power2.inOut", stagger: .15 });
    parts.forEach((p, i) => gsap.to(p, { yPercent: 0, duration: 1.5, ease: "power2.inOut", delay: .15 + .1 * i })); } });
}

/* ---------- 3.13 socials fan (exact values from plan) ---------- */
const FAN = [{s:.7756,r:-21,x:-30,y:7.3,z:1},{s:.8498,r:-14,x:-22,y:4,z:2},{s:.9346,r:-7,x:-11,y:1.3,z:3},{s:1,r:0,x:0,y:0,z:10},{s:.9346,r:7,x:11,y:1.3,z:3},{s:.8498,r:14,x:22,y:4,z:2},{s:.7756,r:21,x:30,y:7.3,z:1}];
function socialsFan(){
  const wrap = $("[data-fan]"), cards = $$(".fan-c", wrap), mid = 3;
  const k = innerWidth <= 479 ? .3 : innerWidth <= 991 ? .5 : 1;
  const P = () => FAN.map(p => ({ ...p, x: p.x * k, y: p.y * (k < 1 ? .6 : 1) }));
  cards.forEach((c, i) => c.style.zIndex = FAN[i].z);
  const toFan = () => cards.forEach((c, i) => { const p = P()[i];
    gsap.to(c, { x: p.x + "rem", y: p.y + "rem", scale: p.s, rotation: p.r, duration: .5, ease: "elastic.out(1,0.75)", overwrite: "auto", delay: Math.abs(i - mid) * .02 }); });
  const focus = a => cards.forEach((c, i) => { const p = P()[i], d = Math.abs(i - a), u = 1 - Math.abs((i - mid) / mid), l = 1 + .2 * Math.max(0, 3 - d);
    const v = i === a ? { y: p.y - 2.5 + "rem", x: p.x + "rem", scale: p.s * 1.08, rotation: p.r }
      : i < a ? { x: p.x - 8 * u * l * k + "rem", y: p.y + "rem", scale: p.s, rotation: p.r - 3 / (d + 1) }
      : { x: p.x + (i === cards.length - 1 ? 0 : 8 * u * l * k) + "rem", y: p.y + (i === cards.length - 1 ? -1 : 0) + "rem", scale: p.s, rotation: p.r + 3 / (d + 1) };
    gsap.to(c, { ...v, duration: .5, ease: "elastic.out(1,0.75)", overwrite: "auto", delay: d * .02 }); });
  let t; gsap.set(cards, { x: 0, y: "10rem", scale: 1, rotation: 0, transformOrigin: "center center" });
  gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top 90%", once: true }, onComplete(){
      if (!FINE) return;
      cards.forEach((c, i) => { c.addEventListener("mouseenter", () => { clearTimeout(t); focus(i); }); c.addEventListener("mouseleave", () => { t = setTimeout(toFan, 50); }); });
      wrap.addEventListener("mouseleave", () => { clearTimeout(t); toFan(); }); } })
    .to(cards, { y: 0, duration: .8, ease: "power2.out", stagger: { amount: .5, from: "end" } })
    .to(cards, { x: i => P()[i].x + "rem", y: i => P()[i].y + "rem", scale: i => P()[i].s, rotation: i => P()[i].r, duration: 1.2, ease: "elastic.out(1,0.75)", stagger: { amount: .2, from: "center" } }, "-=0.4");
}

/* ---------- 3.15 globals ---------- */
const nav = $(".nav");
function setNav(theme){ nav.classList.toggle("is-dark", theme === "dark"); }
function navTheme(){
  const secs = $$("[data-nav]"), hero = $(".hero"); let raf = 0;
  const upd = () => { raf = 0; const y = 40; let theme = "light";
    for (const sec of secs) { const r = sec.getBoundingClientRect(); if (r.top <= y && r.bottom > y) {
      theme = sec === hero ? (scrollY > innerHeight * .5 ? "dark" : "light")
        : sec.matches(".footer") ? ($(".foot-card").getBoundingClientRect().top <= y ? "dark" : "light")
        : (sec.matches("[data-horizontal]") && DESK) ? (sec.classList.contains("is-light") ? "light" : "dark") : sec.dataset.nav; break; } }
    setNav(theme); };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true }); upd();
}
function scrollIndicator(){
  const bar = $(".scroll-ind"), th = $("i", bar); let hide;
  let dh = 0, raf = 0; const measure = () => { dh = document.documentElement.scrollHeight; }; measure();
  addEventListener("resize", measure); ScrollTrigger.addEventListener("refresh", measure);
  const upd = () => { raf = 0; const vh = innerHeight, h = Math.max(.1, Math.min(.25, vh / dh));
    if (h !== th._h) { th._h = h; th.style.height = h * 100 + "%"; } const p = scrollY / Math.max(1, dh - vh);
    gsap.to(th, { y: p * (bar.offsetHeight * (1 - h)), duration: .3, ease: "power2.out", overwrite: true });
    gsap.to(bar, { autoAlpha: 1, duration: .5, overwrite: "auto" }); clearTimeout(hide);
    hide = setTimeout(() => gsap.to(bar, { autoAlpha: 0, duration: .5 }), 500);
    html.classList.toggle("at-top", scrollY < 4); };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true }); html.classList.toggle("at-top", scrollY < 4);
}
function menu(){
  const btn = $(".btn-menu"), m = $("#menu"); let open = false;
  const set = o => { open = o; btn.setAttribute("aria-expanded", o); btn.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    if (o) { m.hidden = false; html.classList.add("menu-open"); lenis && lenis.stop();
      gsap.fromTo(m, { clipPath: "ellipse(0% 0% at 100% 0%)" }, { clipPath: "ellipse(150% 150% at 100% 0%)", duration: REDUCED ? 0 : .8, ease: "expo.inOut" });
      gsap.fromTo($$("nav a", m), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: .05, duration: REDUCED ? 0 : .6, ease: "power3.out", delay: REDUCED ? 0 : .3 });
      gsap.fromTo(".menu-pics", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: REDUCED ? 0 : .7, ease: "power3.out", delay: REDUCED ? 0 : .45 }); }
    else { html.classList.remove("menu-open"); lenis && lenis.start();
      gsap.to(m, { clipPath: "ellipse(0% 0% at 100% 0%)", duration: REDUCED ? 0 : .6, ease: "expo.inOut", onComplete: () => { if (!open) m.hidden = true; } }); } };
  // thumbnails: the hovered / focused link brings its picture to the front (desktop)
  const pics = $$(".menu-pics img", m), pick = i => pics.forEach((p, k) => p.classList.toggle("on", k === i));
  $$("nav a", m).forEach(a => { const i = +a.dataset.pic; a.addEventListener("pointerenter", () => pick(i)); a.addEventListener("focus", () => pick(i)); });
  btn.addEventListener("click", () => set(!open));
  $$("a", m).forEach(a => a.addEventListener("click", () => set(false)));
  addEventListener("keydown", e => { if (e.key === "Escape" && open) { set(false); btn.focus(); } });
}
function anchors(){
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const id = a.getAttribute("href"); const t = id.length > 1 && $(id);
    if (!t && id !== "#top") return; e.preventDefault(); const el = id === "#top" ? 0 : t;
    if (lenis) lenis.scrollTo(el, { duration: 1.4 }); else (el === 0 ? scrollTo({ top: 0 }) : t.scrollIntoView()); }));
}

/* ---------- reduced motion: final states ---------- */
function reducedSetup(){
  $(".hero-canvas").style.display = "none";
  
  $(".hero .signature").style.display = "none";
  const k = innerWidth <= 479 ? .3 : innerWidth <= 991 ? .5 : 1;
  $$(".fan-c").forEach((c, i) => { const p = FAN[i]; c.style.zIndex = p.z; gsap.set(c, { x: p.x * k + "rem", y: p.y * (k < 1 ? .6 : 1) + "rem", scale: p.s, rotation: p.r }); });
}

/* ---------- init (order like the original) ---------- */
async function init(){
  await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
  splitAll(); menu(); anchors(); scrollIndicator();
  if (REDUCED) { reducedSetup(); $(".loader").remove(); document.body.classList.remove("is-loading"); navTheme(); return; }
  socialsFan(); heroToCard();
  velocityMarquee($(".mq-a"), -1, 40); velocityMarquee($(".mq-b"), 1, 40);
  drawPaths($(".hero .signature"), { scrollTrigger: { trigger: ".hero-sig-track", start: "top center", end: "bottom 80%", scrub: true } });
  drawPaths($(".sig-foot"), { scrollTrigger: { trigger: ".foot-card", start: "top 80%", once: true } }, 1.8);
  if (DESK) horizontal(); else $$("[data-img-hl]", $(".horiz")).forEach(w => imgHL(w, { trigger: w, start: "top 85%" }));
  otot(); scripts();
  if (DESK) helmetGrid();
  visor();
  $$("[data-mq]").forEach(marquee);
  $$("[data-img-hl]").forEach(w => { if (!w.closest(".horiz")) imgHL(w, { trigger: w, start: "top 80%" }); });
  if (DESK) { highLines(); textHover(); }
  ovalScroll($("[data-oval]"));
  heroReveal(); navTheme();
  ScrollTrigger.refresh();
  // loader out: ellipse clip, 0.8s expo.inOut
  const heroImg = $(".hero-img");
  await Promise.race([heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve(), new Promise(r => setTimeout(r, 1200))]);
  gsap.timeline({ delay: .35 })
    .to(".loader", { clipPath: "ellipse(0% 0% at 50% 50%)", duration: .8, ease: "expo.inOut", onComplete(){ $(".loader").remove(); document.body.classList.remove("is-loading"); } })
    .fromTo(".hero-zoom", { scale: 1.08 }, { scale: 1, duration: 1.1, ease: "expo.out", clearProps: "scale" }, .35)
    .add(() => heroReveal.start && heroReveal.start(), .6);
}
init();
})();
