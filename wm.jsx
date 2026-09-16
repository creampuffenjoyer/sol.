/* global React, Icon, DragonWallpaper */
// Window manager + Desktop + Top panel + Dock + Context menu + Toast host
// All exported to window.

const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;

// ---------- WM context ----------
const WMContext = createContext(null);
const useWM = () => useContext(WMContext);

// ---------- WMProvider ----------
function WMProvider({ apps, children, accent, wallpaper, theme }) {
  const [windows, setWindows] = useState([]);
  const [focusId, setFocusId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [glitch, setGlitch] = useState(false);
  const nextZ = useRef(10);
  const nextId = useRef(1);

  const open = useCallback((appKey, opts = {}) => {
    const app = apps[appKey];
    if (!app) return;
    // If singleton and already exists, focus it
    if (app.singleton) {
      const existing = windowsRef.current.find(w => w.app === appKey);
      if (existing) {
        focus(existing.id);
        if (existing.minimized) {
          setWindows(ws => ws.map(w => w.id === existing.id ? { ...w, minimized: false } : w));
        }
        return existing.id;
      }
    }
    const id = nextId.current++;
    nextZ.current++;
    const desktop = getDesktopRect();
    const w = Math.min(opts.w || app.defaultSize?.w || 720, desktop.w - 40);
    const h = Math.min(opts.h || app.defaultSize?.h || 480, desktop.h - 40);
    const x = opts.x ?? Math.round(desktop.w / 2 - w / 2 + (id % 5) * 24 - 48);
    const y = opts.y ?? Math.round(desktop.h / 2 - h / 2 + (id % 5) * 24 - 48);
    setWindows(ws => [...ws, {
      id, app: appKey, title: opts.title || app.title, icon: app.icon,
      x, y, w, h, z: nextZ.current,
      minimized: false, maximized: false, props: opts.props || {},
    }]);
    setFocusId(id);
    return id;
  }, [apps]);

  const windowsRef = useRef(windows);
  useEffect(() => { windowsRef.current = windows; }, [windows]);

  const close = useCallback((id) => {
    setWindows(ws => ws.filter(w => w.id !== id));
    setFocusId(fid => fid === id ? null : fid);
  }, []);

  const focus = useCallback((id) => {
    nextZ.current++;
    const z = nextZ.current;
    setWindows(ws => ws.map(w => w.id === id ? { ...w, z, minimized: false } : w));
    setFocusId(id);
  }, []);

  const update = useCallback((id, patch) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, ...patch } : w));
  }, []);

  const minimize = useCallback((id) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: true } : w));
    setFocusId(fid => fid === id ? null : fid);
  }, []);

  const toggleMax = useCallback((id) => {
    setWindows(ws => ws.map(w => {
      if (w.id !== id) return w;
      if (w.maximized) return { ...w, maximized: false };
      const r = getDesktopRect();
      return { ...w, maximized: true, _restore: { x: w.x, y: w.y, w: w.w, h: w.h }, x: 0, y: 0, w: r.w, h: r.h };
    }));
  }, []);

  const toast = useCallback((title, body, ms = 4200) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, title, body }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), ms);
  }, []);

  const triggerGlitch = useCallback((ms = 2500) => {
    setGlitch(true);
    document.body.classList.add('glitching');
    setTimeout(() => { setGlitch(false); document.body.classList.remove('glitching'); }, ms);
  }, []);

  const value = useMemo(() => ({
    windows, focusId, open, close, focus, update, minimize, toggleMax,
    toast, triggerGlitch, apps, accent, wallpaper, theme,
  }), [windows, focusId, open, close, focus, update, minimize, toggleMax, toast, triggerGlitch, apps, accent, wallpaper, theme]);

  return (
    <WMContext.Provider value={value}>
      {children}
      <ToastHost toasts={toasts}/>
      {glitch && <div className="glitch-overlay"/>}
    </WMContext.Provider>
  );
}

function getDesktopRect() {
  const el = document.querySelector('.desktop-bg');
  if (!el) return { w: window.innerWidth, h: window.innerHeight - 86, x: 0, y: 30 };
  const r = el.getBoundingClientRect();
  return { w: r.width, h: r.height, x: r.left, y: r.top };
}

