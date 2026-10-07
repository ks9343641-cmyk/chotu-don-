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
  /* ---------- SKY EVENTS: shooting stars / meteors / asteroid ---------- */
  window.skyMood = 50; // slider ki value (0-100). Slider isko badalta hai.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const streaks = [];     // shooting stars + meteors
  const glints = [];      // chhote chamakte sparkles
  const embers = [];      // asteroid ke angaare
  const asteroids = [];   // bada asteroid
  let lastTick = performance.now();
  let streakTimer = 0;
  let glintTimer = 0;
  let asteroidTimer = 1.2;

  function rand(min, max) { return min + Math.random() * (max - min); }

  function spawnStreak(isStar) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const angle = isStar ? rand(0.3, 0.6) : rand(0.9, 1.2);   // meteor zyada seedha girta hai
    const speed = isStar ? rand(650, 1000) : rand(900, 1400); // pixels per second
    streaks.push({
      isStar: isStar,
      x: dir === 1 ? rand(w * 0.35, w * 1.1) : rand(-w * 0.1, w * 0.65),
      y: rand(-30, h * 0.4),
      vx: -Math.cos(angle) * speed * dir,
      vy: Math.sin(angle) * speed,
      length: isStar ? rand(90, 170) : rand(130, 260),
      width: isStar ? rand(1.2, 2) : rand(2, 3.4),
      age: 0,
      maxAge: isStar ? rand(1.0, 1.6) : rand(0.9, 1.5)
    });
  }

  function spawnGlint() {
    glints.push({ x: rand(0, w), y: rand(0, h * 0.8), size: rand(5, 11), age: 0, maxAge: rand(1.2, 2.2) });
  }

  function spawnAsteroid() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const r = rand(22, 36);
    asteroids.push({
      x: dir === 1 ? w + r * 4 : -r * 4,
      y: rand(-r, h * 0.2),
      vx: -dir * w * rand(0.28, 0.38),   // lagbhag 3 second mein screen paar
      vy: h * rand(0.2, 0.3),
      r: r,
      rot: 0,
      rotSpeed: rand(-1.2, 1.2),
      shape: Array.from({ length: 9 }, (_, i) => ({ a: (i / 9) * Math.PI * 2, k: rand(0.75, 1.1) }))
    });
  }

  function drawStreak(s) {
    const speed = Math.hypot(s.vx, s.vy);
    const ux = s.vx / speed, uy = s.vy / speed;
    const tailX = s.x - ux * s.length, tailY = s.y - uy * s.length;
    const fade = Math.max(0, Math.min(1, s.age * 5) * Math.min(1, (s.maxAge - s.age) * 3));

    const g = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
    if (s.isStar) {            // romantic: gulabi se safed-sunehri
      g.addColorStop(0, "rgba(255,170,210,0)");
      g.addColorStop(0.7, "rgba(255,215,235,0.5)");
      g.addColorStop(1, "rgba(255,255,255,1)");
    } else {                   // meteor: aag jaisa
      g.addColorStop(0, "rgba(255,80,20,0)");
      g.addColorStop(0.6, "rgba(255,140,50,0.6)");
      g.addColorStop(1, "rgba(255,240,200,1)");
    }
    ctx.globalAlpha = fade;
    ctx.strokeStyle = g;
    ctx.lineWidth = s.width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    ctx.globalAlpha = fade * 0.35;
    ctx.fillStyle = s.isStar ? "#ffe1f0" : "#ffbe6e";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.width * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGlint(gl) {
    const t = gl.age / gl.maxAge;
    const a = Math.sin(t * Math.PI);                 // dheere aaye, dheere jaaye
    ctx.globalAlpha = a * 0.9;
    ctx.strokeStyle = "#ffe9c9";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gl.x - gl.size, gl.y); ctx.lineTo(gl.x + gl.size, gl.y);
    ctx.moveTo(gl.x, gl.y - gl.size); ctx.lineTo(gl.x, gl.y + gl.size);
    ctx.moveTo(gl.x - gl.size * 0.4, gl.y - gl.size * 0.4); ctx.lineTo(gl.x + gl.size * 0.4, gl.y + gl.size * 0.4);
    ctx.moveTo(gl.x - gl.size * 0.4, gl.y + gl.size * 0.4); ctx.lineTo(gl.x + gl.size * 0.4, gl.y - gl.size * 0.4);
    ctx.stroke();
  }

  function drawAsteroid(a, dt) {
    a.x += a.vx * dt;
    a.y += a.vy * dt;
    a.rot += a.rotSpeed * dt;

    const speed = Math.hypot(a.vx, a.vy);
    const ux = a.vx / speed, uy = a.vy / speed;
    const tailX = a.x - ux * a.r * 11, tailY = a.y - uy * a.r * 11;

    // aag ka trail
    const g = ctx.createLinearGradient(tailX, tailY, a.x, a.y);
    g.addColorStop(0, "rgba(255,70,10,0)");
    g.addColorStop(0.6, "rgba(255,120,30,0.35)");
    g.addColorStop(1, "rgba(255,200,120,0.85)");
    ctx.globalAlpha = 1;
    ctx.strokeStyle = g;
    ctx.lineWidth = a.r * 1.7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(a.x, a.y);
    ctx.stroke();

    // garam glow
    const glow = ctx.createRadialGradient(a.x, a.y, a.r * 0.6, a.x, a.y, a.r * 3.6);
    glow.addColorStop(0, "rgba(255,150,60,0.55)");
    glow.addColorStop(1, "rgba(255,80,20,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.r * 3.6, 0, Math.PI * 2);
    ctx.fill();

    // patthar
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rot);
    ctx.beginPath();
    a.shape.forEach((p, i) => {
      const px = Math.cos(p.a) * a.r * p.k, py = Math.sin(p.a) * a.r * p.k;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();
    const rock = ctx.createRadialGradient(-a.r * 0.35, -a.r * 0.35, a.r * 0.1, 0, 0, a.r * 1.1);
    rock.addColorStop(0, "#6b4a3a");
    rock.addColorStop(1, "#1a0e0a");
    ctx.fillStyle = rock;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,140,50,0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // angaare
    if (embers.length < 80) {
      for (let i = 0; i < 2; i++) {
        embers.push({
          x: a.x + rand(-a.r, a.r) * 0.6,
          y: a.y + rand(-a.r, a.r) * 0.6,
          vx: -ux * rand(40, 140) + rand(-30, 30),
          vy: -uy * rand(40, 140) + rand(-30, 30),
          age: 0,
          maxAge: rand(0.5, 1.0)
        });
      }
    }
  }

  function drawSkyEvents() {
    if (reduceMotion) return;
    const now = performance.now();
    const dt = Math.min((now - lastTick) / 1000, 0.05);
    lastTick = now;
    const mood = window.skyMood;

    // --- spawn karna ---
    if (mood < 50) {                                   // halka din: shooting stars + sparkles
      const intensity = (50 - mood) / 50;              // 0 se 1
      streakTimer -= dt;
      if (streakTimer <= 0 && streaks.length < 10) {
        spawnStreak(true);
        streakTimer = rand(0.3, 0.8) / (0.15 + intensity * 1.35);
      }
      glintTimer -= dt;
      if (glintTimer <= 0 && glints.length < 14) {
        spawnGlint();
        glintTimer = rand(0.15, 0.5) / (0.2 + intensity * 1.2);
      }
    } else if (mood > 55) {                            // bhaari din: meteors
      const intensity = (mood - 55) / 45;
      streakTimer -= dt;
      if (streakTimer <= 0 && streaks.length < 10) {
        spawnStreak(false);
        streakTimer = rand(0.6, 1.4) / (0.2 + intensity * 1.6);
      }
    }

    if (mood >= 90) {                                  // extreme: bada asteroid
      asteroidTimer -= dt;
      if (asteroidTimer <= 0 && asteroids.length === 0) {
        spawnAsteroid();
        asteroidTimer = rand(3, 6);
      }
    } else {
      asteroidTimer = 1.2;                             // 90 cross karte hi jaldi aayega
    }

    // --- draw karna ---
    for (let i = streaks.length - 1; i >= 0; i--) {
      const s = streaks[i];
      s.age += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.age > s.maxAge) { streaks.splice(i, 1); continue; }
      drawStreak(s);
    }

    for (let i = glints.length - 1; i >= 0; i--) {
      const gl = glints[i];
      gl.age += dt;
      if (gl.age > gl.maxAge) { glints.splice(i, 1); continue; }
      drawGlint(gl);
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i];
      drawAsteroid(a, dt);
      const m = a.r * 14;
      if (a.x < -m || a.x > w + m || a.y > h + m) asteroids.splice(i, 1);
    }

    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.age += dt;
      if (e.age > e.maxAge) { embers.splice(i, 1); continue; }
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      ctx.globalAlpha = (1 - e.age / e.maxAge) * 0.9;
      ctx.fillStyle = "#ffa447";
      ctx.beginPath();
      ctx.arc(e.x, e.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
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
     drawSkyEvents();
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
        window.skyMood = value;     
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
         window.skyMood = 50;
    const next = document.createElement("section");
    next.className = "scene";
    next.id = "scene-cards";
    next.innerHTML = '<p class="line reveal" style="--d:0.8s">(Yahan Step 4 aayega: cards)</p>';
    changeScene(scene, next);
  });
}
