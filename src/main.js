import { createIcons, X, Camera, Mic, RotateCcw, Activity, Zap, Waves } from 'lucide';
import html2canvas from 'html2canvas';
import gifshot from 'gifshot';

// --- Constants & Palette ---

const ATTRIBUTES = ['hasVibration', 'hasLight', 'hasData', 'hasMoisture', 'hasPower'];
const MAX_COMPONENTS = 6;
const PALETTE = {
  ink: '#151619',
  paper: '#FBFBF8',
  primary: '#F27D26',
  sage: '#5A6340',
  pink: '#D8A8A8',
  teal: '#26A69A',
  rust: '#A85838',
  ivory: '#E4E3E0',
  charcoal: '#383838',
  coral: '#FF6B6B',
  yellow: '#FFD700',
  blue: '#4169E1',
  neonCyan: '#00F0FF',
  neonLime: '#32FF00',
  neonMagenta: '#FF00FF',
  deepTeal: '#1A3C40',
  orangeRed: '#E43D24',
  paleGold: '#E6D5B8',
};

// --- SVG Helpers ---
const STIPPLE = (id, color = '#000', opacity = 0.1) => `
  <pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse">
    <circle cx="1" cy="1" r="0.5" fill="${color}" opacity="${opacity}" />
    <circle cx="3" cy="3" r="0.5" fill="${color}" opacity="${opacity}" />
  </pattern>
`;

// --- Audio System ---

class SynthEngine {
  constructor() {
    this.ctx = null;
    this.droneOsc = null;
    this.droneGain = null;
    this.filter = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sawtooth';
    this.droneGain = this.ctx.createGain();
    this.filter = this.ctx.createBiquadFilter();
    
    this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
    this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    
    this.droneOsc.connect(this.filter);
    this.filter.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);
    
    this.droneOsc.start();
  }

  updateDrone(techCount, bioCount, isActive) {
    if (!this.ctx) return;
    const targetGain = isActive ? 0.05 : 0;
    const targetFreq = 55 + (techCount * 10) - (bioCount * 5);
    const filterFreq = 100 + (techCount * 200) + (bioCount * 50);

    this.droneGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    this.droneOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
    this.filter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.5);
  }

  playSFX(type) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g);
    g.connect(this.ctx.destination);

    const now = this.ctx.currentTime;
    if (type === 'clack') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      g.gain.setValueAtTime(0.1, now);
      g.gain.linearRampToValueAtTime(0, now + 0.1);
    } else if (type === 'chime') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    } else if (type === 'buzz') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.2);
      g.gain.setValueAtTime(0.05, now);
      g.gain.linearRampToValueAtTime(0, now + 0.2);
    }

    osc.start();
    osc.stop(now + 1);
  }
}

const synth = new SynthEngine();

// --- Component Specifications ---

