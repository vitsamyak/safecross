console.log("SCRIPT RUN HO RAHA HAI 🔥");
/* ════════════════════════════════════
   STARFIELD
════════════════════════════════════ */
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
let W,
  H,
  stars = [];
function initStars() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  stars = Array.from({ length: 160 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.2 + 0.2,
    a: Math.random(),
    da: (Math.random() - 0.5) * 0.006,
  }));
}
function drawStars() {
  ctx.clearRect(0, 0, W, H);
  stars.forEach((s) => {
    s.a = Math.max(0.05, Math.min(1, s.a + s.da));
    if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,220,255,${s.a})`;
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
initStars();
drawStars();
window.addEventListener("resize", initStars);

/* ════════════════════════════════════
   STATE
════════════════════════════════════ */
let state = {
  vehicles: 0,
  peds: 0,
  alerts: 0,
  wait: 18,
  vehicleDetected: false,
  pedCrossing: false,
  alertMode: false,
  signalPhase: "RED", // RED | AMBER | GREEN
  logEntries: [],
  logCounter: 0,
  chartLabels: [],
  chartVeh: [],
  chartPed: [],
};

/* init chart data */
const now = new Date();
for (let i = 11; i >= 0; i--) {
  const d = new Date(now - i * 5 * 60000);
  state.chartLabels.push(
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );
  state.chartVeh.push(state.vehicles);
state.chartPed.push(state.peds);
}

/* ════════════════════════════════════
   COUNT-UP ANIMATION
════════════════════════════════════ */
function animateCountUp(el, target, duration = 1800) {
  let start = 0,
    step = target / 60;
  const t = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start).toLocaleString();
    if (start >= target) clearInterval(t);
  }, duration / 60);
}
setTimeout(() => {
  animateCountUp(document.getElementById("stat-vehicles"), state.vehicles);
  animateCountUp(document.getElementById("stat-peds"), state.peds);
  animateCountUp(document.getElementById("stat-alerts"), state.alerts);
  animateCountUp(document.getElementById("stat-wait"), state.wait);
}, 400);

/* ════════════════════════════════════
   STATUS ROWS
════════════════════════════════════ */
const statusItems = [
  {
    id: "s-ir",
    label: "IR Sensor Array",
    sub: "Zone A & B",
    status: "green",
    txt: "ONLINE",
  },
  {
    id: "s-ultra",
    label: "Ultrasonic Sensor",
    sub: "Vehicle Detect",
    status: "green",
    txt: "ONLINE",
  },
  {
    id: "s-esp",
    label: "ESP32 Module",
    sub: "192.168.1.105",
    status: "green",
    txt: "CONNECTED",
  },
  {
    id: "s-cam",
    label: "AI Camera Module",
    sub: "OV7670 · 30fps",
    status: "amber",
    txt: "PROCESSING",
  },
  {
    id: "s-db",
    label: "Firebase DB",
    sub: "Latency: 42ms",
    status: "green",
    txt: "SYNCED",
  },
  {
    id: "s-alert",
    label: "Alert System",
    sub: "Buzzer + SMS",
    status: "red",
    txt: "STANDBY",
  },
];
const rowsContainer = document.getElementById("status-rows");
statusItems.forEach((item) => {
  rowsContainer.innerHTML += `
    <div class="status-row">
      <div class="status-name">${item.label}<small>${item.sub}</small></div>
      <div class="led-indicator" id="${item.id}">
        <div class="led ${item.status}"></div>
        <span style="color:var(--text-muted)">${item.txt}</span>
      </div>
    </div>`;
});

/* ════════════════════════════════════
   SIGNAL CONTROL
════════════════════════════════════ */
function setSignal(phase) {
  state.signalPhase = phase;
  const r = document.getElementById("light-red");
  const a = document.getElementById("light-amber");
  const g = document.getElementById("light-green");
  const txt = document.getElementById("signal-status-text");
  r.className = "signal-light off";
  a.className = "signal-light off";
  g.className = "signal-light off";
  if (phase === "RED") {
    r.className = "signal-light red-on";
    txt.style.color = "var(--accent-red)";
    txt.textContent = "STOP — Vehicle Priority";
  } else if (phase === "AMBER") {
    a.className = "signal-light amber-on";
    txt.style.color = "var(--accent-amber)";
    txt.textContent = "CAUTION — Transitioning";
  } else {
    g.className = "signal-light green-on";
    txt.style.color = "var(--accent-green)";
    txt.textContent = "GO — Crossing Enabled";
  }
}
setSignal("RED");

/* ════════════════════════════════════
   TOGGLE HANDLERS
════════════════════════════════════ */
function handleToggle(type, val) {
  if (type === "vehicle") {
    state.vehicleDetected = val;
    addLog("Vehicle Detected", "Zone A", val ? "warn" : "ok");
    if (val) {
      setSignal("AMBER");
      setTimeout(() => setSignal("RED"), 1500);
    } else if (!state.pedCrossing) setSignal("RED");
    updateStatus("s-ultra", val ? "amber" : "green", val ? "ACTIVE" : "ONLINE");
  }
  if (type === "ped") {
    state.pedCrossing = val;
    addLog("Pedestrian Crossing", "Zone B", val ? "ok" : "info");
    if (val) {
      setSignal("AMBER");
      setTimeout(() => setSignal("GREEN"), 1200);
    } else {
      setSignal("AMBER");
      setTimeout(() => setSignal("RED"), 1200);
    }
    updateStatus("s-ir", val ? "green" : "green", val ? "CROSSING" : "ONLINE");
    if (val) {
      state.peds++;
      document.getElementById("stat-peds").textContent =
        state.peds.toLocaleString();
    }
  }
  if (type === "alert") {
    state.alertMode = val;
    addLog(
      "Alert Mode " + (val ? "Activated" : "Deactivated"),
      "System",
      val ? "warn" : "ok",
    );
    updateStatus("s-alert", val ? "red" : "red", val ? "ALERT!" : "STANDBY");
    if (val) {
      state.alerts++;
      document.getElementById("stat-alerts").textContent =
        state.alerts.toLocaleString();
      document.getElementById("last-alert-time").textContent =
        new Date().toLocaleTimeString();
      playBeep();
    }
  }
}
function updateStatus(id, cls, txt) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<div class="led ${cls}"></div><span style="color:var(--text-muted)">${txt}</span>`;
}

/* ════════════════════════════════════
   AUDIO BEEP
════════════════════════════════════ */
function playBeep() {
  try {
    const ac = new AudioContext();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.setValueAtTime(880, ac.currentTime);
    gain.gain.setValueAtTime(0.3, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    osc.start();
    osc.stop(ac.currentTime + 0.3);
  } catch (e) {}
}

/* ════════════════════════════════════
   ACTIVITY LOG
════════════════════════════════════ */
const logTypes = ["vehicle", "pedestrian", "alert", "system"];
const logEvents = [
  "Vehicle Detected",
  "Pedestrian Crossed",
  "Speed Alert",
  "Signal Changed",
  "Sensor Ping",
  "Zone Clear",
  "Emergency Override",
  "Night Mode Active",
  "Camera Frame Analyzed",
  "ESP32 Heartbeat",
];
const logLocs = [
  "Zone A",
  "Zone B",
  "Zone C",
  "Main Crossing",
  "North Entry",
  "South Entry",
];
const logStatuses = ["ok", "warn", "info"];

function addLog(eventName, loc, status) {
  state.logCounter++;
  const type = eventName.toLowerCase().includes("vehicle")
    ? "vehicle"
    : eventName.toLowerCase().includes("pedestrian")
      ? "pedestrian"
      : eventName.toLowerCase().includes("alert")
        ? "alert"
        : "system";
  const entry = {
    idx: state.logCounter,
    type,
    event: eventName,
    loc,
    time: new Date().toLocaleTimeString(),
    status,
  };
  state.logEntries.unshift(entry);
  if (state.logEntries.length > 60) state.logEntries.pop();
  renderLog();
}

function renderLog() {
  const container = document.getElementById("log-scroll");
  container.innerHTML = state.logEntries
    .slice(0, 50)
    .map(
      (e) => `
    <div class="log-row">
      <span class="log-idx">${String(e.idx).padStart(3, "0")}</span>
      <span class="log-type ${e.type}">${e.event}</span>
      <span class="log-location">${e.loc}</span>
      <span class="log-time">${e.time}</span>
      <span class="log-badge ${e.status}">${e.status.toUpperCase()}</span>
    </div>`,
    )
    .join("");
}

/* seed initial log */
for (let i = 0; i < 20; i++) {
  const ev = logEvents[Math.floor(Math.random() * logEvents.length)];
  const loc = logLocs[Math.floor(Math.random() * logLocs.length)];
  const st = logStatuses[Math.floor(Math.random() * logStatuses.length)];
  addLog(ev, loc, st);
}

/* ════════════════════════════════════
   AUTO-SIMULATE
════════════════════════════════════ */
//   setInterval(() => {
//     const ev = logEvents[Math.floor(Math.random() * logEvents.length)];
//     const loc = logLocs[Math.floor(Math.random() * logLocs.length)];
//     const st = logStatuses[Math.floor(Math.random() * logStatuses.length)];
//     addLog(ev, loc, st);

//     // random vehicle count bump
//     if (Math.random() > 0.6) {
//       state.vehicles++;
//       document.getElementById("stat-vehicles").textContent =
//         state.vehicles.toLocaleString();
//     }
//     if (Math.random() > 0.75) {
//       state.peds++;
//       document.getElementById("stat-peds").textContent =
//         state.peds.toLocaleString();
//     }
//   }, 3200);

/* ════════════════════════════════════
   CHART
════════════════════════════════════ */
const chartCtx = document.getElementById("activityChart").getContext("2d");
const actChart = new Chart(chartCtx, {
  type: "line",
  data: {
    labels: state.chartLabels,
    datasets: [
      {
        label: "Vehicles",
        data: state.chartVeh,
        borderColor: "#00f5ff",
        backgroundColor: "rgba(0,245,255,0.08)",
        tension: 0.45,
        fill: true,
        pointBackgroundColor: "#00f5ff",
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
      {
        label: "Pedestrians",
        data: state.chartPed,
        borderColor: "#00ff88",
        backgroundColor: "rgba(0,255,136,0.06)",
        tension: 0.45,
        fill: true,
        pointBackgroundColor: "#00ff88",
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(2,11,24,0.95)",
        borderColor: "rgba(0,245,255,0.3)",
        borderWidth: 1,
        titleColor: "#00f5ff",
        bodyColor: "#6a8fa8",
        padding: 12,
        callbacks: {
          label: (ctx) => `  ${ctx.dataset.label}: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: {
          color: "#6a8fa8",
          font: { family: "JetBrains Mono", size: 11 },
        },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: {
          color: "#6a8fa8",
          font: { family: "JetBrains Mono", size: 11 },
        },
      },
    },
  },
});

/* Live chart update */
setInterval(() => {
  const t = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  actChart.data.labels.push(t);
  actChart.data.datasets[0].data.push(state.vehicles);
  actChart.data.datasets[1].data.push(state.peds);
  if (actChart.data.labels.length > 16) {
    actChart.data.labels.shift();
    actChart.data.datasets.forEach((d) => d.data.shift());
  }
  actChart.update("none");
}, 5000);

/* ════════════════════════════════════
   SIGNAL AUTO-CYCLE
════════════════════════════════════ */
const phases = ["RED", "GREEN", "AMBER"];
let phaseIdx = 0;
setInterval(() => {
  if (!state.vehicleDetected && !state.pedCrossing) {
    phaseIdx = (phaseIdx + 1) % phases.length;
    setSignal(phases[phaseIdx]);
  }
}, 5000);

/* ════════════════════════════════════
   INTERSECTION OBSERVER (reveal)
════════════════════════════════════ */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://zebra-crossing-cae7f-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

onValue(ref(db, "zebra"), (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  // 🔥 update state
  state.vehicles = data.vehicles || 0;
  state.peds = data.pedestrians || 0;
  state.alerts = data.violations || 0;

  // 🔥 UI update
  document.getElementById("stat-vehicles").textContent =
    state.vehicles.toLocaleString();
  document.getElementById("stat-peds").textContent =
    state.peds.toLocaleString();
  document.getElementById("stat-alerts").textContent =
    state.alerts.toLocaleString();

  // 🔥 chart ko force update kar
  actChart.data.datasets[0].data[actChart.data.datasets[0].data.length - 1] =
    state.vehicles;

  actChart.data.datasets[1].data[actChart.data.datasets[1].data.length - 1] =
    state.peds;

  actChart.update();

  // 🔥 log
  addLog("Firebase Sync", "Cloud", "ok");

  console.log("🔥 Firebase data received:", data);
});

/* ════════════════════════════════════
   LIVE VIOLATION RECORDS (Firebase)
════════════════════════════════════ */

// Track violation rendering
let renderedViolations = {};

// Fetch violations from Firebase
async function fetchViolations() {
  try {
    const violationsRef = ref(db, "violations");
    
    // Listen for real-time updates
    onValue(violationsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data || Object.keys(data).length === 0) {
        // Empty state
        document.getElementById("violations-container").innerHTML = "";
        document.getElementById("violations-loading").style.display = "none";
        document.getElementById("violations-empty").style.display = "block";
        renderedViolations = {};
        return;
      }

      // Convert to array and sort by most recent
      const violationsArray = Object.entries(data).map(([id, violation]) => ({
        id,
        ...violation,
      }));

      // Show container, hide empty and loading states
      document.getElementById("violations-container").style.display = "grid";
      document.getElementById("violations-empty").style.display = "none";
      document.getElementById("violations-loading").style.display = "none";

      // Render violations
      renderViolationCards(violationsArray);
      
      console.log("🚨 Violations fetched:", violationsArray);
    });
  } catch (error) {
    console.error("Error fetching violations:", error);
    document.getElementById("violations-empty").style.display = "block";
    document.getElementById("violations-loading").style.display = "none";
  }
}

// Render violation cards with smooth animations
function renderViolationCards(violations) {
  const container = document.getElementById("violations-container");

  violations.forEach((violation, index) => {
    const violationId = `violation-${violation.id}`;

    // Skip if already rendered (to prevent duplicate rendering)
    if (renderedViolations[violation.id]) {
      return;
    }

    // Mark as rendered
    renderedViolations[violation.id] = true;

    // Create card HTML
    const card = document.createElement("div");
    card.className = "violation-card";
    card.id = violationId;
    card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.08}s both`;

    // Handle image loading
    const imageSrc = violation.image || "";
    const imageHtml = imageSrc
      ? `<img src="${imageSrc}" alt="Violation" class="violation-image" onerror="this.parentElement.innerHTML = '<div class=\\'violation-placeholder\\'>📷</div>'" />`
      : `<div class="violation-placeholder">📷</div>`;

    card.innerHTML = `
      <div class="violation-image-container">
        ${imageHtml}
        <div class="violation-status-badge">RED SIGNAL VIOLATION</div>
      </div>
      <div class="violation-content">
        <div class="violation-id">ID: ${violation.id || "N/A"}</div>
        <div class="violation-meta">
          <div class="violation-meta-item">
            <span class="violation-meta-label">Time:</span>
            <span>${violation.time || "—"}</span>
          </div>
          <div class="violation-meta-item">
            <span class="violation-meta-label">Date:</span>
            <span>${violation.date || "—"}</span>
          </div>
        </div>
        <div class="violation-footer">
          <span class="violation-camera-status">
            <div class="camera-indicator"></div>
            Camera Active
          </span>
          <span style="color: var(--text-muted); font-size: 0.75rem;">${new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Add fade-in animation
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Initialize violations tracking on page load
setTimeout(() => {
  // Show loading state
  document.getElementById("violations-loading").style.display = "flex";
  document.getElementById("violations-container").style.display = "none";
  document.getElementById("violations-empty").style.display = "none";

  // Fetch violations after a short delay
  setTimeout(() => {
    fetchViolations();
  }, 500);
}, 1000);

// Real-time Firebase listener already set up in fetchViolations()

/* ════════════════════════════════════
   MOBILE BURGER MENU
════════════════════════════════════ */
const burgerMenuBtn = document.getElementById('burger-menu');
const navMenuMobile = document.getElementById('nav-menu-mobile');

if (burgerMenuBtn) {
  burgerMenuBtn.addEventListener('click', () => {
    burgerMenuBtn.classList.toggle('active');
    navMenuMobile.classList.toggle('active');
  });

  // Close menu when a link is clicked
  const mobileLinks = navMenuMobile.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      burgerMenuBtn.classList.remove('active');
      navMenuMobile.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('nav') && !e.target.closest('.nav-menu-mobile')) {
      burgerMenuBtn.classList.remove('active');
      navMenuMobile.classList.remove('active');
    }
  });
}
