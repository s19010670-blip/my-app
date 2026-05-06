const STORAGE_KEYS = {
  user: "focusfrog_user",
  settings: "focusfrog_settings",
  history: "focusfrog_history",
  lockState: "focusfrog_lock_state",
  dailyLessons: "focusfrog_daily_lessons",
  proofHashes: "focusfrog_proof_hashes",
};

const MISSION_OPTIONS = [
  "20-min study sprint",
  "15-min walk outside",
  "10-min room clean",
  "5-min breathing + journal",
  "30 bodyweight reps",
];

const GOAL_PRESETS = [
  "Less mindless scrolling",
  "Sleep earlier",
  "More study focus",
  "Family time without phones",
  "Healthier eyes & posture",
  "One calm hour before bed",
];

const TIME_PRESETS = [
  { label: "1h", hours: 1 },
  { label: "2h", hours: 2 },
  { label: "3h", hours: 3 },
  { label: "3h 30m", hours: 3.5 },
  { label: "4h", hours: 4 },
  { label: "5h", hours: 5 },
  { label: "6h", hours: 6 },
  { label: "7h", hours: 7 },
];

const FOCUS_OPTIONS = ["Study sprint", "Family time", "Deep work", "Creative hour"];
const BREAK_OPTIONS = ["10m walk", "Stretch", "Read pages", "Desk tidy"];
const WIND_OPTIONS = [
  { label: "Wind-down mode", value: "yes" },
  { label: "Not tonight", value: "no" },
];

const PENALTY_MS = 10 * 60 * 1000;
const FOCUS_SESSION_KEY = "focusfrog_focus_until";
const SOFT_OVERAGE_HOURS = 0.5; // 30 minutes grace -> reminder only
const MIN_PROOF_BYTES = 45 * 1024;
const MIN_PROOF_WIDTH = 480;
const MIN_PROOF_HEIGHT = 480;
const MIN_PROOF_BRIGHTNESS_VARIANCE = 180;
const MAX_STORED_PROOF_HASHES = 25;
const PENALTY_CLIPS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
];

const authSection = document.getElementById("authSection");
const setupSection = document.getElementById("setupSection");
const dashboardSection = document.getElementById("dashboardSection");
const welcomeText = document.getElementById("welcomeText");
const editSetupBtn = document.getElementById("editSetupBtn");
const logoutBtn = document.getElementById("logoutBtn");
const lockOverlay = document.getElementById("lockOverlay");
const lockReasonText = document.getElementById("lockReasonText");
const lockMissionTiles = document.getElementById("lockMissionTiles");
const lockMissionValue = document.getElementById("lockMissionValue");
const lockPhotoInput = document.getElementById("lockPhotoInput");
const unlockWithProofBtn = document.getElementById("unlockWithProofBtn");
const lockErrorText = document.getElementById("lockErrorText");
const sansFightTriggerBtn = document.getElementById("sansFightTriggerBtn");
const sansFightPanel = document.getElementById("sansFightPanel");
const sansFightStatsText = document.getElementById("sansFightStatsText");
const sansFightResultText = document.getElementById("sansFightResultText");
const sansFightBtn = document.getElementById("sansFightBtn");
const sansActBtn = document.getElementById("sansActBtn");
const sansItemBtn = document.getElementById("sansItemBtn");
const sansMercyBtn = document.getElementById("sansMercyBtn");
const lockPenaltyPanel = document.getElementById("lockPenaltyPanel");
const lockRecoveryPanel = document.getElementById("lockRecoveryPanel");
const penaltyCountdown = document.getElementById("penaltyCountdown");
const penaltyVideo = document.getElementById("penaltyVideo");

const focusOverlay = document.getElementById("focusOverlay");
const focusTimerText = document.getElementById("focusTimerText");
const focusCancelBtn = document.getElementById("focusCancelBtn");
const coachCard = document.getElementById("coachCard");
const coachActionText = document.getElementById("coachActionText");
const startFocus10Btn = document.getElementById("startFocus10Btn");
const startFocus25Btn = document.getElementById("startFocus25Btn");

const authForm = document.getElementById("authForm");
const setupForm = document.getElementById("setupForm");
const usageForm = document.getElementById("usageForm");
const goalPresetTiles = document.getElementById("goalPresetTiles");
const timePresetTiles = document.getElementById("timePresetTiles");
const lessonPath = document.getElementById("lessonPath");

const goalNoteText = document.getElementById("goalNoteText");
const targetScreenText = document.getElementById("targetScreenText");
const currentScreenText = document.getElementById("currentScreenText");
const rewardSummaryText = document.getElementById("rewardSummaryText");
const scoreText = document.getElementById("scoreText");
const scoreBar = document.getElementById("scoreBar");
const rewardStatusText = document.getElementById("rewardStatusText");
const unlockRewardBtn = document.getElementById("unlockRewardBtn");
const rewardActionText = document.getElementById("rewardActionText");
const gentleReminderText = document.getElementById("gentleReminderText");
const topMotivationBanner = document.getElementById("topMotivationBanner");
const topMotivationBannerText = document.getElementById("topMotivationBannerText");
const topDisturbingFactsList = document.getElementById("topDisturbingFactsList");

let isEditingSetup = false;
let lockTickId = null;
let focusTickId = null;

/** wait | quiz | read — escape path without finishing the video timer */
let penaltyUiMode = "wait";
let lastLockStartedAt = null;
let lastHistoryPushForLock = null;
let currentQuizQuestions = [];
let quizIndex = 0;
let lockNavHooked = false;
let topMotivationIndex = null;
let readUnlockedAt = 0;
let readCheatMode = false;
let sansFightActive = false;
let sansRounds = 0;
let sansDeaths = 0;
let sansHp = 92;
let sansKr = 0;

const MOTIVATION_LINES = {
  under: [
    "You're below your limit today. Keep that momentum.",
    "Small wins repeat into big change. Today is proof.",
    "You are training focus, not chasing perfection.",
    "Every minute saved is time returned to your real life.",
  ],
  over: [
    "You are not behind. You are one decision away from reset.",
    "The next 10 minutes can still change how this day ends.",
    "The goal is progress, not guilt. Make one clean choice now.",
    "Even after a slip, one phone-down block rebuilds control.",
  ],
};

const GENTLE_DISTURBING_FACTS = [
  "Many people pick up their phone without deciding first. Habit can quietly run your day.",
  "Blue light late at night can delay sleep, which makes tomorrow feel harder than it should.",
  "Endless scrolling feels restful, but often leaves your brain more tired afterward.",
  "Frequent app switching trains shorter attention bursts and makes deep focus feel uncomfortable.",
  "A few extra screen hours each day can quietly erase weeks of reading, training, or real conversations over a year.",
  "Notifications create mini stress spikes, even when you ignore them.",
  "Posture from long phone sessions can add neck and shoulder strain you only notice later.",
  "Most feeds are designed to keep you there, not to help you leave on time.",
];

function getState() {
  const rawHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]");
  const history = rawHistory.map((h) => ({
    ...h,
    loggedAt: typeof h.loggedAt === "number" ? h.loggedAt : 0,
  }));
  return {
    user: JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "null"),
    settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "null"),
    history,
    lockState: JSON.parse(localStorage.getItem(STORAGE_KEYS.lockState) || "null"),
  };
}

