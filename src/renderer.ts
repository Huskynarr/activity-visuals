import { ActivityGrid, ContributionDay } from './github.js';

interface ThemeConfig {
  bgColor: string;
  bgGradient: string;
  gridColor: string;
  textColor: string;
  titleColor: string;
  accentColor: string;
  defineTileSymbols: (w: number, h: number) => string;
  drawObject: (cx: number, cy: number, level: number, count: number, w: number, h: number) => string;
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
  bgColor: '#f8fafc',
  bgGradient: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
  gridColor: '#e2e8f0',
  textColor: '#475569',
  titleColor: '#0f172a',
  accentColor: '#10b981',
  extraDefs: `
    <linearGradient id="forest-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <radialGradient id="tree-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="trunk-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#654321" />
      <stop offset="50%" stop-color="#8B5A2B" />
      <stop offset="100%" stop-color="#4A3018" />
    </linearGradient>
    <radialGradient id="leaves-lvl2" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#a3b899" />
      <stop offset="70%" stop-color="#708765" />
      <stop offset="100%" stop-color="#4e6145" />
    </radialGradient>
    <radialGradient id="leaves-lvl3" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#6bb37b" />
      <stop offset="70%" stop-color="#418c52" />
      <stop offset="100%" stop-color="#2a6036" />
    </radialGradient>
    <radialGradient id="leaves-lvl4" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#2e8540" />
      <stop offset="70%" stop-color="#165225" />
      <stop offset="100%" stop-color="#0b2e13" />
    </radialGradient>
  `,
  defineTileSymbols: (w: number, h: number) => {
    const tileConfigs = [
      { id: 'tile-0', top: '#EED9B3', left: '#D6BE93', right: '#C8B085' },
      { id: 'tile-1', top: '#D2E3C8', left: '#B5C9A6', right: '#A2B792' },
      { id: 'tile-2', top: '#A9C394', left: '#8EAA77', right: '#7C9766' },
      { id: 'tile-3', top: '#75A47F', left: '#5B8A65', right: '#4D7A57' },
      { id: 'tile-4', top: '#4F6F52', left: '#3A533D', right: '#2F4331' },
    ];
    return tileConfigs.map(c => createTileSymbolMarkup(c.id, w, h, 6, c)).join('\n');
  },
  drawObject: (cx, cy, level, count, w, h) => {
    if (level === 0) {
      if (Math.sin(cx + cy) > 0.7) {
        return `
          <ellipse cx="${cx - 2}" cy="${cy + 1}" rx="4" ry="2" fill="url(#tree-shadow)" />
          <path d="M ${cx - 3},${cy} C ${cx - 3},${cy - 3} ${cx + 1},${cy - 4} ${cx + 2},${cy} C ${cx + 2},${cy + 2} ${cx - 1},${cy + 2} ${cx - 3},${cy} Z" fill="#94a3b8" />
          <path d="M ${cx - 2},${cy - 1} C ${cx - 2},${cy - 2} ${cx},${cy - 3} ${cx + 1},${cy - 1} Z" fill="#cbd5e1" />
        `;
      }
      return '';
    }

    const scale = Math.min(1 + (count - 1) * 0.08, 1.8);
    const shadowRadius = 8 * scale;

    let svg = `<ellipse cx="${cx}" cy="${cy + 2}" rx="${shadowRadius}" ry="${shadowRadius / 2}" fill="url(#tree-shadow)" />`;

    if (level === 1) {
      svg += `
        <path d="M ${cx - 1},${cy} L ${cx - 1},${cy - 10} L ${cx + 1},${cy - 10} L ${cx + 1},${cy} Z" fill="url(#trunk-grad)" />
        <path d="M ${cx},${cy - 10} C ${cx - 4},${cy - 14} ${cx - 5},${cy - 10} ${cx},${cy - 8} Z" fill="#84cc16" />
        <path d="M ${cx},${cy - 9} C ${cx + 4},${cy - 13} ${cx + 5},${cy - 9} ${cx},${cy - 7} Z" fill="#65a30d" />
      `;
    } else if (level === 2) {
      const tHeight = 14 * scale;
      const crownRadius = 9 * scale;
      const cyCrown = cy - tHeight;

      svg += drawIsoBox(cx, cy, w, h, -0.04, 0.04, -0.04, 0.04, tHeight, { top: '#6E473B', left: '#52342A', right: '#452B23' });
      svg += `<circle cx="${cx}" cy="${cyCrown}" r="${crownRadius}" fill="url(#leaves-lvl2)" />`;
    } else if (level === 3) {
      const trunkHeight = 12 * scale;
      const totalHeight = 35 * scale;
      const baseWidth = 14 * scale;

      svg += drawIsoBox(cx, cy, w, h, -0.05, 0.05, -0.05, 0.05, trunkHeight, { top: '#6E473B', left: '#52342A', right: '#452B23' });

      const layers = 3;
      for (let i = 0; i < layers; i++) {
        const factor = (layers - i) / layers;
        const width = baseWidth * factor;
        const bottom = cy - trunkHeight - i * (8 * scale);
        const top = bottom - (14 * scale);
        
        svg += `
          <path d="M ${cx - width},${bottom} L ${cx + width},${bottom} L ${cx},${top} Z" fill="url(#leaves-lvl3)" />
          <path d="M ${cx},${bottom} L ${cx + width},${bottom} L ${cx},${top} Z" fill="#1b5e20" opacity="0.15" />
        `;
      }
    } else {
      const trunkHeight = 20 * scale;
      const cyCrown = cy - trunkHeight;
      const cR = 14 * scale;
      
      svg += drawIsoBox(cx, cy, w, h, -0.07, 0.07, -0.07, 0.07, trunkHeight, { top: '#5A3D28', left: '#452E1D', right: '#372417' });
      svg += `
        <circle cx="${cx - 8 * scale}" cy="${cyCrown - 4 * scale}" r="${cR * 0.9}" fill="url(#leaves-lvl4)" />
        <circle cx="${cx + 8 * scale}" cy="${cyCrown - 2 * scale}" r="${cR * 0.9}" fill="url(#leaves-lvl4)" />
        <circle cx="${cx}" cy="${cyCrown - 12 * scale}" r="${cR * 1.1}" fill="url(#leaves-lvl4)" />
        <circle cx="${cx}" cy="${cyCrown}" r="${cR}" fill="url(#leaves-lvl4)" />
        <circle cx="${cx - 2 * scale}" cy="${cyCrown - 6 * scale}" r="${cR * 0.7}" fill="#4caf50" opacity="0.1" />
      `;
    }

    return svg;
  },
};

