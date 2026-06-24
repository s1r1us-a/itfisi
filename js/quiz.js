/**
 * quiz.js — Abfrage-/Quiz-/Prüfungslogik der Lernplattform.
 *
 * Unterstützt alle Aufgabentypen mit sofortigem Feedback:
 *   mc-single, mc-multi, truefalse, cloze, match (Drag & Drop), flashcard, calc
 *
 * Modi (über buildSession-Aufrufe in app.js):
 *   - Themen-Quiz, Schwachstellen-Modus, Spaced Repetition (Leitner),
 *     Zufall/„Frage des Tages“, Prüfungssimulation (Timer + Auswertung)
 *
 * Die Klasse QuizSession rendert eine Frage nach der anderen in einen
 * Container und meldet Ergebnisse an stats.js.
 */

import * as stats from "./stats.js";
import { getQuestion, questions as ALL_QUESTIONS } from "../data/questions.js";

/* ------------------------------------------------------------------ *
 *  Hilfsfunktionen
 * ------------------------------------------------------------------ */

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function normalize(s) {
  return String(s).toLowerCase().trim().replace(/\s+/g, " ").replace(/[.,;]$/g, "");
}

/** Frage des Tages – deterministisch über das Datum. */
export function questionOfTheDay() {
  const key = stats.todayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return ALL_QUESTIONS[hash % ALL_QUESTIONS.length];
}

/** Stellt eine Fragenliste aus IDs zusammen (überspringt Unbekannte). */
export function questionsFromIds(ids) {
  return ids.map(getQuestion).filter(Boolean);
}

/**
 * „Faltet" eine Szenario-Aufgabe in ihre Teilaufgaben auf. Jede Teilaufgabe wird
 * eine normale Frage mit eigenem (synthetischem) id/topicId und behält den
 * gemeinsamen Kontext über `_scenario`-Metadaten, damit die Engine sie wie
 * gewohnt bewerten kann. So bleibt der Quiz-Kern unverändert.
 */
export function expandScenario(s) {
  return (s.parts || []).map((part, i) => ({
    ...part,
    id: `${s.id}-p${i + 1}`,
    topicId: part.topicId || s.topicId,
    difficulty: part.difficulty || s.difficulty || "mittel",
    _scenario: s.scenario,
    _scenarioTitle: s.title,
    _partIndex: i + 1,
    _partCount: s.parts.length,
  }));
}

/** Faltet mehrere Szenarien nacheinander auf (Reihenfolge bleibt erhalten). */
export function expandScenarios(list) {
  return list.flatMap(expandScenario);
}

/* ------------------------------------------------------------------ *
 *  QuizSession
 * ------------------------------------------------------------------ */

export class QuizSession {
  /**
   * @param {Array} questions   Fragenobjekte
   * @param {Object} opts        { title, exam:bool, timeLimitSec, onFinish }
   */
  constructor(questions, opts = {}) {
    this.questions = questions;
    this.opts = opts;
    this.index = 0;
    this.answered = [];          // {questionId, correct}
    this.locked = false;         // aktuelle Frage bereits beantwortet?
    this.timer = null;
    this.remaining = opts.timeLimitSec || 0;
  }

  mount(container) {
    this.container = container;
    if (this.questions.length === 0) {
      container.innerHTML = `<div class="quiz-empty"><p>Für diesen Modus sind aktuell keine Fragen verfügbar. Beantworte zuerst einige Themen-Quizze.</p></div>`;
      return;
    }
    if (this.opts.exam && this.remaining > 0) this.startTimer();
    this.renderCurrent();
  }

  startTimer() {
    const update = () => {
      const m = String(Math.floor(this.remaining / 60)).padStart(2, "0");
      const s = String(this.remaining % 60).padStart(2, "0");
      const el = this.container.querySelector(".quiz-timer");
      if (el) {
        el.textContent = `⏱ ${m}:${s}`;
        el.classList.toggle("danger", this.remaining <= 30);
      }
      if (this.remaining <= 0) { clearInterval(this.timer); this.finish(); return; }
      this.remaining -= 1;
    };
    update();
    this.timer = setInterval(update, 1000);
  }

