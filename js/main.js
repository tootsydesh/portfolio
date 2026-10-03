/* Behaviour for tootsydeshmukh.com: navigation, reveals, project cards, contact form, hero chart. */

(function () {
  "use strict";

  /* Settings live in js/config.js */
  var CONFIG = window.SITE_CONFIG || {};
  var CONTACT_EMAIL = CONFIG.contactEmail || "tootsydeshmukh@gmail.com";
  var FORM_KEY = (CONFIG.web3formsKey || "").trim();

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---- Nav, scroll progress, timeline progress ---- */
  var nav = document.getElementById("nav");
  var progressBar = document.getElementById("progress");
  var timeline = document.getElementById("timeline");
  var timelineItems = Array.prototype.slice.call(timeline.children);
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("is-scrolled", y > 24);
    progressBar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    var r = timeline.getBoundingClientRect(), mark = window.innerHeight * 0.62;
    var p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
    timeline.style.setProperty("--prog", p.toFixed(3));
    timelineItems.forEach(function (li) {
      li.classList.toggle("passed", li.getBoundingClientRect().top + 28 < mark);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---- Current section in the nav ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var hasIO = "IntersectionObserver" in window;
  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute("href") === "#" + en.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  /* ---- Reveal on scroll, and count the numbers up ---- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    if (reduceMotion) { el.textContent = end.toFixed(dec); return; }
    var t0 = null;
    function tick(now) {
      if (!t0) t0 = now;
      var t = Math.min(1, (now - t0) / 1500), e = 1 - Math.pow(1 - t, 3);
      el.textContent = (end * e).toFixed(dec);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (hasIO) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        revealer.unobserve(en.target);
      });
    }, { threshold: 0.18 });
    revealEls.forEach(function (el) { revealer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Dot matrix: one lit dot in about 300 ---- */
  (function () {
    var svg = document.getElementById("matrix"), ns = "http://www.w3.org/2000/svg", cols = 18, rows = 17;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var dot = document.createElementNS(ns, "circle");
      dot.setAttribute("cx", (5 + c * (90 / (cols - 1))).toFixed(2));
      dot.setAttribute("cy", (5 + r * (90 / (rows - 1))).toFixed(2));
      dot.setAttribute("r", "1.5");
      if (r === 6 && c === 11) dot.setAttribute("class", "hit");
      svg.appendChild(dot);
    }
  })();

  /* ---- Cursor glow and card tilt (mouse only) ---- */
  if (finePointer && !reduceMotion) {
    var glow = document.getElementById("glow"), gx = 0, gy = 0, tx = 0, ty = 0, glowing = false;
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!glowing) { glowing = true; gx = tx; gy = ty; glow.classList.add("on"); requestAnimationFrame(follow); }
    });
    function follow() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = "translate3d(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px,0)";
      requestAnimationFrame(follow);
    }
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--ry", ((x - 0.5) * 7).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y) * 7).toFixed(2) + "deg");
        card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--ry", "0deg"); card.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ---- Projects: show and hide details ---- */
  document.querySelectorAll(".card-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      btn.querySelector("span").textContent = open ? "Show details" : "Hide details";
      document.getElementById(btn.getAttribute("aria-controls")).classList.toggle("is-open", !open);
    });
  });

  /* ---- Copy email ---- */
  var copyBtn = document.getElementById("copy-email");
  copyBtn.addEventListener("click", function () {
    function done(ok) {
      copyBtn.textContent = ok ? "Address copied" : "Copy failed, select it instead";
      setTimeout(function () { copyBtn.textContent = "Copy address"; }, 2200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(function () { done(true); }, function () { done(false); });
    } else { done(false); }
  });

  /* ---- Contact form ----
     Sends the message through Web3Forms (https://web3forms.com), which emails it
     to the inbox your access key belongs to. The key lives in js/config.js.
     Until a key is added, the form falls back to opening the visitor's email app. */
  var form = document.getElementById("contact-form");
  var statusEl = document.getElementById("form-status");
  var sendBtn = form.querySelector('button[type="submit"]');
  var hasKey = /^[0-9a-f-]{20,}$/i.test(FORM_KEY);
  var messages = {
    name: "Add your name so I know who is writing.",
    email: "Add an email address I can reply to, like name@example.com.",
    message: "Write a short message before sending."
  };
  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = "form-status" + (kind ? " is-" + kind : "");
  }
  function setBusy(busy) {
    sendBtn.disabled = busy;
    sendBtn.textContent = busy ? "Sending message" : "Send message";
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstBad = null;
    ["name", "email", "message"].forEach(function (key) {
      var input = form.elements[key];
      var ok = input.value.trim() !== "" && input.checkValidity();
      input.setAttribute("aria-invalid", String(!ok));
      document.getElementById("e-" + key).textContent = ok ? "" : messages[key];
      if (!ok && !firstBad) firstBad = input;
    });
    if (firstBad) { setStatus("", ""); firstBad.focus(); return; }

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    var subject = "Portfolio message from " + name;

    // No key yet: draft the email in the visitor's own email app instead.
    if (!hasKey) {
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(message + "\n\n" + name + "\n" + email);
      setStatus("Message drafted in your email app. Press send there to finish.", "ok");
      return;
    }

    // Spam trap: real visitors never see or tick this box.
    if (form.elements.botcheck.checked) { form.reset(); setStatus("Message sent. I'll reply to " + email + ".", "ok"); return; }

    setBusy(true);
    setStatus("", "");
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: FORM_KEY,
        subject: subject,
        from_name: name + " via tootsydeshmukh.com",
        name: name,
        email: email,          // Web3Forms uses this as the reply-to address
        message: message
      })
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        if (!r.ok || !r.data.success) throw new Error((r.data && r.data.message) || "Request failed");
        form.reset();
        setStatus("Message sent. I'll reply to " + email + ".", "ok");
      })
      .catch(function () {
        setStatus("The message didn't send. Check your connection and try again, or email " + CONTACT_EMAIL + " directly.", "error");
      })
      .then(function () { setBusy(false); });
  });

  /* ================= Hero: 240 points that reshape into charts ================= */
  var hero = document.getElementById("top");
  var canvas = document.getElementById("field");
  var ctx = canvas.getContext("2d");
  var stat = document.getElementById("stat");
  var copy = document.querySelector(".hero-copy");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var COLORS = ["#10BFB4", "#FF4D9D", "#FFB000"];
  var LABELS = ["#007F78", "#CF1B73", "#8F5E00"];
  var GROUPS = [110, 80, 50], N = 240;
  var BARS = [12, 18, 16, 26, 24, 34, 48, 62], BAR_COLS = 3;
  var CENTERS = [[0.24, 0.3], [0.52, 0.74], [0.8, 0.36]];
  var W = 0, H = 0, dpr = 1, plot = { x0: 0, y0: 0, x1: 0, y1: 0 };
  var points = [], mode = "scatter", overlay = 0, overlayWait = 0, gridA = 1;
  var running = false, frame = 0, visible = true;
  var pointer = { x: -9999, y: -9999, active: false };

  function gauss() { return (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 1.73; }
  function trend(u) { return 0.1 + 0.8 * Math.pow(u, 1.55); }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function px(u) { return plot.x0 + u * (plot.x1 - plot.x0); }
  function py(v) { return plot.y1 - v * (plot.y1 - plot.y0); }

  function seed() {
    points = [];
    var i = 0, g, k;
    for (g = 0; g < 3; g++) for (k = 0; k < GROUPS[g]; k++, i++) {
      var tu = Math.random();
      points.push({
        g: g, i: i, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, wait: 0,
        n1: Math.random(), n2: Math.random(),
        tu: tu, tv: clamp01(trend(tu) + gauss() * 0.055),
        cu: gauss() * 0.9, cv: gauss() * 0.9,
        bar: 0, slot: 0,
        r: 1.9 + Math.random() * 1.9, k: 0.035 + Math.random() * 0.04
      });
    }
    // stacked bars: fill each bar bottom-up with cyan, then pink, then yellow
    var queues = [[], [], []];
    points.forEach(function (p) { queues[p.g].push(p); });
    BARS.forEach(function (count, b) {
      var want = [Math.round(count * GROUPS[0] / N), Math.round(count * GROUPS[1] / N), 0], slot = 0, taken = 0;
      want[2] = count - want[0] - want[1];
      for (g = 0; g < 3; g++) for (k = 0; k < want[g] && queues[g].length; k++) {
        var p = queues[g].shift(); p.bar = b; p.slot = slot++; taken++;
      }
      for (g = 0; taken < count && g < 3; g++) while (taken < count && queues[g].length) {
        var q = queues[g].shift(); q.bar = b; q.slot = slot++; taken++;
      }
    });
  }

  function target(p, m) {
    var pw = plot.x1 - plot.x0, ph = plot.y1 - plot.y0, s;
    if (m === "trend") return [px(p.tu), py(p.tv)];
    if (m === "bars") {
      s = Math.min(pw / (BARS.length * 4.4), ph / 22);
      return [px((p.bar + 0.5) / BARS.length) + ((p.slot % BAR_COLS) - 1) * s, plot.y1 - s * 0.9 - Math.floor(p.slot / BAR_COLS) * s];
    }
    if (m === "clusters") {
      var rad = Math.min(pw, ph) * 0.105, c = CENTERS[p.g];
      return [px(c[0]) + p.cu * rad, py(c[1]) + p.cv * rad];
    }
    if (m === "ring") {
      var R = Math.min(pw, ph) * 0.36, gap = 0.16;
      var a = -Math.PI / 2 + p.g * gap + gap / 2 + (Math.floor(p.i / 3) / (N / 3)) * (Math.PI * 2 - gap * 3);
      var rr = R + ((p.i % 3) - 1) * R * 0.11;
      return [(plot.x0 + plot.x1) / 2 + Math.cos(a) * rr, (plot.y0 + plot.y1) / 2 + Math.sin(a) * rr];
    }
    return [px(p.n1), py(p.n2)];
  }

  function retarget(stagger) {
    points.forEach(function (p) {
      var t = target(p, mode);
      p.qx = t[0]; p.qy = t[1];
      p.wait = stagger ? Math.floor(Math.random() * 22) : 0;
      if (!stagger) { p.tx = t[0]; p.ty = t[1]; }
    });
  }

  function setMode(m) {
    mode = m; overlay = 0; overlayWait = 34;
    chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-mode") === m)); });
    retarget(!reduceMotion);
    if (reduceMotion) { settle(); draw(); } else { wake(); }
  }

  function settle() {
    points.forEach(function (p) { p.x = p.tx = p.qx; p.y = p.ty = p.qy; p.vx = p.vy = 0; });
    overlay = 1; overlayWait = 0; gridA = (mode === "ring" || mode === "clusters") ? 0 : 1;
  }

  function layout() {
    var rect = hero.getBoundingClientRect();
    W = rect.width; H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cr = copy.getBoundingClientRect();
    var gutter = parseFloat(getComputedStyle(copy).paddingLeft) || 24;
    if (W >= 900) {
      var lab = document.querySelector(".lab").getBoundingClientRect();
      plot.x0 = W * 0.52; plot.x1 = cr.right - rect.left - gutter;
      plot.y0 = 112; plot.y1 = Math.max(plot.y0 + 200, lab.top - rect.top - 44);
    } else {
      plot.x0 = gutter + 6; plot.x1 = W - gutter - 6;
      plot.y0 = 96; plot.y1 = Math.max(plot.y0 + 130, cr.top - rect.top - 30);
    }
    retarget(false);
  }

  function readout(r) {
    var text;
    if (mode === "bars") text = N + " points stacked into 8 bars";
    else if (mode === "clusters") text = N + " points in 3 clusters";
    else if (mode === "ring") text = N + " points in 3 segments";
    else text = N + " points, r = " + (r < 0 ? "\u2212" : "") + Math.abs(r).toFixed(2);
    if (stat.textContent !== text) stat.textContent = text;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var pw = plot.x1 - plot.x0, ph = plot.y1 - plot.y0, i, p;
    var cx = (plot.x0 + plot.x1) / 2, cy = (plot.y0 + plot.y1) / 2;

    // axis and gridlines fade out for the shapes that have no axis
    if (gridA > 0.01) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(26,21,53," + (0.08 * gridA) + ")";
      ctx.beginPath();
      for (i = 1; i <= 4; i++) { var gy = Math.round(py(i / 4)) + 0.5; ctx.moveTo(plot.x0, gy); ctx.lineTo(plot.x1, gy); }
      ctx.stroke();
      ctx.strokeStyle = "rgba(26,21,53," + (0.4 * gridA) + ")";
      ctx.beginPath();
      var by = Math.round(plot.y1) + 0.5;
      ctx.moveTo(plot.x0, by); ctx.lineTo(plot.x1, by);
      for (i = 0; i <= 8; i++) { var tx = Math.round(px(i / 8)) + 0.5; ctx.moveTo(tx, by); ctx.lineTo(tx, by + 6); }
      ctx.stroke();
    }

    // cluster halos sit behind the points
    if (mode === "clusters" && overlay > 0) {
      var rad = Math.min(pw, ph) * 0.105 * 2.5;
      for (i = 0; i < 3; i++) {
        var hx = px(CENTERS[i][0]), hy = py(CENTERS[i][1]);
        ctx.globalAlpha = overlay * 0.13; ctx.fillStyle = COLORS[i];
        ctx.beginPath(); ctx.arc(hx, hy, rad, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = overlay * 0.75; ctx.strokeStyle = COLORS[i]; ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 7]); ctx.beginPath(); ctx.arc(hx, hy, rad, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.globalAlpha = 1;
    }

    var sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
    for (i = 0; i < points.length; i++) {
      p = points[i];
      var du = (p.x - plot.x0) / pw, dv = (plot.y1 - p.y) / ph;
      sx += du; sy += dv; sxx += du * du; syy += dv * dv; sxy += du * dv;
      ctx.fillStyle = COLORS[p.g];
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    var den = Math.sqrt((N * sxx - sx * sx) * (N * syy - sy * sy));
    if (frame % 5 === 0 || !running) readout(den ? (N * sxy - sx * sy) / den : 0);

    if (mode === "trend" && overlay > 0) {
      var grad = ctx.createLinearGradient(plot.x0, 0, plot.x1, 0);
      grad.addColorStop(0, "#10BFB4"); grad.addColorStop(0.5, "#7B5CFF"); grad.addColorStop(1, "#FF4D9D");
      ctx.save();
      ctx.strokeStyle = grad; ctx.lineWidth = 3.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(123,92,255,0.45)"; ctx.shadowBlur = 14;
      ctx.beginPath();
      var steps = 64, last = Math.max(1, Math.round(steps * overlay)), ex = 0, ey = 0;
      for (i = 0; i <= last; i++) {
        ex = px(i / steps); ey = py(trend(i / steps));
        if (i === 0) ctx.moveTo(ex, ey); else ctx.lineTo(ex, ey);
      }
      ctx.stroke();
      ctx.shadowColor = "rgba(255,154,31,0.6)"; ctx.fillStyle = "#FF9A1F";
      ctx.beginPath(); ctx.arc(ex, ey, 6.5, 0, 6.2832); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = "rgba(255,154,31,0.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ex, ey, 14, 0, 6.2832); ctx.stroke();
    }

    if (mode === "ring" && overlay > 0) {
      var R = Math.min(pw, ph) * 0.36, gap = 0.16, start = 0;
      ctx.font = "700 " + (W >= 900 ? 17 : 14) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = overlay;
      for (i = 0; i < 3; i++) {
        var a0 = -Math.PI / 2 + i * gap + gap / 2 + (start / N) * (Math.PI * 2 - gap * 3);
        var a1 = -Math.PI / 2 + i * gap + gap / 2 + ((start + GROUPS[i]) / N) * (Math.PI * 2 - gap * 3);
        var am = (a0 + a1) / 2, lr = R * 0.66;
        ctx.fillStyle = LABELS[i];
        ctx.fillText(Math.round(GROUPS[i] / N * 100) + "%", cx + Math.cos(am) * lr, cy + Math.sin(am) * lr);
        start += GROUPS[i];
      }
      ctx.globalAlpha = 1;
    }
  }

  function step() {
    frame++;
    var energy = 0, waiting = false;
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      if (p.wait > 0) { p.wait--; waiting = true; if (p.wait === 0) { p.tx = p.qx; p.ty = p.qy; } }
      else { p.tx = p.qx; p.ty = p.qy; }
      if (pointer.active) {
        var dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && d2 > 0.01) {
          var d = Math.sqrt(d2), f = (1 - d / 130) * 2.6;
          p.vx += (dx / d) * f; p.vy += (dy / d) * f;
        }
      }
      p.vx = (p.vx + (p.tx - p.x) * p.k) * 0.8;
      p.vy = (p.vy + (p.ty - p.y) * p.k) * 0.8;
      p.x += p.vx; p.y += p.vy;
      energy += Math.abs(p.vx) + Math.abs(p.vy);
    }
    if (overlayWait > 0) overlayWait--; else if (overlay < 1) overlay = Math.min(1, overlay + 1 / 50);
    var gridTarget = (mode === "ring" || mode === "clusters") ? 0 : 1;
    gridA += (gridTarget - gridA) * 0.08;
    draw();
    var busy = waiting || energy > 0.6 || overlay < 1 || pointer.active || Math.abs(gridTarget - gridA) > 0.01;
    if (busy && visible) requestAnimationFrame(step);
    else { running = false; if (visible) draw(); }
  }
  function wake() { if (!running && visible) { running = true; requestAnimationFrame(step); } }

  seed(); layout();
  points.forEach(function (p) { p.x = p.tx; p.y = p.ty; });   // start as noise
  if (reduceMotion) { mode = "trend"; retarget(false); settle(); draw(); }
  else { draw(); setTimeout(function () { setMode("trend"); }, 700); }

  chips.forEach(function (c) { c.addEventListener("click", function () { setMode(c.getAttribute("data-mode")); }); });

  var resizeTimer;
  function relayout() { layout(); if (reduceMotion) { settle(); draw(); } else wake(); }
  window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(relayout, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  if (hasIO) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) wake(); }).observe(hero);

  if (!reduceMotion) {
    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      pointer.x = e.clientX - rect.left; pointer.y = e.clientY - rect.top; pointer.active = true;
      wake();
    });
    ["pointerleave", "pointercancel"].forEach(function (ev) { hero.addEventListener(ev, function () { pointer.active = false; }); });
    hero.addEventListener("pointerup", function (e) { if (e.pointerType !== "mouse") pointer.active = false; });
  }
})();
