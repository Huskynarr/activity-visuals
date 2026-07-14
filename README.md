# 🚀 GitHub Activity 3D Visualizer

Ein kreatives Tool für deine **GitHub Profile Page**, das deine Git-Beiträge (Contributions) des letzten Jahres als atemberaubende, isometrische 3D-Vektorgrafik (SVG) darstellt. 

Statt der üblichen flachen 2D-Matrix oder standardmäßiger Balken übersetzt dieses Tool deine Aktivität in drei detailreiche, lebendige Szenerien, die sich stufenlos basierend auf deiner Commit-Anzahl verändern.

---

## 🎨 Die 3 Visualisierungs-Optionen (Themes)

Jedes Theme übersetzt die 53 Wochen (X-Achse, links-nach-rechts) und 7 Wochentage (Y-Achse, oben-nach-unten) in ein isometrisches Gitternetz.

### A) 🌲 Wiese & Wald (`forest`)
*Eine lebendige Lichtung, die bei Aktivität zuwächst.*
* **Level 0 (Keine Aktivität):** Sandig-trockener Wüstenboden, ab und zu ein kleiner Kieselstein.
* **Level 1 (Geringe Aktivität):** Zarte, grüne Grassprösslinge.
* **Level 2 (Mittlere Aktivität):** Kleine, junge Laubbäume mit weicher Krone.
* **Level 3 (Hohe Aktivität):** Dichte Nadelbäume/Tannen (isometrisch geschichtet).
* **Level 4 (Sehr hohe Aktivität):** Riesige, majestätische Laubbäume mit reichhaltigem, schattiertem Blätterdach (Cloud-Foliage) und 3D-Bodenplatten.

<img src="examples/forest.svg" width="100%" alt="Forest Theme Preview" />


### B) 🛡️ Straße & Autobahn (`highway`)
*Vom verwaisten Asphalt hin zur geschäftigen Verkehrsader.*
* **Level 0 (Keine Aktivität):** Rissiger, verlassener Asphalt mit gelegentlichen orangefarbenen Baustellen-Pylonen.
* **Level 1 (Geringe Aktivität):** Saubere Fahrbahn mit gestrichelten Linien und E-Scootern oder Fahrrädern.
* **Level 2 (Mittlere Aktivität):** Bunte Kompaktwagen (Zufallsfarben mit Scheinwerfern).
* **Level 3 (Hohe Aktivität):** SUVs und Lieferwagen.
* **Level 4 (Sehr hohe Aktivität):** Große rote Sattelschlepper/LKWs mit silbernen Containern, die über die Autobahn rollen.

<img src="examples/highway.svg" width="100%" alt="Highway Theme Preview" />


### C) 🌆 Cyberpunk-Stadt (`cyberpunk`)
*Vom heruntergekommenen Außenposten zur futuristischen Megacity.*
* **Level 0 (Keine Aktivität):** Kleine, rostige Blechhütten (Cyber-Slums) mit spärlichen Lichtpunkten.
* **Level 1 (Geringe Aktivität):** Zweistöckige Wohnhäuser mit blinkenden Antennen.
* **Level 2 (Mittlere Aktivität):** Dreistöckige Gebäude mit leuchtenden Neon-Werbetafeln.
* **Level 3 (Hohe Aktivität):** Hohe, gestufte Wolkenkratzer mit vertikalen Leuchtstreifen und holografischen Symbolen.
* **Level 4 (Sehr hohe Aktivität):** Gigantische Megacorp-Zentralen mit mächtigen Scheinwerferstrahlen, die in den Himmel leuchten, und schwebenden, transparenten 3D-Hologrammen.

<img src="examples/cyberpunk.svg" width="100%" alt="Cyberpunk Theme Preview" />


---

## 🛠️ Lokale Einrichtung & Testen

Da das Tool über ein intelligentes **Mock-Datensystem** verfügt, kannst du es lokal testen, ohne einen GitHub-Token einrichten zu müssen!

