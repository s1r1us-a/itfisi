/**
 * stats.js — Zentraler Zustand, Persistenz und Statistik der Lernplattform.
 *
 * Verantwortlich für:
 *  - robusten State mit localStorage-Persistenz und In-Memory-Fallback
 *    (die App darf nie abstürzen, auch wenn localStorage gesperrt ist)
 *  - Fortschritt pro Thema/Kategorie, Richtig-/Falsch-Quote
 *  - Lernverlauf über Zeit, Aktivitäts-Heatmap, Lernstreak, Tagesziel
 *  - Punkte-/Level-System und Achievements
 *  - Leitner-Boxen (Spaced Repetition) und Schwachstellen-Liste
 *  - Notizen & Favoriten pro Thema
 *  - Export/Import (JSON) und Reset
 *  - Chart.js-Diagramme (defensiv: funktioniert auch ohne CDN)
 */

const STORAGE_BASE_KEY = "fisi-lernplattform-v1";
// Aktiver localStorage-Schlüssel. Wird pro Account erweitert (siehe setUserScope),
// damit mehrere Konten am selben Gerät getrennte Offline-Caches haben.
let STORAGE_KEY = STORAGE_BASE_KEY;

/* ------------------------------------------------------------------ *
 *  Speicher: localStorage mit Fallback auf In-Memory
 * ------------------------------------------------------------------ */

let memoryStore = null;       // Fallback, falls localStorage nicht verfügbar
let usingFallback = false;

function storageAvailable() {
  try {
    const k = "__fisi_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
}

const hasLS = storageAvailable();

/* ------------------------------------------------------------------ *
 *  Default-State
 * ------------------------------------------------------------------ */

function defaultState() {
  return {
    version: 1,
    // pro Frage: { correct, wrong, lastResult, box (1-5), due (timestamp) }
    questionStats: {},
    // pro Thema: { viewed: bool, quizzes: number }
    topicProgress: {},
    // Lernverlauf: { "YYYY-MM-DD": { answered, correct } }
    history: {},
    points: 0,
    achievements: {},        // id -> timestamp
    notes: {},               // topicId -> string
    favorites: [],           // [topicId]
    streak: { current: 0, longest: 0, lastDay: null },
    dailyGoal: 20,
    selfAssessment: {},      // bereichId -> 1..5 (Selbsteinschätzung)
    examDate: null,          // Prüfungstermin (timestamp) für Countdown/Lernplan
    settings: { theme: "dark", view: "lernfeld" },
    totals: { answered: 0, correct: 0, quizzesDone: 0, examsDone: 0 },
    createdAt: Date.now(),
  };
}

let state = load();

function load() {
  let raw = null;
  try {
    raw = hasLS ? localStorage.getItem(STORAGE_KEY) : memoryStore;
  } catch (e) {
    raw = memoryStore;
  }
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    // mit Defaults mischen, damit fehlende Felder ergänzt werden
    return Object.assign(defaultState(), parsed);
  } catch (e) {
    console.warn("State konnte nicht gelesen werden, starte neu.", e);
    return defaultState();
  }
}

function save() {
  const raw = JSON.stringify(state);
  try {
    if (hasLS) {
      localStorage.setItem(STORAGE_KEY, raw);
    } else {
      memoryStore = raw;
      usingFallback = true;
    }
  } catch (e) {
    // localStorage voll/gesperrt → Fallback
    memoryStore = raw;
    usingFallback = true;
  }
  notify();
}

/* einfaches Pub/Sub, damit UI auf Änderungen reagieren kann */
const listeners = new Set();
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function notify() { listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } }); }

export function isUsingFallback() { return usingFallback || !hasLS; }
export function getState() { return state; }
export function getSetting(key) { return state.settings[key]; }
export function setSetting(key, value) { state.settings[key] = value; save(); }

