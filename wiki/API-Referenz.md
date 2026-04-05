> **📖 Wiki:** [🏠 Home](./Home.md) · [Installation](./Installation.md) · [Konfiguration](./Konfiguration.md) · [Benutzer & Rollen](./Benutzer-und-Rollen.md) · [Aufträge](./Auftragsmanagement.md) · [Artikel](./Artikelverwaltung.md) · [Label & Druck](./Label-und-Druck.md) · [Integrationen](./Integrationen.md) · [API](./API-Referenz.md) · [FAQ](./FAQ.md)

---

# API-Referenz

Alle API-Endpunkte sind unter `/api/` erreichbar und verwenden JSON als Datenformat.

## Authentifizierung

### Login

```
POST /api/auth/login
Body: { "email": "...", "password": "..." }
Response: { "user": { ... } }
```

### QR-Code Login

```
GET /api/auth/qr
Response: { "token": "...", "confirmUrl": "...", "expiresIn": 300 }

POST /api/auth/qr
Body: { "token": "...", "email": "...", "password": "..." }
Response: { "success": true, "user": { ... } }

GET /api/auth/qr/poll?token=...
Response: { "status": "pending" | "confirmed" | "expired", "user"?: { ... } }

GET /api/auth/qr/confirm?token=...
Response: HTML-Seite für Mobile-Login
```

---

## Tasks

```
GET    /api/tasks           → Liste aller Tasks
GET    /api/tasks/[id]      → Einzelner Task
POST   /api/tasks           → Task erstellen
PUT    /api/tasks/[id]      → Task aktualisieren
DELETE /api/tasks/[id]      → Task löschen
```

---

## Items

```
GET    /api/items            → Liste aller Artikel
GET    /api/items/[id]       → Einzelner Artikel
POST   /api/items            → Artikel erstellen
PUT    /api/items/[id]       → Artikel aktualisieren
DELETE /api/items/[id]       → Artikel löschen
```

---

## Users

```
GET    /api/users            → Liste aller Benutzer
GET    /api/users/[id]       → Einzelner Benutzer
POST   /api/users            → Benutzer erstellen
PUT    /api/users/[id]       → Benutzer aktualisieren
DELETE /api/users/[id]       → Benutzer löschen
POST   /api/users/sync       → Benutzer aus externer Quelle synchronisieren
```

---

## Labels

```
GET    /api/labels           → Alle Label-Templates
GET    /api/labels/[id]      → Einzelnes Template
POST   /api/labels           → Template erstellen
PUT    /api/labels/[id]      → Template aktualisieren
DELETE /api/labels/[id]      → Template löschen
```

---

## Print Jobs

```
GET    /api/print            → Alle Druckaufträge
POST   /api/print            → Druckauftrag erstellen
```

---

## Weclapp

```
GET  /api/weclapp?action=test              → Verbindung testen
GET  /api/weclapp?action=articles          → Artikel abrufen
POST /api/weclapp  { action: 'sync-production-articles' }  → Produktionsartikel synchronisieren
```

---

## WMS

```
POST /api/wms                → Auftrag an Lager übergeben
PUT  /api/wms/[taskId]       → Einlagerung bestätigen
```

---

## Settings

```
GET  /api/settings           → Aktuelle Einstellungen
PUT  /api/settings           → Einstellungen aktualisieren
```

---

## Audit Log

```
GET  /api/audit              → Audit-Log abrufen
```

---

## Workstations

```
GET    /api/workstations         → Alle Produktionsplätze
GET    /api/workstations/[id]    → Einzelner Produktionsplatz
POST   /api/workstations         → Produktionsplatz erstellen
PUT    /api/workstations/[id]    → Produktionsplatz aktualisieren
DELETE /api/workstations/[id]    → Produktionsplatz löschen
```
