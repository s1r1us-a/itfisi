/**
 * app.js — Anwendungslogik: Navigation, Routing, State-Anbindung, Ansichten.
 *
 * Bindet die Datenmodule (content/questions/glossary) an die UI und steuert
 * die Module quiz.js, stats.js und tools.js. Hash-basiertes Routing hält die
 * App ohne Build-Schritt lauffähig (einfacher Webserver genügt wegen ES-Modulen).
 */

import * as content from "../data/content.js";
import { glossary, getGlossaryTerm } from "../data/glossary.js";
import { paths, getPath } from "../data/paths.js";
import { scenarios } from "../data/scenarios.js";
import { getQuestion, questions as ALL_QUESTIONS } from "../data/questions.js";
import * as stats from "./stats.js";
import * as quiz from "./quiz.js";
import * as tools from "./tools.js";

const { topics, lernfelder, examAreas, bereiche, getTopic } = content;

/* ------------------------------------------------------------------ *
 *  DOM-Referenzen & Helfer
 * ------------------------------------------------------------------ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const main = () => $("#view");

function el(tag, attrs = {}, html) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) e.setAttribute(k, v);
  }
  if (html !== undefined) e.innerHTML = html;
  return e;
}

let pomodoroCleanup = null;
function clearPomodoro() { if (pomodoroCleanup) { pomodoroCleanup(); pomodoroCleanup = null; } }

/* ------------------------------------------------------------------ *
 *  Theme & Ansicht
 * ------------------------------------------------------------------ */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = $("#theme-toggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function initTheme() { applyTheme(stats.getSetting("theme") || "dark"); }

function toggleTheme() {
  const next = (stats.getSetting("theme") === "dark") ? "light" : "dark";
  stats.setSetting("theme", next);
  applyTheme(next);
}

let currentView = stats.getSetting("view") || "lernfeld";

/* ------------------------------------------------------------------ *
 *  Sidebar-Navigation
 * ------------------------------------------------------------------ */

function buildSidebar() {
  const nav = $("#sidebar-nav");
  nav.innerHTML = "";

  // Schnellzugriffe
  const quick = el("div", { class: "nav-section" });
  quick.append(
    navLink("🏠 Dashboard", "#/dashboard"),
    navLink("📈 Statistik", "#/stats"),
    navLink("🗓️ Lernplan", "#/plan"),
    navLink("🧭 Lernpfade", "#/paths"),
    navLink("📝 Prüfungssimulation", "#/exam"),
    navLink("🎯 Üben & Wiederholen", "#/practice"),
    navLink("🛠️ Werkzeuge", "#/tools"),
    navLink("📖 Glossar", "#/glossary"),
    navLink("⭐ Favoriten", "#/favorites"),
  );
  nav.append(quick);

  // Kategorien je nach Ansicht
  if (currentView === "lernfeld") {
    const byLf = content.topicsByLernfeld();
    Object.keys(lernfelder).forEach((lf) => {
      const list = byLf[lf];
      if (!list || !list.length) return;
      nav.append(navGroup(lernfelder[lf].icon + " " + lernfelder[lf].title, list));
    });
  } else {
    const byEa = content.topicsByExamArea();
    Object.keys(examAreas).forEach((ea) => {
      const list = byEa[ea];
      if (!list || !list.length) return;
      nav.append(navGroup(examAreas[ea].icon + " " + examAreas[ea].title, list));
    });
  }
}

function navLink(label, href) {
  return el("a", { class: "nav-link", href }, label);
}

function navGroup(title, list) {
  const wrap = el("div", { class: "nav-section" });
  const head = el("div", { class: "nav-group-title" }, title);
  wrap.append(head);
  list.forEach((t) => {
    const a = el("a", { class: "nav-link nav-topic", href: `#/topic/${t.id}`, "data-topic": t.id });
    a.innerHTML = `<span class="nav-topic-icon">${escapeHtml(t.icon || "•")}</span><span>${escapeHtml(t.title)}</span>`;
    wrap.append(a);
  });
  return wrap;
}

function highlightActiveNav() {
  const hash = location.hash || "#/dashboard";
  $$(".nav-link").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === hash));
}

/* ------------------------------------------------------------------ *
 *  Globale Suche
 * ------------------------------------------------------------------ */

function buildSearchIndex() {
  const idx = [];
  topics.forEach((t) => {
    const text = (t.title + " " + t.summary + " " + t.sections.map((s) => s.heading + " " + s.html).join(" ")).toLowerCase();
    idx.push({ type: "Thema", title: t.title, href: `#/topic/${t.id}`, text, icon: t.icon });
  });
  glossary.forEach((g) => idx.push({ type: "Glossar", title: g.term, href: `#/glossary?term=${encodeURIComponent(g.term)}`, text: (g.term + " " + g.definition).toLowerCase(), icon: "📖" }));
  ALL_QUESTIONS.forEach((q) => idx.push({ type: "Frage", title: q.question.replace(/\{\{\}\}/g, "___"), href: `#/topic/${q.topicId}`, text: q.question.toLowerCase(), icon: "❓" }));
  return idx;
}

let SEARCH_INDEX = [];

