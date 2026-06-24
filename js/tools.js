/**
 * tools.js — Interaktive Lernwerkzeuge der Plattform.
 *
 * Enthält:
 *  - Subnetting-Trainer (Zufallsaufgaben, Eingabeprüfung, Lösungsweg binär/dezimal)
 *  - Befehls-Trainer (PowerShell/Bash/SQL/CLI mit Lösungsprüfung)
 *  - interaktives OSI-Modell (anklickbare Schichten)
 *  - klickbare/animierte Schaubilder: DORA, TCP-Handshake, RAID, AD-Struktur
 *  - Pomodoro-/Lerntimer
 *  - Code-Highlighting (highlight.js, defensiv) + „Kopieren“-Button
 *
 * Alle Funktionen sind defensiv: fehlt eine CDN-Bibliothek, bleibt die
 * Kernfunktion erhalten.
 */

import * as stats from "./stats.js";

/* ================================================================== *
 *  Code-Highlighting & Kopier-Buttons
 * ================================================================== */

/** Hebt alle <code class="language-…"> in einem Container hervor und ergänzt Kopier-Buttons. */
export function enhanceCodeBlocks(root) {
  root.querySelectorAll("pre > code").forEach((code) => {
    if (code.dataset.enhanced) return;
    code.dataset.enhanced = "1";
    if (typeof hljs !== "undefined") {
      try { hljs.highlightElement(code); } catch (e) { /* ignorieren */ }
    }
    const pre = code.parentElement;
    if (pre.querySelector(".copy-btn")) return;
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.textContent = "Kopieren";
    btn.addEventListener("click", async () => {
      const text = code.innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Kopiert ✓";
      } catch (e) {
        // Fallback ohne Clipboard-API
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); btn.textContent = "Kopiert ✓"; } catch (_) { btn.textContent = "Fehler"; }
        ta.remove();
      }
      setTimeout(() => (btn.textContent = "Kopieren"), 1500);
    });
    pre.appendChild(btn);
  });
}

/* ================================================================== *
 *  Subnetting-Trainer
 * ================================================================== */

function toBin(n) { return n.toString(2).padStart(8, "0"); }
function maskFromCidr(cidr) {
  const octets = [0, 0, 0, 0];
  for (let i = 0; i < cidr; i++) octets[Math.floor(i / 8)] += 1 << (7 - (i % 8));
  return octets;
}
function randomIp() { return [
  Math.floor(Math.random() * 223) + 1,
  Math.floor(Math.random() * 256),
  Math.floor(Math.random() * 256),
  Math.floor(Math.random() * 256),
]; }

/** Berechnet Netz, Broadcast, erste/letzte Hostadresse und Hostanzahl. */
export function subnetInfo(ip, cidr) {
  const mask = maskFromCidr(cidr);
  const ipNum = ip.reduce((a, o, i) => a + (o << (8 * (3 - i))), 0) >>> 0;
  const maskNum = mask.reduce((a, o, i) => a + (o << (8 * (3 - i))), 0) >>> 0;
  const netNum = (ipNum & maskNum) >>> 0;
  const bcastNum = (netNum | (~maskNum >>> 0)) >>> 0;
  const toOct = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const hostBits = 32 - cidr;
  const hosts = hostBits <= 1 ? Math.max(0, 2 ** hostBits - 2) : 2 ** hostBits - 2;
  return {
    mask, maskStr: mask.join("."),
    network: toOct(netNum).join("."),
    broadcast: toOct(bcastNum).join("."),
    firstHost: hosts > 0 ? toOct((netNum + 1) >>> 0).join(".") : "—",
    lastHost: hosts > 0 ? toOct((bcastNum - 1) >>> 0).join(".") : "—",
    hosts,
  };
}

export function renderSubnettingTrainer(container) {
  let current = null;

  function newTask() {
    const ip = randomIp();
    const cidr = 8 + Math.floor(Math.random() * 22); // /8 .. /29
    current = { ip, cidr, info: subnetInfo(ip, cidr) };
    draw();
  }

  function draw() {
    const { ip, cidr } = current;
    container.innerHTML = `
      <div class="tool-card subnet-trainer">
        <div class="tool-head"><h3>🧮 Subnetting-Trainer</h3>
          <button class="btn btn-small subnet-new" type="button">Neue Aufgabe</button></div>
        <p class="subnet-task">Gegeben: <code>${ip.join(".")}/${cidr}</code></p>
        <div class="subnet-grid">
          <label>Subnetzmaske<input class="s-mask" placeholder="z. B. 255.255.255.0"></label>
          <label>Netzadresse<input class="s-net" placeholder="Netz-ID"></label>
          <label>Broadcast<input class="s-bc" placeholder="Broadcast"></label>
          <label>Nutzbare Hosts<input class="s-hosts" placeholder="Anzahl" inputmode="numeric"></label>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary subnet-check" type="button">Prüfen</button>
          <button class="btn subnet-solution" type="button">Lösungsweg</button>
        </div>
        <div class="subnet-result" hidden></div>
      </div>`;

    container.querySelector(".subnet-new").addEventListener("click", newTask);
    container.querySelector(".subnet-check").addEventListener("click", check);
    container.querySelector(".subnet-solution").addEventListener("click", showSolution);
    container.querySelectorAll(".subnet-grid input").forEach((i) =>
      i.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); }));
  }

  function val(sel) { return (container.querySelector(sel)?.value ?? "").trim(); }

  function check() {
    const inf = current.info;
    const checks = [
      [".s-mask", inf.maskStr], [".s-net", inf.network],
      [".s-bc", inf.broadcast], [".s-hosts", String(inf.hosts)],
    ];
    let allOk = true;
    checks.forEach(([sel, expect]) => {
      const el = container.querySelector(sel);
      const ok = el.value.trim().replace(/\s/g, "") === expect.replace(/\s/g, "");
      el.classList.toggle("ok", ok);
      el.classList.toggle("bad", !ok);
      if (!ok) allOk = false;
    });
    const res = container.querySelector(".subnet-result");
    res.hidden = false;
    res.className = "subnet-result " + (allOk ? "correct" : "wrong");
    res.innerHTML = allOk
      ? `<p>✓ Alles korrekt! Stark.</p>`
      : `<p>✗ Noch nicht alles richtig. Tipp „Lösungsweg“ zeigt die Herleitung.</p>`;
    if (allOk) stats.noteSubnetSolved();
  }

  function showSolution() {
    const { ip, cidr, info } = current;
    const res = container.querySelector(".subnet-result");
    res.hidden = false;
    res.className = "subnet-result solution-box";
    const blockSize = 256 - info.mask[Math.min(3, Math.floor(cidr / 8))];
    res.innerHTML = `
      <h4>Lösungsweg</h4>
      <table class="subnet-sol">
        <tr><th>IP (dezimal)</th><td>${ip.join(".")}</td></tr>
        <tr><th>IP (binär)</th><td class="mono">${ip.map(toBin).join(".")}</td></tr>
        <tr><th>Maske /${cidr}</th><td>${info.maskStr}<br><span class="mono">${info.mask.map(toBin).join(".")}</span></td></tr>
        <tr><th>Netzadresse</th><td>${info.network} <span class="muted">(Host-Bits = 0)</span></td></tr>
        <tr><th>Broadcast</th><td>${info.broadcast} <span class="muted">(Host-Bits = 1)</span></td></tr>
        <tr><th>Erster Host</th><td>${info.firstHost}</td></tr>
        <tr><th>Letzter Host</th><td>${info.lastHost}</td></tr>
        <tr><th>Nutzbare Hosts</th><td>2<sup>${32 - cidr}</sup> − 2 = <strong>${info.hosts}</strong></td></tr>
      </table>
      <p class="muted">Blockgröße im relevanten Oktett: 256 − ${info.mask[Math.min(3, Math.floor(cidr / 8))]} = ${blockSize || 256}.</p>`;
  }

  newTask();
}