  stopTimer() { if (this.timer) clearInterval(this.timer); this.timer = null; }

  get current() { return this.questions[this.index]; }

  renderCurrent() {
    const q = this.current;
    this.locked = false;
    const total = this.questions.length;
    const progressPct = Math.round((this.index / total) * 100);

    const head = `
      <div class="quiz-head">
        <div class="quiz-meta">
          <span class="quiz-counter">Frage ${this.index + 1} / ${total}</span>
          ${this.opts.exam && this.opts.timeLimitSec ? `<span class="quiz-timer">⏱</span>` : ""}
          <span class="badge badge-${q.difficulty || "mittel"}">${q.difficulty || "mittel"}</span>
          <span class="badge badge-type">${typeLabel(q.type)}</span>
        </div>
        <div class="quiz-progressbar"><div class="quiz-progressbar-fill" style="width:${progressPct}%"></div></div>
      </div>`;

    const body = `<div class="quiz-body" data-qtype="${q.type}">${this.renderQuestion(q)}</div>`;
    const feedback = `<div class="quiz-feedback" hidden></div>`;
    const foot = `
      <div class="quiz-foot">
        <button class="btn btn-primary quiz-check" type="button">Antwort prüfen</button>
        <button class="btn quiz-next" type="button" hidden>${this.index + 1 < total ? "Weiter →" : "Auswertung"}</button>
      </div>`;

    this.container.innerHTML = `<div class="quiz-card">${head}${body}${feedback}${foot}</div>`;
    if (this.opts.exam && this.opts.timeLimitSec) this.startTimerLabel();

    // Karteikarten werden per Selbsteinschätzung bewertet – kein „Prüfen“-Button
    if (q.type === "flashcard") this.container.querySelector(".quiz-check").hidden = true;

    this.bindQuestion(q);
    this.container.querySelector(".quiz-check").addEventListener("click", () => this.check());
    this.container.querySelector(".quiz-next").addEventListener("click", () => this.next());
  }

  startTimerLabel() {
    // sorgt dafür, dass das Label sofort gefüllt wird (Intervall läuft separat)
    const el = this.container.querySelector(".quiz-timer");
    if (el && this.opts.timeLimitSec) {
      const m = String(Math.floor(this.remaining / 60)).padStart(2, "0");
      const s = String(this.remaining % 60).padStart(2, "0");
      el.textContent = `⏱ ${m}:${s}`;
    }
  }

  /* ---------- Rendering je Typ ---------- */

  renderQuestion(q) {
    // Gemeinsamer Szenario-Kontext (bei ganzheitlichen Aufgaben)
    const scenarioBanner = q._scenario
      ? `<div class="scenario-context"><div class="scenario-head">🧩 ${escapeHtml(q._scenarioTitle || "Ganzheitliche Aufgabe")} · Teil ${q._partIndex}/${q._partCount}</div>${q._scenario}</div>`
      : "";
    const prompt = `<h3 class="quiz-question">${q.question}</h3>`;
    return scenarioBanner + this.renderBody(q, prompt);
  }

  renderBody(q, prompt) {
    switch (q.type) {
      case "mc-single":
      case "mc-multi":
        return prompt + this.renderChoices(q);
      case "truefalse":
        return prompt + this.renderTrueFalse();
      case "cloze":
        return this.renderCloze(q);
      case "match":
        return prompt + this.renderMatch(q);
      case "flashcard":
        return this.renderFlashcard(q);
      case "calc":
        return prompt + this.renderCalc();
      default:
        return prompt + `<p>Unbekannter Fragetyp.</p>`;
    }
  }

  renderChoices(q) {
    const multi = q.type === "mc-multi";
    const opts = q.options.map((o, i) =>
      `<label class="choice"><input type="${multi ? "checkbox" : "radio"}" name="choice" value="${i}"><span>${o}</span></label>`
    ).join("");
    return `<div class="choices" role="group">${opts}${multi ? `<p class="hint">Mehrfachauswahl möglich.</p>` : ""}</div>`;
  }