function initSearch() {
  SEARCH_INDEX = buildSearchIndex();
  const input = $("#search-input");
  const results = $("#search-results");
  const run = () => {
    const q = input.value.toLowerCase().trim();
    if (q.length < 2) { results.hidden = true; results.innerHTML = ""; return; }
    const hits = SEARCH_INDEX.filter((e) => e.text.includes(q)).slice(0, 12);
    results.hidden = false;
    results.innerHTML = hits.length
      ? hits.map((h) => `<a class="search-hit" href="${escapeHtml(h.href)}"><span class="hit-icon">${escapeHtml(h.icon)}</span><span class="hit-body"><span class="hit-type">${escapeHtml(h.type)}</span><span class="hit-title">${escapeHtml(h.title)}</span></span></a>`).join("")
      : `<p class="search-empty">Keine Treffer für „${escapeHtml(q)}“.</p>`;
  };
  input.addEventListener("input", run);
  input.addEventListener("focus", run);
  results.addEventListener("click", () => { results.hidden = true; input.value = ""; });
  document.addEventListener("click", (e) => { if (!e.target.closest(".search-box")) results.hidden = true; });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Packt breite Tabellen in einen horizontal scrollbaren Wrapper (Mobile). */
function wrapTables(root) {
  if (!root) return;
  root.querySelectorAll("table").forEach((tbl) => {
    if (tbl.parentElement && tbl.parentElement.classList.contains("table-wrap")) return;
    const wrap = el("div", { class: "table-wrap" });
    tbl.parentNode.insertBefore(wrap, tbl);
    wrap.append(tbl);
  });
}

/* ------------------------------------------------------------------ *
 *  Glossar-Verlinkung im Fließtext
 * ------------------------------------------------------------------ */

const GLOSSARY_RE = (() => {
  const terms = glossary.map((g) => g.term).filter((t) => t.length > 2)
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // Ohne Terme würde `\b()\b` entstehen → leere Gruppe matcht überall. Lieber ein
  // Muster, das nie trifft, plus try/catch gegen evtl. ungültige Term-Kombinationen.
  if (!terms.length) return /$^/;
  try {
    return new RegExp(`\\b(${terms.join("|")})\\b`, "g");
  } catch (e) {
    console.warn("Glossar-Regex konnte nicht erstellt werden.", e);
    return /$^/;
  }
})();

/** Verlinkt bekannte Glossarbegriffe in einem Container (nur einmal je Begriff). */
function linkifyGlossary(root) {
  const seen = new Set();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p || p.closest("a,code,pre,button,.gloss-term,h1,h2,h3,h4")) return NodeFilter.FILTER_REJECT;
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const targets = [];
  while (walker.nextNode()) targets.push(walker.currentNode);
  targets.forEach((node) => {
    const text = node.nodeValue;
    GLOSSARY_RE.lastIndex = 0;
    if (!GLOSSARY_RE.test(text)) return;
    GLOSSARY_RE.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0, m;
    while ((m = GLOSSARY_RE.exec(text))) {
      const term = m[1];
      if (seen.has(term.toLowerCase())) continue;
      seen.add(term.toLowerCase());
      frag.append(document.createTextNode(text.slice(last, m.index)));
      const span = el("span", { class: "gloss-term", tabindex: "0", role: "button", "data-term": term, title: "Glossar: " + term }, term);
      frag.append(span);
      last = m.index + term.length;
    }
    frag.append(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  });

  // Tooltip-Verhalten
  root.querySelectorAll(".gloss-term").forEach((span) => {
    const show = () => showGlossaryPopover(span);
    span.addEventListener("click", show);
    span.addEventListener("keydown", (e) => { if (e.key === "Enter") show(); });
  });
}

let glossPopoverCleanup = null;
function closeGlossaryPopover() {
  if (glossPopoverCleanup) { glossPopoverCleanup(); glossPopoverCleanup = null; }
}

function showGlossaryPopover(anchor) {
  // Vorhandenes Popover samt Listener sauber entfernen (kein Listener-Leak).
  closeGlossaryPopover();
  const term = anchor.dataset.term;
  const g = getGlossaryTerm(term);
  if (!g) return;
  const pop = el("div", { class: "gloss-popover" });
  pop.innerHTML = `<strong>${escapeHtml(g.term)}</strong><p>${escapeHtml(g.definition)}</p>${g.related && g.related.length ? `<a href="#/topic/${encodeURIComponent(g.related[0])}">Zum Thema →</a>` : ""}`;
  document.body.append(pop);

  // Breite mobil-sicher begrenzen und Position an den Viewport clampen.
  const popW = pop.getBoundingClientRect().width || Math.min(320, window.innerWidth - 16);
  const r = anchor.getBoundingClientRect();
  const maxLeft = window.scrollX + window.innerWidth - popW - 8;
  pop.style.top = (window.scrollY + r.bottom + 6) + "px";
  pop.style.left = Math.max(window.scrollX + 8, Math.min(window.scrollX + r.left, maxLeft)) + "px";

  const close = (e) => { if (!e.target.closest(".gloss-popover") && e.target !== anchor) closeGlossaryPopover(); };
  // Cleanup kapselt Entfernen von DOM + Listener, damit auch Navigation aufräumt.
  glossPopoverCleanup = () => { pop.remove(); document.removeEventListener("click", close); };
  setTimeout(() => document.addEventListener("click", close), 0);
}

/* ------------------------------------------------------------------ *
 *  Router
 * ------------------------------------------------------------------ */

function router() {
  clearPomodoro();
  closeGlossaryPopover();
  stats.destroyAllCharts();
  const hash = location.hash.replace(/^#/, "") || "/dashboard";
  const [path, queryStr] = hash.split("?");
  const query = Object.fromEntries(new URLSearchParams(queryStr || ""));
  const parts = path.split("/").filter(Boolean);

  window.scrollTo(0, 0);

  switch (parts[0]) {
    case "dashboard": renderDashboard(); break;
    case "topic": renderTopic(parts[1]); break;
    case "quiz": renderQuizView(parts[1]); break;
    case "exam": renderExamSetup(); break;
    case "practice": renderPractice(); break;
    case "plan": renderPlan(); break;
    case "paths": renderPaths(); break;
    case "path": renderPath(parts[1]); break;
    case "stats": renderStats(); break;
    case "glossary": renderGlossary(query.term); break;
    case "favorites": renderFavorites(); break;
    case "tools": renderTools(); break;
    case "cheatsheet": renderCheatsheet(parts[1]); break;
    default: renderDashboard();
  }
  highlightActiveNav();
  closeMobileNav();
  showAchievementToasts();
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Dashboard
 * ------------------------------------------------------------------ */

function renderDashboard() {
  const lvl = stats.getLevel();
  const streak = stats.getStreak();
  const today = stats.answeredToday();
  const goal = stats.getDailyGoal();
  const goalPct = Math.min(100, Math.round((today / goal) * 100));

  const v = main();
  v.innerHTML = `
    <header class="page-head">
      <div>
        <h1>Willkommen zurück 👋</h1>
        <p class="lead">Deine Lernplattform für die IHK-Abschlussprüfung Fachinformatiker:in Systemintegration.</p>
      </div>
      <div class="view-toggle" role="group" aria-label="Ansicht wählen">
        <button class="${currentView === "lernfeld" ? "active" : ""}" data-view="lernfeld">nach Lernfeldern</button>
        <button class="${currentView === "pruefung" ? "active" : ""}" data-view="pruefung">nach Prüfungsbereichen</button>
      </div>
    </header>

    <section class="stat-strip">
      <div class="stat-pill"><span class="pill-num">${lvl.level}</span><span class="pill-label">Level</span></div>
      <div class="stat-pill"><span class="pill-num">${stats.getPoints()}</span><span class="pill-label">Punkte</span></div>
      <div class="stat-pill"><span class="pill-num">🔥 ${streak.current}</span><span class="pill-label">Tage-Streak</span></div>
      <div class="stat-pill"><span class="pill-num">${stats.getState().totals.answered}</span><span class="pill-label">Fragen</span></div>
      <div class="stat-pill"><span class="pill-num">${stats.overallAccuracy()}%</span><span class="pill-label">Trefferquote</span></div>
    </section>

    ${(() => { const d = stats.daysUntilExam(); return d != null ? `<a class="card countdown-banner" href="#/plan"><span class="countdown-num">${d}</span><span class="countdown-label">Tag${d === 1 ? "" : "e"} bis zur Prüfung – zum Lernplan →</span></a>` : ""; })()}

    <section class="card daily-card">
      <div class="daily-head"><h2>🎯 Tagesziel</h2><span>${today} / ${goal} Fragen</span></div>
      <div class="progress"><div class="progress-fill" style="width:${goalPct}%"></div></div>
      <div class="daily-actions">
        <a class="btn btn-primary" href="#/practice?mode=daily">Frage des Tages</a>
        <a class="btn" href="#/practice?mode=random">Zufallsabfrage</a>
        ${stats.weakQuestionIds().length ? `<a class="btn" href="#/practice?mode=weak">Schwachstellen üben (${stats.weakQuestionIds().length})</a>` : ""}
      </div>
    </section>

    <h2 class="section-title">Kategorien</h2>
    <section class="tiles" id="tiles"></section>
  `;

  $$(".view-toggle button", v).forEach((b) => b.addEventListener("click", () => {
    currentView = b.dataset.view;
    stats.setSetting("view", currentView);
    buildSidebar();
    renderDashboard();
  }));

  const tiles = $("#tiles", v);
  if (currentView === "lernfeld") {
    const byLf = content.topicsByLernfeld();
    Object.keys(lernfelder).forEach((lf) => {
      const list = byLf[lf]; if (!list) return;
      tiles.append(categoryTile(lernfelder[lf].title, lernfelder[lf].icon, list));
    });
  } else {
    bereiche.forEach((b) => {
      const list = content.topicsByBereich()[b.id]; if (!list) return;
      tiles.append(categoryTile(b.title, b.icon, list));
    });
  }
}

function categoryTile(title, icon, list) {
  const pct = Math.round(list.reduce((a, t) => a + stats.topicProgressPct(t), 0) / list.length);
  const tile = el("div", { class: "tile" });
  tile.innerHTML = `
    <div class="tile-icon">${icon}</div>
    <h3>${title}</h3>
    <p class="tile-count">${list.length} Themen</p>
    <div class="progress sm"><div class="progress-fill" style="width:${pct}%"></div></div>
    <span class="tile-pct">${pct}% gelernt</span>
    <ul class="tile-topics">${list.slice(0, 5).map((t) => `<li><a href="#/topic/${t.id}">${t.title}</a></li>`).join("")}${list.length > 5 ? `<li class="more">+ ${list.length - 5} weitere</li>` : ""}</ul>`;
  return tile;
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Thema
 * ------------------------------------------------------------------ */

function renderTopic(id) {
  const t = getTopic(id);
  if (!t) { main().innerHTML = `<p class="notice">Thema nicht gefunden.</p>`; return; }
  stats.markTopicViewed(id);
  stats.checkBereichCompletion(topics, bereiche);

  const fav = stats.isFavorite(id);
  const note = stats.getNote(id);
  const cat = currentView === "lernfeld" ? lernfelder[t.lernfeld].title : examAreas[t.examArea].title;

  const v = main();
  v.innerHTML = `
    <article class="topic">
      <header class="page-head topic-head">
        <div>
          <span class="crumb">${cat}</span>
          <h1>${t.icon || ""} ${t.title}</h1>
          <p class="lead">${t.summary}</p>
        </div>
        <div class="topic-actions">
          <button class="icon-btn fav-btn ${fav ? "active" : ""}" title="Favorit" aria-pressed="${fav}">${fav ? "⭐" : "☆"}</button>
          <a class="btn btn-small" href="#/cheatsheet/${t.id}">🖨️ Spickzettel</a>
        </div>
      </header>

      <div class="topic-body">
        ${t.sections.map((s) => `<section class="content-section"><h2>${s.heading}</h2>${s.html}</section>`).join("")}
        ${t.visual ? `<section class="content-section"><h2>Interaktive Darstellung</h2><div id="topic-visual"></div></section>` : ""}
        ${t.examples && t.examples.length ? `<section class="content-section example-block"><h2>💡 Praxisbeispiel${t.examples.length > 1 ? "e" : ""}</h2>${t.examples.map((e) => `<div class="example"><h4>${e.title}</h4>${e.html}</div>`).join("")}</section>` : ""}
        ${t.merksaetze && t.merksaetze.length ? `<section class="content-section merk-block"><h2>📌 Merksätze</h2><ul class="merk-list">${t.merksaetze.map((m) => `<li>${m}</li>`).join("")}</ul></section>` : ""}
      </div>

      <section class="content-section note-block">
        <h2>✏️ Deine Notiz</h2>
        <textarea id="topic-note" class="note-area" placeholder="Eigene Notizen zu diesem Thema …">${escapeHtml(note)}</textarea>
        <span class="note-saved" hidden>Gespeichert ✓</span>
      </section>

      <div class="topic-cta">
        <a class="btn btn-primary btn-lg" href="#/quiz/${t.id}">▶ Themen-Quiz starten (${(t.questionIds || []).length} Fragen)</a>
      </div>
    </article>`;

  // Visualisierung
  if (t.visual) tools.renderVisual(t.visual, $("#topic-visual", v));
  // Code-Blöcke aufwerten
  tools.enhanceCodeBlocks(v);
  // Breite Tabellen mobil scrollbar machen
  wrapTables($(".topic-body", v));
  // Glossar verlinken
  linkifyGlossary($(".topic-body", v));

  // Favorit
  $(".fav-btn", v).addEventListener("click", (e) => {
    const active = stats.toggleFavorite(id);
    e.currentTarget.classList.toggle("active", active);
    e.currentTarget.textContent = active ? "⭐" : "☆";
    e.currentTarget.setAttribute("aria-pressed", active);
  });
  // Notiz speichern (debounced)
  const ta = $("#topic-note", v);
  const saved = $(".note-saved", v);
  let noteTimer;
  ta.addEventListener("input", () => {
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { stats.setNote(id, ta.value); saved.hidden = false; setTimeout(() => (saved.hidden = true), 1200); }, 400);
  });
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Quiz (Themen-Quiz)
 * ------------------------------------------------------------------ */

function renderQuizView(topicId) {
  const t = getTopic(topicId);
  if (!t) { main().innerHTML = `<p class="notice">Thema nicht gefunden.</p>`; return; }
  const qs = quiz.questionsFromIds(t.questionIds || []);
  const v = main();
  v.innerHTML = `
    <header class="page-head"><div><span class="crumb">Themen-Quiz</span><h1>${t.title}</h1></div>
      <a class="btn btn-small" href="#/topic/${topicId}">← Zurück zum Thema</a></header>
    <div id="quiz-host"></div>`;
  const session = new quiz.QuizSession(quiz.shuffle(qs), {
    title: t.title,
    onAnswered: showAchievementToasts,
    onFinish: () => { location.hash = `#/topic/${topicId}`; },
  });
  session.mount($("#quiz-host", v));
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Üben & Wiederholen (Modi)
 * ------------------------------------------------------------------ */

function renderPractice() {
  const query = Object.fromEntries(new URLSearchParams((location.hash.split("?")[1]) || ""));
  const mode = query.mode;

  if (mode) { runPracticeMode(mode); return; }

  const weak = stats.weakQuestionIds().length;
  const due = stats.dueQuestionIds().length;
  const v = main();
  v.innerHTML = `
    <header class="page-head"><h1>🎯 Üben & Wiederholen</h1></header>
    <section class="mode-grid">
      <a class="mode-card" href="#/practice?mode=daily"><span class="mode-icon">📅</span><h3>Frage des Tages</h3><p>Jeden Tag eine neue, zufällig gewählte Frage.</p></a>
      <a class="mode-card" href="#/practice?mode=random"><span class="mode-icon">🎲</span><h3>Zufallsabfrage</h3><p>10 zufällige Fragen quer durch alle Themen.</p></a>
      <a class="mode-card ${weak ? "" : "disabled"}" href="${weak ? "#/practice?mode=weak" : "#"}"><span class="mode-icon">🩹</span><h3>Schwachstellen</h3><p>${weak ? `${weak} zuletzt falsch beantwortete Fragen gezielt wiederholen.` : "Noch keine Schwachstellen erfasst."}</p></a>
      <a class="mode-card" href="#/practice?mode=leitner"><span class="mode-icon">🗂️</span><h3>Karteikarten (Leitner)</h3><p>${due} fällige Karten nach dem Spaced-Repetition-Prinzip.</p></a>
      <a class="mode-card" href="#/practice?mode=flashall"><span class="mode-icon">🃏</span><h3>Alle Karteikarten</h3><p>Alle Karteikarten gemischt durchgehen.</p></a>
      <a class="mode-card" href="#/practice?mode=scenario"><span class="mode-icon">🧩</span><h3>Ganzheitliche Aufgaben</h3><p>${scenarios.length} handlungsorientierte Fallaufgaben mit mehreren Teilfragen – wie in der echten IHK-Prüfung.</p></a>
      <a class="mode-card" href="#/exam"><span class="mode-icon">📝</span><h3>Prüfungssimulation</h3><p>Realistischer Test mit Timer und Auswertung (AP1/AP2).</p></a>
    </section>`;
}

function runPracticeMode(mode) {
  const v = main();
  let list = [], title = "", isFlash = false, noShuffle = false;

  switch (mode) {
    case "scenario": {
      // Szenarien in der Reihenfolge belassen; nur die Reihenfolge der Fälle mischen.
      list = quiz.expandScenarios(quiz.shuffle(scenarios));
      title = "Ganzheitliche Aufgaben"; noShuffle = true; break;
    }
    case "daily": {
      list = [quiz.questionOfTheDay()]; title = "Frage des Tages"; break;
    }
    case "random": {
      list = quiz.shuffle(ALL_QUESTIONS).slice(0, 10); title = "Zufallsabfrage"; break;
    }
    case "weak": {
      list = quiz.questionsFromIds(stats.weakQuestionIds()); title = "Schwachstellen-Training"; break;
    }
    case "leitner": {
      const due = stats.dueQuestionIds();
      list = quiz.questionsFromIds(due).slice(0, 20);
      // Reine Karteikarten als FlashcardSession, sonst gemischtes Quiz
      isFlash = list.length > 0 && list.every((q) => q.type === "flashcard");
      title = "Spaced Repetition (Leitner)";
      break;
    }
    case "flashall": {
      list = quiz.shuffle(ALL_QUESTIONS.filter((q) => q.type === "flashcard"));
      isFlash = true; title = "Alle Karteikarten"; break;
    }
    default: location.hash = "#/practice"; return;
  }

  v.innerHTML = `
    <header class="page-head"><div><span class="crumb">Üben</span><h1>${title}</h1></div>
      <a class="btn btn-small" href="#/practice">← Modi</a></header>
    <div id="quiz-host"></div>`;
  const host = $("#quiz-host", v);

  if (isFlash) {
    new quiz.FlashcardSession(list, { onAnswered: showAchievementToasts, onFinish: () => (location.hash = "#/practice") }).mount(host);
  } else {
    new quiz.QuizSession(noShuffle ? list : quiz.shuffle(list), { title, onAnswered: showAchievementToasts, onFinish: () => (location.hash = "#/practice") }).mount(host);
  }
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Prüfungssimulation
 * ------------------------------------------------------------------ */

function renderExamSetup() {
  const v = main();
  v.innerHTML = `
    <header class="page-head"><h1>📝 Prüfungssimulation</h1></header>
    <p class="lead">Wähle einen Modus. Es wird ein gemischter Test mit Timer erstellt; am Ende erhältst du eine Auswertung.</p>
    <section class="mode-grid">
      <button class="mode-card" data-exam="ap1"><span class="mode-icon">🖥️</span><h3>AP1-Modus</h3><p>15 Fragen rund um IT-Arbeitsplatz, Hardware & Grundlagen. 20 Minuten.</p></button>
      <button class="mode-card" data-exam="ap2"><span class="mode-icon">🏗️</span><h3>AP2-Modus</h3><p>20 Fragen aus Netzwerk, Sicherheit, Administration & WiSo. 30 Minuten.</p></button>
      <button class="mode-card" data-exam="mix"><span class="mode-icon">🎲</span><h3>Großer Mix</h3><p>25 Fragen quer durch alle Bereiche. 35 Minuten.</p></button>
    </section>
    <div id="quiz-host"></div>`;

  $$("[data-exam]", v).forEach((b) => b.addEventListener("click", () => startExam(b.dataset.exam)));
}

function startExam(kind) {
  let pool = ALL_QUESTIONS, count = 20, time = 30 * 60, label = "AP2";
  if (kind === "ap1") {
    pool = ALL_QUESTIONS.filter((q) => { const t = getTopic(q.topicId); return t && t.examArea === "AP1"; });
    if (pool.length < 15) pool = ALL_QUESTIONS.filter((q) => { const t = getTopic(q.topicId); return t && (t.examArea === "AP1" || t.bereich === "hardware" || t.bereich === "netzwerk"); });
    count = 15; time = 20 * 60; label = "AP1";
  } else if (kind === "ap2") {
    pool = ALL_QUESTIONS.filter((q) => { const t = getTopic(q.topicId); return t && t.examArea !== "AP1"; });
    count = 20; time = 30 * 60; label = "AP2";
  } else {
    count = 25; time = 35 * 60; label = "Mix";
  }
  const list = quiz.shuffle(pool).slice(0, Math.min(count, pool.length));
  const host = $("#quiz-host");
  document.querySelector(".mode-grid").style.display = "none";
  new quiz.QuizSession(list, {
    title: `Prüfungssimulation ${label}`, exam: true, timeLimitSec: time,
    onAnswered: showAchievementToasts,
    onFinish: () => { location.hash = "#/stats"; },
  }).mount(host);
  host.scrollIntoView({ behavior: "smooth" });
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Geführte Lernpfade
 * ------------------------------------------------------------------ */

function pathProgress(p) {
  const ts = p.topicIds.map(getTopic).filter(Boolean);
  if (!ts.length) return 0;
  return Math.round(ts.reduce((a, t) => a + stats.topicProgressPct(t), 0) / ts.length);
}

function renderPaths() {
  const v = main();
  v.innerHTML = `
    <header class="page-head"><div>
      <h1>🧭 Geführte Lernpfade</h1>
      <p class="lead">Strukturierte Wege durch die Themen – Schritt für Schritt von den Grundlagen zur Prüfungsreife.</p>
    </div></header>
    <section class="tiles">
      ${paths.map((p) => { const pct = pathProgress(p); return `
        <a class="tile tile-link" href="#/path/${p.id}">
          <div class="tile-icon">${p.icon}</div>
          <h3>${escapeHtml(p.title)}</h3>
          <p class="tile-count">${p.topicIds.length} Themen</p>
          <div class="progress sm"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span class="tile-pct">${pct}% abgeschlossen</span>
          <p class="muted" style="font-size:.82rem;margin:.6rem 0 0">${escapeHtml(p.description)}</p>
        </a>`; }).join("")}
    </section>`;
}

function renderPath(id) {
  const p = getPath(id);
  if (!p) { main().innerHTML = `<p class="notice">Lernpfad nicht gefunden.</p>`; return; }
  const v = main();
  const steps = p.topicIds.map(getTopic).filter(Boolean).map((t) => ({ t, pct: stats.topicProgressPct(t) }));
  const next = steps.find((s) => s.pct < 100);
  const pct = pathProgress(p);

  v.innerHTML = `
    <header class="page-head"><div>
      <span class="crumb"><a href="#/paths">Lernpfade</a></span>
      <h1>${p.icon} ${escapeHtml(p.title)}</h1>
      <p class="lead">${escapeHtml(p.description)}</p>
    </div></header>

    <section class="card">
      <div class="daily-head"><h2>Fortschritt</h2><span>${pct}%</span></div>
      <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
      ${next ? `<div class="topic-cta"><a class="btn btn-primary btn-lg" href="#/topic/${next.t.id}">▶ Weiter: ${escapeHtml(next.t.title)}</a></div>`
        : `<p class="notice" style="margin-top:1rem">🎉 Pfad abgeschlossen! Teste dich in der Prüfungssimulation.</p>`}
    </section>

    <ol class="path-steps">
      ${steps.map((s, i) => `
        <li class="path-step ${s.pct >= 100 ? "done" : s === next ? "current" : ""}">
          <span class="path-num">${s.pct >= 100 ? "✓" : i + 1}</span>
          <a class="path-link" href="#/topic/${s.t.id}">
            <span class="path-title">${s.t.icon || ""} ${escapeHtml(s.t.title)}</span>
            <span class="path-bar"><span class="progress sm"><span class="progress-fill" style="width:${s.pct}%"></span></span></span>
          </a>
          <a class="btn btn-small" href="#/quiz/${s.t.id}">Quiz</a>
        </li>`).join("")}
    </ol>`;
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Lernplan & Prüfungs-Countdown
 * ------------------------------------------------------------------ */

function renderPlan() {
  const v = main();
  const examTs = stats.getExamDate();
  const days = stats.daysUntilExam();
  const examInput = examTs ? stats.todayKey(new Date(examTs)) : "";

  // Offene Themen (noch nicht vollständig gelernt), nach Fortschritt sortiert
  const openTopics = topics
    .map((t) => ({ t, pct: stats.topicProgressPct(t) }))
    .filter((x) => x.pct < 100)
    .sort((a, b) => a.pct - b.pct);
  const due = stats.dueQuestionIds().length;
  const weak = stats.weakQuestionIds().length;

  // Plan: offene Themen gleichmäßig auf die verbleibenden (max. 14 angezeigten) Tage verteilen
  const planDays = days && days > 0 ? Math.min(days, 14) : 7;
  const perDay = Math.max(1, Math.ceil(openTopics.length / planDays));
  const schedule = [];
  for (let d = 0; d < planDays && openTopics.length; d++) {
    const date = new Date(); date.setDate(date.getDate() + d);
    schedule.push({ date, items: openTopics.splice(0, perDay).map((x) => x.t) });
  }

  v.innerHTML = `
    <header class="page-head"><h1>🗓️ Lernplan & Prüfungs-Countdown</h1></header>

    <section class="card">
      <h2>Prüfungstermin</h2>
      <label class="goal-edit">Datum deiner Prüfung:
        <input type="date" id="exam-date" value="${examInput}" min="${stats.todayKey()}">
      </label>
      ${examTs ? `<button class="btn btn-small btn-danger" id="exam-clear" style="margin-left:.6rem">Termin entfernen</button>` : ""}
      ${days != null ? `<div class="countdown"><span class="countdown-num">${days}</span><span class="countdown-label">Tag${days === 1 ? "" : "e"} bis zur Prüfung</span></div>`
        : `<p class="muted" style="margin-top:.8rem">Setze einen Termin, um Countdown und Lernplan zu erhalten.</p>`}
    </section>

    <section class="stat-strip">
      <div class="stat-pill"><span class="pill-num">${openTopics.length + schedule.reduce((a, s) => a + s.items.length, 0)}</span><span class="pill-label">offene Themen</span></div>
      <div class="stat-pill"><span class="pill-num">${due}</span><span class="pill-label">fällige Wiederholungen</span></div>
      <div class="stat-pill"><span class="pill-num">${weak}</span><span class="pill-label">Schwachstellen</span></div>
    </section>

    <section class="card">
      <h2>📋 Dein Lernplan</h2>
      ${due || weak ? `<div class="daily-actions" style="margin-bottom:1rem">
        ${due ? `<a class="btn btn-primary" href="#/practice?mode=leitner">🔁 ${due} Wiederholungen fällig</a>` : ""}
        ${weak ? `<a class="btn" href="#/practice?mode=weak">🩹 ${weak} Schwachstellen üben</a>` : ""}
      </div>` : ""}
      ${schedule.length ? `<ol class="plan-list">${schedule.map((s) => `
        <li class="plan-day">
          <div class="plan-date">${s.date.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}</div>
          <div class="plan-items">${s.items.map((t) => `<a class="plan-topic" href="#/topic/${t.id}">${t.icon || "•"} ${escapeHtml(t.title)}</a>`).join("")}</div>
        </li>`).join("")}</ol>`
        : `<p class="notice">🎉 Alle Themen sind durchgearbeitet! Konzentriere dich auf Wiederholungen und Prüfungssimulationen.</p>`}
    </section>`;

  const dateInput = $("#exam-date", v);
  dateInput.addEventListener("change", () => {
    if (dateInput.value) {
      const ts = new Date(dateInput.value + "T00:00:00").getTime();
      stats.setExamDate(ts);
    }
    renderPlan();
  });
  $("#exam-clear", v)?.addEventListener("click", () => { stats.setExamDate(null); renderPlan(); });
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Statistik-Dashboard
 * ------------------------------------------------------------------ */

function renderStats() {
  const v = main();
  const totals = stats.getState().totals;
  const lvl = stats.getLevel();
  const weakest = stats.weakestBereiche(topics, bereiche, 3);
  const acc = stats.accuracyByBereich(topics, bereiche);

  v.innerHTML = `
    <header class="page-head"><h1>📈 Statistik & Fortschritt</h1>
      <div class="topic-actions">
        <button class="btn btn-small" id="export-btn">⬇ Export</button>
        <button class="btn btn-small" id="import-btn">⬆ Import</button>
        <button class="btn btn-small btn-danger" id="reset-btn">↺ Reset</button>
      </div>
    </header>

    ${stats.isUsingFallback() ? `<p class="notice warn">Hinweis: localStorage ist nicht verfügbar – der Lernstand wird nur im Arbeitsspeicher gehalten und geht beim Schließen verloren.</p>` : ""}

    <section class="stat-strip">
      <div class="stat-pill"><span class="pill-num">Lvl ${lvl.level}</span><span class="pill-label">${lvl.into}/${lvl.needed} XP</span></div>
      <div class="stat-pill"><span class="pill-num">${totals.answered}</span><span class="pill-label">Fragen</span></div>
      <div class="stat-pill"><span class="pill-num">${stats.overallAccuracy()}%</span><span class="pill-label">Trefferquote</span></div>
      <div class="stat-pill"><span class="pill-num">${totals.quizzesDone}</span><span class="pill-label">Quizze</span></div>
      <div class="stat-pill"><span class="pill-num">${totals.examsDone}</span><span class="pill-label">Prüfungen</span></div>
      <div class="stat-pill"><span class="pill-num">🔥 ${stats.getStreak().longest}</span><span class="pill-label">längster Streak</span></div>
    </section>

    <div class="stat-cols">
      <section class="card"><h2>Lernverlauf (14 Tage)</h2><div class="chart-wrap"><canvas id="chart-history"></canvas></div></section>
      <section class="card"><h2>Richtig / Falsch</h2><div class="chart-wrap"><canvas id="chart-acc"></canvas></div></section>
    </div>

    <section class="card"><h2>Trefferquote je Bereich</h2><div class="chart-wrap tall"><canvas id="chart-bereich"></canvas></div>
      <div class="bereich-bars">${bereiche.map((b) => { const r = acc[b.id]; const pct = r && r.pct != null ? r.pct : 0; return `<div class="bb-row"><span class="bb-label">${b.icon} ${b.title}</span><div class="progress sm"><div class="progress-fill" style="width:${pct}%"></div></div><span class="bb-pct">${r && r.pct != null ? pct + "%" : "—"}</span></div>`; }).join("")}</div>
    </section>

    <section class="card">
      <h2>🧭 Wissensradar</h2>
      <p class="muted">Vergleicht deine Quiz-Leistung mit deiner Selbsteinschätzung (1–5) je Bereich.</p>
      <div class="stat-cols radar-cols">
        <div class="chart-wrap tall"><canvas id="chart-radar"></canvas></div>
        <div class="self-grid">${bereiche.map((b) => `
          <div class="self-row">
            <span class="self-label">${b.icon} ${b.title.replace(/ \(.*\)/, "")}</span>
            <span class="self-stars" data-bereich="${b.id}" role="radiogroup" aria-label="Selbsteinschätzung ${escapeHtml(b.title)}">
              ${[1, 2, 3, 4, 5].map((n) => `<button class="self-star ${stats.getSelfAssessment(b.id) >= n ? "on" : ""}" data-val="${n}" title="${n}/5" aria-label="${n} von 5">★</button>`).join("")}
            </span>
          </div>`).join("")}</div>
      </div>
    </section>

    <section class="card weak-card">
      <h2>🩹 Schwachstellen-Empfehlung</h2>
      ${weakest.length ? `<p>Diese Bereiche solltest du als Nächstes üben:</p><ul class="weak-list">${weakest.map((w) => `<li><span>${w.title}</span><span class="bb-pct">${w.pct}%</span></li>`).join("")}</ul><a class="btn btn-primary" href="#/practice?mode=weak">Schwachstellen jetzt üben</a>` : `<p>Noch zu wenig Daten – beantworte ein paar Quizze, dann erhältst du hier gezielte Empfehlungen.</p>`}
    </section>

    <section class="card"><h2>🗓️ Aktivitäts-Heatmap</h2><div id="heatmap"></div></section>

    <section class="card"><h2>🏆 Erfolge</h2><div class="badges" id="badges"></div></section>

    <section class="card"><h2>🎯 Tagesziel</h2>
      <label class="goal-edit">Fragen pro Tag: <input type="number" id="goal-input" min="1" max="200" value="${stats.getDailyGoal()}"></label>
    </section>

    <input type="file" id="import-file" accept="application/json" hidden>`;

  // Diagramme
  stats.renderHistoryChart($("#chart-history", v), 14);
  stats.renderAccuracyDoughnut($("#chart-acc", v));
  stats.renderBereichChart($("#chart-bereich", v), topics, bereiche);
  stats.renderRadarChart($("#chart-radar", v), topics, bereiche);

  renderHeatmap($("#heatmap", v));
  renderBadges($("#badges", v));

  // Selbsteinschätzung (Sterne) → Radar live aktualisieren
  $$(".self-stars", v).forEach((group) => {
    const id = group.dataset.bereich;
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".self-star");
      if (!btn) return;
      let val = Number(btn.dataset.val);
      if (stats.getSelfAssessment(id) === val) val = 0; // erneuter Klick = zurücksetzen
      stats.setSelfAssessment(id, val);
      $$(".self-star", group).forEach((s) => s.classList.toggle("on", Number(s.dataset.val) <= val));
      stats.renderRadarChart($("#chart-radar", v), topics, bereiche);
    });
  });

  // Tagesziel
  $("#goal-input", v).addEventListener("change", (e) => stats.setDailyGoal(e.target.value));

  // Export/Import/Reset
  $("#export-btn", v).addEventListener("click", exportData);
  $("#import-btn", v).addEventListener("click", () => $("#import-file", v).click());
  $("#import-file", v).addEventListener("change", importData);
  $("#reset-btn", v).addEventListener("click", () => {
    if (confirm("Wirklich den gesamten Lernstand zurücksetzen? Das kann nicht rückgängig gemacht werden.")) {
      stats.resetAll(); router();
    }
  });
}

function renderHeatmap(container) {
  const data = stats.heatmapData(18);
  const max = Math.max(1, ...data.map((d) => d.count));
  const level = (c) => c === 0 ? 0 : c >= max * 0.75 ? 4 : c >= max * 0.5 ? 3 : c >= max * 0.25 ? 2 : 1;
  // in Wochenspalten gruppieren
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7));
  container.className = "heatmap";
  container.innerHTML = `<div class="heatmap-grid">${weeks.map((w) => `<div class="hm-week">${w.map((d) => `<span class="hm-cell l${level(d.count)}" title="${d.date}: ${d.count} Fragen"></span>`).join("")}</div>`).join("")}</div>
    <div class="hm-legend">weniger <span class="hm-cell l0"></span><span class="hm-cell l1"></span><span class="hm-cell l2"></span><span class="hm-cell l3"></span><span class="hm-cell l4"></span> mehr</div>`;
}

function renderBadges(container) {
  container.innerHTML = stats.ACHIEVEMENTS.map((a) => {
    const earned = stats.hasAchievement(a.id);
    return `<div class="badge-item ${earned ? "earned" : "locked"}" title="${a.desc}"><span class="badge-icon">${a.icon}</span><span class="badge-title">${a.title}</span><span class="badge-desc">${a.desc}</span></div>`;
  }).join("");
}

function exportData() {
  const blob = new Blob([stats.exportJSON()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: `fisi-lernstand-${stats.todayKey()}.json` });
  document.body.append(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  // Grobe Plausibilitätsprüfung vor dem Einlesen (Typ/Größe).
  const looksJson = /\.json$/i.test(file.name) || file.type === "application/json" || file.type === "";
  if (!looksJson) { showToast("⚠️", "Import abgebrochen", "Bitte eine JSON-Datei wählen.", "bad"); e.target.value = ""; return; }
  if (file.size > 5 * 1024 * 1024) { showToast("⚠️", "Datei zu groß", "Die Sicherung sollte unter 5 MB liegen.", "bad"); e.target.value = ""; return; }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      stats.importJSON(reader.result);
      showToast("✅", "Import erfolgreich", "Dein Lernstand wurde übernommen.", "good");
      router();
    } catch (err) {
      showToast("⚠️", "Import fehlgeschlagen", "Die Datei ist keine gültige Lernstand-Sicherung.", "bad");
    } finally {
      e.target.value = ""; // erlaubt erneutes Wählen derselben Datei
    }
  };
  reader.onerror = () => {
    showToast("⚠️", "Lesefehler", "Die Datei konnte nicht gelesen werden.", "bad");
    e.target.value = "";
  };
  reader.readAsText(file);
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Glossar
 * ------------------------------------------------------------------ */

function renderGlossary(focusTerm) {
  const v = main();
  const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term, "de"));
  v.innerHTML = `
    <header class="page-head"><h1>📖 Glossar</h1></header>
    <input id="gloss-filter" class="gloss-filter" placeholder="Begriff filtern …" autocomplete="off">
    <dl class="glossary-list">
      ${sorted.map((g) => `<div class="gloss-entry" id="gloss-${encodeURIComponent(g.term)}" data-term="${g.term.toLowerCase()}">
        <dt>${g.term}${g.abbr ? ` <span class="gloss-abbr">(${g.abbr})</span>` : ""}</dt>
        <dd>${g.definition}${g.related && g.related.length ? ` <a class="gloss-link" href="#/topic/${g.related[0]}">→ Thema</a>` : ""}</dd>
      </div>`).join("")}
    </dl>`;
  const filter = $("#gloss-filter", v);
  filter.addEventListener("input", () => {
    const q = filter.value.toLowerCase();
    $$(".gloss-entry", v).forEach((e) => { e.style.display = e.dataset.term.includes(q) || e.textContent.toLowerCase().includes(q) ? "" : "none"; });
  });
  if (focusTerm) {
    const target = $(`#gloss-${CSS.escape(encodeURIComponent(focusTerm))}`, v);
    if (target) { target.classList.add("highlight"); target.scrollIntoView({ behavior: "smooth", block: "center" }); }
  }
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Favoriten
 * ------------------------------------------------------------------ */

function renderFavorites() {
  const v = main();
  const favs = stats.getFavorites().map(getTopic).filter(Boolean);
  v.innerHTML = `
    <header class="page-head"><h1>⭐ Favoriten</h1></header>
    ${favs.length ? `<section class="tiles">${favs.map((t) => `<a class="tile tile-link" href="#/topic/${t.id}"><div class="tile-icon">${t.icon || "⭐"}</div><h3>${t.title}</h3><p class="tile-count">${(t.questionIds || []).length} Fragen</p></a>`).join("")}</section>`
      : `<p class="notice">Noch keine Favoriten. Öffne ein Thema und tippe auf ⭐, um es hier zu sammeln.</p>`}`;
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Werkzeuge
 * ------------------------------------------------------------------ */

function renderTools() {
  const v = main();
  v.innerHTML = `
    <header class="page-head"><h1>🛠️ Interaktive Werkzeuge</h1></header>
    <div class="tools-tabs" role="tablist">
      <button class="tools-tab active" data-tool="subnet" role="tab">🧮 Subnetting</button>
      <button class="tools-tab" data-tool="ipv6" role="tab">🆕 IPv6</button>
      <button class="tools-tab" data-tool="number" role="tab">🔢 Zahlensysteme</button>
      <button class="tools-tab" data-tool="logic" role="tab">🔌 Logik</button>
      <button class="tools-tab" data-tool="netzplan" role="tab">📈 Netzplan</button>
      <button class="tools-tab" data-tool="sql" role="tab">🧾 SQL</button>
      <button class="tools-tab" data-tool="command" role="tab">⌨️ Befehle</button>
      <button class="tools-tab" data-tool="cli" role="tab">🖥️ Terminal</button>
      <button class="tools-tab" data-tool="osi" role="tab">🗂️ OSI-Modell</button>
      <button class="tools-tab" data-tool="pomodoro" role="tab">⏱️ Pomodoro</button>
    </div>
    <div id="tool-host"></div>`;
  const host = $("#tool-host", v);
  const open = (tool) => {
    clearPomodoro();
    $$(".tools-tab", v).forEach((b) => b.classList.toggle("active", b.dataset.tool === tool));
    if (tool === "subnet") tools.renderSubnettingTrainer(host);
    else if (tool === "ipv6") tools.renderIpv6Trainer(host);
    else if (tool === "number") tools.renderNumberConverter(host);
    else if (tool === "logic") tools.renderLogicTrainer(host);
    else if (tool === "netzplan") tools.renderNetzplan(host);
    else if (tool === "sql") tools.renderSqlSandbox(host);
    else if (tool === "command") tools.renderCommandTrainer(host);
    else if (tool === "cli") tools.renderCliSimulator(host);
    else if (tool === "osi") { host.innerHTML = `<div class="tool-card"><h3>🗂️ Interaktives OSI-Modell</h3><div id="osi-host"></div></div>`; tools.renderVisual("osi", $("#osi-host", host)); }
    else if (tool === "pomodoro") { host.innerHTML = `<div class="tool-card"><h3>⏱️ Pomodoro-Lerntimer</h3><div id="pomo-host"></div></div>`; pomodoroCleanup = tools.renderPomodoro($("#pomo-host", host)); }
  };
  $$(".tools-tab", v).forEach((b) => b.addEventListener("click", () => open(b.dataset.tool)));
  open("subnet");
}

/* ------------------------------------------------------------------ *
 *  Ansicht: Spickzettel (Druckansicht)
 * ------------------------------------------------------------------ */

function renderCheatsheet(id) {
  const t = getTopic(id);
  if (!t) { main().innerHTML = `<p class="notice">Thema nicht gefunden.</p>`; return; }
  const v = main();
  v.innerHTML = `
    <header class="page-head no-print"><div><span class="crumb">Spickzettel</span><h1>${t.title}</h1></div>
      <div class="topic-actions"><button class="btn btn-small" id="cheat-print">🖨️ Drucken</button><a class="btn btn-small" href="#/topic/${id}">← Thema</a></div></header>
    <article class="cheatsheet">
      <h2 class="print-only">${t.title}</h2>
      <p class="cheat-summary">${t.summary}</p>
      ${t.cheatsheet && t.cheatsheet.length ? `<ul class="cheat-list">${t.cheatsheet.map((c) => `<li>${c}</li>`).join("")}</ul>` : ""}
      ${t.merksaetze && t.merksaetze.length ? `<h3>Merksätze</h3><ul class="cheat-list">${t.merksaetze.map((m) => `<li>${m}</li>`).join("")}</ul>` : ""}
    </article>`;
  $("#cheat-print", v)?.addEventListener("click", () => window.print());
}

/* ------------------------------------------------------------------ *
 *  Achievement-Toasts
 * ------------------------------------------------------------------ */

/**
 * Zeigt einen Toast an. `kind` (good|bad|info) steuert die Akzentfarbe.
 * Inhalt wird escaped, daher sicher auch für dynamische Texte.
 */
function showToast(icon, title, body = "", kind = "info", ms = 4200) {
  const host = $("#toasts");
  if (!host) return;
  const toast = el("div", { class: `toast toast-${kind}` },
    `<span class="toast-icon">${escapeHtml(icon)}</span><div><strong>${escapeHtml(title)}</strong>${body ? `<br>${escapeHtml(body)}` : ""}</div>`);
  host.append(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 400); }, ms);
}

function showAchievementToasts() {
  const popped = stats.popAchievements();
  popped.forEach((id, i) => {
    const a = stats.ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return;
    setTimeout(() => {
      const toast = el("div", { class: "toast achievement-toast" }, `<span class="toast-icon">${escapeHtml(a.icon)}</span><div><strong>Erfolg freigeschaltet!</strong><br>${escapeHtml(a.title)} – ${escapeHtml(a.desc)}</div>`);
      $("#toasts").append(toast);
      setTimeout(() => toast.classList.add("show"), 10);
      setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 400); }, 4200);
    }, i * 600);
  });
}