// ---------- Window ----------
function Window({ w, app, children }) {
  const wm = useWM();
  const focused = wm.focusId === w.id;

  const startDrag = (e) => {
    if (w.maximized) return;
    if (e.target.closest('.tb-btn')) return;
    e.preventDefault();
    wm.focus(w.id);
    const startX = e.clientX, startY = e.clientY;
    const ox = w.x, oy = w.y;
    const desktop = getDesktopRect();
    const move = (ev) => {
      let nx = ox + (ev.clientX - startX);
      let ny = oy + (ev.clientY - startY);
      nx = Math.max(-w.w + 80, Math.min(nx, desktop.w - 80));
      ny = Math.max(0, Math.min(ny, desktop.h - 40));
      wm.update(w.id, { x: nx, y: ny });
    };
    const up = (ev) => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      const dt = getDesktopRect();
      const SNAP = 16;
      if (ev.clientX <= dt.x + SNAP) {
        wm.update(w.id, { x: 0, y: 0, w: Math.floor(dt.w / 2), h: dt.h, maximized: false });
      } else if (ev.clientX >= dt.x + dt.w - SNAP) {
        wm.update(w.id, { x: Math.ceil(dt.w / 2), y: 0, w: Math.floor(dt.w / 2), h: dt.h, maximized: false });
      }
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const startResize = (dir) => (e) => {
    if (w.maximized) return;
    e.preventDefault(); e.stopPropagation();
    wm.focus(w.id);
    const sx = e.clientX, sy = e.clientY;
    const { x, y, w: ww, h: hh } = w;
    const desktop = getDesktopRect();
    const minW = 320, minH = 200;
    const move = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      let nx = x, ny = y, nw = ww, nh = hh;
      if (dir.includes('r')) nw = Math.max(minW, ww + dx);
      if (dir.includes('l')) { nw = Math.max(minW, ww - dx); nx = x + (ww - nw); }
      if (dir.includes('b')) nh = Math.max(minH, hh + dy);
      if (dir.includes('t')) { nh = Math.max(minH, hh - dy); ny = y + (hh - nh); }
      // bound
      if (nx < 0) { nw += nx; nx = 0; }
      if (ny < 0) { nh += ny; ny = 0; }
      if (nx + nw > desktop.w) nw = desktop.w - nx;
      if (ny + nh > desktop.h) nh = desktop.h - ny;
      wm.update(w.id, { x: nx, y: ny, w: nw, h: nh });
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div
      className={`window ${focused ? 'focused' : ''} ${w.maximized ? 'maximized' : ''}`}
      style={{ left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z, display: w.minimized ? 'none' : undefined }}
      onMouseDown={() => wm.focus(w.id)}
    >
      <div className="titlebar" onMouseDown={startDrag} onDoubleClick={() => wm.toggleMax(w.id)}>
        <div className="titlebar-title">
          {app.icon && React.createElement(app.icon, { size: 14, color: 'var(--accent)' })}
          <span>{w.title}</span>
        </div>
        <div className="titlebar-buttons">
          <button className="tb-btn" onClick={() => wm.minimize(w.id)} title="Minimize">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect y="4.5" width="10" height="1.5" rx="0.75" fill="currentColor"/></svg>
          </button>
          <button className="tb-btn" onClick={() => wm.toggleMax(w.id)} title="Maximize">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.75" y="0.75" width="8.5" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
          </button>
          <button className="tb-btn close" onClick={() => wm.close(w.id)} title="Close">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
      <div className="window-body">{children}</div>
      {!w.maximized && <>
        <div className="resize r-t"  onMouseDown={startResize('t')}/>
        <div className="resize r-b"  onMouseDown={startResize('b')}/>
        <div className="resize r-l"  onMouseDown={startResize('l')}/>
        <div className="resize r-r"  onMouseDown={startResize('r')}/>
        <div className="resize r-tl" onMouseDown={startResize('tl')}/>
        <div className="resize r-tr" onMouseDown={startResize('tr')}/>
        <div className="resize r-bl" onMouseDown={startResize('bl')}/>
        <div className="resize r-br" onMouseDown={startResize('br')}/>
      </>}
    </div>
  );
}

// ---------- Top panel ----------
function Panel({ onOpenMenu, menuOpen }) {
  const wm = useWM();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(id);
  }, []);
  const focused = wm.windows.find(w => w.id === wm.focusId && !w.minimized);
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <div className="panel">
      <button className={`panel-btn ${menuOpen ? 'active' : ''}`} onClick={onOpenMenu} title="Applications">
        <Icon.kali size={14} color="var(--accent)"/>
        <span>Applications</span>
      </button>
      <div className="panel-window-title">
        {focused ? focused.title : ''}
      </div>
      <div className="panel-spacer"/>
      <div className="panel-tray">
        <Icon.wifi size={14}/>
        <Icon.volume size={14}/>
        <Icon.battery size={14}/>
      </div>
      <div className="panel-clock">{date} · {time}</div>
    </div>
  );
}

