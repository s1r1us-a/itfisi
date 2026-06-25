/**
 * content.js — Alle Lerninhalte der FiSi-Lernplattform.
 *
 * Strikte Trennung von Logik und Daten: Dieses Modul enthält ausschließlich
 * Lerninhalte als exportierte Datenobjekte. Neue Themen werden hier ergänzt,
 * ohne dass Code in /js angefasst werden muss.
 *
 * Datenmodell eines Themas (topic):
 *   {
 *     id:        eindeutige Kennung (string, kebab-case)
 *     title:     Anzeigename
 *     lernfeld:  "LF1".."LF12"  (Sicht "nach Lernfeldern")
 *     examArea:  "AP1" | "AP2-KA" | "AP2-NE" | "AP2-WISO"  (Sicht "nach Prüfungsbereichen")
 *     icon:      Emoji/Symbol für Kacheln
 *     summary:   Kurzbeschreibung (1-2 Sätze)
 *     sections:  [{ heading, html }]   Lerntext (HTML erlaubt, geschlechtsneutral)
 *     examples:  [{ title, html }]     konkrete Praxisbeispiele
 *     merksaetze:[ string ]            einprägsame Merksätze
 *     visual:    null | "osi" | "dora" | "tcp" | "raid" | "ad"  (Hook für tools.js)
 *     cheatsheet:[ string ]            kompakte Punkte für die Spickzettel-Ansicht
 *     questionIds:[ string ]           zugehörige Fragen (siehe questions.js)
 *   }
 *
 * Die Plattform bietet zwei Sichten auf dieselben Themen:
 *  - nach Lernfeldern (LF1–LF12)
 *  - nach Prüfungsbereichen (AP1, AP2-Bereiche, WiSo)
 */

/* ------------------------------------------------------------------ *
 *  Kategorie-Metadaten
 * ------------------------------------------------------------------ */

export const lernfelder = {
  LF1:  { id: "LF1",  title: "LF1 – Das Unternehmen und die eigene Rolle", icon: "🏢" },
  LF2:  { id: "LF2",  title: "LF2 – Arbeitsplätze ausstatten", icon: "💻" },
  LF3:  { id: "LF3",  title: "LF3 – Clients in Netzwerke einbinden", icon: "🔌" },
  LF4:  { id: "LF4",  title: "LF4 – Schutzbedarf ermitteln & umsetzen", icon: "🛡️" },
  LF5:  { id: "LF5",  title: "LF5 – Software zur Datenverwaltung", icon: "🗄️" },
  LF6:  { id: "LF6",  title: "LF6 – Serviceanfragen bearbeiten", icon: "🎫" },
  LF7:  { id: "LF7",  title: "LF7 – Cyber-physische Systeme ergänzen", icon: "⚙️" },
  LF8:  { id: "LF8",  title: "LF8 – Netzwerke & Dienste bereitstellen", icon: "🌐" },
  LF9:  { id: "LF9",  title: "LF9 – Netzwerkbetrieb sicherstellen", icon: "📡" },
  LF10: { id: "LF10", title: "LF10 – Software/Skripte erstellen", icon: "💾" },
  LF11: { id: "LF11", title: "LF11 – IT-Lösungen absichern", icon: "🔐" },
  LF12: { id: "LF12", title: "LF12 – Kundenspezifische Systeme integrieren", icon: "🧩" },
};

export const examAreas = {
  "AP1":      { id: "AP1",      title: "AP1 – Einrichten eines IT-Arbeitsplatzes", icon: "🖥️", weight: "ca. 20 %" },
  "AP2-KA":   { id: "AP2-KA",   title: "AP2 – Konzeption & Administration von IT-Systemen", icon: "🏗️", weight: "ca. 40 %" },
  "AP2-NE":   { id: "AP2-NE",   title: "AP2 – Analyse & Entwicklung von Netzwerken", icon: "🌐", weight: "ca. 30 %" },
  "AP2-WISO": { id: "AP2-WISO", title: "AP2 – Wirtschafts- & Sozialkunde (WiSo)", icon: "📊", weight: "ca. 10 %" },
};

/* Thematische Bereiche (für Dashboard-Gruppierung der Prüfungs-Sicht ergänzend) */
export const bereiche = [
  { id: "netzwerk",     title: "Netzwerktechnik",                 icon: "🌐" },
  { id: "security",     title: "IT-Sicherheit",                   icon: "🛡️" },
  { id: "os",           title: "Betriebssysteme & Virtualisierung", icon: "🖥️" },
  { id: "datenbanken",  title: "Datenbanken",                     icon: "🗄️" },
  { id: "programmierung",title: "Programmierung & Automatisierung", icon: "💾" },
  { id: "hardware",     title: "Hardware & IT-Arbeitsplatz",      icon: "🔧" },
  { id: "projekt",      title: "Projektmanagement & Service",     icon: "📋" },
  { id: "wiso",         title: "Wirtschaft & Soziales (WiSo)",    icon: "📊" },
];

/* ------------------------------------------------------------------ *
 *  Themen (topics)
 * ------------------------------------------------------------------ */