/* ------------------------------------------------------------------ *
 *  Datums-Helfer
 * ------------------------------------------------------------------ */

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(aKey, bKey) {
  const a = new Date(aKey + "T00:00:00");
  const b = new Date(bKey + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

/* ------------------------------------------------------------------ *
 *  Streak & Tagesziel
 * ------------------------------------------------------------------ */

function updateStreak() {
  const t = todayKey();
  const s = state.streak;
  if (s.lastDay === t) return;          // heute bereits gezählt
  if (s.lastDay && daysBetween(s.lastDay, t) === 1) {
    s.current += 1;                     // direkt am Folgetag
  } else {
    s.current = 1;                      // Streak neu gestartet
  }
  s.lastDay = t;
  s.longest = Math.max(s.longest, s.current);
}

export function getStreak() { return state.streak; }
export function getDailyGoal() { return state.dailyGoal; }
export function setDailyGoal(n) { state.dailyGoal = Math.max(1, parseInt(n, 10) || 20); save(); }

export function getExamDate() { return state.examDate || null; }
export function setExamDate(ts) { state.examDate = ts || null; save(); }
/** Tage bis zum Prüfungstermin (>=0), oder null wenn kein Termin gesetzt. */
export function daysUntilExam() {
  if (!state.examDate) return null;
  const today = new Date(todayKey() + "T00:00:00").getTime();
  const exam = new Date(todayKey(new Date(state.examDate)) + "T00:00:00").getTime();
  return Math.max(0, Math.round((exam - today) / 86400000));
}

export function answeredToday() {
  const e = state.history[todayKey()];
  return e ? e.answered : 0;
}

/* ------------------------------------------------------------------ *
 *  Punkte & Level
 * ------------------------------------------------------------------ */

const POINTS = { correct: 10, wrong: 1, quizDone: 25, examDone: 100 };

export function getPoints() { return state.points; }

/** Level steigt alle 250 Punkte. */
export function getLevel() {
  const lvl = Math.floor(state.points / 250) + 1;
  const into = state.points % 250;
  return { level: lvl, into, needed: 250, pct: Math.round((into / 250) * 100) };
}

/* ------------------------------------------------------------------ *
 *  Antwort verbuchen (Kern)
 * ------------------------------------------------------------------ */

/**
 * Verbucht das Ergebnis einer beantworteten Frage.
 * Aktualisiert Statistik, Verlauf, Leitner-Box, Punkte, Streak, Achievements.
 */
export function recordAnswer(question, isCorrect) {
  const id = question.id;
  const qs = state.questionStats[id] || { correct: 0, wrong: 0, lastResult: null, box: 1, due: 0 };

  if (isCorrect) {
    qs.correct += 1;
    qs.box = Math.min(5, qs.box + 1);            // Leitner: aufsteigen
    state.points += POINTS.correct;
    state.totals.correct += 1;
  } else {
    qs.wrong += 1;
    qs.box = 1;                                   // Leitner: zurück in Box 1
    state.points += POINTS.wrong;
  }
  qs.lastResult = isCorrect ? "correct" : "wrong";
  qs.due = nextDue(qs.box);
  state.questionStats[id] = qs;

  state.totals.answered += 1;

  // Verlauf
  const t = todayKey();
  const h = state.history[t] || { answered: 0, correct: 0 };
  h.answered += 1;
  if (isCorrect) h.correct += 1;
  state.history[t] = h;

  updateStreak();
  checkAchievements();
  save();
  return qs;
}

/** Leitner-Fälligkeit je Box (in Tagen). */
function nextDue(box) {
  const days = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 }[box] ?? 0;
  return Date.now() + days * 86400000;
}

export function markQuizDone() {
  state.totals.quizzesDone += 1;
  state.points += POINTS.quizDone;
  checkAchievements();
  save();
}

export function markExamDone(scorePct) {
  state.totals.examsDone += 1;
  state.points += POINTS.examDone;
  if (scorePct >= 90) grantAchievement("exam-ace");
  checkAchievements();
  save();
}

/* ------------------------------------------------------------------ *
 *  Themen-Fortschritt, Notizen, Favoriten
 * ------------------------------------------------------------------ */

export function markTopicViewed(topicId) {
  const tp = state.topicProgress[topicId] || { viewed: false, quizzes: 0 };
  if (!tp.viewed) {
    tp.viewed = true;
    state.topicProgress[topicId] = tp;
    checkAchievements();
    save();
  }
}

export function topicViewed(topicId) {
  return !!(state.topicProgress[topicId] && state.topicProgress[topicId].viewed);
}

/** Fortschritt eines Themas in % (Anteil beantworteter zugehöriger Fragen). */
export function topicProgressPct(topic) {
  const ids = topic.questionIds || [];
  if (ids.length === 0) return topicViewed(topic.id) ? 100 : 0;
  let answered = 0;
  for (const id of ids) {
    const qs = state.questionStats[id];
    if (qs && (qs.correct > 0 || qs.wrong > 0)) answered += 1;
  }
  return Math.round((answered / ids.length) * 100);
}

export function getNote(topicId) { return state.notes[topicId] || ""; }
export function setNote(topicId, text) {
  if (text && text.trim()) state.notes[topicId] = text;
  else delete state.notes[topicId];
  save();
}

export function isFavorite(topicId) { return state.favorites.includes(topicId); }
export function toggleFavorite(topicId) {
  const i = state.favorites.indexOf(topicId);
  if (i >= 0) state.favorites.splice(i, 1);
  else state.favorites.push(topicId);
  save();
  return isFavorite(topicId);
}
export function getFavorites() { return [...state.favorites]; }

/* ------------------------------------------------------------------ *
 *  Schwachstellen & Spaced Repetition (Leitner)
 * ------------------------------------------------------------------ */

/** Fragen-IDs, die zuletzt falsch beantwortet wurden. */
export function weakQuestionIds() {
  return Object.entries(state.questionStats)
    .filter(([, qs]) => qs.lastResult === "wrong" || (qs.wrong > qs.correct))
    .map(([id]) => id);
}

/** Fällige Karten für Spaced Repetition. */
export function dueQuestionIds() {
  const now = Date.now();
  return Object.entries(state.questionStats)
    .filter(([, qs]) => (qs.due || 0) <= now)
    .map(([id]) => id);
}

export function getBox(questionId) {
  const qs = state.questionStats[questionId];
  return qs ? qs.box : 1;
}

export function questionStat(questionId) {
  return state.questionStats[questionId] || null;
}

/* ------------------------------------------------------------------ *
 *  Aggregierte Auswertungen für das Dashboard
 * ------------------------------------------------------------------ */

export function overallAccuracy() {
  const { answered, correct } = state.totals;
  if (answered === 0) return 0;
  return Math.round((correct / answered) * 100);
}

/**
 * Genauigkeit je thematischem Bereich.
 * topics + bereiche aus content.js werden übergeben.
 */
export function accuracyByBereich(topics, bereiche) {
  const result = {};
  for (const b of bereiche) result[b.id] = { answered: 0, correct: 0, title: b.title };
  for (const topic of topics) {
    const bucket = result[topic.bereich];
    if (!bucket) continue;
    for (const id of topic.questionIds || []) {
      const qs = state.questionStats[id];
      if (!qs) continue;
      bucket.answered += qs.correct + qs.wrong;
      bucket.correct += qs.correct;
    }
  }
  for (const id of Object.keys(result)) {
    const r = result[id];
    r.pct = r.answered ? Math.round((r.correct / r.answered) * 100) : null;
  }
  return result;
}

/** Schwächste Bereiche (für Empfehlung „was als Nächstes üben“). */
export function weakestBereiche(topics, bereiche, limit = 3) {
  const acc = accuracyByBereich(topics, bereiche);
  return Object.values(acc)
    .filter((r) => r.answered >= 1)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, limit);
}