/* ================================================================== *
 *  Befehls-Trainer (CLI / SQL / PowerShell / Bash)
 * ================================================================== */

const COMMAND_TASKS = [
  { prompt: "Linux: Zeige den Inhalt des aktuellen Verzeichnisses (lang, inkl. versteckter Dateien).", accept: ["ls -la", "ls -al", "ls -la .", "ls -lah"], hint: "ls mit Optionen -l und -a" },
  { prompt: "Linux: Ändere die Rechte von skript.sh auf rwxr-xr-x (oktal).", accept: ["chmod 755 skript.sh", "chmod 0755 skript.sh"], hint: "chmod <oktal> <datei>" },
  { prompt: "Windows: Zeige die vollständige IP-Konfiguration an.", accept: ["ipconfig /all", "ipconfig/all"], hint: "ipconfig mit Schalter /all" },
  { prompt: "Netzwerk: Prüfe die Erreichbarkeit von 8.8.8.8.", accept: ["ping 8.8.8.8"], hint: "ping <ziel>" },
  { prompt: "PowerShell: Liste alle laufenden Dienste auf.", accept: ["get-service", "get-service | where-object {$_.status -eq 'running'}"], hint: "Get-Service (Verb-Nomen)" },
  { prompt: "SQL: Wähle alle Spalten der Tabelle kunde aus.", accept: ["select * from kunde", "select * from kunde;"], hint: "SELECT * FROM <tabelle>" },
  { prompt: "SQL: Zähle alle Zeilen der Tabelle bestellung.", accept: ["select count(*) from bestellung", "select count(*) from bestellung;"], hint: "COUNT(*)" },
  { prompt: "Linux: Suche in zugriff.log nach der Zeichenkette '404'.", accept: ["grep 404 zugriff.log", "grep '404' zugriff.log", 'grep "404" zugriff.log'], hint: "grep <muster> <datei>" },
  { prompt: "Netzwerk: Zeige die Routing-Tabelle (Linux, modern).", accept: ["ip route", "ip r", "ip route show"], hint: "ip route" },
  { prompt: "Windows: Zeige alle aktiven Netzwerkverbindungen und Ports.", accept: ["netstat -an", "netstat -ano"], hint: "netstat mit -a und -n" },
];

export function renderCommandTrainer(container) {
  let task = null;
  function pick() { task = COMMAND_TASKS[Math.floor(Math.random() * COMMAND_TASKS.length)]; draw(); }
  function draw() {
    container.innerHTML = `
      <div class="tool-card cmd-trainer">
        <div class="tool-head"><h3>⌨️ Befehls-Trainer</h3>
          <button class="btn btn-small cmd-new" type="button">Nächste</button></div>
        <p class="cmd-task">${task.prompt}</p>
        <div class="cmd-line"><span class="cmd-prompt">$</span><input class="cmd-input" autocomplete="off" spellcheck="false" placeholder="Befehl eingeben …"></div>
        <div class="tool-actions">
          <button class="btn btn-primary cmd-check" type="button">Prüfen</button>
          <button class="btn cmd-hint" type="button">Tipp</button>
        </div>
        <div class="cmd-result" hidden></div>
      </div>`;
    const input = container.querySelector(".cmd-input");
    input.focus();
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
    container.querySelector(".cmd-check").addEventListener("click", check);
    container.querySelector(".cmd-new").addEventListener("click", pick);
    container.querySelector(".cmd-hint").addEventListener("click", () => {
      const r = container.querySelector(".cmd-result"); r.hidden = false;
      r.className = "cmd-result hint"; r.textContent = "💡 " + task.hint;
    });
  }
  function check() {
    const v = container.querySelector(".cmd-input").value.toLowerCase().trim().replace(/\s+/g, " ");
    const ok = task.accept.some((a) => a.toLowerCase() === v);
    const r = container.querySelector(".cmd-result");
    r.hidden = false;
    r.className = "cmd-result " + (ok ? "correct" : "wrong");
    r.innerHTML = ok ? "✓ Korrekt!" : `✗ Nicht ganz. Erwartet z. B.: <code>${task.accept[0]}</code>`;
  }
  pick();
}