  renderTrueFalse() {
    return `<div class="choices choices-tf" role="group">
      <label class="choice"><input type="radio" name="choice" value="true"><span>✔ Wahr</span></label>
      <label class="choice"><input type="radio" name="choice" value="false"><span>✘ Falsch</span></label>
    </div>`;
  }

  renderCloze(q) {
    // q.question enthält Text mit "{{}}" je Lücke
    let i = 0;
    const html = escapeHtml(q.question).replace(/\{\{\}\}/g, () =>
      `<input class="cloze-input" data-blank="${i++}" type="text" autocomplete="off" aria-label="Lücke ${i}">`
    );
    return `<h3 class="quiz-question">Lückentext</h3><p class="cloze">${html}</p>`;
  }

  renderMatch(q) {
    const lefts = q.pairs.map((p, i) => `<li class="match-left" data-i="${i}">${p.left}</li>`).join("");
    const rights = shuffle(q.pairs.map((p, i) => ({ i, right: p.right })));
    const rightItems = rights.map((r) =>
      `<li class="match-right" draggable="true" data-i="${r.i}">${r.right}</li>`
    ).join("");
    return `
      <p class="hint">Ziehe die rechten Begriffe auf den passenden linken (oder tippe/klicke nacheinander an).</p>
      <div class="match-grid">
        <ul class="match-col match-targets">${q.pairs.map((p, i) =>
          `<li class="match-target" data-i="${i}"><span class="match-key">${p.left}</span><span class="match-drop" data-i="${i}" aria-label="Ablage"></span></li>`).join("")}</ul>
        <ul class="match-col match-pool">${rightItems}</ul>
      </div>`;
  }

  renderFlashcard(q) {
    return `
      <div class="flashcard" tabindex="0" role="button" aria-label="Karte umdrehen">
        <div class="flashcard-inner">
          <div class="flashcard-face flashcard-front"><span class="fc-label">Frage</span><p>${q.question}</p><span class="fc-hint">Klicken zum Umdrehen</span></div>
          <div class="flashcard-face flashcard-back"><span class="fc-label">Antwort</span><p>${q.back || q.explanation || ""}</p></div>
        </div>
      </div>
      <div class="quiz-foot fc-inline-rate" hidden>
        <button class="btn btn-danger fc-unknown" type="button">✗ Nicht gewusst</button>
        <button class="btn btn-success fc-known" type="button">✓ Gewusst</button>
      </div>`;
  }

  renderCalc() {
    return `<div class="calc-input-wrap"><input class="calc-input" type="text" autocomplete="off" placeholder="Deine Lösung …" aria-label="Lösung eingeben"></div>`;
  }

  /* ---------- Interaktionsbindung ---------- */

  bindQuestion(q) {
    if (q.type === "flashcard") {
      const card = this.container.querySelector(".flashcard");
      const rate = this.container.querySelector(".fc-inline-rate");
      const flip = () => { card.classList.toggle("flipped"); if (card.classList.contains("flipped")) rate.hidden = false; };
      card.addEventListener("click", flip);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
      this.container.querySelector(".fc-known").addEventListener("click", () => this.answerFlashcard(q, true));
      this.container.querySelector(".fc-unknown").addEventListener("click", () => this.answerFlashcard(q, false));
    }
    if (q.type === "match") this.bindMatch(q);
    if (q.type === "calc") {
      const inp = this.container.querySelector(".calc-input");
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") this.check(); });
    }
  }

