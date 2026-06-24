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