/* ================================================================== *
 *  Visualisierungen (in Themen eingebettet, über topic.visual)
 * ================================================================== */

/** Wählt anhand des visual-Schlüssels die passende Visualisierung. */
export function renderVisual(kind, container) {
  switch (kind) {
    case "osi":  return renderOsiModel(container);
    case "dora": return renderDora(container);
    case "tcp":  return renderTcpHandshake(container);
    case "raid": return renderRaid(container);
    case "ad":   return renderAdTree(container);
    default: return false;
  }
}

const OSI_LAYERS = [
  { n: 7, name: "Anwendung", pdu: "Daten", info: "Schnittstelle zur Anwendung.", proto: "HTTP, FTP, SMTP, DNS, DHCP" },
  { n: 6, name: "Darstellung", pdu: "Daten", info: "Kodierung, Verschlüsselung, Kompression.", proto: "TLS, ASCII, JPEG" },
  { n: 5, name: "Sitzung", pdu: "Daten", info: "Auf-/Abbau & Steuerung von Verbindungen.", proto: "NetBIOS, RPC" },
  { n: 4, name: "Transport", pdu: "Segment", info: "Ende-zu-Ende, Ports, Segmentierung.", proto: "TCP, UDP" },
  { n: 3, name: "Vermittlung", pdu: "Paket", info: "Logische Adressierung & Routing.", proto: "IP, ICMP (Router)" },
  { n: 2, name: "Sicherung", pdu: "Frame", info: "MAC-Adressen, Rahmen, Fehlererkennung.", proto: "Ethernet, ARP (Switch)" },
  { n: 1, name: "Bitübertragung", pdu: "Bit", info: "Bits auf das Medium.", proto: "Kabel, Stecker (Hub)" },
];

function renderOsiModel(container) {
  container.innerHTML = `
    <div class="osi-model" role="list">
      ${OSI_LAYERS.map((l) => `
        <button class="osi-layer" role="listitem" data-n="${l.n}" aria-expanded="false">
          <span class="osi-num">${l.n}</span>
          <span class="osi-name">${l.name}</span>
          <span class="osi-pdu">${l.pdu}</span>
        </button>`).join("")}
      <div class="osi-detail" aria-live="polite"><p>Klicke eine Schicht an, um Aufgaben und Protokolle zu sehen.</p></div>
    </div>`;
  const detail = container.querySelector(".osi-detail");
  container.querySelectorAll(".osi-layer").forEach((btn) => {
    btn.addEventListener("click", () => {
      const l = OSI_LAYERS.find((x) => x.n === +btn.dataset.n);
      container.querySelectorAll(".osi-layer").forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-expanded", "false"); });
      btn.classList.add("active"); btn.setAttribute("aria-expanded", "true");
      detail.innerHTML = `<h4>Schicht ${l.n}: ${l.name}</h4><p>${l.info}</p><p><strong>Beispiele:</strong> ${l.proto}</p><p><strong>PDU:</strong> ${l.pdu}</p>`;
    });
  });
  return true;
}

function renderDora(container) {
  const steps = [
    { k: "D", t: "Discover", d: "Client sucht per Broadcast einen DHCP-Server." },
    { k: "O", t: "Offer", d: "Server bietet eine IP-Adresse an." },
    { k: "R", t: "Request", d: "Client fordert das Angebot verbindlich an." },
    { k: "A", t: "Acknowledge", d: "Server bestätigt; die Lease-Zeit beginnt." },
  ];
  container.innerHTML = `
    <div class="flow dora-flow">
      ${steps.map((s, i) => `
        <button class="flow-step" data-i="${i}">
          <span class="flow-badge">${s.k}</span>
          <span class="flow-title">${s.t}</span>
        </button>${i < steps.length - 1 ? '<span class="flow-arrow">→</span>' : ""}`).join("")}
    </div>
    <div class="flow-detail" aria-live="polite"><p>Klicke einen Schritt an.</p></div>`;
  const detail = container.querySelector(".flow-detail");
  container.querySelectorAll(".flow-step").forEach((b) => b.addEventListener("click", () => {
    container.querySelectorAll(".flow-step").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    const s = steps[+b.dataset.i];
    detail.innerHTML = `<h4>${s.k} – ${s.t}</h4><p>${s.d}</p>`;
  }));
  return true;
}

function renderTcpHandshake(container) {
  const steps = [
    { t: "SYN", d: "Client → Server: Verbindungswunsch (SYN, seq=x)." },
    { t: "SYN-ACK", d: "Server → Client: Bestätigung + eigener SYN (seq=y, ack=x+1)." },
    { t: "ACK", d: "Client → Server: Bestätigung (ack=y+1) – Verbindung steht." },
  ];
  container.innerHTML = `
    <div class="flow tcp-flow">
      ${steps.map((s, i) => `
        <button class="flow-step" data-i="${i}"><span class="flow-title">${s.t}</span></button>
        ${i < steps.length - 1 ? '<span class="flow-arrow">→</span>' : ""}`).join("")}
    </div>
    <div class="flow-detail" aria-live="polite"><p>Der TCP-3-Wege-Handshake baut eine zuverlässige Verbindung auf. Klicke einen Schritt an.</p></div>`;
  const detail = container.querySelector(".flow-detail");
  container.querySelectorAll(".flow-step").forEach((b) => b.addEventListener("click", () => {
    container.querySelectorAll(".flow-step").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    const s = steps[+b.dataset.i];
    detail.innerHTML = `<h4>${s.t}</h4><p>${s.d}</p>`;
  }));
  return true;
}