const HighwayTheme: ThemeConfig = {
  bgColor: '#0f172a',
  bgGradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  gridColor: '#1e293b',
  textColor: '#94a3b8',
  titleColor: '#f8fafc',
  accentColor: '#f59e0b',
  extraDefs: `
    <linearGradient id="car-body-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="car-body-red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f87171" />
      <stop offset="100%" stop-color="#b91c1c" />
    </linearGradient>
    <linearGradient id="car-body-blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="car-body-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>
    <radialGradient id="headlight-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#fef08a" stop-opacity="0" />
    </radialGradient>
  `,
  defineTileSymbols: (w: number, h: number) => {
    const tileConfigs = [
      { id: 'tile-0', top: '#2c3545', left: '#1b202c', right: '#11141c', level: 0 },
      { id: 'tile-1', top: '#3d4b5f', left: '#27303f', right: '#181e28', level: 1 },
      { id: 'tile-2', top: '#475569', left: '#334155', right: '#1e293b', level: 2 },
      { id: 'tile-3', top: '#475569', left: '#334155', right: '#1e293b', level: 3 },
      { id: 'tile-4', top: '#505f75', left: '#3c485a', right: '#27303c', level: 4 },
    ];

    return tileConfigs.map(c => {
      // Build tile base
      let extra = '';
      if (c.level > 0) {
        // White dashed center line
        const xStart = -w / 2;
        const xEnd = w / 2;
        extra = `<line x1="${xStart}" y1="0" x2="${xEnd}" y2="0" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6" />`;
      } else {
        // Draw cracks on abandoned level 0
        extra = `<path d="M ${-w*0.2},${-h*0.1} L ${w*0.1},${h*0.2} L ${w*0.3},${-h*0.3}" stroke="#181e28" stroke-width="1.2" fill="none" opacity="0.8" />`;
      }
      return createTileSymbolMarkup(c.id, w, h, 5, c, extra);
    }).join('\n');
  },
  drawObject: (cx, cy, level, count, w, h) => {
    const scale = Math.min(1 + (count - 1) * 0.05, 1.5);
    
    if (level === 0) {
      if (Math.sin(cx + cy) > 0.6) {
        let svg = drawIsoBox(cx, cy, w, h, -0.1, 0.1, -0.1, 0.1, 1, { top: '#ea580c', left: '#c2410c', right: '#9a3412' });
        const pPeak = project(cx, cy, w, h, 0, 0, 10);
        const pL = project(cx, cy, w, h, -0.06, 0.06, 1);
        const pR = project(cx, cy, w, h, 0.06, -0.06, 1);
        const pF = project(cx, cy, w, h, 0.06, 0.06, 1);
        
        svg += `
          <path d="M ${pL.x},${pL.y} L ${pPeak.x},${pPeak.y} L ${pF.x},${pF.y} Z" fill="#f97316" />
          <path d="M ${pF.x},${pF.y} L ${pPeak.x},${pPeak.y} L ${pR.x},${pR.y} Z" fill="#ea580c" />
          <path d="M ${cx - 2},${cy - 4} L ${cx + 2},${cy - 4} L ${cx},${cy - 7} Z" fill="#ffffff" />
        `;
        return svg;
      }
      return '';
    }

    if (level === 1) {
      const color = '#10b981'; 
      const base = drawIsoBox(cx, cy, w, h, -0.15, 0.15, -0.02, 0.02, 2, { top: color, left: '#047857', right: '#065f46' });
      const handlebar = project(cx, cy, w, h, 0.1, 0, 10);
      const handlebarBase = project(cx, cy, w, h, 0.1, 0, 2);
      const handlebarLeft = project(cx, cy, w, h, 0.1, -0.08, 10);
      const handlebarRight = project(cx, cy, w, h, 0.1, 0.08, 10);
      
      return `
        ${base}
        <line x1="${handlebarBase.x}" y1="${handlebarBase.y}" x2="${handlebar.x}" y2="${handlebar.y}" stroke="#1e293b" stroke-width="1.5" />
        <line x1="${handlebarLeft.x}" y1="${handlebarLeft.y}" x2="${handlebarRight.x}" y2="${handlebarRight.y}" stroke="#1e293b" stroke-width="1.5" />
      `;
    }

    if (level === 2) {
      const colors = ['yellow', 'red', 'blue', 'silver'];
      const colorIdx = Math.floor(Math.abs(Math.sin(cx * 17 + cy * 23) * colors.length));
      const color = colors[colorIdx];
      
      const bodyColor = `url(#car-body-${color})`;
      let svg = `<ellipse cx="${cx}" cy="${cy + 2}" rx="12" ry="6" fill="#0f172a" opacity="0.4" />`;
      
      svg += drawIsoBox(cx, cy, w, h, -0.3, 0.25, -0.12, 0.12, 5 * scale, { top: bodyColor, left: bodyColor, right: bodyColor });
      svg += drawIsoBox(cx, cy, w, h, -0.15, 0.12, -0.1, 0.1, 9 * scale, { top: bodyColor, left: '#1e293b', right: '#334155' });
      
      const headlightPt = project(cx, cy, w, h, 0.25, 0.06, 2.5 * scale);
      const headlightPt2 = project(cx, cy, w, h, 0.25, -0.06, 2.5 * scale);
      svg += `
        <circle cx="${headlightPt.x}" cy="${headlightPt.y}" r="1" fill="#fef08a" />
        <circle cx="${headlightPt2.x}" cy="${headlightPt2.y}" r="1" fill="#fef08a" />
      `;
      return svg;
    }

    if (level === 3) {
      const bodyColor = 'url(#car-body-blue)';
      let svg = `<ellipse cx="${cx}" cy="${cy + 2}" rx="14" ry="7" fill="#0f172a" opacity="0.4" />`;
      
      svg += drawIsoBox(cx, cy, w, h, -0.35, 0.3, -0.14, 0.14, 11 * scale, { top: bodyColor, left: bodyColor, right: bodyColor });
      svg += drawIsoBox(cx, cy, w, h, 0.12, 0.29, -0.12, 0.12, 10.5 * scale, { top: bodyColor, left: '#0f172a', right: '#1e293b' });
      
      const p1 = project(cx, cy, w, h, 0.29, -0.12, 8);
      const p2 = project(cx, cy, w, h, 0.29, 0.12, 8);
      const p3 = project(cx, cy, w, h, 0.18, 0.12, 10.5);
      const p4 = project(cx, cy, w, h, 0.18, -0.12, 10.5);
      svg += `
        <path d="M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${p4.x},${p4.y} Z" fill="#94a3b8" opacity="0.8" />
      `;
      return svg;
    }

    const truckCabin = 'url(#car-body-red)';
    const cargoContainer = 'url(#car-body-silver)';
    let svg = `<ellipse cx="${cx}" cy="${cy + 2}" rx="20" ry="9" fill="#0f172a" opacity="0.5" />`;

    svg += drawIsoBox(cx, cy, w, h, -0.45, 0.45, -0.16, 0.16, 3 * scale, { top: '#1e293b', left: '#0f172a', right: '#0f172a' });
    svg += drawIsoBox(cx, cy, w, h, -0.42, 0.12, -0.15, 0.15, 20 * scale, { top: cargoContainer, left: cargoContainer, right: cargoContainer });
    svg += drawIsoBox(cx, cy, w, h, 0.18, 0.42, -0.14, 0.14, 18 * scale, { top: truckCabin, left: truckCabin, right: truckCabin });

    const wp1 = project(cx, cy, w, h, 0.42, -0.12, 11 * scale);
    const wp2 = project(cx, cy, w, h, 0.42, 0.12, 11 * scale);
    const wp3 = project(cx, cy, w, h, 0.42, 0.12, 16 * scale);
    const wp4 = project(cx, cy, w, h, 0.42, -0.12, 16 * scale);
    svg += `
      <path d="M ${wp1.x},${wp1.y} L ${wp2.x},${wp2.y} L ${wp3.x},${wp3.y} L ${wp4.x},${wp4.y} Z" fill="#1e293b" />
    `;

    return svg;
  },
};

