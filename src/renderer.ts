import { ActivityGrid, ContributionDay } from './github.js';

interface ThemeConfig {
  getColors: (bgMode: string) => {
    bgColor: string;
    bgGradient: string;
    gridColor: string;
    textColor: string;
    titleColor: string;
    accentColor: string;
  };
  defineTileSymbols: (w: number, h: number, bgMode: string) => string;
  drawObject: (cx: number, cy: number, level: number, count: number, w: number, h: number, date: string) => string;
  drawExtraGridDetails?: (cx: number, cy: number, x: number, y: number, w: number, h: number, level: number, weeks: number) => string;
  extraDefs?: string;
}

// Helper to project isometric coordinates
// isoX, isoY: ranges from -0.5 to 0.5 within the tile
// isoZ: height in pixels pointing upwards
function project(cx: number, cy: number, w: number, h: number, isoX: number, isoY: number, isoZ: number) {
  return {
    x: cx + (isoX - isoY) * (w / 2),
    y: cy + (isoX + isoY) * (h / 2) - isoZ,
  };
}

// Helper to draw a 3D isometric tile plate symbol centered at 0,0
function createTileSymbolMarkup(
  id: string,
  w: number,
  h: number,
  depth: number,
  colors: { top: string; left: string; right: string },
  extraMarkup?: string
): string {
  const topPath = `M 0,${-h / 2} L ${w / 2},0 L 0,${h / 2} L ${-w / 2},0 Z`;
  const leftPath = `M ${-w / 2},0 L 0,${h / 2} L 0,${h / 2 + depth} L ${-w / 2},${depth} Z`;
  const rightPath = `M 0,${h / 2} L ${w / 2},0 L ${w / 2},${depth} L 0,${h / 2 + depth} Z`;

  return `
    <g id="${id}">
      <path d="${leftPath}" fill="${colors.left}" />
      <path d="${rightPath}" fill="${colors.right}" />
      <path d="${topPath}" fill="${colors.top}" />
      ${extraMarkup || ''}
    </g>
  `;
}

// Draw a 3D isometric box
function drawIsoBox(
  cx: number,
  cy: number,
  w: number,
  h: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  height: number,
  colors: { top: string; left: string; right: string }
): string {
  const p001 = project(cx, cy, w, h, minX, minY, height);
  const p101 = project(cx, cy, w, h, maxX, minY, height);
  const p111 = project(cx, cy, w, h, maxX, maxY, height);
  const p011 = project(cx, cy, w, h, minX, maxY, height);

  const p010 = project(cx, cy, w, h, minX, maxY, 0);
  const p110 = project(cx, cy, w, h, maxX, maxY, 0);
  const p100 = project(cx, cy, w, h, maxX, minY, 0);

  const topPath = `M ${p001.x},${p001.y} L ${p101.x},${p101.y} L ${p111.x},${p111.y} L ${p011.x},${p011.y} Z`;
  const leftPath = `M ${p010.x},${p010.y} L ${p110.x},${p110.y} L ${p111.x},${p111.y} L ${p011.x},${p011.y} Z`;
  const rightPath = `M ${p110.x},${p110.y} L ${p100.x},${p100.y} L ${p101.x},${p101.y} L ${p111.x},${p111.y} Z`;

  return `
    <path d="${leftPath}" fill="${colors.left}" />
    <path d="${rightPath}" fill="${colors.right}" />
    <path d="${topPath}" fill="${colors.top}" />
  `;
}

// === THEME CONFIGURATIONS ===