function saveState(partial) {
  if (partial.user !== undefined) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(partial.user));
  if (partial.settings !== undefined)
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(partial.settings));
  if (partial.history !== undefined)
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(partial.history));
  if (partial.lockState !== undefined)
    localStorage.setItem(STORAGE_KEYS.lockState, JSON.stringify(partial.lockState));
}

function getDailyLessons() {
  const t = todayLabel();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.dailyLessons);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed.date !== t) {
      return {
        date: t,
        focusPick: null,
        breakPick: null,
        windDown: null,
        rewardClaimed: false,
        unlimitedToday: false,
      };
    }
    return {
      date: t,
      focusPick: parsed.focusPick ?? null,
      breakPick: parsed.breakPick ?? null,
      windDown: parsed.windDown ?? null,
      rewardClaimed: Boolean(parsed.rewardClaimed),
      unlimitedToday: Boolean(parsed.unlimitedToday),
    };
  } catch {
    return { date: t, focusPick: null, breakPick: null, windDown: null, rewardClaimed: false, unlimitedToday: false };
  }
}

function saveDailyLessons(partial) {
  const next = { ...getDailyLessons(), ...partial, date: todayLabel() };
  localStorage.setItem(STORAGE_KEYS.dailyLessons, JSON.stringify(next));
}

function getProofHashes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.proofHashes);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveProofHashes(nextHashes) {
  const safe = Array.isArray(nextHashes) ? nextHashes.slice(0, MAX_STORED_PROOF_HASHES) : [];
  localStorage.setItem(STORAGE_KEYS.proofHashes, JSON.stringify(safe));
}

function rememberProofHash(hash) {
  const next = [hash, ...getProofHashes().filter((h) => h !== hash)].slice(0, MAX_STORED_PROOF_HASHES);
  saveProofHashes(next);
}

function bytesToHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashFile(file) {
  const arr = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", arr);
  return bytesToHex(digest);
}

function loadImageElementFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be read."));
    };
    img.src = url;
  });
}

function calcBrightnessVariance(img) {
  const sampleW = 96;
  const sampleH = 96;
  const canvas = document.createElement("canvas");
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;
  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
  const values = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    values.push((r * 299 + g * 587 + b * 114) / 1000);
  }
  if (!values.length) return 0;
  const mean = values.reduce((a, n) => a + n, 0) / values.length;
  const variance = values.reduce((a, n) => a + (n - mean) ** 2, 0) / values.length;
  return variance;
}

async function validateProofPhoto(file) {
  if (!file) return { ok: false, reason: "Upload a mission photo to unlock." };
  if (!String(file.type || "").startsWith("image/")) {
    return { ok: false, reason: "Proof must be an image file." };
  }
  if (file.size < MIN_PROOF_BYTES) {
    return { ok: false, reason: "Photo is too small. Take a clearer proof photo." };
  }

  let img;
  try {
    img = await loadImageElementFromFile(file);
  } catch {
    return { ok: false, reason: "Could not read that image. Try another photo." };
  }

  if (img.naturalWidth < MIN_PROOF_WIDTH || img.naturalHeight < MIN_PROOF_HEIGHT) {
    return { ok: false, reason: "Photo resolution is too low. Use a full-size image." };
  }

  const variance = calcBrightnessVariance(img);
  if (variance < MIN_PROOF_BRIGHTNESS_VARIANCE) {
    return { ok: false, reason: "Photo looks blank/flat. Show clear mission evidence." };
  }

  const hash = await hashFile(file);
  if (getProofHashes().includes(hash)) {
    return { ok: false, reason: "That exact photo was already used before. Take a new one." };
  }

  return { ok: true, hash };
}