  bindMatch(q) {
    let dragged = null;
    const pool = this.container.querySelector(".match-pool");
    const drops = this.container.querySelectorAll(".match-drop");

    this.container.querySelectorAll(".match-right").forEach((el) => {
      el.addEventListener("dragstart", () => { dragged = el; el.classList.add("dragging"); });
      el.addEventListener("dragend", () => { el.classList.remove("dragging"); });
      // Klick-Fallback (Mobile): erst rechts wählen, dann Ablage tippen
      el.addEventListener("click", () => {
        this.container.querySelectorAll(".match-right").forEach((x) => x.classList.remove("selected"));
        el.classList.add("selected");
      });
    });

    const place = (drop, item) => {
      if (!item) return;
      // bereits belegtes Element zurück in den Pool
      const existing = drop.querySelector(".match-right");
      if (existing) pool.appendChild(existing);
      drop.appendChild(item);
      item.classList.remove("selected", "dragging");
    };

    drops.forEach((drop) => {
      drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
      drop.addEventListener("dragleave", () => drop.classList.remove("over"));
      drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); place(drop, dragged); dragged = null; });
      drop.addEventListener("click", () => {
        const sel = this.container.querySelector(".match-right.selected");
        if (sel) place(drop, sel);
      });
    });
  }

  /* ---------- Prüfen ---------- */

  check() {
    if (this.locked) return;
    const q = this.current;
    const result = this.evaluate(q);
    if (result === null) return;          // keine Eingabe
    this.locked = true;

    this.showFeedback(q, result.correct, result.detail);
    stats.recordAnswer(q, result.correct);
    if (q.type === "calc" && /sub/i.test(q.id) && result.correct) stats.noteSubnetSolved();
    this.answered.push({ questionId: q.id, correct: result.correct });

    this.container.querySelector(".quiz-check").hidden = true;
    this.container.querySelector(".quiz-next").hidden = false;
    this.container.querySelector(".quiz-next").focus();

    if (typeof this.opts.onAnswered === "function") this.opts.onAnswered(result.correct);
  }

  evaluate(q) {
    switch (q.type) {
      case "mc-single": {
        const sel = this.container.querySelector('input[name="choice"]:checked');
        if (!sel) return null;
        const idx = parseInt(sel.value, 10);
        return { correct: idx === q.answer, detail: { selected: [idx] } };
      }
      case "mc-multi": {
        const sels = [...this.container.querySelectorAll('input[name="choice"]:checked')].map((e) => parseInt(e.value, 10));
        if (sels.length === 0) return null;
        const want = [...q.answer].sort().join(",");
        const got = [...sels].sort().join(",");
        return { correct: want === got, detail: { selected: sels } };
      }
      case "truefalse": {
        const sel = this.container.querySelector('input[name="choice"]:checked');
        if (!sel) return null;
        return { correct: (sel.value === "true") === q.answer, detail: {} };
      }
      case "cloze": {
        const inputs = [...this.container.querySelectorAll(".cloze-input")];
        if (inputs.some((i) => i.value.trim() === "")) return null;
        let allOk = true;
        inputs.forEach((inp) => {
          const accepted = q.blanks[+inp.dataset.blank].map(normalize);
          const ok = accepted.includes(normalize(inp.value));
          inp.classList.add(ok ? "ok" : "bad");
          if (!ok) allOk = false;
        });
        return { correct: allOk, detail: {} };
      }
      case "match": {
        let allOk = true;
        this.container.querySelectorAll(".match-drop").forEach((drop) => {
          const item = drop.querySelector(".match-right");
          const target = +drop.dataset.i;
          const ok = item && +item.dataset.i === target;
          drop.classList.add(ok ? "ok" : "bad");
          if (!ok) allOk = false;
        });
        return { correct: allOk, detail: {} };
      }
      case "calc": {
        const inp = this.container.querySelector(".calc-input");
        if (inp.value.trim() === "") return null;
        const accepted = [q.answer, ...(q.accept || [])].map(normalize);
        const ok = accepted.includes(normalize(inp.value));
        inp.classList.add(ok ? "ok" : "bad");
        return { correct: ok, detail: {} };
      }
      case "flashcard":
        // Karteikarten werden nicht über „Prüfen“, sondern über answerFlashcard bewertet.
        return null;
      default:
        return { correct: false, detail: {} };
    }
  }

  /** Selbsteinschätzung einer Karteikarte (gewusst / nicht gewusst). */
  answerFlashcard(q, known) {
    if (this.locked) return;
    this.locked = true;
    stats.recordAnswer(q, known);
    this.answered.push({ questionId: q.id, correct: known });
    this.container.querySelector(".fc-inline-rate").hidden = true;
    this.showFeedback(q, known, {});
    this.container.querySelector(".quiz-next").hidden = false;
    this.container.querySelector(".quiz-next").focus();
    if (typeof this.opts.onAnswered === "function") this.opts.onAnswered(known);
  }

  /* ---------- Feedback ---------- */

  showFeedback(q, correct, detail) {
    const fb = this.container.querySelector(".quiz-feedback");
    fb.hidden = false;
    fb.classList.toggle("correct", correct);
    fb.classList.toggle("wrong", !correct);

    // richtige Lösung sichtbar markieren bei MC
    if (q.type === "mc-single" || q.type === "mc-multi") {
      const want = q.type === "mc-multi" ? q.answer : [q.answer];
      this.container.querySelectorAll(".choice").forEach((label, i) => {
        const inp = label.querySelector("input");
        const i2 = parseInt(inp.value, 10);
        if (want.includes(i2)) label.classList.add("is-correct");
        else if (inp.checked) label.classList.add("is-wrong");
        inp.disabled = true;
      });
    }
    if (q.type === "truefalse") {
      this.container.querySelectorAll(".choice input").forEach((inp) => { inp.disabled = true; });
    }

    let solutionHtml = "";
    if (q.type === "calc" && q.solution) solutionHtml = `<div class="solution"><strong>Lösungsweg:</strong> ${escapeHtml(q.solution)}</div>`;
    if (q.type === "cloze") solutionHtml = `<div class="solution"><strong>Lösung:</strong> ${q.blanks.map((b) => b[0]).join(", ")}</div>`;
    if (q.type === "match") solutionHtml = `<div class="solution"><strong>Lösung:</strong><ul>${q.pairs.map((p) => `<li>${p.left} → ${p.right}</li>`).join("")}</ul></div>`;

    fb.innerHTML = `
      <p class="feedback-head">${correct ? "✓ Richtig!" : "✗ Leider falsch."}</p>
      ${solutionHtml}
      <p class="feedback-explain">${q.explanation || ""}</p>`;
  }

  next() {
    if (this.index + 1 < this.questions.length) {
      this.index += 1;
      this.renderCurrent();
      this.container.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      this.finish();
    }
  }

  finish() {
    this.stopTimer();
    const total = this.answered.length;
    const correct = this.answered.filter((a) => a.correct).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;

    if (this.opts.exam) stats.markExamDone(pct);
    else stats.markQuizDone();

    const passed = pct >= 50;
    const wrongList = this.answered.filter((a) => !a.correct)
      .map((a) => { const q = getQuestion(a.questionId); return q ? `<li>${q.question}</li>` : ""; }).join("");

    this.container.innerHTML = `
      <div class="quiz-result ${passed ? "pass" : "fail"}">
        <div class="result-score">
          <svg viewBox="0 0 120 120" class="score-ring" aria-hidden="true">
            <circle cx="60" cy="60" r="52" class="ring-bg"></circle>
            <circle cx="60" cy="60" r="52" class="ring-fg" style="stroke-dasharray:${2 * Math.PI * 52};stroke-dashoffset:${2 * Math.PI * 52 * (1 - pct / 100)}"></circle>
          </svg>
          <div class="score-num">${pct}%</div>
        </div>
        <h3>${passed ? "Geschafft! 🎉" : "Weiter üben! 💪"}</h3>
        <p>${correct} von ${total} richtig${this.opts.exam ? " (Prüfungssimulation)" : ""}.</p>
        ${wrongList ? `<details class="result-wrong"><summary>Falsch beantwortete Fragen (${total - correct})</summary><ul>${wrongList}</ul></details>` : ""}
        <div class="result-actions">
          <button class="btn btn-primary result-restart" type="button">Erneut versuchen</button>
          <button class="btn result-close" type="button">Schließen</button>
        </div>
      </div>`;

    this.container.querySelector(".result-restart").addEventListener("click", () => {
      this.index = 0; this.answered = []; this.remaining = this.opts.timeLimitSec || 0;
      this.mount(this.container);
    });
    this.container.querySelector(".result-close").addEventListener("click", () => {
      if (typeof this.opts.onFinish === "function") this.opts.onFinish({ pct, correct, total });
    });
  }
}