function renderRaid(container) {
  const levels = [
    { n: "RAID 0", d: "Striping – Daten auf mehrere Platten verteilt. Maximale Leistung/Kapazität, aber keine Ausfallsicherheit.", disks: ["A1","A2","A3","A4"], split: [["A1","A3"],["A2","A4"]] },
    { n: "RAID 1", d: "Mirroring – identische Spiegelung. Eine Platte darf ausfallen, Nettokapazität 50 %.", disks: [], split: [["A1","A2"],["A1","A2"]] },
    { n: "RAID 5", d: "Striping + verteilte Parität. Eine Platte darf ausfallen; Nettokapazität (n−1)/n.", disks: [], split: [["A1","B1","Pc"],["A2","Pb","C1"],["Pa","B2","C2"]] },
    { n: "RAID 6", d: "Doppelte Parität. Zwei Platten dürfen gleichzeitig ausfallen.", disks: [], split: [] },
    { n: "RAID 10", d: "Kombination aus Spiegeln (1) und Striping (0). Hohe Leistung und Ausfallsicherheit.", disks: [], split: [] },
  ];
  container.innerHTML = `
    <div class="raid-tabs">${levels.map((l, i) => `<button class="raid-tab${i === 0 ? " active" : ""}" data-i="${i}">${l.n}</button>`).join("")}</div>
    <div class="raid-detail"></div>`;
  const detail = container.querySelector(".raid-detail");
  function show(i) {
    const l = levels[i];
    const visual = l.split.length
      ? `<div class="raid-disks">${l.split.map((disk, di) => `<div class="raid-disk"><span class="raid-disk-label">Disk ${di + 1}</span>${disk.map((b) => `<span class="raid-block${b.startsWith("P") ? " parity" : ""}">${b}</span>`).join("")}</div>`).join("")}</div>`
      : "";
    detail.innerHTML = `<p>${l.d}</p>${visual}`;
  }
  container.querySelectorAll(".raid-tab").forEach((b) => b.addEventListener("click", () => {
    container.querySelectorAll(".raid-tab").forEach((x) => x.classList.remove("active"));
    b.classList.add("active"); show(+b.dataset.i);
  }));
  show(0);
  return true;
}

function renderAdTree(container) {
  container.innerHTML = `
    <ul class="ad-tree">
      <li><span class="ad-node ad-forest">🌲 Forest: firma.local</span>
        <ul>
          <li><span class="ad-node ad-domain">🏛️ Domäne: firma.local</span>
            <ul>
              <li><span class="ad-node ad-ou">📁 OU: Verwaltung</span>
                <ul><li><span class="ad-node ad-obj">👤 Benutzer</span></li><li><span class="ad-node ad-obj">💻 Computer</span></li></ul></li>
              <li><span class="ad-node ad-ou">📁 OU: IT</span>
                <ul><li><span class="ad-node ad-obj">👥 Gruppe: IT-Admins</span></li><li><span class="ad-node ad-obj">🖧 Server</span></li></ul></li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <p class="muted">Hierarchie: Forest ⊃ Domäne ⊃ OU ⊃ Objekte. GPOs lassen sich auf Site-, Domänen- und OU-Ebene verknüpfen (LSDOU).</p>`;
  container.querySelectorAll(".ad-node").forEach((n) => n.addEventListener("click", () => n.classList.toggle("highlight")));
  return true;
}

/* ================================================================== *
 *  Pomodoro-/Lerntimer
 * ================================================================== */

export function renderPomodoro(container) {
  let mode = "focus";           // focus | break
  let remaining = 25 * 60;
  let running = false;
  let interval = null;
  const durations = { focus: 25 * 60, break: 5 * 60 };

  function fmt(s) { return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }
  function draw() {
    container.innerHTML = `
      <div class="pomodoro ${mode}">
        <div class="pomo-mode">${mode === "focus" ? "🎯 Fokus" : "☕ Pause"}</div>
        <div class="pomo-time">${fmt(remaining)}</div>
        <div class="pomo-actions">
          <button class="btn btn-primary pomo-toggle" type="button">${running ? "Pause" : "Start"}</button>
          <button class="btn pomo-reset" type="button">Reset</button>
          <button class="btn pomo-switch" type="button">${mode === "focus" ? "→ Pause" : "→ Fokus"}</button>
        </div>
      </div>`;
    container.querySelector(".pomo-toggle").addEventListener("click", toggle);
    container.querySelector(".pomo-reset").addEventListener("click", reset);
    container.querySelector(".pomo-switch").addEventListener("click", switchMode);
  }
  function tick() {
    remaining -= 1;
    if (remaining <= 0) { stop(); switchMode(); return; }
    const el = container.querySelector(".pomo-time"); if (el) el.textContent = fmt(remaining);
  }
  function toggle() { running ? stop() : start(); }
  function start() { running = true; interval = setInterval(tick, 1000); draw(); }
  function stop() { running = false; if (interval) clearInterval(interval); draw(); }
  function reset() { stop(); remaining = durations[mode]; draw(); }
  function switchMode() { stop(); mode = mode === "focus" ? "break" : "focus"; remaining = durations[mode]; draw(); }

  draw();
  // Aufräumen, falls der Container ersetzt wird
  return () => { if (interval) clearInterval(interval); };
}

/* ================================================================== *
 *  Gemeinsame Helfer
 * ================================================================== */

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function norm(s) { return String(s).trim().toLowerCase().replace(/\s+/g, ""); }

/* ================================================================== *
 *  IPv6-Trainer (Verkürzen / Expandieren)
 * ================================================================== */

