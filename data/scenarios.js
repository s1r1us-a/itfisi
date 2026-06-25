/**
 * scenarios.js — Ganzheitliche, handlungsorientierte Prüfungsaufgaben.
 *
 * Eine Szenario-Aufgabe besteht aus einem gemeinsamen Fallbeispiel (`scenario`)
 * und mehreren Teilaufgaben (`parts`). Jede Teilaufgabe nutzt einen der
 * bestehenden Fragetypen (mc-single, mc-multi, truefalse, cloze, calc) und wird
 * von der Quiz-Engine wie eine normale Frage bewertet – nur mit eingeblendetem
 * Kontext. So entsteht das Gefühl echter IHK-Aufgaben (Teil a/b/c …).
 *
 * Pflichtfelder je Teil: type + typische Felder des Typs + explanation.
 */

export const scenarios = [
  {
    id: "szenario-netzplanung",
    topicId: "subnetting",
    title: "Netzwerkplanung neuer Bürostandort",
    difficulty: "mittel",
    scenario: `<p>Die <strong>Muster GmbH</strong> bezieht ein neues Büro und erhält vom Provider das
      private Netz <code>192.168.10.0/24</code>. Es sollen drei Abteilungen (Vertrieb, Technik,
      Verwaltung) in eigene Subnetze mit je bis zu 50 Endgeräten getrennt werden. Die Clients
      sollen ihre IP-Konfiguration automatisch erhalten.</p>`,
    parts: [
      {
        type: "mc-single",
        question: "Welche Subnetzmaske eignet sich für Subnetze mit je bis zu 50 Hosts bei minimaler Verschwendung?",
        options: ["/26 (255.255.255.192)", "/25 (255.255.255.128)", "/27 (255.255.255.224)", "/24 (255.255.255.0)"],
        answer: 0,
        explanation: "Ein /26 bietet 2^6 − 2 = 62 nutzbare Hosts – genug für 50 Geräte, mit wenig Verschwendung. /27 böte nur 30 Hosts.",
      },
      {
        type: "calc",
        question: "Wie lautet die Netzadresse zur Host-Adresse 192.168.10.130 /26?",
        answer: "192.168.10.128",
        explanation: "Bei /26 ist die Blockgröße 64. Die 130 fällt in den Block 128–191 → Netzadresse 192.168.10.128.",
      },
      {
        type: "truefalse",
        question: "Mit der Maske /26 lassen sich aus dem /24-Netz genau vier Subnetze bilden.",
        answer: true,
        explanation: "2 zusätzliche Netzbits (von /24 auf /26) ergeben 2^2 = 4 Subnetze.",
      },
      {
        type: "mc-single",
        question: "Welcher Dienst vergibt den Clients automatisch ihre IP-Konfiguration?",
        options: ["DHCP", "DNS", "ARP", "NTP"],
        answer: 0,
        explanation: "DHCP (Dynamic Host Configuration Protocol) weist IP-Adresse, Maske, Gateway und DNS automatisch zu.",
      },
    ],
  },

  {
    id: "szenario-sicherheitsvorfall",
    topicId: "malware-angriffe",
    title: "IT-Sicherheitsvorfall: Ransomware",
    difficulty: "mittel",
    scenario: `<p>Ein Mitarbeiter der <strong>Nord-Logistik AG</strong> öffnet den Anhang einer
      täuschend echten E-Mail. Kurz darauf sind Dateien auf mehreren Servern verschlüsselt und
      eine Lösegeldforderung erscheint. Die IT-Abteilung wird alarmiert.</p>`,
    parts: [
      {
        type: "mc-single",
        question: "Welches Schutzziel wird durch die Verschlüsselung der Dateien unmittelbar verletzt?",
        options: ["Verfügbarkeit", "Vertraulichkeit", "Authentizität", "Nicht-Abstreitbarkeit"],
        answer: 0,
        explanation: "Die Daten sind nicht mehr nutzbar – das verletzt die Verfügbarkeit. (Bei Datenabfluss wäre zusätzlich die Vertraulichkeit betroffen.)",
      },
      {
        type: "mc-multi",
        question: "Welche Sofortmaßnahmen sind sinnvoll? (Mehrfachauswahl)",
        options: [
          "Betroffene Systeme vom Netz trennen",
          "Lösegeld sofort bezahlen",
          "Vorfall dokumentieren und Backups prüfen",
          "Aus sauberem Backup wiederherstellen",
        ],
        answer: [0, 2, 3],
        explanation: "Isolieren, dokumentieren und aus geprüften Backups wiederherstellen. Lösegeld zahlen wird nicht empfohlen (keine Garantie, fördert Täter).",
      },
      {
        type: "cloze",
        question: "Die ausgenutzte E-Mail-Methode mit gefälschtem Absender heißt {{}}.",
        blanks: [["phishing", "phishing-mail", "phishing-angriff"]],
        explanation: "Phishing zielt darauf ab, über gefälschte Nachrichten Schadcode auszuführen oder Daten zu erbeuten.",
      },
      {
        type: "truefalse",
        question: "Eine 3-2-1-Backup-Strategie (3 Kopien, 2 Medien, 1 extern/offline) hätte die Wiederherstellung erleichtert.",
        answer: true,
        explanation: "Ein offline gehaltenes Backup ist gegen Ransomware-Verschlüsselung geschützt und ermöglicht eine saubere Wiederherstellung.",
      },
    ],
  },

  {
    id: "szenario-datenbank-webshop",
    topicId: "normalisierung",
    title: "Datenmodell für einen Webshop",
    difficulty: "schwer",
    scenario: `<p>Für den Webshop der <strong>Yilmaz KG</strong> soll eine relationale Datenbank
      entworfen werden. Bisher werden Bestellungen in einer einzigen Tabelle gespeichert, in der
      Kundenname, Adresse und mehrere Artikel pro Zeile (kommagetrennt) stehen.</p>`,
    parts: [
      {
        type: "mc-single",
        question: "Gegen welche Normalform verstößt die Speicherung mehrerer Artikel in einem Feld?",
        options: ["1. Normalform (Atomarität)", "2. Normalform", "3. Normalform", "Boyce-Codd-Normalform"],
        answer: 0,
        explanation: "Mehrere Werte in einem Feld verletzen die Atomarität → Verstoß gegen die 1. Normalform.",
      },
      {
        type: "mc-single",
        question: "Wie wird die n:m-Beziehung zwischen Bestellung und Artikel korrekt umgesetzt?",
        options: [
          "Über eine Zwischentabelle (Bestellposition) mit zwei Fremdschlüsseln",
          "Durch ein wiederholtes Artikel-Feld in der Bestelltabelle",
          "Mit einem einzigen Primärschlüssel über beide Tabellen",
          "Gar nicht – n:m ist relational nicht abbildbar",
        ],
        answer: 0,
        explanation: "n:m-Beziehungen werden über eine Zwischen-/Beziehungstabelle aufgelöst, die je einen Fremdschlüssel auf beide Seiten enthält.",
      },
      {
        type: "calc",
        question: "Schreibe die SQL-Abfrage, die alle Spalten der Tabelle kunde liefert (Standardform).",
        answer: "SELECT * FROM kunde",
        accept: ["select * from kunde;", "SELECT * FROM kunde;"],
        explanation: "Die Grundform der Datenabfrage lautet SELECT * FROM <tabelle>.",
      },
    ],
  },

  {
    id: "szenario-perimeter-dmz",
    topicId: "firewall",
    title: "Sicheres Netzkonzept mit DMZ",
    difficulty: "schwer",
    scenario: `<p>Die <strong>Bergmann GmbH</strong> betreibt künftig einen eigenen Web- und Mailserver,
      die aus dem Internet erreichbar sein müssen. Das interne LAN mit Buchhaltung und Fileserver
      soll dabei bestmöglich geschützt bleiben. Du planst das Firewall-/Zonenkonzept.</p>`,
    parts: [
      {
        type: "mc-single",
        question: "In welche Zone gehören der öffentlich erreichbare Web- und Mailserver?",
        options: ["In die DMZ", "Direkt ins interne LAN", "Ins Gäste-WLAN", "Auf den Arbeitsplatz-PCs"],
        answer: 0,
        explanation: "Öffentlich erreichbare Dienste gehören in die DMZ, damit ein kompromittierter Server nicht direkt Zugriff auf das interne LAN eröffnet.",
      },
      {
        type: "mc-single",
        question: "Welche Grundregel sollte die Firewall verfolgen?",
        options: [
          "Default-Deny: alles sperren, nur Benötigtes gezielt erlauben",
          "Default-Allow: alles erlauben, nur Bekanntes sperren",
          "Nur ausgehenden Verkehr filtern",
          "Gar nicht filtern, NAT genügt",
        ],
        answer: 0,
        explanation: "Default-Deny ist das sichere Grundprinzip: erst alles verbieten, dann nur die notwendigen Dienste/Ports freigeben.",
      },
      {
        type: "truefalse",
        question: "Eine Stateful-Inspection-Firewall lässt Antwortpakete einer erlaubten Verbindung automatisch zu.",
        answer: true,
        explanation: "Sie führt eine Zustandstabelle; zu einer zugelassenen Session gehörende Antwortpakete werden ohne separate Regel durchgelassen.",
      },
      {
        type: "mc-multi",
        question: "Welche Maßnahmen erhöhen die Sicherheit zusätzlich? (Mehrfachauswahl)",
        options: [
          "Regelmäßige Updates/Patches der DMZ-Server",
          "Protokollierung (Logging) und Monitoring",
          "Den Fileserver ebenfalls in die DMZ stellen",
          "Netztrennung per VLAN",
        ],
        answer: [0, 1, 3],
        explanation: "Patches, Logging/Monitoring und VLAN-Segmentierung erhöhen die Sicherheit. Der interne Fileserver gehört NICHT in die DMZ.",
      },
    ],
  },

  {
    id: "szenario-zugriffsschutz",
    topicId: "auth-rbac",
    title: "Zugriffsschutz & Authentifizierung",
    difficulty: "mittel",
    scenario: `<p>Nach einem Audit soll die <strong>Klein &amp; Partner KG</strong> ihren Zugriffsschutz
      verbessern. Aktuell teilen sich mehrere Mitarbeitende Sammelkonten, Passwörter sind schwach
      und Rechte werden einzeln pro Person vergeben.</p>`,
    parts: [
      {
        type: "mc-single",
        question: "Wie sollten Berechtigungen künftig sinnvoll verwaltet werden?",
        options: ["Über Rollen (RBAC)", "Weiterhin einzeln je Person", "Über Sammelkonten", "Gar nicht einschränken"],
        answer: 0,
        explanation: "RBAC bündelt Rechte in Rollen; Mitarbeitende erhalten Rollen. Das ist übersichtlich, prüfbar und reduziert Fehler.",
      },
      {
        type: "mc-single",
        question: "Welches Prinzip besagt, dass jede Person nur die nötigsten Rechte erhält?",
        options: ["Least Privilege", "Default-Allow", "Striping", "Zweckbindung"],
        answer: 0,
        explanation: "Least Privilege (geringste Rechte) minimiert Schaden bei Missbrauch oder Kontoübernahme.",
      },
      {
        type: "truefalse",
        question: "Passwort + Einmalcode aus einer Authenticator-App ist eine echte Multi-Faktor-Authentifizierung.",
        answer: true,
        explanation: "Es kombiniert Wissen (Passwort) und Besitz (App/Gerät) – zwei verschiedene Faktoren ⇒ MFA.",
      },
      {
        type: "cloze",
        question: "Sammelkonten sollten abgeschafft werden, damit Aktionen einer {{}} Person zuordenbar sind (Nachvollziehbarkeit).",
        blanks: [["einzelnen", "individuellen", "bestimmten"]],
        explanation: "Personalisierte Konten ermöglichen Nachvollziehbarkeit/Accountability – wichtig für Audits und Forensik.",
      },
    ],
  },

  {
    id: "szenario-servervirtualisierung",
    topicId: "virtualisierung",
    title: "Konsolidierung per Server-Virtualisierung",
    difficulty: "mittel",
    scenario: `<p>Die <strong>Hofmann GmbH</strong> betreibt fünf alte physische Server mit geringer
      Auslastung. Sie sollen auf einer neuen, leistungsstarken Hardware virtualisiert (konsolidiert)
      werden. Active Directory und ein Fileserver gehören dazu.</p>`,
    parts: [
      {
        type: "mc-single",
        question: "Welcher Hypervisor-Typ ist für den produktiven Server-Betrieb am besten geeignet?",
        options: ["Typ 1 (bare metal, z. B. ESXi/Hyper-V)", "Typ 2 (auf einem Desktop-OS)", "Ein Emulator", "Gar kein Hypervisor"],
        answer: 0,
        explanation: "Typ-1-Hypervisoren laufen direkt auf der Hardware und bieten beste Leistung und Stabilität für Server.",
      },
      {
        type: "mc-multi",
        question: "Welche Vorteile bringt die Virtualisierung hier? (Mehrfachauswahl)",
        options: [
          "Bessere Hardwareauslastung",
          "Schnellere Bereitstellung neuer Server",
          "Snapshots vor Updates",
          "Backups werden überflüssig",
        ],
        answer: [0, 1, 2],
        explanation: "Konsolidierung verbessert Auslastung, beschleunigt Bereitstellung und erlaubt Snapshots. Backups bleiben dennoch zwingend nötig.",
      },
      {
        type: "truefalse",
        question: "Ein Snapshot ersetzt eine reguläre Datensicherung.",
        answer: false,
        explanation: "Nein – ein Snapshot ist nur ein kurzfristiger Wiederherstellungspunkt auf demselben Speicher und kein vollwertiges Backup.",
      },
      {
        type: "mc-single",
        question: "Womit verteilt man im AD zentral Einstellungen an die virtualisierten Clients/Server?",
        options: ["Gruppenrichtlinien (GPO)", "DHCP", "RAID", "VLAN"],
        answer: 0,
        explanation: "GPOs verteilen zentral Richtlinien und Konfigurationen an Benutzer und Computer der Domäne.",
      },
    ],
  },
];

export function getScenario(id) { return scenarios.find((s) => s.id === id) || null; }
