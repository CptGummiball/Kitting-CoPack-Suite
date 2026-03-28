# Print Center

Das **Print Center** ist die Schaltzentrale für physische Druckaufträge. Hier laufen alle Fäden zwischen der Applikation, generiertem ZPL-Code und den angebundenen Zebra- oder netzwerkfähigen Etikettendruckern zusammen.

## Funktionen

- **Warteschlange (Print Queue)**: Alle von Benutzern ausgelösten Drucke werden hier in eine Warteschlange eingereiht (z. B. für Kitting-Aufträge).
- **Direktdruck**: Einfaches manuelles Ausdrucken von Mustern aus der Datenbank.
- **Konfiguration**:
  - Konfigurieren von IP-Adressen für Drucker im lokalen Netzwerk oder per Print-Spooler.
  - Zuweisung von Etiketten (z.B. ein spezifischer Drucker bedruckt nur 4x6 Kitting-Labels, ein anderer ist für Produkt-Barcodes zuständig).
- **Diagnose & Logs**:
  - Überwachen fehlgeschlagener Jobs.
  - Ansicht von gesendeten Raw-ZPL-Befehlen zu Debug-Zwecken.