/* ------------------------------------------------------------------ *
 *  Erweiterte persönliche Statistiken (abgeleitet, kein neues Tracking)
 * ------------------------------------------------------------------ */

/** Anzahl Tage mit Lernaktivität. */
export function studyDays() {
  return Object.keys(state.history).length;
}

/** Durchschnittlich beantwortete Fragen pro aktivem Lerntag. */
export function avgPerDay() {
  const days = studyDays();
  if (!days) return 0;
  return Math.round((state.totals.answered / days) * 10) / 10;
}

/** Produktivster Tag: { date, answered } oder null. */
export function bestDay() {
  let best = null;
  for (const [date, e] of Object.entries(state.history)) {
    if (!best || e.answered > best.answered) best = { date, answered: e.answered };
  }
  return best;
}

/** Anzahl „gemeisterter“ Karten (Leitner-Box 5). */
export function masteredCount() {
  return Object.values(state.questionStats).filter((qs) => qs.box >= 5).length;
}

/** Gesamtzahl richtig beantworteter Fragen (kumuliert). */
export function totalCorrect() { return state.totals.correct; }
/** Gesamtzahl falsch beantworteter Fragen (kumuliert). */
export function totalWrong() { return Math.max(0, state.totals.answered - state.totals.correct); }

/**
 * Trefferquote je Aufgabentyp.
 * allQuestions: Array aller Fragen (aus questions.js) zum Nachschlagen des Typs.
 * Liefert Array [{ type, answered, correct, pct }] sortiert nach Häufigkeit.
 */
