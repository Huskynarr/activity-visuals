import fs from 'fs';
import path from 'path';
import { fetchGitHubActivity } from './github.js';
import { renderSVG } from './renderer.js';

function printHelp(): void {
  console.log(`
🚀 GitHub Activity 3D Visualizer CLI
Generiert atemberaubende, isometrische 3D-Bilder deiner GitHub-Aktivität.

Nutzung:
  npm run start -- [optionen]
  node dist/index.js [optionen]

Optionen:
  -u, --user <name>     GitHub-Username (erforderlich)
  -t, --theme <theme>   Visualisierungs-Theme: 'forest', 'highway', 'cyberpunk' (Standard: 'forest')
  -o, --out <pfad>      Ausgabepfad für das SVG-Bild (Standard: github-activity-[theme].svg)
  -k, --token <token>   GitHub Personal Access Token (GraphQL API)
  -h, --help            Zeigt diese Hilfe an

Beispiel:
  npm run start -- -u Huskynarr -t cyberpunk -o profile-city.svg
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('-h') || args.includes('--help') || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  let username = '';
  let theme = 'forest';
  let outputPath = '';
  let token = '';

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-u' || arg === '--user') {
      username = args[++i];
    } else if (arg === '-t' || arg === '--theme') {
      theme = args[++i];
    } else if (arg === '-o' || arg === '--out') {
      outputPath = args[++i];
    } else if (arg === '-k' || arg === '--token') {
      token = args[++i];
    }
  }

  if (!username) {
    console.error('❌ Fehler: Bitte gib einen GitHub-Usernamen mit -u oder --user an.');
    printHelp();
    process.exit(1);
  }

  // Validate theme
  const validThemes = ['forest', 'highway', 'cyberpunk'];
  if (!validThemes.includes(theme.toLowerCase())) {
    console.warn(`⚠️ Warnung: Theme "${theme}" ist ungültig. Verwende Standard-Theme "forest". (Gültig: ${validThemes.join(', ')})`);
    theme = 'forest';
  }

  theme = theme.toLowerCase();

  if (!outputPath) {
    outputPath = `github-activity-${theme}.svg`;
  }

  console.log(`\n🎨 Starte GitHub-Visualisierung für @${username}...`);
  console.log(`Theme:  ${theme.toUpperCase()}`);
  console.log(`Output: ${path.resolve(outputPath)}`);

  // 1. Fetch data
  console.log('📡 Rufe GitHub-Aktivitätsdaten ab...');
  const activity = await fetchGitHubActivity(username, token);
  
  // 2. Render SVG
  console.log('✏️ Generiere isometrisches 3D-Modell (SVG)...');
  const svgContent = renderSVG(activity, theme, username);

  // 3. Save File
  try {
    const dir = path.dirname(outputPath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, svgContent, 'utf-8');
    console.log(`\n✅ Erfolg! Das Bild wurde erfolgreich gespeichert unter:`);
    console.log(`   👉 ${path.resolve(outputPath)}\n`);
  } catch (error: any) {
    console.error(`❌ Fehler beim Schreiben der Datei: ${error.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Ein unerwarteter Fehler ist aufgetreten:', err);
  process.exit(1);
});