function migrateLockState(lockState) {
  if (!lockState?.active) return lockState;
  if (lockState.penaltyEndsAt) return lockState;
  const next = { ...lockState, penaltyEndsAt: Date.now() + PENALTY_MS };
  saveState({ lockState: next });
  return next;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normAns(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function buildQuizQuestionList() {
  const mathPool = [];
  for (let i = 0; i < 10; i += 1) {
    const a = randInt(4, 18);
    const b = randInt(4, 18);
    const sum = a + b;
    mathPool.push({
      kind: "math",
      text: `What is ${a} + ${b}? (answer with the number)`,
      ok: (raw) => {
        const n = parseInt(String(raw).trim().replace(/\s/g, ""), 10);
        return Number.isFinite(n) && n === sum;
      },
    });
  }
  const mulA = randInt(5, 12);
  const mulB = randInt(2, 9);
  const prod = mulA * mulB;
  mathPool.push({
    kind: "math",
    text: `What is ${mulA} × ${mulB}? (number only)`,
    ok: (raw) => {
      const n = parseInt(String(raw).trim(), 10);
      return Number.isFinite(n) && n === prod;
    },
  });
  shuffleInPlace(mathPool);

  const colorPool = [
    { kind: "color", text: "What color is a ripe banana?", ok: (raw) => normAns(raw).includes("yellow") || normAns(raw).includes("gold") },
    { kind: "color", text: "What color is snow?", ok: (raw) => normAns(raw).includes("white") },
    { kind: "color", text: "What color are most stop signs?", ok: (raw) => normAns(raw).includes("red") },
    { kind: "color", text: "What color is the sky on a clear afternoon?", ok: (raw) => normAns(raw).includes("blue") },
    { kind: "color", text: "What color do most people call healthy grass?", ok: (raw) => normAns(raw).includes("green") },
    { kind: "color", text: "What color is charcoal usually shown as?", ok: (raw) => normAns(raw).includes("black") },
    { kind: "color", text: "What color are school-bus warning signs usually?", ok: (raw) => normAns(raw).includes("yellow") },
    { kind: "color", text: "What color is a classic orange fruit called 'orange'?", ok: (raw) => normAns(raw).includes("orange") },
  ];
  shuffleInPlace(colorPool);

  const simplePool = [
    { kind: "simple", text: "How many minutes are in one hour?", ok: (raw) => ["60", "sixty"].includes(normAns(raw)) },
    { kind: "simple", text: "How many sides does a triangle have?", ok: (raw) => ["3", "three"].includes(normAns(raw)) },
    { kind: "simple", text: "How many days are in one week?", ok: (raw) => ["7", "seven"].includes(normAns(raw)) },
    { kind: "simple", text: "How many hours are in one day?", ok: (raw) => ["24", "twenty four", "twenty-four"].includes(normAns(raw)) },
    { kind: "simple", text: "How many letters are in the word 'focus'?", ok: (raw) => ["5", "five"].includes(normAns(raw)) },
    { kind: "simple", text: "How many months are in one year?", ok: (raw) => ["12", "twelve"].includes(normAns(raw)) },
    { kind: "simple", text: "How many legs does a standard chair usually have?", ok: (raw) => ["4", "four"].includes(normAns(raw)) },
    { kind: "simple", text: "How many minutes are in half an hour?", ok: (raw) => ["30", "thirty"].includes(normAns(raw)) },
  ];
  shuffleInPlace(simplePool);

  const reflectionPool = [
    {
      kind: "reflection",
      text: "What feeling do you want to protect in your next hour? (Type at least two characters.)",
      ok: (raw) => normAns(raw).length >= 2,
    },
    {
      kind: "reflection",
      text: "What is one offline action you will do right after unlocking? (Type at least two characters.)",
      ok: (raw) => normAns(raw).length >= 2,
    },
    {
      kind: "reflection",
      text: "What boundary will you keep for the next 30 minutes? (Type at least two characters.)",
      ok: (raw) => normAns(raw).length >= 2,
    },
    {
      kind: "reflection",
      text: "Name one person you want to be more present with today. (Type at least two characters.)",
      ok: (raw) => normAns(raw).length >= 2,
    },
    {
      kind: "reflection",
      text: "What tiny task would make tonight feel better? (Type at least two characters.)",
      ok: (raw) => normAns(raw).length >= 2,
    },
  ];
  shuffleInPlace(reflectionPool);

  const hardPool = [
    {
      kind: "hard",
      text: "Impossible hard mode: Solve an unsolved math problem in one line.",
      ok: (raw) => normAns(raw).length >= 1,
    },
    {
      kind: "hard",
      text: "Impossible hard mode: Prove you can divide by zero safely.",
      ok: (raw) => normAns(raw).length >= 1,
    },
    {
      kind: "hard",
      text: "Impossible hard mode: Write a perfect answer to a question with no answer.",
      ok: (raw) => normAns(raw).length >= 1,
    },
    {
      kind: "hard",
      text: "Impossible hard mode: Outsmart this prompt in one attempt.",
      ok: (raw) => normAns(raw).length >= 1,
    },
    {
      kind: "hard",
      text: "Impossible hard mode: Explain time travel paradoxes in one sentence.",
      ok: (raw) => normAns(raw).length >= 1,
    },
    {
      kind: "hard",
      text: "Impossible hard mode: Predict the next random number exactly.",
      ok: (raw) => normAns(raw).length >= 1,
    },
  ];
  shuffleInPlace(hardPool);

  const finalList = [
    ...mathPool.slice(0, 4),
    ...colorPool.slice(0, 2),
    ...simplePool.slice(0, 3),
    reflectionPool[0],
    hardPool[0],
  ];
  shuffleInPlace(finalList);
  return finalList;
}

function setPenaltySubviewsForMode() {
  const w = document.getElementById("penaltyWaitMode");
  const q = document.getElementById("penaltyQuizMode");
  const r = document.getElementById("penaltyReadMode");
  if (!w || !q || !r) return;
  w.classList.toggle("hidden", penaltyUiMode !== "wait");
  q.classList.toggle("hidden", penaltyUiMode !== "quiz");
  r.classList.toggle("hidden", penaltyUiMode !== "read");
}

function setPenaltyClipForCurrentLock(lockState) {
  if (!penaltyVideo || !lockState?.startedAt) return;
  const idx = Math.abs(lockState.startedAt) % PENALTY_CLIPS.length;
  const nextSrc = PENALTY_CLIPS[idx];
  const sourceEl = penaltyVideo.querySelector("source");
  if (!sourceEl) return;
  if (sourceEl.src === nextSrc || sourceEl.getAttribute("src") === nextSrc) return;
  sourceEl.setAttribute("src", nextSrc);
  penaltyVideo.dataset.loadedOnce = "";
  penaltyVideo.currentTime = 0;
}

function initPenaltyForLock(lockState) {
  if (!lockState?.active || !lockState.startedAt) return;
  setPenaltyClipForCurrentLock(lockState);
  if (lastLockStartedAt === lockState.startedAt) {
    setPenaltySubviewsForMode();
    if (penaltyUiMode === "read") updateReadGateUi();
    return;
  }
  lastLockStartedAt = lockState.startedAt;
  penaltyUiMode = "wait";
  quizIndex = 0;
  currentQuizQuestions = buildQuizQuestionList();
  readUnlockedAt = 0;
  readCheatMode = false;
  const cheatWrap = document.getElementById("readCheatWrap");
  if (cheatWrap) cheatWrap.classList.add("hidden");
  const checks = document.getElementById("readCheatChecks");
  if (checks) checks.innerHTML = "";
  const chk = document.getElementById("reflectReadCheckbox");
  const rBtn = document.getElementById("reflectContinueBtn");
  if (chk) chk.checked = false;
  if (rBtn) rBtn.disabled = true;
  const inp = document.getElementById("quizAnswerInput");
  if (inp) inp.value = "";
  const qe = document.getElementById("quizErrorText");
  if (qe) qe.textContent = "";
  setPenaltySubviewsForMode();
  if (lastHistoryPushForLock !== lockState.startedAt) {
    history.pushState({ focusFrogLock: 1 }, "", location.href);
    lastHistoryPushForLock = lockState.startedAt;
  }
  if (!lockNavHooked) {
    lockNavHooked = true;
    window.addEventListener("popstate", () => {
      if (getState().lockState?.active) history.pushState({ focusFrogLock: 1 }, "", location.href);
    });
  }
}

function renderQuizStep() {
  const prog = document.getElementById("quizProgress");
  const qt = document.getElementById("quizQuestionText");
  const err = document.getElementById("quizErrorText");
  const inp = document.getElementById("quizAnswerInput");
  if (!prog || !qt || !currentQuizQuestions.length) return;
  err.textContent = "";
  if (inp) inp.value = "";
  prog.textContent = `Question ${quizIndex + 1} of 10`;
  qt.textContent = currentQuizQuestions[quizIndex].text;
  inp?.focus();
}

function finishPenaltyToRecovery() {
  penaltyUiMode = "wait";
  const ls = getState().lockState;
  if (!ls?.active) return;
  saveState({ lockState: { ...ls, penaltyEndsAt: Date.now() } });
  updateLockPenaltyUi(getState().lockState);
}

function ensureReadCheatChecks() {
  const wrap = document.getElementById("readCheatChecks");
  if (!wrap || wrap.children.length) return;
  for (let i = 1; i <= 20; i += 1) {
    const label = document.createElement("label");
    label.className = "read-confirm";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "read-cheat-box";
    label.appendChild(input);
    label.append(`I read the whole thing (${i}/20)`);
    wrap.appendChild(label);
  }
}

function readCheatBoxesAllChecked() {
  const boxes = document.querySelectorAll("#readCheatChecks .read-cheat-box");
  if (!boxes.length) return false;
  return [...boxes].every((b) => b.checked);
}

function readCheatCheckedCount() {
  const boxes = document.querySelectorAll("#readCheatChecks .read-cheat-box");
  if (!boxes.length) return 0;
  return [...boxes].filter((b) => b.checked).length;
}

function updateReadGateUi() {
  const btn = document.getElementById("reflectContinueBtn");
  const hint = document.getElementById("readGateHintText");
  const cheatWrap = document.getElementById("readCheatWrap");
  const readCheck = document.getElementById("reflectReadCheckbox");
  if (!btn) return;
  if (!readCheatMode) {
    if (hint) hint.textContent = "Tick the box when you are done reading.";
    if (cheatWrap) cheatWrap.classList.add("hidden");
    btn.disabled = !readCheck?.checked;
    return;
  }
  ensureReadCheatChecks();
  const done = readCheatCheckedCount();
  if (hint) hint.textContent = `Too fast. Complete all 20 checks (${done}/20).`;
  if (cheatWrap) cheatWrap.classList.remove("hidden");
  btn.disabled = false;
}

function showRecoveryFromPenalty() {
  lockPenaltyPanel?.classList.add("hidden");
  lockRecoveryPanel?.classList.remove("hidden");
  if (penaltyVideo) penaltyVideo.pause();
}

function refreshSansFightUi() {
  if (sansFightPanel) sansFightPanel.classList.toggle("hidden", !sansFightActive);
  if (sansFightPanel) sansFightPanel.classList.toggle("sans-fight--active", sansFightActive);
  if (sansFightStatsText) {
    sansFightStatsText.textContent = `Turn: ${sansRounds}/5 · HP: ${sansHp} · KR: ${sansKr} · Deaths: ${sansDeaths}`;
  }
}

function sansDamageForAction(action) {
  const patterns = [
    { name: "Bone wall", base: 22 },
    { name: "Blue bone jump", base: 18 },
    { name: "Gaster blaster", base: 28 },
    { name: "Platform sweep", base: 20 },
  ];
  const pat = patterns[Math.floor(Math.random() * patterns.length)];
  let dmg = pat.base;
  if (action === "fight") dmg += 8;
  if (action === "act") dmg -= 2;
  if (action === "item") dmg -= 10;
  if (action === "mercy") dmg += 10;
  if (action === "item") {
    sansHp = Math.min(92, sansHp + 16);
  }
  const dodgeRoll = Math.random();
  if (dodgeRoll > 0.72) dmg = Math.max(1, Math.floor(dmg * 0.35));
  dmg = Math.max(1, dmg);
  return { dmg, pattern: pat.name, partialDodge: dodgeRoll > 0.72 };
}

function applySansKrTick() {
  if (sansKr <= 0) return 0;
  const bleed = Math.min(6, sansKr);
  sansKr -= bleed;
  sansHp = Math.max(0, sansHp - bleed);
  return bleed;
}

function playSansTurn(action) {
  if (!sansFightActive || sansRounds >= 5) return;
  const { dmg, pattern, partialDodge } = sansDamageForAction(action);
  if (sansFightPanel) {
    sansFightPanel.classList.remove("sans-fight--hit");
    void sansFightPanel.offsetWidth;
    sansFightPanel.classList.add("sans-fight--hit");
  }
  sansHp = Math.max(0, sansHp - dmg);
  sansKr = Math.min(40, sansKr + Math.ceil(dmg / 3));
  const krBleed = applySansKrTick();

  sansRounds += 1;
  if (sansHp <= 0) {
    sansDeaths += 1;
    sansHp = 92;
    sansKr = 0;
    if (sansFightResultText) {
      sansFightResultText.textContent = `${pattern} hit hard. You died (${sansDeaths}/5).`;
    }
  } else if (sansFightResultText) {
    const dodgeText = partialDodge ? "Partial dodge." : "No dodge.";
    sansFightResultText.textContent = `${pattern}: -${dmg} HP, KR bleed -${krBleed}. ${dodgeText}`;
  }
  if (sansFightPanel) {
    sansFightPanel.classList.toggle("sans-fight--warn", sansHp <= 28);
  }

  refreshSansFightUi();
}

function showPenaltyShell() {
  lockPenaltyPanel?.classList.remove("hidden");
  lockRecoveryPanel?.classList.add("hidden");
}

function formatPenaltyClock(ms) {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function clearLockTick() {
  if (lockTickId) {
    clearInterval(lockTickId);
    lockTickId = null;
  }
}

function updateLockPenaltyUi(lockState) {
  if (!lockPenaltyPanel || !lockRecoveryPanel || !penaltyCountdown) return;
  const end = lockState?.penaltyEndsAt || 0;
  const remaining = Math.max(0, end - Date.now());
  penaltyCountdown.textContent = formatPenaltyClock(remaining);
  const inGauntlet = penaltyUiMode === "quiz" || penaltyUiMode === "read";
  const sw = document.getElementById("switchToQuizBtn");
  if (sw) sw.disabled = remaining <= 0 || penaltyUiMode !== "wait";

  if (remaining <= 0 && !inGauntlet) {
    showRecoveryFromPenalty();
    return;
  }

  showPenaltyShell();
  setPenaltySubviewsForMode();
  if (penaltyUiMode === "read") updateReadGateUi();

  if (penaltyUiMode === "wait" && remaining > 0 && penaltyVideo && !document.hidden) {
    penaltyVideo.muted = true;
    penaltyVideo.autoplay = true;
    penaltyVideo.playbackRate = 1.15;
    if (!penaltyVideo.dataset.loadedOnce) {
      penaltyVideo.load();
      penaltyVideo.dataset.loadedOnce = "1";
    }
    penaltyVideo.play?.().catch(() => {});
  } else if (penaltyVideo) {
    penaltyVideo.pause();
  }
}

function submitQuizAnswer() {
  const inp = document.getElementById("quizAnswerInput");
  const err = document.getElementById("quizErrorText");
  if (!inp || !currentQuizQuestions.length || !currentQuizQuestions[quizIndex]) return;
  const q = currentQuizQuestions[quizIndex];
  if (!q.ok(inp.value)) {
    if (err) err.textContent = "Nope—try again.";
    return;
  }
  if (err) err.textContent = "";
  quizIndex += 1;
  if (quizIndex >= 10) {
    penaltyUiMode = "read";
    readUnlockedAt = Date.now() + 10 * 1000;
    readCheatMode = false;
    const cheatWrap = document.getElementById("readCheatWrap");
    if (cheatWrap) cheatWrap.classList.add("hidden");
    const checks = document.getElementById("readCheatChecks");
    if (checks) checks.innerHTML = "";
    setPenaltySubviewsForMode();
    updateReadGateUi();
  } else {
    renderQuizStep();
  }
}

function beginQuizGauntlet() {
  const { lockState } = getState();
  const end = lockState?.penaltyEndsAt || 0;
  if (!lockState?.active || Date.now() >= end) return;
  penaltyUiMode = "quiz";
  quizIndex = 0;
  setPenaltySubviewsForMode();
  if (penaltyVideo) penaltyVideo.pause();
  renderQuizStep();
}

function startLockTick() {
  if (lockTickId) return;
  lockTickId = setInterval(() => {
    const { lockState } = getState();
    if (!lockState?.active) {
      clearLockTick();
      return;
    }
    updateLockPenaltyUi(lockState);
  }, 500);
}

function clearFocusTick() {
  if (focusTickId) {
    clearInterval(focusTickId);
    focusTickId = null;
  }
}

function syncFocusOverlay() {
  if (!focusOverlay || !focusTimerText) return;
  const raw = sessionStorage.getItem(FOCUS_SESSION_KEY);
  const until = raw ? Number(raw) : 0;
  if (!until || Number.isNaN(until) || Date.now() >= until) {
    focusOverlay.classList.add("hidden");
    if (until && !Number.isNaN(until) && Date.now() >= until) sessionStorage.removeItem(FOCUS_SESSION_KEY);
    clearFocusTick();
    return;
  }
  focusOverlay.classList.remove("hidden");
  const sec = Math.max(0, Math.ceil((until - Date.now()) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  focusTimerText.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  if (!focusTickId) {
    focusTickId = setInterval(() => {
      syncFocusOverlay();
    }, 1000);
  }
}

function startFocusMinutes(mins) {
  sessionStorage.setItem(FOCUS_SESSION_KEY, String(Date.now() + mins * 60 * 1000));
  syncFocusOverlay();
}

function renderCoach(s, latestToday, loggedToday) {
  if (!coachCard || !coachActionText) return;
  if (!loggedToday || !latestToday) {
    coachCard.classList.add("hidden");
    return;
  }
  coachCard.classList.remove("hidden");
  const over = latestToday.usage > s.targetScreenHours;
  if (over) {
    coachActionText.textContent = `Latest checkpoint is ${toHoursAndMinutes(latestToday.usage)} — over your ${toHoursAndMinutes(
      s.targetScreenHours
    )} target. Start a phone-down timer so today is not only numbers on a screen.`;
  } else {
    coachActionText.textContent = `Latest checkpoint is under ${toHoursAndMinutes(
      s.targetScreenHours
    )}. Still run a short phone-down timer—small reps train the habit more than one big promise.`;
  }
}

function pickN(arr, n, offset = 0) {
  if (!Array.isArray(arr) || !arr.length || n <= 0) return [];
  const out = [];
  for (let i = 0; i < n; i += 1) {
    out.push(arr[(offset + i) % arr.length]);
  }
  return out;
}

function buildMotivationModel(settings, latestToday, history) {
  const s = normalizeSettings(settings) || { targetScreenHours: 3, currentScreenHours: 4 };
  const usage = latestToday ? latestToday.usage : s.currentScreenHours;
  const safeUsage = Number.isFinite(usage) ? usage : s.currentScreenHours;
  const safeTarget = Number.isFinite(s.targetScreenHours) ? s.targetScreenHours : 3;
  const isOver = safeUsage > safeTarget;
  const bucket = isOver ? MOTIVATION_LINES.over : MOTIVATION_LINES.under;
  const daySeed = new Date().getDate() + Math.floor((safeUsage || 0) * 10);
  const line = bucket[daySeed % bucket.length];
  const todayLogs = getTodayLogsAscending(history).length;
  const factCount = Math.max(2, Math.min(4, 2 + Math.floor(todayLogs / 2)));
  const facts = pickN(GENTLE_DISTURBING_FACTS, factCount, daySeed % GENTLE_DISTURBING_FACTS.length);
  return { line, facts, daySeed, bucket };
}

function paintMotivationPanel(lineEl, factsEl, model, fixedCount = null) {
  if (!lineEl || !factsEl || !model) return;
  lineEl.textContent = model.line;
  const facts = fixedCount
    ? pickN(GENTLE_DISTURBING_FACTS, fixedCount, model.daySeed % GENTLE_DISTURBING_FACTS.length)
    : model.facts;

  factsEl.innerHTML = "";
  facts.forEach((fact) => {
    const li = document.createElement("li");
    li.textContent = fact;
    factsEl.appendChild(li);
  });
}

function renderMotivationPanel(settings, latestToday, history) {
  const model = buildMotivationModel(settings, latestToday, history);
  if (topMotivationBannerText) {
    if (topMotivationIndex === null) topMotivationIndex = model.daySeed % model.bucket.length;
    topMotivationBannerText.textContent = model.bucket[topMotivationIndex % model.bucket.length];
  }
  if (topDisturbingFactsList) {
    const facts = pickN(GENTLE_DISTURBING_FACTS, 3, model.daySeed % GENTLE_DISTURBING_FACTS.length);
    topDisturbingFactsList.innerHTML = "";
    facts.forEach((fact) => {
      const li = document.createElement("li");
      li.textContent = fact;
      topDisturbingFactsList.appendChild(li);
    });
  }
}

function normalizeSettings(raw) {
  if (!raw) return null;
  const s = { ...raw };
  const avg = Number(s.averageHours);
  const hasTarget = Number.isFinite(s.targetScreenHours) && s.targetScreenHours > 0;
  const hasCurrent = Number.isFinite(s.currentScreenHours) && s.currentScreenHours >= 0;
  if (!hasTarget) {
    s.targetScreenHours = Number.isFinite(avg) && avg > 0 ? Number((avg * 0.9).toFixed(2)) : 3;
  }
  if (!hasCurrent) {
    s.currentScreenHours = Number.isFinite(avg) && avg > 0 ? avg : s.targetScreenHours;
  }
  s.mainGoal = String(s.mainGoal || "").trim();
  s.rewardAction = String(s.rewardAction || "").trim();
  return s;
}

function toHoursAndMinutes(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function parseTimeToHours(input) {
  const raw = String(input || "")
    .trim()
    .toLowerCase()
    .replace(/hours?/g, "h")
    .replace(/hrs?/g, "h")
    .replace(/minutes?/g, "m")
    .replace(/mins?/g, "m")
    .replace(/\s+/g, " ");
  if (!raw) return NaN;

  if (/^\d+(\.\d+)?$/.test(raw)) {
    return Number(raw);
  }

  const colonMatch = raw.match(/^(\d{1,2}):(\d{1,2})$/);
  if (colonMatch) {
    const h = Number(colonMatch[1]);
    const m = Number(colonMatch[2]);
    if (m >= 60) return NaN;
    return h + m / 60;
  }

  const hourMatch = raw.match(/(\d+(?:\.\d+)?)\s*h/);
  const minuteMatch = raw.match(/(\d+(?:\.\d+)?)\s*m/);
  if (hourMatch || minuteMatch) {
    const h = hourMatch ? Number(hourMatch[1]) : 0;
    const m = minuteMatch ? Number(minuteMatch[1]) : 0;
    if (m >= 60 && !hourMatch) return NaN;
    return h + m / 60;
  }

  return NaN;
}

function titleizeGoal(goal) {
  const text = String(goal || "").trim();
  if (!text) return "";
  const t = text.charAt(0).toUpperCase() + text.slice(1);
  return t.length > 140 ? `${t.slice(0, 140)}…` : t;
}

function dateKeyFromMs(ms) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayLabel() {
  return dateKeyFromMs(Date.now());
}

function isEntryOnDate(entry, dateKey) {
  if (entry && Number.isFinite(entry.loggedAt) && entry.loggedAt > 0) {
    return dateKeyFromMs(entry.loggedAt) === dateKey;
  }
  return entry?.date === dateKey;
}

function isEntryTodayStrict(entry) {
  return Boolean(entry && Number.isFinite(entry.loggedAt) && entry.loggedAt > 0 && dateKeyFromMs(entry.loggedAt) === todayLabel());
}

function getLatestEntryForToday(history) {
  const list = history.filter((h) => isEntryTodayStrict(h));
  if (!list.length) return null;
  return list.reduce((best, h) => ((h.loggedAt || 0) > (best.loggedAt || 0) ? h : best));
}

function getTodayLogsAscending(history) {
  return history.filter((h) => isEntryTodayStrict(h)).sort((a, b) => (a.loggedAt || 0) - (b.loggedAt || 0));
}

function getDailyMaxUsageForDate(history, dateStr) {
  const list = history.filter((h) => isEntryOnDate(h, dateStr));
  if (!list.length) return null;
  return list.reduce((sum, h) => sum + Number(h.usage || 0), 0);
}

function last7DateStrings() {
  const dates = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dates.push(dateKeyFromMs(d.getTime()));
  }
  return dates;
}

function addHistoryEntry(usage, goal, passed) {
  const { history } = getState();
  const entry = {
    date: todayLabel(),
    usage,
    goal,
    passed,
    loggedAt: Date.now(),
  };
  const next = [entry, ...history].slice(0, 200);
  saveState({ history: next });
}

function renderTodayTruthList(history) {
  const ul = document.getElementById("todayTruthList");
  if (!ul) return;
  ul.innerHTML = "";
  // User requested no running record shown in Today's screen time.
}

function renderWeekChart(history, goalHours) {
  const host = document.getElementById("weekChart");
  if (!host) return;
  const dates = last7DateStrings();
  const values = dates.map((d) => getDailyMaxUsageForDate(history, d) ?? 0);
  const yMax = Math.max(0.25, goalHours * 1.05, ...values) * 1.08;
  const W = 440;
  const H = 220;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 52;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = dates.length;
  const xAt = (i) => padL + (innerW * i) / (n - 1 || 1);
  const yAt = (v) => padT + innerH * (1 - Math.min(v, yMax) / yMax);
  const pts = values.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
  const goalY = yAt(goalHours);
  const shortLabels = dates.map((ds) => {
    const parts = ds.split("-");
    if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
    return ds.slice(0, 5);
  });
  const ticks = [0, yMax / 2, yMax].map((v) => `<text x="4" y="${(yAt(v) + 4).toFixed(0)}" class="chart-tick">${v.toFixed(1)}h</text>`);
  const labels = shortLabels
    .map(
      (lab, i) =>
        `<text x="${xAt(i).toFixed(1)}" y="${H - 18}" text-anchor="middle" class="chart-day">${lab}</text>`
    )
    .join("");
  host.innerHTML = `
<svg class="chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect class="chart-bg" x="0" y="0" width="${W}" height="${H}" rx="12" />
  <line class="chart-axis" x1="${padL}" y1="${padT + innerH}" x2="${W - padR}" y2="${padT + innerH}" />
  <line class="chart-goal" x1="${padL}" y1="${goalY.toFixed(1)}" x2="${W - padR}" y2="${goalY.toFixed(1)}" />
  <text x="${padL + 4}" y="${(goalY - 4).toFixed(0)}" class="chart-goal-label">Target</text>
  ${ticks.join("")}
  <polyline class="chart-line" fill="none" points="${pts}" />
  ${values
    .map(
      (v, i) =>
        `<circle class="chart-dot" cx="${xAt(i).toFixed(1)}" cy="${yAt(v).toFixed(1)}" r="5" />`
    )
    .join("")}
  ${labels}
</svg>`;
}

function lessonBonus(daily) {
  let b = 0;
  if (daily.focusPick) b += 4;
  if (daily.breakPick) b += 4;
  if (daily.windDown === "yes" || daily.windDown === "no") b += 4;
  return Math.min(12, b);
}

function getProgressScore(settings, latestTodayEntry, goalHours, daily) {
  const s = normalizeSettings(settings);
  const usage = latestTodayEntry ? latestTodayEntry.usage : s.currentScreenHours;
  if (!Number.isFinite(usage) || !Number.isFinite(goalHours) || goalHours <= 0) return 50;
  const ratio = usage / goalHours;
  let base;
  if (ratio <= 1) base = Math.round(68 + 20 * (1 - ratio));
  else base = Math.max(0, Math.round(68 - 55 * (ratio - 1)));
  return Math.max(0, Math.min(100, base + lessonBonus(daily)));
}

function fillSetupForm(settings) {
  const s = normalizeSettings(settings);
  document.getElementById("goalInput").value = s.mainGoal || "";
  document.getElementById("targetInput").value = toHoursAndMinutes(s.targetScreenHours);
  document.getElementById("currentInput").value = toHoursAndMinutes(s.currentScreenHours);
  document.getElementById("rewardInput").value = s.rewardAction || "";
}

function renderGoalPresets() {
  if (!goalPresetTiles) return;
  goalPresetTiles.innerHTML = "";
  GOAL_PRESETS.forEach((text) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lesson-chip lesson-chip--violet";
    b.textContent = text;
    b.addEventListener("click", () => {
      document.getElementById("goalInput").value = text;
    });
    goalPresetTiles.appendChild(b);
  });
}

function renderTimePresets() {
  if (!timePresetTiles) return;
  timePresetTiles.innerHTML = "";
  const input = document.getElementById("todayUsageInput");
  TIME_PRESETS.forEach(({ label, hours }) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lesson-chip lesson-chip--blue";
    b.textContent = label;
    b.addEventListener("click", () => {
      if (input) input.value = toHoursAndMinutes(hours);
    });
    timePresetTiles.appendChild(b);
  });
}

function renderLockMissionTiles() {
  if (!lockMissionTiles || !lockMissionValue) return;
  const current = lockMissionValue.value || MISSION_OPTIONS[0];
  lockMissionTiles.innerHTML = "";
  MISSION_OPTIONS.forEach((mission) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lesson-chip lesson-chip--coral";
    if (mission === current) b.classList.add("lesson-chip--selected");
    b.textContent = mission;
    b.addEventListener("click", () => {
      lockMissionValue.value = mission;
      renderLockMissionTiles();
    });
    lockMissionTiles.appendChild(b);
  });
}

function nodeClass(done, locked) {
  let c = "lesson-node";
  if (locked) c += " lesson-node--locked";
  else if (done) c += " lesson-node--done";
  else c += " lesson-node--open";
  return c;
}

function renderLessonPath(ctx) {
  if (!lessonPath) return;
  const { loggedToday, progressScore, daily } = ctx;

  const logDone = loggedToday;
  const focusDone = Boolean(daily.focusPick);
  const breakDone = Boolean(daily.breakPick);
  const windDone = daily.windDown === "yes" || daily.windDown === "no";
  const rewardLocked = progressScore < 80;
  const rewardDone = daily.rewardClaimed;

  lessonPath.innerHTML = "";

  const units = [
    {
      key: "log",
      icon: "📱",
      title: "Log screen time",
      subtitle: logDone ? "Nice—saved for today." : "Use Today's screen time above.",
      done: logDone,
      locked: false,
      picks: null,
    },
    {
      key: "focus",
      icon: "🎯",
      title: "Today's focus",
      subtitle: focusDone ? `You picked: ${daily.focusPick}` : "Choose one vibe.",
      done: focusDone,
      locked: false,
      picks: FOCUS_OPTIONS,
      pickKey: "focusPick",
    },
    {
      key: "break",
      icon: "⚡",
      title: "Offline break",
      subtitle: breakDone ? `You picked: ${daily.breakPick}` : "Pick a micro-break.",
      done: breakDone,
      locked: false,
      picks: BREAK_OPTIONS,
      pickKey: "breakPick",
    },
    {
      key: "wind",
      icon: "🌙",
      title: "Wind-down plan",
      subtitle:
        windDone && daily.windDown === "yes"
          ? "Phone away early—locked in."
          : windDone
            ? "You skipped wind-down tonight."
            : "Tell the frog your plan.",
      done: windDone,
      locked: false,
      picks: WIND_OPTIONS.map((o) => o.label),
      pickKey: "windDown",
      windValues: WIND_OPTIONS,
    },
    {
      key: "reward",
      icon: "🏆",
      title: "Reward chest",
      subtitle: rewardLocked
        ? `Score ${progressScore}% — need 80%.`
        : rewardDone
          ? "Opened today."
          : "Claim in the card below.",
      done: rewardDone,
      locked: rewardLocked,
      picks: null,
    },
  ];

  units.forEach((u, i) => {
    const wrap = document.createElement("div");
    wrap.className = "lesson-unit";

    const connector = document.createElement("div");
    connector.className = "lesson-connector" + (i === 0 ? " lesson-connector--hidden" : "");
    connector.setAttribute("aria-hidden", "true");
    wrap.appendChild(connector);

    const node = document.createElement("div");
    node.className = nodeClass(u.done, u.locked);
    node.innerHTML = `<span class="lesson-node__icon">${u.icon}</span><span class="lesson-node__title">${u.title}</span><span class="lesson-node__sub">${u.subtitle}</span>`;
    wrap.appendChild(node);

    if (u.picks && !u.locked && !u.done) {
      const row = document.createElement("div");
      row.className = "lesson-chip-row lesson-chip-row--wrap lesson-chip-row--nest";
      u.picks.forEach((label, j) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "lesson-chip lesson-chip--gold";
        b.textContent = label;
        b.addEventListener("click", () => {
          if (u.pickKey === "windDown") {
            const val = u.windValues[j].value;
            saveDailyLessons({ windDown: val });
          } else if (u.pickKey === "focusPick") {
            saveDailyLessons({ focusPick: label });
          } else if (u.pickKey === "breakPick") {
            saveDailyLessons({ breakPick: label });
          }
          renderApp();
        });
        row.appendChild(b);
      });
      wrap.appendChild(row);
    }

    lessonPath.appendChild(wrap);
  });
}

function renderDashboard() {
  const { settings, history } = getState();
  const s = normalizeSettings(settings);
  const latestToday = getLatestEntryForToday(history);
  const loggedToday = Boolean(latestToday);
  const todayUsage = loggedToday ? getTodayLogsAscending(history).reduce((sum, h) => sum + Number(h.usage || 0), 0) : null;
  const goalHours = s.targetScreenHours;
  const daily = getDailyLessons();
  const progressScore = getProgressScore(s, latestToday, goalHours, daily);

  goalNoteText.textContent = titleizeGoal(s.mainGoal) || "Add your goal with Edit My Goal.";
  targetScreenText.textContent = toHoursAndMinutes(goalHours);
  const nCheck = getTodayLogsAscending(history).length;
  currentScreenText.textContent = loggedToday
    ? `${toHoursAndMinutes(todayUsage)} · total today${nCheck > 1 ? ` (${nCheck} sections)` : ""}`
    : `${toHoursAndMinutes(s.currentScreenHours)} · typical (add checkpoints below)`;
  rewardSummaryText.textContent = s.rewardAction || "—";
  if (gentleReminderText) gentleReminderText.textContent = "";

  scoreText.textContent = `Score: ${progressScore}%`;
  scoreBar.style.width = `${progressScore}%`;

  if (progressScore >= 80) {
    unlockRewardBtn.disabled = false;
    rewardStatusText.textContent = "Unlocked! You can claim your reward.";
    if (!daily.unlimitedToday) saveDailyLessons({ unlimitedToday: true });
  } else {
    unlockRewardBtn.disabled = true;
    rewardStatusText.textContent = "Reach 80% score to unlock your reward.";
    rewardActionText.textContent = "";
  }

  renderTimePresets();
  renderWeekChart(history, goalHours);
  renderTodayTruthList(history);
  renderLessonPath({ loggedToday, progressScore, daily });
  renderMotivationPanel(s, latestToday, history);
  renderCoach(s, latestToday, loggedToday);

  let { lockState } = getState();
  const usageForLock = loggedToday ? todayUsage : s.currentScreenHours;
  const shouldAutoLock =
    !daily.unlimitedToday &&
    Number.isFinite(goalHours) &&
    goalHours > 0 &&
    Number.isFinite(usageForLock) &&
    usageForLock > goalHours + 1e-9;

  // Auto-run punishments any time you're over the goal (even after refresh).
  if (shouldAutoLock && !lockState?.active) {
    const requiredMission = MISSION_OPTIONS[Math.floor(Math.random() * MISSION_OPTIONS.length)];
    lockState = {
      active: true,
      startedAt: Date.now(),
      penaltyEndsAt: Date.now() + PENALTY_MS,
      requiredMission,
    };
    saveState({ lockState });
  } else if (!shouldAutoLock && lockState?.active) {
    lockState = { active: false };
    saveState({ lockState });
  }
  if (lockState?.active) lockState = migrateLockState(lockState);
  document.body.classList.toggle("lock-active", Boolean(lockState?.active));
  if (lockState?.active) {
    lockOverlay.classList.remove("hidden");
    lockReasonText.textContent = `You are ${toHoursAndMinutes(
      Math.max(0, usageForLock - goalHours)
    )} over today’s ${toHoursAndMinutes(goalHours)} target.`;
    if (lockState.requiredMission) lockMissionValue.value = lockState.requiredMission;
    renderLockMissionTiles();
    initPenaltyForLock(lockState);
    updateLockPenaltyUi(lockState);
    startLockTick();
  } else {
    clearLockTick();
    lockOverlay.classList.add("hidden");
    lockErrorText.textContent = "";
    sansFightActive = false;
    sansRounds = 0;
    sansDeaths = 0;
    sansHp = 92;
    sansKr = 0;
    if (sansFightResultText) sansFightResultText.textContent = "";
    refreshSansFightUi();
    penaltyUiMode = "wait";
    lastLockStartedAt = null;
    lastHistoryPushForLock = null;
    setPenaltySubviewsForMode();
    lockPenaltyPanel?.classList.remove("hidden");
    lockRecoveryPanel?.classList.add("hidden");
    if (penaltyVideo) {
      penaltyVideo.pause();
      penaltyVideo.currentTime = 0;
    }
  }

  syncFocusOverlay();
}

function renderApp() {
  const { user, settings, history } = getState();
  const isLoggedIn = Boolean(user);
  const hasSetup = Boolean(settings);
  const latestToday = getLatestEntryForToday(history);

  authSection.classList.toggle("hidden", isLoggedIn);
  setupSection.classList.toggle("hidden", !isLoggedIn || (hasSetup && !isEditingSetup));
  dashboardSection.classList.toggle("hidden", !isLoggedIn || !hasSetup);
  editSetupBtn.classList.toggle("hidden", !isLoggedIn || !hasSetup);
  logoutBtn.classList.toggle("hidden", !isLoggedIn);
  welcomeText.textContent = isLoggedIn ? `Hi, ${user.name}` : "";

  if (isLoggedIn && (!hasSetup || isEditingSetup)) {
    renderGoalPresets();
  }

  if (isLoggedIn && hasSetup) {
    if (isEditingSetup) fillSetupForm(settings);
    renderDashboard();
  }

  renderMotivationPanel(settings, latestToday, history);
}

authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("nameInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  if (!name || password.length < 4) return;
  saveState({ user: { name } });
  renderApp();
});

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const mainGoal = document.getElementById("goalInput").value.trim();
  const targetInput = document.getElementById("targetInput");
  const currentInput = document.getElementById("currentInput");
  const rewardAction = document.getElementById("rewardInput").value.trim();
  const targetScreenHours = parseTimeToHours(targetInput.value);
  const currentScreenHours = parseTimeToHours(currentInput.value);

  if (!Number.isFinite(targetScreenHours) || targetScreenHours <= 0 || targetScreenHours > 24) {
    targetInput.setCustomValidity("Enter time like 3h, 3:00, or 3");
    targetInput.reportValidity();
    return;
  }
  targetInput.setCustomValidity("");

  if (!Number.isFinite(currentScreenHours) || currentScreenHours < 0 || currentScreenHours > 24) {
    currentInput.setCustomValidity("Enter time like 4h 30m, 4:30, or 4.5");
    currentInput.reportValidity();
    return;
  }
  currentInput.setCustomValidity("");

  saveState({
    settings: { mainGoal, rewardAction, targetScreenHours, currentScreenHours },
  });
  isEditingSetup = false;
  renderApp();
});

usageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const { settings } = getState();
  const s = normalizeSettings(settings);
  const usageInput = document.getElementById("todayUsageInput");
  const usage = parseTimeToHours(usageInput.value);
  if (!Number.isFinite(usage) || usage < 0 || usage > 24) {
    usageInput.setCustomValidity("Enter time like 2h 45m or 2:45");
    usageInput.reportValidity();
    return;
  }
  usageInput.setCustomValidity("");
  const goal = s.targetScreenHours;
  const usedToday = getTodayLogsAscending(getState().history).reduce((sum, h) => sum + Number(h.usage || 0), 0);
  const projectedTotal = usedToday + usage;
  const dailyNow = getDailyLessons();
  const willBeOver = projectedTotal > goal + 1e-9;
  if (projectedTotal > goal + 1e-9) {
    const remaining = Math.max(0, goal - usedToday);
    // Still allow logging actual usage; just warn.
    if (gentleReminderText) {
      gentleReminderText.textContent = `Logged. Note: you're already over your daily goal — remaining today was ${toHoursAndMinutes(
        remaining
      )}.`;
    }
  }
  usageInput.setCustomValidity("");
  const passed = true;
  addHistoryEntry(usage, goal, passed);
  const latestNow = { usage: projectedTotal };
  const projectedScore = getProgressScore(s, latestNow, goal, getDailyLessons());
  if (projectedScore >= 80) saveDailyLessons({ unlimitedToday: true });
  // Punishments: if you're over the goal (and you haven't unlocked unlimited today), activate the lock.
  // Logging still succeeds; the overlay appears after submit.
  const dailyAfter = getDailyLessons();
  if (willBeOver && !dailyAfter.unlimitedToday) {
    const existing = getState().lockState;
    if (!existing?.active) {
      const requiredMission = MISSION_OPTIONS[Math.floor(Math.random() * MISSION_OPTIONS.length)];
      saveState({
        lockState: {
          active: true,
          startedAt: Date.now(),
          penaltyEndsAt: Date.now() + PENALTY_MS,
          requiredMission,
        },
      });
    }
  } else {
    saveState({ lockState: { active: false } });
  }
  renderApp();
});

