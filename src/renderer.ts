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
  drawObject: (cx: number, cy: number, level: number, count: number, w: number, h: number, date: string, y: number) => string;
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
    const isDark = bgMode === 'dark';
    
    const tileConfigs = isDark ? [
      { id: 'tile-0', top: '#1c1b18', left: '#141311', right: '#0f0e0c' },
      { id: 'tile-1', top: '#202d24', left: '#162019', right: '#111813' },
      { id: 'tile-2', top: '#223c28', left: '#172a1b', right: '#101e13' },
      { id: 'tile-3', top: '#1b4d24', left: '#123518', right: '#0d2711' },
      { id: 'tile-4', top: '#113f1b', left: '#0a2a11', right: '#061d0b' },
    ] : [
      { id: 'tile-0', top: '#EED9B3', left: '#D6BE93', right: '#C8B085' },
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

    const dateHash = date.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const role = dateHash % 3;

    const scale = Math.min(1 + (count - 1) * 0.08, 1.8);
    const shadowRadius = (role === 1 ? 12 : 8) * scale;
    let svg = `<ellipse cx="${cx}" cy="${cy + 2}" rx="${shadowRadius}" ry="${shadowRadius / 2}" fill="url(#tree-shadow)" />`;

    if (role === 0) {
      const trunkHeight = 10 * scale;
      const layers = level === 1 ? 1 : level <= 3 ? 2 : 3;
      const baseWidth = (level === 1 ? 8 : level <= 3 ? 12 : 15) * scale;

      svg += drawIsoBox(cx, cy, w, h, -0.04, 0.04, -0.04, 0.04, trunkHeight, { top: '#4E3629', left: '#3D2A20', right: '#2C1E17' });

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
      const trunkHeight = (level === 1 ? 18 : level === 2 ? 28 : level === 3 ? 38 : 50) * scale;
      const trunkWidth = (level <= 2 ? 0.08 : 0.12);
      
      svg += drawIsoBox(cx, cy, w, h, -trunkWidth, trunkWidth, -trunkWidth, trunkWidth, trunkHeight, { 
        top: '#8C4F35', 
        left: 'url(#redwood-trunk)', 
        right: '#5D3320' 
      });

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
      if (level === 1) {
        svg += `<circle cx="${cx}" cy="${cy - 6}" r="${5 * scale}" fill="url(#leaves-lvl2)" />`;
      } else {
        const trunkHeight = (level === 2 ? 12 : level === 3 ? 16 : 22) * scale;
        const cyCrown = cy - trunkHeight;
        const cR = (level === 2 ? 9 : level === 3 ? 12 : 15) * scale;

        svg += drawIsoBox(cx, cy, w, h, -0.05, 0.05, -0.05, 0.05, trunkHeight, { top: '#5A3D28', left: '#452E1D', right: '#372417' });
        
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
    const tileConfigs = [
      { id: 'tile-0', top: '#1c222e' },
      { id: 'tile-1', top: '#272f3d' },
      { id: 'tile-2', top: '#2b3545' },
      { id: 'tile-3', top: '#333e50' },
      { id: 'tile-4', top: '#3b475c' },
    ];

    return tileConfigs.map(c => {
      const topPath = `M 0,${-h / 2} L ${w / 2},0 L 0,${h / 2} L ${-w / 2},0 Z`;
      return `
        <g id="${c.id}">
          <path d="${topPath}" fill="${c.top}" />
        </g>
      `;
    }).join('\n');
  },
  drawObject: (cx, cy, level, count, w, h, date, y) => {
    if (level === 0) return '';

    const scale = Math.min(1 + (count - 1) * 0.05, 1.4);
    const isShoulder = y === 0 || y === 6;
    const shiftOffset = isShoulder ? (y === 0 ? -0.16 : 0.16) : 0;
    
    const dx = -shiftOffset * (w / 2);
    const dy = shiftOffset * (h / 2);

    let vehicleSvg = '';

    if (level === 1) {
      const color = isShoulder ? '#ef4444' : '#10b981';
      const base = drawIsoBox(cx, cy, w, h, -0.15, 0.15, -0.02, 0.02, 2, { top: color, left: '#991b1b', right: '#7f1d1d' });
      const handlebar = project(cx, cy, w, h, 0.1, 0, 9);
      const handlebarBase = project(cx, cy, w, h, 0.1, 0, 2);
      vehicleSvg += `
        ${base}
        <line x1="${handlebarBase.x}" y1="${handlebarBase.y}" x2="${handlebar.x}" y2="${handlebar.y}" stroke="#cbd5e1" stroke-width="1.5" />
        <circle cx="${handlebar.x}" cy="${handlebar.y}" r="1" fill="#fef08a" />
      `;
    } else if (level === 2) {
      const colors = ['yellow', 'red', 'blue', 'silver'];
      const colorIdx = Math.floor(Math.abs(Math.sin(cx * 7 + cy * 13) * colors.length));
      const color = colors[colorIdx];
      const bodyColor = `url(#car-body-${color})`;
      
      let car = `<ellipse cx="${cx}" cy="${cy + 1}" rx="11" ry="5.5" fill="#020617" opacity="0.45" />`;
      car += drawIsoBox(cx, cy, w, h, -0.28, 0.22, -0.1, 0.1, 4.5 * scale, { top: bodyColor, left: bodyColor, right: bodyColor });
      car += drawIsoBox(cx, cy, w, h, -0.14, 0.1, -0.08, 0.08, 8 * scale, { top: bodyColor, left: '#0f172a', right: '#1e293b' });
      
      const hl1 = project(cx, cy, w, h, 0.22, 0.05, 2 * scale);
      const hl2 = project(cx, cy, w, h, 0.22, -0.05, 2 * scale);
      car += `
        <circle cx="${hl1.x}" cy="${hl1.y}" r="0.8" fill="#fef08a" />
        <circle cx="${hl2.x}" cy="${hl2.y}" r="0.8" fill="#fef08a" />
      `;
      vehicleSvg += car;
    } else if (level === 3) {
      const bodyColor = 'url(#car-body-blue)';
      let van = `<ellipse cx="${cx}" cy="${cy + 1}" rx="13" ry="6.5" fill="#020617" opacity="0.45" />`;
      van += drawIsoBox(cx, cy, w, h, -0.32, 0.28, -0.12, 0.12, 10 * scale, { top: bodyColor, left: bodyColor, right: bodyColor });
      van += drawIsoBox(cx, cy, w, h, 0.1, 0.26, -0.11, 0.11, 9.5 * scale, { top: bodyColor, left: '#020617', right: '#0f172a' });
      vehicleSvg += van;
    } else {
      const cabinColor = 'url(#car-body-red)';
      const trailerColor = 'url(#car-body-silver)';
      let truck = `<ellipse cx="${cx}" cy="${cy + 1}" rx="18" ry="9" fill="#020617" opacity="0.5" />`;
      truck += drawIsoBox(cx, cy, w, h, -0.4, 0.1, -0.14, 0.14, 20 * scale, { top: trailerColor, left: trailerColor, right: trailerColor });
      truck += drawIsoBox(cx, cy, w, h, 0.18, 0.42, -0.13, 0.13, 17 * scale, { top: cabinColor, left: cabinColor, right: cabinColor });
      
      const wp1 = project(cx, cy, w, h, 0.42, -0.11, 10 * scale);
      const wp2 = project(cx, cy, w, h, 0.42, 0.11, 10 * scale);
      const wp3 = project(cx, cy, w, h, 0.42, 0.11, 15 * scale);
      const wp4 = project(cx, cy, w, h, 0.42, -0.11, 15 * scale);
      truck += `<path d="M ${wp1.x},${wp1.y} L ${wp2.x},${wp2.y} L ${wp3.x},${wp3.y} L ${wp4.x},${wp4.y} Z" fill="#020617" />`;
      vehicleSvg += truck;
    }

    let finalSvg = '';

    if (isShoulder) {
      finalSvg += `<g transform="translate(${dx}, ${dy})">${vehicleSvg}</g>`;

      const blinkerL = project(cx + dx, cy + dy, w, h, -0.28, -0.1, 4 * scale);
      const blinkerR = project(cx + dx, cy + dy, w, h, -0.28, 0.1, 4 * scale);
      finalSvg += `
        <circle cx="${blinkerL.x}" cy="${blinkerL.y}" r="1.5" fill="#f59e0b" opacity="0.85" />
        <circle cx="${blinkerR.x}" cy="${blinkerR.y}" r="1.5" fill="#f59e0b" opacity="0.85" />
      `;

      const pTriangle = project(cx + dx, cy + dy, w, h, -0.48, 0, 0);
      finalSvg += `
        <polygon points="${pTriangle.x},${pTriangle.y - 6} ${pTriangle.x - 3.5},${pTriangle.y} ${pTriangle.x + 3.5},${pTriangle.y}" 
                 fill="#ef4444" stroke="#ffffff" stroke-width="0.6" />
        <circle cx="${pTriangle.x}" cy="${pTriangle.y - 2}" r="0.8" fill="#ffffff" />
      `;
    } else {
      finalSvg += vehicleSvg;
    }

    return finalSvg;
  },
  drawExtraGridDetails: (cx, cy, x, y, w, h, level, weeks) => {
    let extra = '';

    if (y < 6) {
      const pStart = project(cx, cy, w, h, -0.5, 0.5, 0);
      const pEnd = project(cx, cy, w, h, 0.5, 0.5, 0);
      
      if (y === 0 || y === 5) {
        extra += `
          <line x1="${pStart.x}" y1="${pStart.y}" x2="${pEnd.x}" y2="${pEnd.y}" 
                stroke="#ffffff" stroke-width="1.8" opacity="0.9" />
        `;
      } else {
        extra += `
          <line x1="${pStart.x}" y1="${pStart.y}" x2="${pEnd.x}" y2="${pEnd.y}" 
                stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,4" opacity="0.7" />
        `;
      }
    }

    if (y === 0) {
      const pStart = project(cx, cy, w, h, -0.5, -0.5, 0);
      const pEnd = project(cx, cy, w, h, 0.5, -0.5, 0);
      
      extra += `
        <line x1="${pStart.x}" y1="${pStart.y}" x2="${pStart.x}" y2="${pStart.y - 7}" stroke="#475569" stroke-width="1.5" />
        <line x1="${(pStart.x + pEnd.x)/2}" y1="${(pStart.y + pEnd.y)/2}" x2="${(pStart.x + pEnd.x)/2}" y2="${(pStart.y + pEnd.y)/2 - 7}" stroke="#475569" stroke-width="1.5" />
        <line x1="${pStart.x}" y1="${pStart.y - 5}" x2="${pEnd.x}" y2="${pEnd.y - 5}" stroke="url(#guardrail-grad)" stroke-width="2.5" />
      `;
    }
    
    if (y === 6) {
      const pStart = project(cx, cy, w, h, -0.5, 0.5, 0);
      const pEnd = project(cx, cy, w, h, 0.5, 0.5, 0);
      
      extra += `
        <line x1="${pStart.x}" y1="${pStart.y}" x2="${pStart.x}" y2="${pStart.y - 7}" stroke="#475569" stroke-width="1.5" />
        <line x1="${(pStart.x + pEnd.x)/2}" y1="${(pStart.y + pEnd.y)/2}" x2="${(pStart.x + pEnd.x)/2}" y2="${(pStart.y + pEnd.y)/2 - 7}" stroke="#475569" stroke-width="1.5" />
        <line x1="${pStart.x}" y1="${pStart.y - 5}" x2="${pEnd.x}" y2="${pEnd.y - 5}" stroke="url(#guardrail-grad)" stroke-width="2.5" />
      `;
    }

    return extra;
  },
};

const IslandTheme: ThemeConfig = {
  getColors: (bgMode) => {
    if (bgMode === 'dark') {
      return {
        bgColor: '#082f49', // sky-900
        bgGradient: 'linear-gradient(135deg, #075985 0%, #0c4a6e 50%, #082f49 100%)',
        gridColor: '#0c4a6e',
        textColor: '#7dd3fc',
        titleColor: '#f0f9ff',
        accentColor: '#38bdf8',
      };
    }
    return {
      bgColor: '#e0f2fe', // sky-100
      bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%)',
      gridColor: '#bae6fd',
      textColor: '#0369a1',
      titleColor: '#0c4a6e',
      accentColor: '#0ea5e9',
    };
  },
  extraDefs: `
    <radialGradient id="island-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="island-shadow-dark" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0c4a6e" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0c4a6e" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="lighthouse-red" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="50%" stop-color="#f87171" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
    <linearGradient id="lighthouse-white" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f1f5f9" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <linearGradient id="beam-light" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.35" />
      <stop offset="80%" stop-color="#fef08a" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#fef08a" stop-opacity="0" />
    </linearGradient>
  `,
  defineTileSymbols: (w: number, h: number, bgMode: string) => {
    const isDark = bgMode === 'dark';
    
    // Level 0 is crystal clear water (takes no vertical space / thin floor)
    // Level 1-4 are sandy islands (getting greener/richer)
    const tileConfigs = isDark ? [
      { id: 'tile-0', top: '#0369a1', left: '#025a8b', right: '#014c77', d: 3 }, // deep water
      { id: 'tile-1', top: '#ca8a04', left: '#a16207', right: '#854d0e', d: 5 }, // sand bank
      { id: 'tile-2', top: '#15803d', left: '#a16207', right: '#854d0e', d: 6 }, // grass on sand base
      { id: 'tile-3', top: '#166534', left: '#854d0e', right: '#713f12', d: 7 },
      { id: 'tile-4', top: '#14532d', left: '#713f12', right: '#5c310c', d: 8 },
    ] : [
      { id: 'tile-0', top: '#0284c7', left: '#0274af', right: '#016497', d: 3 }, // tropical water
      { id: 'tile-1', top: '#fef08a', left: '#eab308', right: '#ca8a04', d: 5 }, // sandy shoal
      { id: 'tile-2', top: '#86efac', left: '#eab308', right: '#ca8a04', d: 6 }, // sandy island with green top
      { id: 'tile-3', top: '#4ade80', left: '#ca8a04', right: '#a16207', d: 7 },
      { id: 'tile-4', top: '#22c55e', left: '#a16207', right: '#854d0e', d: 8 },
    ];

    return tileConfigs.map(c => {
      // For level 2, 3, 4 we draw a beautiful sand rim on top
      let extra = '';
      if (c.id !== 'tile-0' && c.id !== 'tile-1') {
        const sandColor = isDark ? '#ca8a04' : '#fef08a';
        // Inner smaller grass ring to simulate beach border
        const sW = w * 0.85;
        const sH = h * 0.85;
        const topPathInner = `M 0,${-sH / 2} L ${sW / 2},0 L 0,${sH / 2} L ${-sW / 2},0 Z`;
        
        // Draw the base tile, but overwrite the top with sand first, then draw the grass inside
        const topPathBase = `M 0,${-h / 2} L ${w / 2},0 L 0,${h / 2} L ${-w / 2},0 Z`;
        return `
          <g id="${c.id}">
            <path d="M ${-w / 2},0 L 0,${h / 2} L 0,${h / 2 + c.d} L ${-w / 2},${c.d} Z" fill="${c.left}" />
            <path d="M 0,${h / 2} L ${w / 2},0 L ${w / 2},${c.d} L 0,${h / 2 + c.d} Z" fill="${c.right}" />
            <path d="${topPathBase}" fill="${sandColor}" />
            <path d="${topPathInner}" fill="${c.top}" />
          </g>
        `;
      }
      return createTileSymbolMarkup(c.id, w, h, c.d, c);
    }).join('\n');
  },
  drawObject: (cx, cy, level, count, w, h, date, y) => {
    // Level 0: Pure water, render simple sea waves occasionally
    if (level === 0) {
      if (Math.sin(cx * 1.7 + cy * 1.1) > 0.8) {
        const p1 = project(cx, cy, w, h, -0.2, -0.1, 0);
        const p2 = project(cx, cy, w, h, 0.1, 0.1, 0);
        return `
          <path d="M ${p1.x},${p1.y} C ${p1.x + 3},${p1.y - 2} ${p1.x + 6},${p1.y - 2} ${p1.x + 9},${p1.y} M ${p2.x},${p2.y} C ${p2.x + 3},${p2.y - 2} ${p2.x + 6},${p2.y - 2} ${p2.x + 9},${p2.y}" 
                stroke="#ffffff" stroke-width="1.0" fill="none" opacity="0.4" />
        `;
      }
      return '';
    }

    const scale = Math.min(1 + (count - 1) * 0.07, 1.6);
    let svg = '';
    
    // helper to draw a tiny palm tree
    const drawPalm = (px: number, py: number, pScale: number) => {
      const stemH = 15 * pScale;
      // Curved stem path
      const pBase = { x: px, y: py };
      const pMid = { x: px - 3 * pScale, y: py - stemH * 0.5 };
      const pTip = { x: px - 5 * pScale, y: py - stemH };

      let palm = `
        <!-- Trunk -->
        <path d="M ${pBase.x - 1},${pBase.y} Q ${pMid.x},${pMid.y} ${pTip.x},${pTip.y} L ${pTip.x + 1},${pTip.y} Q ${pMid.x + 1},${pMid.y} ${pBase.x + 1},${pBase.y} Z" fill="#854d0e" />
        <!-- Leaves -->
        <g stroke="#166534" stroke-width="1.2" fill="none">
          <path d="M ${pTip.x},${pTip.y} Q ${pTip.x - 8 * pScale},${pTip.y + 2 * pScale} ${pTip.x - 10 * pScale},${pTip.y + 6 * pScale}" />
          <path d="M ${pTip.x},${pTip.y} Q ${pTip.x + 8 * pScale},${pTip.y + 2 * pScale} ${pTip.x + 10 * pScale},${pTip.y + 6 * pScale}" />
          <path d="M ${pTip.x},${pTip.y} Q ${pTip.x - 4 * pScale},${pTip.y - 6 * pScale} ${pTip.x - 6 * pScale},${pTip.y - 10 * pScale}" fill="#22c55e" fill-opacity="0.1" />
          <path d="M ${pTip.x},${pTip.y} Q ${pTip.x + 4 * pScale},${pTip.y - 6 * pScale} ${pTip.x + 6 * pScale},${pTip.y - 10 * pScale}" fill="#22c55e" fill-opacity="0.1" />
          <path d="M ${pTip.x},${pTip.y} Q ${pTip.x - 9 * pScale},${pTip.y - 2 * pScale} ${pTip.x - 12 * pScale},${pTip.y - 4 * pScale}" />
          <path d="M ${pTip.x},${pTip.y} Q ${pTip.x + 9 * pScale},${pTip.y - 2 * pScale} ${pTip.x + 12 * pScale},${pTip.y - 4 * pScale}" />
        </g>
      `;
      return palm;
    };

    if (level === 1) {
      // Level 1: Tiny sandbar with starfish or message in a bottle
      if (Math.sin(cx - cy) > 0) {
        // Red starfish
        return `<path d="M ${cx},${cy - 2} L ${cx + 1},${cy} L ${cx + 3},${cy} L ${cx + 1.5},${cy + 1.2} L ${cx + 2},${cy + 3} L ${cx},${cy + 1.8} L ${cx - 2},${cy + 3} L ${cx - 1.5},${cy + 1.2} L ${cx - 3},${cy} L ${cx - 1},${cy} Z" fill="#ef4444" stroke="#ffffff" stroke-width="0.3" />`;
      }
      return '';
    }

    if (level === 2) {
      // Level 2: Small island with a single palm tree
      svg += `<ellipse cx="${cx}" cy="${cy + 1}" rx="8" ry="4" fill="url(#island-shadow)" opacity="0.3" />`;
      svg += drawPalm(cx, cy, scale);
      return svg;
    }

    if (level === 3) {
      // Level 3: Beach shack + 2 palms
      svg += `<ellipse cx="${cx}" cy="${cy + 2}" rx="14" ry="7" fill="url(#island-shadow)" opacity="0.35" />`;
      
      // Hütte (Shack)
      const sSize = 6 * scale;
      const shY = cy - 3;
      svg += drawIsoBox(cx + 4, shY, w, h, -0.15, 0.15, -0.15, 0.15, 6 * scale, { top: '#b45309', left: '#78350f', right: '#451a03' });
      // Straw Roof (pyramid)
      const pPeak = project(cx + 4, shY, w, h, 0, 0, 11 * scale);
      const pL = project(cx + 4, shY, w, h, -0.17, 0.17, 6 * scale);
      const pR = project(cx + 4, shY, w, h, 0.17, -0.17, 6 * scale);
      const pF = project(cx + 4, shY, w, h, 0.17, 0.17, 6 * scale);
      svg += `
        <path d="M ${pL.x},${pL.y} L ${pPeak.x},${pPeak.y} L ${pF.x},${pF.y} Z" fill="#fef08a" />
        <path d="M ${pF.x},${pF.y} L ${pPeak.x},${pPeak.y} L ${pR.x},${pR.y} Z" fill="#facc15" />
      `;

      // 2 Palms
      svg += drawPalm(cx - 5, cy + 2, scale * 0.95);
      svg += drawPalm(cx + 1, cy + 4, scale * 0.7);

      return svg;
    }

    // Level 4: Majestic lighthouse island!
    svg += `<ellipse cx="${cx}" cy="${cy + 2}" rx="18" ry="9" fill="url(#island-shadow)" opacity="0.4" />`;
    
    // Lighthouse building coordinates
    const lhBaseY = cy - 2;
    const lH = 42 * scale; // Lighthouse height
    
    // Render the stripes (alternating red and white cylinders/boxes)
    const segments = 4;
    for (let i = 0; i < segments; i++) {
      const startZ = (lH / segments) * i;
      const endZ = (lH / segments) * (i + 1);
      const segW = (0.12 - (i * 0.015)) * scale;
      const color = i % 2 === 0 ? { top: '#ffffff', left: 'url(#lighthouse-white)', right: '#cbd5e1' } : { top: '#ef4444', left: 'url(#lighthouse-red)', right: '#b91c1c' };
      
      svg += drawIsoBox(cx, lhBaseY, w, h, -segW, segW, -segW, segW, endZ, color);
    }

    // Lighthouse gallery deck & glass dome
    const deckZ = lH;
    const domeZ = lH + 8 * scale;
    const domeW = 0.08 * scale;
    svg += drawIsoBox(cx, lhBaseY, w, h, -domeW - 0.02, domeW + 0.02, -domeW - 0.02, domeW + 0.02, deckZ + 1.5 * scale, { top: '#1e293b', left: '#0f172a', right: '#020617' }); // balcony
    svg += drawIsoBox(cx, lhBaseY, w, h, -domeW, domeW, -domeW, domeW, domeZ, { top: '#fef08a', left: '#fbbf24', right: '#d97706' }); // light chamber
    svg += drawIsoBox(cx, lhBaseY, w, h, -domeW - 0.01, domeW + 0.01, -domeW - 0.01, domeW + 0.01, domeZ + 2 * scale, { top: '#1e293b', left: '#0f172a', right: '#020617' }); // roof dome

    // Yellow shining searchlight beam sweeps outwards to the upper right
    const pLightCenter = project(cx, lhBaseY, w, h, 0, 0, lH + 4 * scale);
    const beamR_Tip = { x: pLightCenter.x + 140, y: pLightCenter.y - 120 };
    svg += `
      <polygon points="${pLightCenter.x},${pLightCenter.y} ${beamR_Tip.x - 30},${beamTipY(beamR_Tip.y)} ${beamR_Tip.x + 30},${beamTipY(beamR_Tip.y)}" 
               fill="url(#beam-light)" opacity="0.5" />
      <circle cx="${pLightCenter.x}" cy="${pLightCenter.y}" r="3" fill="#ffffff" filter="url(#neon-glow)" />
    `;

    function beamTipY(by: number) {
      return by;
    }

    // 1 palm on the side
    svg += drawPalm(cx - 8, cy + 3, scale * 1.1);

    // Tiny chest
    const pChest = project(cx + 6, cy + 3, w, h, 0, 0, 0);
    svg += drawIsoBox(cx + 6, cy + 3, w, h, -0.06, 0.06, -0.06, 0.06, 3, { top: '#78350f', left: '#ca8a04', right: '#451a03' });

    return svg;
  },
};