/* ------------------------------------------------------------------ *
 *  Mobile Navigation
 * ------------------------------------------------------------------ */

function openMobileNav() { document.body.classList.add("nav-open"); }
function closeMobileNav() { document.body.classList.remove("nav-open"); }

/* ------------------------------------------------------------------ *
 *  Initialisierung
 * ------------------------------------------------------------------ */

function init() {
  initTheme();
  buildSidebar();
  initSearch();

  $("#theme-toggle").addEventListener("click", toggleTheme);
  $("#burger").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  $("#nav-overlay").addEventListener("click", closeMobileNav);

  window.addEventListener("hashchange", router);
  // React auf State-Änderungen, die Streak/Punkte im Header betreffen (leichtgewichtig)
  stats.onChange(() => { /* Header wird bei Navigation neu gerendert; hier bewusst minimal */ });

  router();

  // Hinweis, falls localStorage nicht verfügbar ist (z. B. privater Modus):
  // Fortschritt wird dann nur temporär im Speicher gehalten.
  if (stats.isUsingFallback()) {
    setTimeout(() => showToast("ℹ️", "Speicher nicht verfügbar",
      "Dein Fortschritt wird nur temporär gespeichert (z. B. privater Modus). Nutze Export für eine Sicherung.", "info", 7000), 800);
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
