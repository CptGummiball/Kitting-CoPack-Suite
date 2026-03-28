# Benutzer- & Rollenverwaltung

Dieses Modul ist für die Steuerung der Zugriffe ins System verantwortlich und ermöglicht es Administratoren, Accounts strukturiert zu verwalten.

## Architektur im Backend
- **User CRUD API**: GET, POST, PUT, DELETE Routen im Next.js App Router (z. B. `src/app/api/users`).
- **Authentifizierung**: Sichere Anmeldung, Passwort-Hashing, und Session-Management (oft basierend auf NextAuth oder einer ähnlichen Bibliothek).

## Rollen & Berechtigungen (`roles`)

Jeder Nutzer des Systems hat eine Rolle zugewiesen:
- **Admin**: Vollzugriff auf alle Bereiche (Einstellungen, Benutzer, alle Tasks).
- **Manager**: Erstellung von Tasks, Bearbeitung von Items und Labels.
- **Packer / Lagerist**: Beschränkter Zugriff. Primärer Fokus auf zugewiesene Aufgaben (`my-tasks`) und Auslösung von Druckvorgängen bei Abschluss der Kitting-Checks.

## Oberfläche (Einstellungen / Settings)
- Administratoren greifen über den Dashboard-Reiter Settings auf das Sub-Modul User Management zu.
- Dort erhalten sie eine übersichtliche Tabellenansicht aller registrierten Nutzer (inkl. Passwort-Reset Möglichkeit).
- Einfaches Entfernen (Löschen) und Neu-Anlegen von Mitarbeiter-Profilen über ein Modal oder eine Detail-Seite.
