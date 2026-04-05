# Kitting & CoPack Suite — Wiki

Willkommen bei der Dokumentation der **Kitting & CoPack Suite**.

## 📑 Inhaltsverzeichnis

| Seite | Beschreibung |
|---|---|
| [Installation](./Installation.md) | Systemvoraussetzungen, Setup und erster Start |
| [Konfiguration](./Konfiguration.md) | Alle Einstellungen im Admin-Panel |
| [Benutzer und Rollen](./Benutzer-und-Rollen.md) | Rechtesystem, Rollenvorlagen, Workstation-Pflicht |
| [Auftragsmanagement](./Auftragsmanagement.md) | Tasks, Timeline, Statusübergänge, Schritte überspringen |
| [Artikelverwaltung](./Artikelverwaltung.md) | Items, Stücklisten, EAN, Weclapp-Sync |
| [Label und Druck](./Label-und-Druck.md) | Label-Editor, ZPL, QZ Tray Integration |
| [Integrationen](./Integrationen.md) | Weclapp ERP, WMS, Webhooks, QZ Tray |
| [API-Referenz](./API-Referenz.md) | Alle REST API Endpunkte |
| [FAQ](./FAQ.md) | Häufig gestellte Fragen |

## Schnellstart

1. Repository klonen: `git clone https://github.com/CptGummiball/Kitting-CoPack-Suite.git`
2. `npm install`
3. `npm run dev`
4. Im Browser: [http://localhost:3000](http://localhost:3000)
5. Login mit `admin@kitting-suite.local` / `admin`

## Versionen

- **v0.2.0-beta** (aktuell) — Produktionsartikel-Sync, QR-Login, Timeline-Skip, WMS-Modi
- **v0.1.0-beta** — Grundfunktionen (Tasks, Items, Labels, Users, Print Center)