const CyberpunkTheme: ThemeConfig = {
  bgColor: '#080114',
  bgGradient: 'linear-gradient(135deg, #0b001a 0%, #17002c 50%, #080012 100%)',
  gridColor: '#1f003a',
  textColor: '#f472b6',
  titleColor: '#00f0ff',
  accentColor: '#d946ef',
  extraDefs: `
    <linearGradient id="cyber-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#050010" />
      <stop offset="60%" stop-color="#120024" />
      <stop offset="100%" stop-color="#020008" />
    </linearGradient>
    <linearGradient id="neon-cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f0ff" />
      <stop offset="100%" stop-color="#0077aa" />
    </linearGradient>
    <linearGradient id="neon-pink-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff007f" />
      <stop offset="100%" stop-color="#aa0055" />
    </linearGradient>
    <linearGradient id="cyber-glass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#121829" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0a0d18" stop-opacity="0.95" />
    </linearGradient>
    <linearGradient id="hollow-beam" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.3" />
      <stop offset="70%" stop-color="#ff007f" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#ff007f" stop-opacity="0" />
    </linearGradient>
    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `,
  defineTileSymbols: (w: number, h: number) => {
    const tileConfigs = [
      { id: 'tile-0', top: '#080710', left: '#05040A', right: '#030206', neonColor: '' },
      { id: 'tile-1', top: '#12002c', left: '#0a001a', right: '#05000d', neonColor: '#50006c' },
      { id: 'tile-2', top: '#17003c', left: '#0d0024', right: '#070014', neonColor: '#005f73' },
      { id: 'tile-3', top: '#1d004c', left: '#120032', right: '#09001b', neonColor: '#ff007f' },
      { id: 'tile-4', top: '#24005d', left: '#17003d', right: '#0b001e', neonColor: '#00f0ff' },
    ];

    return tileConfigs.map(c => {
      let extra = '';
      if (c.neonColor) {
        const topPath = `M 0,${-h / 2} L ${w / 2},0 L 0,${h / 2} L ${-w / 2},0 Z`;
        extra = `<path d="${topPath}" stroke="${c.neonColor}" stroke-width="1.2" fill="none" opacity="0.8" />`;
      }
      return createTileSymbolMarkup(c.id, w, h, 4, c, extra);
    }).join('\n');
  },
  drawObject: (cx, cy, level, count, w, h) => {
    const heightFactor = Math.min(1 + (count - 1) * 0.08, 2.2);

    if (level === 0) {
      if (Math.sin(cx - cy) > 0.5) {
        let svg = drawIsoBox(cx, cy, w, h, -0.25, 0.25, -0.25, 0.25, 10, { top: '#231d28', left: '#151119', right: '#0f0c12' });
        const pLight = project(cx, cy, w, h, 0, 0, 10.5);
        svg += `<circle cx="${pLight.x}" cy="${pLight.y}" r="1.5" fill="#ef4444" />`;
        return svg;
      }
      return '';
    }

    let svg = '';

    if (level === 1) {
      const bH = 30 * heightFactor;
      svg += drawIsoBox(cx, cy, w, h, -0.2, 0.2, -0.2, 0.2, bH, { top: '#1c1f30', left: '#0e101b', right: '#080911' });
      
      const pAntennaBase = project(cx, cy, w, h, 0, 0, bH);
      const pAntennaTip = project(cx, cy, w, h, 0, 0, bH + 12);
      svg += `
        <line x1="${pAntennaBase.x}" y1="${pAntennaBase.y}" x2="${pAntennaTip.x}" y2="${pAntennaTip.y}" stroke="#ff007f" stroke-width="1" />
        <circle cx="${pAntennaTip.x}" cy="${pAntennaTip.y}" r="1.5" fill="#ff007f" filter="url(#neon-glow)" />
      `;
    } else if (level === 2) {
      const bH = 50 * heightFactor;
      svg += drawIsoBox(cx, cy, w, h, -0.25, 0.25, -0.25, 0.25, bH, { top: 'url(#cyber-glass)', left: '#111524', right: '#0b0c16' });
      
      const p1 = project(cx, cy, w, h, 0.25, -0.15, bH * 0.3);
      const p2 = project(cx, cy, w, h, 0.25, 0.15, bH * 0.3);
      const p3 = project(cx, cy, w, h, 0.25, 0.15, bH * 0.7);
      const p4 = project(cx, cy, w, h, 0.25, -0.15, bH * 0.7);
      svg += `
        <path d="M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${p4.x},${p4.y} Z" 
              fill="#00f0ff" filter="url(#neon-glow)" opacity="0.8" />
        <line x1="${(p1.x + p2.x)/2}" y1="${(p1.y + p2.y)/2}" x2="${(p3.x + p4.x)/2}" y2="${(p3.y + p4.y)/2}" 
              stroke="#ffffff" stroke-width="1.5" opacity="0.9" />
      `;
    } else if (level === 3) {
      const t1H = 35 * heightFactor;
      const t2H = 75 * heightFactor;
      
      svg += drawIsoBox(cx, cy, w, h, -0.3, 0.3, -0.3, 0.3, t1H, { top: '#0f172a', left: '#0a0f1d', right: '#05070e' });
      svg += drawIsoBox(cx, cy, w, h, -0.2, 0.2, -0.2, 0.2, t2H, { top: 'url(#cyber-glass)', left: '#0e111d', right: '#090b14' });

      const cornerBase = project(cx, cy, w, h, 0.2, 0.2, t1H);
      const cornerTop = project(cx, cy, w, h, 0.2, 0.2, t2H);
      svg += `
        <line x1="${cornerBase.x}" y1="${cornerBase.y}" x2="${cornerTop.x}" y2="${cornerTop.y}" 
              stroke="#ff007f" stroke-width="1.5" filter="url(#neon-glow)" />
      `;
    } else {
      const bH = 110 * heightFactor;
      const topHeight = bH;

      svg += drawIsoBox(cx, cy, w, h, -0.35, 0.35, -0.35, 0.35, bH, { top: 'url(#cyber-glass)', left: '#0f111a', right: '#080911' });

      const c1Base = project(cx, cy, w, h, 0.35, 0.35, 0);
      const c1Top = project(cx, cy, w, h, 0.35, 0.35, topHeight);
      const c2Base = project(cx, cy, w, h, -0.35, 0.35, 0);
      const c2Top = project(cx, cy, w, h, -0.35, 0.35, topHeight);
      
      svg += `
        <line x1="${c1Base.x}" y1="${c1Base.y}" x2="${c1Top.x}" y2="${c1Top.y}" stroke="#00f0ff" stroke-width="2" filter="url(#neon-glow)" />
        <line x1="${c2Base.x}" y1="${c2Base.y}" x2="${c2Top.x}" y2="${c2Top.y}" stroke="#00f0ff" stroke-width="2" filter="url(#neon-glow)" />
      `;

      const holCenter = project(cx, cy, w, h, 0, 0, topHeight + 25);
      svg += `
        <polygon points="${cx},${cy - topHeight} ${holCenter.x - 12},${holCenter.y} ${holCenter.x + 12},${holCenter.y}" 
                 fill="url(#hollow-beam)" />
        <polygon points="${holCenter.x},${holCenter.y - 12} ${holCenter.x + 10},${holCenter.y} ${holCenter.x},${holCenter.y + 12} ${holCenter.x - 10},${holCenter.y}" 
                 fill="#ff007f" fill-opacity="0.4" stroke="#ff007f" stroke-width="1.5" filter="url(#neon-glow)" />
        <circle cx="${holCenter.x}" cy="${holCenter.y}" r="3" fill="#00f0ff" filter="url(#neon-glow)" />
      `;

      const beamL_Tip = { x: cx - 60, y: cy - topHeight - 160 };
      const beamR_Tip = { x: cx + 60, y: cy - topHeight - 160 };
      svg += `
        <polygon points="${cx},${cy - topHeight} ${beamL_Tip.x - 20},${beamL_Tip.y} ${beamL_Tip.x + 20},${beamL_Tip.y}" 
                 fill="url(#hollow-beam)" opacity="0.3" />
        <polygon points="${cx},${cy - topHeight} ${beamR_Tip.x - 20},${beamR_Tip.y} ${beamR_Tip.x + 20},${beamR_Tip.y}" 
                 fill="url(#hollow-beam)" opacity="0.3" />
      `;
    }

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
export function renderSVG(activity: ActivityGrid, themeName: string, username: string): string {
  const theme = THEMES[themeName.toLowerCase()] || ForestTheme;
  
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
      fill: ${theme.titleColor};
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      font-weight: 500;
      fill: ${theme.textColor};
    }
    .legend-text {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      font-weight: 500;
      fill: ${theme.textColor};
    }
  </style>

  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgColor}" />
      <stop offset="100%" stop-color="${theme.gridColor}" />
    </linearGradient>
    ${theme.extraDefs || ''}
    
    <!-- Theme Tile Symbols (reusable templates) -->
    ${theme.defineTileSymbols(tileWidth, tileHeight)}
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
  
  // Phase 1: Draw tile bases (all weeks/days)
  for (let x = 0; x < weeks; x++) {
    const week = activity[x];
    for (let y = 0; y < week.length; y++) {
      const day = week[y];
      
      const screenX = (x - y) * (tileWidth / 2) + offsetX;
      const screenY = (x + y) * (tileHeight / 2) + offsetY;

      // Instead of drawing inline paths, we stamp the defined symbol
      svg += `    <use href="#tile-${day.level}" x="${screenX}" y="${screenY}" />\n`;
    }
  }

  // Phase 2: Draw objects (all weeks/days)
  for (let x = 0; x < weeks; x++) {
    const week = activity[x];
    for (let y = 0; y < week.length; y++) {
      const day = week[y];
      
      const screenX = (x - y) * (tileWidth / 2) + offsetX;
      const screenY = (x + y) * (tileHeight / 2) + offsetY;

      // Draw the object on top
      const objectMarkup = theme.drawObject(screenX, screenY, day.level, day.count, tileWidth, tileHeight);
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
      ${theme.drawObject(10, 0, 1, 2, tileWidth, tileHeight)}
    </g>
    
    <!-- Level 2 Tile -->
    <g transform="translate(80, 0)">
      <use href="#tile-2" x="10" y="0" />
      ${theme.drawObject(10, 0, 2, 5, tileWidth, tileHeight)}
    </g>
    
    <!-- Level 3 Tile -->
    <g transform="translate(115, 0)">
      <use href="#tile-3" x="10" y="0" />
      ${theme.drawObject(10, 0, 3, 10, tileWidth, tileHeight)}
    </g>
    
    <!-- Level 4 Tile -->
    <g transform="translate(150, 0)">
      <use href="#tile-4" x="10" y="0" />
      ${theme.drawObject(10, 0, 4, 25, tileWidth, tileHeight)}
    </g>

    <text x="195" y="8" class="legend-text">More</text>
  </g>
</svg>
`;

  return svg;
}
