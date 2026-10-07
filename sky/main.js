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
    time += 0.016;
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
      d.y -= d.riseSpeed;
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

      const next = document.createElement("section");
      next.className = "scene";
      next.id = "scene-heavy";
      next.innerHTML = '<p class="line">(Yahan Step 3 aayega: slider)</p>';
      app.appendChild(next);

      requestAnimationFrame(() => next.classList.add("is-active"));
    }, 1700);
  });
})();
