> **📖 Wiki:** [🏠 Home](./Home.md) · [Installation](./Installation.md) · [Konfiguration](./Konfiguration.md) · [Benutzer & Rollen](./Benutzer-und-Rollen.md) · [Aufträge](./Auftragsmanagement.md) · [Artikel](./Artikelverwaltung.md) · [Label & Druck](./Label-und-Druck.md) · [Integrationen](./Integrationen.md) · [API](./API-Referenz.md) · [FAQ](./FAQ.md)

---

# Auftragsmanagement

## Task-Lebenszyklus

Ein Task durchläuft standardmäßig 5 Schritte:

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────────────┐    ┌─────────────┐
│  Erstellt │───▸│ In Bearbeitung│───▸│ Fertiggestellt│───▸│ An Lager Übergeben │───▸│ Eingelagert │
└──────────┘    └──────────────┘    └──────────────┘    └────────────────────┘    └─────────────┘
```

### Status-Übersicht

| Status | Bedeutung | Nächste Schritte |
|---|---|---|
| `open` | Auftrag erstellt, noch nicht geplant | Planen, Starten |
| `planned` | Geplant, Starttermin festgelegt | Starten |
| `in-progress` | Wird aktiv bearbeitet | Pausieren, Abschließen |
| `paused` | Pausiert (Materialengpass, etc.) | Fortsetzen |
| `completed` | Produktion abgeschlossen | An Lager übergeben |
| `blocked` | Gesperrt (Problem/Klärungsbedarf) | — |
| `handed-to-warehouse` | An Lager übergeben, wartet auf Einlagerung | Einlagerung bestätigen |
| `stored` | Eingelagert, Auftrag abgeschlossen | — |

## Timeline

Die Timeline zeigt visuell den Fortschritt eines Auftrags über alle 5 Schritte. Jeder Schritt enthält:

- **Zeitstempel** der Ausführung
- **Benutzer** der den Schritt durchgeführt hat
- **Visueller Status**: abgeschlossen (✓), aktiv (●), ausstehend (○)

## Schritte überspringen

> Mit einer Admin-Einstellung kann konfiguriert werden, welche Schritte übersprungen werden dürfen.

Wenn aktiviert, erscheinen in der Task-Detailansicht zusätzliche "Skip"-Buttons:

- **→ Fertiggestellt**: Überspringt "In Bearbeitung"
- **→ Lagerübergabe**: Überspringt "Fertiggestellt"
- **→ Eingelagert**: Überspringt "Lagerübergabe"
- **→ Direkt an Lager**: Kombination bei mehreren überspringbaren Schritten

## Lagerübergabe

Die Übergabe an das Lager kann je nach Konfiguration unterschiedlich funktionieren:

1. **Einfacher Webhook**: POST an eine URL → externe Benachrichtigung
2. **WMS-Nachricht**: Strukturierte Nachricht an ein WMS-System

Die Einlagerungsbestätigung kann:
- Manuell durch einen Supervisor erfolgen
- Automatisch nach der Übergabe bestätigt werden (Einstellung)

## Task erstellen

Ein neuer Task benötigt:

| Feld | Pflicht | Beschreibung |
|---|---|---|
| Titel | ✅ | Aussagekräftiger Name des Auftrags |
| Referenz-ID | ✅ | Externe Referenznummer |
| Artikel | ✅ | Zu produzierender Artikel (inkl. Stückliste) |
| Geplantes Datum | ✅ | Starttermin |
| Fälligkeitsdatum | ✅ | Deadline |
| Geschätzte Menge | ✅ | Soll-Stückzahl |
| Priorität | ❌ | Kritisch, Hoch, Mittel, Niedrig |
| Zugewiesener Benutzer | ❌ | Verantwortlicher Mitarbeiter |
| Spezielle Anweisungen | ❌ | Zusätzliche Hinweise |
