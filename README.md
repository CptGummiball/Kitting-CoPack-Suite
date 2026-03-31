# Kitting & CoPack Suite

Die **Kitting & CoPack Suite** ist eine moderne, skalierbare Web-Applikation zur effizienten Verwaltung von Artikeln, Etiketten (ZPL), Konfektionierungsaufträgen (Kitting) und Benutzern in einem Lager- oder Produktionsumfeld.

## Hauptfunktionen

- **Artikelverwaltung (Items):** Verwaltung von Produkten mit EAN-Unterstützung.
- **Visueller Label Editor:** Ein WYSIWYG-Editor zur Erstellung von Etiketten (inkl. Text, Barcodes und QR-Codes) mit automatischer Generierung von ZPL-Code für Zebra-Drucker.
- **Print Center:** Zentrale Steuerung und Überwachung von Druckaufträgen.
- **Aufgabenmanagement (Tasks):** Verwaltung von Kitting- und CoPack-Aufträgen.
- **Benutzer- & Rollenverwaltung:** Vollständiges CRUD für Benutzer, Rollen und Berechtigungen.
- **Einstellungen:** Konnektivität und App-übergreifende Parameter.

## Dokumentation

Die vollständige Dokumentation für dieses Projekt finden Sie in unserem **[GitHub Wiki](https://github.com/DEIN_BENUTZERNAME/Kitting-CoPack-Suite/wiki)**.


## Lokale Installation & Entwicklung

### Voraussetzungen
- Node.js (Version 18 oder neuer empfohlen)
- NPM, Yarn oder PNPM

### Starten der Anwendung

1. Repository klonen und Abhängigkeiten installieren:
   ```bash
   npm install
   ```

2. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

3. Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Technologiestack
- [Next.js](https://nextjs.org/) (App Router)
- React 19
- TypeScript
- CSS Modules / TailwindCSS (je nach Konfiguration)
