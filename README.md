# FiSi-Lernplattform 🖧

Eine umfangreiche, interaktive Lernplattform für angehende **Fachinformatiker:innen
Systemintegration (FiSi)** zur Vorbereitung auf die **IHK-Abschlussprüfung (AP1 & AP2)**.
Die Anwendung deckt die komplette Ausbildung ab – mit echten Lerninhalten, vielfältigen
Übungsformaten, Statistik-/Fortschritts-Tracking und einer modernen, responsiven Oberfläche.

> Sprache durchgehend **geschlechtsneutral** und auf **Deutsch**, mit englischen
> Fachbegriffen wo üblich. Inhalte fachlich geprüft – ohne Gewähr.

---

## ✨ Funktionen im Überblick

- **Zwei Navigationssichten:** nach **Lernfeldern (LF1–LF12)** oder nach
  **Prüfungsbereichen (AP1 / AP2-Bereiche / WiSo)** – jederzeit umschaltbar.
- **Dashboard** mit Kategorie-Kacheln und individuellem Fortschritt, Tagesziel,
  Level, Punkten und Streak.
- **Lerninhalte** pro Thema: Erklärung → Visualisierung/Beispiel → Merksätze → Abfragen.
- **7 Aufgabentypen** mit sofortigem Feedback und Lösungserklärung:
  Multiple Choice (einfach/mehrfach), Wahr/Falsch, Lückentext, Zuordnung (Drag & Drop),
  Karteikarten (Flip), Rechenaufgaben, sowie die gemischte **Prüfungssimulation mit Timer**.
- **Lernmodi:** Themen-Quiz, Schwachstellen-Training, Spaced Repetition (Leitner-Prinzip),
  Zufallsabfrage, „Frage des Tages“ und **ganzheitliche Prüfungsaufgaben** (handlungs-
  orientierte Fallaufgaben mit mehreren Teilfragen wie in der echten IHK-Prüfung).
- **Geführte Lernpfade:** kuratierte, geordnete Wege durch die Themen (z. B. AP1-Crashkurs,
  Netzwerktechnik komplett, IT-Sicherheit) mit „Weiter“-Flow und Fortschritt.
- **Lernplan & Prüfungs-Countdown:** Prüfungstermin setzen, Countdown und automatisch
  verteilter Lernplan offener Themen samt fälliger Wiederholungen.
- **Statistik-Dashboard:** Gesamt- und Bereichsfortschritt, Richtig-/Falsch-Quote,
  Lernverlauf, Aktivitäts-Heatmap (GitHub-Stil), **Wissensradar** (Quiz-Leistung vs.
  Selbsteinschätzung), Schwachstellen-Empfehlung, Achievements/Badges und Punkte-/Level-System.
- **Interaktive Werkzeuge:** Subnetting-Trainer (Lösungsweg binär/dezimal),
  **IPv6-Trainer** (Verkürzen/Expandieren, RFC 5952), **Zahlensystem-Trainer**
  (bin/dez/hex + Speichergrößen), **Logik-Trainer** (Gatter & Ausdrücke),
  **Netzplan-Rechner** (kritischer Pfad/Puffer), **SQL-Sandbox** (echtes SQLite via sql.js),
  Befehls-Trainer und **Terminal-Simulator**, klickbares OSI-Modell, animierte Schaubilder
  (DORA, TCP-Handshake, RAID, AD-Struktur) und Pomodoro-Lerntimer.
- **Komfort:** globale Live-Suche, Glossar mit Verlinkung im Fließtext, Notizen &
  Favoriten pro Thema, Druck-/Spickzettel-Ansicht, Code-Kopierbuttons,
  **Dark-/Light-Mode** und vollständige Tastatur-/Mobilbedienung.
- **Persistenz:** Lernstand im `localStorage` mit robustem In-Memory-Fallback,
  **Export/Import als JSON** und Reset-Funktion. Die App stürzt nie ab.

---

## 🚀 Lokale Ausführung

Die Anwendung nutzt **ES-Module** (`import`/`export`). Browser laden Module nicht über
das `file://`-Protokoll (CORS) – daher wird ein **einfacher lokaler Webserver** benötigt.
Es ist **kein Node-Build, kein npm install** nötig.

### Variante A – Python (meist vorinstalliert)

```bash
cd <projektordner>
python3 -m http.server 8000
# anschließend im Browser öffnen:
#   http://localhost:8000/
```

### Variante B – Node (falls vorhanden)

```bash
npx serve .
# oder
npx http-server -p 8000
```

### Variante C – VS Code

Die Erweiterung **„Live Server“** installieren und `index.html` per
„Open with Live Server“ starten.

> **Hinweis zu CDN:** Diagramme (Chart.js) und Syntax-Highlighting (highlight.js) werden
> über ein CDN geladen. Ohne Internetzugang bleibt die App voll funktionsfähig –
> Diagramme zeigen dann einen Texthinweis, die Statistik selbst bleibt verfügbar.

---

## 📁 Dateistruktur

```
/index.html          Semantisches HTML-Grundgerüst, lädt CSS & JS-Module
/css/
  style.css          Komplettes Styling, Theming über CSS Custom Properties
/js/
  app.js             App-Logik, Navigation, Hash-Routing, State-Anbindung, Ansichten
  quiz.js            Quiz-/Abfrage-/Prüfungslogik (alle Aufgabentypen, Leitner, Timer)
  stats.js           Statistik & Fortschritt, localStorage-Persistenz, Charts
  tools.js           Interaktive Werkzeuge (Subnetting-Rechner, OSI-Modell u. a.)
/data/
  content.js         Alle Lerninhalte (Themen, Texte, Beispiele) als Datenobjekte
  questions.js       Alle Fragen, Karteikarten und Aufgaben als Datenobjekte
  scenarios.js       Ganzheitliche Prüfungsaufgaben (Fallkontext + Teilfragen)
  paths.js           Geführte Lernpfade (geordnete Themenfolgen)
  glossary.js        Glossarbegriffe
/README.md
```

