const TIMETABLE_KEY = "focusfrog_timetable_v1";

const PLAN_TEMPLATES = {
  balanced: [
    { activity: "Wake up + water" },
    { activity: "Breakfast + chill music" },
    { activity: "Work/class block (50 min max)" },
    { activity: "Real break: snack + no phone" },
    { activity: "Lunch + short walk outside" },
    { activity: "Easy task block (30-45 min)" },
    { activity: "Fun break: game/chat/stretch" },
    { activity: "Move your body (walk, gym, dance)" },
    { activity: "Phone-off wind-down" },
  ],
  study: [
    { activity: "Wake + pick 3 must-do tasks" },
    { activity: "Study block 1 (45 min)" },
    { activity: "Reset break: snack + stretch" },
    { activity: "Study block 2 (45 min)" },
    { activity: "Long break: lunch + walk + breathe" },
    { activity: "Light revision block (30 min)" },
    { activity: "Reward break (music, chat, hobby)" },
    { activity: "No-phone sleep routine" },
  ],
  recovery: [
    { activity: "Slow morning + sunlight" },
    { activity: "Comfort breakfast + hydrate" },
    { activity: "Tiny win: 15-min tidy" },
    { activity: "Rest block: nap / relax / breathe" },
    { activity: "Low-pressure task (20-30 min)" },
    { activity: "Walk / stretch / breathe" },
    { activity: "Call or hang out with someone" },
    { activity: "Screen curfew" },
  ],
};

const ACTIVITY_SUGGESTIONS = [
  "10-min stretch + water",
  "Breakfast + good playlist",
  "45-min study block",
  "15-min no-phone break",
  "Power nap (20 min)",
  "Walk outside",
  "Read 10 pages (fun book)",
  "Hobby time (music/art/game dev)",
  "Clean desk",
  "Call a friend/family",
  "Phone-off wind-down",
];

const timetableGrid = document.getElementById("timetableGrid");
const activitySuggestionRow = document.getElementById("activitySuggestionRow");
const addRowForm = document.getElementById("addRowForm");
const activityInput = document.getElementById("activityInput");

function isScreenTimeActivity(activity) {
  return /(screen|phone|scroll|social|instagram|tiktok|youtube|netflix|reels|shorts|x|twitter|snapchat)/i.test(activity);
}

function toTimeLabel(index) {
  const startMinutes = 7 * 60;
  const step = 90;
  const total = startMinutes + index * step;
  const h24 = Math.floor(total / 60) % 24;
  const minute = total % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

function loadTimetable() {
  try {
    const raw = localStorage.getItem(TIMETABLE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) return [];
    return parsed.filter((item) => item && item.activity).map((item) => ({ activity: String(item.activity).trim() }));
  } catch {
    return [];
  }
}

function saveTimetable(list) {
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(list));
}

function renderTimetable() {
  const list = loadTimetable();
  timetableGrid.innerHTML = "";
  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "today-truth-empty";
    empty.textContent = "No blocks yet. Add one activity to start your day plan.";
    timetableGrid.appendChild(empty);
    return;
  }
  list.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "timetable-row";

    const time = document.createElement("div");
    time.className = "timetable-time";
    time.textContent = toTimeLabel(index);

    const descWrap = document.createElement("div");
    descWrap.textContent = item.activity;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "timetable-delete-btn";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      const next = loadTimetable().filter((_, i) => i !== index);
      saveTimetable(next);
      renderTimetable();
    });

    row.appendChild(time);
    row.appendChild(descWrap);
    row.appendChild(del);
    timetableGrid.appendChild(row);
  });
}

function applyTemplate(key) {
  const template = PLAN_TEMPLATES[key];
  if (!template) return;
  const hasScreen = template.some((item) => isScreenTimeActivity(item.activity));
  if (hasScreen) {
    const ok = window.confirm("This template includes possible screen-related items. Do you still want to apply it?");
    if (!ok) return;
  }
  saveTimetable([...template]);
  renderTimetable();
}

function renderActivitySuggestions() {
  if (!activitySuggestionRow || !activityInput) return;
  activitySuggestionRow.innerHTML = "";
  ACTIVITY_SUGGESTIONS.forEach((text) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lesson-chip lesson-chip--blue";
    btn.textContent = text;
    btn.addEventListener("click", () => {
      activityInput.value = text;
      activityInput.focus();
    });
    activitySuggestionRow.appendChild(btn);
  });
}

document.getElementById("balancedPlanBtn")?.addEventListener("click", () => applyTemplate("balanced"));
document.getElementById("studyPlanBtn")?.addEventListener("click", () => applyTemplate("study"));
document.getElementById("resetPlanBtn")?.addEventListener("click", () => applyTemplate("recovery"));

addRowForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const activity = String(activityInput?.value || "").trim();
  if (!activity) return;
  if (isScreenTimeActivity(activity)) {
    const ok = window.confirm("This activity sounds like screen time. Do you really want to set it?");
    if (!ok) return;
  }
  const next = [...loadTimetable(), { activity }];
  saveTimetable(next);
  addRowForm.reset();
  renderTimetable();
});

renderActivitySuggestions();
renderTimetable();
