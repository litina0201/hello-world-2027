const EXAM_DATE = new Date(2027, 5, 7);
const DAY = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "hello-world-2027:v2";

const quotes = [
  "今天不用赢过所有人，只要比昨天多稳一点。 / Steady is strong.",
  "继续往前，新世界正在加载。 / The new world is loading.",
  "把今天点亮，未来会收到信号。 / Send the signal.",
  "不用急，稳定本身就是很强的能力。 / Stay steady.",
  "每一个小小的完成，都算一次提交。 / Every commit counts.",
  "今天的努力，会在某一天突然发光。 / Light will find you.",
  "专注今天，下一站自然会到。 / Focus on today.",
  "你不是在倒数时间，你是在升级自己。 / Upgrade in progress.",
  "慢一点也没关系，只要系统还在运行。 / Keep running.",
  "累的时候也算数，因为你没有退出。 / Still online.",
  "今天的你，已经比昨天多解锁了一点。 / One more unlock.",
  "别怕暂时看不见结果，进度条一直在走。 / Progress is moving."
];

const moods = [
  { icon: "●", label: "平稳" },
  { icon: "▲", label: "有劲" },
  { icon: "◆", label: "专注" },
  { icon: "◇", label: "松弛" },
  { icon: "◐", label: "疲惫" },
  { icon: "!", label: "焦虑" },
  { icon: "★", label: "开心" },
  { icon: "~", label: "想发呆" },
  { icon: "↗", label: "突破" },
  { icon: "≡", label: "复盘" },
  { icon: "♪", label: "有旋律" },
  { icon: "∞", label: "自定义" }
];

const stages = [
  { min: 301, name: "Boot Sequence", color: "#19d3ff", next: 350 },
  { min: 251, name: "First Commit", color: "#20f5c7", next: 300 },
  { min: 201, name: "Stable Build", color: "#7cfc9a", next: 250 },
  { min: 151, name: "Deep Work Mode", color: "#ff4fd8", next: 200 },
  { min: 101, name: "Winter Upgrade", color: "#ffd166", next: 150 },
  { min: 51, name: "Final Sprint", color: "#ff8a3d", next: 100 },
  { min: 1, name: "Focus Lock", color: "#f8fafc", next: 50 },
  { min: 0, name: "Hello World", color: "#ffffff", next: 0 }
];

const checkpoints = [
  { d: 350, date: "2026-06-21", name: "Boot Sequence", color: "#7c3cff", text: "系统启动，长期节奏开始。" },
  { d: 300, date: "2026-08-10", name: "First Commit", color: "#4f46e5", text: "习惯开始写入身体。" },
  { d: 250, date: "2026-09-29", name: "Stable Build", color: "#0ea5ff", text: "稳定版本正在形成。" },
  { d: 200, date: "2026-11-18", name: "Deep Work Mode", color: "#13e6c3", text: "进入深度复盘和积累。" },
  { d: 150, date: "2027-01-07", name: "Winter Upgrade", color: "#8dff63", text: "寒假前后，完成一次升级。" },
  { d: 100, date: "2027-02-26", name: "Final Sprint", color: "#ffd166", text: "百日冲刺正式解锁。" },
  { d: 50, date: "2027-04-17", name: "Focus Lock", color: "#ff3b30", text: "最后50天，稳住节奏。" },
  { d: 0, date: "CLASSIFIED", name: "Hello World", color: "#ffffff", text: "新世界，正式打开。" }
];

const $ = (id) => document.getElementById(id);
const devMode = new URLSearchParams(window.location.search).get("dev") === "1";
document.body.classList.toggle("dev-mode", devMode);