const ForestTheme: ThemeConfig = {
  getColors: (bgMode) => {
    if (bgMode === 'dark') {
      return {
        bgColor: '#0b0f19',
        bgGradient: 'linear-gradient(135deg, #0b0f19 0%, #1e293b 100%)',
        gridColor: '#111827',
        textColor: '#9ca3af',
        titleColor: '#f9fafb',
        accentColor: '#10b981',
      };
    }
    return {
      bgColor: '#f8fafc',
      bgGradient: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
      gridColor: '#e2e8f0',
      textColor: '#475569',
      titleColor: '#0f172a',
      accentColor: '#10b981',
    };
  },
  extraDefs: `
    <radialGradient id="tree-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="trunk-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#5c4033" />
      <stop offset="50%" stop-color="#7a5843" />
      <stop offset="100%" stop-color="#3d2a20" />
    </linearGradient>
    <linearGradient id="redwood-trunk" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8b4f30" />
      <stop offset="50%" stop-color="#a05d3b" />
      <stop offset="100%" stop-color="#5c331e" />
    </linearGradient>
    <radialGradient id="leaves-lvl2" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#a3b899" />
      <stop offset="70%" stop-color="#708765" />
      <stop offset="100%" stop-color="#4e6145" />
    </radialGradient>
    <radialGradient id="leaves-lvl3" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#559663" />
      <stop offset="70%" stop-color="#306b3d" />
      <stop offset="100%" stop-color="#1b4223" />
    </radialGradient>
    <radialGradient id="leaves-lvl4" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#1e7834" />
      <stop offset="70%" stop-color="#0b4719" />
      <stop offset="100%" stop-color="#03240a" />
    </radialGradient>
    <radialGradient id="leaves-sequoia" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#2d6a4f" />
      <stop offset="70%" stop-color="#1b4332" />
      <stop offset="100%" stop-color="#081c15" />
    </radialGradient>
  `,
  defineTileSymbols: (w: number, h: number, bgMode: string) => {
    // Ground tile configurations adjust slightly based on background mode
    const isDark = bgMode === 'dark';
    
    const tileConfigs = isDark ? [
      { id: 'tile-0', top: '#1c1b18', left: '#141311', right: '#0f0e0c' }, // dry dark soil
      { id: 'tile-1', top: '#202d24', left: '#162019', right: '#111813' },
      { id: 'tile-2', top: '#223c28', left: '#172a1b', right: '#101e13' },
      { id: 'tile-3', top: '#1b4d24', left: '#123518', right: '#0d2711' },
      { id: 'tile-4', top: '#113f1b', left: '#0a2a11', right: '#061d0b' },
    ] : [
      { id: 'tile-0', top: '#EED9B3', left: '#D6BE93', right: '#C8B085' }, // dry sand/meadow
      { id: 'tile-1', top: '#D2E3C8', left: '#B5C9A6', right: '#A2B792' },
      { id: 'tile-2', top: '#A9C394', left: '#8EAA77', right: '#7C9766' },
      { id: 'tile-3', top: '#75A47F', left: '#5B8A65', right: '#4D7A57' },
      { id: 'tile-4', top: '#4F6F52', left: '#3A533D', right: '#2F4331' },
    ];
    
    return tileConfigs.map(c => createTileSymbolMarkup(c.id, w, h, 6, c)).join('\n');
  },
  drawObject: (cx, cy, level, count, w, h, date) => {
    if (level === 0) {
      if (Math.sin(cx * 1.5 + cy) > 0.75) {
        return `
          <ellipse cx="${cx - 2}" cy="${cy + 1}" rx="4" ry="2" fill="url(#tree-shadow)" />
          <path d="M ${cx - 3},${cy} C ${cx - 3},${cy - 2} ${cx + 1},${cy - 3} ${cx + 2},${cy} C ${cx + 2},${cy + 1} ${cx - 1},${cy + 1} ${cx - 3},${cy} Z" fill="#78716c" />
        `;
      }
      return '';
    }

    // Deterministic role based on date hash
    // 0: Commit -> Fir tree (spitz / Nadelbaum)
    // 1: Pull Request -> Giant Sequoia (Mammutbaum - massive & tall)
    // 2: Issue/Review -> Leafy Oak (rund / Laubbaum)
    const dateHash = date.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const role = dateHash % 3;

    const scale = Math.min(1 + (count - 1) * 0.08, 1.8);
    const shadowRadius = (role === 1 ? 12 : 8) * scale;
    let svg = `<ellipse cx="${cx}" cy="${cy + 2}" rx="${shadowRadius}" ry="${shadowRadius / 2}" fill="url(#tree-shadow)" />`;

    if (role === 0) {
      // === NA DELBAUM (Fir / Spruce) ===
      const trunkHeight = 10 * scale;
      const layers = level === 1 ? 1 : level <= 3 ? 2 : 3;
      const baseWidth = (level === 1 ? 8 : level <= 3 ? 12 : 15) * scale;

      // Trunk
      svg += drawIsoBox(cx, cy, w, h, -0.04, 0.04, -0.04, 0.04, trunkHeight, { top: '#4E3629', left: '#3D2A20', right: '#2C1E17' });

      // Foliage cones (triangles)
      for (let i = 0; i < layers; i++) {
        const factor = (layers - i) / layers;
        const width = baseWidth * factor;
        const bottom = cy - trunkHeight - i * (6 * scale);
        const top = bottom - (13 * scale);
        const color = level === 4 ? 'url(#leaves-lvl4)' : 'url(#leaves-lvl3)';
        
        svg += `
          <path d="M ${cx - width},${bottom} L ${cx + width},${bottom} L ${cx},${top} Z" fill="${color}" />
          <path d="M ${cx},${bottom} L ${cx + width},${bottom} L ${cx},${top} Z" fill="#000000" opacity="0.12" />
        `;
      }
    } else if (role === 1) {
      // === MAMMUTBAUM (Giant Sequoia) ===
      // Very tall, thick red-brown trunk, narrow conical tip
      const trunkHeight = (level === 1 ? 18 : level === 2 ? 28 : level === 3 ? 38 : 50) * scale;
      const trunkWidth = (level <= 2 ? 0.08 : 0.12);
      
      // Giant Red Trunk
      svg += drawIsoBox(cx, cy, w, h, -trunkWidth, trunkWidth, -trunkWidth, trunkWidth, trunkHeight, { 
        top: '#8C4F35', 
        left: 'url(#redwood-trunk)', 
        right: '#5D3320' 
      });

      // Sequoia high foliage (narrow high teardrop shapes)
      if (level > 1) {
        const fH = (level === 2 ? 16 : level === 3 ? 25 : 35) * scale;
        const fW = (level === 2 ? 8 : level === 3 ? 12 : 15) * scale;
        const fY = cy - trunkHeight;

        svg += `
          <path d="M ${cx - fW},${fY + fH*0.2} C ${cx - fW},${fY - fH*0.5} ${cx},${fY - fH} ${cx},${fY - fH} C ${cx},${fY - fH} ${cx + fW},${fY - fH*0.5} ${cx + fW},${fY + fH*0.2} C ${cx + fW},${fY + fH*0.6} ${cx - fW},${fY + fH*0.6} ${cx - fW},${fY + fH*0.2} Z" 
                fill="url(#leaves-sequoia)" />
          <path d="M ${cx},${fY - fH} C ${cx},${fY - fH} ${cx + fW},${fY - fH*0.5} ${cx + fW},${fY + fH*0.2} C ${cx + fW},${fY + fH*0.6} ${cx},${fY + fH*0.6} L ${cx},${fY - fH} Z" 
                fill="#000000" opacity="0.18" />
        `;
      }
    } else {
      // === LAUBBAUM (Leafy Oak) ===
      if (level === 1) {
        // Small green bush
        svg += `<circle cx="${cx}" cy="${cy - 6}" r="${5 * scale}" fill="url(#leaves-lvl2)" />`;
      } else {
        const trunkHeight = (level === 2 ? 12 : level === 3 ? 16 : 22) * scale;
        const cyCrown = cy - trunkHeight;
        const cR = (level === 2 ? 9 : level === 3 ? 12 : 15) * scale;

        // Trunk
        svg += drawIsoBox(cx, cy, w, h, -0.05, 0.05, -0.05, 0.05, trunkHeight, { top: '#5A3D28', left: '#452E1D', right: '#372417' });
        
        // Circular overlapping crown (looks like a cloud)
        const leafGrad = level === 2 ? 'url(#leaves-lvl2)' : level === 3 ? 'url(#leaves-lvl3)' : 'url(#leaves-lvl4)';
        svg += `
          <circle cx="${cx - 6 * scale}" cy="${cyCrown - 2 * scale}" r="${cR * 0.8}" fill="${leafGrad}" />
          <circle cx="${cx + 6 * scale}" cy="${cyCrown - 1 * scale}" r="${cR * 0.8}" fill="${leafGrad}" />
          <circle cx="${cx}" cy="${cyCrown - 10 * scale}" r="${cR * 1.0}" fill="${leafGrad}" />
          <circle cx="${cx}" cy="${cyCrown}" r="${cR}" fill="${leafGrad}" />
          <circle cx="${cx - 2 * scale}" cy="${cyCrown - 4 * scale}" r="${cR * 0.7}" fill="#ffffff" opacity="0.08" />
        `;
      }
    }

    return svg;
  },
};