const COMPONENT_SPECS = [
  {
    id: 'crank',
    name: 'Heavy Crank',
    category: 'Mechanical',
    outputs: ['hasVibration'],
    react: (input) => ({ ...input, hasVibration: (input.hasVibration || 0) + 1 }),
    visual: ({ activated, isOverloading }) => `
      <defs>${STIPPLE('stipple-black')}</defs>
      <g stroke="${PALETTE.ink}" stroke-width="1.5">
        <!-- Main Housing -->
        <rect x="15" y="30" width="70" height="55" rx="2" fill="${PALETTE.rust}" />
        <rect x="15" y="30" width="70" height="55" rx="2" fill="url(#stipple-black)" />
        <rect x="20" y="35" width="60" height="45" fill="none" stroke-dasharray="2 2" opacity="0.3" />
        <!-- Bolts -->
        <circle cx="20" cy="35" r="2" fill="${PALETTE.charcoal}" />
        <circle cx="80" cy="35" r="2" fill="${PALETTE.charcoal}" />
        <circle cx="20" cy="80" r="2" fill="${PALETTE.charcoal}" />
        <circle cx="80" cy="80" r="2" fill="${PALETTE.charcoal}" />
        
        <!-- Gears -->
        <g class="animate-rotate" style="--duration: 6s; transform-origin: 35px 60px">
           <circle cx="35" cy="60" r="18" fill="${PALETTE.charcoal}" />
           ${[...Array(8)].map((_, i) => `<rect x="33" y="40" width="4" height="6" fill="${PALETTE.charcoal}" transform="rotate(${i * 45}, 35, 60)" />`).join('')}
           <circle cx="35" cy="60" r="14" fill="${PALETTE.rust}" stroke-width="1" />
        </g>
        
        <g class="animate-rotate-reverse" style="--duration: 4s; transform-origin: 60px 65px">
           <circle cx="60" cy="65" r="14" fill="${PALETTE.charcoal}" />
           ${[...Array(6)].map((_, i) => `<rect x="58" y="50" width="4" height="6" fill="${PALETTE.charcoal}" transform="rotate(${i * 60}, 60, 65) " />`).join('')}
        </g>

        <!-- Handle -->
        <g class="${isOverloading ? 'animate-rotate' : (activated.hasPower ? 'animate-rotate' : 'animate-rotate')}" 
           style="--duration: ${isOverloading ? '0.2s' : (activated.hasPower ? '1s' : '4s')}; transform-origin: 50px 30px">
          <path d="M 50 30 L 50 10 L 85 10" stroke-width="5" stroke-linecap="round" fill="none" />
          <path d="M 50 30 L 50 10 L 85 10" stroke="${PALETTE.paper}" stroke-width="1" opacity="0.4" stroke-linecap="round" fill="none" />
          <rect x="80" y="0" width="12" height="25" rx="3" fill="${PALETTE.charcoal}" />
          <rect x="83" y="5" width="6" height="15" fill="${PALETTE.rust}" opacity="0.5" />
        </g>
      </g>`
  },
  {
    id: 'spore',
    name: 'Xenon Spore',
    category: 'Biological',
    outputs: ['hasMoisture', 'hasPower'],
    react: (input) => ({ ...input, hasMoisture: 2, hasPower: 1 }),
    visual: ({ activated }) => `
      <g stroke="${PALETTE.ink}" stroke-width="1.5">
        <!-- Base Roots -->
        <path d="M 30 95 Q 40 85 50 90 T 70 95" fill="none" stroke-width="3" stroke="${PALETTE.rust}" />
        <path d="M 20 95 Q 35 90 40 85" fill="none" stroke-width="2" stroke="${PALETTE.deepTeal}" />
        
        <!-- Main Body (Image 1 Style) -->
        <path d="M 30 90 C 20 70 30 40 50 40 S 80 70 70 90 Z" fill="${PALETTE.deepTeal}" />
        <path d="M 40 85 Q 50 45 60 85" fill="none" stroke="${PALETTE.neonLime}" stroke-width="0.5" opacity="0.3" />
        
        <!-- Red Arteries -->
        <g class="${activated.hasMoisture ? 'animate-pulse-opacity' : ''}">
          <path d="M 50 40 Q 60 20 80 15" fill="none" stroke="${PALETTE.orangeRed}" stroke-width="4" stroke-linecap="round" />
          <path d="M 50 40 Q 40 20 20 15" fill="none" stroke="${PALETTE.orangeRed}" stroke-width="3" stroke-linecap="round" />
          <path d="M 50 40 V 10" fill="none" stroke="${PALETTE.orangeRed}" stroke-width="5" stroke-linecap="round" />
        </g>

        <!-- Blobs -->
        <circle cx="80" cy="15" r="10" fill="${PALETTE.sage}" stroke="${PALETTE.ink}" />
        <circle cx="20" cy="15" r="8" fill="${PALETTE.sage}" stroke="${PALETTE.ink}" />
        <circle cx="50" cy="10" r="12" fill="${PALETTE.sage}" stroke="${PALETTE.ink}" />
        
        <!-- Detail Textures -->
        <circle cx="78" cy="12" r="2" fill="${PALETTE.paper}" opacity="0.4" />
        <circle cx="22" cy="17" r="1.5" fill="${PALETTE.paper}" opacity="0.4" />
      </g>`
  },
  {
    id: 'crt',
    name: 'Lab Monitor 2.0',
    category: 'Mechanical',
    outputs: ['hasData'],
    react: (input) => ({ ...input, hasData: 2 }),
    visual: ({ activated, isOverloading }) => `
      <g stroke="${PALETTE.ink}" stroke-width="1.5">
        <rect x="5" y="5" width="90" height="80" rx="4" fill="${PALETTE.charcoal}" />
        <rect x="10" y="10" width="80" height="50" rx="2" fill="${isOverloading ? "#fff" : (activated.hasLight ? PALETTE.deepTeal : "#05110c")}" />
        
        <!-- CRT lines -->
        ${[...Array(12)].map((_, i) => `<line x1="10" y1="${12 + i * 4}" x2="90" y2="${12 + i * 4}" stroke="white" stroke-width="0.2" opacity="0.1" />`).join('')}
        
        <!-- Signal -->
        <g class="animate-pulse-opacity" style="--duration: 0.15s">
          <path d="M 15 35 L 25 35 L 30 15 L 40 45 L 45 35 L 85 35" stroke="${isOverloading ? PALETTE.ink : (activated.hasData ? PALETTE.neonLime : PALETTE.sage)}" fill="none" stroke-width="3" />
        </g>

        <!-- Knobs and Switches -->
        <circle cx="20" cy="72" r="6" fill="${PALETTE.ivory}" />
        <line x1="20" y1="72" x2="24" y2="68" stroke-width="2" />
        <circle cx="35" cy="72" r="6" fill="${PALETTE.ivory}" />
        <line x1="35" y1="72" x2="31" y2="76" stroke-width="2" />
        
        <rect x="50" y="66" width="4" height="12" fill="${PALETTE.orangeRed}" />
        <rect x="60" y="66" width="4" height="12" fill="${PALETTE.neonCyan}" />
        
        <!-- Grille -->
        <rect x="70" y="66" width="20" height="12" fill="none" stroke-dasharray="1 1" opacity="0.5" />
      </g>`
  },
  {
    id: 'bio-bearded',
    name: 'Bearded Triplets',
    category: 'Biological',
    outputs: ['hasMoisture'],
    react: (input) => ({ ...input, hasMoisture: (input.hasLight ? 2 : 1) }),
    visual: ({ activated }) => `
      <g stroke="${PALETTE.ink}" stroke-width="1.5">
        <g class="animate-wiggle" style="transform-origin: 50px 95px">
          <!-- Large Leaves (Image 1 Style) -->
          <path d="M 50 95 Q 20 60 5 30 Q 30 10 60 40 Z" fill="${PALETTE.deepTeal}" />
          <path d="M 50 95 Q 80 60 95 30 Q 70 10 40 40 Z" fill="${PALETTE.deepTeal}" />
          
          <!-- Center Growth -->
          <path d="M 40 50 Q 50 30 60 50 Z" fill="${PALETTE.paleGold}" />
          <path d="M 45 45 L 42 35 M 50 42 L 50 30 M 55 45 L 58 35" stroke-width="3" stroke="${PALETTE.paleGold}" stroke-linecap="round" />
          
          <!-- Beards/Tentacles -->
          ${[...Array(8)].map((_, i) => `
            <path d="M ${20 + i * 8} 45 Q ${25 + i * 8} 75 ${15 + i * 10} 100" fill="none" stroke="${PALETTE.neonCyan}" stroke-width="1" opacity="0.6" />
          `).join('')}
          
          <!-- Veins -->
          <path d="M 50 95 Q 35 60 20 40" fill="none" stroke="${PALETTE.neonLime}" stroke-width="0.5" opacity="0.2" />
          <path d="M 50 95 Q 65 60 80 40" fill="none" stroke="${PALETTE.neonLime}" stroke-width="0.5" opacity="0.2" />
        </g>
      </g>`
  },
  {
    id: 'crystal-node',
    name: 'Monolith Core',
    category: 'Biological',
    outputs: ['hasLight'],
    react: (input) => ({ ...input, hasLight: (input.hasPower ? 2 : 0) }),
    visual: ({ activated }) => `
      <g stroke="${PALETTE.ink}" stroke-width="1.5">
        <!-- Floating Shards -->
        <g class="animate-float">
          <path d="M 50 10 L 20 50 L 50 90 L 80 50 Z" fill="${activated.hasLight ? PALETTE.neonCyan : PALETTE.ivory}" opacity="0.8" />
          <path d="M 50 10 L 50 90" stroke-width="1" opacity="0.3" />
          <path d="M 20 50 L 80 50" stroke-width="1" opacity="0.3" />
          
          <!-- Highlights -->
          <path d="M 50 15 L 25 50 L 50 45 Z" fill="white" opacity="0.5" />
        </g>
        
        <!-- Orbitals -->
        <circle cx="50" cy="50" r="40" fill="none" stroke-dasharray="2 4" stroke="${PALETTE.ink}" opacity="0.2" />
        <g class="animate-rotate" style="--duration: 8s; transform-origin: 50px 50px">
          <circle cx="90" cy="50" r="4" fill="${PALETTE.orangeRed}" />
        </g>
        <g class="animate-rotate-reverse" style="--duration: 5s; transform-origin: 50px 50px">
          <circle cx="10" cy="50" r="3" fill="${PALETTE.neonLime}" />
        </g>
      </g>`
  },
  {
    id: 'processor',
    name: 'Steam Processor',
    category: 'Mechanical',
    outputs: ['hasPower'],
    react: (input) => ({ ...input, hasPower: (input.hasPower || 0) + 1 }),
    visual: ({ activated, isOverloading }) => `
      <g stroke="${PALETTE.ink}" stroke-width="2">
        <rect x="20" y="20" width="60" height="70" rx="3" fill="${PALETTE.charcoal}" />
        <rect x="25" y="25" width="50" height="40" fill="${PALETTE.paper}" opacity="0.1" />
        
        <!-- Piston -->
        <path d="M 40 90 V 60" stroke-width="8" stroke="${PALETTE.rust}" />
        <g class="animate-float" style="animation-duration: 0.5s">
           <rect x="30" y="50" width="20" height="10" fill="${PALETTE.charcoal}" />
        </g>
        
        <!-- Steam Valve -->
        <circle cx="70" cy="40" r="8" fill="${PALETTE.yellow}" />
        <line x1="70" y1="40" x2="78" y2="40" stroke-width="3" />
        
        <!-- Pipes -->
        <path d="M 20 30 H 5 M 5 30 V 90" fill="none" stroke-width="4" stroke="${PALETTE.charcoal}" />
        <path d="M 80 80 H 95 M 95 80 V 10" fill="none" stroke-width="4" stroke="${PALETTE.charcoal}" />
        
        ${activated.hasPower ? `
          <g class="animate-pulse-opacity">
             <circle cx="50" cy="50" r="5" fill="${PALETTE.neonLime}" />
          </g>` : ''}
      </g>`
  },
  {
    id: 'arrowhead',
    name: 'Arrowhead Phage',
    category: 'Biological',
    outputs: ['hasData'],
    react: (input) => ({ ...input, hasData: 2 }),
    visual: ({ activated }) => `
      <g stroke="${PALETTE.ink}" stroke-width="1.5">
        <g class="animate-float">
          <!-- Stalks (Image 1 Style C) -->
          ${[...Array(3)].map((_, i) => `
            <path d="M 50 95 Q ${30 + i * 20} 70 ${40 + i * 10} 20" fill="none" stroke="${PALETTE.sage}" stroke-width="2" />
            <path d="M ${40 + i * 10} 20 L ${35 + i * 10} 10 L ${45 + i * 10} 10 Z" fill="${PALETTE.yellow}" />
            <!-- Orange petals at base of head -->
            <path d="M ${40 + i * 10} 25 L ${30 + i * 10} 35 L ${40 + i * 10} 45 L ${50 + i * 10} 35 Z" fill="${PALETTE.orangeRed}" />
          `).join('')}
          <!-- Base cluster -->
          <circle cx="50" cy="90" r="10" fill="${PALETTE.deepTeal}" />
        </g>
      </g>`
  },
  {
    id: 'polyps',
    name: 'Neon Polyps',
    category: 'Biological',
    outputs: ['hasLight', 'hasVibration'],
    react: (input) => ({ ...input, hasLight: 2, hasVibration: 2 }),
    visual: ({ activated }) => `
      <g stroke="${PALETTE.ink}" stroke-width="1.5">
        <!-- Fungal Tubes (Image 1 Style E) -->
        <path d="M 30 95 Q 20 60 40 30" fill="none" stroke="${PALETTE.sage}" stroke-width="8" opacity="0.4" />
        <path d="M 40 30 Q 30 20 50 10 L 60 30 Z" fill="${PALETTE.neonMagenta}" />
        
        <path d="M 70 95 Q 80 60 60 30" fill="none" stroke="${PALETTE.sage}" stroke-width="8" opacity="0.4" />
        <path d="M 60 30 Q 70 20 50 10 L 40 30 Z" fill="${PALETTE.neonMagenta}" />
        
        <!-- Glowing Core -->
        <circle cx="50" cy="15" r="5" fill="${PALETTE.neonCyan}" class="animate-pulse-opacity" />
        
        <!-- Base Pulsing Pod -->
        <path d="M 30 95 C 30 80 70 80 70 95" fill="${PALETTE.orangeRed}" />
      </g>`
  }
];

