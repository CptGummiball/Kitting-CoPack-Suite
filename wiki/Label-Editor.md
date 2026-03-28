# Label Editor & ZPL-Generierung

Das Highlight der Kitting & CoPack Suite ist der integrierte **visuelle WYSIWYG Label Editor**. (Pfad im Code: `src/app/(dashboard)/labels`)

## Funktionsumfang des Editors

- **Visuelles Design (WYSIWYG)**: Gestalte das Layout für Etiketten per Drag & Drop direkt im Browser. 
- **Dimensionen festlegen**: Stelle Breite und Höhe des zu bedruckenden Etiketts (z. B. 4x6 Zoll oder mm) ein. Die Arbeitsfläche passt sich maßstabsgetreu an.
- **Elemente**:
  - **Texte**: Verschiedene Schriftgrößen und Positionierungen.
  - **Barcodes (1D)**: Einfügen von scannbaren Strichcodes (wie Code 128, EAN).
  - **QR-Codes (2D)**: Einbetten von komplexen Daten in Data-Matrix oder QR-Codes.
- **ZPL-Konvertierung**: Das graphische Layout wird *automatisch im Hintergrund in reinen ZPL-Code (Zebra Programming Language)* übersetzt. Dies garantiert eine nahtlose Kompatibilität mit Zebra-Thermodruckern.

## Nutzung in der App

1. Gehe in den Bereich "Labels" -> "Etiketten erstellen".
2. Ziehe benötigte Felder (Text, Barcode) auf die Arbeitsfläche.
3. Lege Platzhalter-Variablen (z. B. `<item_name>`, `<ean>`) an, die später beim echten Druck aus der Datenbank befüllt werden.
4. Speichere das Layout ab. Das generierte ZPL-Snippet wird sicher in der Datenbank hinterlegt.
