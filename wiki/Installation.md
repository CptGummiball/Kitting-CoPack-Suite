# Installation & lokales Setup

Dieses Handbuch beschreibt, wie die **Kitting & CoPack Suite** lokal zur Entwicklung oder zum Selbst-Hosting eingerichtet wird.

## Voraussetzungen

Stelle sicher, dass Folgendes auf dem System installiert ist:
- **Node.js**: (Empfohlen Version 18 oder neuer)
- **Paketmanager**: `npm`, `yarn`, `pnpm` oder `bun`.
- **Git**

## Repository Klonen

Klone das Repository in ein lokales Verzeichnis:

```bash
git clone https://github.com/DEIN_BENUTZERNAME/Kitting-CoPack-Suite.git
cd Kitting-CoPack-Suite
```

## Abhängigkeiten Installieren

Führe folgenden Befehl aus, um alle nötigen Module in `node_modules` zu laden:

```bash
npm install
# oder
yarn install
# oder
pnpm install
```

## Umgebungsvariablen (`.env`)

Kopiere ggf. die `.env.example`-Datei zu `.env.local` und passe die Werte für Datenbankverbindungen, Secrets (z.B. NextAuth) und API-Keys an.

```bash
cp .env.example .env.local
```

*(Falls dein Projekt Prisma oder eine andere Datenbankverbindung nutzt, führe bitte vorher eine Migration durch (`npx prisma db push` o.ä.).)*

## Entwicklungsserver Starten

Führe den Entwicklungsbefehl aus:

```bash
npm run dev
```

Die Anwendung ist nun unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Bauen für Produktion

Um eine produktionsbereite Version zu bauen, verwende:

```bash
npm run build
npm start
```