const HighwayTheme: ThemeConfig = {
  getColors: () => ({
    bgColor: '#0f172a',
    bgGradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    gridColor: '#1e293b',
    textColor: '#94a3b8',
    titleColor: '#f8fafc',
    accentColor: '#f59e0b',
  }),
  extraDefs: `
    <linearGradient id="car-body-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="car-body-red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
    <linearGradient id="car-body-blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="car-body-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <linearGradient id="guardrail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
  `,
  defineTileSymbols: (w: number, h: number) => {
    // Highway tiles - no individual side walls. Just the flat road top.
    const tileConfigs = [
      { id: 'tile-0', top: '#1e2530' }, // Cracked/worn lane
      { id: 'tile-1', top: '#272f3d' },
      { id: 'tile-2', top: '#2b3545' },
      { id: 'tile-3', top: '#333e50' },
      { id: 'tile-4', top: '#3b475c' },
    ];

    return tileConfigs.map(c => {
      // Just a flat diamond shape for the road lane
      const topPath = `M 0,${-h / 2} L ${w / 2},0 L 0,${h / 2} L ${-w / 2},0 Z`;
      return `
        <g id="${c.id}">
          <path d="${topPath}" fill="${c.top}" />
        </g>
      `;
    }).join('\n');
  },
  drawObject: (cx, cy, level, count, w, h) => {
    if (level === 0) return ''; // Let empty days stay empty road surface

    const scale = Math.min(1 + (count - 1) * 0.05, 1.4);
    
    if (level === 1) {
      // Scooter or Motorcycle
      const color = '#10b981';
      const base = drawIsoBox(cx, cy, w, h, -0.15, 0.15, -0.02, 0.02, 2, { top: color, left: '#047857', right: '#065f46' });
      const handlebar = project(cx, cy, w, h, 0.1, 0, 9);
      const handlebarBase = project(cx, cy, w, h, 0.1, 0, 2);
      return `
        ${base}
        <line x1="${handlebarBase.x}" y1="${handlebarBase.y}" x2="${handlebar.x}" y2="${handlebar.y}" stroke="#cbd5e1" stroke-width="1.5" />
        <circle cx="${handlebar.x}" cy="${handlebar.y}" r="1" fill="#fef08a" />
      `;
    }

    if (level === 2) {
      // Standard car
      const colors = ['yellow', 'red', 'blue', 'silver'];
      const colorIdx = Math.floor(Math.abs(Math.sin(cx * 7 + cy * 13) * colors.length));
      const color = colors[colorIdx];
      const bodyColor = `url(#car-body-${color})`;
      
      let svg = `<ellipse cx="${cx}" cy="${cy + 1}" rx="11" ry="5.5" fill="#020617" opacity="0.45" />`;
      // Car chassis + cabin
      svg += drawIsoBox(cx, cy, w, h, -0.28, 0.22, -0.1, 0.1, 4.5 * scale, { top: bodyColor, left: bodyColor, right: bodyColor });
      svg += drawIsoBox(cx, cy, w, h, -0.14, 0.1, -0.08, 0.08, 8 * scale, { top: bodyColor, left: '#0f172a', right: '#1e293b' });
      
      // Headlights
      const hl1 = project(cx, cy, w, h, 0.22, 0.05, 2 * scale);
      const hl2 = project(cx, cy, w, h, 0.22, -0.05, 2 * scale);
      svg += `
        <circle cx="${hl1.x}" cy="${hl1.y}" r="0.8" fill="#fef08a" />
        <circle cx="${hl2.x}" cy="${hl2.y}" r="0.8" fill="#fef08a" />
      `;
      return svg;
    }

    if (level === 3) {
      // Delivery Van / SUV
      const bodyColor = 'url(#car-body-blue)';
      let svg = `<ellipse cx="${cx}" cy="${cy + 1}" rx="13" ry="6.5" fill="#020617" opacity="0.45" />`;
      
      svg += drawIsoBox(cx, cy, w, h, -0.32, 0.28, -0.12, 0.12, 10 * scale, { top: bodyColor, left: bodyColor, right: bodyColor });
      svg += drawIsoBox(cx, cy, w, h, 0.1, 0.26, -0.11, 0.11, 9.5 * scale, { top: bodyColor, left: '#020617', right: '#0f172a' });
      return svg;
    }

    // Level 4: Semitruck / Freight LKW
    const cabinColor = 'url(#car-body-red)';
    const trailerColor = 'url(#car-body-silver)';
    let svg = `<ellipse cx="${cx}" cy="${cy + 1}" rx="18" ry="9" fill="#020617" opacity="0.5" />`;

    // Trailer
    svg += drawIsoBox(cx, cy, w, h, -0.4, 0.1, -0.14, 0.14, 20 * scale, { top: trailerColor, left: trailerColor, right: trailerColor });
    // Cabin (front)
    svg += drawIsoBox(cx, cy, w, h, 0.18, 0.42, -0.13, 0.13, 17 * scale, { top: cabinColor, left: cabinColor, right: cabinColor });
    
    // Windshield
    const wp1 = project(cx, cy, w, h, 0.42, -0.11, 10 * scale);
    const wp2 = project(cx, cy, w, h, 0.42, 0.11, 10 * scale);
    const wp3 = project(cx, cy, w, h, 0.42, 0.11, 15 * scale);
    const wp4 = project(cx, cy, w, h, 0.42, -0.11, 15 * scale);
    svg += `<path d="M ${wp1.x},${wp1.y} L ${wp2.x},${wp2.y} L ${wp3.x},${wp3.y} L ${wp4.x},${wp4.y} Z" fill="#020617" />`;

    return svg;
  },
  drawExtraGridDetails: (cx, cy, x, y, w, h, level, weeks) => {
    let extra = '';

    // 1. Spurentrennlinien (Dashed lane dividers)
    // Draw these between lanes. The line is drawn on the bottom-left edge of the tile (which divides lane y and y+1).
    if (y < 6) {
      // Calculate coordinates of the bottom-left edge of the tile
      const pStart = project(cx, cy, w, h, -0.5, 0.5, 0); // Left corner of tile
      const pEnd = project(cx, cy, w, h, 0.5, 0.5, 0);   // Bottom corner of tile
      extra += `
        <line x1="${pStart.x}" y1="${pStart.y}" x2="${pEnd.x}" y2="${pEnd.y}" 
              stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,4" opacity="0.75" />
      `;
    }

    // 2. Leitplanken (Guardrails)
    // We place a guardrail along the very back edge (y=0) and front edge (y=6)
    if (y === 0) {
      // Top-right edge of the tile (back border of the highway)
      const pStart = project(cx, cy, w, h, -0.5, -0.5, 0); // Top corner
      const pEnd = project(cx, cy, w, h, 0.5, -0.5, 0);   // Right corner
      
      // Draw posts
      extra += `
        <line x1="${pStart.x}" y1="${pStart.y}" x2="${pStart.x}" y2="${pStart.y - 7}" stroke="#475569" stroke-width="1.5" />
        <line x1="${(pStart.x + pEnd.x)/2}" y1="${(pStart.y + pEnd.y)/2}" x2="${(pStart.x + pEnd.x)/2}" y2="${(pStart.y + pEnd.y)/2 - 7}" stroke="#475569" stroke-width="1.5" />
        <!-- Rail bar -->
        <line x1="${pStart.x}" y1="${pStart.y - 5}" x2="${pEnd.x}" y2="${pEnd.y - 5}" stroke="url(#guardrail-grad)" stroke-width="2.5" />
      `;
    }
    
    if (y === 6) {
      // Bottom-left edge of the tile (front border of the highway)
      const pStart = project(cx, cy, w, h, -0.5, 0.5, 0); // Left corner
      const pEnd = project(cx, cy, w, h, 0.5, 0.5, 0);   // Bottom corner
      
      // Draw posts
      extra += `
        <line x1="${pStart.x}" y1="${pStart.y}" x2="${pStart.x}" y2="${pStart.y - 7}" stroke="#475569" stroke-width="1.5" />
        <line x1="${(pStart.x + pEnd.x)/2}" y1="${(pStart.y + pEnd.y)/2}" x2="${(pStart.x + pEnd.x)/2}" y2="${(pStart.y + pEnd.y)/2 - 7}" stroke="#475569" stroke-width="1.5" />
        <!-- Rail bar -->
        <line x1="${pStart.x}" y1="${pStart.y - 5}" x2="${pEnd.x}" y2="${pEnd.y - 5}" stroke="url(#guardrail-grad)" stroke-width="2.5" />
      `;
    }

    return extra;
  },
};

