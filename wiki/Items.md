# Artikelverwaltung (Items)

Im Modul **Items** werden alle Produkte und Einzelteile gepflegt, die im Rahmen der Lager- und Produktionsprozesse, insbesondere beim Kitting, verwendet werden.

## Übersicht

Die Artikelverwaltung listet alle vorhandenen Produkte in einer Übersicht auf. Entwickler finden den entsprechenden Code unter `src/app/(dashboard)/items`.

### Funktionen
- **Anlegen neuer Artikel**: Hier können Namen, SKUs (Stock Keeping Unit) und Beschreibungen hinzugefügt werden.
- **EAN Support**: Jedem Artikel kann eine European Article Number (EAN) hinterlegt werden. Diese EANs werden vom System validiert und zur einfachen Handhabung mit Barcode-Scannern genutzt.
- **Details & Bearbeitung**: Zu jedem Artikel lassen sich tiefergehende Informationen ablegen und nachträglich bearbeiten.
