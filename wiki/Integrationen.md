> **📖 Wiki:** [🏠 Home](./Home.md) · [Installation](./Installation.md) · [Konfiguration](./Konfiguration.md) · [Benutzer & Rollen](./Benutzer-und-Rollen.md) · [Aufträge](./Auftragsmanagement.md) · [Artikel](./Artikelverwaltung.md) · [Label & Druck](./Label-und-Druck.md) · [Integrationen](./Integrationen.md) · [API](./API-Referenz.md) · [FAQ](./FAQ.md)

---

# Integrationen

## Weclapp ERP

### Übersicht

Die Weclapp-Integration ermöglicht die Synchronisation von Produktionsartikeln aus dem ERP-System.

### Konfiguration

1. Einstellungen → Weclapp ERP → Aktivieren
2. Tenant URL eintragen (z.B. `https://firma.weclapp.com`)
3. API Token eintragen (aus Weclapp: Mein Konto → API Token)
4. "Verbindung testen" klicken

### Synchronisation

- **Manuell** per Knopfdruck "Produktionsartikel synchronisieren"
- **Keine automatische** Synchronisation
- Filtert nach konfigurierbaren Artikeltypen (Standard: `STORABLE`, `SALES_BILL_OF_MATERIAL`)
- Holt zusätzlich alle BOM-Kind-Artikel

### API-Endpunkte

| Methode | URL | Aktion |
|---|---|---|
| `GET` | `/api/weclapp?action=test` | Verbindungstest |
| `GET` | `/api/weclapp?action=articles` | Alle Artikel abrufen |
| `POST` | `/api/weclapp` | `{ action: 'sync-production-articles' }` — Sync starten |

---

## WMS (Warehouse Management System)

### Übersicht

Die WMS-Anbindung steuert die Übergabe von fertiggestellten Aufträgen an das Lagerverwaltungssystem.

### Übergabe-Modi

#### 1. Einfacher Webhook

- HTTP POST an eine konfigurierbare URL
- Optionaler `X-Webhook-Secret` Header
- Optionale zusätzliche Header

**Payload:**
```json
{
  "event": "task.handed-to-warehouse",
  "taskId": "task-001",
  "timestamp": "2026-04-05T10:00:00Z",
  "data": { /* vollständiges Task-Objekt */ }
}
```

#### 2. WMS-Nachricht

- HTTP POST an WMS-Endpunkt
- Bearer Token Authentifizierung
- Strukturiertes Nachrichtenformat

**Payload:**
```json
{
  "messageType": "WAREHOUSE_HANDOVER",
  "version": "1.0",
  "timestamp": "...",
  "order": {
    "externalId": "task-001",
    "referenceId": "WK-2026-0301",
    "title": "Premium Welcome Kits",
    "quantity": 500,
    "itemSku": "KIT-PRO-2026",
    "itemName": "Premium Welcome Kit",
    "priority": "high"
  },
  "handover": {
    "userId": "usr-003",
    "userName": "Tom Weber",
    "timestamp": "..."
  }
}
```

### API-Endpunkte

| Methode | URL | Aktion |
|---|---|---|
| `POST` | `/api/wms` | Auftrag an Lager übergeben |
| `PUT` | `/api/wms/[taskId]` | Einlagerung bestätigen |

---

## QZ Tray

### Übersicht

QZ Tray ermöglicht es, von der Web-Applikation direkt auf lokale oder Netzwerk-Drucker zuzugreifen.

### Voraussetzungen

- QZ Tray auf dem Druckserver installiert und gestartet
- Netzwerkzugang zwischen Browser und QZ Tray Host

### Verbindungsablauf

1. Browser verbindet per WebSocket zu QZ Tray
2. Bei erster Verbindung: **Zertifikats-Bestätigung** am Host erforderlich
3. App zeigt Wartebildschirm mit Polling (alle 3 Sekunden)
4. Nach Bestätigung: Drucker sind verfügbar

### Funktionen

- Drucker auflisten
- ZPL-Code an Drucker senden
- Verbindungsstatus prüfen

---

## Benutzer-Synchronisation

### Übersicht

Rudimentäre Anbindung an einen externen Benutzer-Pool. Vorbereitet für spätere zentrale Benutzerverwaltung.

### Konfiguration

1. Einstellungen → Benutzer-Synchronisation → Aktivieren
2. Quell-URL eintragen (REST API)
3. Optional: API-Key (Bearer Token)

### Erwartetes Format

Die externe API muss folgendes JSON liefern:

```json
[
  {
    "email": "user@example.com",
    "name": "Max Mustermann",
    "role": "user",       // optional: admin, supervisor, user
    "status": "active"    // optional: active, inactive
  }
]
```

Alternativ kann es in einem Wrapper-Objekt kommen:
```json
{
  "users": [ ... ]
}
```

### Matching

- Benutzer werden über die **E-Mail-Adresse** identifiziert
- Bei Übereinstimmung: Name und Rolle aktualisiert
- Bei neuem Benutzer: Wird mit Standard-Berechtigungen der zugewiesenen Rolle angelegt