const CyberpunkTheme: ThemeConfig = {
  getColors: () => ({
    bgColor: '#05010c',
    bgGradient: 'linear-gradient(135deg, #05010c 0%, #110022 50%, #030008 100%)',
    gridColor: '#140029',
    textColor: '#f472b6',
    titleColor: '#00f0ff',
    accentColor: '#d946ef',
  }),
  extraDefs: `
    <linearGradient id="cyber-glass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#13192b" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#080914" stop-opacity="0.98" />
    </linearGradient>
    <linearGradient id="hollow-beam" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.3" />
      <stop offset="70%" stop-color="#ff007f" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#ff007f" stop-opacity="0" />
    </linearGradient>
    <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `,
  defineTileSymbols: (w: number, h: number) => {
    const tileConfigs = [
      { id: 'tile-0', top: '#08070d', left: '#050408', right: '#030205', glow: '' },
      { id: 'tile-1', top: '#0d0b1a', left: '#07060f', right: '#04030a', glow: '#360054' },
      { id: 'tile-2', top: '#100c24', left: '#0a0817', right: '#05040f', glow: '#004c5e' },
      { id: 'tile-3', top: '#130e2e', left: '#0c091f', right: '#060414', glow: '#b5005a' },
      { id: 'tile-4', top: '#1a133d', left: '#100c29', right: '#080619', glow: '#00c3d9' },
    ];

    return tileConfigs.map(c => {
      let extra = '';
      if (c.glow) {
        // glowing grid outline on top
        const topPath = `M 0,${-h / 2} L ${w / 2},0 L 0,${h / 2} L ${-w / 2},0 Z`;
        extra = `<path d="${topPath}" stroke="${c.glow}" stroke-width="1.0" fill="none" opacity="0.8" />`;
      }
      return createTileSymbolMarkup(c.id, w, h, 4, c, extra);
    }).join('\n');
  },
  drawObject: (cx, cy, level, count, w, h) => {
    // 💡 SOLVED THE OVERCROWDED skyline:
    // Level 0 and 1 render NO buildings anymore, creating open city plazas/solar grids.
    if (level <= 1) return '';

    const heightFactor = Math.min(1 + (count - 1) * 0.08, 2.2);

    if (level === 2) {
      // Level 2: Small, slim skyscraper. Much narrower (X/Y: -0.15 to 0.15 instead of 0.25)
      const bH = 38 * heightFactor;
      let svg = drawIsoBox(cx, cy, w, h, -0.15, 0.15, -0.15, 0.15, bH, { top: 'url(#cyber-glass)', left: '#0e111d', right: '#080a11' });
      
      // Neon top trim
      const p1 = project(cx, cy, w, h, -0.15, 0.15, bH);
      const p2 = project(cx, cy, w, h, 0.15, 0.15, bH);
      const p3 = project(cx, cy, w, h, 0.15, -0.15, bH);
      svg += `
        <path d="M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y}" stroke="#00f0ff" stroke-width="1.5" fill="none" filter="url(#neon-glow)" />
      `;
      return svg;
    }

    if (level === 3) {
      // Level 3: Medium double-deck skyscraper (X/Y: -0.17 to 0.17)
      const bH = 70 * heightFactor;
      let svg = drawIsoBox(cx, cy, w, h, -0.17, 0.17, -0.17, 0.17, bH, { top: '#0f1322', left: '#0a0d17', right: '#05070e' });

      // Small upper core tower (recessed)
      const topH = bH + 15;
      svg += drawIsoBox(cx, cy, w, h, -0.1, 0.1, -0.1, 0.1, topH, { top: 'url(#cyber-glass)', left: '#0e111d', right: '#090b14' });

      // Neon billboard on left wall
      const p1 = project(cx, cy, w, h, -0.17, -0.05, bH * 0.2);
      const p2 = project(cx, cy, w, h, -0.17, 0.12, bH * 0.2);
      const p3 = project(cx, cy, w, h, -0.17, 0.12, bH * 0.65);
      const p4 = project(cx, cy, w, h, -0.17, -0.05, bH * 0.65);
      svg += `
        <path d="M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${p4.x},${p4.y} Z" fill="#ff007f" filter="url(#neon-glow)" opacity="0.85" />
      `;
      return svg;
    }

    // Level 4: Megacorp tower (X/Y: -0.22 to 0.22)
    const bH = 110 * heightFactor;
    let svg = drawIsoBox(cx, cy, w, h, -0.22, 0.22, -0.22, 0.22, bH, { top: 'url(#cyber-glass)', left: '#090a12', right: '#04050a' });

    // Cyber antenna / Spire on top
    const pSpireBase = project(cx, cy, w, h, 0, 0, bH);
    const pSpireTip = project(cx, cy, w, h, 0, 0, bH + 28);
    svg += `
      <line x1="${pSpireBase.x}" y1="${pSpireBase.y}" x2="${pSpireTip.x}" y2="${pSpireTip.y}" stroke="#00f0ff" stroke-width="2" filter="url(#neon-glow)" />
      <circle cx="${pSpireTip.x}" cy="${pSpireTip.y}" r="2" fill="#ffffff" filter="url(#neon-glow)" />
    `;

    // Giant floating hologram diamond above
    const holCenter = project(cx, cy, w, h, 0, 0, bH + 50);
    svg += `
      <polygon points="${pSpireBase.x},${pSpireBase.y} ${holCenter.x - 12},${holCenter.y} ${holCenter.x + 12},${holCenter.y}" 
               fill="url(#hollow-beam)" />
      <polygon points="${holCenter.x},${holCenter.y - 12} ${holCenter.x + 10},${holCenter.y} ${holCenter.x},${holCenter.y + 12} ${holCenter.x - 10},${holCenter.y}" 
               fill="#ff007f" fill-opacity="0.3" stroke="#ff007f" stroke-width="1.5" filter="url(#neon-glow)" />
    `;

    // Neon glowing corners (vertical lines)
    const c1Base = project(cx, cy, w, h, 0.22, 0.22, 0);
    const c1Top = project(cx, cy, w, h, 0.22, 0.22, bH);
    svg += `
      <line x1="${c1Base.x}" y1="${c1Base.y}" x2="${c1Top.x}" y2="${c1Top.y}" stroke="#00f0ff" stroke-width="2" filter="url(#neon-glow)" />
    `;

    // Searchlight beam
    const beamTip = { x: cx + 50, y: cy - bH - 150 };
    svg += `
      <polygon points="${pSpireBase.x},${pSpireBase.y} ${beamTip.x - 25},${beamTip.y} ${beamTip.x + 25},${beamTip.y}" 
               fill="url(#hollow-beam)" opacity="0.3" />
    `;

    return svg;
  },
};

