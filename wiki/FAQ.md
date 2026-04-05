> **📖 Wiki:** [🏠 Home](./Home.md) · [Installation](./Installation.md) · [Konfiguration](./Konfiguration.md) · [Benutzer & Rollen](./Benutzer-und-Rollen.md) · [Aufträge](./Auftragsmanagement.md) · [Artikel](./Artikelverwaltung.md) · [Label & Druck](./Label-und-Druck.md) · [Integrationen](./Integrationen.md) · [API](./API-Referenz.md) · [FAQ](./FAQ.md)

---

# FAQ — Häufig gestellte Fragen

## Allgemein

### Wo werden die Daten gespeichert?
Im Demo-Modus in `data/demo-data.json`. Für Produktion kann auf MySQL oder Firebase umgestellt werden (Einstellungen → Datenbank).

### Kann ich die Daten zurücksetzen?
Ja, ersetzen Sie `data/demo-data.json` durch die Original-Datei aus dem Repository.

### Ist die App für den Produktionsbetrieb geeignet?
Die aktuelle Version ist eine Beta. Für Produktion sollte ein echtes Datenbank-Backend (MySQL/Firebase) und eine sichere Authentifizierung konfiguriert werden.

---

## Weclapp

### Warum werden nicht alle Weclapp-Artikel synchronisiert?
Absichtlich. Es werden nur **Produktionsartikel** synchronisiert, die als `STORABLE` oder `SALES_BILL_OF_MATERIAL` typisiert sind, sowie Artikel, die in deren Stücklisten (BOM) referenziert werden. Die Artikeltypen können in den Einstellungen angepasst werden.

### Warum gibt es keinen automatischen Sync?
Die Synchronisation erfolgt bewusst nur per Knopfdruck. Dies verhindert unbeabsichtigte Datenänderungen und gibt dem Admin volle Kontrolle.

### Was passiert bei der Synchronisation?
- Neue Artikel werden lokal angelegt (mit leerer Stückliste)
- Bestehende Artikel (Match über SKU) werden aktualisiert (Name, Beschreibung, EAN, Aktiv-Status)
- Lokale Artikel, die nicht in Weclapp existieren, werden **nicht** gelöscht

---

## QZ Tray

### Warum wird ein Wartebildschirm angezeigt?
QZ Tray verwendet Zertifikate zur Authentifizierung. Bei der erstmaligen Verbindung von einem neuen Gerät muss die Anfrage am QZ Tray Host manuell bestätigt werden. Der Wartebildschirm zeigt an, dass die App auf diese Bestätigung wartet.

### Muss ich die Verbindung jedes Mal bestätigen?
Nein. Da die IP-Adressen statisch sind, ist die Bestätigung nur **einmalig** pro Gerät erforderlich.

### QZ Tray verbindet sich nicht — was tun?
1. Prüfen Sie, ob QZ Tray auf dem Host läuft
2. Prüfen Sie die IP-Adresse und den Port in den Einstellungen
3. Stellen Sie sicher, dass die Firewall den Port (Standard: 8181) nicht blockiert
4. Prüfen Sie, ob eine ausstehende Bestätigungsanfrage am Host vorhanden ist

---

## WMS

### Was ist der Unterschied zwischen Webhook und WMS-Nachricht?
- **Einfacher Webhook**: Sendet das vollständige Task-Objekt als JSON POST. Ideal für einfache Integrationen.
- **WMS-Nachricht**: Sendet ein strukturiertes Nachrichtenformat mit Auftragsdetails. Ideal für professionelle WMS-Systeme.

### Kann ich beide Modi gleichzeitig nutzen?
Nein, es kann nur ein Modus aktiv sein.

---

## QR-Code Login

### Wie funktioniert der QR-Code Login?
1. Auf dem Login-Screen wird ein QR-Code generiert (5 Min. gültig)
2. Das Smartphone scannt den Code und öffnet eine Login-Seite
3. Auf dem Smartphone werden E-Mail und Passwort eingegeben
4. Der Browser erkennt die Bestätigung und meldet automatisch an

### Brauche ich eine spezielle App zum Scannen?
Nein, die Standard-Kamera-App des Smartphones reicht aus.

---

## Timeline / Workflow

### Kann ich Schritte im Workflow überspringen?
Ja, wenn der Admin dies in den Einstellungen aktiviert hat (Tasks & Workflows → Zeitstrahl-Schritte überspringen). Die überspringbaren Schritte können einzeln konfiguriert werden.

### Was passiert mit übersprungenen Schritten in der Timeline?
Übersprungene Schritte werden in der Timeline nicht mit einem Zeitstempel versehen und bleiben im Status "ausstehend".