/** Expandiert eine IPv6-Adresse zur vollständigen 8×4-Schreibweise (lowercase). */
export function ipv6Expand(addr) {
  addr = addr.trim().toLowerCase();
  let [head, tail] = addr.split("::");
  const headParts = head ? head.split(":").filter((p) => p !== "") : [];
  const tailParts = tail !== undefined ? (tail ? tail.split(":").filter((p) => p !== "") : []) : null;
  let groups;
  if (tailParts === null) {
    groups = headParts;
  } else {
    const missing = 8 - headParts.length - tailParts.length;
    groups = [...headParts, ...Array(Math.max(0, missing)).fill("0"), ...tailParts];
  }
  if (groups.length !== 8) throw new Error("Ungültige IPv6-Adresse");
  return groups.map((g) => g.padStart(4, "0")).join(":");
}

/** Verkürzt eine IPv6-Adresse nach RFC 5952 (führende Nullen weg, längster 0-Lauf → ::). */
export function ipv6Compress(addr) {
  const groups = ipv6Expand(addr).split(":").map((g) => g.replace(/^0+/, "") || "0");
  // längsten Lauf aus "0"-Gruppen finden (mind. 2)
  let best = { start: -1, len: 0 }, cur = { start: -1, len: 0 };
  groups.forEach((g, i) => {
    if (g === "0") {
      if (cur.start === -1) cur = { start: i, len: 1 }; else cur.len++;
      if (cur.len > best.len) best = { ...cur };
    } else { cur = { start: -1, len: 0 }; }
  });
  if (best.len < 2) return groups.join(":");
  const before = groups.slice(0, best.start);
  const after = groups.slice(best.start + best.len);
  return (before.join(":") || "") + "::" + (after.join(":") || "");
}

function randomIpv6() {
  const hex = () => Math.floor(Math.random() * 65536).toString(16);
  const g = Array.from({ length: 8 }, hex);
  // gelegentlich Null-Gruppen einstreuen, damit Verkürzung lohnt
  if (Math.random() < 0.7) {
    const start = Math.floor(Math.random() * 5);
    const len = 2 + Math.floor(Math.random() * 3);
    for (let i = start; i < Math.min(8, start + len); i++) g[i] = "0";
  }
  return g.map((x) => x.padStart(4, "0")).join(":");
}

export function renderIpv6Trainer(container) {
  let task = null;
  function newTask() {
    const full = randomIpv6();
    const mode = Math.random() < 0.5 ? "compress" : "expand";
    task = { full, mode };
    draw();
  }
  function draw() {
    const given = task.mode === "compress" ? task.full : ipv6Compress(task.full);
    container.innerHTML = `
      <div class="tool-card">
        <div class="tool-head"><h3>🆕 IPv6-Trainer</h3>
          <button class="btn btn-small ip6-new" type="button">Neue Aufgabe</button></div>
        <p class="cmd-task">${task.mode === "compress"
          ? "Verkürze diese IPv6-Adresse (RFC 5952):"
          : "Schreibe diese IPv6-Adresse vollständig aus (8×4 Stellen):"}</p>
        <p><code>${esc(given)}</code></p>
        <input class="ip6-input cloze-input" style="width:100%;max-width:480px" placeholder="Deine Lösung …" autocomplete="off" spellcheck="false">
        <div class="tool-actions">
          <button class="btn btn-primary ip6-check" type="button">Prüfen</button>
          <button class="btn ip6-sol" type="button">Lösung</button>
        </div>
        <div class="cmd-result ip6-result" hidden></div>
      </div>`;
    const input = container.querySelector(".ip6-input");
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
    container.querySelector(".ip6-new").addEventListener("click", newTask);
    container.querySelector(".ip6-check").addEventListener("click", check);
    container.querySelector(".ip6-sol").addEventListener("click", showSol);
  }
  function answer() { return task.mode === "compress" ? ipv6Compress(task.full) : ipv6Expand(task.full); }
  function check() {
    const input = container.querySelector(".ip6-input");
    let ok = false;
    try { ok = norm(input.value) === norm(answer()); } catch (e) { ok = false; }
    input.classList.toggle("ok", ok); input.classList.toggle("bad", !ok);
    const res = container.querySelector(".ip6-result");
    res.hidden = false; res.className = "cmd-result ip6-result " + (ok ? "correct" : "wrong");
    res.innerHTML = ok ? "✓ Richtig!" : "✗ Noch nicht korrekt – „Lösung“ zeigt das Ergebnis.";
  }
  function showSol() {
    const res = container.querySelector(".ip6-result");
    res.hidden = false; res.className = "cmd-result ip6-result hint";
    res.innerHTML = `Lösung: <code>${esc(answer())}</code><br><span class="muted">Voll: ${esc(ipv6Expand(task.full))} · Kurz: ${esc(ipv6Compress(task.full))}</span>`;
  }
  newTask();
}

/* ================================================================== *
 *  Zahlensystem- & Speichergrößen-Trainer
 * ================================================================== */