// ---------- App menu ----------
function AppMenu({ open, onClose, onLaunch }) {
  const wm = useWM();
  if (!open) return null;
  const apps = wm.apps;
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} onClick={onClose}/>
      <div style={{
        position: 'fixed', top: 32, left: 6, zIndex: 201,
        width: 280, background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 6, boxShadow: 'var(--shadow-lg)', padding: 6,
      }}>
        <div style={{ padding: '6px 10px', fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Applications
        </div>
        {Object.entries(apps).map(([key, a]) => (
          <button
            key={key}
            className="ctxmenu-item"
            style={{ width: '100%', background: 'transparent', border: 0, textAlign: 'left' }}
            onClick={() => { onLaunch(key); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {React.createElement(a.icon, { size: 16, color: 'var(--accent)' })}
              <span>{a.title}</span>
            </span>
            <span className="tag" style={{ fontSize: 10 }}>{a.category || 'app'}</span>
          </button>
        ))}
        <div className="ctxmenu-sep"/>
        <button
          className="ctxmenu-item"
          style={{ width: '100%', background: 'transparent', border: 0, textAlign: 'left', color: 'var(--red)' }}
          onClick={() => { onClose(); window.location.reload(); }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon.power size={16}/><span>Log out</span>
          </span>
        </button>
      </div>
    </>
  );
}

// ---------- Dock ----------
function Dock({ onOpen }) {
  const wm = useWM();
  const apps = wm.apps;
  // Only show pinned + running apps
  const pinned = Object.entries(apps).filter(([, a]) => a.pinned !== false);
  const running = new Set(wm.windows.map(w => w.app));
  const openKey = (key) => onOpen ? onOpen(key) : wm.open(key);
  return (
    <div className="dock">
      <div className="dock-inner">
        {pinned.map(([key, a]) => {
          const isRunning = running.has(key);
          return (
            <div
              key={key}
              className={`dock-item ${isRunning ? 'running' : ''}`}
              onClick={() => {
                const win = wm.windows.find(w => w.app === key);
                if (win && !win.minimized && wm.focusId === win.id) wm.minimize(win.id);
                else if (win) wm.focus(win.id);
                else openKey(key);
              }}
            >
              {React.createElement(a.icon, { size: 20, color: 'var(--text)' })}
              <span className="tip">{a.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Desktop icons ----------
function DesktopIcons({ icons, onOpen }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="desktop-icons">
      {icons.map((ic, i) => (
        <div
          key={i}
          className={`desk-icon ${selected === i ? 'selected' : ''}`}
          onClick={(e) => { e.stopPropagation(); setSelected(i); }}
          onDoubleClick={() => onOpen(ic)}
        >
          {React.createElement(ic.icon || Icon.file, { size: 36, color: ic.color || 'var(--accent)' })}
          <div className="lbl">{ic.label}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Toast host ----------
function ToastHost({ toasts }) {
  return (
    <div className="toast-host">
      {toasts.map(t => (
        <div className="toast" key={t.id}>
          <div className="t-title">{t.title}</div>
          {t.body && <div className="t-body">{t.body}</div>}
        </div>
      ))}
    </div>
  );
}

// ---------- Context menu ----------
function useContextMenu() {
  const [menu, setMenu] = useState(null); // { x, y, items }
  const open = (x, y, items) => setMenu({ x, y, items });
  const close = () => setMenu(null);
  useEffect(() => {
    if (!menu) return;
    const h = () => close();
    window.addEventListener('click', h);
    window.addEventListener('blur', h);
    return () => { window.removeEventListener('click', h); window.removeEventListener('blur', h); };
  }, [menu]);
  const node = menu && (
    <div className="ctxmenu" style={{ left: menu.x, top: menu.y }}>
      {menu.items.map((it, i) => it.sep ? (
        <div className="ctxmenu-sep" key={i}/>
      ) : (
        <div
          key={i}
          className={`ctxmenu-item ${it.disabled ? 'disabled' : ''}`}
          onClick={() => { if (!it.disabled) { it.onClick?.(); close(); } }}
        >
          <span>{it.label}</span>
          {it.shortcut && <span style={{ color: 'var(--dim)', fontSize: 10 }}>{it.shortcut}</span>}
        </div>
      ))}
    </div>
  );
  return { open, close, node };
}

Object.assign(window, {
  WMProvider, WMContext, useWM, Window,
  Panel, AppMenu, Dock, DesktopIcons, ToastHost, useContextMenu,
  getDesktopRect,
});