const els = {
  bootScreen: $("bootScreen"),
  enterButton: $("enterButton"),
  resetBootButton: $("resetBootButton"),
  todayTitle: $("todayTitle"),
  countdownCard: $("countdownCard"),
  daysLeft: $("daysLeft"),
  dateLine: $("dateLine"),
  stageName: $("stageName"),
  lockState: $("lockState"),
  dailyQuote: $("dailyQuote"),
  unlockButton: $("unlockButton"),
  nextCheckpoint: $("nextCheckpoint"),
  stageProgress: $("stageProgress"),
  progressFill: $("progressFill"),
  logStatus: $("logStatus"),
  moodGrid: $("moodGrid"),
  customMoodInput: $("customMoodInput"),
  noteInput: $("noteInput"),
  photoInput: $("photoInput"),
  photoPreview: $("photoPreview"),
  checkpointList: $("checkpointList"),
  previewD320Button: $("previewD320Button"),
  currentPathButton: $("currentPathButton"),
  demoMilestoneButton: $("demoMilestoneButton"),
  demoMemoryButton: $("demoMemoryButton"),
  memoryCount: $("memoryCount"),
  memoryGrid: $("memoryGrid"),
  shareCanvas: $("shareCanvas"),
  generateShareButton: $("generateShareButton"),
  downloadShare: $("downloadShare"),
  toast: $("toast"),
  bottomNav: $("bottomNav")
};

let state = loadState();
let today = startOfLocalDay(new Date());
let todayKey = keyForDate(today);
let previewFinalMilestones = false;
let previewLeft = null;

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function keyForDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysLeft(date = today) {
  return Math.max(0, Math.ceil((startOfLocalDay(EXAM_DATE) - startOfLocalDay(date)) / DAY));
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { entered: false, logs: {} };
  } catch {
    return { entered: false, logs: {} };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    showToast("Storage full. Try a smaller image.");
    return false;
  }
}

function todayLog() {
  state.logs[todayKey] ||= {};
  return state.logs[todayKey];
}

function getStage(left) {
  return stages.find((stage) => left >= stage.min) || stages.at(-1);
}

function getQuote(left) {
  return quotes[left % quotes.length];
}

function randomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getStageProgress(left) {
  const current = getStage(left);
  const index = stages.indexOf(current);
  const previousTop = index === 0 ? 354 : stages[index - 1].min - 1;
  const range = Math.max(1, previousTop - current.min + 1);
  const done = previousTop - left;
  return Math.max(0, Math.min(100, Math.round((done / range) * 100)));
}

function applyTheme(stage) {
  document.documentElement.style.setProperty("--accent", stage.color);
  const second = stage.color === "#ffffff" ? "#ff497c" : "#7cfc9a";
  document.documentElement.style.setProperty("--accent-2", second);
}

function render() {
  const left = previewLeft ?? daysLeft();
  const stage = getStage(left);
  const log = todayLog();
  const unlocked = Boolean(log.unlocked);
  const quote = log.quote || getQuote(left);

  applyTheme(stage);
  els.todayTitle.textContent = formatDate(today);
  els.daysLeft.textContent = left === 0 ? "D-DAY" : `D-${left}`;
  els.dateLine.textContent = `${keyForDate(today)} / NEXT WORLD: LOADING`;
  els.stageName.textContent = stage.name;
  els.lockState.textContent = unlocked ? "UNLOCKED" : "LOCKED";
  els.dailyQuote.textContent = unlocked ? quote : "Tap to unlock today's signal.";
  els.unlockButton.textContent = unlocked ? "TODAY UNLOCKED" : "UNLOCK TODAY";
  document.body.classList.toggle("day-locked", !unlocked);
  els.countdownCard.classList.toggle("locked", !unlocked);
  els.countdownCard.classList.toggle("unlocked", unlocked);

  const next = checkpoints.find((item) => left >= item.d);
  els.nextCheckpoint.textContent = next ? `Next checkpoint: D-${next.d}` : "Checkpoint complete";
  const progress = getStageProgress(left);
  els.stageProgress.textContent = `${progress}%`;
  els.progressFill.style.width = `${progress}%`;

  els.logStatus.textContent = unlocked ? "unlocked" : "waiting";
  els.noteInput.value = log.note || "";
  els.customMoodInput.value = log.customMood || "";
  renderMood(log.mood);
  renderMemoryPreview(log);
  renderCheckpoints(previewFinalMilestones ? 0 : left);
  renderMemory();
  generateShareCard();
}