unlockRewardBtn.addEventListener("click", () => {
  const { settings } = getState();
  const s = normalizeSettings(settings);
  rewardActionText.textContent = s.rewardAction
    ? `Reward claimed: ${s.rewardAction}`
    : "Set your reward in Edit My Goal first.";
  if (s.rewardAction) saveDailyLessons({ rewardClaimed: true });
  renderApp();
});

editSetupBtn.addEventListener("click", () => {
  const { settings } = getState();
  if (settings) {
    isEditingSetup = true;
    fillSetupForm(settings);
    setupSection.classList.remove("hidden");
    setupSection.scrollIntoView({ behavior: "smooth", block: "start" });
    renderApp();
  }
});

unlockWithProofBtn.addEventListener("click", async () => {
  const { lockState } = getState();
  if (!lockState?.active) return;
  const file = lockPhotoInput.files && lockPhotoInput.files[0] ? lockPhotoInput.files[0] : null;
  const check = await validateProofPhoto(file);
  if (!check.ok) {
    lockErrorText.textContent = check.reason;
    return;
  }
  rememberProofHash(check.hash);
  saveState({
    lockState: {
      active: false,
      completedMission: lockMissionValue.value,
      proofName: file.name,
      completedAt: Date.now(),
    },
  });
  lockPhotoInput.value = "";
  lockErrorText.textContent = "";
  renderApp();
});