const THEMES: Record<string, ThemeConfig> = {
  forest: ForestTheme,
  highway: HighwayTheme,
  island: IslandTheme,
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
  if (themeName.toLowerCase() === 'highway') {
    const roadDepth = 8;
    const concreteColorLeft = '#1e293b';
    const concreteColorRight = '#0f172a';
    
    for (let x = 0; x < weeks; x++) {
      const screenX = (x - 6) * (tileWidth / 2) + offsetX;
      const screenY = (x + 6) * (tileHeight / 2) + offsetY;
      const pLeft = `M ${screenX - tileWidth / 2},${screenY} L ${screenX},${screenY + tileHeight / 2} L ${screenX},${screenY + tileHeight / 2 + roadDepth} L ${screenX - tileWidth / 2},${screenY + roadDepth} Z`;
      svg += `    <path d="${pLeft}" fill="${concreteColorLeft}" />\n`;
    }

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
      
      // Draw theme-specific extra tile details
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

      const objectMarkup = theme.drawObject(screenX, screenY, day.level, day.count, tileWidth, tileHeight, day.date, y);
      if (objectMarkup) {
        svg += `    ${objectMarkup}\n`;
      }
    }
  }

  svg += '  </g>\n';

  // Draw Legend in the bottom right corner (Activity Levels)
  const legendX = svgWidth - 360;
  const legendY = svgHeight - 55;

  svg += `
  <!-- Legend (Activity Level) -->
  <g transform="translate(${legendX}, ${legendY})">
    <text x="0" y="8" class="legend-text" text-anchor="end">Less</text>
    
    <g transform="translate(10, 0)">
      <use href="#tile-0" x="10" y="0" />
    </g>
    
    <g transform="translate(45, 0)">
      <use href="#tile-1" x="10" y="0" />
      ${theme.drawObject(10, 0, 1, 2, tileWidth, tileHeight, '2026-01-01', 3)}
    </g>
    
    <g transform="translate(80, 0)">
      <use href="#tile-2" x="10" y="0" />
      ${theme.drawObject(10, 0, 2, 5, tileWidth, tileHeight, '2026-01-02', 3)}
    </g>
    
    <g transform="translate(115, 0)">
      <use href="#tile-3" x="10" y="0" />
      ${theme.drawObject(10, 0, 3, 10, tileWidth, tileHeight, '2026-01-03', 3)}
    </g>
    
    <g transform="translate(150, 0)">
      <use href="#tile-4" x="10" y="0" />
      ${theme.drawObject(10, 0, 4, 25, tileWidth, tileHeight, '2026-01-04', 3)}
    </g>

    <text x="195" y="8" class="legend-text">More</text>
  </g>
`;

  // Draw Forest-Specific Tree Species Legend in the bottom left corner
  if (themeName.toLowerCase() === 'forest') {
    const forestLegendY = svgHeight - 55;
    svg += `
  <!-- Forest-Specific Tree Species Legend -->
  <g transform="translate(60, ${forestLegendY})">
    <!-- Commits (Fir Tree / Nadelbaum) -->
    <g transform="translate(10, 0)">
      <use href="#tile-2" x="10" y="0" />
      ${theme.drawObject(10, 0, 3, 8, tileWidth, tileHeight, '2026-01-01', 3)}
    </g>
    <text x="35" y="8" class="legend-text">Commits (Nadelbaum)</text>

    <!-- Pull Requests (Sequoia / Mammutbaum) -->
    <g transform="translate(210, 0)">
      <use href="#tile-2" x="10" y="0" />
      ${theme.drawObject(10, 0, 3, 8, tileWidth, tileHeight, '2026-01-02', 3)}
    </g>
    <text x="235" y="8" class="legend-text">Pull Requests (Mammutbaum)</text>

    <!-- Issues & Reviews (Oak / Laubbaum) -->
    <g transform="translate(450, 0)">
      <use href="#tile-2" x="10" y="0" />
      ${theme.drawObject(10, 0, 3, 8, tileWidth, tileHeight, '2026-01-03', 3)}
    </g>
    <text x="475" y="8" class="legend-text">Issues &amp; Reviews (Laubbaum)</text>
  </g>
`;
  }

  // Draw Highway-Specific Legend in the bottom left corner
  if (themeName.toLowerCase() === 'highway') {
    const highwayLegendY = svgHeight - 55;
    svg += `
  <!-- Highway-Specific Lanes Legend -->
  <g transform="translate(60, ${highwayLegendY})">
    <circle cx="12" cy="4" r="5" fill="#ffffff" opacity="0.9" />
    <circle cx="12" cy="4" r="3" fill="#0f172a" />
    <text x="25" y="8" class="legend-text">Werktage (Spuren 1-5)</text>

    <g transform="translate(180, 0)">
      <polygon points="12,0 8,8 16,8" fill="#ef4444" stroke="#ffffff" stroke-width="0.5" />
      <circle cx="12" cy="6" r="0.8" fill="#ffffff" />
    </g>
    <text x="205" y="8" class="legend-text">Wochenende (Pannenstreifen, Spur 0 &amp; 6)</text>
  </g>
`;
  }

  // Draw Island-Specific Legend in the bottom left corner
  if (themeName.toLowerCase() === 'island') {
    const islandLegendY = svgHeight - 55;
    svg += `
  <!-- Island-Specific Legend -->
  <g transform="translate(60, ${islandLegendY})">
    <g transform="translate(10, 0)">
      <use href="#tile-0" x="10" y="0" />
    </g>
    <text x="35" y="8" class="legend-text">Meerwasser (Level 0)</text>

    <g transform="translate(190, 0)">
      <use href="#tile-1" x="10" y="0" />
    </g>
    <text x="215" y="8" class="legend-text">Sandbänke (Level 1)</text>

    <g transform="translate(370, 0)">
      <use href="#tile-2" x="10" y="0" />
      ${theme.drawObject(10, 0, 2, 5, tileWidth, tileHeight, '2026-01-01', 3)}
    </g>
    <text x="395" y="8" class="legend-text">Inseln mit Palmen/Gebäuden (Level 2-4)</text>
  </g>
`;
  }

  svg += '\n</svg>\n';

  return svg;
}
