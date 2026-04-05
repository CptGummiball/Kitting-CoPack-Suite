> **📖 Wiki:** [🏠 Home](./Home.md) · [Installation](./Installation.md) · [Konfiguration](./Konfiguration.md) · [Benutzer & Rollen](./Benutzer-und-Rollen.md) · [Aufträge](./Auftragsmanagement.md) · [Artikel](./Artikelverwaltung.md) · [Label & Druck](./Label-und-Druck.md) · [Integrationen](./Integrationen.md) · [API](./API-Referenz.md) · [FAQ](./FAQ.md)

---

# Konfiguration

Alle Einstellungen werden über das Admin-Panel verwaltet: **Einstellungen** (`/settings`).

> **Hinweis:** Nur Benutzer mit der Rolle `admin` haben Zugriff auf die Einstellungen.

## Allgemein

| Feld | Beschreibung |
|---|---|
| Unternehmensname | Wird im Header und in Labels angezeigt |

## QZ Tray

| Feld | Beschreibung |
|---|---|
| Aktiviert | QZ Tray Integration ein-/ausschalten |
| Host / IP-Adresse | IP des QZ Tray Servers (z.B. `192.168.1.50`) |
| Port | Standard: `8181` |
| Signiertes Zertifikat | PEM-Zertifikat für gesicherte Verbindung |

### Zertifikats-Bestätigung

Beim ersten Verbindungsaufbau von einem neuen Gerät muss die Anfrage am QZ Tray Host manuell bestätigt werden. Da die IP-Adressen statisch sind, ist dies nur **einmalig** erforderlich. Die App zeigt während der Wartezeit einen Fullscreen-Wartebildschirm an.

## Weclapp ERP

| Feld | Beschreibung |
|---|---|
| Aktiviert | Weclapp-Integration ein-/ausschalten |
| Tenant URL | Weclapp-Instanz (z.B. `https://firma.weclapp.com`) |
| API Token | Aus Weclapp: Mein Konto → API Token |
| Artikeltypen | Kommasepariert, z.B. `STORABLE, SALES_BILL_OF_MATERIAL` |

### Produktionsartikel-Synchronisation

- **Nur per Knopfdruck** — keine automatische Synchronisation
- Synchronisiert werden nur Artikel der konfigurierten Artikeltypen
- Zusätzlich werden alle Artikel synchronisiert, die in Stücklisten (BOM) dieser Produktionsartikel referenziert sind
- Existierende Artikel werden per SKU (Artikelnummer) zugeordnet

## WMS / Lager-Anbindung

| Feld | Beschreibung |
|---|---|
| Aktiviert | WMS-Integration ein-/ausschalten |
| Übergabe-Modus | `Einfacher Webhook` oder `WMS-Nachricht` |

### Einfacher Webhook

Sendet einen HTTP POST an eine konfigurierbare URL.

| Feld | Beschreibung |
|---|---|
| Webhook URL | Ziel-URL für die Übergabe-Benachrichtigung |
| Webhook Secret | Optionaler Header `X-Webhook-Secret` |

### WMS-Nachricht

Sendet eine strukturierte JSON-Nachricht an ein WMS-System.

| Feld | Beschreibung |
|---|---|
| WMS Endpoint URL | API-Endpunkt des WMS |
| WMS API-Key | Bearer Token für die Authentifizierung |

**Nachrichtenformat (JSON):**
```json
{
  "messageType": "WAREHOUSE_HANDOVER",
  "version": "1.0",
  "timestamp": "2026-04-05T10:00:00Z",
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
    "timestamp": "2026-04-05T10:00:00Z"
  }
}
```

## Benutzer-Synchronisation

| Feld | Beschreibung |
|---|---|
| Aktiviert | Benutzer-Sync ein-/ausschalten |
| Quell-URL | REST API die ein JSON-Array von Benutzern zurückgibt |
| API-Key | Bearer Token für die externe API |

Die externe API soll folgendes Format liefern:
```json
[
  { "email": "user@example.com", "name": "Max Mustermann", "role": "user" }
]
```

## Tasks & Workflows

| Feld | Beschreibung |
|---|---|
| Chargennummern-Präfix | Präfix für automatisch generierte Chargennummern |
| Schritte überspringen | Erlaubt das Überspringen bestimmter Timeline-Schritte |

### Überspringbare Schritte

Wenn aktiviert, können folgende Schritte übersprungen werden:

- **In Bearbeitung** → Direkt von Offen/Geplant zu Fertiggestellt
- **Fertiggestellt** → Direkt von In Bearbeitung zur Lagerübergabe
- **Lagerübergabe** → Direkt von Fertiggestellt zu Eingelagert

## Theme & Branding

| Feld | Beschreibung |
|---|---|
| Hauptfarbe | Primärfarbe für Buttons, Links, aktive Elemente |

## Datenbank & Backend

| Feld | Beschreibung |
|---|---|
| Datenbank-Engine | `Flat-File JSON` (Demo), `MySQL` (Produktion), `Firebase` (Cloud) |
| Verbindungs-URL | Nur für MySQL/Firebase: Connection String |