export function renderNumberConverter(container) {
  let task = null;
  const bases = [
    { id: "bin", label: "Binär (2)", radix: 2, pre: "0b" },
    { id: "dec", label: "Dezimal (10)", radix: 10, pre: "" },
    { id: "hex", label: "Hexadezimal (16)", radix: 16, pre: "0x" },
  ];
  function newTask() {
    if (Math.random() < 0.35) {
      // Speichergrößen-Aufgabe (IEC vs. SI)
      const iec = [["KiB", 1024], ["MiB", 1024 * 1024]];
      const pick = iec[Math.floor(Math.random() * iec.length)];
      const n = 1 + Math.floor(Math.random() * 8);
      task = { kind: "size", q: `Wie viele Byte sind ${n} ${pick[0]}?`, answer: String(n * pick[1]),
        sol: `${n} ${pick[0]} = ${n} × ${pick[1]} Byte = ${n * pick[1]} Byte (IEC, Basis 1024).` };
    } else {
      const value = Math.floor(Math.random() * 4096);
      let from = bases[Math.floor(Math.random() * 3)], to = bases[Math.floor(Math.random() * 3)];
      while (to.id === from.id) to = bases[Math.floor(Math.random() * 3)];
      const given = value.toString(from.radix).toUpperCase();
      const answer = value.toString(to.radix).toUpperCase();
      task = { kind: "conv", from, to, given,
        q: `Wandle <code>${from.pre}${given}</code> von <strong>${from.label}</strong> nach <strong>${to.label}</strong> um:`,
        answer, sol: `Dezimalwert: ${value}. Ergebnis ${to.label}: ${to.pre}${answer}.` };
    }
    draw();
  }
  function draw() {
    container.innerHTML = `
      <div class="tool-card">
        <div class="tool-head"><h3>🔢 Zahlensystem-Trainer</h3>
          <button class="btn btn-small num-new" type="button">Neue Aufgabe</button></div>
        <p class="cmd-task">${task.q}</p>
        <input class="num-input cloze-input" style="width:100%;max-width:320px" placeholder="Antwort …" autocomplete="off" inputmode="latin">
        <div class="tool-actions">
          <button class="btn btn-primary num-check" type="button">Prüfen</button>
          <button class="btn num-sol" type="button">Lösung</button>
        </div>
        <div class="cmd-result num-result" hidden></div>
      </div>`;
    const input = container.querySelector(".num-input");
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
    container.querySelector(".num-new").addEventListener("click", newTask);
    container.querySelector(".num-check").addEventListener("click", check);
    container.querySelector(".num-sol").addEventListener("click", showSol);
  }
  function check() {
    const input = container.querySelector(".num-input");
    const ok = norm(input.value.replace(/^0x|^0b/i, "")) === norm(task.answer);
    input.classList.toggle("ok", ok); input.classList.toggle("bad", !ok);
    const res = container.querySelector(".num-result");
    res.hidden = false; res.className = "cmd-result num-result " + (ok ? "correct" : "wrong");
    res.innerHTML = ok ? "✓ Richtig!" : "✗ Noch nicht korrekt.";
  }
  function showSol() {
    const res = container.querySelector(".num-result");
    res.hidden = false; res.className = "cmd-result num-result hint";
    res.innerHTML = `💡 ${esc(task.sol)} <strong>Antwort: ${esc(task.answer)}</strong>`;
  }
  newTask();
}

/* ================================================================== *
 *  Logikgatter- & Boolesche-Algebra-Trainer
 * ================================================================== */

const GATES = {
  AND:  (a, b) => a & b,
  OR:   (a, b) => a | b,
  XOR:  (a, b) => a ^ b,
  NAND: (a, b) => (a & b) ? 0 : 1,
  NOR:  (a, b) => (a | b) ? 0 : 1,
  XNOR: (a, b) => (a ^ b) ? 0 : 1,
};

export function renderLogicTrainer(container) {
  let task = null;
  function newTask() {
    if (Math.random() < 0.5) {
      const names = Object.keys(GATES);
      const g = names[Math.floor(Math.random() * names.length)];
      const a = Math.round(Math.random()), b = Math.round(Math.random());
      task = { kind: "gate", q: `Gatter <strong>${g}</strong> mit A=${a}, B=${b} → Ausgang Q = ?`,
        answer: String(GATES[g](a, b)), sol: `${g}(${a}, ${b}) = ${GATES[g](a, b)}.` };
    } else {
      // Ausdruck mit 3 Variablen auswerten
      const a = Math.round(Math.random()), b = Math.round(Math.random()), c = Math.round(Math.random());
      const forms = [
        { t: "A ∧ (¬B ∨ C)", f: a & ((b ? 0 : 1) | c) },
        { t: "(A ∨ B) ∧ ¬C", f: (a | b) & (c ? 0 : 1) },
        { t: "¬(A ∧ B) ∨ C", f: ((a & b) ? 0 : 1) | c },
        { t: "(A ⊕ B) ∧ C", f: (a ^ b) & c },
      ];
      const e = forms[Math.floor(Math.random() * forms.length)];
      task = { kind: "expr", q: `Werte aus: <code>${e.t}</code> mit A=${a}, B=${b}, C=${c} → Ergebnis = ?`,
        answer: String(e.f), sol: `Einsetzen ergibt ${e.f}. (∧=AND, ∨=OR, ¬=NOT, ⊕=XOR)` };
    }
    draw();
  }
  function draw() {
    container.innerHTML = `
      <div class="tool-card">
        <div class="tool-head"><h3>🔌 Logik-Trainer</h3>
          <button class="btn btn-small lg-new" type="button">Neue Aufgabe</button></div>
        <p class="cmd-task">${task.q}</p>
        <div class="choices-tf choices">
          <label class="choice"><input type="radio" name="lg" value="0"> 0</label>
          <label class="choice"><input type="radio" name="lg" value="1"> 1</label>
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary lg-check" type="button">Prüfen</button>
          <button class="btn lg-sol" type="button">Lösung</button>
        </div>
        <div class="cmd-result lg-result" hidden></div>
      </div>`;
    container.querySelector(".lg-new").addEventListener("click", newTask);
    container.querySelector(".lg-check").addEventListener("click", check);
    container.querySelector(".lg-sol").addEventListener("click", showSol);
  }
  function check() {
    const sel = container.querySelector('input[name="lg"]:checked');
    const res = container.querySelector(".lg-result");
    res.hidden = false;
    if (!sel) { res.className = "cmd-result lg-result hint"; res.textContent = "Bitte 0 oder 1 wählen."; return; }
    const ok = sel.value === task.answer;
    res.className = "cmd-result lg-result " + (ok ? "correct" : "wrong");
    res.innerHTML = ok ? "✓ Richtig!" : "✗ Leider falsch.";
  }
  function showSol() {
    const res = container.querySelector(".lg-result");
    res.hidden = false; res.className = "cmd-result lg-result hint";
    res.innerHTML = `💡 ${esc(task.sol)} <strong>Q = ${esc(task.answer)}</strong>`;
  }
  newTask();
}