export function accuracyByQuestionType(allQuestions) {
  const byId = {};
  for (const q of allQuestions || []) byId[q.id] = q;
  const buckets = {};
  for (const [id, qs] of Object.entries(state.questionStats)) {
    const q = byId[id];
    if (!q) continue;
    const type = q.type || "sonstige";
    const b = buckets[type] || (buckets[type] = { type, answered: 0, correct: 0 });
    b.answered += qs.correct + qs.wrong;
    b.correct += qs.correct;
  }
  return Object.values(buckets)
    .map((b) => ({ ...b, pct: b.answered ? Math.round((b.correct / b.answered) * 100) : null }))
    .filter((b) => b.answered > 0)
    .sort((a, b) => b.answered - a.answered);
}

/**
 * Kuratierter, öffentlich teilbarer Snapshot des eigenen Profils für die
 * Community (Leaderboard + fremde Profile). Enthält KEINE E-Mail und keine
 * sensiblen Rohdaten – nur aggregierte Lernstatistiken.
 */
export function publicProfileSnapshot() {
  const lvl = getLevel();
  const s = state.streak;
  return {
    level: lvl.level,
    points: state.points,
    streak: { current: s.current || 0, longest: s.longest || 0 },
    accuracy: overallAccuracy(),
    answered: state.totals.answered,
    correct: state.totals.correct,
    quizzesDone: state.totals.quizzesDone,
    examsDone: state.totals.examsDone,
    mastered: masteredCount(),
    studyDays: studyDays(),
    achievementIds: ACHIEVEMENTS.filter((a) => hasAchievement(a.id)).map((a) => a.id),
    createdAt: state.createdAt || Date.now(),
  };
}

/** Verlauf der letzten n Tage als Array {date, answered, correct}. */
export function historySeries(days = 14) {
  const out = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = todayKey(d);
    const e = state.history[key] || { answered: 0, correct: 0 };
    out.push({ date: key, answered: e.answered, correct: e.correct });
  }
  return out;
}

/** Heatmap-Daten der letzten ~weeks Wochen. */
export function heatmapData(weeks = 18) {
  const out = [];
  const now = new Date();
  const total = weeks * 7;
  for (let i = total - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = todayKey(d);
    const e = state.history[key];
    out.push({ date: key, count: e ? e.answered : 0 });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 *  Achievements
 * ------------------------------------------------------------------ */

export const ACHIEVEMENTS = [
  { id: "first-steps",  icon: "🐣", title: "Erste Schritte",     desc: "Erste Frage beantwortet." },
  { id: "q-100",        icon: "💯", title: "100 Fragen",         desc: "100 Fragen beantwortet." },
  { id: "q-500",        icon: "🏅", title: "500 Fragen",         desc: "500 Fragen beantwortet." },
  { id: "streak-7",     icon: "🔥", title: "7-Tage-Streak",      desc: "7 Tage in Folge gelernt." },
  { id: "streak-30",    icon: "⚡", title: "30-Tage-Streak",     desc: "30 Tage in Folge gelernt." },
  { id: "quiz-master",  icon: "🎓", title: "Quiz-Routinier",     desc: "10 Quizze absolviert." },
  { id: "exam-ace",     icon: "🏆", title: "Prüfungs-Ass",       desc: "Prüfungssimulation mit ≥ 90 % bestanden." },
  { id: "subnet-pro",   icon: "🧮", title: "Subnetting-Profi",   desc: "10 Subnetting-Aufgaben korrekt gelöst." },
  { id: "explorer",     icon: "🗺️", title: "Entdecker:in",       desc: "10 Themen geöffnet." },
  { id: "completionist",icon: "🌟", title: "Wissensdurst",       desc: "Alle Themenbereiche angesehen." },
];

export function grantAchievement(id) {
  if (state.achievements[id]) return false;
  state.achievements[id] = Date.now();
  pendingAchievements.push(id);
  return true;
}

export function hasAchievement(id) { return !!state.achievements[id]; }
export function getAchievements() { return state.achievements; }

let pendingAchievements = [];
export function popAchievements() {
  const a = pendingAchievements.slice();
  pendingAchievements = [];
  return a;
}

let subnetSolved = 0;
export function noteSubnetSolved() {
  subnetSolved += 1;
  if (subnetSolved >= 10) grantAchievement("subnet-pro");
}

function checkAchievements() {
  const tot = state.totals;
  if (tot.answered >= 1) grantAchievement("first-steps");
  if (tot.answered >= 100) grantAchievement("q-100");
  if (tot.answered >= 500) grantAchievement("q-500");
  if (state.streak.current >= 7) grantAchievement("streak-7");
  if (state.streak.current >= 30) grantAchievement("streak-30");
  if (tot.quizzesDone >= 10) grantAchievement("quiz-master");
  const viewed = Object.values(state.topicProgress).filter((t) => t.viewed).length;
  if (viewed >= 10) grantAchievement("explorer");
}

/** Wird von app.js nach dem Laden der Inhalte aufgerufen. */
export function checkBereichCompletion(topics, bereiche) {
  const viewedBereiche = new Set();
  for (const t of topics) {
    if (topicViewed(t.id)) viewedBereiche.add(t.bereich);
  }
  if (viewedBereiche.size >= bereiche.length) grantAchievement("completionist");
}

/* ------------------------------------------------------------------ *
 *  Export / Import / Reset
 * ------------------------------------------------------------------ */

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);                 // wirft bei ungültigem JSON
  if (typeof parsed !== "object" || parsed === null) throw new Error("Ungültiges Format");
  state = Object.assign(defaultState(), parsed);
  save();
  return true;
}

