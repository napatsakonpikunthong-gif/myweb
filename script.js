/* ===============================
   UAV COMMAND CENTER - PRO VERSION
================================ */

/* ---------- Helpers ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* ---------- Global State ---------- */
const state = {
  theme: localStorage.getItem("theme") || "light",
  controlMode: "uav", // uav | hud
  uav: { x: 120, y: 120 },
  hud: { x: 0, y: 0 }
};

/* ---------- Theme (Dark / Light) ---------- */
const toggleTheme = () => {
  document.body.classList.toggle("dark-mode");
  state.theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", state.theme);

  const btn = $("#darkModeToggle");
  if (btn) btn.textContent = state.theme === "dark" ? "☀️" : "🌙";
};

if (state.theme === "dark") document.body.classList.add("dark-mode");
$("#darkModeToggle")?.addEventListener("click", toggleTheme);

/* ---------- Scroll System ---------- */
window.addEventListener("scroll", () => {
  const y = window.scrollY;

  $("#backToTop")?.style.setProperty(
    "display", y > 300 ? "block" : "none"
  );

  $(".navbar")?.classList.toggle("shrink", y > 80);

  const bar = $(".nav-progress");
  if (bar) {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (y / h) * 100 + "%";
  }

  const threat = $(".threat-status");
  if (threat) {
    threat.textContent =
      y < 300 ? "THREAT LEVEL: LOW" :
      y < 700 ? "THREAT LEVEL: MEDIUM" :
      "⚠ HIGH THREAT DETECTED";
  }

  $(".earth") && ($(".earth").style.transform =
    `scale(${1.1 + y * 0.0003}) translateY(${y * 0.1}px)`);
  $(".clouds") && ($(".clouds").style.transform =
    `translateY(${y * 0.2}px)`);
});

/* ---------- Back to Top ---------- */
$("#backToTop")?.addEventListener("click", () =>
  scrollTo({ top: 0, behavior: "smooth" })
);

/* ---------- Keyboard Control (PRO MODE) ---------- */
document.addEventListener("keydown", e => {
  const step = 8;

  if (e.key === "m") {
    state.controlMode = state.controlMode === "uav" ? "hud" : "uav";
    return;
  }

  if (state.controlMode === "uav") {
    if (e.key === "w") state.uav.y -= step;
    if (e.key === "s") state.uav.y += step;
    if (e.key === "a") state.uav.x -= step;
    if (e.key === "d") state.uav.x += step;

    state.uav.x = Math.max(0, Math.min(220, state.uav.x));
    state.uav.y = Math.max(0, Math.min(220, state.uav.y));

    const uav = $("#uav");
    if (uav) {
      uav.style.left = state.uav.x + "px";
      uav.style.top = state.uav.y + "px";
    }
  }

  if (state.controlMode === "hud") {
    if (e.key === "w") state.hud.y -= step;
    if (e.key === "s") state.hud.y += step;
    if (e.key === "a") state.hud.x -= step;
    if (e.key === "d") state.hud.x += step;

    $(".hud-overlay")?.style.setProperty(
      "transform",
      `translate(${state.hud.x}px, ${state.hud.y}px)`
    );
  }

  if (e.key === "n") document.body.classList.toggle("night-vision");
  if (e.key === "t") document.body.classList.toggle("thermal");
});

/* ---------- Page Transition ---------- */
$$("a[href]").forEach(link => {
  if (!link.href.includes(location.origin)) return;

  link.addEventListener("click", e => {
    e.preventDefault();
    $(".page-transition")?.classList.add("active");
    setTimeout(() => location.href = link.href, 600);
  });
});

/* ---------- Radar Beep (after interaction) ---------- */
document.addEventListener("click", () => {
  const beep = $("#radarBeep");
  if (!beep) return;

  setInterval(() => {
    beep.currentTime = 0;
    beep.volume = 0.15;
    beep.play().catch(()=>{});
  }, 3500);
}, { once: true });

/* ---------- Telemetry Canvas ---------- */
const canvas = $("#telemetry");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let data = Array(60).fill(60);

  setInterval(() => {
    data.push(40 + Math.random() * 60);
    data.shift();

    ctx.clearRect(0,0,300,120);
    ctx.strokeStyle = "#00f6ff";
    ctx.beginPath();

    data.forEach((v,i)=>{
      const x = i * 5;
      const y = 120 - v;
      i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
    });
    ctx.stroke();
  }, 300);
}

/* ---------- AI Text System ---------- */
const cycleText = (id, list, delay) => {
  let i = 0;
  setInterval(() => {
    const el = document.getElementById(id);
    if (el) el.textContent = list[i++ % list.length];
  }, delay);
};

cycleText("aiHistoryText", [
  "EARLY UAV USED FOR MILITARY PURPOSES",
  "SHIFTING TO SURVEILLANCE MISSIONS",
  "PREDATOR UAV CHANGED MODERN WARFARE",
  "CIVILIAN UAV USAGE EXPANDING",
  "AI IS SHAPING THE FUTURE OF UAV"
], 2500);

cycleText("aiLiveText", [
  "SCANNING AIRSPACE...",
  "OPTIMIZING FLIGHT PATH",
  "SATELLITE LINK STABLE",
  "AI DECISION MATRIX READY"
], 2000);

/* ---------- Target Lock ---------- */
$$(".uav-image-wrapper").forEach(box => {
  const lock = box.querySelector(".target-lock");
  box.addEventListener("mousemove", e => {
    const r = box.getBoundingClientRect();
    lock.style.left = e.clientX - r.left + "px";
    lock.style.top = e.clientY - r.top + "px";
  });
});

/* ---------- Save / Load Mission ---------- */
const saveMission = () => {
  localStorage.setItem("mission", JSON.stringify(state));
};

const loadMission = () => {
  const m = localStorage.getItem("mission");
  if (!m) return;
  Object.assign(state, JSON.parse(m));
};

loadMission();
window.addEventListener("beforeunload", saveMission);