/* ================================================================== *
 *  Netzplan-Rechner (kritischer Pfad, Puffer)
 * ================================================================== */

/** Parst Zeilen "ID;Dauer;Vorgänger,..." und berechnet FAZ/FEZ/SAZ/SEZ/GP/FP. */
export function computeNetzplan(text) {
  const nodes = new Map();
  text.split(/\n+/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
    const [id, dur, pre] = line.split(";").map((s) => (s || "").trim());
    if (!id) return;
    nodes.set(id, { id, dur: Number(dur) || 0, pre: pre ? pre.split(",").map((s) => s.trim()).filter(Boolean) : [], succ: [] });
  });
  // Nachfolger ableiten
  nodes.forEach((n) => n.pre.forEach((p) => { if (nodes.has(p)) nodes.get(p).succ.push(n.id); }));
  // topologische Reihenfolge (Kahn)
  const indeg = new Map([...nodes.keys()].map((k) => [k, nodes.get(k).pre.filter((p) => nodes.has(p)).length]));
  const queue = [...indeg].filter(([, d]) => d === 0).map(([k]) => k);
  const order = [];
  while (queue.length) {
    const k = queue.shift(); order.push(k);
    nodes.get(k).succ.forEach((s) => { indeg.set(s, indeg.get(s) - 1); if (indeg.get(s) === 0) queue.push(s); });
  }
  if (order.length !== nodes.size) throw new Error("Zyklus oder unbekannter Vorgänger im Netzplan.");
  // Vorwärts
  order.forEach((k) => {
    const n = nodes.get(k);
    n.faz = n.pre.length ? Math.max(...n.pre.filter((p) => nodes.has(p)).map((p) => nodes.get(p).fez)) : 0;
    n.fez = n.faz + n.dur;
  });
  const projectEnd = Math.max(...[...nodes.values()].map((n) => n.fez));
  // Rückwärts
  [...order].reverse().forEach((k) => {
    const n = nodes.get(k);
    n.sez = n.succ.length ? Math.min(...n.succ.map((s) => nodes.get(s).saz)) : projectEnd;
    n.saz = n.sez - n.dur;
    n.gp = n.saz - n.faz; // Gesamtpuffer
    n.fp = n.succ.length ? Math.min(...n.succ.map((s) => nodes.get(s).faz)) - n.fez : 0; // freier Puffer
    n.critical = n.gp === 0;
  });
  return { nodes: order.map((k) => nodes.get(k)), projectEnd };
}

export function renderNetzplan(container) {
  const example = "A;3;\nB;4;A\nC;2;A\nD;5;B,C\nE;2;D";
  function draw(text, result, error) {
    container.innerHTML = `
      <div class="tool-card">
        <div class="tool-head"><h3>📈 Netzplan-Rechner</h3>
          <button class="btn btn-small np-ex" type="button">Beispiel</button></div>
        <p class="muted">Je Zeile ein Vorgang: <code>ID;Dauer;Vorgänger,Vorgänger</code> (Vorgänger optional).</p>
        <textarea class="np-input note-area" style="min-height:120px;font-family:var(--mono)" spellcheck="false">${esc(text)}</textarea>
        <div class="tool-actions"><button class="btn btn-primary np-calc" type="button">Berechnen</button></div>
        ${error ? `<div class="cmd-result wrong">✗ ${esc(error)}</div>` : ""}
        ${result ? renderResult(result) : ""}
      </div>`;
    container.querySelector(".np-calc").addEventListener("click", () => {
      const t = container.querySelector(".np-input").value;
      try { draw(t, computeNetzplan(t), null); } catch (e) { draw(t, null, e.message); }
    });
    container.querySelector(".np-ex").addEventListener("click", () => draw(example, null, null));
  }
  function renderResult(r) {
    const rows = r.nodes.map((n) => `<tr class="${n.critical ? "np-crit" : ""}">
      <td>${esc(n.id)}</td><td>${n.dur}</td><td>${n.faz}</td><td>${n.fez}</td><td>${n.saz}</td><td>${n.sez}</td>
      <td>${n.gp}</td><td>${n.fp}</td><td>${n.critical ? "✔" : ""}</td></tr>`).join("");
    const path = r.nodes.filter((n) => n.critical).map((n) => n.id).join(" → ");
    return `<div class="subnet-result correct" style="margin-top:1rem;overflow-x:auto">
      <p>Projektdauer: <strong>${r.projectEnd}</strong> · Kritischer Pfad: <strong>${esc(path)}</strong></p>
      <table class="subnet-sol"><thead><tr><th>ID</th><th>Dauer</th><th>FAZ</th><th>FEZ</th><th>SAZ</th><th>SEZ</th><th>GP</th><th>FP</th><th>krit.</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }
  draw(example, null, null);
}

/* ================================================================== *
 *  SQL-Sandbox (echtes SQLite via sql.js, CDN – defensiv geladen)
 * ================================================================== */

const SQL_SEED = `
CREATE TABLE kunde (id INTEGER PRIMARY KEY, name TEXT, ort TEXT);
CREATE TABLE bestellung (id INTEGER PRIMARY KEY, kunde_id INTEGER, betrag REAL, datum TEXT);
INSERT INTO kunde (id,name,ort) VALUES
 (1,'Meier GmbH','Berlin'),(2,'Schmidt AG','Hamburg'),(3,'Yilmaz KG','Berlin'),(4,'Nowak e.K.','München');
INSERT INTO bestellung (id,kunde_id,betrag,datum) VALUES
 (1,1,250.0,'2026-01-10'),(2,1,99.5,'2026-02-02'),(3,2,1200.0,'2026-02-15'),
 (4,3,42.0,'2026-03-01'),(5,3,300.0,'2026-03-20'),(6,4,75.0,'2026-04-05');
`;

let _sqlDbPromise = null;
function loadSqlJs() {
  if (_sqlDbPromise) return _sqlDbPromise;
  _sqlDbPromise = new Promise((resolve, reject) => {
    if (typeof window.initSqlJs === "function") return resolve(window.initSqlJs);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js";
    s.onload = () => resolve(window.initSqlJs);
    s.onerror = () => reject(new Error("sql.js konnte nicht geladen werden (offline?)."));
    document.head.appendChild(s);
  }).then((initSqlJs) => initSqlJs({ locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` }))
    .then((SQL) => { const db = new SQL.Database(); db.run(SQL_SEED); return db; });
  return _sqlDbPromise;
}