const THEMES: Record<string, ThemeConfig> = {
  forest: ForestTheme,
  highway: HighwayTheme,
  cyberpunk: CyberpunkTheme,
};

/**
 * Main rendering function to build the entire SVG from the contribution grid.
 */
export function renderSVG(activity: ActivityGrid, themeName: string, username: string, bgMode: string = 'light'): string {
  const theme = THEMES[themeName.toLowerCase()] || ForestTheme;
  const colors = theme.getColors(bgMode);
  
  // Dimensions
  const tileWidth = 48;
  const tileHeight = 24;
  
  // Grid size
  const weeks = activity.length;
  if (weeks === 0) return '';
  const daysPerWeek = 7;

  const minX = -6 * (tileWidth / 2);
  const maxX = (weeks - 1) * (tileWidth / 2);
  const maxY = (weeks - 1 + (daysPerWeek - 1)) * (tileHeight / 2);

  const paddingX = 70;
  const paddingY = 80;
  const maxBuildingHeight = 180;

  const offsetX = Math.abs(minX) + paddingX;
  const offsetY = maxBuildingHeight + paddingY;

  const svgWidth = maxX - minX + tileWidth + paddingX * 2;
  const svgHeight = maxY + tileHeight + maxBuildingHeight + paddingY * 2;

  // Compute total contributions
  let totalContributions = 0;
  for (const week of activity) {
    for (const day of week) {
      totalContributions += day.count;
    }
  }

  // Build the SVG code
  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${svgWidth} ${svgHeight}" 
     width="${svgWidth}" 
     height="${svgHeight}">
  <style>
    .title {
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 26px;
      font-weight: 800;
      fill: ${colors.titleColor};
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      font-weight: 500;
      fill: ${colors.textColor};
    }
    .legend-text {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      font-weight: 500;
      fill: ${colors.textColor};
    }
  </style>

  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bgColor}" />
      <stop offset="100%" stop-color="${colors.gridColor}" />
    </linearGradient>
    ${theme.extraDefs || ''}
    
    <!-- Theme Tile Symbols -->
    ${theme.defineTileSymbols(tileWidth, tileHeight, bgMode)}
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg-gradient)" rx="16" />

  <!-- Header -->
  <g transform="translate(60, 65)">
    <text x="0" y="0" class="title">${username.toUpperCase()}'S GITHUB ACTIVITY</text>
    <text x="0" y="24" class="subtitle">Theme: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} • Total Contributions: ${totalContributions.toLocaleString()} in the last year</text>
  </g>