export function resetAll() {
  state = defaultState();
  subnetSolved = 0;
  pendingAchievements = [];
  save();
}

/* ------------------------------------------------------------------ *
 *  Cloud-Anbindung (Auth + Realtime Database, siehe cloud.js)
 * ------------------------------------------------------------------ */

/**
 * Übernimmt einen aus der Cloud geladenen State (Objekt) als aktuellen Stand.
 * Objektbasiertes Gegenstück zu importJSON (ohne Text-Parsing). Fehlende Felder
 * werden mit den Defaults ergänzt, anschließend wird persistiert und benachrichtigt.
 */
export function hydrate(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  state = Object.assign(defaultState(), obj);
  subnetSolved = 0;
  pendingAchievements = [];
  save();
  return true;
}

/**
 * Setzt den localStorage-Cache-Schlüssel auf den aktuellen Account, damit mehrere
 * Konten am selben Gerät getrennte Offline-Caches haben. uid=null setzt auf den
 * Basis-Schlüssel zurück. Der Stand wird aus dem (Account-)Cache neu geladen;
 * die Cloud bleibt die maßgebliche Quelle (siehe cloud.js).
 */
export function setUserScope(uid) {
  STORAGE_KEY = uid ? `${STORAGE_BASE_KEY}::${uid}` : STORAGE_BASE_KEY;
  state = load();
  subnetSolved = 0;
  pendingAchievements = [];
  notify();
}

/* ------------------------------------------------------------------ *
 *  Diagramme (Chart.js, defensiv gekapselt)
 * ------------------------------------------------------------------ */

const chartInstances = {};

function chartColors() {
  const cs = getComputedStyle(document.documentElement);
  return {
    accent: cs.getPropertyValue("--accent").trim() || "#5b8def",
    accent2: cs.getPropertyValue("--accent-2").trim() || "#22c55e",
    text: cs.getPropertyValue("--text-muted").trim() || "#94a3b8",
    grid: cs.getPropertyValue("--border").trim() || "#334155",
  };
}

/** Liniendiagramm Lernverlauf. */
export function renderHistoryChart(canvas, days = 14) {
  if (typeof Chart === "undefined" || !canvas) { fallbackChartMsg(canvas); return; }
  const data = historySeries(days);
  const c = chartColors();
  destroyChart("history");
  chartInstances.history = new Chart(canvas, {
    type: "line",
    data: {
      labels: data.map((d) => d.date.slice(5)),
      datasets: [
        { label: "Beantwortet", data: data.map((d) => d.answered), borderColor: c.accent, backgroundColor: c.accent + "33", tension: 0.3, fill: true },
        { label: "Richtig", data: data.map((d) => d.correct), borderColor: c.accent2, backgroundColor: "transparent", tension: 0.3 },
      ],
    },
    options: baseChartOptions(c),
  });
}