**Strikte Trennung von Logik und Daten:** Lerninhalte, Fragen und Glossar liegen
ausschließlich in `/data` – nie im HTML oder in der Logik. So lassen sich Themen und
Fragen ergänzen, ohne Code anzufassen.

---

## ➕ Inhalte erweitern

Alle Erweiterungen erfolgen **nur in den Datendateien** unter `/data`.

### Neues Thema (`data/content.js`)

Ein Objekt zum Array `topics` hinzufügen:

```js
{
  id: "mein-thema",                 // eindeutige Kennung (kebab-case)
  title: "Mein Thema",
  lernfeld: "LF8",                  // LF1..LF12  → Sicht "nach Lernfeldern"
  examArea: "AP2-NE",               // AP1 | AP2-KA | AP2-NE | AP2-WISO
  bereich: "netzwerk",              // siehe Export `bereiche`
  icon: "🌐",
  summary: "Kurzbeschreibung.",
  visual: null,                     // null | "osi" | "dora" | "tcp" | "raid" | "ad"
  sections: [{ heading: "Überschrift", html: "<p>Erklärung …</p>" }],
  examples: [{ title: "Beispiel", html: "<p>…</p>" }],
  merksaetze: ["Merksatz 1"],
  cheatsheet: ["Kompaktpunkt für die Spickzettel-Ansicht"],
  questionIds: ["meine-frage-1"],   // Verweise auf data/questions.js
}
```

### Neue Frage (`data/questions.js`)

Ein Objekt zum Array `questions` hinzufügen und die `id` in den `questionIds` des
zugehörigen Themas eintragen. Unterstützte `type`-Werte:

| Typ          | Pflichtfelder                                   |
|--------------|-------------------------------------------------|
| `mc-single`  | `options: []`, `answer: <index>`                |
| `mc-multi`   | `options: []`, `answer: [<index>, …]`           |
| `truefalse`  | `answer: true | false`                          |
| `cloze`      | `question` mit `{{}}` je Lücke, `blanks: [[…]]` |
| `match`      | `pairs: [{ left, right }]`                       |
| `flashcard`  | `back: <Rückseite>`                             |
| `calc`       | `answer: <string>`, optional `accept: []`, `solution` |

Jede Frage benötigt zusätzlich `id`, `topicId`, `difficulty`
(`leicht`/`mittel`/`schwer`) und `explanation`.

```js
{
  id: "meine-frage-1",
  topicId: "mein-thema",
  type: "mc-single",
  difficulty: "mittel",
  question: "Wie lautet die Frage?",
  options: ["A", "B", "C"],
  answer: 1,
  explanation: "Weil B korrekt ist, da …",
}
```

### Neuer Glossarbegriff (`data/glossary.js`)

```js
{ term: "Begriff", abbr: "ABK", definition: "Erklärung.", related: ["mein-thema"] }
```

Bekannte Glossarbegriffe werden im Fließtext der Themen automatisch verlinkt.

---

## 🧩 Abgedeckte Themenbereiche

1. **Netzwerktechnik** – OSI/TCP-IP, IPv4/IPv6, Subnetting/VLSM/CIDR, Ethernet/MAC,
   VLANs, STP/RSTP/MSTP, Routing (RIP/OSPF), NAT/PAT, DHCP/DNS, Ports, WLAN, VPN/IPsec,
   Verkabelung & Topologien.
2. **IT-Sicherheit** – Schutzziele/CIA, Kryptografie & PKI, Firewalls/ACL/DMZ,
   Schadsoftware & Angriffe, Authentifizierung/RBAC, RAID/Backup/USV, DSGVO.
3. **Betriebssysteme & Virtualisierung** – Active Directory/GPO, Linux & Dateirechte,
   Virtualisierung & Container, Cloud (IaaS/PaaS/SaaS), Dateisysteme & Berechtigungen.
4. **Datenbanken** – relationales/ER-Modell, Normalisierung (1NF–3NF), SQL.
5. **Programmierung & Automatisierung** – Grundlagen, Struktogramm/PAP/Pseudocode,
   PowerShell/Bash & Boolesche Algebra.
6. **Hardware & IT-Arbeitsplatz (AP1)** – Komponenten/Schnittstellen, Arbeitsplatz
   einrichten & integrieren.
7. **Projektmanagement & Service** – Projektphasen, Lasten-/Pflichtenheft, Netzplan/Gantt,
   Nutzwertanalyse, ITIL/SLA.
8. **Wirtschaft & Soziales (WiSo)** – Vertragsarten, Urheber-/Lizenzrecht,
   Unternehmensformen, kaufmännisches Rechnen, Berufsausbildung & Sozialversicherung.

---

## 🛠️ Technik

- Semantisches **HTML5**, modernes **CSS** (Flexbox/Grid, Custom Properties, `color-mix`).
- **JavaScript (ES6+ Module)**, klare Trennung von Logik und Daten.
- Keine Build-Tools, keine Pflicht-Abhängigkeiten – lauffähig über jeden statischen Webserver.
- Optionale CDN-Bibliotheken: Chart.js (Diagramme), highlight.js (Code-Highlighting).

---

## ♿ Barrierearmut

Ausreichende Kontraste, sichtbarer Fokus (`:focus-visible`), Tastaturbedienung,
ARIA-Attribute für Navigation, Tabs und Live-Bereiche sowie eine funktionierende
mobile Burger-Navigation.