`;

  svg += '  <!-- Isometric Grid Tiles & Objects -->\n  <g>\n';
  
  // Phase 1: Draw Highway Side-Walls (If Highway Theme)
  // To draw the highway as a single solid block, we manually draw the concrete 3D sides on the outer edges.
  if (themeName.toLowerCase() === 'highway') {
    const roadDepth = 8;
    const concreteColorLeft = '#1e293b';
    const concreteColorRight = '#0f172a';
    
    // Draw the left border concrete wall (along y=6)
    for (let x = 0; x < weeks; x++) {
      const screenX = (x - 6) * (tileWidth / 2) + offsetX;
      const screenY = (x + 6) * (tileHeight / 2) + offsetY;
      
      const pLeft = `M ${screenX - tileWidth / 2},${screenY} L ${screenX},${screenY + tileHeight / 2} L ${screenX},${screenY + tileHeight / 2 + roadDepth} L ${screenX - tileWidth / 2},${screenY + roadDepth} Z`;
      svg += `    <path d="${pLeft}" fill="${concreteColorLeft}" />\n`;
    }

    // Draw the right border concrete wall (along x = weeks - 1)
    const lastX = weeks - 1;
    for (let y = 0; y < daysPerWeek; y++) {
      const screenX = (lastX - y) * (tileWidth / 2) + offsetX;
      const screenY = (lastX + y) * (tileHeight / 2) + offsetY;
      
      const pRight = `M ${screenX},${screenY + tileHeight / 2} L ${screenX + tileWidth / 2},${screenY} L ${screenX + tileWidth / 2},${screenY + roadDepth} L ${screenX},${screenY + tileHeight / 2 + roadDepth} Z`;
      svg += `    <path d="${pRight}" fill="${concreteColorRight}" />\n`;
    }
  }

  // Phase 2: Draw tile bases (all weeks/days)
  for (let x = 0; x < weeks; x++) {
    const week = activity[x];
    for (let y = 0; y < week.length; y++) {
      const day = week[y];
      
      const screenX = (x - y) * (tileWidth / 2) + offsetX;
      const screenY = (x + y) * (tileHeight / 2) + offsetY;

      // Stamp the tile base
      svg += `    <use href="#tile-${day.level}" x="${screenX}" y="${screenY}" />\n`;
      
      // Draw theme-specific extra tile details (dividers, guardrails)
      if (theme.drawExtraGridDetails) {
        svg += `    ${theme.drawExtraGridDetails(screenX, screenY, x, y, tileWidth, tileHeight, day.level, weeks)}\n`;
      }
    }
  }

  // Phase 3: Draw objects on top (all weeks/days)
  for (let x = 0; x < weeks; x++) {
    const week = activity[x];
    for (let y = 0; y < week.length; y++) {
      const day = week[y];
      
      const screenX = (x - y) * (tileWidth / 2) + offsetX;
      const screenY = (x + y) * (tileHeight / 2) + offsetY;

      // Draw the object on top (trees/cars/buildings)
      const objectMarkup = theme.drawObject(screenX, screenY, day.level, day.count, tileWidth, tileHeight, day.date);
      if (objectMarkup) {
        svg += `    ${objectMarkup}\n`;
      }
    }
  }

  svg += '  </g>\n';

  // Draw Legend in the bottom right corner
  const legendX = svgWidth - 360;
  const legendY = svgHeight - 55;

  svg += `
  <!-- Legend -->
  <g transform="translate(${legendX}, ${legendY})">
    <text x="0" y="8" class="legend-text" text-anchor="end">Less</text>
    
    <!-- Level 0 Tile -->
    <g transform="translate(10, 0)">
      <use href="#tile-0" x="10" y="0" />
    </g>
    
    <!-- Level 1 Tile -->
    <g transform="translate(45, 0)">
      <use href="#tile-1" x="10" y="0" />
      ${theme.drawObject(10, 0, 1, 2, tileWidth, tileHeight, '2026-01-01')}
    </g>
    
    <!-- Level 2 Tile -->
    <g transform="translate(80, 0)">
      <use href="#tile-2" x="10" y="0" />
      ${theme.drawObject(10, 0, 2, 5, tileWidth, tileHeight, '2026-01-02')}
    </g>
    
    <!-- Level 3 Tile -->
    <g transform="translate(115, 0)">
      <use href="#tile-3" x="10" y="0" />
      ${theme.drawObject(10, 0, 3, 10, tileWidth, tileHeight, '2026-01-03')}
    </g>
    
    <!-- Level 4 Tile -->
    <g transform="translate(150, 0)">
      <use href="#tile-4" x="10" y="0" />
      ${theme.drawObject(10, 0, 4, 25, tileWidth, tileHeight, '2026-01-04')}
    </g>

    <text x="195" y="8" class="legend-text">More</text>
  </g>
</svg>
`;

  return svg;
}