### 1. Installation
Stelle sicher, dass [Node.js](https://nodejs.org/) (Version 18+) installiert ist. Klicke auf die verlinkten Dateien, um sie im Editor zu betrachten.
```bash
# Repository klonen & Verzeichnis betreten
cd github-activity

# Abhängigkeiten installieren
npm install
```

### 2. TypeScript kompilieren
```bash
npm run build
```

### 3. SVGs generieren
Nutze das CLI, um deine Aktivität (oder Mock-Daten) zu rendern:
```bash
# Generiere das Wald-Theme
node dist/index.js -u Huskynarr -t forest -o test-forest.svg

# Generiere das Autobahn-Theme
node dist/index.js -u Huskynarr -t highway -o test-highway.svg

# Generiere das Cyberpunk-Theme
node dist/index.js -u Huskynarr -t cyberpunk -o test-cyberpunk.svg
```

Du kannst die erzeugten SVG-Dateien einfach per Doppelklick in deinem Webbrowser (Chrome, Firefox, Safari) öffnen, um das Ergebnis in voller Vektorauflösung zu bewundern!

---

## ⚙️ CLI-Optionen

| Flag | Langform | Beschreibung | Standard |
| :--- | :--- | :--- | :--- |
| `-u` | `--user` | **GitHub-Username** (erforderlich) | *keiner* |
| `-t` | `--theme` | Theme: `forest`, `highway`, `cyberpunk` | `forest` |
| `-o` | `--out` | Pfad für die Ausgabedatei | `github-activity-[theme].svg` |
| `-k` | `--token` | GitHub GraphQL API Token (oder via `.env` / Env-Var `GITHUB_TOKEN`) | *optional (nutzt sonst Mockdaten)* |
| `-h` | `--help` | Zeigt die Hilfe an | *N/A* |

---

## 🤖 GitHub Actions Integration (Autopilot)

Um deine echten Aktivitätsdaten automatisch jeden Tag zu aktualisieren, haben wir bereits einen fertigen Workflow für dich vorbereitet.

1. Erstelle ein GitHub-Repository für dein Profil (falls noch nicht geschehen, meistens mit dem Namen deines Usernames, z.B. `Huskynarr/Huskynarr`).
2. Pushe dieses Projekt (`github-activity`) in das Repository. Der Workflow liegt bereits unter [generate-activity-svg.yml](file:///.github/workflows/generate-activity-svg.yml).
3. GitHub Actions führt den Job automatisch täglich um Mitternacht aus und aktualisiert die SVGs. Du kannst ihn auch manuell im Tab **Actions** starten.
4. **Einbindung in dein README.md:**
   Füge einfach folgenden Markdown-Code in dein Profil-README ein:

```markdown
### 🌲 Mein GitHub Aktivitäts-Wald
<img src="https://raw.githubusercontent.com/Huskynarr/activity-visuals/main/github-activity-forest.svg" width="100%" />

### 🛣️ Meine GitHub Aktivitäts-Autobahn
<img src="https://raw.githubusercontent.com/Huskynarr/activity-visuals/main/github-activity-highway.svg" width="100%" />

### 🌆 Meine GitHub Cyberpunk-Stadt
<img src="https://raw.githubusercontent.com/Huskynarr/activity-visuals/main/github-activity-cyberpunk.svg" width="100%" />
```
*(Hinweis: Diese Links funktionieren, sobald der erste Workflow erfolgreich auf GitHub durchgelaufen ist und die Dateien generiert wurden!)*

---

## 📂 Projektstruktur

- [src/index.ts](file:///home/huskynarr/github-activity/src/index.ts) — CLI Einstiegspunkt & Argumenten-Parser.
- [src/github.ts](file:///home/huskynarr/github-activity/src/github.ts) — GraphQL-API Integration & realistischer Mockdaten-Generator.
- [src/renderer.ts](file:///home/huskynarr/github-activity/src/renderer.ts) — Isometrische Render-Engine mit Theme-Spezifikationen und SVG-Komprimierung mittels Symbol-Wiederverwendung.
- [.github/workflows/generate-activity-svg.yml](file:///home/huskynarr/github-activity/.github/workflows/generate-activity-svg.yml) — GitHub Actions Workflow zur automatischen Generierung.
- [tsconfig.json](file:///home/huskynarr/github-activity/tsconfig.json) & [package.json](file:///home/huskynarr/github-activity/package.json) — Projektkonfigurationen.

---

## 🤝 Beitragen

Beiträge, Fehlerberichte und Feature-Wünsche sind herzlich willkommen! Schau gerne in die [CONTRIBUTING.md](file:///home/huskynarr/github-activity/CONTRIBUTING.md) für Details zum Entwicklungsprozess und Richtlinien für neue Themes.

## 📄 Lizenz

Dieses Projekt steht unter der **MIT-Lizenz** — Details findest du in der [LICENSE](file:///home/huskynarr/github-activity/LICENSE) Datei.