export const topics = [

  /* ===================== 1. NETZWERKTECHNIK ===================== */

  {
    id: "osi-tcpip",
    title: "OSI-Modell & TCP/IP",
    lernfeld: "LF8", examArea: "AP2-NE", bereich: "netzwerk", icon: "🗂️",
    summary: "Das OSI-7-Schichtenmodell und das TCP/IP-Modell strukturieren die Netzwerkkommunikation in aufeinander aufbauende Schichten.",
    visual: "osi",
    sections: [
      { heading: "Warum ein Schichtenmodell?",
        html: `<p>Netzwerkkommunikation ist komplex. Schichtenmodelle zerlegen sie in klar abgegrenzte Aufgaben. Jede Schicht nutzt die Dienste der darunterliegenden Schicht und stellt Dienste für die darüberliegende bereit. Das ermöglicht den Austausch einzelner Technologien, ohne das Gesamtsystem zu verändern.</p>` },
      { heading: "Die 7 OSI-Schichten",
        html: `<p>Von oben nach unten:</p>
        <ol>
          <li><strong>7 Anwendung (Application):</strong> Schnittstelle zur Anwendung – HTTP, FTP, SMTP, DNS.</li>
          <li><strong>6 Darstellung (Presentation):</strong> Kodierung, Verschlüsselung, Kompression – TLS, ASCII, JPEG.</li>
          <li><strong>5 Sitzung (Session):</strong> Auf-/Abbau & Steuerung von Verbindungen – NetBIOS, RPC.</li>
          <li><strong>4 Transport:</strong> Ende-zu-Ende, Segmentierung, Ports – <strong>TCP</strong> (verbindungsorientiert) / <strong>UDP</strong> (verbindungslos).</li>
          <li><strong>3 Vermittlung (Network):</strong> logische Adressierung & Routing – <strong>IP</strong>, ICMP, Router.</li>
          <li><strong>2 Sicherung (Data Link):</strong> MAC-Adressen, Rahmen, Fehlererkennung – Ethernet, Switch, ARP.</li>
          <li><strong>1 Bitübertragung (Physical):</strong> Bits auf das Medium – Kabel, Stecker, Spannungspegel, Hub.</li>
        </ol>
        <p>Daten werden beim Senden von oben nach unten gekapselt (Encapsulation) und beim Empfangen von unten nach oben entkapselt.</p>` },
      { heading: "TCP/IP-Modell (DoD)",
        html: `<p>Das praxisnahe TCP/IP-Modell fasst die OSI-Schichten in 4 (bzw. 5) Schichten zusammen:</p>
        <ul>
          <li><strong>Anwendung</strong> (OSI 5–7)</li>
          <li><strong>Transport</strong> (OSI 4)</li>
          <li><strong>Internet</strong> (OSI 3)</li>
          <li><strong>Netzzugang</strong> (OSI 1–2)</li>
        </ul>` },
    ],
    examples: [
      { title: "Aufruf einer Webseite", html: `<p>Beim Öffnen von <code>https://example.org</code> arbeitet HTTP auf Schicht 7, TLS verschlüsselt auf Schicht 6, TCP baut auf Schicht 4 die Verbindung zu Port 443 auf, IP adressiert den Server (Schicht 3), Ethernet transportiert die Frames im LAN (Schicht 2) über das Kabel (Schicht 1).</p>` },
    ],
    merksaetze: [
      "Eselsbrücke (7→1): „Alle Profis Sehen Tom Verärgert Spielen Bei …“ bzw. „All People Seem To Need Data Processing“.",
      "Switch = Schicht 2 (MAC), Router = Schicht 3 (IP).",
      "TCP = zuverlässig & verbindungsorientiert; UDP = schnell & verbindungslos.",
    ],
    cheatsheet: [
      "7 Anwendung · 6 Darstellung · 5 Sitzung · 4 Transport · 3 Vermittlung · 2 Sicherung · 1 Bitübertragung",
      "TCP/IP: Anwendung · Transport · Internet · Netzzugang",
      "PDU: Schicht4=Segment, 3=Paket, 2=Frame, 1=Bit",
    ],
    deepDive: [
      { heading: "Kapselung & PDUs Schritt für Schritt",
        html: `<p>Beim Senden wandert jedes Datenpaket von Schicht 7 nach unten. Jede Schicht ergänzt eigene Steuerinformationen (Header) – das nennt man <strong>Encapsulation</strong>. Die Dateneinheit heißt auf jeder Schicht anders (<strong>PDU</strong> = Protocol Data Unit):</p>
        <table>
          <thead><tr><th>Schicht</th><th>PDU</th><th>typische Adresse</th></tr></thead>
          <tbody>
            <tr><td>4 Transport</td><td>Segment (TCP) / Datagramm (UDP)</td><td>Portnummer</td></tr>
            <tr><td>3 Vermittlung</td><td>Paket</td><td>IP-Adresse</td></tr>
            <tr><td>2 Sicherung</td><td>Frame</td><td>MAC-Adresse</td></tr>
            <tr><td>1 Bitübertragung</td><td>Bit</td><td>–</td></tr>
          </tbody>
        </table>
        <p>Beim Empfänger läuft alles umgekehrt (Decapsulation): Jede Schicht entfernt „ihren“ Header und reicht den Rest nach oben.</p>` },
      { heading: "OSI vs. TCP/IP – warum zwei Modelle?",
        html: `<p>Das <strong>OSI-Modell</strong> ist ein didaktisches Referenzmodell (7 Schichten). Das <strong>TCP/IP-Modell</strong> bildet die reale Internet-Praxis ab und fasst Schichten zusammen. In der Prüfung wird häufig die Zuordnung <em>Gerät/Protokoll → Schicht</em> abgefragt – diese sicher zu beherrschen ist Pflicht.</p>
        <p><strong>Kurz gemerkt:</strong></p>
        <ul>
          <li>Encapsulation = Header anhängen beim Senden, Decapsulation = entfernen beim Empfangen.</li>
          <li>Schicht 4 trennt mit Ports, Schicht 3 adressiert mit IP, Schicht 2 mit MAC.</li>
          <li>Datenflussrichtung beim Senden: 7 → 1, beim Empfangen: 1 → 7.</li>
        </ul>` },
    ],
    questionIds: ["q-osi-1","q-osi-2","q-osi-3","q-osi-match-1","q-osi-cloze-1","fc-osi-1","fc-osi-2","q-osi-4","q-osi-tf-2","q-osi-5"],
  },

  {
    id: "ipv4",
    title: "IPv4-Adressierung",
    lernfeld: "LF8", examArea: "AP2-NE", bereich: "netzwerk", icon: "🔢",
    summary: "Aufbau, Klassen, private/öffentliche Bereiche und APIPA von IPv4-Adressen.",
    visual: null,
    sections: [
      { heading: "Aufbau",
        html: `<p>Eine IPv4-Adresse ist 32 Bit lang, notiert als vier Oktette (0–255), z. B. <code>192.168.10.25</code>. Die Subnetzmaske trennt Netz- von Hostanteil: Eine <code>1</code> in der Maske markiert Netz-, eine <code>0</code> Host-Bits.</p>` },
      { heading: "Adressklassen (historisch)",
        html: `<table>
          <tr><th>Klasse</th><th>1. Oktett</th><th>Standardmaske</th><th>Verwendung</th></tr>
          <tr><td>A</td><td>1–126</td><td>/8 (255.0.0.0)</td><td>sehr große Netze</td></tr>
          <tr><td>B</td><td>128–191</td><td>/16 (255.255.0.0)</td><td>mittlere Netze</td></tr>
          <tr><td>C</td><td>192–223</td><td>/24 (255.255.255.0)</td><td>kleine Netze</td></tr>
          <tr><td>D</td><td>224–239</td><td>—</td><td>Multicast</td></tr>
          <tr><td>E</td><td>240–255</td><td>—</td><td>reserviert/Forschung</td></tr>
        </table>
        <p>Heute wird klassenlos (CIDR) gearbeitet; die Klassen dienen v. a. dem Verständnis. <code>127.0.0.0/8</code> ist Loopback.</p>` },
      { heading: "Private Bereiche (RFC 1918) & APIPA",
        html: `<ul>
          <li><strong>10.0.0.0/8</strong> (Klasse A)</li>
          <li><strong>172.16.0.0/12</strong> (172.16.–172.31.)</li>
          <li><strong>192.168.0.0/16</strong> (Klasse C)</li>
          <li><strong>APIPA 169.254.0.0/16:</strong> automatische Selbstvergabe, wenn kein DHCP-Server antwortet. Erkennungszeichen für DHCP-Probleme.</li>
        </ul>` },
    ],
    examples: [
      { title: "Privat oder öffentlich?", html: `<p><code>172.20.5.4</code> liegt im Bereich 172.16.–172.31. ⇒ privat. <code>172.40.5.4</code> liegt außerhalb ⇒ öffentlich.</p>` },
    ],
    merksaetze: [
      "Private Netze nicht im Internet routbar – NAT übersetzt nach außen.",
      "169.254.x.x = APIPA ⇒ „DHCP nicht erreichbar“.",
    ],
    cheatsheet: [
      "Privat: 10/8 · 172.16/12 · 192.168/16",
      "Loopback 127.0.0.1 · APIPA 169.254.0.0/16",
      "32 Bit = 4 Oktette à 0–255",
    ],
    deepDive: [
      { heading: "Netz-, Broadcast- und Hostadresse",
        html: `<p>In jedem IPv4-Subnetz sind zwei Adressen reserviert und <strong>nicht</strong> an Hosts vergebbar:</p>
        <ul>
          <li><strong>Netzadresse</strong> (alle Hostbits = 0): identifiziert das Netz selbst, z. B. <code>192.168.10.0</code>.</li>
          <li><strong>Broadcastadresse</strong> (alle Hostbits = 1): erreicht alle Hosts im Netz, z. B. <code>192.168.10.255</code>.</li>
        </ul>
        <p>Bei einem /24 bleiben somit <code>.1</code> bis <code>.254</code> als nutzbare Hostadressen (254 Stück).</p>` },
      { heading: "Besondere Adressbereiche",
        html: `<table>
          <thead><tr><th>Bereich</th><th>Bedeutung</th></tr></thead>
          <tbody>
            <tr><td>10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</td><td>private Netze (RFC 1918), nicht im Internet routbar</td></tr>
            <tr><td>127.0.0.0/8</td><td>Loopback (eigener Host)</td></tr>
            <tr><td>169.254.0.0/16</td><td>APIPA – Selbstvergabe ohne DHCP</td></tr>
            <tr><td>0.0.0.0/0</td><td>Default-Route / „beliebig“</td></tr>
          </tbody>
        </table>
        <p><strong>Kurz gemerkt:</strong> Sieht ein Client eine 169.254.x.y-Adresse, hat er <em>keinen</em> DHCP-Server erreicht – ein klassischer Fehlerhinweis im Support.</p>` },
    ],
    questionIds: ["q-ipv4-1","q-ipv4-2","q-ipv4-tf-1","fc-ipv4-1","q-ipv4-3","q-ipv4-multi-1","q-ipv4-cloze-1"],
  },

  {
    id: "subnetting",
    title: "Subnetting, CIDR & VLSM",
    lernfeld: "LF8", examArea: "AP2-NE", bereich: "netzwerk", icon: "🧮",
    summary: "Berechnung von Netz-, Broadcast- und Hostadressen, Subnetzmasken sowie Anzahl Hosts/Subnetze.",
    visual: null,
    sections: [
      { heading: "CIDR-Notation",
        html: `<p>Die CIDR-Notation <code>/n</code> gibt die Anzahl der Netz-Bits an. Aus ihr folgt die Subnetzmaske und die Größe des Netzes.</p>
        <p><strong>Hosts pro Netz</strong> = 2<sup>(32−n)</sup> − 2 (Netz- und Broadcastadresse abziehen).</p>` },
      { heading: "Schrittweise rechnen",
        html: `<ol>
          <li>Wie viele Host-Bits? <code>h = 32 − n</code>.</li>
          <li>Blockgröße im letzten relevanten Oktett = <code>256 − Maskenwert</code>.</li>
          <li>Netzadresse = erste Adresse des Blocks (Host-Bits = 0).</li>
          <li>Broadcast = letzte Adresse des Blocks (Host-Bits = 1).</li>
          <li>Nutzbare Hosts = dazwischen.</li>
        </ol>` },
      { heading: "VLSM",
        html: `<p><strong>Variable Length Subnet Mask:</strong> unterschiedlich große Subnetze aus einem Adressraum bilden, indem man Bedarf absteigend sortiert und die größten Subnetze zuerst vergibt. Spart Adressen gegenüber gleich großen Subnetzen.</p>` },
    ],
    examples: [
      { title: "192.168.1.0/26", html: `<p>/26 ⇒ Maske 255.255.255.192, Blockgröße 64. Subnetze: .0, .64, .128, .192. Für <code>192.168.1.0/26</code>: Netz .0, Broadcast .63, Hosts .1–.62 ⇒ <strong>62 Hosts</strong>.</p>` },
    ],
    merksaetze: [
      "Blockgröße = 256 − letzter Maskenwert.",
      "Nutzbare Hosts = 2^(Hostbits) − 2.",
      "Netzadresse: alle Hostbits 0; Broadcast: alle Hostbits 1.",
    ],
    cheatsheet: [
      "/24=256(254H) /25=128(126H) /26=64(62H) /27=32(30H) /28=16(14H) /29=8(6H) /30=4(2H)",
      "Maskenwerte: 128·192·224·240·248·252·254·255",
      "Übe interaktiv im Subnetting-Trainer!",
    ],
    deepDive: [
      { heading: "Subnetting in 4 Schritten (Klausur-Rezept)",
        html: `<ol>
          <li><strong>Hostbits bestimmen:</strong> 32 − Präfix. Beispiel /26 ⇒ 6 Hostbits.</li>
          <li><strong>Adressen/Hosts berechnen:</strong> 2^Hostbits Adressen, davon −2 nutzbar. /26 ⇒ 2^6 = 64, also 62 Hosts.</li>
          <li><strong>Blockgröße:</strong> 256 − Maskenwert im relevanten Oktett. /26 ⇒ Maske 192 ⇒ 256−192 = 64.</li>
          <li><strong>Subnetze ablesen:</strong> in Schritten der Blockgröße: .0, .64, .128, .192. Broadcast = nächste Netzadresse − 1.</li>
        </ol>` },
      { heading: "VLSM & CIDR",
        html: `<p><strong>CIDR</strong> (Classless Inter-Domain Routing) löst sich von den alten Klassen A/B/C und nutzt frei wählbare Präfixe (z. B. /22). <strong>VLSM</strong> (Variable Length Subnet Mask) erlaubt <em>unterschiedlich große</em> Subnetze im selben Netz – große Subnetze zuerst zuteilen, dann die kleinen. So spart man Adressen.</p>
        <p><strong>Kurz gemerkt:</strong></p>
        <ul>
          <li>Maskenwerte je Oktett: 128 · 192 · 224 · 240 · 248 · 252 · 254 · 255.</li>
          <li>Nutzbare Hosts = 2^Hostbits − 2 (Ausnahme /31 für Punkt-zu-Punkt).</li>
          <li>Bei VLSM immer den größten Bedarf zuerst zuweisen.</li>
        </ul>` },
    ],
    questionIds: ["q-sub-1","q-sub-2","q-sub-calc-1","q-sub-calc-2","q-sub-cloze-1","fc-sub-1","q-sub-3","q-sub-calc-3","q-sub-match-1"],
  },

  {
    id: "ipv6",
    title: "IPv6",
    lernfeld: "LF8", examArea: "AP2-NE", bereich: "netzwerk", icon: "🆕",
    summary: "Aufbau, Notation/Kürzungsregeln, Adresstypen und SLAAC.",
    visual: null,
    sections: [
      { heading: "Aufbau & Notation",
        html: `<p>IPv6-Adressen sind 128 Bit lang, notiert als acht 16-Bit-Blöcke in Hexadezimal, getrennt durch Doppelpunkte: <code>2001:0db8:0000:0000:0000:ff00:0042:8329</code>.</p>
        <p><strong>Kürzungsregeln:</strong> führende Nullen je Block weglassen; einmalig eine Folge aus Nullblöcken durch <code>::</code> ersetzen ⇒ <code>2001:db8::ff00:42:8329</code>.</p>` },
      { heading: "Adresstypen",
        html: `<ul>
          <li><strong>Global Unicast</strong> (2000::/3) – weltweit eindeutig, routbar.</li>
          <li><strong>Link-Local</strong> (fe80::/10) – nur im lokalen Segment, automatisch.</li>
          <li><strong>Unique Local (ULA)</strong> (fc00::/7) – private Adressen.</li>
          <li><strong>Multicast</strong> (ff00::/8) – ersetzt Broadcast (den es in IPv6 nicht mehr gibt).</li>
        </ul>` },
      { heading: "SLAAC",
        html: `<p><strong>Stateless Address Autoconfiguration:</strong> Clients bilden ihre Adresse selbst aus dem per Router Advertisement (ICMPv6) verteilten Präfix und einem Interface-Identifier – ohne DHCP-Server.</p>` },
    ],
    examples: [
      { title: "Kürzen", html: `<p><code>fe80:0000:0000:0000:0204:61ff:fe9d:f156</code> ⇒ <code>fe80::204:61ff:fe9d:f156</code>.</p>` },
    ],
    merksaetze: [
      "128 Bit, Hex, Blöcke à 16 Bit. „::“ nur einmal pro Adresse.",
      "fe80:: = Link-Local, immer vorhanden.",
      "IPv6 kennt keinen Broadcast – stattdessen Multicast.",
    ],
    cheatsheet: [
      "Global 2000::/3 · Link-Local fe80::/10 · ULA fc00::/7 · Multicast ff00::/8",
      "Loopback ::1 · unspecified ::",
      "SLAAC nutzt Router Advertisements (ICMPv6)",
    ],
    deepDive: [
      { heading: "Verkürzungsregeln (RFC 5952)",
        html: `<p>IPv6-Adressen lassen sich kürzen:</p>
        <ul>
          <li>Führende Nullen je Block weglassen: <code>2001:0db8:0000:0000:0000:0000:0000:0001</code> → <code>2001:db8:0:0:0:0:0:1</code>.</li>
          <li>Eine zusammenhängende Folge von Null-Blöcken durch <code>::</code> ersetzen – aber <strong>nur einmal</strong> pro Adresse: → <code>2001:db8::1</code>.</li>
          <li>Hex-Buchstaben klein schreiben (Kanonisierung).</li>
        </ul>` },
      { heading: "Adresstypen & Aufbau",
        html: `<table>
          <thead><tr><th>Präfix</th><th>Typ</th></tr></thead>
          <tbody>
            <tr><td>2000::/3</td><td>Global Unicast (öffentlich routbar)</td></tr>
            <tr><td>fc00::/7</td><td>Unique Local (privat, vgl. RFC 1918)</td></tr>
            <tr><td>fe80::/10</td><td>Link-Local (nur im Segment)</td></tr>
            <tr><td>ff00::/8</td><td>Multicast (kein Broadcast in IPv6!)</td></tr>
          </tbody>
        </table>
        <p><strong>Kurz gemerkt:</strong> 128 Bit, 8 Blöcke à 16 Bit. Statt Broadcast nur Multicast. SLAAC erlaubt die zustandslose Autokonfiguration über Router-Advertisements.</p>` },
    ],
    questionIds: ["q-ipv6-1","q-ipv6-2","q-ipv6-tf-1","fc-ipv6-1","q-ipv6-3","q-ipv6-cloze-1","q-ipv6-tf-2"],
  },

  {
    id: "ethernet-switching",
    title: "Ethernet, MAC & Switching",
    lernfeld: "LF8", examArea: "AP2-NE", bereich: "netzwerk", icon: "🔀",
    summary: "MAC-Adressen, Kollisions-/Broadcast-Domänen, Switching und ARP.",
    visual: null,
    sections: [
      { heading: "MAC-Adressen",
        html: `<p>Eine MAC-Adresse ist 48 Bit (6 Byte), hex notiert, z. B. <code>00:1A:2B:3C:4D:5E</code>. Die ersten 3 Byte (OUI) kennzeichnen den Hersteller. Sie arbeitet auf OSI-Schicht 2 und ist (theoretisch) weltweit eindeutig.</p>` },
      { heading: "Switching",
        html: `<p>Ein Switch lernt anhand der Quell-MAC eingehender Frames, an welchem Port welches Gerät hängt (MAC-Adresstabelle / CAM). Frames werden gezielt nur an den Zielport weitergeleitet. Jeder Switch-Port ist eine eigene <strong>Kollisionsdomäne</strong>; ein VLAN/Switch ohne Router bildet eine gemeinsame <strong>Broadcast-Domäne</strong>.</p>` },
      { heading: "ARP",
        html: `<p>Das <strong>Address Resolution Protocol</strong> löst eine bekannte IPv4-Adresse in die zugehörige MAC-Adresse auf: „Wer hat 192.168.1.1? Sag es 192.168.1.10.“ (Broadcast-Anfrage, Unicast-Antwort). Der ARP-Cache speichert die Zuordnung temporär.</p>` },
    ],
    examples: [
      { title: "Kollisionsdomänen", html: `<p>Ein Hub bildet eine einzige Kollisionsdomäne über alle Ports. Ein Switch trennt sie pro Port ⇒ Vollduplex, keine Kollisionen.</p>` },
    ],
    merksaetze: [
      "Switch lernt MAC-Adressen, Router routet IP.",
      "ARP: IP → MAC (im selben Subnetz).",
      "Router trennt Broadcast-Domänen, Switch trennt Kollisionsdomänen.",
    ],
    cheatsheet: [
      "MAC = 48 Bit, OUI = Hersteller",
      "ARP: IPv4→MAC · IPv6 nutzt Neighbor Discovery",
      "Hub=L1, Switch=L2, Router=L3",
    ],
    deepDive: [
      { heading: "Wie ein Switch lernt (MAC-/CAM-Tabelle)",
        html: `<p>Ein Switch betrachtet die <strong>Quell-MAC</strong> ankommender Frames und merkt sich, an welchem Port welche MAC hängt (MAC-/CAM-Tabelle). Für das Ziel gilt:</p>
        <ul>
          <li><strong>Ziel bekannt:</strong> Frame nur an den passenden Port weiterleiten (forwarding).</li>
          <li><strong>Ziel unbekannt / Broadcast:</strong> an alle Ports außer dem Eingang fluten (flooding).</li>
        </ul>
        <p>Das ARP-Protokoll löst dabei IP- in MAC-Adressen auf (Schicht 3 → 2).</p>` },
      { heading: "Kollisions- vs. Broadcast-Domäne",
        html: `<p>Ein <strong>Hub</strong> bildet eine einzige große Kollisionsdomäne (Halbduplex, alle teilen sich das Medium). Ein <strong>Switch</strong> gibt jedem Port eine eigene Kollisionsdomäne (Vollduplex), trennt aber <em>keine</em> Broadcast-Domänen – das macht erst ein <strong>Router</strong> (oder VLANs).</p>
        <p><strong>Kurz gemerkt:</strong></p>
        <ul>
          <li>MAC = 48 Bit, erste 24 Bit = Hersteller-OUI.</li>
          <li>Switch trennt Kollisions-, Router/VLAN trennt Broadcast-Domänen.</li>
        </ul>` },
    ],
    questionIds: ["q-eth-1","q-eth-2","q-arp-tf-1","fc-mac-1","q-eth-3","q-eth-tf-2","q-eth-match-1"],
  },

  {
    id: "vlan",
    title: "VLANs & Trunking (802.1Q)",
    lernfeld: "LF9", examArea: "AP2-NE", bereich: "netzwerk", icon: "🏷️",
    summary: "Virtuelle LANs, 802.1Q-Tagging, Trunks und Inter-VLAN-Routing.",
    visual: null,
    sections: [
      { heading: "Was ist ein VLAN?",
        html: `<p>Ein <strong>VLAN</strong> (Virtual LAN) trennt ein physisches Switch-Netz logisch in mehrere Broadcast-Domänen. Geräte verschiedener VLANs können nicht direkt kommunizieren – das erhöht Sicherheit und reduziert Broadcast-Last.</p>` },
      { heading: "802.1Q & Trunks",
        html: `<p><strong>Access-Ports</strong> gehören genau einem VLAN (Endgeräte). <strong>Trunk-Ports</strong> übertragen mehrere VLANs zwischen Switches; dazu wird per <strong>IEEE 802.1Q</strong> ein 4-Byte-Tag mit der VLAN-ID (12 Bit ⇒ 1–4094) in den Ethernet-Frame eingefügt. Das <strong>Native VLAN</strong> wird untagged übertragen.</p>` },
      { heading: "Inter-VLAN-Routing",
        html: `<p>Damit VLANs miteinander kommunizieren, ist ein Layer-3-Gerät nötig: ein Router (<em>Router-on-a-Stick</em> mit Sub-Interfaces) oder ein <strong>Layer-3-Switch</strong> mit SVIs (Switch Virtual Interfaces).</p>` },
    ],
    examples: [
      { title: "Abteilungstrennung", html: `<p>VLAN 10 = Verwaltung, VLAN 20 = Produktion, VLAN 99 = Management. Ein Trunk zwischen zwei Switches überträgt alle drei VLANs getaggt; ein L3-Switch routet bei Bedarf zwischen ihnen.</p>` },
    ],
    merksaetze: [
      "Access = 1 VLAN (untagged), Trunk = viele VLANs (802.1Q-Tag).",
      "VLAN-ID: 12 Bit ⇒ 1–4094 nutzbar.",
      "Inter-VLAN braucht Layer 3 (Router/L3-Switch).",
    ],
    cheatsheet: [
      "802.1Q-Tag = 4 Byte im Frame",
      "Native VLAN = untagged auf dem Trunk",
      "Router-on-a-Stick = Sub-Interfaces",
    ],
    deepDive: [
      { heading: "Access- vs. Trunk-Port",
        html: `<ul>
          <li><strong>Access-Port:</strong> gehört zu genau einem VLAN, hier hängen Endgeräte (PC, Drucker). Frames sind ungetaggt.</li>
          <li><strong>Trunk-Port:</strong> überträgt mehrere VLANs zwischen Switches/zum Router. Frames werden per <strong>802.1Q</strong>-Tag (4 Byte, 12-Bit-VLAN-ID) markiert.</li>
        </ul>
        <p>Inter-VLAN-Routing (Kommunikation zwischen VLANs) erfordert einen Router oder Layer-3-Switch („Router-on-a-Stick“).</p>` },
      { heading: "Nutzen & Sicherheit",
        html: `<p>VLANs segmentieren ein physisches Netz logisch – das verbessert Sicherheit (Trennung von z. B. Gäste-, Büro-, VoIP-Netz), Performance (kleinere Broadcast-Domänen) und Flexibilität (standortunabhängige Gruppen).</p>
        <p><strong>Kurz gemerkt:</strong></p>
        <ul>
          <li>Ein VLAN = eine Broadcast-Domäne.</li>
          <li>Native VLAN läuft untagged – aus Sicherheitsgründen separat halten.</li>
          <li>VLAN-IDs 1–4094 nutzbar (12 Bit).</li>
        </ul>` },
    ],
    questionIds: ["q-vlan-1","q-vlan-2","q-vlan-tf-1","fc-vlan-1","q-vlan-3","q-vlan-tf-2","q-vlan-cloze-1"],
  },

  {
    id: "stp",
    title: "STP / RSTP / MSTP",
    lernfeld: "LF9", examArea: "AP2-NE", bereich: "netzwerk", icon: "🌳",
    summary: "Schleifenvermeidung in Layer-2-Netzen: Root Bridge, Port-Rollen/-Zustände, BPDU.",
    visual: null,
    sections: [
      { heading: "Problem: Layer-2-Schleifen",
        html: `<p>Redundante Switch-Verbindungen erzeugen ohne Schutz Broadcast-Stürme und MAC-Tabellen-Instabilität. Das <strong>Spanning Tree Protocol (IEEE 802.1D)</strong> baut eine schleifenfreie Baumstruktur, indem es redundante Pfade logisch blockiert.</p>` },
      { heading: "Root Bridge & Wahl",
        html: `<p>Per <strong>BPDU</strong> (Bridge Protocol Data Unit) wählen die Switches die <strong>Root Bridge</strong> mit der niedrigsten Bridge-ID (Priorität + MAC). Alle anderen Switches bestimmen ihren günstigsten Pfad (Root-Port) zur Root Bridge anhand der Pfadkosten.</p>` },
      { heading: "Port-Rollen & -Zustände",
        html: `<p><strong>Rollen:</strong> Root-Port (zur Root), Designated-Port (pro Segment weiterleitend), Blocking/Alternate (gesperrt).<br>
        <strong>STP-Zustände:</strong> Blocking → Listening → Learning → Forwarding (bis ~50 s Konvergenz).<br>
        <strong>RSTP (802.1w):</strong> deutlich schnellere Konvergenz (Sekunden). <strong>MSTP (802.1s):</strong> mehrere VLANs auf Spanning-Tree-Instanzen abbilden.</p>` },
    ],
    examples: [
      { title: "Niedrigste Priorität gewinnt", html: `<p>Standard-Priorität 32768. Setzt man auf dem Core-Switch 4096, wird dieser sicher Root Bridge – unabhängig von der MAC.</p>` },
    ],
    merksaetze: [
      "Root Bridge = niedrigste Bridge-ID (Priorität, dann MAC).",
      "RSTP konvergiert in Sekunden, klassisches STP in ~50 s.",
      "Blockierte Ports verhindern Schleifen, bleiben aber Standby.",
    ],
    cheatsheet: [
      "802.1D=STP · 802.1w=RSTP · 802.1s=MSTP",
      "Zustände: Blocking→Listening→Learning→Forwarding",
      "Bridge-ID = Priorität(4096er-Schritte)+MAC",
    ],
    deepDive: [
      { heading: "Warum STP? Das Broadcast-Storm-Problem",
        html: `<p>Redundante Switch-Verbindungen erhöhen die Ausfallsicherheit – ohne Schutz entstehen aber <strong>Layer-2-Schleifen</strong>: Broadcasts kreisen endlos (Broadcast-Storm), MAC-Tabellen werden instabil, das Netz bricht zusammen. <strong>STP</strong> (802.1D) baut daher logisch einen schleifenfreien Baum, indem es überschüssige Pfade blockiert (Standby).</p>` },
      { heading: "Root-Bridge-Wahl & Konvergenz",
        html: `<p>Zuerst wird die <strong>Root-Bridge</strong> bestimmt: die Bridge mit der niedrigsten Bridge-ID (Priorität, bei Gleichstand niedrigste MAC). Jeder andere Switch wählt seinen kostengünstigsten <strong>Root-Port</strong>; je Segment gibt es einen <strong>Designated Port</strong>, der Rest wird blockiert.</p>
        <p><strong>Kurz gemerkt:</strong></p>
        <ul>
          <li>Klassisches STP konvergiert langsam (~30–50 s), <strong>RSTP</strong> (802.1w) in unter 1 s.</li>
          <li>Portrollen: Root, Designated, Blocking/Alternate.</li>
          <li>Niedrigste Bridge-ID gewinnt die Root-Wahl.</li>
        </ul>` },
    ],
    questionIds: ["q-stp-1","q-stp-2","q-stp-match-1","fc-stp-1","q-stp-3","q-stp-tf-2"],
  },

  {
    id: "routing",
    title: "Routing: statisch, RIP & OSPF",
    lernfeld: "LF9", examArea: "AP2-NE", bereich: "netzwerk", icon: "🧭",
    summary: "Statisches vs. dynamisches Routing, RIP, OSPF, Default-Route und Routing-Tabelle.",
    visual: null,
    sections: [
      { heading: "Routing-Grundlagen",
        html: `<p>Router treffen Weiterleitungsentscheidungen anhand der <strong>Routing-Tabelle</strong>. Bei mehreren passenden Einträgen gilt <strong>Longest Prefix Match</strong> (die spezifischste Route gewinnt). Die <strong>Default-Route</strong> <code>0.0.0.0/0</code> fängt alles ab, wofür es keine spezifischere Route gibt.</p>` },
      { heading: "Statisch vs. dynamisch",
        html: `<p><strong>Statisch:</strong> manuell gepflegt, ressourcenschonend, fehleranfällig bei Änderungen – gut für kleine/stabile Netze.<br>
        <strong>Dynamisch:</strong> Router tauschen Routen automatisch aus und reagieren auf Ausfälle (Konvergenz).</p>` },
      { heading: "RIP vs. OSPF",
        html: `<table>
          <tr><th></th><th>RIP</th><th>OSPF</th></tr>
          <tr><td>Typ</td><td>Distance Vector</td><td>Link State</td></tr>
          <tr><td>Metrik</td><td>Hop-Count (max 15)</td><td>Cost (basierend auf Bandbreite)</td></tr>
          <tr><td>Konvergenz</td><td>langsam</td><td>schnell</td></tr>
          <tr><td>Struktur</td><td>flach</td><td>Areas (Area 0 = Backbone)</td></tr>
        </table>
        <p>OSPF skaliert besser und ist heute Standard in größeren Netzen.</p>` },
    ],
    examples: [
      { title: "Default-Route", html: `<p><code>ip route 0.0.0.0 0.0.0.0 203.0.113.1</code> – schickt allen Traffic ohne spezifischere Route an das nächste Gateway (z. B. den Internet-Router).</p>` },
    ],
    merksaetze: [
      "Longest Prefix Match: spezifischste Route gewinnt.",
      "RIP zählt Hops (max 15 = unerreichbar bei 16).",
      "OSPF nutzt Areas; Area 0 ist das Backbone.",
    ],
    cheatsheet: [
      "Default-Route = 0.0.0.0/0",
      "RIP=Distanzvektor/Hops · OSPF=Link-State/Cost",
      "Administrative Distanz entscheidet zwischen Protokollen",
    ],
    deepDive: [
      { heading: "Distanzvektor vs. Link-State",
        html: `<table>
          <thead><tr><th></th><th>RIP (Distanzvektor)</th><th>OSPF (Link-State)</th></tr></thead>
          <tbody>
            <tr><td>Metrik</td><td>Hop-Count (max. 15)</td><td>Kosten (abh. von Bandbreite)</td></tr>
            <tr><td>Updates</td><td>periodisch ganze Tabelle</td><td>nur bei Änderungen (LSA)</td></tr>
            <tr><td>Skalierung</td><td>kleine Netze</td><td>große Netze, Areas</td></tr>
          </tbody>
        </table>
        <p>RIP „erzählt seinen Nachbarn, was es kennt“; OSPF „kennt die ganze Topologie“ und berechnet kürzeste Pfade (Dijkstra).</p>` },
      { heading: "Routing-Entscheidung & Default-Route",
        html: `<p>Ein Router wählt stets die <strong>spezifischste</strong> passende Route (längstes Präfix, „Longest Prefix Match“). Findet sich kein Eintrag, greift die <strong>Default-Route 0.0.0.0/0</strong> (Richtung Internet/Gateway).</p>
        <p><strong>Kurz gemerkt:</strong></p>
        <ul>
          <li>Statische Routen: manuell, stabil, kein Overhead – aber wartungsintensiv.</li>
          <li>Dynamische Routen: passen sich an, kosten Ressourcen/Bandbreite.</li>
          <li>Longest Prefix Match schlägt jede unspezifischere Route.</li>
        </ul>` },
    ],
    questionIds: ["q-route-1","q-route-2","q-route-tf-1","fc-route-1","q-route-3","q-route-tf-2","q-route-match-1"],
  },

  {
    id: "nat",
    title: "NAT / PAT & Port-Forwarding",
    lernfeld: "LF9", examArea: "AP2-NE", bereich: "netzwerk", icon: "🔁",
    summary: "Adressumsetzung zwischen privaten und öffentlichen Netzen.",
    visual: null,
    sections: [
      { heading: "NAT",
        html: `<p><strong>Network Address Translation</strong> übersetzt private in öffentliche IP-Adressen. So teilen sich viele interne Geräte wenige öffentliche Adressen – das mildert die IPv4-Knappheit und verbirgt die interne Struktur.</p>` },
      { heading: "PAT (NAT-Overload)",
        html: `<p><strong>Port Address Translation</strong> bildet viele interne Adressen auf <em>eine</em> öffentliche IP ab und unterscheidet die Verbindungen über unterschiedliche Quell-Ports. Das ist der Standard im Heim-/Büro-Router.</p>` },
      { heading: "Port-Forwarding",
        html: `<p>Eingehende Verbindungen von außen werden gezielt an einen internen Host/Port weitergeleitet (z. B. Port 443 → interner Webserver), damit Dienste trotz NAT erreichbar sind.</p>` },
    ],
    examples: [
      { title: "PAT zu Hause", html: `<p>10 Geräte im Heimnetz surfen gleichzeitig über die eine öffentliche IP des Routers – PAT unterscheidet sie anhand der Portnummern in der NAT-Tabelle.</p>` },
    ],
    merksaetze: [
      "PAT = viele intern → eine öffentliche IP (über Ports unterschieden).",
      "Port-Forwarding macht interne Dienste von außen erreichbar.",
    ],
    cheatsheet: [
      "NAT verbirgt interne Struktur & spart IPv4",
      "PAT = NAT Overload (portbasiert)",
      "DMZ/Port-Forwarding für eingehende Dienste",
    ],
    deepDive: [
      { heading: "NAT, PAT & Port-Forwarding",
        html: `<ul>
          <li><strong>NAT (1:1):</strong> tauscht eine private gegen eine öffentliche IP.</li>
          <li><strong>PAT / NAT-Overload (n:1):</strong> viele interne Hosts teilen eine öffentliche IP – unterschieden über die <strong>Quell-Portnummer</strong>. Das ist der Normalfall im Heim-/Firmenrouter.</li>
          <li><strong>Port-Forwarding (DNAT):</strong> leitet von außen eingehende Verbindungen auf einen bestimmten internen Host/Port (z. B. Webserver) weiter.</li>
        </ul>` },
      { heading: "Grenzen von NAT",
        html: `<p>NAT verbirgt interne Adressen, ist aber <strong>kein vollständiger Sicherheitsmechanismus</strong> – eine Firewall bleibt nötig. Zudem erschwert NAT Ende-zu-Ende-Verbindungen (z. B. VoIP, P2P) und macht Techniken wie STUN nötig. IPv6 mit globalem Adressraum macht NAT weitgehend überflüssig.</p>
        <p><strong>Kurz gemerkt:</strong> PAT multiplext über Ports; Port-Forwarding öffnet gezielt einen Dienst nach außen.</p>` },
    ],
    questionIds: ["q-nat-1","q-nat-tf-1","fc-nat-1","q-nat-2","q-nat-tf-2"],
  },

  {
    id: "dhcp-dns",
    title: "DHCP & DNS",
    lernfeld: "LF8", examArea: "AP2-NE", bereich: "netzwerk", icon: "📇",
    summary: "Automatische IP-Vergabe (DORA) und Namensauflösung (Recordtypen).",
    visual: "dora",
    sections: [
      { heading: "DHCP & DORA",
        html: `<p>Das <strong>Dynamic Host Configuration Protocol</strong> vergibt IP-Konfiguration automatisch. Ablauf <strong>DORA</strong>:</p>
        <ol>
          <li><strong>Discover</strong> – Client sucht per Broadcast einen DHCP-Server.</li>
          <li><strong>Offer</strong> – Server bietet eine Adresse an.</li>
          <li><strong>Request</strong> – Client fordert das Angebot an.</li>
          <li><strong>Acknowledge</strong> – Server bestätigt; Lease-Zeit startet.</li>
        </ol>
        <p>Über die Lease wird die Adresse befristet vergeben; ein <strong>DHCP-Relay</strong> (IP-Helper) leitet Anfragen über Subnetzgrenzen an den Server weiter.</p>` },
      { heading: "DNS",
        html: `<p>Das <strong>Domain Name System</strong> löst Namen in IP-Adressen auf (Forward) bzw. umgekehrt (Reverse). Auflösung erfolgt hierarchisch über Root-, TLD- und autoritative Server, meist rekursiv über einen Resolver.</p>` },
      { heading: "Wichtige Recordtypen",
        html: `<ul>
          <li><strong>A</strong> – Name → IPv4</li>
          <li><strong>AAAA</strong> – Name → IPv6</li>
          <li><strong>CNAME</strong> – Alias auf anderen Namen</li>
          <li><strong>MX</strong> – Mailserver der Domäne</li>
          <li><strong>PTR</strong> – Reverse-Lookup (IP → Name)</li>
          <li><strong>NS</strong> – zuständige Nameserver</li>
          <li><strong>TXT</strong> – Freitext (z. B. SPF/DKIM)</li>
        </ul>` },
    ],
    examples: [
      { title: "MX & A", html: `<p>Eine Mail an <code>name@firma.de</code> sucht den MX-Record von <code>firma.de</code>, der auf <code>mail.firma.de</code> zeigt; dessen A-Record liefert die IPv4 des Mailservers.</p>` },
    ],
    merksaetze: [
      "DORA: Discover, Offer, Request, Acknowledge.",
      "A=IPv4, AAAA=IPv6, MX=Mail, PTR=Reverse, CNAME=Alias.",
      "DHCP-Relay nötig, wenn Server in anderem Subnetz.",
    ],
    cheatsheet: [
      "DHCP-Ports: Server 67, Client 68 (UDP)",
      "DNS-Port: 53 (UDP/TCP)",
      "DORA = Discover·Offer·Request·Acknowledge",
    ],
    deepDive: [
      { heading: "DHCP-Ablauf (DORA)",
        html: `<ol>
          <li><strong>Discover:</strong> Client sucht per Broadcast einen DHCP-Server.</li>
          <li><strong>Offer:</strong> Server bietet eine IP-Konfiguration an.</li>
          <li><strong>Request:</strong> Client fordert das Angebot an (Broadcast, falls mehrere Server).</li>
          <li><strong>Acknowledge:</strong> Server bestätigt und vergibt die Lease.</li>
        </ol>
        <p>Server nutzt UDP-Port 67, Client UDP-Port 68. Über die <strong>Lease-Time</strong> wird die Adresse befristet vergeben und vorzeitig erneuert (Renew bei 50 %).</p>` },
      { heading: "DNS – Namen statt Zahlen",
        html: `<p>DNS löst Namen in IP-Adressen auf (UDP/TCP-Port 53). Wichtige Record-Typen:</p>
        <table>
          <thead><tr><th>Record</th><th>Funktion</th></tr></thead>
          <tbody>
            <tr><td>A / AAAA</td><td>Name → IPv4 / IPv6</td></tr>
            <tr><td>CNAME</td><td>Alias auf einen anderen Namen</td></tr>
            <tr><td>MX</td><td>zuständiger Mailserver</td></tr>
            <tr><td>PTR</td><td>Reverse-Lookup (IP → Name)</td></tr>
            <tr><td>TXT</td><td>frei (z. B. SPF/DKIM)</td></tr>
          </tbody>
        </table>
        <p><strong>Kurz gemerkt:</strong> Auflösung läuft rekursiv über Resolver und autoritative Server; die <strong>TTL</strong> steuert das Caching.</p>` },
    ],
    questionIds: ["q-dhcp-1","q-dns-1","q-dns-match-1","q-dhcp-tf-1","q-dhcp-cloze-1","fc-dns-1","fc-dhcp-1","q-dhcp-2","q-dns-2","q-dns-tf-2"],
  },

  {
    id: "ports",
    title: "Protokolle & Ports",
    lernfeld: "LF8", examArea: "AP2-NE", bereich: "netzwerk", icon: "🔢",
    summary: "Die wichtigsten Anwendungsprotokolle und ihre Standard-Ports.",
    visual: null,
    sections: [
      { heading: "Well-Known Ports (0–1023)",
        html: `<table>
          <tr><th>Port</th><th>Protokoll</th><th>Zweck</th></tr>
          <tr><td>20/21</td><td>FTP</td><td>Dateiübertragung (Daten/Steuerung)</td></tr>
          <tr><td>22</td><td>SSH / SFTP</td><td>verschlüsselte Shell/Übertragung</td></tr>
          <tr><td>23</td><td>Telnet</td><td>unverschlüsselte Shell (veraltet)</td></tr>
          <tr><td>25</td><td>SMTP</td><td>Mailversand</td></tr>
          <tr><td>53</td><td>DNS</td><td>Namensauflösung</td></tr>
          <tr><td>67/68</td><td>DHCP</td><td>IP-Vergabe</td></tr>
          <tr><td>80</td><td>HTTP</td><td>Web (unverschlüsselt)</td></tr>
          <tr><td>110/143</td><td>POP3/IMAP</td><td>Mailabruf</td></tr>
          <tr><td>123</td><td>NTP</td><td>Zeitsynchronisation</td></tr>
          <tr><td>161/162</td><td>SNMP</td><td>Netzwerk-Monitoring</td></tr>
          <tr><td>389/636</td><td>LDAP/LDAPS</td><td>Verzeichnisdienst</td></tr>
          <tr><td>443</td><td>HTTPS</td><td>Web (TLS)</td></tr>
          <tr><td>3389</td><td>RDP</td><td>Remotedesktop</td></tr>
        </table>` },
    ],
    examples: [
      { title: "Sicher vs. unsicher", html: `<p>HTTP (80) und FTP (21) übertragen im Klartext; HTTPS (443), SSH/SFTP (22) und LDAPS (636) sind verschlüsselt – im Zweifel die sichere Variante wählen.</p>` },
    ],
    merksaetze: [
      "22=SSH, 80=HTTP, 443=HTTPS, 3389=RDP, 53=DNS.",
      "Verschlüsselt bevorzugen: SSH statt Telnet, HTTPS statt HTTP.",
    ],
    cheatsheet: [
      "FTP 20/21 · SSH 22 · SMTP 25 · DNS 53 · HTTP 80 · HTTPS 443",
      "POP3 110 · IMAP 143 · LDAP 389 · RDP 3389 · NTP 123 · SNMP 161",
      "Übe Zuordnungen im Quiz!",
    ],
    deepDive: [
      { heading: "Port-Bereiche & wichtige Standard-Ports",
        html: `<p>Ports adressieren Anwendungen auf Schicht 4. Drei Bereiche:</p>
        <ul>
          <li><strong>0–1023</strong> Well-Known (Systemdienste)</li>
          <li><strong>1024–49151</strong> Registered (registrierte Anwendungen)</li>
          <li><strong>49152–65535</strong> dynamische/private Ports (z. B. Quellports von Clients)</li>
        </ul>
        <table>
          <thead><tr><th>Dienst</th><th>Port</th><th>Protokoll</th></tr></thead>
          <tbody>
            <tr><td>FTP (Steuer/Daten)</td><td>21 / 20</td><td>TCP</td></tr>
            <tr><td>SSH</td><td>22</td><td>TCP</td></tr>
            <tr><td>SMTP</td><td>25</td><td>TCP</td></tr>
            <tr><td>DNS</td><td>53</td><td>UDP/TCP</td></tr>
            <tr><td>HTTP / HTTPS</td><td>80 / 443</td><td>TCP</td></tr>
            <tr><td>DHCP</td><td>67/68</td><td>UDP</td></tr>
            <tr><td>RDP</td><td>3389</td><td>TCP</td></tr>
          </tbody>
        </table>
        <p><strong>Kurz gemerkt:</strong> HTTPS 443, SSH 22, RDP 3389, DNS 53 – diese werden in Prüfungen oft direkt abgefragt.</p>` },
    ],
    questionIds: ["q-port-1","q-port-2","q-port-match-1","fc-port-1","q-port-3","q-port-tf-1","q-port-cloze-1"],
  },

  {
    id: "wlan",
    title: "WLAN (802.11) & Sicherheit",
    lernfeld: "LF8", examArea: "AP2-NE", bereich: "netzwerk", icon: "📶",
    summary: "802.11-Standards, Bänder/Kanäle und WLAN-Sicherheit (WPA2/WPA3, 802.1X).",
    visual: null,
    sections: [
      { heading: "Standards & Bänder",
        html: `<table>
          <tr><th>Standard</th><th>Marketing</th><th>Band</th></tr>
          <tr><td>802.11n</td><td>Wi-Fi 4</td><td>2,4 + 5 GHz</td></tr>
          <tr><td>802.11ac</td><td>Wi-Fi 5</td><td>5 GHz</td></tr>
          <tr><td>802.11ax</td><td>Wi-Fi 6/6E</td><td>2,4 + 5 (+6) GHz</td></tr>
        </table>
        <p>2,4 GHz: größere Reichweite, störanfälliger, nur 3 überlappungsfreie Kanäle (1, 6, 11). 5 GHz: mehr Kanäle, höhere Datenrate, geringere Reichweite.</p>` },
      { heading: "Sicherheit",
        html: `<p><strong>WPA2</strong> (AES/CCMP) ist Mindeststandard; <strong>WPA3</strong> verbessert den Handshake (SAE) gegen Offline-Angriffe. WEP und WPA(1) gelten als unsicher. In Unternehmen authentifiziert <strong>802.1X</strong> (WPA2/3-Enterprise) Nutzer einzeln per RADIUS-Server.</p>` },
    ],
    examples: [
      { title: "Kanalwahl 2,4 GHz", html: `<p>In dicht besiedelten Umgebungen nur Kanäle 1, 6 und 11 verwenden, um Überlappungen zu vermeiden.</p>` },
    ],
    merksaetze: [
      "2,4 GHz: Kanäle 1, 6, 11 sind überlappungsfrei.",
      "WPA2 (AES) Minimum, WPA3 besser; WEP nie.",
      "802.1X = Enterprise-Login per RADIUS.",
    ],
    cheatsheet: [
      "Wi-Fi4=11n · Wi-Fi5=11ac · Wi-Fi6=11ax",
      "WPA3-SAE schützt vor Offline-Bruteforce",
      "5 GHz schneller, 2,4 GHz weiter",
    ],
    deepDive: [
      { heading: "WLAN-Sicherheit im Zeitverlauf",
        html: `<ul>
          <li><strong>WEP:</strong> veraltet und in Minuten knackbar – nie einsetzen.</li>
          <li><strong>WPA/TKIP:</strong> Übergangslösung, gilt heute als unsicher.</li>
          <li><strong>WPA2 (AES/CCMP):</strong> langjähriger Standard, weiterhin akzeptabel.</li>
          <li><strong>WPA3:</strong> aktueller Standard, nutzt SAE (Schutz gegen Offline-Wörterbuchangriffe) und erzwungene Verschlüsselung.</li>
        </ul>` },
      { heading: "Frequenzbänder & Reichweite",
        html: `<p>Das <strong>2,4-GHz-Band</strong> hat höhere Reichweite, aber wenige überlappungsfreie Kanäle (in Europa 1/6/11) und viele Störquellen. Das <strong>5-GHz-Band</strong> bietet mehr Kanäle und Datenrate, jedoch geringere Reichweite/Wanddurchdringung. Wi-Fi 6E/7 ergänzt 6 GHz.</p>
        <p><strong>Kurz gemerkt:</strong></p>
        <ul>
          <li>WPA3 > WPA2 > WPA > WEP (Sicherheit).</li>
          <li>SSID = Netzname; getrennte Gäste-SSID/VLAN für Besucher.</li>
          <li>Höhere Frequenz = mehr Tempo, weniger Reichweite.</li>
        </ul>` },
    ],
    questionIds: ["q-wlan-1","q-wlan-tf-1","fc-wlan-1","q-wlan-2","q-wlan-tf-2"],
  },

  {
    id: "vpn",
    title: "VPN & IPsec",
    lernfeld: "LF11", examArea: "AP2-NE", bereich: "netzwerk", icon: "🔒",
    summary: "Site-to-Site vs. Client-to-Site, IPsec (AH/ESP, IKE, Modi) und SSL/TLS-VPN.",
    visual: null,
    sections: [
      { heading: "VPN-Typen",
        html: `<p><strong>Site-to-Site</strong> verbindet ganze Standorte (Gateway-zu-Gateway). <strong>Client-to-Site (Remote Access)</strong> verbindet einzelne Endgeräte mit dem Firmennetz (Homeoffice).</p>` },
      { heading: "IPsec",
        html: `<p><strong>IPsec</strong> sichert IP-Pakete:
        <ul>
          <li><strong>AH</strong> (Authentication Header): Integrität & Authentizität, keine Verschlüsselung.</li>
          <li><strong>ESP</strong> (Encapsulating Security Payload): zusätzlich Verschlüsselung – heute Standard.</li>
          <li><strong>IKE</strong> handelt Schlüssel/Parameter aus (Security Associations).</li>
        </ul>
        <strong>Transport-Modus</strong> verschlüsselt nur die Nutzdaten (Ende-zu-Ende); <strong>Tunnel-Modus</strong> verschlüsselt das gesamte Originalpaket (Gateway-zu-Gateway, Standard bei Site-to-Site).</p>` },
      { heading: "SSL/TLS-VPN",
        html: `<p>Nutzt TLS (Port 443) – einfacher durch Firewalls, oft als Client-to-Site per Browser/Client. Verbreitet auch WireGuard/OpenVPN.</p>` },
    ],
    examples: [
      { title: "Homeoffice", html: `<p>Eine beschäftigte Person verbindet sich per Client-to-Site-VPN (IPsec oder TLS) ins Firmennetz und greift verschlüsselt auf interne Server zu.</p>` },
    ],
    merksaetze: [
      "ESP verschlüsselt, AH nicht.",
      "Tunnel-Modus = ganzes Paket (Site-to-Site), Transport = nur Nutzdaten.",
      "Site-to-Site = Standorte, Client-to-Site = Einzelgeräte.",
    ],
    cheatsheet: [
      "IPsec: AH·ESP·IKE",
      "TLS-VPN nutzt 443",
      "Tunnel vs. Transport Mode",
    ],
    deepDive: [
      { heading: "VPN-Typen",
        html: `<ul>
          <li><strong>Site-to-Site:</strong> koppelt dauerhaft zwei Standortnetze (Gateway zu Gateway).</li>
          <li><strong>Remote-Access (End-to-Site):</strong> einzelne Clients (Home-Office) wählen sich ins Firmennetz ein.</li>
        </ul>
        <p>Ziel ist stets ein verschlüsselter „Tunnel“ über ein unsicheres Netz (Internet), der Vertraulichkeit, Integrität und Authentizität sichert.</p>` },
      { heading: "IPsec-Bausteine",
        html: `<table>
          <thead><tr><th>Komponente</th><th>Funktion</th></tr></thead>
          <tbody>
            <tr><td>IKE</td><td>handelt Schlüssel & Sicherheitsparameter aus</td></tr>
            <tr><td>AH</td><td>Integrität/Authentizität – <em>keine</em> Verschlüsselung</td></tr>
            <tr><td>ESP</td><td>Verschlüsselung + Integrität der Nutzdaten</td></tr>
          </tbody>
        </table>
        <p>Im <strong>Tunnelmodus</strong> wird das gesamte IP-Paket gekapselt (Site-to-Site), im <strong>Transportmodus</strong> nur die Nutzlast.</p>
        <p><strong>Kurz gemerkt:</strong> ESP verschlüsselt, AH nicht. Tunnelmodus für VPN zwischen Netzen.</p>` },
    ],
    questionIds: ["q-vpn-1","q-vpn-2","q-vpn-tf-1","fc-vpn-1","q-vpn-3","q-vpn-tf-2"],
  },

  {
    id: "verkabelung",
    title: "Verkabelung & Topologien",
    lernfeld: "LF8", examArea: "AP2-NE", bereich: "netzwerk", icon: "🧵",
    summary: "Strukturierte Verkabelung (Kupfer/Glasfaser, Cat-Standards) und Netztopologien.",
    visual: null,
    sections: [
      { heading: "Kupfer (Twisted Pair)",
        html: `<table>
          <tr><th>Kategorie</th><th>Datenrate</th><th>Einsatz</th></tr>
          <tr><td>Cat5e</td><td>1 Gbit/s</td><td>Standard-LAN</td></tr>
          <tr><td>Cat6</td><td>1–10 Gbit/s (kurz)</td><td>moderne LANs</td></tr>
          <tr><td>Cat6a</td><td>10 Gbit/s bis 100 m</td><td>Backbone-Etagen</td></tr>
          <tr><td>Cat7</td><td>10 Gbit/s</td><td>geschirmt</td></tr>
        </table>
        <p>Max. 100 m pro Segment. Schirmung (U/UTP, S/FTP) reduziert Störungen.</p>` },
      { heading: "Glasfaser",
        html: `<p><strong>Singlemode (OS)</strong>: dünner Kern, Laser, sehr große Reichweiten. <strong>Multimode (OM)</strong>: dickerer Kern, LED/VCSEL, kürzere Strecken, günstiger. Glasfaser ist immun gegen elektromagnetische Störungen.</p>` },
      { heading: "Topologien",
        html: `<p><strong>Stern</strong> (heute üblich, zentraler Switch), <strong>Bus</strong> (veraltet), <strong>Ring</strong>, <strong>Maschen</strong> (redundant, Backbone). Strukturierte Verkabelung: Primär- (Gelände), Sekundär- (Gebäude/Steigleitung), Tertiärbereich (Etage) mit Patchfeld.</p>` },
    ],
    examples: [
      { title: "Etagenverkabelung", html: `<p>Vom Patchfeld im Etagenverteiler laufen Cat6a-Strecken (≤100 m) zu den Anschlussdosen; das Gebäude-Backbone wird per Glasfaser angebunden.</p>` },
    ],
    merksaetze: [
      "Kupfer: max. 100 m pro Segment.",
      "Singlemode = weit (Laser), Multimode = kurz (günstiger).",
      "Stern-Topologie dominiert moderne LANs.",
    ],
    cheatsheet: [
      "Cat5e=1G · Cat6=bis10G(kurz) · Cat6a=10G@100m",
      "Glasfaser: OS=Singlemode, OM=Multimode",
      "Verkabelung: Primär/Sekundär/Tertiär",
    ],
    deepDive: [
      { heading: "Kupfer (Twisted Pair) vs. Lichtwellenleiter",
        html: `<table>
          <thead><tr><th></th><th>Twisted Pair (Cu)</th><th>LWL (Glasfaser)</th></tr></thead>
          <tbody>
            <tr><td>Reichweite</td><td>bis 100 m</td><td>mehrere km (Singlemode)</td></tr>
            <tr><td>Störanfälligkeit</td><td>EMV-empfindlich</td><td>unempfindlich gegen EMV</td></tr>
            <tr><td>Einsatz</td><td>Etage/Arbeitsplatz</td><td>Backbone/Gebäude</td></tr>
          </tbody>
        </table>
        <p>Twisted-Pair-Kategorien: Cat 5e (1 GbE), Cat 6/6A (10 GbE über kürzere/volle Distanz), Cat 7. LWL als Singlemode (lange Strecken) oder Multimode (kürzere Strecken).</p>` },
      { heading: "Topologien",
        html: `<p>Die <strong>Stern-Topologie</strong> dominiert moderne LANs: jedes Gerät hängt am zentralen Switch; ein Kabelausfall betrifft nur einen Teilnehmer. Bus und Ring sind historisch. Logisch entstehen oft <strong>Baum-/Hierarchie</strong>-Strukturen (Core/Distribution/Access).</p>
        <p><strong>Kurz gemerkt:</strong></p>
        <ul>
          <li>Kupfer max. 100 m (90 m fest + 10 m Patch).</li>
          <li>LWL für lange/EMV-belastete Strecken & Backbone.</li>
          <li>Stern = heutiger Standard, zentraler Switch.</li>
        </ul>` },
    ],
    questionIds: ["q-kabel-1","q-kabel-tf-1","fc-kabel-1","q-kabel-2","q-kabel-tf-2"],
  },

  /* ===================== 2. IT-SICHERHEIT ===================== */

  {
    id: "schutzziele",
    title: "Schutzziele & Informationssicherheit",
    lernfeld: "LF4", examArea: "AP2-KA", bereich: "security", icon: "🎯",
    summary: "CIA-Triade, Schutzbedarfsanalyse, BSI IT-Grundschutz und ISO/IEC 27001.",
    visual: null,
    sections: [
      { heading: "CIA-Triade",
        html: `<ul>
          <li><strong>Vertraulichkeit (Confidentiality):</strong> nur Berechtigte sehen Daten.</li>
          <li><strong>Integrität (Integrity):</strong> Daten sind unverändert/korrekt.</li>
          <li><strong>Verfügbarkeit (Availability):</strong> Daten/Dienste sind nutzbar, wenn benötigt.</li>
        </ul>
        <p>Ergänzend: <strong>Authentizität</strong> (Echtheit) und <strong>Verbindlichkeit/Nichtabstreitbarkeit</strong>.</p>` },
      { heading: "Schutzbedarfsanalyse",
        html: `<p>Der Schutzbedarf wird je Schutzziel in Kategorien wie <em>normal, hoch, sehr hoch</em> eingestuft – orientiert am möglichen Schaden. Daraus leiten sich Maßnahmen ab (Maximumprinzip, Abhängigkeiten beachten).</p>` },
      { heading: "Standards",
        html: `<p>Der <strong>BSI IT-Grundschutz</strong> liefert standardisierte Bausteine/Maßnahmen. <strong>ISO/IEC 27001</strong> ist die internationale Norm für ein <strong>ISMS</strong> (Informationssicherheits-Managementsystem) – zertifizierbar.</p>` },
    ],
    examples: [
      { title: "Zielkonflikt", html: `<p>Strenge Verschlüsselung (Vertraulichkeit) kann die Verfügbarkeit gefährden, wenn der Schlüssel verloren geht – Maßnahmen müssen alle Ziele abwägen.</p>` },
    ],
    merksaetze: [
      "CIA = Confidentiality, Integrity, Availability.",
      "BSI IT-Grundschutz = Bausteine; ISO 27001 = ISMS-Norm.",
      "Schutzbedarf: normal / hoch / sehr hoch.",
    ],
    cheatsheet: [
      "CIA + Authentizität + Verbindlichkeit",
      "ISO 27001 → ISMS",
      "Maximumprinzip bei Schutzbedarf",
    ],
    questionIds: ["q-cia-1","q-cia-2","q-cia-match-1","fc-cia-1"],
  },

  {
    id: "krypto",
    title: "Verschlüsselung, Hashing & PKI",
    lernfeld: "LF11", examArea: "AP2-KA", bereich: "security", icon: "🔑",
    summary: "Symmetrisch vs. asymmetrisch, hybrid, Hashing, digitale Signatur, Zertifikate.",
    visual: null,
    sections: [
      { heading: "Symmetrisch vs. asymmetrisch",
        html: `<p><strong>Symmetrisch (z. B. AES):</strong> ein gemeinsamer Schlüssel für Ver- und Entschlüsselung – schnell, aber Schlüsselaustausch heikel.<br>
        <strong>Asymmetrisch (z. B. RSA, ECC):</strong> Schlüsselpaar (öffentlich/privat). Mit dem öffentlichen Schlüssel wird verschlüsselt, nur der private entschlüsselt – löst das Austauschproblem, ist aber langsamer.</p>` },
      { heading: "Hybridverfahren",
        html: `<p>In der Praxis (z. B. TLS) kombiniert man beides: asymmetrisch wird ein zufälliger Sitzungsschlüssel ausgetauscht, danach symmetrisch verschlüsselt (schnell). Best of both worlds.</p>` },
      { heading: "Hashing & Signatur",
        html: `<p><strong>Hash (z. B. SHA-256):</strong> Einwegfunktion fester Länge zur Integritätsprüfung – nicht umkehrbar. <strong>Digitale Signatur:</strong> Hash der Nachricht wird mit dem <em>privaten</em> Schlüssel signiert; jeder prüft mit dem <em>öffentlichen</em> Schlüssel ⇒ Authentizität + Integrität.</p>` },
      { heading: "PKI & Zertifikate",
        html: `<p>Eine <strong>Public Key Infrastructure</strong> ordnet öffentliche Schlüssel über <strong>X.509-Zertifikate</strong> verlässlich Identitäten zu. Eine <strong>CA</strong> (Certificate Authority) signiert Zertifikate; Vertrauensketten reichen bis zur Root-CA.</p>` },
    ],
    examples: [
      { title: "HTTPS-Verbindung", html: `<p>Der Browser prüft das Server-Zertifikat (PKI), handelt asymmetrisch einen Sitzungsschlüssel aus und verschlüsselt den weiteren Verkehr symmetrisch (AES) – ein Hybridverfahren.</p>` },
    ],
    merksaetze: [
      "Verschlüsseln mit öffentlichem, entschlüsseln mit privatem Schlüssel.",
      "Signieren mit privatem, prüfen mit öffentlichem Schlüssel.",
      "Hash = Einweg, dient der Integrität.",
    ],
    cheatsheet: [
      "Symmetrisch=AES(schnell) · Asymmetrisch=RSA/ECC",
      "Hybrid: asym. Schlüsseltausch + sym. Daten",
      "PKI: CA signiert X.509-Zertifikate",
    ],
    questionIds: ["q-krypto-1","q-krypto-2","q-krypto-tf-1","q-krypto-match-1","q-krypto-cloze-1","fc-krypto-1"],
  },

  {
    id: "firewall",
    title: "Firewalls, ACLs & DMZ",
    lernfeld: "LF11", examArea: "AP2-KA", bereich: "security", icon: "🧱",
    summary: "Paketfilter, Stateful Inspection, Application Layer, ACL-Regelwerke, DMZ, IDS/IPS.",
    visual: null,
    sections: [
      { heading: "Firewall-Typen",
        html: `<ul>
          <li><strong>Paketfilter:</strong> entscheidet anhand IP/Port/Protokoll – einfach, zustandslos.</li>
          <li><strong>Stateful Inspection:</strong> verfolgt Verbindungszustände – erlaubt Antworten zu erlaubten Anfragen automatisch.</li>
          <li><strong>Application Layer / NGFW:</strong> prüft bis Schicht 7 (Anwendungen, Deep Packet Inspection).</li>
        </ul>` },
      { heading: "ACL-Regelwerke",
        html: `<p>Regeln werden von oben nach unten abgearbeitet – die erste passende greift. Am Ende steht meist eine implizite <em>Deny-All</em>. Prinzip: <strong>Whitelisting</strong> (nur Erlaubtes durchlassen, alles andere verbieten).</p>` },
      { heading: "DMZ & IDS/IPS",
        html: `<p>Eine <strong>DMZ</strong> (entmilitarisierte Zone) ist ein abgeschottetes Netz für von außen erreichbare Dienste (z. B. Webserver), getrennt vom internen LAN. <strong>IDS</strong> erkennt Angriffe (meldet), <strong>IPS</strong> blockiert aktiv. Ein <strong>Honeypot</strong> lockt Angreifer in eine Falle.</p>` },
    ],
    examples: [
      { title: "Webserver in der DMZ", html: `<p>Der öffentliche Webserver steht in der DMZ. Kompromittiert ein Angreifer ihn, ist das interne LAN durch die zweite Firewall weiterhin geschützt.</p>` },
    ],
    merksaetze: [
      "Stateful Inspection kennt Verbindungszustände.",
      "ACL: erste passende Regel gewinnt, am Ende Deny-All.",
      "IDS meldet, IPS blockiert.",
    ],
    cheatsheet: [
      "Paketfilter < Stateful < Application/NGFW",
      "DMZ trennt öffentliche Dienste vom LAN",
      "Whitelisting > Blacklisting",
    ],
    questionIds: ["q-fw-1","q-fw-2","q-fw-tf-1","fc-fw-1"],
  },

  {
    id: "malware-angriffe",
    title: "Schadsoftware & Angriffe",
    lernfeld: "LF11", examArea: "AP2-KA", bereich: "security", icon: "🦠",
    summary: "Viren, Würmer, Trojaner, Ransomware & Angriffsarten (DDoS, MITM, Phishing, SQLi, XSS).",
    visual: null,
    sections: [
      { heading: "Schadprogramme",
        html: `<ul>
          <li><strong>Virus:</strong> hängt sich an Dateien, braucht Wirt & Nutzeraktion.</li>
          <li><strong>Wurm:</strong> verbreitet sich selbstständig über Netze.</li>
          <li><strong>Trojaner:</strong> getarnt als nützliches Programm.</li>
          <li><strong>Ransomware:</strong> verschlüsselt Daten und erpresst Lösegeld.</li>
          <li><strong>Rootkit:</strong> verbirgt sich tief im System.</li>
          <li><strong>Spyware:</strong> späht Daten aus.</li>
        </ul>` },
      { heading: "Angriffsarten",
        html: `<ul>
          <li><strong>DDoS:</strong> Überlastung durch verteilte Anfragen.</li>
          <li><strong>Man-in-the-Middle:</strong> Angreifer hängt sich in die Kommunikation.</li>
          <li><strong>Phishing / Social Engineering:</strong> Täuschung von Menschen.</li>
          <li><strong>SQL-Injection:</strong> eingeschleuste DB-Befehle über Eingabefelder.</li>
          <li><strong>XSS:</strong> eingeschleustes Skript im Browser anderer Nutzender.</li>
          <li><strong>Brute Force:</strong> systematisches Durchprobieren von Passwörtern.</li>
        </ul>` },
    ],
    examples: [
      { title: "SQL-Injection abwehren", html: `<p>Statt Eingaben direkt in SQL einzubauen, werden <strong>Prepared Statements</strong> mit Platzhaltern verwendet – eingeschleuste Befehle werden so als Daten behandelt.</p>` },
    ],
    merksaetze: [
      "Wurm verbreitet sich selbst, Virus braucht einen Wirt.",
      "Ransomware = Verschlüsselung + Erpressung.",
      "SQLi und XSS verhindert man durch Eingabevalidierung/Prepared Statements.",
    ],
    cheatsheet: [
      "Virus·Wurm·Trojaner·Ransomware·Rootkit·Spyware",
      "DDoS·MITM·Phishing·SQLi·XSS·BruteForce",
      "Gegenmaßnahme SQLi: Prepared Statements",
    ],
    questionIds: ["q-mal-1","q-mal-2","q-mal-match-1","q-mal-tf-1","fc-mal-1"],
  },

  {
    id: "auth-rbac",
    title: "Authentifizierung & Berechtigungen",
    lernfeld: "LF11", examArea: "AP2-KA", bereich: "security", icon: "🪪",
    summary: "Passwortrichtlinien, MFA, RBAC und Least Privilege.",
    visual: null,
    sections: [
      { heading: "Authentifizierungsfaktoren",
        html: `<p>Drei Faktorarten: <strong>Wissen</strong> (Passwort/PIN), <strong>Besitz</strong> (Token/Smartphone), <strong>Inhärenz</strong> (Biometrie). <strong>MFA</strong> kombiniert mindestens zwei <em>verschiedene</em> Faktoren und erhöht die Sicherheit erheblich.</p>` },
      { heading: "Berechtigungskonzepte",
        html: `<p><strong>RBAC</strong> (Role Based Access Control) vergibt Rechte über Rollen statt einzeln pro Person – wartbar und nachvollziehbar. <strong>Least Privilege</strong>: jede Identität erhält nur die minimal notwendigen Rechte. <strong>Need-to-know</strong> ergänzt dies.</p>` },
    ],
    examples: [
      { title: "MFA", html: `<p>Login mit Passwort (Wissen) + Einmalcode der Authenticator-App (Besitz). Selbst ein gestohlenes Passwort reicht dem Angreifer dann nicht.</p>` },
    ],
    merksaetze: [
      "MFA = mind. zwei unterschiedliche Faktorarten.",
      "Least Privilege: so wenig Rechte wie möglich.",
      "RBAC: Rechte über Rollen, nicht pro Person.",
    ],
    cheatsheet: [
      "Faktoren: Wissen · Besitz · Inhärenz",
      "RBAC + Least Privilege + Need-to-know",
      "Passwort: lang > komplex-kurz; besser Passphrasen",
    ],
    questionIds: ["q-auth-1","q-auth-tf-1","fc-auth-1"],
  },

  {
    id: "raid-backup",
    title: "RAID, Backup & USV",
    lernfeld: "LF4", examArea: "AP2-KA", bereich: "security", icon: "💽",
    summary: "RAID-Level, Backup-Strategien (3-2-1), Datensicherungsarten und USV.",
    visual: "raid",
    sections: [
      { heading: "RAID-Level",
        html: `<table>
          <tr><th>Level</th><th>Prinzip</th><th>Ausfalltoleranz</th><th>Nettokapazität</th></tr>
          <tr><td>RAID 0</td><td>Striping</td><td>keine</td><td>100 %</td></tr>
          <tr><td>RAID 1</td><td>Mirroring</td><td>1 Platte</td><td>50 %</td></tr>
          <tr><td>RAID 5</td><td>Striping + Parität</td><td>1 Platte</td><td>(n−1)/n</td></tr>
          <tr><td>RAID 6</td><td>doppelte Parität</td><td>2 Platten</td><td>(n−2)/n</td></tr>
          <tr><td>RAID 10</td><td>Spiegeln + Striping</td><td>je Mirror 1</td><td>50 %</td></tr>
        </table>
        <p>Wichtig: <strong>RAID ersetzt kein Backup</strong> (schützt nicht vor Löschen, Ransomware, Defekt mehrerer Platten).</p>` },
      { heading: "Backup-Strategien",
        html: `<p><strong>3-2-1-Regel:</strong> 3 Kopien, auf 2 verschiedenen Medien, 1 davon extern/offline.</p>
        <ul>
          <li><strong>Vollsicherung:</strong> alles, langsam, einfache Wiederherstellung.</li>
          <li><strong>Inkrementell:</strong> nur Änderungen seit letztem Backup – schnell, aber Wiederherstellung braucht die ganze Kette.</li>
          <li><strong>Differenziell:</strong> Änderungen seit letzter Vollsicherung – wächst, aber nur Voll+letztes Diff zum Wiederherstellen.</li>
        </ul>` },
      { heading: "USV & Notfall",
        html: `<p>Eine <strong>USV</strong> überbrückt Stromausfälle und ermöglicht geordnetes Herunterfahren. <strong>Notfall-/Wiederanlaufkonzepte</strong> definieren RTO (max. Ausfallzeit) und RPO (max. Datenverlust).</p>` },
    ],
    examples: [
      { title: "RAID 5 Kapazität", html: `<p>4 Platten à 4 TB im RAID 5 ⇒ Nettokapazität (4−1)×4 = 12 TB; eine Platte darf ausfallen.</p>` },
    ],
    merksaetze: [
      "RAID 0 = kein Schutz, nur Tempo. RAID 1 = Spiegel.",
      "RAID 5 verträgt 1, RAID 6 verträgt 2 Plattenausfälle.",
      "3-2-1: 3 Kopien, 2 Medien, 1 extern. RAID ≠ Backup!",
    ],
    cheatsheet: [
      "R0 Striping · R1 Mirror · R5 1xParität · R6 2xParität · R10 1+0",
      "Inkrementell=schnell/lange Kette · Differenziell=Voll+letztes Diff",
      "RTO=Ausfallzeit · RPO=Datenverlust",
    ],
    questionIds: ["q-raid-1","q-raid-2","q-raid-calc-1","q-backup-1","q-raid-match-1","fc-raid-1"],
  },

  {
    id: "dsgvo",
    title: "DSGVO-Grundlagen",
    lernfeld: "LF4", examArea: "AP2-WISO", bereich: "security", icon: "📜",
    summary: "Rechtmäßigkeit, Betroffenenrechte, TOMs und Auftragsverarbeitung.",
    visual: null,
    sections: [
      { heading: "Grundprinzipien",
        html: `<p>Die <strong>DSGVO</strong> schützt personenbezogene Daten. Verarbeitung braucht eine Rechtsgrundlage (z. B. Einwilligung, Vertrag, berechtigtes Interesse). Grundsätze: Zweckbindung, Datenminimierung, Speicherbegrenzung, Transparenz, Integrität/Vertraulichkeit.</p>` },
      { heading: "Betroffenenrechte",
        html: `<p>Auskunft, Berichtigung, Löschung („Recht auf Vergessenwerden“), Einschränkung, Datenübertragbarkeit und Widerspruch.</p>` },
      { heading: "TOMs & AV",
        html: `<p><strong>Technische und organisatorische Maßnahmen (TOMs)</strong> setzen Datenschutz praktisch um (Verschlüsselung, Zugriffskontrolle, Protokollierung). Beauftragt man Dienstleister mit der Verarbeitung, ist ein <strong>Auftragsverarbeitungsvertrag (AVV)</strong> nach Art. 28 nötig.</p>` },
    ],
    examples: [
      { title: "Datenminimierung", html: `<p>Ein Newsletter-Formular fragt nur die E-Mail-Adresse ab – nicht Geburtsdatum oder Adresse, die nicht benötigt werden.</p>` },
    ],
    merksaetze: [
      "Personenbezug + Rechtsgrundlage = zulässige Verarbeitung.",
      "Datenminimierung & Zweckbindung sind zentral.",
      "Dienstleister-Verarbeitung ⇒ AV-Vertrag (Art. 28).",
    ],
    cheatsheet: [
      "Rechtsgrundlagen: Einwilligung·Vertrag·ber. Interesse",
      "Betroffenenrechte: Auskunft·Löschung·Berichtigung…",
      "TOMs = technisch + organisatorisch",
    ],
    questionIds: ["q-dsgvo-1","q-dsgvo-tf-1","fc-dsgvo-1"],
  },

  /* ===================== 3. BETRIEBSSYSTEME & VIRTUALISIERUNG ===================== */

  {
    id: "active-directory",
    title: "Active Directory & GPO",
    lernfeld: "LF9", examArea: "AP2-KA", bereich: "os", icon: "🏛️",
    summary: "Domäne, Forest, OUs, Objekte und Gruppenrichtlinien (GPO).",
    visual: "ad",
    sections: [
      { heading: "Struktur",
        html: `<p><strong>Active Directory</strong> ist Microsofts Verzeichnisdienst. Hierarchie: <strong>Forest</strong> (oberste Grenze) ⊃ <strong>Domäne(n)</strong> (Verwaltungs-/Sicherheitsgrenze) ⊃ <strong>Organisationseinheiten (OU)</strong> ⊃ Objekte (Benutzer, Computer, Gruppen). Domänencontroller (DC) authentifizieren per <strong>Kerberos</strong> und replizieren die Datenbank.</p>` },
      { heading: "Gruppenrichtlinien (GPO)",
        html: `<p><strong>Group Policy Objects</strong> verteilen Einstellungen zentral. Verarbeitungsreihenfolge <strong>LSDOU</strong>: Local → Site → Domain → OU (spätere überschreiben frühere, sofern nicht „Enforced“/„Block Inheritance“). So lassen sich Passwortregeln, Laufwerke, Software etc. zentral steuern.</p>` },
      { heading: "Gruppentypen",
        html: `<p>Empfehlung <strong>AGDLP</strong>: Accounts → Global Groups → Domain Local Groups → Permissions. Das hält Berechtigungen wartbar.</p>` },
    ],
    examples: [
      { title: "Zentrale Passwortrichtlinie", html: `<p>Eine GPO auf Domänenebene erzwingt Mindestlänge 12 Zeichen und Sperrung nach 5 Fehlversuchen für alle Domänenkonten.</p>` },
    ],
    merksaetze: [
      "Forest ⊃ Domäne ⊃ OU ⊃ Objekte.",
      "GPO-Reihenfolge LSDOU: Local, Site, Domain, OU.",
      "AGDLP für saubere Rechtevergabe.",
    ],
    cheatsheet: [
      "DC authentifiziert via Kerberos",
      "GPO: LSDOU, Enforced schlägt Block",
      "AGDLP-Prinzip",
    ],
    questionIds: ["q-ad-1","q-ad-2","q-ad-tf-1","fc-ad-1"],
  },

  {
    id: "linux",
    title: "Linux-Grundlagen & Dateirechte",
    lernfeld: "LF9", examArea: "AP2-KA", bereich: "os", icon: "🐧",
    summary: "Verzeichnisstruktur, Befehle, Dateirechte (rwx/Oktal), Paketverwaltung, systemd.",
    visual: null,
    sections: [
      { heading: "Dateirechte",
        html: `<p>Rechte gelten für <strong>User / Group / Others</strong> mit je <strong>r(4) w(2) x(1)</strong>. Oktal-Beispiel: <code>chmod 754 datei</code> ⇒ User rwx(7), Group r-x(5), Others r--(4). Eigentümer ändern mit <code>chown nutzer:gruppe datei</code>.</p>` },
      { heading: "Verzeichnisbaum",
        html: `<p>Alles hängt unter <code>/</code>: <code>/etc</code> (Konfiguration), <code>/var</code> (variable Daten/Logs), <code>/home</code> (Benutzer), <code>/bin</code>,<code>/usr/bin</code> (Programme), <code>/dev</code> (Geräte), <code>/proc</code> (Kernel/Prozesse).</p>` },
      { heading: "Paketverwaltung & systemd",
        html: `<p>Debian/Ubuntu: <code>apt install &lt;paket&gt;</code>. RHEL/Fedora: <code>dnf install &lt;paket&gt;</code>. Dienste verwaltet <strong>systemd</strong>: <code>systemctl start|stop|status|enable &lt;dienst&gt;</code>.</p>` },
    ],
    examples: [
      { title: "Oktalrechte berechnen", html: `<p>rwxr-xr-- = 7 (4+2+1) · 5 (4+0+1) · 4 (4+0+0) ⇒ <code>chmod 754</code>.</p>` },
    ],
    merksaetze: [
      "r=4, w=2, x=1 – addieren pro Gruppe.",
      "chmod ändert Rechte, chown den Eigentümer.",
      "systemctl steuert Dienste (systemd).",
    ],
    cheatsheet: [
      "754 = rwx r-x r--",
      "apt (Debian) · dnf (RHEL)",
      "/etc Config · /var Logs · /home Nutzer",
    ],
    questionIds: ["q-linux-1","q-linux-calc-1","q-linux-tf-1","fc-linux-1"],
  },

  {
    id: "virtualisierung",
    title: "Virtualisierung & Container",
    lernfeld: "LF12", examArea: "AP2-KA", bereich: "os", icon: "📦",
    summary: "Hypervisor Typ 1/2, Snapshots, virtuelle Switches und Container vs. VMs.",
    visual: null,
    sections: [
      { heading: "Hypervisor-Typen",
        html: `<p><strong>Typ 1 (Bare Metal):</strong> läuft direkt auf der Hardware – ESXi, Hyper-V, Proxmox/KVM. Performant, für Rechenzentren. <strong>Typ 2 (Hosted):</strong> läuft als Anwendung auf einem Betriebssystem – VirtualBox, VMware Workstation. Für Desktops/Tests.</p>` },
      { heading: "Funktionen",
        html: `<p><strong>Snapshots</strong> frieren einen VM-Zustand ein (kein Backup-Ersatz!). <strong>Virtuelle Switches</strong> verbinden VMs untereinander und mit dem physischen Netz. Vorteile: bessere Auslastung, schnelle Bereitstellung, Isolation, Live-Migration.</p>` },
      { heading: "Container vs. VM",
        html: `<p>Eine <strong>VM</strong> virtualisiert komplette Hardware inkl. eigenem Gast-OS. Ein <strong>Container (Docker)</strong> teilt sich den Kernel des Hosts und kapselt nur die Anwendung mit ihren Abhängigkeiten – leichter, schneller, aber geringere Isolation als VMs.</p>` },
    ],
    examples: [
      { title: "Testumgebung", html: `<p>Vor einem Update wird ein Snapshot der VM erstellt; schlägt das Update fehl, kann man in Sekunden zurückkehren.</p>` },
    ],
    merksaetze: [
      "Typ 1 = direkt auf Hardware, Typ 2 = auf Host-OS.",
      "Container teilen den Host-Kernel, VMs haben eigenes OS.",
      "Snapshot ≠ Backup.",
    ],
    cheatsheet: [
      "Typ1: ESXi/Hyper-V/KVM · Typ2: VirtualBox",
      "Container leicht, VM stark isoliert",
      "vSwitch verbindet VMs & physisches Netz",
    ],
    questionIds: ["q-virt-1","q-virt-2","q-virt-tf-1","fc-virt-1"],
  },

  {
    id: "cloud",
    title: "Cloud-Computing",
    lernfeld: "LF12", examArea: "AP2-KA", bereich: "os", icon: "☁️",
    summary: "Servicemodelle (IaaS/PaaS/SaaS) und Bereitstellungsmodelle (Public/Private/Hybrid).",
    visual: null,
    sections: [
      { heading: "Servicemodelle",
        html: `<ul>
          <li><strong>IaaS</strong> (Infrastructure as a Service): VMs, Storage, Netz – z. B. AWS EC2. Meiste Eigenverantwortung.</li>
          <li><strong>PaaS</strong> (Platform as a Service): Laufzeitumgebung für eigene Apps – Entwicklung ohne Server-Betrieb.</li>
          <li><strong>SaaS</strong> (Software as a Service): fertige Anwendung im Browser – z. B. Microsoft 365. Geringste Eigenverantwortung.</li>
        </ul>` },
      { heading: "Bereitstellungsmodelle",
        html: `<p><strong>Public</strong> (geteilte Anbieter-Infrastruktur), <strong>Private</strong> (exklusiv für eine Organisation), <strong>Hybrid</strong> (Kombination) und <strong>Community</strong> (gemeinsam für eine Gruppe).</p>` },
    ],
    examples: [
      { title: "Verantwortungsteilung", html: `<p>Bei SaaS kümmert sich der Anbieter um alles bis zur Anwendung; bei IaaS verantwortet die Kundschaft OS, Patches und Anwendungen selbst (Shared Responsibility).</p>` },
    ],
    merksaetze: [
      "IaaS=Infrastruktur, PaaS=Plattform, SaaS=Software.",
      "Je „höher“ das Modell, desto weniger eigene Verantwortung.",
    ],
    cheatsheet: [
      "IaaS<PaaS<SaaS (abnehmende Eigenverantwortung)",
      "Public·Private·Hybrid·Community",
      "Shared-Responsibility-Modell",
    ],
    questionIds: ["q-cloud-1","q-cloud-match-1","fc-cloud-1"],
  },

  {
    id: "dateisysteme",
    title: "Dateisysteme & Berechtigungen",
    lernfeld: "LF9", examArea: "AP2-KA", bereich: "os", icon: "🗃️",
    summary: "NTFS, ReFS, ext4, FAT32 sowie NTFS- vs. Freigabeberechtigungen.",
    visual: null,
    sections: [
      { heading: "Dateisysteme",
        html: `<table>
          <tr><th>FS</th><th>Plattform</th><th>Merkmal</th></tr>
          <tr><td>NTFS</td><td>Windows</td><td>Rechte, Journaling, große Dateien</td></tr>
          <tr><td>ReFS</td><td>Windows Server</td><td>Resilient, Integritätsprüfung</td></tr>
          <tr><td>ext4</td><td>Linux</td><td>Standard, Journaling</td></tr>
          <tr><td>FAT32</td><td>universell</td><td>max. 4 GB/Datei, breit kompatibel</td></tr>
        </table>` },
      { heading: "NTFS- vs. Freigabeberechtigungen",
        html: `<p><strong>Freigabeberechtigungen</strong> gelten nur über das Netzwerk, <strong>NTFS-Berechtigungen</strong> lokal und im Netz. Bei Kombination gilt die <strong>restriktivere</strong> Berechtigung. Innerhalb von NTFS „gewinnt“ ein explizites <em>Verweigern</em> über ein <em>Zulassen</em>.</p>` },
    ],
    examples: [
      { title: "Effektive Rechte", html: `<p>Freigabe = „Ändern“, NTFS = „Lesen“ ⇒ effektiv „Lesen“ (das Restriktivere greift) beim Zugriff übers Netz.</p>` },
    ],
    merksaetze: [
      "FAT32: max. 4 GB pro Datei.",
      "Freigabe + NTFS kombiniert ⇒ das Restriktivere gilt.",
      "NTFS: Verweigern schlägt Zulassen.",
    ],
    cheatsheet: [
      "NTFS·ReFS (Windows) · ext4 (Linux) · FAT32 (universell)",
      "Share-Rechte nur im Netz, NTFS überall",
      "Restriktivste Regel gewinnt",
    ],
    questionIds: ["q-fs-1","q-fs-tf-1","fc-fs-1"],
  },

  /* ===================== 4. DATENBANKEN ===================== */

  {
    id: "er-modell",
    title: "Relationales Modell & ER-Modell",
    lernfeld: "LF5", examArea: "AP2-KA", bereich: "datenbanken", icon: "🔗",
    summary: "Primär-/Fremdschlüssel, ER-Modell und Kardinalitäten.",
    visual: null,
    sections: [
      { heading: "Relationales Modell",
        html: `<p>Daten liegen in <strong>Tabellen (Relationen)</strong> mit Spalten (Attribute) und Zeilen (Datensätze). Der <strong>Primärschlüssel</strong> identifiziert jede Zeile eindeutig; ein <strong>Fremdschlüssel</strong> verweist auf den Primärschlüssel einer anderen Tabelle und stellt Beziehungen her (referenzielle Integrität).</p>` },
      { heading: "ER-Modell & Kardinalitäten",
        html: `<p>Das <strong>Entity-Relationship-Modell</strong> beschreibt Entitäten, Attribute und Beziehungen. Kardinalitäten: <strong>1:1</strong>, <strong>1:n</strong>, <strong>n:m</strong>. Eine n:m-Beziehung wird in der relationalen Umsetzung durch eine <strong>Zwischentabelle</strong> (Junction Table) aufgelöst.</p>` },
    ],
    examples: [
      { title: "n:m auflösen", html: `<p><em>Studierende</em> besuchen <em>Kurse</em> (n:m). Lösung: Tabelle <code>Belegung(studi_id, kurs_id)</code> mit zwei Fremdschlüsseln als zusammengesetztem Primärschlüssel.</p>` },
    ],
    merksaetze: [
      "Primärschlüssel = eindeutig; Fremdschlüssel = Verweis.",
      "n:m wird über eine Zwischentabelle realisiert.",
    ],
    cheatsheet: [
      "PK eindeutig · FK referenziert PK",
      "Kardinalitäten: 1:1 · 1:n · n:m",
      "n:m → Junction-Tabelle",
    ],
    questionIds: ["q-er-1","q-er-tf-1","fc-er-1"],
  },

  {
    id: "normalisierung",
    title: "Normalisierung (1NF–3NF)",
    lernfeld: "LF5", examArea: "AP2-KA", bereich: "datenbanken", icon: "📐",
    summary: "Schrittweise Vermeidung von Redundanz und Anomalien.",
    visual: null,
    sections: [
      { heading: "Die Normalformen",
        html: `<ul>
          <li><strong>1NF:</strong> alle Attribute atomar (keine Mehrfachwerte/Listen pro Feld).</li>
          <li><strong>2NF:</strong> 1NF erfüllt UND jedes Nicht-Schlüsselattribut hängt vom <em>gesamten</em> Primärschlüssel ab (keine partiellen Abhängigkeiten bei zusammengesetztem Schlüssel).</li>
          <li><strong>3NF:</strong> 2NF erfüllt UND keine transitiven Abhängigkeiten (Nicht-Schlüsselattribute hängen nicht voneinander ab).</li>
        </ul>
        <p>Ziel: Redundanz und Anomalien (Einfüge-/Änderungs-/Löschanomalien) vermeiden.</p>` },
    ],
    examples: [
      { title: "Transitive Abhängigkeit (3NF)", html: `<p>In <code>Bestellung(BestellNr, KundenNr, KundenName)</code> hängt <code>KundenName</code> von <code>KundenNr</code> ab, nicht von <code>BestellNr</code>. Lösung: eigene <code>Kunde</code>-Tabelle ⇒ 3NF.</p>` },
    ],
    merksaetze: [
      "1NF: atomar. 2NF: ganzer Schlüssel. 3NF: kein Attribut hängt von Nicht-Schlüssel ab.",
      "Merksatz: „Der Schlüssel, der ganze Schlüssel und nichts als der Schlüssel.“",
    ],
    cheatsheet: [
      "1NF=atomar",
      "2NF=keine partielle Abhängigkeit",
      "3NF=keine transitive Abhängigkeit",
    ],
    questionIds: ["q-norm-1","q-norm-2","q-norm-tf-1","fc-norm-1"],
  },

  {
    id: "sql",
    title: "SQL: DDL, DML & JOINs",
    lernfeld: "LF5", examArea: "AP2-KA", bereich: "datenbanken", icon: "🧾",
    summary: "SELECT, WHERE, JOIN-Arten, GROUP BY/HAVING, Aggregatfunktionen und DML.",
    visual: null,
    sections: [
      { heading: "DDL vs. DML",
        html: `<p><strong>DDL</strong> (Data Definition): <code>CREATE</code>, <code>ALTER</code>, <code>DROP</code> – Struktur. <strong>DML</strong> (Data Manipulation): <code>SELECT</code>, <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> – Daten.</p>` },
      { heading: "SELECT & JOINs",
        html: `<p>Reihenfolge: <code>SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY</code>. JOIN-Arten:</p>
        <ul>
          <li><strong>INNER JOIN:</strong> nur übereinstimmende Zeilen beider Tabellen.</li>
          <li><strong>LEFT JOIN:</strong> alle aus links + passende rechts.</li>
          <li><strong>RIGHT JOIN:</strong> alle aus rechts + passende links.</li>
          <li><strong>FULL JOIN:</strong> alle aus beiden.</li>
        </ul>` },
      { heading: "Aggregat & Gruppierung",
        html: `<p>Aggregatfunktionen: <code>COUNT, SUM, AVG, MIN, MAX</code>. <code>WHERE</code> filtert Zeilen <em>vor</em>, <code>HAVING</code> Gruppen <em>nach</em> der Aggregation.</p>
        <pre><code class="language-sql">SELECT abteilung, COUNT(*) AS anzahl
FROM mitarbeiter
GROUP BY abteilung
HAVING COUNT(*) > 5
ORDER BY anzahl DESC;</code></pre>` },
    ],
    examples: [
      { title: "INNER JOIN", html: `<pre><code class="language-sql">SELECT k.name, b.bestellnr
FROM kunde k
INNER JOIN bestellung b ON b.kunden_id = k.id;</code></pre>` },
    ],
    merksaetze: [
      "WHERE filtert Zeilen, HAVING filtert Gruppen.",
      "INNER = Schnittmenge, LEFT = alle links.",
      "DDL = Struktur, DML = Daten.",
    ],
    cheatsheet: [
      "SELECT-FROM-WHERE-GROUP BY-HAVING-ORDER BY",
      "JOIN: INNER·LEFT·RIGHT·FULL",
      "Aggregat: COUNT·SUM·AVG·MIN·MAX",
    ],
    questionIds: ["q-sql-1","q-sql-2","q-sql-match-1","q-sql-tf-1","fc-sql-1"],
  },

  /* ===================== 5. PROGRAMMIERUNG ===================== */

  {
    id: "prog-grundlagen",
    title: "Programmiergrundlagen",
    lernfeld: "LF10", examArea: "AP2-KA", bereich: "programmierung", icon: "🔣",
    summary: "Variablen, Datentypen, Operatoren und Kontrollstrukturen.",
    visual: null,
    sections: [
      { heading: "Variablen & Datentypen",
        html: `<p>Eine <strong>Variable</strong> ist ein benannter Speicherplatz. Typische <strong>Datentypen</strong>: Integer (Ganzzahl), Float/Double (Kommazahl), Boolean (true/false), Char/String (Text). Statisch typisierte Sprachen prüfen Typen zur Übersetzungszeit.</p>` },
      { heading: "Kontrollstrukturen",
        html: `<ul>
          <li><strong>Sequenz:</strong> Anweisungen nacheinander.</li>
          <li><strong>Verzweigung:</strong> <code>if/else</code>, <code>switch</code>.</li>
          <li><strong>Schleifen:</strong> <code>while</code> (kopfgesteuert), <code>do…while</code> (fußgesteuert), <code>for</code> (zählend).</li>
        </ul>` },
      { heading: "Operatoren",
        html: `<p>Arithmetisch (<code>+ - * / %</code>), Vergleich (<code>== != &lt; &gt;</code>), logisch (<code>&amp;&amp; || !</code>). Beachte Operatorrangfolge (Punkt vor Strich).</p>` },
    ],
    examples: [
      { title: "Schleife", html: `<pre><code class="language-python">summe = 0
for i in range(1, 6):
    summe += i      # 1+2+3+4+5
print(summe)        # 15</code></pre>` },
    ],
    merksaetze: [
      "while = kopfgesteuert (evtl. 0 Durchläufe), do…while = mind. 1 Durchlauf.",
      "Boolean kennt nur true/false.",
    ],
    cheatsheet: [
      "Sequenz · Verzweigung · Schleife",
      "while(Kopf) · do-while(Fuß) · for(zählend)",
      "Typen: int·float·bool·string",
    ],
    questionIds: ["q-prog-1","q-prog-tf-1","fc-prog-1"],
  },

  {
    id: "struktogramm-pap",
    title: "Struktogramm, PAP & Pseudocode",
    lernfeld: "LF10", examArea: "AP2-KA", bereich: "programmierung", icon: "📊",
    summary: "Algorithmen visuell darstellen: Nassi-Shneiderman, Programmablaufplan, Pseudocode.",
    visual: null,
    sections: [
      { heading: "Struktogramm (Nassi-Shneiderman)",
        html: `<p>Stellt Algorithmen als ineinander geschachtelte <strong>Blöcke</strong> dar – Sequenz (untereinander), Verzweigung (geteilter Block), Schleife (umschließender Rahmen). Erzwingt strukturierte Programmierung (keine Sprünge).</p>` },
      { heading: "PAP (Flussdiagramm)",
        html: `<p>Der <strong>Programmablaufplan</strong> (DIN 66001) nutzt Symbole: Rechteck = Operation, Raute = Verzweigung, Parallelogramm = Ein-/Ausgabe, abgerundetes Rechteck = Start/Ende, Pfeile = Ablauf.</p>` },
      { heading: "Pseudocode",
        html: `<p>Sprachunabhängige, an natürliche Sprache angelehnte Notation des Algorithmus – gut zum Entwurf, unabhängig von der späteren Programmiersprache.</p>` },
    ],
    examples: [
      { title: "PAP-Symbole", html: `<p>Eine Eingabeprüfung: Parallelogramm (Eingabe) → Raute (Bedingung „gültig?“) → bei Nein zurück zur Eingabe, bei Ja weiter zur Operation.</p>` },
    ],
    merksaetze: [
      "PAP: Raute = Verzweigung, Rechteck = Operation, Parallelogramm = E/A.",
      "Struktogramm = blockorientiert, keine Sprünge.",
    ],
    cheatsheet: [
      "Struktogramm = Nassi-Shneiderman",
      "PAP nach DIN 66001",
      "Pseudocode = sprachunabhängig",
    ],
    questionIds: ["q-pap-1","q-pap-match-1","fc-pap-1"],
  },

  {
    id: "skripting",
    title: "Skripting: PowerShell, Bash & Logik",
    lernfeld: "LF10", examArea: "AP2-KA", bereich: "programmierung", icon: "⌨️",
    summary: "Admin-Automatisierung mit PowerShell/Bash sowie Boolesche Algebra/Wahrheitstabellen.",
    visual: null,
    sections: [
      { heading: "PowerShell",
        html: `<p>Objektorientierte Shell von Microsoft. Cmdlets im <em>Verb-Nomen</em>-Schema:</p>
        <pre><code class="language-powershell">Get-Service | Where-Object {$_.Status -eq "Running"}
Get-ChildItem C:\\Logs -Recurse | Where-Object {$_.Length -gt 1MB}</code></pre>` },
      { heading: "Bash",
        html: `<pre><code class="language-bash">#!/bin/bash
for datei in *.log; do
  echo "Verarbeite $datei"
  gzip "$datei"
done</code></pre>` },
      { heading: "Boolesche Algebra",
        html: `<p>Verknüpfungen UND (∧), ODER (∨), NICHT (¬). Wahrheitstabelle UND: nur <code>1∧1=1</code>. ODER: <code>0∨0=0</code>, sonst 1. De Morgan: ¬(A∧B)=¬A∨¬B.</p>` },
    ],
    examples: [
      { title: "Bash-Pipeline", html: `<pre><code class="language-bash">cat zugriff.log | grep "404" | wc -l   # Anzahl 404-Fehler</code></pre>` },
    ],
    merksaetze: [
      "PowerShell-Cmdlets: Verb-Nomen (Get-, Set-, New-…).",
      "Pipe | reicht Ausgabe als Eingabe weiter.",
      "UND nur 1 bei beidem 1; ODER 0 nur bei beidem 0.",
    ],
    cheatsheet: [
      "PS: Get-/Set-/New-/Remove-",
      "Bash: for/if/grep/awk/sed/pipe",
      "De Morgan: ¬(A∧B)=¬A∨¬B",
    ],
    questionIds: ["q-skript-1","q-skript-2","q-bool-tf-1","fc-skript-1"],
  },

  /* ===================== 6. HARDWARE & IT-ARBEITSPLATZ (AP1) ===================== */

  {
    id: "hardware",
    title: "PC-/Server-Komponenten",
    lernfeld: "LF2", examArea: "AP1", bereich: "hardware", icon: "🔧",
    summary: "Komponenten, Schnittstellen und Interpretation von Leistungsdaten.",
    visual: null,
    sections: [
      { heading: "Kernkomponenten",
        html: `<ul>
          <li><strong>CPU:</strong> Kerne, Takt (GHz), Cache – Rechenleistung.</li>
          <li><strong>RAM:</strong> Arbeitsspeicher (flüchtig), Kapazität (GB) & Takt (MHz).</li>
          <li><strong>Massenspeicher:</strong> SSD (schnell, NVMe/SATA) vs. HDD (günstig pro TB).</li>
          <li><strong>Mainboard, Netzteil, GPU, Kühlung.</strong></li>
        </ul>` },
      { heading: "Schnittstellen",
        html: `<p>USB (Typ-A/-C, Generationen mit unterschiedlicher Datenrate), HDMI/DisplayPort (Video), Thunderbolt, RJ45 (LAN), SATA/M.2 (Speicher), PCIe (Erweiterungskarten).</p>` },
      { heading: "Server-Besonderheiten",
        html: `<p>Server setzen auf <strong>ECC-RAM</strong> (Fehlerkorrektur), redundante Netzteile, Hot-Swap-Laufwerke, RAID-Controller und Remote-Management (IPMI/iLO/iDRAC).</p>` },
    ],
    examples: [
      { title: "Leistungsdaten lesen", html: `<p>„Intel i5, 6 Kerne, 4,4 GHz, 16 GB DDR4-3200, 512 GB NVMe-SSD“ – beschreibt einen soliden Büro-/Entwicklungs-Client.</p>` },
    ],
    merksaetze: [
      "SSD/NVMe deutlich schneller als HDD.",
      "Server: ECC-RAM, Redundanz, Hot-Swap, Fernwartung.",
    ],
    cheatsheet: [
      "CPU: Kerne·Takt·Cache",
      "RAM flüchtig, ECC im Server",
      "NVMe>SATA-SSD>HDD (Tempo)",
    ],
    questionIds: ["q-hw-1","q-hw-tf-1","fc-hw-1"],
  },

  {
    id: "arbeitsplatz",
    title: "IT-Arbeitsplatz einrichten",
    lernfeld: "LF2", examArea: "AP1", bereich: "hardware", icon: "🖥️",
    summary: "Arbeitsplatz nach Kundenanforderung einrichten, in Betrieb nehmen und Clients integrieren.",
    visual: null,
    sections: [
      { heading: "Anforderungen ermitteln",
        html: `<p>Bedarf nach Einsatzzweck festlegen (Office, CAD, Entwicklung), Ergonomie und Barrierefreiheit beachten, Soft-/Hardware und Peripherie passend dimensionieren. Wirtschaftlichkeit (Make-or-Buy, Leasing) berücksichtigen.</p>` },
      { heading: "Inbetriebnahme & Integration",
        html: `<p>Betriebssystem (ggf. per Image/Klonen) ausrollen, in die Domäne aufnehmen, Treiber und Updates einspielen, Benutzerkonten und Netzlaufwerke einrichten, Drucker verbinden, Funktionstest durchführen und dokumentieren.</p>` },
      { heading: "Ergonomie & Arbeitsschutz",
        html: `<p>Bildschirmarbeitsplatzverordnung: ausreichend großer Monitor, höhenverstellbarer Stuhl/Tisch, blendfreie Beleuchtung, regelmäßige Pausen.</p>` },
    ],
    examples: [
      { title: "Client-Rollout", html: `<p>Standard-Image per WDS/Imaging verteilen, automatisch der Domäne beitreten lassen (GPO), Software über Verteilung installieren – schnelle, einheitliche Bereitstellung.</p>` },
    ],
    merksaetze: [
      "Erst Anforderung & Wirtschaftlichkeit, dann Beschaffung.",
      "Domänenbeitritt + GPO = einheitliche Konfiguration.",
      "Ergonomie ist Pflicht (Arbeitsschutz).",
    ],
    cheatsheet: [
      "Bedarf → Beschaffung → Installation → Integration → Test → Doku",
      "Imaging/Klonen für viele gleiche Clients",
      "Ergonomie & Bildschirmarbeitsplatz beachten",
    ],
    questionIds: ["q-arb-1","q-arb-tf-1","fc-arb-1"],
  },

  /* ===================== 7. PROJEKTMANAGEMENT & SERVICE ===================== */

  {
    id: "projektmanagement",
    title: "Projektphasen, Lasten- & Pflichtenheft",
    lernfeld: "LF6", examArea: "AP2-KA", bereich: "projekt", icon: "📋",
    summary: "Projektphasen, Lasten- vs. Pflichtenheft und Meilensteine.",
    visual: null,
    sections: [
      { heading: "Projektphasen",
        html: `<p>Klassisch: <strong>Initialisierung → Planung → Durchführung → Abschluss</strong>. Das <strong>magische Dreieck</strong> balanciert Zeit, Kosten und Qualität/Leistung – Änderungen an einer Ecke wirken auf die anderen.</p>` },
      { heading: "Lastenheft vs. Pflichtenheft",
        html: `<p>Das <strong>Lastenheft</strong> erstellt die <em>Auftraggebende</em> Seite: <em>Was</em> und <em>wofür</em> (Anforderungen). Das <strong>Pflichtenheft</strong> erstellt die <em>Auftragnehmende</em> Seite: <em>Wie</em> und <em>womit</em> (technische Umsetzung als Antwort auf das Lastenheft).</p>` },
      { heading: "Meilensteine",
        html: `<p>Meilensteine sind terminierte Zwischenziele mit klaren Ergebnissen (Dauer = 0). Sie dienen der Fortschrittskontrolle.</p>` },
    ],
    examples: [
      { title: "Wer schreibt was?", html: `<p>Eine Firma beschreibt im Lastenheft „Wir brauchen ein Ticketsystem für 50 Personen“. Der IT-Dienstleister antwortet im Pflichtenheft mit konkreter Software, Architektur und Zeitplan.</p>` },
    ],
    merksaetze: [
      "Lastenheft = WAS (Auftraggeber), Pflichtenheft = WIE (Auftragnehmer).",
      "Magisches Dreieck: Zeit, Kosten, Qualität.",
    ],
    cheatsheet: [
      "Lastenheft→Auftraggeber(WAS)",
      "Pflichtenheft→Auftragnehmer(WIE)",
      "Magisches Dreieck: Zeit·Kosten·Qualität",
    ],
    questionIds: ["q-pm-1","q-pm-2","q-pm-tf-1","fc-pm-1"],
  },

  {
    id: "netzplan",
    title: "Netzplantechnik & Gantt",
    lernfeld: "LF6", examArea: "AP2-KA", bereich: "projekt", icon: "📈",
    summary: "Vorgänge, Pufferzeiten, kritischer Pfad und Gantt-Diagramm.",
    visual: null,
    sections: [
      { heading: "Netzplan-Grundbegriffe",
        html: `<p>Je Vorgang berechnet man <strong>FAZ</strong> (frühester Anfang), <strong>FEZ</strong> (frühestes Ende), <strong>SAZ</strong> (spätester Anfang), <strong>SEZ</strong> (spätestes Ende). <strong>Gesamtpuffer</strong> = SAZ − FAZ (bzw. SEZ − FEZ).</p>
        <p>Vorwärtsrechnung bestimmt FAZ/FEZ, Rückwärtsrechnung SAZ/SEZ.</p>` },
      { heading: "Kritischer Pfad",
        html: `<p>Der <strong>kritische Pfad</strong> ist die längste Kette von Vorgängen mit <strong>Puffer = 0</strong>. Verzögert sich dort ein Vorgang, verzögert sich das gesamte Projekt.</p>` },
      { heading: "Gantt-Diagramm",
        html: `<p>Balkendiagramm über der Zeitachse: zeigt Dauer, Beginn/Ende und Überlappungen von Vorgängen anschaulich – gut für Kommunikation und Termincontrolling.</p>` },
    ],
    examples: [
      { title: "Puffer", html: `<p>Hat ein Vorgang FAZ 3, SAZ 5, beträgt der Gesamtpuffer 2 Tage – er ist nicht kritisch.</p>` },
    ],
    merksaetze: [
      "Kritischer Pfad = Puffer 0 = längste Dauer.",
      "Gesamtpuffer = SAZ − FAZ.",
      "Vorwärts: FAZ/FEZ; Rückwärts: SAZ/SEZ.",
    ],
    cheatsheet: [
      "FAZ·FEZ·SAZ·SEZ",
      "Puffer=SAZ−FAZ",
      "Kritischer Pfad: Puffer=0",
    ],
    questionIds: ["q-netzplan-1","q-netzplan-tf-1","q-netzplan-calc-1","fc-netzplan-1"],
  },

  {
    id: "nutzwertanalyse",
    title: "Nutzwertanalyse & Angebotsvergleich",
    lernfeld: "LF6", examArea: "AP2-WISO", bereich: "projekt", icon: "⚖️",
    summary: "Quantitative/qualitative Bewertung, Make-or-Buy und Angebotsvergleich.",
    visual: null,
    sections: [
      { heading: "Nutzwertanalyse",
        html: `<p>Verfahren zur Entscheidung bei mehreren <em>qualitativen</em> Kriterien: Kriterien gewichten (Summe 100 %), Alternativen je Kriterium bewerten (z. B. 1–10), gewichtete Punkte aufsummieren ⇒ höchster Nutzwert gewinnt.</p>` },
      { heading: "Make-or-Buy & Angebotsvergleich",
        html: `<p><strong>Make-or-Buy:</strong> Eigenerstellung vs. Fremdbezug abwägen (Kosten, Know-how, Auslastung, Abhängigkeit). <strong>Quantitativer Vergleich</strong> über den Bezugspreis (s. WiSo-Kalkulation), <strong>qualitativer</strong> über Nutzwertanalyse (Service, Qualität, Lieferzeit).</p>` },
    ],
    examples: [
      { title: "Gewichtete Bewertung", html: `<p>Kriterium Preis (50 %): A=8, B=6. Service (50 %): A=6, B=9. Nutzwert A = 0,5·8+0,5·6 = 7,0; B = 0,5·6+0,5·9 = 7,5 ⇒ B gewinnt.</p>` },
    ],
    merksaetze: [
      "Nutzwertanalyse = Gewichtung × Bewertung, dann summieren.",
      "Quantitativ = Preis; qualitativ = Nutzwertanalyse.",
    ],
    cheatsheet: [
      "Gewichte summieren zu 100 %",
      "Nutzwert = Σ(Gewicht × Punkte)",
      "Make-or-Buy: Kosten + qualitative Faktoren",
    ],
    questionIds: ["q-nwa-1","q-nwa-calc-1","fc-nwa-1"],
  },

  {
    id: "itil-service",
    title: "ITIL, Service & SLA",
    lernfeld: "LF6", examArea: "AP2-KA", bereich: "projekt", icon: "🎧",
    summary: "Service-/Ticketprozesse, ITIL-Grundbegriffe und SLA.",
    visual: null,
    sections: [
      { heading: "ITIL-Grundbegriffe",
        html: `<p><strong>ITIL</strong> ist ein Best-Practice-Rahmenwerk für IT-Service-Management. Zentrale Prozesse: <strong>Incident Management</strong> (Störung schnell beheben), <strong>Problem Management</strong> (Ursache dauerhaft beseitigen), <strong>Change Management</strong> (Änderungen kontrolliert einführen).</p>` },
      { heading: "Ticket-/Supportlevel",
        html: `<p>Eskalationsstufen: <strong>1st Level</strong> (Annahme/Standardlösungen), <strong>2nd Level</strong> (Fachspezialisten), <strong>3rd Level</strong> (Hersteller/Entwicklung). Tickets werden priorisiert nach <em>Impact × Urgency</em>.</p>` },
      { heading: "SLA",
        html: `<p>Ein <strong>Service Level Agreement</strong> regelt zugesicherte Servicequalität: Verfügbarkeit (z. B. 99,9 %), Reaktions- und Lösungszeiten, Servicezeiten. Verstöße können Vertragsstrafen auslösen.</p>` },
    ],
    examples: [
      { title: "Incident vs. Problem", html: `<p>Ein abgestürzter Server ist ein <em>Incident</em> (sofort neu starten). Die wiederkehrende Ursache (defekter RAM) klärt das <em>Problem Management</em> dauerhaft.</p>` },
    ],
    merksaetze: [
      "Incident = schnelle Wiederherstellung, Problem = Ursachenbeseitigung.",
      "SLA legt messbare Servicequalität fest.",
      "Priorität = Impact × Urgency.",
    ],
    cheatsheet: [
      "1st/2nd/3rd Level Support",
      "Incident·Problem·Change Management",
      "SLA: Verfügbarkeit & Reaktionszeiten",
    ],
    questionIds: ["q-itil-1","q-itil-tf-1","fc-itil-1"],
  },

  /* ===================== 8. WISO ===================== */

  {
    id: "vertragsrecht",
    title: "Vertragsarten & Vertragsrecht",
    lernfeld: "LF1", examArea: "AP2-WISO", bereich: "wiso", icon: "📝",
    summary: "Kauf-/Werk-/Dienstvertrag, Vertragszustandekommen und Leistungsstörungen.",
    visual: null,
    sections: [
      { heading: "Vertragsarten",
        html: `<ul>
          <li><strong>Kaufvertrag (§433 BGB):</strong> Übergabe & Eigentum gegen Zahlung.</li>
          <li><strong>Werkvertrag (§631):</strong> geschuldet ist ein <em>Erfolg</em>/Ergebnis (z. B. fertige Software).</li>
          <li><strong>Dienstvertrag (§611):</strong> geschuldet ist eine <em>Tätigkeit</em>, kein Erfolg (z. B. Beratung, Support nach Aufwand).</li>
        </ul>` },
      { heading: "Vertragszustandekommen",
        html: `<p>Ein Vertrag entsteht durch zwei übereinstimmende Willenserklärungen: <strong>Antrag (Angebot)</strong> und <strong>Annahme</strong>. Geschäftsfähigkeit beachten (beschränkt 7–17, voll ab 18).</p>` },
      { heading: "Leistungsstörungen",
        html: `<p><strong>Sachmangel</strong> (mangelhafte Lieferung) ⇒ Nacherfüllung, Minderung, Rücktritt, Schadenersatz. <strong>Verzug</strong> (Lieferverzug/Zahlungsverzug) ⇒ Mahnung, Verzugszinsen. Das <strong>Mahnwesen</strong> eskaliert von Zahlungserinnerung bis gerichtlichem Mahnverfahren.</p>` },
    ],
    examples: [
      { title: "Werk vs. Dienst", html: `<p>„Programmiere uns eine fertige App“ = Werkvertrag (Erfolg). „Unterstütze unser Team stundenweise“ = Dienstvertrag (Tätigkeit).</p>` },
    ],
    merksaetze: [
      "Werkvertrag = Erfolg, Dienstvertrag = Tätigkeit.",
      "Vertrag = Antrag + Annahme.",
      "Mangel ⇒ zuerst Nacherfüllung verlangen.",
    ],
    cheatsheet: [
      "Kauf §433 · Werk §631 · Dienst §611",
      "Vertrag = 2 übereinst. Willenserklärungen",
      "Mängelrechte: Nacherfüllung·Minderung·Rücktritt·SE",
    ],
    questionIds: ["q-vertrag-1","q-vertrag-2","q-vertrag-tf-1","fc-vertrag-1"],
  },

  {
    id: "recht-lizenz",
    title: "Urheber-/Lizenzrecht & AGB",
    lernfeld: "LF1", examArea: "AP2-WISO", bereich: "wiso", icon: "©️",
    summary: "AGB, Urheberrecht und Lizenzmodelle (Open Source, proprietär, GPL).",
    visual: null,
    sections: [
      { heading: "Lizenzmodelle",
        html: `<ul>
          <li><strong>Proprietär:</strong> Hersteller behält Rechte, Nutzung per Lizenz (z. B. Windows).</li>
          <li><strong>Open Source:</strong> Quellcode offen; <strong>GPL</strong> ist <em>Copyleft</em> – Weitergabe abgeleiteter Werke muss wieder unter GPL erfolgen.</li>
          <li><strong>Permissiv (MIT/BSD/Apache):</strong> wenige Auflagen, auch in proprietären Produkten nutzbar.</li>
        </ul>` },
      { heading: "Urheberrecht & AGB",
        html: `<p>Das <strong>Urheberrecht</strong> schützt Werke (auch Software) automatisch; es ist nicht übertragbar, nur Nutzungsrechte. <strong>AGB</strong> sind vorformulierte Vertragsbedingungen; überraschende oder unangemessen benachteiligende Klauseln sind unwirksam.</p>` },
    ],
    examples: [
      { title: "GPL-Pflicht", html: `<p>Wer GPL-Code in ein weitergegebenes Produkt einbaut, muss den (abgeleiteten) Quellcode ebenfalls unter GPL offenlegen (Copyleft).</p>` },
    ],
    merksaetze: [
      "GPL = Copyleft: Ableitungen wieder offenlegen.",
      "MIT/BSD/Apache = permissiv, auch proprietär nutzbar.",
      "Urheberrecht entsteht automatisch.",
    ],
    cheatsheet: [
      "Proprietär · Open Source · Permissiv",
      "GPL=Copyleft, MIT/BSD/Apache=permissiv",
      "AGB: überraschende Klauseln unwirksam",
    ],
    questionIds: ["q-lizenz-1","q-lizenz-tf-1","fc-lizenz-1"],
  },

  {
    id: "unternehmen-orga",
    title: "Unternehmensformen & Organisation",
    lernfeld: "LF1", examArea: "AP2-WISO", bereich: "wiso", icon: "🏭",
    summary: "Rechtsformen und betriebliche Aufbau-/Ablauforganisation.",
    visual: null,
    sections: [
      { heading: "Rechtsformen",
        html: `<p><strong>Einzelunternehmen</strong> (volle, persönliche Haftung), <strong>Personengesellschaften</strong> (GbR, OHG, KG – Gesellschafterhaftung), <strong>Kapitalgesellschaften</strong> (GmbH, AG – Haftung auf Gesellschaftsvermögen beschränkt, Mindestkapital GmbH 25.000 €).</p>` },
      { heading: "Aufbau- vs. Ablauforganisation",
        html: `<p><strong>Aufbauorganisation:</strong> Struktur/Hierarchie (Stellen, Abteilungen, Organigramm). <strong>Ablauforganisation:</strong> zeitlich-logischer Ablauf der Arbeitsprozesse.</p>` },
    ],
    examples: [
      { title: "Haftung GmbH", html: `<p>Bei einer GmbH haftet grundsätzlich nur das Gesellschaftsvermögen – das Privatvermögen der Gesellschafter bleibt geschützt.</p>` },
    ],
    merksaetze: [
      "GmbH: Haftung beschränkt, Mindestkapital 25.000 €.",
      "Aufbau = Struktur, Ablauf = Prozess.",
    ],
    cheatsheet: [
      "Einzel · Personen(GbR/OHG/KG) · Kapital(GmbH/AG)",
      "GmbH Stammkapital 25.000 €",
      "Aufbau- vs. Ablauforganisation",
    ],
    questionIds: ["q-unt-1","q-unt-tf-1","fc-unt-1"],
  },

  {
    id: "kalkulation",
    title: "Kaufmännisches Rechnen & Kalkulation",
    lernfeld: "LF1", examArea: "AP2-WISO", bereich: "wiso", icon: "🧮",
    summary: "Bezugs-/Angebotskalkulation, Kostenrechnung und Wirtschaftlichkeit.",
    visual: null,
    sections: [
      { heading: "Bezugskalkulation",
        html: `<p>Vom Listeneinkaufspreis zum Bezugspreis:</p>
        <pre><code>Listeneinkaufspreis
− Rabatt        = Zieleinkaufspreis
− Skonto        = Bareinkaufspreis
+ Bezugskosten  = Bezugspreis (Einstandspreis)</code></pre>` },
      { heading: "Angebotskalkulation",
        html: `<p>Vom Bezugspreis zum Verkaufspreis: + Handlungskosten = Selbstkosten; + Gewinnzuschlag = Barverkaufspreis; + Skonto/Vertreterprovision = Zielverkaufspreis; + Rabatt = Listenverkaufspreis (netto); + USt = Bruttopreis.</p>` },
      { heading: "Wirtschaftlichkeit",
        html: `<p><strong>Wirtschaftlichkeit = Ertrag / Aufwand</strong> (≥ 1 = wirtschaftlich). <strong>Produktivität = Output / Input</strong>. <strong>Rentabilität</strong> setzt Gewinn ins Verhältnis zum Kapital.</p>` },
    ],
    examples: [
      { title: "Skonto", html: `<p>Zieleinkaufspreis 1.000 €, 2 % Skonto ⇒ −20 € = Bareinkaufspreis 980 €. Plus 30 € Fracht = Bezugspreis 1.010 €.</p>` },
    ],
    merksaetze: [
      "Reihenfolge: Rabatt → Skonto → Bezugskosten.",
      "Wirtschaftlichkeit = Ertrag/Aufwand (≥1 gut).",
    ],
    cheatsheet: [
      "Liste −Rabatt −Skonto +Bezugskosten = Bezugspreis",
      "+Handlungskosten=Selbstkosten +Gewinn=BVP",
      "Wirtschaftlichkeit=Ertrag/Aufwand",
    ],
    questionIds: ["q-kalk-1","q-kalk-calc-1","q-kalk-tf-1","q-kalk-cloze-1","fc-kalk-1"],
  },

  {
    id: "ausbildung-sozial",
    title: "Berufsausbildung & Sozialversicherung",
    lernfeld: "LF1", examArea: "AP2-WISO", bereich: "wiso", icon: "🎓",
    summary: "BBiG (Rechte/Pflichten), Sozialversicherung, Arbeitsrecht und Mitbestimmung.",
    visual: null,
    sections: [
      { heading: "Berufsbildungsgesetz (BBiG)",
        html: `<p>Regelt das Ausbildungsverhältnis. <strong>Pflichten Auszubildende:</strong> Lernpflicht, Berichtsheft, Weisungen befolgen, Sorgfalt. <strong>Pflichten Ausbildende:</strong> Ausbildungsinhalte vermitteln, freistellen für Berufsschule/Prüfung, Ausbildungsmittel stellen, Vergütung zahlen.</p>` },
      { heading: "Sozialversicherung",
        html: `<p>Fünf Säulen: <strong>Kranken-, Pflege-, Renten-, Arbeitslosen- und Unfallversicherung</strong>. Beiträge tragen i. d. R. Arbeitgeber und Beschäftigte je zur Hälfte – die <strong>Unfallversicherung</strong> zahlt allein der Arbeitgeber.</p>` },
      { heading: "Mitbestimmung",
        html: `<p>Der <strong>Betriebsrat</strong> (BetrVG) vertritt die Belegschaft; die <strong>Jugend- und Auszubildendenvertretung (JAV)</strong> die jungen/auszubildenden Beschäftigten.</p>` },
    ],
    examples: [
      { title: "Unfallversicherung", html: `<p>Anders als bei Kranken-/Renten-/Arbeitslosenversicherung trägt die Beiträge zur gesetzlichen Unfallversicherung allein der Arbeitgeber.</p>` },
    ],
    merksaetze: [
      "5 Säulen: Kranken, Pflege, Renten, Arbeitslosen, Unfall.",
      "Unfallversicherung zahlt allein der Arbeitgeber.",
      "BBiG regelt Rechte/Pflichten in der Ausbildung.",
    ],
    cheatsheet: [
      "SV: KV·PV·RV·ALV·UV",
      "UV: nur Arbeitgeber",
      "Mitbestimmung: Betriebsrat + JAV",
    ],
    questionIds: ["q-bbig-1","q-sv-1","q-sv-match-1","q-bbig-tf-1","fc-bbig-1"],
  },

  /* ===================== 9. CLIENTS, CPS & BETRIEB (IHK-Ergänzungen) ===================== */

  {
    id: "clients-einbinden",
    title: "Clients in Netzwerke einbinden",
    lernfeld: "LF3", examArea: "AP1", bereich: "os", icon: "🔌",
    summary: "Installation, Treiber, Inbetriebnahme und Netzwerkkonfiguration von Client-Systemen – von der OS-Installation bis zur Domänenaufnahme.",
    visual: null,
    sections: [
      { heading: "Betriebssystem installieren & bereitstellen",
        html: `<p>Clients werden per <strong>Installationsmedium</strong> (USB/ISO), <strong>Image</strong> (z. B. via Klonen) oder <strong>netzwerkbasiert</strong> per <strong>PXE</strong> (Preboot eXecution Environment) installiert. Für viele gleichartige Geräte spart unbeaufsichtigte Installation (Unattended/Answer-File) Zeit.</p>
        <ul>
          <li><strong>Treiber:</strong> Hardware-Komponenten benötigen passende Treiber (Chipsatz, GPU, NIC). Fehlt der NIC-Treiber, ist kein Netzwerk möglich.</li>
          <li><strong>Updates:</strong> Direkt nach der Installation Patches einspielen (Sicherheit).</li>
        </ul>` },
      { heading: "Netzwerkkonfiguration des Clients",
        html: `<p>Ein Client benötigt vier Kernangaben, meist automatisch per <strong>DHCP</strong>:</p>
        <ul>
          <li><strong>IP-Adresse &amp; Subnetzmaske</strong> – Identität und Netzzugehörigkeit</li>
          <li><strong>Standardgateway</strong> – Weg in andere Netze/Internet</li>
          <li><strong>DNS-Server</strong> – Namensauflösung</li>
        </ul>
        <p>Statische Konfiguration eignet sich für Server/Drucker; Clients erhalten ihre Adressen i. d. R. dynamisch. Prüfen unter Windows mit <code>ipconfig /all</code>, unter Linux mit <code>ip a</code>.</p>` },
      { heading: "In die Domäne aufnehmen",
        html: `<p>In Unternehmensumgebungen treten Clients einer <strong>Active-Directory-Domäne</strong> bei. Vorteile: zentrale Anmeldung, Gruppenrichtlinien (GPO), zentrale Verwaltung. Voraussetzung: korrekte DNS-Konfiguration (der Client muss den Domänencontroller per DNS finden).</p>` },
    ],
    examples: [
      { title: "Massen-Rollout", html: `<p>Für 30 neue Notebooks wird ein <strong>Referenz-Image</strong> erstellt, per PXE verteilt und anschließend automatisiert in die Domäne aufgenommen. GPOs setzen Drucker, Laufwerke und Sicherheitsrichtlinien.</p>` },
    ],
    merksaetze: [
      "Ohne NIC-Treiber kein Netzwerk – Treiber zuerst.",
      "Client-Pflichtangaben: IP, Maske, Gateway, DNS.",
      "Domänenbeitritt braucht funktionierendes DNS.",
    ],
    cheatsheet: [
      "Installation: Medium · Image · PXE/Unattended",
      "Prüfen: ipconfig /all (Win) · ip a (Linux)",
      "Domäne: zentrale Anmeldung + GPO, DNS nötig",
    ],
    questionIds: ["q-clients-1","q-clients-2","q-clients-tf-1","fc-clients-1"],
  },

  {
    id: "iot-cps",
    title: "Cyber-physische Systeme & IoT",
    lernfeld: "LF7", examArea: "AP2-KA", bereich: "hardware", icon: "⚙️",
    summary: "Vernetzung physischer Geräte mit IT: Sensorik/Aktorik, eingebettete Systeme, Bussysteme und IoT-Protokolle wie MQTT.",
    visual: null,
    sections: [
      { heading: "Was sind cyber-physische Systeme (CPS)?",
        html: `<p>Ein <strong>cyber-physisches System</strong> verbindet physische Prozesse mit Rechen- und Netzwerktechnik. <strong>Sensoren</strong> erfassen Zustände (Temperatur, Bewegung), <strong>Aktoren</strong> wirken auf die Umwelt (Motor, Ventil, Relais). Ein <strong>eingebettetes System</strong> (Mikrocontroller) steuert die Logik.</p>
        <p><strong>IoT (Internet of Things)</strong> bezeichnet die Vernetzung solcher Geräte über das Internet zur Datenerfassung und Fernsteuerung.</p>` },
      { heading: "Kommunikation: Bussysteme & Protokolle",
        html: `<ul>
          <li><strong>Bussysteme:</strong> I²C, SPI (geräteintern), CAN-Bus (Fahrzeuge/Industrie), Modbus (Automatisierung).</li>
          <li><strong>MQTT:</strong> leichtgewichtiges Publish/Subscribe-Protokoll über TCP – ideal für viele Sensoren mit wenig Bandbreite; ein <em>Broker</em> verteilt Nachrichten an Abonnenten von „Topics".</li>
          <li><strong>Funk:</strong> WLAN, Bluetooth/BLE, Zigbee, LoRaWAN (große Reichweite, wenig Energie).</li>
        </ul>` },
      { heading: "Sicherheit & Herausforderungen",
        html: `<p>IoT-Geräte sind oft schwach abgesichert (Standardpasswörter, fehlende Updates) und damit attraktive Angriffsziele (z. B. Botnetze). Maßnahmen: Netzsegmentierung (eigenes VLAN), Updates, starke Zugangsdaten, Verschlüsselung (TLS).</p>` },
    ],
    examples: [
      { title: "Smarte Gebäudetechnik", html: `<p>Temperatursensoren melden per <strong>MQTT</strong> an einen Broker. Eine Steuerung abonniert das Topic <code>haus/heizung/temp</code> und schaltet bei Unterschreitung über einen <strong>Aktor</strong> das Heizventil. Die IoT-Geräte liegen in einem eigenen <strong>VLAN</strong>.</p>` },
    ],
    merksaetze: [
      "Sensor misst, Aktor wirkt, Controller steuert.",
      "MQTT = Publish/Subscribe über Broker, sparsam.",
      "IoT ins eigene VLAN – Sicherheit zuerst.",
    ],
    cheatsheet: [
      "CPS = physisch + IT; IoT = vernetzt über Internet",
      "Busse: I²C/SPI/CAN/Modbus · Funk: BLE/Zigbee/LoRaWAN",
      "MQTT: Broker + Topics, Publish/Subscribe",
    ],
    questionIds: ["q-iot-1","q-iot-2","q-iot-tf-1","fc-iot-1"],
  },

  {
    id: "monitoring",
    title: "Monitoring & Logging",
    lernfeld: "LF9", examArea: "AP2-KA", bereich: "os", icon: "📟",
    summary: "Überwachung von Systemen und Diensten: Metriken, Schwellwerte, Alarmierung, SNMP und zentrale Protokollierung mit Syslog.",
    visual: null,
    sections: [
      { heading: "Warum überwachen?",
        html: `<p>Monitoring erkennt Störungen <strong>proaktiv</strong>, bevor Nutzende sie melden. Es überwacht <strong>Verfügbarkeit</strong> (läuft der Dienst?), <strong>Auslastung</strong> (CPU, RAM, Speicher, Netz) und definiert <strong>Schwellwerte</strong> (Thresholds), bei deren Überschreitung eine <strong>Alarmierung</strong> (E-Mail, Ticket) erfolgt.</p>` },
      { heading: "SNMP & Werkzeuge",
        html: `<p><strong>SNMP</strong> (Simple Network Management Protocol, UDP 161/162) fragt Geräte (Switches, Server, Drucker) nach Statuswerten ab; Geräte senden Ereignisse aktiv als <strong>Traps</strong>. Bekannte Monitoring-Systeme: <strong>Nagios</strong>, <strong>Zabbix</strong>, <strong>Checkmk</strong>, <strong>PRTG</strong>, <strong>Grafana/Prometheus</strong>.</p>` },
      { heading: "Logging & Syslog",
        html: `<p><strong>Logdateien</strong> protokollieren Ereignisse. Bei vielen Systemen werden Logs zentral gesammelt (<strong>Syslog</strong>, UDP/TCP 514, oder ein <em>SIEM</em>). Vorteile: Korrelation, revisionssichere Aufbewahrung, schnellere Fehlersuche. Logs nach <strong>Schweregrad</strong> (z. B. info, warning, error, critical) klassifizieren.</p>` },
    ],
    examples: [
      { title: "Plattenplatz-Alarm", html: `<p>Ein Monitoring prüft alle 5 Minuten den Füllstand von <code>/var</code>. Bei &gt; 85 % wird eine <strong>Warnung</strong>, bei &gt; 95 % ein <strong>kritischer Alarm</strong> per E-Mail ausgelöst – so wird ein Ausfall durch volle Platte verhindert.</p>` },
    ],
    merksaetze: [
      "Proaktiv überwachen schlägt reaktiv reparieren.",
      "SNMP: Abfrage (poll) + Traps; UDP 161/162.",
      "Syslog zentralisiert Logs (Port 514).",
    ],
    cheatsheet: [
      "Metriken: Verfügbarkeit, CPU/RAM/Disk/Netz",
      "Schwellwert → Alarm (Mail/Ticket)",
      "Tools: Nagios/Zabbix/Checkmk/Prometheus",
    ],
    questionIds: ["q-mon-1","q-mon-2","q-mon-tf-1","fc-mon-1"],
  },

  {
    id: "troubleshooting",
    title: "Systematische Fehleranalyse",
    lernfeld: "LF9", examArea: "AP2-NE", bereich: "netzwerk", icon: "🩺",
    summary: "Strukturiertes Vorgehen bei Netzwerk- und Systemstörungen – vom Symptom zur Ursache, mit den passenden Diagnosewerkzeugen.",
    visual: null,
    sections: [
      { heading: "Strukturiertes Vorgehen",
        html: `<p>Effektive Fehlersuche folgt einem Modell, z. B. <strong>bottom-up</strong> entlang der OSI-Schichten (Kabel → IP → Anwendung) oder <strong>top-down</strong>. Schritte: <strong>1.</strong> Problem eingrenzen (Wer? Was? Seit wann? Wie reproduzierbar?), <strong>2.</strong> Hypothese bilden, <strong>3.</strong> testen, <strong>4.</strong> Ursache beheben, <strong>5.</strong> dokumentieren.</p>` },
      { heading: "Diagnosewerkzeuge",
        html: `<ul>
          <li><code>ping</code> – Erreichbarkeit/Latenz (ICMP)</li>
          <li><code>tracert</code>/<code>traceroute</code> – Weg &amp; Hops zum Ziel</li>
          <li><code>nslookup</code>/<code>dig</code> – DNS-Auflösung prüfen</li>
          <li><code>ipconfig</code>/<code>ip a</code> – lokale Konfiguration</li>
          <li><code>netstat</code>/<code>ss</code> – Verbindungen &amp; Ports</li>
        </ul>` },
      { heading: "Typische Fälle abgrenzen",
        html: `<p>„Keine Webseite erreichbar": Lässt sich die <strong>IP</strong> pingen, aber nicht der <strong>Name</strong> → DNS-Problem. Kein Ping zum Gateway → lokales Netz/Kabel/IP. Kein Ping ins Internet, Gateway aber erreichbar → Routing/Provider.</p>` },
    ],
    examples: [
      { title: "DNS oder Routing?", html: `<p><code>ping 8.8.8.8</code> funktioniert, <code>ping google.de</code> nicht → die <strong>Namensauflösung (DNS)</strong> ist defekt, nicht die Verbindung. Prüfen mit <code>nslookup google.de</code>.</p>` },
    ],
    merksaetze: [
      "Erst eingrenzen, dann ändern – eine Variable zur Zeit.",
      "IP geht, Name nicht → DNS.",
      "Immer dokumentieren (Lösung wiederverwendbar machen).",
    ],
    cheatsheet: [
      "ping · tracert · nslookup · ipconfig/ip a · netstat/ss",
      "OSI bottom-up: Kabel→IP→DNS→Anwendung",
      "Symptom → Hypothese → Test → Fix → Doku",
    ],
    questionIds: ["q-ts-1","q-ts-2","q-ts-tf-1","fc-ts-1"],
  },

  {
    id: "arbeitsschutz",
    title: "Arbeitsschutz, Ergonomie & Green-IT",
    lernfeld: "LF2", examArea: "AP1", bereich: "hardware", icon: "🦺",
    summary: "Sicheres und gesundes Arbeiten am IT-Arbeitsplatz sowie umweltgerechter Umgang mit Geräten und Elektroschrott.",
    visual: null,
    sections: [
      { heading: "Ergonomie am Arbeitsplatz",
        html: `<p>Ein ergonomischer Arbeitsplatz beugt gesundheitlichen Schäden vor: <strong>Bildschirm</strong> in Augenhöhe und blendfrei, <strong>Sitzhöhe</strong> so, dass Unter-/Oberarme und Ober-/Unterschenkel je etwa 90° bilden, regelmäßige <strong>Pausen</strong> und ausreichend Bewegung. Geregelt u. a. in der <strong>Arbeitsstättenverordnung (ArbStättV)</strong>.</p>` },
      { heading: "Arbeitssicherheit & ESD",
        html: `<p>Beim Arbeiten an Hardware: Gerät spannungsfrei schalten, gegen <strong>elektrostatische Entladung (ESD)</strong> schützen (ESD-Armband, Erdung), Vorsicht bei Netzteilen/USV (Kondensatoren). Elektrische Anlagen dürfen nur befugte Personen öffnen.</p>` },
      { heading: "Green-IT & Entsorgung",
        html: `<p><strong>Green-IT</strong> senkt Energieverbrauch und Ressourceneinsatz (effiziente Netzteile/80 PLUS, Virtualisierung, Stromsparmodi). Altgeräte sind <strong>Elektroschrott (WEEE)</strong> und müssen nach <strong>ElektroG</strong> fachgerecht entsorgt/recycelt werden – nicht über den Hausmüll. Datenträger vorher sicher löschen.</p>` },
    ],
    examples: [
      { title: "Altgeräte ausmustern", html: `<p>Beim Austausch von 20 PCs werden die Datenträger sicher gelöscht (oder geschreddert), die Geräte als <strong>WEEE</strong> über einen zertifizierten Entsorger recycelt und die Entsorgung dokumentiert.</p>` },
    ],
    merksaetze: [
      "ArbStättV regelt den Bildschirmarbeitsplatz.",
      "Vor dem Hardware-Eingriff: ESD-Schutz & spannungsfrei.",
      "Elektroschrott = ElektroG/WEEE, nie in den Hausmüll.",
    ],
    cheatsheet: [
      "Ergonomie: 90°-Regel, blendfrei, Pausen",
      "ESD-Armband & Erdung bei Hardware",
      "Green-IT: Energieeffizienz · WEEE-Recycling",
    ],
    questionIds: ["q-as-1","q-as-2","q-as-tf-1","fc-as-1"],
  },

  {
    id: "git-qs",
    title: "Versionsverwaltung & Qualitätssicherung",
    lernfeld: "LF10", examArea: "AP2-KA", bereich: "programmierung", icon: "🔀",
    summary: "Code mit Git versionieren und Software durch Tests und Qualitätssicherung absichern.",
    visual: null,
    sections: [
      { heading: "Versionsverwaltung mit Git",
        html: `<p><strong>Git</strong> ist ein verteiltes Versionskontrollsystem: jede Änderung wird als <strong>Commit</strong> gespeichert, parallele Arbeit erfolgt in <strong>Branches</strong>, die per <strong>Merge</strong> zusammengeführt werden. <strong>Remotes</strong> (z. B. GitHub/GitLab) ermöglichen Zusammenarbeit (<code>push</code>/<code>pull</code>).</p>
        <ul>
          <li><code>git clone</code> – Repository kopieren</li>
          <li><code>git add</code> + <code>git commit</code> – Änderungen festschreiben</li>
          <li><code>git push</code>/<code>git pull</code> – mit Remote abgleichen</li>
          <li><code>git branch</code>/<code>git merge</code> – parallele Entwicklung</li>
        </ul>` },
      { heading: "Testen & Qualitätssicherung",
        html: `<p>Tests sichern die Funktion ab: <strong>Unittests</strong> (einzelne Funktionen), <strong>Integrationstests</strong> (Zusammenspiel), <strong>Systemtests</strong> und <strong>Abnahmetests</strong> (durch Kunden). Weitere QS-Mittel: <strong>Code-Reviews</strong>, statische Analyse (Linter) und automatisierte <strong>CI/CD</strong>-Pipelines.</p>` },
      { heading: "Black-Box vs. White-Box",
        html: `<p><strong>Black-Box-Test:</strong> prüft nur Ein-/Ausgabe ohne Kenntnis des Codes (z. B. Äquivalenzklassen, Grenzwerte). <strong>White-Box-Test:</strong> nutzt die innere Struktur (Pfad-/Zweigüberdeckung).</p>` },
    ],
    examples: [
      { title: "Feature im Branch", html: `<p>Eine neue Funktion wird im Branch <code>feature/login</code> entwickelt, per <strong>Unittests</strong> abgesichert und nach einem <strong>Code-Review</strong> via <strong>Merge</strong> in den Hauptzweig übernommen. Die CI führt die Tests automatisch aus.</p>` },
    ],
    merksaetze: [
      "Commit = Änderungsstand; Branch = parallele Linie; Merge = Zusammenführen.",
      "Testarten: Unit → Integration → System → Abnahme.",
      "Black-Box prüft Verhalten, White-Box prüft Struktur.",
    ],
    cheatsheet: [
      "Git: clone · add · commit · push/pull · branch/merge",
      "Tests: Unit/Integration/System/Abnahme",
      "QS: Reviews · Linter · CI/CD",
    ],
    questionIds: ["q-git-1","q-git-2","q-git-tf-1","fc-git-1"],
  },

];

/* ------------------------------------------------------------------ *
 *  Hilfsfunktionen für die Logik (reine Daten-Helfer)
 * ------------------------------------------------------------------ */

/** Liefert ein Thema anhand seiner id. */
export function getTopic(id) {
  return topics.find((t) => t.id === id) || null;
}

/** Gruppiert Themen nach Lernfeld. */
export function topicsByLernfeld() {
  const map = {};
  for (const t of topics) (map[t.lernfeld] ||= []).push(t);
  return map;
}

/** Gruppiert Themen nach Prüfungsbereich. */
export function topicsByExamArea() {
  const map = {};
  for (const t of topics) (map[t.examArea] ||= []).push(t);
  return map;
}

/** Gruppiert Themen nach thematischem Bereich (Dashboard). */
export function topicsByBereich() {
  const map = {};
  for (const t of topics) (map[t.bereich] ||= []).push(t);
  return map;
}
