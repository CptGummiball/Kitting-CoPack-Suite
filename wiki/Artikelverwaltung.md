> **📖 Wiki:** [🏠 Home](./Home.md) · [Installation](./Installation.md) · [Konfiguration](./Konfiguration.md) · [Benutzer & Rollen](./Benutzer-und-Rollen.md) · [Aufträge](./Auftragsmanagement.md) · [Artikel](./Artikelverwaltung.md) · [Label & Druck](./Label-und-Druck.md) · [Integrationen](./Integrationen.md) · [API](./API-Referenz.md) · [FAQ](./FAQ.md)

---

# Artikelverwaltung

## Artikel (Items)

Artikel repräsentieren die Endprodukte, die in Kitting- und CoPack-Aufträgen hergestellt werden.

### Felder

| Feld | Beschreibung |
|---|---|
| SKU | Eindeutige Artikelnummer |
| EAN | Europäische Artikelnummer (Barcode) |
| Name | Produktbezeichnung |
| Beschreibung | Detaillierte Beschreibung |
| Stückliste (BOM) | Liste der benötigten Komponenten |
| Arbeitsanweisung | Schritt-für-Schritt-Montageanleitung |
| Spezielle Hinweise | Warnungen, Sicherheitshinweise |
| Label-Konfigurationen | Zugewiesene Etikettenvorlagen |
| Aktiv | Ein-/Ausschalten des Artikels |

## Stückliste (Bill of Material)

Jeder Artikel kann eine Stückliste mit Komponenten haben:

| Feld | Beschreibung |
|---|---|
| Name | Bezeichnung der Komponente |
| Menge | Benötigte Anzahl |
| Einheit | Stück, Bogen, Set, Packung, etc. |
| Alternative | Ersatzkomponente (optional) |
| Notizen | Besondere Hinweise (Farbe, Material, etc.) |

## Arbeitsanweisung

Schritt-für-Schritt-Anleitung für die Produktion:

- Nummerierte Schritte mit Titel und Beschreibung
- Optional: Bild/Foto pro Schritt
- Wird in der Task-Detailansicht unter "Bauanleitung" angezeigt

## Weclapp-Synchronisation

Artikel können aus Weclapp synchronisiert werden:

### Voraussetzungen
- Weclapp-Integration muss aktiviert sein
- Tenant URL und API Token müssen konfiguriert sein

### Ablauf
1. Admin geht zu Einstellungen → Weclapp
2. Klick auf "Produktionsartikel synchronisieren"
3. System holt alle Artikel der konfigurierten Typen (z.B. `STORABLE`)
4. Für jeden Produktionsartikel werden die Stücklisten-Kinder (BOM) gesammelt
5. Alle relevanten Artikel werden lokal erstellt oder aktualisiert

### Matching
- Existierende lokale Artikel werden über die **SKU** (= Weclapp Artikelnummer) identifiziert
- Bei Übereinstimmung: Name, Beschreibung, EAN und Aktiv-Status werden aktualisiert
- Bei neuem Artikel: Wird mit leerer Stückliste und Arbeitsanweisung angelegt

### Wichtig
- Die Synchronisation erfolgt **nur per Knopfdruck** — keine automatische Sync
- Es werden **nur Produktionsartikel** und deren **BOM-Kinder** synchronisiert
- Andere Artikeltypen (z.B. Dienstleistungen) werden ignoriert