function renderMood(selected) {
  if (!els.moodGrid.dataset.ready) {
    els.moodGrid.innerHTML = moods
      .map(
        (mood) => `
          <button type="button" data-mood="${mood.label}" aria-label="${mood.label}">
            <span class="mood-icon">${mood.icon}</span>
            <span class="mood-label">${mood.label}</span>
          </button>
        `
      )
      .join("");
    els.moodGrid.dataset.ready = "true";
  }

  els.moodGrid.querySelectorAll("button").forEach((button) => {
    const isCustom = selected && !moods.some((mood) => mood.label === selected) && button.dataset.mood === "自定义";
    button.classList.toggle("active", button.dataset.mood === selected || isCustom);
  });
}

function renderMemoryPreview(log) {
  els.photoPreview.classList.toggle("empty", !log.photo);
  els.photoPreview.innerHTML = log.photo ? `<img alt="今日记忆照片" src="${log.photo}" />` : "No memory yet";
}

function checkpointProgress(left, index) {
  const current = checkpoints[index];
  const previous = index === 0 ? 354 : checkpoints[index - 1].d;
  if (left <= current.d) return 100;
  if (left >= previous) return 0;
  return Math.round(((previous - left) / (previous - current.d)) * 100);
}

function renderCheckpoints(left) {
  const allDone = left === 0;
  els.checkpointList.innerHTML = checkpoints
    .map((item, index) => {
      const done = left <= item.d;
      const progress = checkpointProgress(left, index);
      const dateLabel =
        item.date === "CLASSIFIED"
          ? "CLASSIFIED"
          : `${item.date} ${["周日", "周一", "周二", "周三", "周四", "周五", "周六"][dateFromKey(item.date).getDay()]}`;
      return `
        <article class="checkpoint-item ${done ? "done" : ""} ${allDone ? "rainbow" : ""}" style="--checkpoint-color: ${item.color}; --checkpoint-progress: ${progress}%">
          <strong>${item.d === 0 ? "DAY" : `D-${item.d}`}</strong>
          <div>
            <b>${item.name}</b>
            <p>${dateLabel}</p>
            <p>${item.text}</p>
          </div>
          <div class="checkpoint-bar"><div class="checkpoint-fill"></div></div>
        </article>
      `;
    })
    .join("");
}

function renderMemory() {
  const records = Object.entries(state.logs)
    .filter(([, log]) => log.unlocked || log.photo || log.note || log.mood)
    .sort(([a], [b]) => b.localeCompare(a));

  els.memoryCount.textContent = `${records.length} records`;
  els.memoryGrid.innerHTML = records.length
    ? records
        .map(([date, log]) => `
          <article class="memory-card">
            ${
              log.photo
                ? `<div class="memory-visual has-photo"><img alt="${date} 记忆照片" src="${log.photo}" /><span>PHOTO</span></div>`
                : `<div class="memory-visual"><span>SIGNAL</span>${memoryMark(log.mood)}</div>`
            }
            <div class="memory-copy">
              <time>${date}</time>
              <strong>${log.mood || "Signal recorded"}</strong>
              <p>${log.note || log.quote || "今天已解锁。"}</p>
            </div>
          </article>
        `)
        .join("")
    : `<div class="photo-preview">No memory yet</div>`;
}

function memoryMark(mood = "") {
  const match = moods.find((item) => item.label === mood);
  if (match) return match.icon;
  return mood ? "∞" : "✓";
}

