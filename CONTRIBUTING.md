# 🤝 Beitragen zum GitHub Activity 3D Visualizer

Schön, dass du das Projekt verbessern oder erweitern möchtest! Jede Hilfe ist willkommen, sei es durch das Beheben von Fehlern, das Vorschlagen neuer Ideen oder das Implementieren brandneuer Themes.

Hier ist ein kleiner Leitfaden, wie du beitragen kannst:

---

## 🐛 Fehler melden (Issues)
Wenn du einen Fehler findest oder ein Feature vermisst:
1. Durchsuche die bestehenden Issues, um Duplikate zu vermeiden.
2. Erstelle ein neues Issue und beschreibe den Fehler oder das Feature so präzise wie möglich.
3. Falls anwendbar, hänge die Fehlermeldung oder das fehlerhafte SVG-Bild an.

---

## 🎨 Neue Themes entwickeln
Wir möchten die Auswahl an tollen Themes stetig vergrößern! Um ein neues Theme hinzuzufügen, gehe wie folgt vor:
1. Öffne die Datei [src/renderer.ts](file:///home/huskynarr/github-activity/src/renderer.ts).
2. Definiere ein neues `ThemeConfig`-Objekt. Dieses muss folgende Methoden implementieren:
   - `defineTileSymbols(w, h)`: Generiert die fünf isometrischen Bodenplatten (`tile-0` bis `tile-4`) als wiederverwendbare SVG-Symbole.
   - `drawObject(cx, cy, level, count, w, h)`: Zeichnet das 3D-Vektor-Objekt, das auf der Kachel steht, basierend auf der Aktivitätsstufe (`level`) und dem exakten Beitragswert (`count`).
3. Trage dein Theme im `THEMES`-Register am Ende der Datei ein.
4. Teste dein Theme lokal mit verschiedenen Commit-Werten:
   ```bash
   npm run build
   node dist/index.js -u TestUser -t deintheme -o test-deintheme.svg
   ```

---

## 🚀 Pull Requests einreichen
Wenn du Code beitragen möchtest:
1. Forke das Repository und erstelle einen neuen Branch (`git checkout -b feature/mein-cooles-feature`).
2. Implementiere deine Änderungen.
3. Stelle sicher, dass der Code fehlerfrei kompiliert:
   ```bash
   npm run build
   ```
4. Committe deine Änderungen mit einer klaren, aussagekräftigen Commit-Nachricht.
5. Pushe deinen Branch und öffne einen Pull Request (PR) gegen den `main`-Branch dieses Repositories.

Vielen Dank für deine Unterstützung! 🌟
