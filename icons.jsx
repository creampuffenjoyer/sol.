/* global React */
// Shared SVG icons + the abstract Kali-dragon wallpaper art.
// All icons are 1em sizable; pass `size` (default 16).

const I = (props) => {
  const { size = 16, color = "currentColor", ...rest } = props;
  return Object.assign({ width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round",
    strokeLinejoin: "round" }, rest);
};

const Icon = {
  // App icons
  terminal: (p) => (
    <svg {...I(p)}>
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <path d="M7 9l3 3-3 3M13 15h4"/>
    </svg>
  ),
  files: (p) => (
    <svg {...I(p)}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
    </svg>
  ),
  editor: (p) => (
    <svg {...I(p)}>
      <path d="M14 3l7 7-11 11H3v-7L14 3z"/>
      <path d="M12.5 5.5l6 6"/>
    </svg>
  ),
  browser: (p) => (
    <svg {...I(p)}>
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>
    </svg>
  ),
  image: (p) => (
    <svg {...I(p)}>
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <circle cx="9" cy="10" r="1.6"/>
      <path d="M21 17l-5-5-9 9"/>
    </svg>
  ),
  burp: (p) => (
    <svg {...I(p)}>
      <path d="M12 3l9 5v8l-9 5-9-5V8l9-5z"/>
      <path d="M12 12l9-5M12 12L3 8M12 12v9"/>
    </svg>
  ),
  settings: (p) => (
    <svg {...I(p)}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>
    </svg>
  ),
  music: (p) => (
    <svg {...I(p)}>
      <path d="M9 17V5l12-2v14"/>
      <circle cx="6" cy="17" r="3"/>
      <circle cx="18" cy="15" r="3"/>
    </svg>
  ),
  resume: (p) => (
    <svg {...I(p)}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/>
      <path d="M14 3v6h6M8 13h8M8 17h6"/>
    </svg>
  ),
  trophy: (p) => (
    <svg {...I(p)}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/>
      <path d="M8 5H5a3 3 0 0 0 3 5M16 5h3a3 3 0 0 1-3 5"/>
      <path d="M12 13v3M9 20h6M9.5 20c0-2 .8-2.8 2.5-4 1.7 1.2 2.5 2 2.5 4"/>
    </svg>
  ),
  grid: (p) => (
    <svg {...I(p)}>
      <rect x="3" y="3" width="8" height="8" rx="1.5"/>
      <rect x="13" y="3" width="8" height="8" rx="1.5"/>
      <rect x="3" y="13" width="8" height="8" rx="1.5"/>
      <rect x="13" y="13" width="8" height="8" rx="1.5"/>
    </svg>
  ),
  // misc
  folder: (p) => (
    <svg {...I(p)}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
    </svg>
  ),
  file: (p) => (
    <svg {...I(p)}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/>
      <path d="M14 3v6h6"/>
    </svg>
  ),
  home: (p) => (
    <svg {...I(p)}>
      <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2v-9z"/>
    </svg>
  ),
  wifi: (p) => (
    <svg {...I(p)}>
      <path d="M2 8.5a14 14 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0"/>
      <circle cx="12" cy="19" r="1" fill="currentColor"/>
    </svg>
  ),
  volume: (p) => (
    <svg {...I(p)}>
      <path d="M11 5L6 9H3v6h3l5 4V5zM15 9a4 4 0 0 1 0 6M18 7a8 8 0 0 1 0 10"/>
    </svg>
  ),
  battery: (p) => (
    <svg {...I(p)}>
      <rect x="2" y="8" width="18" height="8" rx="1.5"/>
      <rect x="3.5" y="9.5" width="12" height="5" fill="currentColor" stroke="none"/>
      <rect x="20" y="10.5" width="2" height="3" rx="0.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  arrow_l: (p) => (<svg {...I(p)}><path d="M15 6l-6 6 6 6"/></svg>),
  arrow_r: (p) => (<svg {...I(p)}><path d="M9 6l6 6-6 6"/></svg>),
  arrow_u: (p) => (<svg {...I(p)}><path d="M6 15l6-6 6 6"/></svg>),
  reload: (p) => (<svg {...I(p)}><path d="M3 12a9 9 0 0 1 15.5-6L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6L3 16M3 21v-5h5"/></svg>),
  search: (p) => (<svg {...I(p)}><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>),
  star:   (p) => (<svg {...I(p)}><path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z"/></svg>),
  play:   (p) => (<svg {...I(p)}><path d="M6 4l14 8-14 8V4z"/></svg>),
  pause:  (p) => (<svg {...I(p)}><rect x="5" y="4" width="5" height="16"/><rect x="14" y="4" width="5" height="16"/></svg>),
  prev:   (p) => (<svg {...I(p)}><path d="M6 4v16M20 4l-12 8 12 8V4z"/></svg>),
  next:   (p) => (<svg {...I(p)}><path d="M18 4v16M4 4l12 8-12 8V4z"/></svg>),
  power:  (p) => (<svg {...I(p)}><path d="M12 4v8M5 9a8 8 0 1 0 14 0"/></svg>),
  kali: (p) => (
    // Abstract Kali-style "dragon head" glyph — original mark
    <svg {...I(p)} fill="currentColor" stroke="none">
      <path d="M12 3l1.5 4L18 5l-2 4 5 1-5 1 2 4-4.5-2L12 17l-1.5-2L7 17l1.5-4-5-1 5-1L7 7l4.5 2L12 3z"/>
    </svg>
  ),
};

// Big dragon-inspired wallpaper SVG. Abstract swooping shapes + glow.
// Drawn from scratch — geometric/heraldic silhouette, not a copy of the Kali mark.
function DragonWallpaper() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="dr-glow" cx="50%" cy="55%" r="40%">
          <stop offset="0%"  stopColor="#5a9bff" stopOpacity="0.45"/>
          <stop offset="55%" stopColor="#1a4ea0" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#0a0d12" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="dr-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3e7bd6" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#0c2240" stopOpacity="0.55"/>
        </linearGradient>
        <filter id="dr-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5"/>
        </filter>
      </defs>

      {/* glow plate */}
      <rect width="1600" height="900" fill="url(#dr-glow)"/>

      {/* abstract dragon-head silhouette, centered */}
      <g transform="translate(800,460)" opacity="0.75" filter="url(#dr-blur)">
        {/* swooping head profile */}
        <path d="M -260 -40
                 C -240 -180, -120 -240, 20 -200
                 C 110 -175, 170 -120, 200 -50
                 C 230 20, 220 80, 175 130
                 C 130 175, 60 195, -10 180
                 C -90 165, -160 130, -210 80
                 C -255 35, -270 -10, -260 -40 Z"
              fill="url(#dr-fill)" stroke="#7fb0ff" strokeWidth="1.2" strokeOpacity="0.6"/>
        {/* eye */}
        <circle cx="40" cy="-90" r="6" fill="#7fb0ff"/>
        <circle cx="40" cy="-90" r="14" fill="none" stroke="#7fb0ff" strokeOpacity="0.5"/>
        {/* spines */}
        <path d="M -200 -100 l -40 -50 M -160 -150 l -30 -55 M -110 -180 l -15 -55 M -50 -200 l 0 -55 M 20 -210 l 15 -55 M 90 -195 l 30 -50 M 150 -160 l 45 -35"
              stroke="#9fc0ff" strokeOpacity="0.55" strokeWidth="2" fill="none"/>
        {/* jaw */}
        <path d="M -210 60 C -180 110, -100 140, 0 145 C 100 150, 170 130, 210 90"
              stroke="#9fc0ff" strokeOpacity="0.55" strokeWidth="2" fill="none"/>
        {/* tooth row */}
        <path d="M -120 100 l 0 18 M -80 110 l 0 22 M -40 115 l 0 24 M 0 117 l 0 25 M 40 115 l 0 23 M 80 110 l 0 20 M 120 100 l 0 17"
              stroke="#cfd9ee" strokeOpacity="0.5" strokeWidth="1.5"/>
        {/* horn curl */}
        <path d="M -240 -120 C -300 -180, -310 -240, -260 -290 C -210 -340, -130 -340, -90 -290"
              stroke="#9fc0ff" strokeOpacity="0.55" strokeWidth="2" fill="none"/>
      </g>

      {/* faint constellation dots */}
      <g fill="#9fc0ff" opacity="0.35">
        <circle cx="200" cy="120" r="1.2"/>
        <circle cx="320" cy="80" r="0.8"/>
        <circle cx="450" cy="160" r="1"/>
        <circle cx="1380" cy="120" r="1.1"/>
        <circle cx="1280" cy="220" r="0.9"/>
        <circle cx="1450" cy="300" r="1.4"/>
        <circle cx="130" cy="700" r="1"/>
        <circle cx="280" cy="780" r="0.8"/>
        <circle cx="1500" cy="780" r="1.2"/>
      </g>
    </svg>
  );
}

window.Icon = Icon;
window.DragonWallpaper = DragonWallpaper;
