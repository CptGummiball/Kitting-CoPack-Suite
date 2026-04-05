# Changelog

Alle bemerkenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und orientiert sich an [Semantic Versioning](https://semver.org/lang/de/).

---

## [0.2.0-beta] — 2026-04-05

### Hinzugefügt

- **Weclapp Produktionsartikel-Sync**: Nur Produktionsartikel und deren Stücklistenkinder (BOM) werden synchronisiert. Synchronisation ausschließlich per Knopfdruck in den Admin-Einstellungen. Konfigurierbare Artikeltypen (`STORABLE`, `SALES_BILL_OF_MATERIAL`).
- **QZ Tray Wartebildschirm**: Fullscreen-Overlay mit Pulse-Animation, das angezeigt wird, solange die Zertifikats-Bestätigung am QZ Tray Host aussteht. Zeigt Host-IP, Port und verstrichene Wartezeit.
- **QR-Code Login**: Neuer Tab auf der Login-Seite. Die App öffnet die Gerätekamera und scannt einen QR-Code, der Anmeldedaten enthält (JSON oder Base64-kodiert). Automatische Anmeldung nach erfolgreichem Scan. Nutzt `html5-qrcode` für plattformübergreifende Kamera-Unterstützung.
- **Benutzer-Synchronisation (rudimentär)**: Admin-Einstellungen für externe Benutzerquelle (REST API URL + API-Key). Synchronisation per Knopfdruck, Match über E-Mail.
- **Timeline-Schritte überspringbar**: Admin-Einstellung zum Freigeben, ob bestimmte Schritte im Bearbeitungsfenster übersprungen werden können (z.B. direkt von "Offen" zu "Fertiggestellt"). Konfigurierbar pro Schritt.
- **WMS Übergabe-Modus**: Wahl zwischen "Einfacher Webhook" (POST an URL mit optionalem Secret) und "WMS-Nachricht" (strukturiertes JSON an WMS-Endpoint mit Bearer-Auth).
- **QzConnectionGuard Komponente**: Wiederverwendbare Komponente für den QZ Tray Verbindungsaufbau mit Retry-Logik.

### Geändert

- **Settings-Seite komplett überarbeitet**: Neue Sektionen für Weclapp-Sync-Button, WMS-Modus-Auswahl (Radio Cards), Benutzer-Sync, Timeline-Skip-Konfiguration.
- **Weclapp Client erweitert**: Neue Methoden für `getProductionArticles()`, `getBillOfMaterialItems()`, `collectBomChildArticleIds()`, `getArticlesByIds()`.
- **WMS Route erweitert**: Unterstützt nun `handoverMode` (simple-webhook vs. wms-message) und respektiert `skippableSteps`.
- **Task Detail Seite**: Zeigt Skip-Buttons (→ Fertiggestellt, → Lagerübergabe) wenn in Admin aktiviert.
- **Login-Seite**: Mode-Switcher (E-Mail/Passwort vs. QR-Code scannen), Kamera-basierter QR-Scanner mit animiertem Viewfinder.
- **README.md**: Komplette Überarbeitung mit Badges, Feature-Tabelle, Architektur-Diagramm.

### Datenmodell-Erweiterungen

- `AppSettings.tasks.skippableSteps` — Toggle + Schritt-Array
- `AppSettings.wms.handoverMode` — `'simple-webhook' | 'wms-message'`
- `AppSettings.wms.webhookUrl`, `webhookHeaders`, `wmsEndpoint`, `wmsApiKey`
- `AppSettings.weclapp.productionArticleTypes` — String-Array
- `AppSettings.userSync` — `enabled`, `sourceUrl`, `apiKey`, `lastSyncAt`

---

## [0.1.0-beta] — 2026-03-27

### Hinzugefügt

- **Dashboard**: Übersicht mit Statistiken, dringenden Tasks und Schnellzugriff.
- **Artikelverwaltung (Items)**: CRUD für Produkte mit EAN, Stücklisten, Arbeitsanweisungen.
- **Visueller Label Editor**: WYSIWYG-Editor für ZPL-Etiketten (Text, Barcode, QR-Code).
- **Print Center**: Druckaufträge erstellen, verwalten und über ZPL-direkt oder QZ Tray drucken.
- **Aufgabenmanagement (Tasks)**: Kitting-/CoPack-Aufträge mit 5-Schritt-Timeline.
- **Benutzer- & Rollenverwaltung**: Admin, Supervisor, User mit feingranularem Berechtigungssystem.
- **Produktionsplätze (Workstations)**: Zuordnung von Arbeitsplätzen mit Drucker-Bindung.
- **Einstellungen (Settings)**: Allgemein, QZ Tray, Weclapp, WMS, APIs, Theme, Datenbank.
- **Audit-Log**: Protokollierung aller wichtigen Aktionen.
- **WMS-Anbindung**: Lagerübergabe und Einlagerungsbestätigung.
- **Weclapp-Integration**: Verbindungstest und rudimentäre Artikel-Abfrage.
- **Flat-File Repository**: JSON-basiertes Data Layer für Demo/Evaluierung.
- **Responsive Design**: CSS Design System mit Inter-Font, Custom Properties, Animationen.