export function renderSqlSandbox(container) {
  const tasks = [
    "Alle Kunden aus Berlin anzeigen.",
    "Gesamtbetrag aller Bestellungen je Kunde (mit Name).",
    "Anzahl der Bestellungen zählen.",
    "Teuerste Bestellung finden.",
  ];
  container.innerHTML = `
    <div class="tool-card">
      <div class="tool-head"><h3>🧾 SQL-Sandbox</h3>
        <button class="btn btn-small sql-reset" type="button">DB zurücksetzen</button></div>
      <p class="muted">Übungs-DB mit Tabellen <code>kunde(id,name,ort)</code> und
        <code>bestellung(id,kunde_id,betrag,datum)</code>. Aufgabenideen:
        ${tasks.map((t) => `<br>• ${esc(t)}`).join("")}</p>
      <textarea class="sql-input note-area" style="min-height:90px;font-family:var(--mono)" spellcheck="false">SELECT name, ort FROM kunde WHERE ort = 'Berlin';</textarea>
      <div class="tool-actions"><button class="btn btn-primary sql-run" type="button">Ausführen ▶</button></div>
      <div class="sql-status muted" style="margin-top:.6rem"></div>
      <div class="sql-result" style="margin-top:1rem;overflow-x:auto"></div>
    </div>`;
  const statusEl = container.querySelector(".sql-status");
  const resultEl = container.querySelector(".sql-result");

  async function run() {
    statusEl.textContent = "Datenbank wird geladen …";
    resultEl.innerHTML = "";
    let db;
    try { db = await loadSqlJs(); }
    catch (e) {
      statusEl.innerHTML = `<span class="chart-fallback">⚠️ ${esc(e.message)} Die SQL-Sandbox benötigt einmalig Internet. SQL-Syntax kannst du dennoch im Befehls-Trainer üben.</span>`;
      return;
    }
    const sql = container.querySelector(".sql-input").value;
    try {
      const res = db.exec(sql);
      statusEl.textContent = "✓ Ausgeführt.";
      if (!res.length) { resultEl.innerHTML = `<p class="muted">Keine Ergebnismenge (z. B. bei INSERT/UPDATE).</p>`; return; }
      resultEl.innerHTML = res.map((r) => `
        <table class="subnet-sol"><thead><tr>${r.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
        <tbody>${r.values.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`).join("");
    } catch (e) {
      statusEl.innerHTML = `<span style="color:var(--bad)">✗ SQL-Fehler: ${esc(e.message)}</span>`;
    }
  }
  async function reset() {
    _sqlDbPromise = null;
    statusEl.textContent = "Datenbank zurückgesetzt.";
    resultEl.innerHTML = "";
  }
  container.querySelector(".sql-run").addEventListener("click", run);
  container.querySelector(".sql-reset").addEventListener("click", reset);
}

/* ================================================================== *
 *  CLI-Simulator (terminalähnliches Üben von Befehlen)
 * ================================================================== */

export function renderCliSimulator(container) {
  let task = null;
  const log = [];
  function pick() {
    task = COMMAND_TASKS[Math.floor(Math.random() * COMMAND_TASKS.length)];
    log.length = 0;
    log.push({ kind: "sys", text: "Neue Aufgabe – tippe den passenden Befehl und drücke Enter. ('hint' für Tipp)" });
    draw();
  }
  function draw() {
    container.innerHTML = `
      <div class="tool-card">
        <div class="tool-head"><h3>🖥️ Terminal-Simulator</h3>
          <button class="btn btn-small cli-new" type="button">Nächste Aufgabe</button></div>
        <p class="cmd-task">🎯 ${esc(task.prompt)}</p>
        <div class="cli-screen" tabindex="0">
          ${log.map((l) => l.kind === "in"
            ? `<div class="cli-line"><span class="cmd-prompt">$</span> <span>${esc(l.text)}</span></div>`
            : `<div class="cli-out cli-${l.kind}">${esc(l.text)}</div>`).join("")}
          <div class="cmd-line cli-entry"><span class="cmd-prompt">$</span>
            <input class="cmd-input cli-input" autocomplete="off" spellcheck="false" autofocus></div>
        </div>
      </div>`;
    const input = container.querySelector(".cli-input");
    input.focus();
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(input.value); });
    container.querySelector(".cli-new").addEventListener("click", pick);
    const screen = container.querySelector(".cli-screen");
    screen.scrollTop = screen.scrollHeight;
  }
  function submit(value) {
    const cmd = value.trim();
    if (!cmd) return;
    log.push({ kind: "in", text: cmd });
    if (cmd.toLowerCase() === "hint") {
      log.push({ kind: "sys", text: "💡 " + task.hint });
    } else if (task.accept.map(norm).includes(norm(cmd))) {
      log.push({ kind: "ok", text: "✓ Korrekt! Befehl akzeptiert. Klicke „Nächste Aufgabe“." });
    } else {
      log.push({ kind: "err", text: "✗ Nicht erkannt. Tipp: 'hint'." });
    }
    draw();
  }
  pick();
}