// --- Application State & Logic ---

let components = [];
let draggingSpec = null;
let activeVars = {};
let systemStyle = { bgColor: PALETTE.paper, isOverloading: false };
let fusion = false;

const snapPoint = (v) => Math.round(v / 20) * 20;

function calculateSignals() {
  let currentVars = {};
  
  components.forEach(c => {
    const spec = COMPONENT_SPECS.find(s => s.id === c.specId);
    currentVars[c.id] = {};
    ATTRIBUTES.forEach(attr => currentVars[c.id][attr] = 0);
    spec?.outputs.forEach(attr => {
      currentVars[c.id][attr] = 1;
    });
  });

  for (let i = 0; i < 3; i++) {
    const nextVars = JSON.parse(JSON.stringify(currentVars));
    const ids = Object.keys(currentVars);
    
    ids.forEach(targetId => {
      ids.forEach(sourceId => {
        if (sourceId === targetId) return;
        const fromVars = currentVars[sourceId];
        ATTRIBUTES.forEach(attr => {
          if (fromVars[attr]) nextVars[targetId][attr] = Math.max(nextVars[targetId][attr] || 0, fromVars[attr]);
        });
      });
    });

    components.forEach(c => {
      const spec = COMPONENT_SPECS.find(s => s.id === c.specId);
      if (spec) nextVars[c.id] = spec.react(nextVars[c.id], c.state);
    });
    currentVars = nextVars;
  }
  return currentVars;
}