sansFightTriggerBtn?.addEventListener("click", () => {
  sansFightActive = true;
  sansRounds = 0;
  sansDeaths = 0;
  sansHp = 92;
  sansKr = 0;
  if (sansFightResultText) sansFightResultText.textContent = "You feel like you're gonna have a bad time.";
  if (sansFightPanel) sansFightPanel.classList.remove("sans-fight--warn");
  refreshSansFightUi();
});
sansFightBtn?.addEventListener("click", () => playSansTurn("fight"));
sansActBtn?.addEventListener("click", () => playSansTurn("act"));
sansItemBtn?.addEventListener("click", () => playSansTurn("item"));
sansMercyBtn?.addEventListener("click", () => playSansTurn("mercy"));

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.settings);
  localStorage.removeItem(STORAGE_KEYS.history);
  localStorage.removeItem(STORAGE_KEYS.lockState);
  localStorage.removeItem(STORAGE_KEYS.dailyLessons);
  sessionStorage.removeItem(FOCUS_SESSION_KEY);
  clearLockTick();
  clearFocusTick();
  isEditingSetup = false;
  renderApp();
});

startFocus10Btn?.addEventListener("click", () => startFocusMinutes(10));
startFocus25Btn?.addEventListener("click", () => startFocusMinutes(25));
if (focusCancelBtn) {
  focusCancelBtn.disabled = true;
  focusCancelBtn.textContent = "Locked during focus";
}

