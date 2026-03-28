# Features & Architektur

Die **Kitting & CoPack Suite** ist modular aufgebaut. Jedes Modul kapselt eine fachliche Anforderung innerhalb des Next.js App-Routers.

## Technische Basis

- **Framework**: [Next.js](https://nextjs.org/) (Version 16+)
- **Sprache**: TypeScript / React 19
- **Styling**: CSS Modules (z.B. `page.module.css`, `dashboard.module.css`) für Scoped Styling und TailwindCSS.
- **Architektur**: Serverseitige Rendering (SSR) und API-Routen unter `app/api`.

## Hauptfunktionen im Überblick

### 1. Artikelverwaltung (Items)
- Erfassung und Verwaltung von Lagerartikeln.
- Unterstützung für **EAN-Codes** für Scanner-Kompatibilität.

### 2. Label Editor
- Moderner, Drag-and-Drop fähiger Editor.
- Visuelle Gestaltung des Etiketts. Platzierung von Barcodes, Texten, QR-Codes.
- Konfiguration der Dimensionen.
- **Echtzeit-ZPL Generierung**: Der visuelle Editor übersetzt das Design direkt in Zebra Programming Language (ZPL) Code, der von Industriedruckern verstanden wird.

### 3. Print Center
- Verwaltung und Auslösung von Druckaufträgen.
- Anbindung an ZPL-kompatible Drucker.

### 4. Aufgabenmanagement (Tasks & Kitting)
- Zuweisung und Überwachung von Konfektionierungs- und Kitting-Aufgaben.
- Verknüpfung von zu packenden Artikeln (`Items`) und zugehöriger Etikettierung (`Labels`).

### 5. Benutzer- und Rollenverwaltung
- Differenzierte Zugangskontrolle durch Rollen (z. B. Admin, Manager, Packer).
- Vollständiges CRUD (Erstellen, Lesen, Aktualisieren, Löschen) für Benutzer in den Einstellungen.

---
Navigiere zu den spezifischen Seiten im Wiki, um detaillierte Anleitungen für jedes Modul zu erhalten.