function updateSystemLogic() {
  activeVars = calculateSignals();
  
  const techCount = components.filter(c => COMPONENT_SPECS.find(s => s.id === c.specId).category === 'Mechanical').length;
  const bioCount = components.filter(c => COMPONENT_SPECS.find(s => s.id === c.specId).category === 'Biological').length;
  
  const globalTotals = {};
  ATTRIBUTES.forEach(attr => {
    globalTotals[attr] = Object.values(activeVars).reduce((sum, v) => sum + (v[attr] || 0), 0);
  });

  fusion = Object.values(globalTotals).some(v => v >= 4);
  
  synth.updateDrone(techCount, bioCount, components.length > 0);
  renderAll();
}

// --- Rendering Engine ---

function renderAll() {
  renderInventory();
  renderWorkspace();
  renderCounters();
  renderStatus();
}

function renderInventory() {
  const container = document.getElementById('inventory');
  container.innerHTML = COMPONENT_SPECS.map(spec => `
    <div class="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform group relative dragging-source" 
         draggable="true" data-spec-id="${spec.id}">
      <div class="w-20 h-20 pointer-events-none filter drop-shadow-xl">
        <svg viewBox="0 0 100 100" class="component-svg">
          ${spec.visual({ activated: {}, state: {} })}
        </svg>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.dragging-source').forEach(el => {
    el.addEventListener('dragstart', (e) => {
      draggingSpec = COMPONENT_SPECS.find(s => s.id === el.dataset.specId);
      synth.init();
    });
  });
}

function renderWorkspace() {
  const workspace = document.getElementById('workspace');
  workspace.style.backgroundColor = systemStyle.bgColor;
  
  const componentLayer = document.getElementById('component-layer');
  componentLayer.innerHTML = components.map(inst => {
    const spec = COMPONENT_SPECS.find(s => s.id === inst.specId);
    const vars = activeVars[inst.id] || {};
    return `
      <div class="component-instance group" style="left: ${inst.x}px; top: ${inst.y}px" data-id="${inst.id}">
        <svg viewBox="0 0 100 100" class="component-svg">
          ${spec.visual({ activated: vars, state: inst.state, isOverloading: systemStyle.isOverloading })}
        </svg>
        <div class="absolute -top-4 -right-4 p-1 opacity-0 group-hover:opacity-100 flex gap-2 pointer-events-auto transition-opacity z-50">
          <button class="delete-btn p-1.5 bg-black text-white rounded-full border border-white/20 cursor-pointer" data-id="${inst.id}">
             <i data-lucide="x" class="w-3 h-3"></i>
          </button>
          ${spec.specialLogic === 'color-palette' ? `
            <button class="cam-btn p-1.5 bg-white border-2 border-black rounded-full cursor-pointer" data-id="${inst.id}">
              <i data-lucide="camera" class="w-3 h-3"></i>
            </button>` : ''}
          ${spec.specialLogic === 'audio-input' ? `
            <button class="mic-btn p-1.5 bg-white border-2 border-black rounded-full cursor-pointer" data-id="${inst.id}">
              <i data-lucide="mic" class="w-3 h-3"></i>
            </button>` : ''}
        </div>
      </div>
    `;
  }).join('');

  renderCables();
  createIcons({
    icons: {
      X,
      Camera,
      Mic,
      RotateCcw,
      Activity,
      Zap,
      Waves
    }
  });
  attachInstanceEvents();

  const fusionOverlay = document.getElementById('fusion-overlay');
  fusionOverlay.classList.toggle('hidden', !fusion);
}

function renderCables() {
  const cableLayer = document.getElementById('cable-layer');
  cableLayer.innerHTML = '';
  components.forEach((c1, i) => {
    components.slice(i + 1).forEach((c2, j) => {
      const colors = [PALETTE.orangeRed, PALETTE.neonCyan, PALETTE.neonLime, PALETTE.yellow];
      const color = colors[(i + j) % colors.length];
      const path = `M ${c1.x + 50} ${c1.y + 50} Q ${(c1.x + c2.x)/2 + (Math.sin(i+j)*50)} ${(c1.y + c2.y)/2 + 150} ${c2.x + 50} ${c2.y + 50}`;
      
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = `
        <path d="${path}" stroke="${PALETTE.charcoal}" stroke-width="8" class="cable-path" opacity="0.2" />
        <path d="${path}" stroke="${color}" stroke-width="3" class="cable-path" opacity="0.8" />
        <circle r="3" fill="#fff" class="voltage-dot">
          <animateMotion dur="2s" repeatCount="indefinite" path="${path}" />
        </circle>
      `;
      cableLayer.appendChild(g);
    });
  });
}

function renderCounters() {
  const container = document.getElementById('attribute-counters');
  container.innerHTML = ATTRIBUTES.slice(0, 3).map(attr => {
    const total = Object.values(activeVars).reduce((sum, v) => sum + (v[attr] || 0), 0);
    return `<span class="${total > 0 ? "text-[#26A69A]" : "opacity-30"}">${attr.toUpperCase()}: ${total}</span>`;
  }).join('');
}