/** Balkendiagramm Genauigkeit je Bereich. */
export function renderBereichChart(canvas, topics, bereiche) {
  if (typeof Chart === "undefined" || !canvas) { fallbackChartMsg(canvas); return; }
  const acc = accuracyByBereich(topics, bereiche);
  const entries = Object.values(acc);
  const c = chartColors();
  destroyChart("bereich");
  chartInstances.bereich = new Chart(canvas, {
    type: "bar",
    data: {
      labels: entries.map((e) => e.title.replace(/ \(.*\)/, "")),
      datasets: [{
        label: "Trefferquote %",
        data: entries.map((e) => e.pct ?? 0),
        backgroundColor: entries.map((e) => (e.pct == null ? c.grid : e.pct >= 70 ? c.accent2 : e.pct >= 40 ? "#f59e0b" : "#ef4444")),
        borderRadius: 6,
      }],
    },
    options: Object.assign(baseChartOptions(c), {
      scales: { y: { beginAtZero: true, max: 100, ticks: { color: c.text }, grid: { color: c.grid } }, x: { ticks: { color: c.text }, grid: { display: false } } },
      plugins: { legend: { display: false } },
    }),
  });
}

/** Doughnut richtig/falsch. */
export function renderAccuracyDoughnut(canvas) {
  if (typeof Chart === "undefined" || !canvas) { fallbackChartMsg(canvas); return; }
  const { answered, correct } = state.totals;
  const wrong = Math.max(0, answered - correct);
  const c = chartColors();
  destroyChart("acc");
  chartInstances.acc = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Richtig", "Falsch"],
      datasets: [{ data: [correct, wrong], backgroundColor: [c.accent2, "#ef4444"], borderWidth: 0 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: c.text } } } },
  });
}

/** Wissensradar: Quiz-Trefferquote vs. Selbsteinschätzung je Bereich. */
export function renderRadarChart(canvas, topics, bereiche) {
  if (typeof Chart === "undefined" || !canvas) { fallbackChartMsg(canvas); return; }
  const acc = accuracyByBereich(topics, bereiche);
  const c = chartColors();
  destroyChart("radar");
  const labels = bereiche.map((b) => b.title.replace(/ \(.*\)/, ""));
  const quizData = bereiche.map((b) => acc[b.id]?.pct ?? 0);
  const selfData = bereiche.map((b) => (state.selfAssessment[b.id] ? state.selfAssessment[b.id] * 20 : 0));
  chartInstances.radar = new Chart(canvas, {
    type: "radar",
    data: {
      labels,
      datasets: [
        { label: "Quiz-Leistung %", data: quizData, borderColor: c.accent, backgroundColor: c.accent + "33", pointBackgroundColor: c.accent },
        { label: "Selbsteinschätzung", data: selfData, borderColor: c.accent2, backgroundColor: c.accent2 + "22", pointBackgroundColor: c.accent2 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: c.text } } },
      scales: { r: { suggestedMin: 0, suggestedMax: 100, angleLines: { color: c.grid }, grid: { color: c.grid }, pointLabels: { color: c.text }, ticks: { display: false } } },
    },
  });
}

export function getSelfAssessment(id) { return state.selfAssessment[id] || 0; }
export function setSelfAssessment(id, value) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  if (v === 0) delete state.selfAssessment[id]; else state.selfAssessment[id] = v;
  save();
}

function baseChartOptions(c) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: c.text } } },
    scales: {
      y: { beginAtZero: true, ticks: { color: c.text }, grid: { color: c.grid } },
      x: { ticks: { color: c.text }, grid: { display: false } },
    },
  };
}

function destroyChart(key) {
  if (chartInstances[key]) { chartInstances[key].destroy(); delete chartInstances[key]; }
}

export function destroyAllCharts() { Object.keys(chartInstances).forEach(destroyChart); }

function fallbackChartMsg(canvas) {
  if (!canvas) return;
  const p = document.createElement("p");
  p.className = "chart-fallback";
  p.textContent = "Diagramm benötigt die Chart.js-Bibliothek (Internetzugang). Die Statistik bleibt darunter als Text verfügbar.";
  canvas.replaceWith(p);
}
