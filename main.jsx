/* global React, ReactDOM, Icon, DragonWallpaper, WMProvider, useWM, Window, Panel, AppMenu, Dock, DesktopIcons, useContextMenu, BootSequence,
   TerminalApp, FileManagerApp, TextEditorApp, BrowserApp, ImageViewerApp, BurpApp, MusicApp, ResumeApp, SettingsApp, KonamiApp, AchievementsApp, ProjectsApp,
   PORTFOLIO, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- App registry ----------
const APPS = {
  terminal: { title: 'Terminal',     icon: Icon.terminal, defaultSize: { w: 780, h: 480 }, category: 'system' },
  files:    { title: 'File Manager', icon: Icon.files,    defaultSize: { w: 760, h: 480 }, category: 'utility' },
  projects: { title: 'Projects',     icon: Icon.grid,     defaultSize: { w: 860, h: 620 }, category: 'docs' },
  editor:   { title: 'Text Editor',  icon: Icon.editor,   defaultSize: { w: 760, h: 540 }, category: 'utility' },
  browser:  { title: 'Firefox',      icon: Icon.browser,  defaultSize: { w: 980, h: 620 }, category: 'web' },
  images:   { title: 'Image Viewer', icon: Icon.image,    defaultSize: { w: 820, h: 540 }, category: 'graphics' },
  burp:     { title: 'BurpRecon',    icon: Icon.burp,     defaultSize: { w: 820, h: 480 }, category: 'security' },
  music:    { title: 'Music',        icon: Icon.music,    defaultSize: { w: 420, h: 580 }, category: 'media' },
  resume:   { title: 'Resume',       icon: Icon.resume,   defaultSize: { w: 800, h: 640 }, category: 'docs' },
  achievements: { title: 'Achievements', icon: Icon.trophy, defaultSize: { w: 620, h: 560 }, category: 'docs' },
  settings: { title: 'Settings',     icon: Icon.settings, defaultSize: { w: 640, h: 560 }, category: 'system', singleton: true },
  konami:   { title: 'hidden_window.exe', icon: Icon.star, defaultSize: { w: 540, h: 400 }, category: 'easter-egg', pinned: false, singleton: true },
};

// Map app key → component
function AppRouter({ w }) {
  const wm = useWM();
  const open = (key, opts) => wm.open(key, opts);
  switch (w.app) {
    case 'terminal': return <TerminalApp openApp={open} closeWindow={() => wm.close(w.id)} apps={wm.apps} toast={wm.toast} triggerGlitch={wm.triggerGlitch}/>;
    case 'files':    return <FileManagerApp openApp={open} toast={wm.toast}/>;
    case 'projects': return <ProjectsApp/>;
    case 'editor':   return <TextEditorApp path={w.props.path}/>;
    case 'browser':  return <BrowserApp/>;
    case 'images':   return <ImageViewerApp/>;
    case 'burp':     return <BurpApp/>;
    case 'music':    return <MusicApp/>;
    case 'resume':   return <ResumeApp/>;
    case 'achievements': return <AchievementsApp/>;
    case 'settings': return <SettingsApp tweaks={w.props.tweaks} setTweak={w.props.setTweak}/>;
    case 'konami':   return <KonamiApp/>;
    default: return <div style={{ padding: 20 }}>app not found</div>;
  }
}

// ---------- Wallpaper layer ----------
function WallpaperLayer({ wallpaper }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {wallpaper === 'nebula1' && <div className="wp-nebula1"/>}
      {wallpaper === 'nebula2' && <div className="wp-nebula2"/>}
      {wallpaper === 'nebula3' && <div className="wp-nebula3"/>}
      {wallpaper === 'galaxy'  && <div className="wp-galaxy"><DragonWallpaper/></div>}
      {wallpaper === 'void'    && <div className="wp-void"/>}
    </div>
  );
}

// ---------- Screensaver ----------
const IDLE_MS = 60_000;

function Screensaver({ onDismiss }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const cols = Math.floor(canvas.width / 14);
    const drops = Array.from({ length: cols }, () => Math.random() * -80);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEF';
    const draw = () => {
      ctx.fillStyle = 'rgba(5,7,8,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#60a5fa';
      ctx.font = '13px "JetBrains Mono", monospace';
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * 14, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        else drops[i] = y + 14;
      });
    };
    const id = setInterval(draw, 48);
    return () => { clearInterval(id); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <div className="screensaver" onClick={onDismiss} onMouseMove={onDismiss} onKeyDown={onDismiss}>
      <canvas ref={canvasRef}/>
      <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', color: 'rgba(96,165,250,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        YOU ARE HACKED!
      </div>
    </div>
  );
}

// ---------- Desktop widgets ----------
function DesktopWidgets() {
  const [now, setNow] = useState(new Date());
  const mountTime = useRef(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Math.floor((now - mountTime.current) / 1000);
  const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return (
    <div className="desktop-widgets">
      <div className="widget-box">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
      <div className="widget-box">uptime {hh}:{mm}:{ss}</div>
      <div className="widget-box"><span className="threat-dot" style={{ color: 'var(--ok)' }}>●</span> THREAT: NOMINAL</div>
    </div>
  );
}

// ---------- Command palette ----------
function CommandPalette({ openApp }) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  const items = useMemo(() => {
    const all = Object.entries(APPS).map(([key, a]) => ({
      key, label: a.title, sub: a.category, icon: a.icon,
    }));
    const q = query.toLowerCase();
    return q ? all.filter(it => it.label.toLowerCase().includes(q) || it.sub.includes(q)) : all;
  }, [query]);

  useEffect(() => {
    const h = (e) => {
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setVisible(v => !v); setQuery(''); setSel(0); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => { if (visible) setTimeout(() => inputRef.current?.focus(), 16); }, [visible]);

  const run = useCallback((item) => { openApp(item.key); setVisible(false); }, [openApp]);

  const onKey = (e) => {
    if (e.key === 'Escape') { setVisible(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, items.length - 1)); return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); return; }
    if (e.key === 'Enter' && items[sel]) { run(items[sel]); return; }
  };

  if (!visible) return null;
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 7999 }} onClick={() => setVisible(false)}/>
      <div className="cmd-palette">
        <input
          ref={inputRef}
          className="cmd-palette-input"
          placeholder="Search apps and commands…"
          value={query}
          onChange={e => { setQuery(e.target.value); setSel(0); }}
          onKeyDown={onKey}
        />
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {items.map((it, i) => (
            <div
              key={it.key}
              className={`cmd-palette-item ${i === sel ? 'sel' : ''}`}
              onClick={() => run(it)}
              onMouseEnter={() => setSel(i)}
            >
              {React.createElement(it.icon, { size: 16, color: 'var(--accent)' })}
              <span style={{ flex: 1 }}>{it.label}</span>
              <span style={{ fontSize: 10, color: 'var(--dim)' }}>{it.sub}</span>
            </div>
          ))}
          {items.length === 0 && <div style={{ padding: '12px 16px', color: 'var(--dim)', fontSize: 13 }}>no results</div>}
        </div>
        <div className="cmd-palette-foot">
          <span>↑↓ navigate</span><span>↵ open</span><span>Esc close</span>
          <span style={{ marginLeft: 'auto' }}>Ctrl+K</span>
        </div>
      </div>
    </>
  );
}

// ---------- Desktop shell ----------
function DesktopShell({ tweaks, setTweak }) {
  const wm = useWM();
  const [menuOpen, setMenuOpen] = useState(false);
  const ctx = useContextMenu();

  // Idle screensaver — ref-guarded to avoid setState on every mousemove
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef(null);
  const isIdleRef = useRef(false);
  const resetIdle = useCallback(() => {
    if (isIdleRef.current) { isIdleRef.current = false; setIdle(false); }
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => { isIdleRef.current = true; setIdle(true); }, IDLE_MS);
  }, []);
  useEffect(() => {
    resetIdle();
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('mousedown', resetIdle);
    return () => {
      clearTimeout(idleTimer.current);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('mousedown', resetIdle);
    };
  }, [resetIdle]);

  // Open Terminal at startup, once
  useEffect(() => {
    wm.open('terminal');
    // eslint-disable-next-line
  }, []);

  // Settings needs latest tweaks closure
  const settingsRef = useRef({ tweaks, setTweak });
  settingsRef.current = { tweaks, setTweak };

  // Update existing Settings window's props on tweak changes
  useEffect(() => {
    const s = wm.windows.find(w => w.app === 'settings');
    if (s) wm.update(s.id, { props: { tweaks, setTweak } });
    // eslint-disable-next-line
  }, [tweaks]);

  const openSettings = () => wm.open('settings', { props: { tweaks, setTweak } });

  const desktopIcons = [
    { label: 'About me',     icon: Icon.editor,  color: 'var(--accent)',
      onOpen: () => wm.open('editor', { props: { path: ['home', PORTFOLIO.user.handle, 'about.md'] }, title: 'about.md' }) },
    { label: 'Projects',     icon: Icon.grid,    color: 'var(--accent)',
      onOpen: () => wm.open('projects') },
    { label: 'Terminal',     icon: Icon.terminal, color: 'var(--accent)',
      onOpen: () => wm.open('terminal') },
    { label: 'Resume.pdf',   icon: Icon.resume,  color: 'var(--accent)',
      onOpen: () => wm.open('resume') },
    { label: 'Achievements', icon: Icon.trophy,  color: 'var(--accent)',
      onOpen: () => wm.open('achievements') },
    { label: 'Portfolio.url',icon: Icon.browser, color: 'var(--accent)',
      onOpen: () => wm.open('browser') },
    { label: 'README',       icon: Icon.file,    color: 'var(--muted)',
      onOpen: () => wm.open('editor', { props: { path: ['README'] }, title: 'README' }) },
  ];

  // Right-click on desktop
  const onDesktopContext = (e) => {
    e.preventDefault();
    ctx.open(e.clientX, e.clientY, [
      { label: 'Open Terminal',      onClick: () => wm.open('terminal'), shortcut: 'T' },
      { label: 'Open File Manager',  onClick: () => wm.open('files') },
      { label: 'Open Projects',      onClick: () => wm.open('projects') },
      { label: 'Open Browser',       onClick: () => wm.open('browser') },
      { sep: true },
      { label: 'Settings',           onClick: openSettings },
      { sep: true },
      { label: `Wallpaper: ${tweaks.wallpaper}`, disabled: true },
      { label: `Theme: ${tweaks.theme}`,         disabled: true },
    ]);
  };

  // Wallpaper
  const wp = tweaks.wallpaper;

  // Easter egg: Konami code
  useEffect(() => {
    const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let pos = 0;
    const h = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === seq[pos]) {
        pos++;
        if (pos === seq.length) {
          wm.open('konami');
          wm.toast('Konami unlocked', 'A hidden window has been opened.');
          pos = 0;
        }
      } else {
        pos = (k === seq[0]) ? 1 : 0;
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [wm]);

  return (
    <div className="desktop" data-theme={tweaks.theme}>
      <Panel onOpenMenu={() => setMenuOpen(m => !m)} menuOpen={menuOpen}/>
      <AppMenu open={menuOpen} onClose={() => setMenuOpen(false)} onLaunch={(key) => {
        if (key === 'settings') openSettings();
        else wm.open(key);
      }}/>
      <div className="desktop-bg" onContextMenu={onDesktopContext} onClick={() => setMenuOpen(false)}>
        <WallpaperLayer wallpaper={wp}/>
        <DesktopWidgets/>
        <DesktopIcons icons={desktopIcons} onOpen={(i) => i.onOpen()}/>
        {wm.windows.map(w => (
          <Window key={w.id} w={w} app={APPS[w.app]}>
            <AppRouter w={w}/>
          </Window>
        ))}
      </div>
      <DockBar onOpen={(key) => { if (key === 'settings') openSettings(); else wm.open(key); }}/>
      {ctx.node}
      <CommandPalette openApp={(key) => { if (key === 'settings') openSettings(); else wm.open(key); }}/>
      {idle && <Screensaver onDismiss={resetIdle}/>}
    </div>
  );
}

function DockBar({ onOpen }) {
  return <Dock onOpen={onOpen}/>;
}

// ---------- Matrix wallpaper (lightweight CSS-only) ----------
function MatrixWallpaper() {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#050708',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(54,123,240,0.06), transparent 50%)'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(54,123,240,0.04) 18px, rgba(54,123,240,0.04) 20px)',
        animation: 'matrix-scroll 12s linear infinite',
      }}/>
      <style>{`@keyframes matrix-scroll { from { background-position: 0 0; } to { background-position: 0 200px; } }`}</style>
    </div>
  );
}

// ---------- Root ----------
const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#60a5fa",
  "wallpaper": "nebula2",
  "theme": "dark"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(DEFAULTS);
  const [stage, setStage] = useState(() => sessionStorage.getItem('s0l-booted') ? 'desktop' : 'boot');

  useEffect(() => {
    // Push accent to root CSS var
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    // Compute accent-soft (rgba) from hex
    const hex = tweaks.accent.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      document.documentElement.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.18)`);
    }
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks.accent, tweaks.theme]);

  const onBootDone = () => {
    sessionStorage.setItem('s0l-booted', '1');
    setStage('desktop');
  };

  if (stage === 'boot') {
    return <BootSequence user={PORTFOLIO.user} onDone={onBootDone}/>;
  }

  return (
    <WMProvider apps={APPS} accent={tweaks.accent} wallpaper={tweaks.wallpaper} theme={tweaks.theme}>
      <DesktopShell tweaks={tweaks} setTweak={setTweak}/>
      <TweakUI tweaks={tweaks} setTweak={setTweak}/>
    </WMProvider>
  );
}

// Tweaks panel UI (only when the host toggles tweaks on)
function TweakUI({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Look"/>
      <TweakRadio label="Theme" value={tweaks.theme} options={[
        { value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }
      ]} onChange={(v) => setTweak('theme', v)}/>
      <TweakColor label="Accent" value={tweaks.accent}
        options={['#60a5fa', '#3b82f6', '#22d3ee', '#818cf8', '#0ea5e9']}
        onChange={(v) => setTweak('accent', v)}/>
      <TweakSection label="Wallpaper"/>
      <TweakRadio label="Style" value={tweaks.wallpaper} options={[
        { value: 'nebula1', label: 'Nebula I'   },
        { value: 'nebula2', label: 'Nebula II'  },
        { value: 'nebula3', label: 'Nebula III' },
        { value: 'galaxy',  label: 'Galaxy'     },
        { value: 'void',    label: 'Void'       },
      ]} onChange={(v) => setTweak('wallpaper', v)}/>
    </TweaksPanel>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
