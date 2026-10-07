/* ==========================================================
   STEP 2: Night sky + Cinematic opening
   ========================================================== */

document.documentElement.style.setProperty("--bg", CONFIG.colors.background);
document.documentElement.style.setProperty("--accent", CONFIG.colors.accent);


/* ---------- NIGHT SKY (stars + dust + mouse/touch parallax) ---------- */
(function initSky() {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  let stars = [];
  let dust = [];
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function buildParticles() {
    const starCount = Math.min(Math.round((w * h) / 9000), 220);
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: Math.random() * 1.2 + 0.3,
      depth: Math.random() * 0.8 + 0.2,      // jitna bada depth, utna zyada hilega
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2
    }));
    dust = Array.from({ length: 30 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: Math.random() * 2 + 1,
      riseSpeed: 0.05 + Math.random() * 0.15,
      alpha: Math.random() * 0.12 + 0.03
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles();
  }

  function setPointer(x, y) {
    pointer.targetX = x / w - 0.5;
    pointer.targetY = y / h - 0.5;
  }

  window.addEventListener("mousemove", (e) => setPointer(e.clientX, e.clientY));
  window.addEventListener("touchmove", (e) => {
    setPointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener("resize", resize);

  let time = 0;
  function frame() {
    time += 0.016 * (window.moodSpeed || 1);
    pointer.x += (pointer.targetX - pointer.x) * 0.05;
    pointer.y += (pointer.targetY - pointer.y) * 0.05;

    ctx.clearRect(0, 0, w, h);

    // halka atmospheric glow
    const gx = w * 0.5 - pointer.x * 60;
    const gy = h * 0.4 - pointer.y * 40;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.7);
    glow.addColorStop(0, "rgba(90, 70, 160, 0.18)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // stars
    for (const s of stars) {
      const px = (((s.x - pointer.x * 40 * s.depth) % w) + w) % w;
      const py = (((s.y - pointer.y * 40 * s.depth) % h) + h) % h;
      const twinkle = 0.45 + 0.55 * Math.sin(time * s.speed + s.phase);
      ctx.globalAlpha = twinkle * s.depth;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // floating dust
    for (const d of dust) {
      d.y -= d.riseSpeed * (window.moodSpeed || 1);
      if (d.y < -5) { d.y = h + 5; d.x = Math.random() * w; }
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = "#cbbfff";
      ctx.beginPath();
      ctx.arc(d.x - pointer.x * 20, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();


/* ---------- CINEMATIC OPENING ---------- */
(function initOpening() {
  const app = document.getElementById("app");
  const opening = document.getElementById("scene-opening");

  opening.innerHTML =
    '<p class="line line-1">' + CONFIG.opening.line1 + '</p>' +
    '<p class="line line-2">' + CONFIG.opening.line2 + '</p>' +
    '<button class="enter-btn" id="enter-btn">[ ' + CONFIG.opening.button + ' ]</button>';

  let entered = false;

  document.getElementById("enter-btn").addEventListener("click", () => {
    if (entered) return;
    entered = true;

    // 1) opening blur + zoom hokar gayab, aasmaan thoda paas aata hai
    opening.classList.add("leaving");
    document.body.classList.add("entered");

    // 2) thodi der baad agla scene dheere se aata hai
    setTimeout(() => {
      opening.classList.remove("is-active", "leaving");

            showHeavyScene();
    }, 1700);
  });
})();

/* ==========================================================
   STEP 3: "How heavy does today feel?"
   ========================================================== */

/* Ek scene se doosre scene mein cinematic jaana (aage bhi kaam aayega) */
function changeScene(currentEl, nextEl) {
  currentEl.classList.add("leaving");
  setTimeout(() => {
    currentEl.classList.remove("is-active", "leaving");
    document.getElementById("app").appendChild(nextEl);
    requestAnimationFrame(() => nextEl.classList.add("is-active"));
  }, 1400);
}

function showHeavyScene() {
  const app = document.getElementById("app");

  // Mood overlay (background ka rang/andhera yahin badlega)
  let mood = document.getElementById("mood");
  if (!mood) {
    mood = document.createElement("div");
    mood.id = "mood";
    document.body.appendChild(mood);
  }

  const scene = document.createElement("section");
  scene.className = "scene";
  scene.id = "scene-heavy";
  scene.innerHTML =
    '<p class="line reveal heavy-question" style="--d:0.4s">' + CONFIG.slider.question + '</p>' +
    '<div class="slider-wrap reveal" style="--d:1.8s">' +
      '<input type="range" id="heavy-slider" min="0" max="100" value="50" aria-label="' + CONFIG.slider.question + '">' +
      '<div class="slider-labels"><span>lighter</span><span>heavier</span></div>' +
    '</div>' +
    '<p class="heavy-text reveal" id="heavy-text" style="--d:2.6s"></p>' +
    '<button class="enter-btn next-btn" id="heavy-next" style="--d:3.4s">CONTINUE</button>';

  app.appendChild(scene);
  requestAnimationFrame(() => scene.classList.add("is-active"));

  const slider = document.getElementById("heavy-slider");
  const textEl = document.getElementById("heavy-text");
  let currentText = "";

  function pickText(value) {
    const texts = CONFIG.slider.texts;
    const found = texts.find((t) => value <= t.upTo);
    return (found || texts[texts.length - 1]).text;
  }

  function applyMood(value) {
    const heaviness = value / 100;                 // 0 = halka, 1 = bhaari
    const warmth = Math.max(0, 1 - value / 50);    // sirf neeche ki values pe

    mood.style.background =
      "radial-gradient(ellipse at 50% 30%, rgba(255,175,120," + (0.22 * warmth) + "), transparent 70%)," +
      "rgba(0,0,0," + (0.55 * heaviness) + ")";

    window.moodSpeed = 1 - 0.75 * heaviness;       // bhaari = taare slow
  }

  function updateText(value, instant) {
    const next = pickText(value);
    if (next === currentText) return;
    currentText = next;
    if (instant) { textEl.textContent = next; return; }
    textEl.classList.add("swap");
    setTimeout(() => {
      textEl.textContent = next;
      textEl.classList.remove("swap");
    }, 350);
  }

  slider.addEventListener("input", () => {
    const value = Number(slider.value);
    applyMood(value);
    updateText(value, false);
  });

  applyMood(50);
  updateText(50, true);

  // CONTINUE: abhi placeholder, Step 4 mein asli cards aayenge
  document.getElementById("heavy-next").addEventListener("click", () => {
    const next = document.createElement("section");
    next.className = "scene";
    next.id = "scene-cards";
    next.innerHTML = '<p class="line reveal" style="--d:0.8s">(Yahan Step 4 aayega: cards)</p>';
    changeScene(scene, next);
  });
}