document.addEventListener("visibilitychange", () => {
  if (!penaltyVideo) return;
  if (document.hidden) {
    penaltyVideo.pause();
    return;
  }
  const { lockState } = getState();
  const end = lockState?.penaltyEndsAt || 0;
  if (lockState?.active && Date.now() < end && penaltyUiMode === "wait") {
    penaltyVideo.muted = true;
    penaltyVideo.autoplay = true;
    penaltyVideo.play?.().catch(() => {});
  }
});

document.getElementById("switchToQuizBtn")?.addEventListener("click", beginQuizGauntlet);
document.getElementById("devSkipPenaltyBtn")?.addEventListener("click", () => {
  const { lockState } = getState();
  if (!lockState?.active) return;
  finishPenaltyToRecovery();
});
document.getElementById("quizSubmitBtn")?.addEventListener("click", submitQuizAnswer);
document.getElementById("quizAnswerInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitQuizAnswer();
  }
});
document.getElementById("reflectContinueBtn")?.addEventListener("click", () => {
  if (penaltyUiMode === "read" && !readCheatMode && Date.now() < readUnlockedAt) {
    readCheatMode = true;
    updateReadGateUi();
    return;
  }
  if (penaltyUiMode === "read" && !readCheatMode && !document.getElementById("reflectReadCheckbox")?.checked) {
    updateReadGateUi();
    return;
  }
  if (penaltyUiMode === "read" && readCheatMode) {
    ensureReadCheatChecks();
    const done = readCheatCheckedCount();
    if (done < 20) {
      updateReadGateUi();
      const hint = document.getElementById("readGateHintText");
      if (hint) hint.textContent = `Too fast. Complete all 20 checks (${done}/20).`;
      return;
    }
  }
  finishPenaltyToRecovery();
});
document.getElementById("reflectReadCheckbox")?.addEventListener("change", () => {
  updateReadGateUi();
});
document.getElementById("readCheatChecks")?.addEventListener("change", () => {
  updateReadGateUi();
});
topMotivationBanner?.addEventListener("click", () => {
  if (topMotivationIndex === null) topMotivationIndex = 0;
  topMotivationIndex += 1;
  renderApp();
});
topMotivationBanner?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  if (topMotivationIndex === null) topMotivationIndex = 0;
  topMotivationIndex += 1;
  renderApp();
});

window.addEventListener("beforeunload", (e) => {
  if (getState().lockState?.active) {
    e.preventDefault();
    e.returnValue = " ";
  }
});

renderLockMissionTiles();
renderApp();