function renderStatus() {
  document.getElementById('status-load').querySelector('span').textContent = `LOAD: ${Math.round((components.length / MAX_COMPONENTS) * 100)}%`;
  document.getElementById('status-bandwidth').querySelector('span').textContent = `BANDWIDTH: ${Object.keys(activeVars).length * 8}Kbps`;
  document.getElementById('status-operational').querySelector('span').textContent = fusion ? 'CRITICAL_FUSION' : 'OPERATIONAL_OK';
  document.getElementById('system-status').textContent = `LAB_CORE_ACTIVE // ${systemStyle.isOverloading ? 'OVERLOAD_DETECTED' : 'STABLE'}`;
}

// --- Interaction Handlers ---

function attachInstanceEvents() {
  document.querySelectorAll('.component-instance').forEach(el => {
    el.addEventListener('pointerdown', startDrag);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      components = components.filter(c => c.id !== btn.dataset.id);
      synth.playSFX('buzz');
      updateSystemLogic();
    });
  });

  document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('click', () => handleCamera(btn.dataset.id));
  });

  document.querySelectorAll('.mic-btn').forEach(btn => {
    btn.addEventListener('click', () => handleMic(btn.dataset.id));
  });
}

let activeDragId = null;
function startDrag(e) {
  if (e.target.closest('button')) return;
  activeDragId = e.currentTarget.dataset.id;
  const el = e.currentTarget;
  const startX = e.clientX - el.offsetLeft;
  const startY = e.clientY - el.offsetTop;

  function onMove(moveEvent) {
    const comp = components.find(c => c.id === activeDragId);
    if (comp) {
      comp.x = snapPoint(moveEvent.clientX - startX);
      comp.y = snapPoint(moveEvent.clientY - startY);
      updateSystemLogic();
    }
  }

  function onUp() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

const workspace = document.getElementById('workspace');
workspace.addEventListener('dragover', (e) => e.preventDefault());
workspace.addEventListener('drop', (e) => {
  e.preventDefault();
  if (!draggingSpec || components.length >= MAX_COMPONENTS) return;
  
  const rect = workspace.getBoundingClientRect();
  const x = snapPoint(e.clientX - rect.left - 50);
  const y = snapPoint(e.clientY - rect.top - 50);
  
  components.push({
    id: Math.random().toString(36).substr(2, 9),
    specId: draggingSpec.id,
    x, y,
    state: {}
  });
  
  synth.playSFX('clack');
  draggingSpec = null;
  updateSystemLogic();
});

// --- Exports ---

document.getElementById('reset-bench').addEventListener('click', () => {
  components = [];
  updateSystemLogic();
});

document.getElementById('export-gif').addEventListener('click', async () => {
  const canvas = document.getElementById('workspace');
  const frames = [];
  for (let i = 0; i < 20; i++) {
    const c = await html2canvas(canvas, { backgroundColor: systemStyle.bgColor });
    frames.push(c.toDataURL());
    await new Promise(r => setTimeout(r, 100));
  }
  gifshot.createGIF({ images: frames, interval: 0.1, numFrames: 20, frameWidth: 800, frameHeight: 600 }, (obj) => {
    if (!obj.error) {
      const a = document.createElement('a');
      a.download = 'biosynth_capture.gif';
      a.href = obj.image;
      a.click();
    }
  });
});

function handleCamera(compId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 10; canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r=0, g=0, b=0;
        for (let i=0; i<data.length; i+=4) { r+=data[i]; g+=data[i+1]; b+=data[i+2]; }
        const color = `rgb(${Math.round(r/25)}, ${Math.round(g/25)}, ${Math.round(b/25)})`;
        systemStyle.bgColor = color;
        const c = components.find(comp => comp.id === compId);
        if (c) c.state.dominantColor = color;
        synth.playSFX('chime');
        updateSystemLogic();
        setTimeout(() => { systemStyle.bgColor = PALETTE.paper; updateSystemLogic(); }, 5000);
      };
      img.src = re.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function handleMic(compId) {
  synth.init();
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    source.connect(analyser);
    
    const check = () => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b) / data.length;
      
      if (avg > 40) {
        systemStyle.isOverloading = true;
        const c = components.find(comp => comp.id === compId);
        if (c) c.state.peak = true;
        synth.playSFX('clack');
        updateSystemLogic();
        
        setTimeout(() => {
          systemStyle.isOverloading = false;
          if (c) c.state.peak = false;
          updateSystemLogic();
          setTimeout(() => requestAnimationFrame(check), 3000);
        }, 2000);
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
}

// --- Init ---
updateSystemLogic();
createIcons({
  icons: {
    X,
    Camera,
    Mic,
    RotateCcw,
    Activity,
    Zap,
    Waves
  }
});
