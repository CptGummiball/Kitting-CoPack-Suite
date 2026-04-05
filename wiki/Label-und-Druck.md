> **📖 Wiki:** [🏠 Home](./Home.md) · [Installation](./Installation.md) · [Konfiguration](./Konfiguration.md) · [Benutzer & Rollen](./Benutzer-und-Rollen.md) · [Aufträge](./Auftragsmanagement.md) · [Artikel](./Artikelverwaltung.md) · [Label & Druck](./Label-und-Druck.md) · [Integrationen](./Integrationen.md) · [API](./API-Referenz.md) · [FAQ](./FAQ.md)

---

# Label und Druck

## Label-System

Die Suite bietet einen visuellen Editor für ZPL-Etiketten (Zebra Print Language).

### Label-Templates

Jedes Template enthält:

| Feld | Beschreibung |
|---|---|
| Name | Bezeichnung des Templates |
| Größe | Etikettenmaße (z.B. `100x150mm`) |
| ZPL-Code | Automatisch generierter ZPL-Code |
| Felder | Konfigurierbare Datenfelder |

### Feldtypen

| Typ | Beschreibung |
|---|---|
| `text` | Einfacher Text (variable Schriftgröße) |
| `barcode` | Linearer Barcode (Code 128) |
| `qrcode` | QR-Code |
| `image` | Bild/Logo (derzeit Platzhalter) |

### Datenquellen

Felder können dynamisch befüllt werden:

- `item.name` — Produktname
- `item.sku` — Artikelnummer
- `item.ean` — EAN
- `task.referenceId` — Auftrags-Referenz
- `date` — Aktuelles Datum

## Print Center

Das Print Center ist die zentrale Anlaufstelle für alle Druckvorgänge.

### Funktionen

- Label-Template auswählen
- Drucker zuweisen (über Workstation oder manuell)
- Stückzahl festlegen
- Druckauftrag starten
- Status verfolgen (wartend, druckend, fertig, fehler)

## Druckoptionen

### 1. ZPL-Direkt

Direkte TCP/IP-Verbindung zum Zebra-Drucker:

- Konfiguration: IP-Adresse + Port (Standard: 9100)
- Server-seitig (Next.js API Route sendet ZPL-Daten)

### 2. QZ Tray

Client-seitige Druckanbindung über QZ Tray (WebSocket):

- QZ Tray muss auf dem Zielrechner/Druckserver installiert sein
- Verbindung über WebSocket (Standard: Port 8181)
- Unterstützt alle lokal angeschlossenen Drucker

#### Zertifikats-Bestätigung

Beim erstmaligen Verbindungsaufbau von einem neuen Gerät:

1. Die App zeigt einen **Wartebildschirm** mit Pulse-Animation
2. Am QZ Tray Host erscheint eine Bestätigungsanfrage
3. Nach Bestätigung wird die Verbindung hergestellt
4. Da die IPs statisch sind, ist die Bestätigung **einmalig** pro Gerät

#### Konfiguration

| Feld | Beschreibung |
|---|---|
| Host | IP-Adresse des QZ Tray Servers |
| Port | WebSocket-Port (Standard: 8181) |
| Zertifikat | Optionales PEM-Zertifikat für signierte Verbindung |
