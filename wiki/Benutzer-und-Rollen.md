> **📖 Wiki:** [🏠 Home](./Home.md) · [Installation](./Installation.md) · [Konfiguration](./Konfiguration.md) · [Benutzer & Rollen](./Benutzer-und-Rollen.md) · [Aufträge](./Auftragsmanagement.md) · [Artikel](./Artikelverwaltung.md) · [Label & Druck](./Label-und-Druck.md) · [Integrationen](./Integrationen.md) · [API](./API-Referenz.md) · [FAQ](./FAQ.md)

---

# Benutzer und Rollen

## Rollenmodell

Die Suite verwendet ein dreistufiges Rollenmodell:

| Rolle | Berechtigungen |
|---|---|
| **Admin** | Voller Zugriff auf alle Funktionen inkl. Einstellungen, Benutzerverwaltung, System |
| **Supervisor** | Tasks erstellen/bearbeiten/zuweisen, Items verwalten, Labels drucken, Audit einsehen |
| **User** | Tasks ansehen/starten/pausieren, Items ansehen, Labels drucken |

## Berechtigungen im Detail

| Berechtigung | Admin | Supervisor | User |
|---|---|---|---|
| `tasks.view` | ✅ | ✅ | ✅ |
| `tasks.create` | ✅ | ✅ | ❌ |
| `tasks.edit` | ✅ | ✅ | ❌ |
| `tasks.delete` | ✅ | ❌ | ❌ |
| `tasks.assign` | ✅ | ✅ | ❌ |
| `tasks.status` | ✅ | ✅ | ✅ |
| `items.view` | ✅ | ✅ | ✅ |
| `items.create` | ✅ | ✅ | ❌ |
| `items.edit` | ✅ | ✅ | ❌ |
| `items.delete` | ✅ | ❌ | ❌ |
| `users.*` | ✅ | nur `view` | ❌ |
| `labels.*` | ✅ | ✅ (außer delete) | `view`, `print` |
| `settings.*` | ✅ | nur `view` | ❌ |
| `audit.view` | ✅ | ✅ | ❌ |
| `reports.view` | ✅ | ✅ | ❌ |

## Workstation-Pflicht

- **Nicht-Admin-Benutzer** müssen beim Login einen Produktionsplatz (Workstation) auswählen
- Die Workstation bestimmt den zugeordneten Drucker
- Admins können ohne Workstation-Auswahl arbeiten

## QR-Code Login

Benutzer können sich alternativ per QR-Code-Scan anmelden. Die App nutzt die Gerätekamera, um einen QR-Code mit den Anmeldedaten zu lesen:

1. Auf dem Login-Screen den Tab **„QR-Code scannen"** auswählen
2. Die Kamera wird aktiviert (ggf. Browser-Berechtigung erteilen)
3. QR-Code mit den Zugangsdaten vor die Kamera halten
4. Die App erkennt den Code automatisch und meldet den Benutzer an

### QR-Code-Format

Der QR-Code muss die Anmeldedaten in einem der folgenden Formate enthalten:

**JSON (direkt):**
```json
{ "email": "user@example.com", "password": "geheim" }
```

**Base64-kodiert:**
```
eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJwYXNzd29yZCI6ImdlaGVpbSJ9
```

> **Hinweis:** Die QR-Codes können z.B. zentral auf Mitarbeiterkarten gedruckt oder über ein internes Portal generiert werden.

## Benutzer-Synchronisation

Im Admin-Bereich kann eine externe Benutzerquelle konfiguriert werden. Die Synchronisation:

- Erfolgt ausschließlich manuell per Knopfdruck
- Matched Benutzer über die E-Mail-Adresse
- Erstellt neue Benutzer oder aktualisiert bestehende
- Setzt die Rolle basierend auf dem externen `role`-Feld (Standard: `user`)