function typeLabel(type) {
  return {
    "mc-single": "Multiple Choice", "mc-multi": "Mehrfachauswahl", "truefalse": "Wahr/Falsch",
    "cloze": "Lückentext", "match": "Zuordnung", "flashcard": "Karteikarte", "calc": "Rechnen",
  }[type] || type;
}

/* ------------------------------------------------------------------ *
 *  Flashcard-Selbsteinschätzung als eigenständiger Helfer
 *  (wird von app.js für den Karteikarten-Modus genutzt)
 * ------------------------------------------------------------------ */

/**
 * Spezialisierte Karteikarten-Session mit „gewusst/nicht gewusst“-Bewertung
 * für den Leitner-/Karteikarten-Modus.
 */
export class FlashcardSession {
  constructor(cards, opts = {}) {
    this.cards = cards;
    this.opts = opts;
    this.index = 0;
    this.known = 0;
  }
  mount(container) {
    this.container = container;
    if (this.cards.length === 0) {
      container.innerHTML = `<div class="quiz-empty"><p>Keine Karteikarten fällig. 🎉</p></div>`;
      return;
    }
    this.render();
  }
  render() {
    const q = this.cards[this.index];
    const box = stats.getBox(q.id);
    this.container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-head"><span class="quiz-counter">Karte ${this.index + 1} / ${this.cards.length}</span>
        <span class="badge badge-type">Leitner-Box ${box}</span></div>
        <div class="flashcard" tabindex="0" role="button" aria-label="Karte umdrehen">
          <div class="flashcard-inner">
            <div class="flashcard-face flashcard-front"><span class="fc-label">Frage</span><p>${q.question}</p><span class="fc-hint">Klicken zum Umdrehen</span></div>
            <div class="flashcard-face flashcard-back"><span class="fc-label">Antwort</span><p>${q.back || q.explanation}</p></div>
          </div>
        </div>
        <div class="quiz-foot fc-rate" hidden>
          <button class="btn btn-danger fc-unknown" type="button">✗ Nicht gewusst</button>
          <button class="btn btn-success fc-known" type="button">✓ Gewusst</button>
        </div>
      </div>`;
    const card = this.container.querySelector(".flashcard");
    const rate = this.container.querySelector(".fc-rate");
    const flip = () => { card.classList.toggle("flipped"); if (card.classList.contains("flipped")) rate.hidden = false; };
    card.addEventListener("click", flip);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    this.container.querySelector(".fc-known").addEventListener("click", () => this.rate(q, true));
    this.container.querySelector(".fc-unknown").addEventListener("click", () => this.rate(q, false));
  }
  rate(q, correct) {
    stats.recordAnswer(q, correct);
    if (correct) this.known += 1;
    if (typeof this.opts.onAnswered === "function") this.opts.onAnswered(correct);
    if (this.index + 1 < this.cards.length) { this.index += 1; this.render(); }
    else this.finish();
  }
  finish() {
    stats.markQuizDone();
    this.container.innerHTML = `
      <div class="quiz-result pass">
        <h3>Durchlauf abgeschlossen 🎉</h3>
        <p>${this.known} von ${this.cards.length} Karten gewusst. Die Karten wurden gemäß Leitner-Prinzip einsortiert.</p>
        <div class="result-actions"><button class="btn result-close" type="button">Schließen</button></div>
      </div>`;
    this.container.querySelector(".result-close").addEventListener("click", () => {
      if (typeof this.opts.onFinish === "function") this.opts.onFinish();
    });
  }
}