function demoPhoto(colorA, colorB, label) {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, colorA);
  gradient.addColorStop(1, colorB);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(8, 10, 16, 0.32)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(248, 250, 252, 0.68)";
  ctx.lineWidth = 6;
  ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "900 96px system-ui, sans-serif";
  ctx.fillText(label, 74, 384);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function loadDemoDays() {
  const demo = [
    { offset: 0, mood: "专注", note: "今天把一个难点啃下来了。", photo: demoPhoto("#19d3ff", "#111827", "D-354") },
    { offset: -1, mood: "有旋律", note: "晚上的节奏很好，像一首正在成型的歌。", photo: demoPhoto("#20f5c7", "#0f172a", "LOG") },
    { offset: -2, mood: "疲惫", note: "有点累，但还是完成了今天的信号。" },
    { offset: -3, mood: "突破", note: "错题复盘突然顺了，像打开了一个隐藏门。" },
    { offset: -4, mood: "平稳", note: "普通的一天，也算数。" },
    { offset: -5, mood: "开心", note: "今天有一个很小但很亮的瞬间。", photo: demoPhoto("#ff4fd8", "#0b1020", "JOY") }
  ];

  demo.forEach((item) => {
    const date = new Date(today);
    date.setDate(today.getDate() + item.offset);
    const key = keyForDate(date);
    state.logs[key] = {
      unlocked: true,
      mood: item.mood,
      note: item.note,
      quote: quotes[Math.abs(item.offset) % quotes.length],
      photo: item.photo || ""
    };
  });
  saveState();
  showToast("Demo days loaded.");
  render();
}

function unlockToday() {
  const log = todayLog();
  if (!log.unlocked) {
    log.unlocked = true;
    log.quote = randomQuote();
    log.color = getStage(daysLeft()).color;
    saveState();
    showToast("Today unlocked.");
  }
  render();
}

function saveTodayLog() {
  const log = todayLog();
  log.note = els.noteInput.value.trim();
  log.customMood = els.customMoodInput.value.trim();
  if (log.customMood) log.mood = log.customMood;
  log.unlocked = true;
  log.quote ||= randomQuote();
  saveState();
  showToast("Log saved.");
  render();
}

