/**
 * paths.js — Geführte Lernpfade.
 *
 * Kuratierte, geordnete Wege durch die vorhandenen Themen (siehe data/content.js).
 * Jeder Pfad verweist ausschließlich über `topicIds` auf existierende Themen –
 * keine Inhalte werden hier dupliziert. Reihenfolge = empfohlene Lernreihenfolge.
 */

export const paths = [
  {
    id: "ap1-crashkurs",
    title: "AP1-Crashkurs",
    icon: "🚀",
    description: "Kompakte Vorbereitung auf die gestreckte Abschlussprüfung Teil 1: IT-Arbeitsplatz, Grundlagen Netzwerk, Sicherheit und kaufmännisches Rechnen.",
    topicIds: ["hardware", "arbeitsplatz", "verkabelung", "ports", "ipv4", "subnetting", "schutzziele", "kalkulation"],
  },
  {
    id: "netzwerk-komplett",
    title: "Netzwerktechnik komplett",
    icon: "🌐",
    description: "Vom OSI-Modell bis VPN: der vollständige Netzwerk-Lernpfad für AP2 (Vernetzte Systeme).",
    topicIds: ["osi-tcpip", "ipv4", "subnetting", "ipv6", "ethernet-switching", "vlan", "stp", "routing", "nat", "dhcp-dns", "ports", "wlan", "vpn", "verkabelung"],
  },
  {
    id: "it-sicherheit",
    title: "IT-Sicherheit",
    icon: "🛡️",
    description: "Schutzziele, Kryptografie, Firewalls, Angriffe, Authentifizierung und Datensicherung – sicher durch die Sicherheitsthemen.",
    topicIds: ["schutzziele", "krypto", "auth-rbac", "firewall", "malware-angriffe", "raid-backup", "dsgvo", "vpn"],
  },
  {
    id: "systeme-virtualisierung",
    title: "Systeme & Virtualisierung",
    icon: "🖥️",
    description: "Betriebssysteme, Verzeichnisdienste, Dateisysteme, Virtualisierung und Cloud – die Administration vernetzter Systeme.",
    topicIds: ["linux", "active-directory", "dateisysteme", "virtualisierung", "cloud"],
  },
  {
    id: "datenbanken-sql",
    title: "Datenbanken & SQL",
    icon: "🗄️",
    description: "Vom ER-Modell über die Normalisierung bis zu praxisnahem SQL.",
    topicIds: ["er-modell", "normalisierung", "sql"],
  },
  {
    id: "programmierung",
    title: "Programmierung & Automatisierung",
    icon: "💻",
    description: "Grundlagen, Algorithmendarstellung und Skripting mit PowerShell und Bash.",
    topicIds: ["prog-grundlagen", "struktogramm-pap", "skripting"],
  },
  {
    id: "wiso-recht",
    title: "WiSo, Recht & Projekt",
    icon: "⚖️",
    description: "Wirtschafts- und Sozialkunde, Vertrags- und Lizenzrecht, Unternehmensformen, Kalkulation sowie Projektbewertung.",
    topicIds: ["vertragsrecht", "recht-lizenz", "unternehmen-orga", "kalkulation", "ausbildung-sozial", "nutzwertanalyse", "projektmanagement", "itil-service"],
  },
];

export function getPath(id) { return paths.find((p) => p.id === id) || null; }
