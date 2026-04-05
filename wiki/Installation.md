> **📖 Wiki:** [🏠 Home](./Home.md) · [Installation](./Installation.md) · [Konfiguration](./Konfiguration.md) · [Benutzer & Rollen](./Benutzer-und-Rollen.md) · [Aufträge](./Auftragsmanagement.md) · [Artikel](./Artikelverwaltung.md) · [Label & Druck](./Label-und-Druck.md) · [Integrationen](./Integrationen.md) · [API](./API-Referenz.md) · [FAQ](./FAQ.md)

---

# Installation

## Systemvoraussetzungen

- **Node.js** ≥ 18.x (empfohlen: LTS)
- **NPM** ≥ 9.x (oder Yarn / PNPM)
- Moderner Browser (Chrome, Firefox, Edge)
- Optional: **QZ Tray** auf dem Druckserver installiert

## Installation

```bash
# Repository klonen
git clone https://github.com/CptGummiball/Kitting-CoPack-Suite.git
cd Kitting-CoPack-Suite

# Abhängigkeiten installieren
npm install
```

## Entwicklungsserver starten

```bash
npm run dev
```

Die App ist unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Produktion

```bash
# Build erstellen
npm run build

# Produktionsserver starten
npm start
```

## Demo-Daten

Die App wird mit Demo-Daten ausgeliefert (`data/demo-data.json`). Diese enthalten:

- 5 Benutzer (Admin, Supervisor, 3 Mitarbeiter)
- 4 Artikel mit Stücklisten und Arbeitsanweisungen
- 7 Tasks in verschiedenen Status
- 4 Label-Templates
- 3 Druckaufträge
- 3 Produktionsplätze (Workstations)

### Demo-Zugänge

| Rolle | E-Mail | Passwort |
|---|---|---|
| Administrator | `admin@kitting-suite.local` | `admin` |
| Supervisor | `supervisor@kitting-suite.local` | `supervisor` |
| Mitarbeiter | `worker@kitting-suite.local` | `worker` |

## QZ Tray einrichten

1. [QZ Tray herunterladen](https://qz.io/download/) und auf dem Druckserver installieren
2. QZ Tray starten
3. In den Kitting Suite Einstellungen: QZ Tray aktivieren, Host-IP und Port eintragen
4. Beim ersten Verbindungsaufbau: Anfrage am QZ Tray Host bestätigen (einmalig pro Gerät)