function saveTextLog() {
  const log = todayLog();
  log.note = els.noteInput.value.trim();
  log.customMood = els.customMoodInput.value.trim();
  if (log.customMood) log.mood = log.customMood;
  if (log.note || log.customMood) {
    log.unlocked = true;
    log.quote ||= randomQuote();
  }
  saveState();
  renderMemory();
  generateShareCard();
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function handlePhoto(file) {
  if (!file) return;
  if (file.type === "image/gif") {
    const reader = new FileReader();
    reader.onload = () => {
      const log = todayLog();
      log.photo = reader.result;
      log.unlocked = true;
      log.quote ||= randomQuote();
      saveState();
      showToast("GIF memory added.");
      render();
    };
    reader.readAsDataURL(file);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 1200;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const log = todayLog();
      log.photo = canvas.toDataURL("image/jpeg", 0.82);
      log.unlocked = true;
      log.quote ||= randomQuote();
      saveState();
      showToast("Memory added.");
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function switchView(view) {
  const isToday = view === "today";
  $("todayPanel").classList.toggle("hidden", !isToday);
  $("checkpointsView").classList.toggle("hidden", view !== "checkpoints");
  $("memoryView").classList.toggle("hidden", view !== "memory");
  $("shareView").classList.toggle("hidden", view !== "share");
  document.querySelector(".progress-section").classList.toggle("hidden", !isToday);
  els.countdownCard.classList.toggle("hidden", !isToday);
  els.bottomNav.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  if (view === "share") generateShareCard();
}

function toggleFinalMilestonePreview() {
  previewFinalMilestones = !previewFinalMilestones;
  previewLeft = previewFinalMilestones ? 0 : null;
  els.demoMilestoneButton.textContent = previewFinalMilestones ? "EXIT FINAL PREVIEW" : "PREVIEW FINAL COLORS";
  showToast(previewFinalMilestones ? "Final colors preview." : "Back to current path.");
  render();
}

function previewD320() {
  previewFinalMilestones = false;
  previewLeft = 320;
  els.demoMilestoneButton.textContent = "PREVIEW FINAL COLORS";
  showToast("Previewing D-320.");
  render();
}

function currentPath() {
  previewFinalMilestones = false;
  previewLeft = null;
  els.demoMilestoneButton.textContent = "PREVIEW FINAL COLORS";
  showToast("Back to current path.");
  render();
}

function generateShareCard() {
  const canvas = els.shareCanvas;
  const ctx = canvas.getContext("2d");
  const left = daysLeft();
  const stage = getStage(left);
  const log = todayLog();

  ctx.fillStyle = "#08101f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (log.photo) {
    const image = new Image();
    image.onload = () => drawShare(ctx, canvas, image, left, stage, log);
    image.src = log.photo;
  } else {
    drawShare(ctx, canvas, null, left, stage, log);
  }
}

function drawShare(ctx, canvas, image, left, stage, log) {
  if (image) {
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    ctx.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    ctx.fillStyle = "rgba(8, 10, 16, 0.58)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, stage.color);
    gradient.addColorStop(0.5, "#0b1020");
    gradient.addColorStop(1, "#ff497c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(8, 10, 16, 0.62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.strokeStyle = stage.color;
  ctx.lineWidth = 4;
  ctx.strokeRect(64, 64, canvas.width - 128, canvas.height - 128);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "800 56px system-ui, sans-serif";
  ctx.fillText("HELLO WORLD 2027", 92, 160);

  ctx.fillStyle = stage.color;
  ctx.font = "900 184px system-ui, sans-serif";
  ctx.fillText(left === 0 ? "D-DAY" : `D-${left}`, 92, 430);

  ctx.fillStyle = "#dbeafe";
  ctx.font = "700 44px system-ui, sans-serif";
  ctx.fillText(stage.name, 96, 520);

  wrapText(ctx, log.quote || getQuote(left), 96, 680, 888, 56);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 34px system-ui, sans-serif";
  ctx.fillText(`${todayKey} / ${log.mood || "signal recorded"}`, 96, 1280);

  if (log.note) {
    ctx.fillStyle = "#f8fafc";
    ctx.font = "600 34px system-ui, sans-serif";
    wrapText(ctx, log.note, 96, 1360, 888, 46);
  }

  els.downloadShare.href = canvas.toDataURL("image/jpeg", 0.92);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = Array.from(text);
  let line = "";
  for (const char of chars) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 1800);
}

els.enterButton.addEventListener("click", () => {
  state.entered = true;
  saveState();
  els.bootScreen.classList.add("hidden");
});

els.resetBootButton.addEventListener("click", () => {
  delete state.logs[todayKey];
  state.entered = false;
  saveState();
  render();
  els.bootScreen.classList.remove("hidden");
});

els.unlockButton.addEventListener("click", unlockToday);
els.countdownCard.addEventListener("click", (event) => {
  if (event.target === els.unlockButton) return;
  unlockToday();
});

els.moodGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-mood]");
  if (!button) return;
  const log = todayLog();
  if (button.dataset.mood === "自定义") {
    els.customMoodInput.focus();
  } else {
    log.mood = button.dataset.mood;
    log.customMood = "";
  }
  log.unlocked = true;
  log.quote ||= randomQuote();
  saveState();
  render();
});

els.demoMilestoneButton.addEventListener("click", toggleFinalMilestonePreview);
els.previewD320Button.addEventListener("click", previewD320);
els.currentPathButton.addEventListener("click", currentPath);
els.demoMemoryButton.addEventListener("click", loadDemoDays);
const autoSaveTextLog = debounce(saveTextLog, 450);
els.customMoodInput.addEventListener("change", () => {
  const log = todayLog();
  log.customMood = els.customMoodInput.value.trim();
  if (log.customMood) log.mood = log.customMood;
  log.unlocked = true;
  log.quote ||= randomQuote();
  saveState();
  render();
});
els.noteInput.addEventListener("input", autoSaveTextLog);
els.customMoodInput.addEventListener("input", autoSaveTextLog);
els.photoInput.addEventListener("change", (event) => handlePhoto(event.target.files[0]));
els.generateShareButton.addEventListener("click", () => {
  generateShareCard();
  showToast("Share card generated.");
});

els.bottomNav.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-view]");
  if (!button) return;
  switchView(button.dataset.view);
});

if (state.entered) {
  els.bootScreen.classList.add("hidden");
}

render();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
