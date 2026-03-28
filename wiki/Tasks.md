# Aufgaben & Kitting (Tasks)

Der Kern der Applikation ist das Erstellen und Verwalten von "Tasks", insbesondere rund um die Themen Kitting und CoPack.

Ein Kitting-Auftrag bedeutet: Mache aus Bestandteilen A, B und C ein neues Produkt D.

## Modulbeschreibung

Entwickler finden das Coding für Tasks primär unter `src/app/(dashboard)/tasks/` sowie persönliche Ansichten unter `src/app/(dashboard)/my-tasks/`.

### Funktionen des Task-Managements
1. **Auftragserstellung**: 
   - Ein Manager kann Kitting-Aufgaben anlegen.
   - Angabe des Zielprodukts, der benötigten Einzelteile (aus den `Items`), der zu generierenden Mengen.
2. **Arbeitsanweisungen**:
   - Die Aufgabe beinhaltet spezielle Anweisungen, z.B. wie Produkte zu konfektionieren sind.
3. **Persönliches Dashboard (My Tasks)**:
   - Mitarbeiter im Lager erhalten direkt zugewiesene Aufgaben.
   - Scannen von EANs der Bestandteile, Bestätigen per Status-Update.
4. **Etikettendruck (Integration)**:
   - Am Ende eines Kitting-Prozesses generiert das System aus dem zugehörigen `Label` Layout automatisch ZPL Code.
   - Eine Anweisung geht an das `Print Center`, die fertigen Label für die Kiste oder Palette sofort auszudrucken.
