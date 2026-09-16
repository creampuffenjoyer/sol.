/* global React, Icon, PORTFOLIO */
// All non-terminal apps live here: FileManager, TextEditor, Browser, ImageViewer,
// "Burp" recon panel, Settings, Music player, Resume viewer.

const { useState, useEffect, useRef, useMemo } = React;

// =================================================================
// FileManager
// =================================================================
function FileManagerApp({ openApp, toast }) {
  const home = useMemo(() => ['home', PORTFOLIO.user.handle], []);
  const [path, setPath] = useState(home);
  const [history, setHistory] = useState([home]);
  const [hIdx, setHIdx] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  const closeSearch = () => { setSearchOpen(false); setQuery(''); };

  const getNode = (p) => {
    let n = PORTFOLIO.fs;
    for (const part of p) {
      if (!n || n.type !== 'dir') return null;
      n = n.children[part];
    }
    return n;
  };

  const node = getNode(path);
  const visibleEntries = node && node.type === 'dir'
    ? Object.entries(node.children)
        .filter(([n]) => !n.startsWith('.'))
        .filter(([n]) => !query || n.toLowerCase().includes(query.toLowerCase()))
    : [];
  const goto = (p) => {
    setPath(p);
    closeSearch();
    const trimmed = history.slice(0, hIdx + 1);
    setHistory([...trimmed, p]);
    setHIdx(trimmed.length);
  };

  const back = () => { if (hIdx > 0) { setHIdx(hIdx - 1); setPath(history[hIdx - 1]); closeSearch(); } };
  const fwd  = () => { if (hIdx < history.length - 1) { setHIdx(hIdx + 1); setPath(history[hIdx + 1]); closeSearch(); } };
  const up   = () => { if (path.length > 0) goto(path.slice(0, -1)); };

  const onOpen = (name, child) => {
    if (child.type === 'dir') {
      goto([...path, name]);
    } else {
      // Open in text editor
      openApp('editor', { props: { path: [...path, name] }, title: name });
    }
  };

  const sidebar = [
    { label: 'Home',     icon: Icon.home,   path: home },
    { label: 'Projects', icon: Icon.folder, path: [...home, 'projects'] },
    { label: 'System',   icon: Icon.folder, path: [] },
    { label: 'etc',      icon: Icon.folder, path: ['etc'] },
    { label: 'var',      icon: Icon.folder, path: ['var'] },
  ];

  const pretty = (p) => {
    if (p.length >= home.length && home.every((q, i) => p[i] === q)) {
      const rest = p.slice(home.length);
      return rest.length ? '~/' + rest.join('/') : '~';
    }
    return '/' + p.join('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: 'var(--bg-2)' }}>
      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}>
        <button className="fm-btn" onClick={back} disabled={hIdx === 0} title="Back"><Icon.arrow_l size={14}/></button>
        <button className="fm-btn" onClick={fwd}  disabled={hIdx === history.length - 1} title="Forward"><Icon.arrow_r size={14}/></button>
        <button className="fm-btn" onClick={up}   disabled={path.length === 0} title="Up a directory"><Icon.arrow_u size={14}/></button>
        <div style={{ flex: 1, marginLeft: 8, padding: '4px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {pretty(path)}
        </div>
        {searchOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); }}
              placeholder="Filter files…"
              style={{ width: 150, padding: '4px 8px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', fontSize: 12, fontFamily: 'var(--font-mono)' }}
            />
            <button className="fm-btn" onClick={closeSearch} title="Close search">✕</button>
          </div>
        ) : (
          <button className="fm-btn" onClick={() => setSearchOpen(true)} title="Filter files"><Icon.search size={14}/></button>
        )}
        <style>{`
          .fm-btn { width: 26px; height: 26px; background: transparent; border: 0; border-radius: 4px; display:grid; place-items:center; cursor:pointer; color: var(--muted); }
          .fm-btn:hover:not(:disabled) { background: var(--bg-3); color: var(--text); }
          .fm-btn:disabled { opacity: 0.35; cursor: default; }
        `}</style>
      </div>

      {/* body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* sidebar */}
        <div style={{ width: 180, background: 'var(--bg-1)', borderRight: '1px solid var(--border)', padding: 8, fontSize: 12, overflow: 'auto' }}>
          <div style={{ color: 'var(--dim)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', padding: '4px 8px' }}>Places</div>
          {sidebar.map((s, i) => {
            const active = JSON.stringify(s.path) === JSON.stringify(path);
            return (
              <div
                key={i}
                onClick={() => goto(s.path)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 4, cursor: 'pointer', background: active ? 'var(--accent-soft)' : 'transparent' }}
              >
                <s.icon size={14} color="var(--accent)"/>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* file grid */}
        <div className="scrollable" style={{ flex: 1, padding: 14, overflow: 'auto', background: 'var(--bg-2)' }}>
          {!node && <div style={{ color: 'var(--muted)' }}>Not found.</div>}
          {node && node.type === 'dir' && visibleEntries.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>No files match "{query}".</div>
          )}
          {node && node.type === 'dir' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 92px)', gap: 6 }}>
              {visibleEntries.map(([name, child]) => (
                <div
                  key={name}
                  onDoubleClick={() => onOpen(name, child)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: 6, borderRadius: 6, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-soft)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {child.type === 'dir'
                    ? <Icon.folder size={42} color="var(--accent)"/>
                    : <Icon.file size={42} color="var(--muted)"/>}
                  <span style={{ fontSize: 11, textAlign: 'center', wordBreak: 'break-word', maxWidth: 84 }}>{name}</span>
                </div>
              ))}
            </div>
          )}
          {node && node.type === 'file' && (
            <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'pre-wrap' }}>{node.body}</pre>
          )}
        </div>
      </div>

      {/* statusbar */}
      <div style={{ padding: '4px 10px', fontSize: 11, color: 'var(--muted)', background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
        {node && node.type === 'dir'
          ? (query ? `${visibleEntries.length} of ${Object.keys(node.children).filter(n => !n.startsWith('.')).length} items` : `${visibleEntries.length} items`)
          : 'file'}
      </div>
    </div>
  );
}

// =================================================================
// TextEditor (read-only, with markdown rendering toggle)
// =================================================================
function TextEditorApp({ path: filePath }) {
  const home = ['home', PORTFOLIO.user.handle];
  const [mode, setMode] = useState('preview'); // preview | raw
  const target = filePath || [...home, 'about.md'];
  const getNode = (p) => {
    let n = PORTFOLIO.fs;
    for (const x of p) { if (!n || n.type !== 'dir') return null; n = n.children[x]; }
    return n;
  };
  const node = getNode(target);
  const fileName = target[target.length - 1] || 'untitled';
  const isMd = fileName.endsWith('.md');
  const body = node && node.type === 'file' ? node.body : '(file not found)';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>📄 {fileName}</span>
        <div style={{ flex: 1 }}/>
        {isMd && <>
          <button onClick={() => setMode('preview')} style={tabBtnStyle(mode === 'preview')}>Preview</button>
          <button onClick={() => setMode('raw')}     style={tabBtnStyle(mode === 'raw')}>Source</button>
        </>}
      </div>
      <div className="scrollable" style={{ flex: 1, overflow: 'auto', padding: '20px 28px', userSelect: 'text' }}>
        {isMd && mode === 'preview'
          ? <MarkdownView text={body}/>
          : <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.55, margin: 0 }}>{body}</pre>}
      </div>
      <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--muted)', background: 'var(--bg-1)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{body.split('\n').length} lines · {body.length} chars</span>
        <span>UTF-8 · {isMd ? 'Markdown' : 'Plain Text'}</span>
      </div>
    </div>
  );
}
const tabBtnStyle = (active) => ({
  padding: '3px 10px', background: active ? 'var(--accent-soft)' : 'transparent',
  color: active ? 'var(--text)' : 'var(--muted)',
  border: '1px solid', borderColor: active ? 'var(--accent)' : 'transparent',
  borderRadius: 4, cursor: 'pointer', fontSize: 11,
});

function MarkdownView({ text }) {
  const lines = text.split('\n');
  const out = [];
  let inList = false, listItems = [];
  const flush = () => { if (inList) { out.push(<ul key={'l'+out.length}>{listItems.map((x,i)=><li key={i}>{x}</li>)}</ul>); inList = false; listItems = []; } };
  lines.forEach((l, i) => {
    if (l.startsWith('# '))      { flush(); out.push(<h1 key={i}>{l.slice(2)}</h1>); }
    else if (l.startsWith('## ')){ flush(); out.push(<h2 key={i}>{l.slice(3)}</h2>); }
    else if (l.startsWith('### ')){flush(); out.push(<h3 key={i}>{l.slice(4)}</h3>); }
    else if (l.startsWith('> ')) { flush(); out.push(<blockquote key={i}>{l.slice(2)}</blockquote>); }
    else if (l.startsWith('- ')) { inList = true; listItems.push(renderInline(l.slice(2))); }
    else if (l.trim() === '')    { flush(); out.push(<div key={i} style={{ height: 8 }}/>); }
    else                         { flush(); out.push(<p key={i} style={{ margin: '6px 0' }}>{renderInline(l)}</p>); }
  });
  flush();
  return (
    <div style={{ maxWidth: 760, fontSize: 14, lineHeight: 1.6, userSelect: 'text' }}>
      <style>{`
        .md h1, .md h2, .md h3 { color: var(--text); margin: 18px 0 8px; }
        .md h1 { font-size: 28px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
        .md h2 { font-size: 20px; color: var(--accent); }
        .md h3 { font-size: 16px; }
        .md blockquote { border-left: 3px solid var(--accent); margin: 8px 0; padding-left: 12px; color: var(--muted); font-style: italic; }
        .md ul { padding-left: 20px; }
        .md li { margin: 4px 0; }
        .md code { font-family: var(--font-mono); font-size: 12px; background: var(--bg-3); padding: 1px 5px; border-radius: 3px; color: var(--accent); }
      `}</style>
      <div className="md">{out}</div>
    </div>
  );
}
function renderInline(s) {
  // bold **x**, code `x`
  const parts = [];
  let i = 0, key = 0;
  while (i < s.length) {
    if (s[i] === '*' && s[i+1] === '*') {
      const end = s.indexOf('**', i+2);
      if (end > -1) { parts.push(<strong key={key++}>{s.slice(i+2, end)}</strong>); i = end + 2; continue; }
    }
    if (s[i] === '`') {
      const end = s.indexOf('`', i+1);
      if (end > -1) { parts.push(<code key={key++}>{s.slice(i+1, end)}</code>); i = end + 1; continue; }
    }
    // capture run
    let j = i;
    while (j < s.length && s[j] !== '*' && s[j] !== '`') j++;
    parts.push(<span key={key++}>{s.slice(i, j)}</span>);
    i = j;
  }
  return parts;
}

// =================================================================
// Browser — Firefox-style chrome around a portfolio site
// =================================================================
function BrowserApp() {
  const homeUrl = 'https://s0l.kali/portfolio';
  const [url, setUrl] = useState(homeUrl);
  const [page, setPage] = useState('home');
  const [tabs] = useState([
    { id: 1, title: 's0L · Portfolio', url: homeUrl },
    { id: 2, title: 'DEADNET', url: 'https://deadnet-production.up.railway.app' },
    { id: 3, title: 'GitHub', url: 'https://github.com/creampuffenjoyer' },
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [stack, setStack] = useState([homeUrl]);
  const [hIdx, setHIdx] = useState(0);

  const resolvePage = (u) => {
    if (u.includes('s0l.kali')) {
      if (u.includes('/projects')) return 'projects';
      if (u.includes('/about')) return 'about';
      if (u.includes('/contact')) return 'contact';
      return 'home';
    }
    return 'external';
  };

  // Navigate to a new URL, pushing it onto history (truncating any forward entries).
  const go = (u) => {
    setUrl(u);
    setPage(resolvePage(u));
    const trimmed = stack.slice(0, hIdx + 1);
    setStack([...trimmed, u]);
    setHIdx(trimmed.length);
  };

  const reload = () => { setUrl(url); setPage(resolvePage(url)); };
  const back = () => { if (hIdx > 0) { setHIdx(hIdx - 1); const u = stack[hIdx - 1]; setUrl(u); setPage(resolvePage(u)); } };
  const forward = () => { if (hIdx < stack.length - 1) { setHIdx(hIdx + 1); const u = stack[hIdx + 1]; setUrl(u); setPage(resolvePage(u)); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#1c1b22' }}>
      {/* tab bar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', background: '#1c1b22', padding: '4px 4px 0', gap: 1 }}>
        {tabs.map(t => (
          <div
            key={t.id}
            onClick={() => { setActiveTab(t.id); go(t.url); }}
            style={{
              padding: '6px 12px 7px', fontSize: 12,
              background: activeTab === t.id ? '#42414d' : 'transparent',
              borderRadius: '6px 6px 0 0',
              color: activeTab === t.id ? '#fbfbfe' : '#9c9aaa',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              maxWidth: 200, minWidth: 100,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 3, background: '#5b5870', flexShrink: 0 }}/>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
          </div>
        ))}
        <div style={{ padding: '6px 10px', color: '#9c9aaa', cursor: 'pointer' }}>+</div>
      </div>
      {/* url bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: '#42414d' }}>
        <button style={browserBtn} onClick={back} disabled={hIdx === 0} title="Back"><Icon.arrow_l size={14} color={hIdx === 0 ? '#6b6878' : '#cfcdd5'}/></button>
        <button style={browserBtn} onClick={forward} disabled={hIdx === stack.length - 1} title="Forward"><Icon.arrow_r size={14} color={hIdx === stack.length - 1 ? '#6b6878' : '#cfcdd5'}/></button>
        <button style={browserBtn} onClick={reload} title="Reload"><Icon.reload size={14} color="#cfcdd5"/></button>
        <button style={browserBtn} onClick={() => go(homeUrl)} title="Home"><Icon.home size={14} color="#cfcdd5"/></button>
        <div style={{ flex: 1, padding: '5px 10px', background: '#1c1b22', borderRadius: 4, color: '#fbfbfe', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          🔒 {url}
        </div>
      </div>
      {/* page */}
      {page === 'external'
        ? <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <ExternalPage url={url}/>
          </div>
        : <div className="scrollable" style={{ flex: 1, overflow: 'auto', background: '#fbfbfe', color: '#15141a' }}>
            <PortfolioWebPage page={page} go={go}/>
          </div>
      }
    </div>
  );
}
const browserBtn = { width: 28, height: 26, background: 'transparent', border: 0, borderRadius: 4, cursor: 'pointer', display: 'grid', placeItems: 'center' };

function PortfolioWebPage({ page, go }) {
  const u = PORTFOLIO.user;
  return (
    <div style={{ minHeight: '100%', background: '#0a0d12', color: 'var(--text)', userSelect: 'text' }}>
      <nav style={{ display: 'flex', gap: 18, padding: '14px 28px', borderBottom: '1px solid #1e2330', background: '#0a0d12', position: 'sticky', top: 0, zIndex: 1, alignItems: 'baseline' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>$ {u.alias}</div>
        <div style={{ flex: 1 }}/>
        {['home', 'about', 'projects', 'contact'].map(p => (
          <a key={p}
             onClick={() => go(`https://s0l.kali/portfolio${p === 'home' ? '' : '/' + p}`)}
             style={{ fontSize: 13, color: page === p ? 'var(--accent)' : '#9aa3b2', cursor: 'pointer', textDecoration: page === p ? 'underline' : 'none' }}>{p}</a>
        ))}
      </nav>
      {page === 'home' && <BrowserHome go={go}/>}
      {page === 'about' && <BrowserAbout/>}
      {page === 'projects' && <BrowserProjects/>}
      {page === 'contact' && <BrowserContact/>}
    </div>
  );
}

function BrowserHome({ go }) {
  const u = PORTFOLIO.user;
  return (
    <div style={{ padding: '60px 28px', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>// portfolio.v2 — 2025</div>
      <h1 style={{ fontSize: 48, fontWeight: 700, margin: '12px 0 8px', lineHeight: 1.1 }}>{u.name}</h1>
      <div style={{ fontSize: 18, color: 'var(--muted)' }}>{u.title}</div>
      <p style={{ marginTop: 24, fontSize: 16, lineHeight: 1.6, color: 'var(--text)' }}>{u.bio[0]}</p>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--muted)' }}>{u.bio[1]}</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
        <a style={ctaPrimary} onClick={() => go('https://s0l.kali/portfolio/projects')}>View projects →</a>
        <a style={ctaGhost} onClick={() => go('https://s0l.kali/portfolio/contact')}>Get in touch</a>
      </div>
      <div style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {PORTFOLIO.projects.slice(0, 4).map(p => (
          <div key={p.name}
               onClick={() => go('https://s0l.kali/portfolio/projects')}
               style={{ padding: 18, background: '#11151c', border: '1px solid #1e2330', borderRadius: 8, cursor: 'pointer' }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 13 }}>{p.name}</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>{p.blurb}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
              {p.stack.slice(0, 4).map(s => <span key={s} style={chipStyle}>{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
const ctaPrimary = { padding: '10px 18px', background: 'var(--accent)', color: '#fff', borderRadius: 6, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' };
const ctaGhost   = { padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' };
const chipStyle  = { fontSize: 11, padding: '2px 6px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--muted)', fontFamily: 'var(--font-mono)' };

function BrowserAbout() {
  const u = PORTFOLIO.user;
  return (
    <div style={{ padding: '60px 28px', maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontSize: 36 }}>About</h1>
      {u.bio.map((p, i) => <p key={i} style={{ fontSize: 16, lineHeight: 1.7 }}>{p}</p>)}
      <h2 style={{ marginTop: 40, fontSize: 22, color: 'var(--accent)' }}>Stack</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
        {Object.entries(PORTFOLIO.skills).map(([cat, items]) => (
          <div key={cat}>
            <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>[{cat}]</div>
            <div style={{ marginTop: 4, color: 'var(--text)', fontSize: 14, lineHeight: 1.7 }}>{items.join(' · ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrowserProjects() {
  return (
    <div style={{ padding: '60px 28px', maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ fontSize: 36, marginBottom: 24 }}>Projects</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {PORTFOLIO.projects.map(p => (
          <div key={p.name} style={{ padding: 22, background: '#11151c', border: '1px solid #1e2330', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 16, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.year}</div>
            </div>
            <div style={{ marginTop: 4, fontSize: 15, color: 'var(--text)' }}>{p.blurb}</div>
            <ul style={{ marginTop: 10, paddingLeft: 18, color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
              {p.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 12 }}>
              {p.stack.map(s => <span key={s} style={chipStyle}>{s}</span>)}
            </div>
            {p.link !== '—' && <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>↗ {p.link}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function BrowserContact() {
  const u = PORTFOLIO.user;
  return (
    <div style={{ padding: '60px 28px', maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 36 }}>Contact</h1>
      <p style={{ color: 'var(--muted)' }}>The fastest way to reach me is email. I read everything.</p>
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--font-mono)' }}>
        {[
          ['email',     u.email],
          ['phone',     u.phone],
          ['github',    u.links.github],
          ['tryhackme', u.links.tryhackme],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 14, padding: '10px 14px', background: '#11151c', border: '1px solid #1e2330', borderRadius: 6 }}>
            <span style={{ color: 'var(--muted)', width: 80 }}>{k}</span>
            <span style={{ color: 'var(--accent)' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExternalPage({ url }) {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#1c1b22' }}>
      <div style={{ padding: '5px 12px', background: '#2a2838', borderBottom: '1px solid #3a3850', fontSize: 11, color: '#9c9aaa', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ flex: 1 }}>Some sites block embedding — if blank:</span>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>↗ open in new tab</a>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9c9aaa', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            connecting…
          </div>
        )}
        <iframe
          key={url}
          src={url}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => setLoading(false)}
          title="external"
        />
      </div>
    </div>
  );
}

// =================================================================
// Image Viewer — gallery of project screenshots (placeholders)
// =================================================================
function ImageViewerApp() {
  const [active, setActive] = useState(0);
  const items = PORTFOLIO.projects.map((p, i) => ({
    name: p.name,
    blurb: p.blurb,
    hue: (i * 47) % 360,
  }));
  const prev = () => setActive(i => (i - 1 + items.length) % items.length);
  const next = () => setActive(i => (i + 1) % items.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items.length]);

  const a = items[active];
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0a0d12' }}>
      <div className="scrollable" style={{ width: 180, overflow: 'auto', borderRight: '1px solid var(--border)', background: 'var(--bg-1)' }}>
        {items.map((it, i) => (
          <div key={i}
               onClick={() => setActive(i)}
               style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', background: i === active ? 'var(--accent-soft)' : 'transparent', borderBottom: '1px solid var(--border-soft)' }}>
            <div style={{ height: 80, borderRadius: 4, background: `linear-gradient(135deg, hsl(${it.hue} 50% 22%), hsl(${(it.hue+40)%360} 55% 12%))`, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.85 }}>{it.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{it.name}.png</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 30, background: '#06080c', position: 'relative' }}>
          <button onClick={prev} title="Previous image" style={{ ...imgNavBtn, left: 14 }}><Icon.arrow_l size={18} color="#fff"/></button>
          <button onClick={next} title="Next image" style={{ ...imgNavBtn, right: 14 }}><Icon.arrow_r size={18} color="#fff"/></button>
          <div style={{
            width: '80%', maxWidth: 700, aspectRatio: '16/10', borderRadius: 8,
            background: `linear-gradient(135deg, hsl(${a.hue} 60% 22%), hsl(${(a.hue+40)%360} 60% 10%))`,
            display: 'grid', placeItems: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 60%)' }}/>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px' }}/>
            <div style={{ textAlign: 'center', color: '#fff', zIndex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, letterSpacing: '.02em' }}>{a.name}</div>
              <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)', maxWidth: 420, margin: '6px auto 0' }}>{a.blurb}</div>
              <div style={{ marginTop: 16, fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>[ screenshot placeholder ]</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--muted)', background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
          {active + 1} / {items.length} · {a.name}.png
        </div>
      </div>
    </div>
  );
}
const imgNavBtn = {
  position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
  width: 36, height: 36, borderRadius: '50%',
  background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)',
  display: 'grid', placeItems: 'center', cursor: 'pointer',
};

// =================================================================
// "Burp" — Recon/intercept-styled panel that "scans" the portfolio
// =================================================================
function BurpApp() {
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState([]);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const scan = () => {
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    setRunning(true);
    setRows([]);
    const reqs = [
      { method: 'GET',  url: '/api/projects',  status: 200, ms: 18, kb: 3.4 },
      { method: 'GET',  url: '/api/me',        status: 200, ms: 9,  kb: 0.6 },
      { method: 'POST', url: '/api/auth/login',status: 200, ms: 142,kb: 0.2 },
      { method: 'GET',  url: '/api/skills',    status: 200, ms: 12, kb: 1.1 },
      { method: 'GET',  url: '/static/dragon.svg', status: 200, ms: 4, kb: 18.2 },
      { method: 'GET',  url: '/api/admin',     status: 403, ms: 6,  kb: 0.0 },
      { method: 'GET',  url: '/.env',          status: 404, ms: 3,  kb: 0.0 },
      { method: 'GET',  url: '/api/v1/health', status: 200, ms: 2,  kb: 0.1 },
    ];
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= reqs.length) {
        clearInterval(intervalRef.current);
        timeoutRef.current = setTimeout(() => {
          setRows(r => [...r, { method: 'GET', url: '/api/admin?debug=true', status: 200, ms: 88, kb: 2.1, vuln: true }]);
          setRunning(false);
        }, 420);
        return;
      }
      setRows(r => [...r, reqs[i++]]);
    }, 280);
  };

  useEffect(() => {
    scan();
    return () => { clearInterval(intervalRef.current); clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: 'var(--bg-2)', fontFamily: 'var(--font-mono)' }}>
      <div style={{ padding: '8px 10px', background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 12 }}>HTTP HISTORY</span>
        <span style={{ flex: 1 }}/>
        <button onClick={scan} disabled={running} style={{ ...tabBtnStyle(false), padding: '4px 10px', cursor: running ? 'default' : 'pointer', opacity: running ? 0.5 : 1 }}>
          {running ? 'scanning…' : 'rescan'}
        </button>
      </div>
      <div className="scrollable" style={{ flex: 1, overflow: 'auto', fontSize: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-1)', color: 'var(--muted)' }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Method</th>
              <th style={{...thStyle, textAlign:'left'}}>URL</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Size</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="burp-row-in" style={{ borderBottom: '1px solid var(--border-soft)', background: r.vuln ? 'rgba(255,60,60,.07)' : undefined }}>
                <td style={tdStyle}>{i + 1}</td>
                <td style={tdStyle}><span style={{ color: methodColor(r.method) }}>{r.method}</span></td>
                <td style={{...tdStyle, textAlign:'left'}}>{r.vuln ? <span style={{ color: '#ff6060' }}>⚠ {r.url}</span> : r.url}</td>
                <td style={tdStyle}><span style={{ color: r.vuln ? '#ff6060' : statusColor(r.status) }}>{r.status}</span></td>
                <td style={tdStyle}>{r.ms}ms</td>
                <td style={tdStyle}>{r.kb}KB</td>
              </tr>
            ))}
          </tbody>
        </table>
        {running && <div style={{ padding: 12, color: 'var(--muted)', fontSize: 11 }}>▌</div>}
        {!running && rows.length > 0 && (
          <div style={{ padding: 16, marginTop: 8, borderTop: '1px solid var(--border)', color: 'var(--muted)', fontSize: 11 }}>
            {rows.length} requests · 1 site · {rows.filter(r => r.status >= 400 || r.vuln).length} interesting
          </div>
        )}
      </div>
    </div>
  );
}
const thStyle = { padding: '6px 10px', textAlign: 'center', fontWeight: 500, fontSize: 11, borderBottom: '1px solid var(--border)' };
const tdStyle = { padding: '4px 10px', textAlign: 'center', color: 'var(--text)' };
const methodColor = (m) => ({ GET: 'var(--green)', POST: 'var(--yellow)', PUT: 'var(--cyan)', DELETE: 'var(--red)' }[m] || 'var(--text)');
const statusColor = (s) => s >= 500 ? 'var(--red)' : s >= 400 ? 'var(--yellow)' : 'var(--green)';

// =================================================================
// Music player — "Now playing" mock
// =================================================================
const MUSIC_TRACKS = [
  { title: 'Dream Sweet in Sea Major', artist: '',                    yt: 'uxyM7vhU0uU' },
  { title: 'Waltz No. 2',             artist: 'Shostakovich',        yt: 'mmCnQDUSO4I' },
  { title: 'The Way I Am',            artist: '',                    yt: 'idfNwe-Ism0' },
  { title: 'Merry Go Round of Life',  artist: 'Joe Hisaishi',        yt: 'HMGetv40FkI' },
  { title: 'Fontaine',                artist: '',                    yt: 'tiulg9ySfR8' },
  { title: "Mia and Sebastian's Theme", artist: 'Justin Hurwitz',   yt: 'D3ovuBdbUqk' },
  { title: 'Somewhere I Belong',      artist: 'Linkin Park',         yt: 'GEGieUB4b3c' },
  { title: 'In My Dreams',            artist: '',                    yt: '_fHIqjZeACg' },
  { title: 'Outsider',                artist: 'Eve',                 yt: 'GMPjNA_fCj4' },
];

function MusicApp() {
  const [idx, setIdx]     = useState(0);
  const [playing, setPlaying] = useState(false);

  const select = (i) => { setIdx(i); setPlaying(true); };
  const prev   = () => select((idx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length);
  const next   = () => select((idx + 1) % MUSIC_TRACKS.length);

  const t = MUSIC_TRACKS[idx];
  const thumb = `https://img.youtube.com/vi/${t.yt}/hqdefault.jpg`;
  const embedSrc = `https://www.youtube.com/embed/${t.yt}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-2)' }}>
      {/* artwork / player */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 28 }}>
        <div style={{ width: 220, height: 165, borderRadius: 10, overflow: 'hidden', boxShadow: '0 18px 48px rgba(0,0,0,0.55)', flexShrink: 0, background: '#000' }}>
          {playing
            ? <iframe
                key={t.yt}
                src={embedSrc}
                width="220" height="165"
                style={{ border: 'none', display: 'block' }}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            : <img
                src={thumb}
                alt={t.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.style.display='none'; }}
              />
          }
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{t.title}</div>
          {t.artist && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{t.artist}</div>}
          <a
            href={`https://www.youtube.com/watch?v=${t.yt}`}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
          >↗ youtube</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={prev} style={mpBtn} title="Previous"><Icon.prev size={16}/></button>
          <button onClick={() => setPlaying(p => !p)} style={{ ...mpBtn, width: 44, height: 44, background: 'var(--accent)', color: '#fff' }} title={playing ? 'Pause' : 'Play'}>
            {playing ? <Icon.pause size={18} color="#fff"/> : <Icon.play size={18} color="#fff"/>}
          </button>
          <button onClick={next} style={mpBtn} title="Next"><Icon.next size={16}/></button>
        </div>
      </div>
      {/* track list */}
      <div className="scrollable" style={{ maxHeight: 190, overflow: 'auto', borderTop: '1px solid var(--border)' }}>
        {MUSIC_TRACKS.map((tr, i) => (
          <div
            key={i}
            onClick={() => select(i)}
            style={{ padding: '7px 12px', cursor: 'pointer', background: i === idx ? 'var(--accent-soft)' : 'transparent', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-soft)' }}
          >
            <img
              src={`https://img.youtube.com/vi/${tr.yt}/default.jpg`}
              alt=""
              style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 4, flexShrink: 0, background: 'var(--bg-3)' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.title}</div>
              {tr.artist && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{tr.artist}</div>}
            </div>
            {i === idx && playing && <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>▶</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
const mpBtn = { width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text)' };

// =================================================================
// Resume viewer
// =================================================================
function ResumeApp() {
  return (
    <div className="scrollable" style={{ width: '100%', height: '100%', overflow: 'auto', background: '#2a2d35', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 740, display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <a
          href={PORTFOLIO.user.resumePdf}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, color: '#fff', textDecoration: 'none',
            background: 'var(--accent)', padding: '7px 14px', borderRadius: 6,
            boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
          }}
        >
          {React.createElement(Icon.resume, { size: 14 })}
          Open original PDF
        </a>
      </div>
      <div style={{
        width: 740, background: '#ffffff', color: '#16181c',
        padding: '48px 52px 56px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        lineHeight: 1.5, fontSize: 13, userSelect: 'text',
        marginBottom: 24,
      }}>

        {/* ── Header ── */}
        <div style={{ borderBottom: '2.5px solid #16181c', paddingBottom: 12, marginBottom: 4 }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-.01em', lineHeight: 1.1 }}>Joseph Benjamin O. Sollestre</div>
          <div style={{ fontSize: 13, color: '#4a5060', marginTop: 4, fontWeight: 500 }}>
            Cybersecurity Specialist · Purple Team & AI/ML Security · Full Stack Developer
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', marginTop: 7, fontSize: 12, color: '#4a5060' }}>
            <span>📞 +63 966 922 1451</span>
            <span>✉ josephbenjamin.sollestre@gmail.com</span>
            <span>📍 Infanta, Quezon, Philippines</span>
            <span>⌂ github.com/creampuffenjoyer</span>
            <span>🏴 tryhackme.com/p/fymn</span>
          </div>
        </div>

        {/* ── Summary ── */}
        <RSection title="Professional Summary"/>
        <p style={{ margin: '0 0 2px', color: '#2a2f3a', lineHeight: 1.65, fontSize: 13 }}>
          Cybersecurity focused Computer Science graduate (expected June 2026) pursuing a career in purple teaming
          and AI/ML security. Experienced building end to end security systems, from a self hosted CTF competition
          platform with a hardened authentication architecture to an ML based vulnerability classification system.
          Active competitive CTF player with a top 40 all time country ranking on TryHackMe, and <strong>1st Place at the
          2025 CyberEx Philippine Army TRON Regional Qualifiers</strong>, advancing to the National Finals and finishing
          <strong> 1st Runner Up nationally</strong>. Hands on experience across web exploitation, blue and red team
          operations, network analysis, and AI/LLM security.
        </p>

        {/* ── Skills ── */}
        <RSection title="Technical Skills"/>
        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '4px 0', fontSize: 12.5 }}>
          {[
            ['Offensive Security',    'Penetration Testing, Kali Linux, Vulnerability Assessment, Web Application Security Testing, Authentication & Access Control Testing, Input Validation Testing, Nmap, Burp Suite, OWASP ZAP, Nikto, Gobuster, and Python.'],
            ['Defensive & Forensics', 'Digital Forensics, Threat Hunting, Log Analysis, Network Traffic Analysis, and Incident Response Fundamentals using Wireshark, Autopsy, Volatility, Sysmon, and SIEM technologies.'],
            ['Application Security',  'JWT and Authentication Security, Authorization Testing, XSS Testing & Remediation, Race Condition Analysis, Secure Coding, and OWASP based security assessment.'],
            ['AI/ML Security',        'ML Based Vulnerability Classification, Security Data Analysis, Feature Engineering, Model Development, Python, Scikit-learn, CatBoost.'],
            ['Systems & Development', 'Python, FastAPI, PostgreSQL, JavaScript, React, Docker, Linux, Git/GitHub, Networking, TCP/IP, REST APIs, and Remote Access Administration.'],
          ].map(([cat, val]) => (
            <React.Fragment key={cat}>
              <span style={{ color: '#4a5060', fontWeight: 600, paddingRight: 8, paddingTop: 2 }}>{cat}</span>
              <span style={{ color: '#2a2f3a', paddingTop: 2 }}>{val}</span>
            </React.Fragment>
          ))}
        </div>

        {/* ── Competitions & Achievements ── */}
        <RSection title="Competitions & Achievements"/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { title: '2025 CyberEx Philippine Army TRON', sub: '1st Place, Regional Qualifiers · 1st Runner Up, National Finals', highlight: true },
            { title: 'TryHackMe Ranking',                 sub: 'Top 40 all time country ranking · Top country ranking in May across Blue Team, Web Exploitation, and Prompt Injection rooms', highlight: true },
            { title: 'CyLab Security Academy',            sub: 'Top Scorer (formerly PicoCTF platform)' },
            { title: '2024 Hack4Gov CALABARZON',          sub: '1st Runner Up' },
            { title: 'ASEAN CTF for Member States',       sub: 'Country Representative' },
            { title: 'Trend University Capture the Flag', sub: 'University Representative' },
            { title: '12th IT Skills Olympics',           sub: 'University Representative' },
            { title: '10th TOPCIT Philippines',           sub: 'University Representative' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontWeight: 600, color: a.highlight ? '#1a56db' : '#16181c' }}>{a.title}</span>
                <span style={{ color: '#4a5060', marginLeft: 8, fontSize: 12 }}>{a.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Projects ── */}
        <RSection title="Security Projects"/>
        {[
          {
            name: 'DEADNET — Self Hosted CTF Competition Platform (OJT Project)',
            stack: 'React · Vite · Tailwind CSS · Framer Motion · FastAPI · PostgreSQL · Redis · Docker Compose · Railway',
            points: [
              'Built a full stack, self hosted CTF platform with a cyberpunk aesthetic as an alternative to CTFd and HackTheBox.',
              'Implemented a four role authentication hierarchy with JWT authentication, email verification, and password reset.',
              'Designed a Contract Board with rarity tiers and bounty decay, and a live Redis cached Bounty Board across a multi organization architecture.',
              'Enforced server side flag comparison and identified and fixed flag exposure, XSS, race condition, and JWT misconfiguration vulnerabilities.',
            ],
          },
          {
            name: 'SVAT — Security Vulnerability Assessment Tool (Thesis)',
            stack: 'Python 3.12 · FastAPI · React 18 · Tailwind CSS · PostgreSQL · Redis · Docker',
            points: [
              'Built a CatBoost machine learning pipeline classifying cybersecurity risk of inactive Philippine SUC student portals.',
              'Achieved 94.44% accuracy and a 0.9392 macro F1 score on classification results.',
              'Delivered a full stack app to present findings, pairing a FastAPI backend with a React and Tailwind CSS frontend.',
            ],
          },
          {
            name: 'Noctis',
            stack: 'Python · Gemini API · Claude API',
            points: [
              'Multi-model AI agent that autonomously reasons through CTF challenges using tool-use loops with self-correction.',
              'Routes to Gemini for vision-heavy steganography and Claude for cryptographic reasoning; logs full chain-of-thought per challenge.',
              'Currently autosolves ~40% of picoCTF entry-tier challenges end-to-end without human input.',
            ],
          },
          {
            name: 'CryptKit',
            stack: 'Python · Click',
            points: [
              'CLI tool for fingerprinting and auto-solving crypto and steganography CTF challenges across 30+ cipher and stego formats.',
              'Heuristic + entropy-based detection with confidence scoring; pluggable solver registry extensible in under 50 lines.',
            ],
          },
        ].map((p, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: '#16181c' }}>{p.name}</span>
              <span style={{ fontSize: 11, color: '#4a5060', fontFamily: 'monospace' }}>{p.stack}</span>
            </div>
            <div style={{ marginTop: 4 }}>
              {p.points.map((pt, j) => (
                <div key={j} style={{ display: 'flex', gap: 6, fontSize: 12.5, color: '#2a2f3a', lineHeight: 1.6, marginBottom: 1 }}>
                  <span style={{ color: '#2a2f3a', flexShrink: 0 }}>{'•'}</span>
                  <span style={{ color: '#2a2f3a' }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ── Experience ── */}
        <RSection title="Professional Experience"/>
        {[
          {
            role: 'Full Stack Developer & Penetration Tester', org: 'Sabinex (Service Provider Startup)', period: 'Aug 2025 to Present',
            points: [
              'Develop and maintain client websites and web applications using Python and modern web technologies.',
              'Build and integrate frontend interfaces, backend services, databases, APIs, and application features.',
              'Conduct authorized penetration testing and vulnerability assessments of client web applications and portals.',
              'Test authentication, authorization, access controls, and input validation using Kali Linux, Burp Suite, OWASP ZAP, and Nmap.',
            ],
          },
          {
            role: 'Computer Technician & PC Builder', org: 'Freelance', period: 'Aug 2022 to Present',
            points: [
              'Built, repaired, and optimized desktop systems; provided hardware diagnostics and OS/software support.',
              'Deployed and configured networking equipment including routers, switches, and access points for small businesses.',
            ],
          },
          {
            role: 'Freelance Developer', org: 'Independent', period: 'Apr 2023 to Present',
            points: [
              'Developed web applications and automation tools for clients using Python, React, and FastAPI.',
              'Built a sensor-integrated automation system for a university undergraduate thesis project.',
            ],
          },
          {
            role: 'Encoder', org: 'Jon Ron Clinic', period: 'Mar 2018 to Dec 2020',
            points: [
              'Managed accurate data entry of patient records; maintained documentation and file organization systems.',
            ],
          },
        ].map((e, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: '#16181c' }}>{e.role}</span>
              <span style={{ fontSize: 12, color: '#4a5060' }}>{e.period}</span>
            </div>
            <div style={{ fontSize: 12, color: '#4a5060', marginBottom: 3 }}>{e.org}</div>
            <div style={{ marginTop: 2 }}>
              {e.points.map((pt, j) => (
                <div key={j} style={{ display: 'flex', gap: 6, fontSize: 12.5, color: '#2a2f3a', lineHeight: 1.6, marginBottom: 1 }}>
                  <span style={{ color: '#2a2f3a', flexShrink: 0 }}>{'•'}</span>
                  <span style={{ color: '#2a2f3a' }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ── Certifications ── */}
        <RSection title="Certifications & Trainings"/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 4 }}>
          {[
            { name: 'TryHackMe — Pre Security',       date: 'May 7, 2026' },
            { name: 'TryHackMe — Cyber Security 101', date: 'May 18, 2026' },
            { name: 'TryHackMe — AI Security',        date: 'July 2026 to Present' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 600, color: '#16181c' }}>{c.name}</span>
              <span style={{ fontSize: 12, color: '#4a5060', flexShrink: 0, marginLeft: 12 }}>{c.date}</span>
            </div>
          ))}
        </div>

        {/* ── Education ── */}
        <RSection title="Education"/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Bachelor of Science in Computer Science</div>
            <div style={{ fontSize: 12.5, color: '#2a2f3a' }}>Major in Intelligent Systems · Laguna State Polytechnic University, Siniloan</div>
          </div>
          <span style={{ fontSize: 12, color: '#4a5060', flexShrink: 0, marginLeft: 12 }}>Oct 2021 to June 2026</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Infanta National High School</div>
            <div style={{ fontSize: 12.5, color: '#2a2f3a' }}>Junior High & Senior High School</div>
          </div>
          <span style={{ fontSize: 12, color: '#4a5060', flexShrink: 0, marginLeft: 12 }}>July 2015 to July 2021</span>
        </div>

      </div>
    </div>
  );
}

function RSection({ title }) {
  return (
    <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 20, marginBottom: 7, color: '#16181c', borderBottom: '1.5px solid #d0d4dc', paddingBottom: 3 }}>
      {title}
    </div>
  );
}
const resumeH = {};

// =================================================================
// Settings — theme switch, wallpaper, accent
// =================================================================
function SettingsApp({ tweaks, setTweak }) {
  const accents = ['#60a5fa', '#3b82f6', '#22d3ee', '#818cf8', '#0ea5e9'];
  const wallpapers = [
    { id: 'nebula1', label: 'Nebula I'   },
    { id: 'nebula2', label: 'Nebula II'  },
    { id: 'nebula3', label: 'Nebula III' },
    { id: 'galaxy',  label: 'Galaxy'     },
    { id: 'void',    label: 'Void'       },
  ];
  return (
    <div className="scrollable" style={{ width: '100%', height: '100%', overflow: 'auto', padding: 22 }}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Settings</h2>

      <SettingsRow label="Theme">
        <div style={{ display: 'flex', gap: 6 }}>
          {['dark', 'light'].map(t => (
            <button key={t} onClick={() => setTweak('theme', t)}
                    style={{ ...tabBtnStyle(tweaks.theme === t), padding: '4px 14px', fontSize: 12 }}>{t}</button>
          ))}
        </div>
      </SettingsRow>

      <SettingsRow label="Accent">
        <div style={{ display: 'flex', gap: 8 }}>
          {accents.map(c => (
            <button key={c} onClick={() => setTweak('accent', c)} title={c}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: c, border: '2px solid',
                      borderColor: tweaks.accent === c ? '#fff' : 'transparent',
                      boxShadow: tweaks.accent === c ? '0 0 0 2px var(--accent)' : 'none',
                      cursor: 'pointer',
                    }}/>
          ))}
        </div>
      </SettingsRow>

      <SettingsRow label="Wallpaper">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, maxWidth: 560 }}>
          {wallpapers.map(w => (
            <div key={w.id} onClick={() => setTweak('wallpaper', w.id)}
                 style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                aspectRatio: '16/10', borderRadius: 4,
                border: `2px solid ${tweaks.wallpaper === w.id ? 'var(--accent)' : 'var(--border)'}`,
                background: wallpaperPreview(w.id),
              }}/>
              <div style={{ fontSize: 11, textAlign: 'center', color: tweaks.wallpaper === w.id ? 'var(--accent)' : 'var(--muted)' }}>{w.label}</div>
            </div>
          ))}
        </div>
      </SettingsRow>

      <SettingsRow label="About">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          <div>MilkyWayOS Rolling 2026.1 (portfolio edition)</div>
          <div>Codename: Sagittarius-A</div>
          <div>Owner:    {PORTFOLIO.user.name} ({PORTFOLIO.user.alias})</div>
          <div>Built:    May 2026</div>
          <div>Source:   /home/{PORTFOLIO.user.handle}</div>
        </div>
      </SettingsRow>
    </div>
  );
}
function SettingsRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: '14px 0', borderBottom: '1px solid var(--border-soft)' }}>
      <div style={{ width: 110, color: 'var(--muted)', fontSize: 13, paddingTop: 4 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
function wallpaperPreview(id) {
  if (id === 'nebula1') return 'url(photos/nebula1.jpg) center/cover';
  if (id === 'nebula2') return 'url(photos/nebula2.jpg) center/cover';
  if (id === 'nebula3') return 'url(photos/nebula3.jpg) center/cover';
  if (id === 'galaxy')  return 'radial-gradient(circle at 50% 55%, #60a5fa 0%, #1e3a8a 30%, #04081f 80%)';
  return 'radial-gradient(circle at 50% 50%, #0a1840, #02050f 80%)';
}

// =================================================================
// Hidden Konami panel
// =================================================================
function KonamiApp() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: '#0a0d12', color: 'var(--text)' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>// hidden_window.exe</div>
        <h1 style={{ fontSize: 32, margin: '14px 0' }}>↑ ↑ ↓ ↓ ← → ← → B A</h1>
        <p style={{ color: 'var(--muted)', maxWidth: 420 }}>You spent the keystrokes. Take this:</p>
        <div style={{ marginTop: 20, padding: 18, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>// dev-note from {PORTFOLIO.user.alias}</div>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text)' }}>
            If you read this, you read everything. Send me the easter egg you found and I'll send you back the worst CTF challenge I've ever written. Deal?
          </p>
          <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
            → {PORTFOLIO.user.email}
          </div>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// Projects — visual gallery of security tools & platforms
// =================================================================
function ProjectsApp() {
  const [expanded, setExpanded] = useState(null);
  const projects = PORTFOLIO.projects || [];

  return (
    <div className="scrollable" style={{
      width: '100%', height: '100%', overflow: 'auto',
      background: 'radial-gradient(circle at 50% -10%, rgba(96,165,250,0.10), transparent 55%), var(--bg-1)',
      padding: 24,
    }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>
          Portfolio
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 4, marginBottom: 18 }}>
          Projects — Security Tools &amp; Platforms
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {projects.map((p, i) => {
            const isOpen = expanded === i;
            const hasLink = p.link && p.link !== '—';
            return (
              <div
                key={p.name}
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  cursor: 'pointer',
                  gridColumn: isOpen ? '1 / -1' : undefined,
                  borderRadius: 12,
                  border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}`,
                  background: isOpen ? 'var(--accent-soft)' : 'var(--bg-2)',
                  padding: 16,
                  boxShadow: isOpen ? '0 0 28px rgba(96,165,250,0.16)' : 'none',
                  transition: 'border-color .15s, background .15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{p.blurb}</div>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--dim)', flexShrink: 0 }}>{p.year}</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {p.stack.map(s => (
                    <span key={s} style={{
                      fontSize: 10.5, padding: '2px 8px', borderRadius: 99,
                      background: 'var(--bg-3)', color: 'var(--muted)', fontFamily: 'var(--font-mono)',
                    }}>{s}</span>
                  ))}
                </div>

                {isOpen && (
                  <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 11.5, color: 'var(--dim)', marginBottom: 8 }}>
                      Role: {p.role}
                      {hasLink && (
                        <>
                          {' · '}
                          <a
                            href={`https://${p.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: 'var(--accent)', textDecoration: 'none' }}
                          >
                            {p.link}
                          </a>
                        </>
                      )}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {p.details.map((d, j) => (
                        <li key={j} style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.55 }}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 22, fontSize: 11.5, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
          tip: click a card to expand · or run: projects (terminal)
        </div>
      </div>
    </div>
  );
}

// =================================================================
// Achievements — trophy case of competition placements
// =================================================================
function AchievementsApp() {
  const items = PORTFOLIO.achievements || [];
  return (
    <div className="scrollable" style={{
      width: '100%', height: '100%', overflow: 'auto',
      background: 'radial-gradient(circle at 50% -10%, rgba(96,165,250,0.10), transparent 55%), var(--bg-1)',
      padding: 24,
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--dim)' }}>
          Competition Record
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 4, marginBottom: 18 }}>
          CTF &amp; Cyber Defense — Trophy Case
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((a, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              padding: '14px 16px', borderRadius: 10,
              background: a.highlight ? 'var(--accent-soft)' : 'var(--bg-2)',
              border: `1px solid ${a.highlight ? 'var(--accent)' : 'var(--border)'}`,
              boxShadow: a.highlight ? '0 0 28px rgba(96,165,250,0.16)' : 'none',
            }}>
              <div style={{
                flexShrink: 0, width: 36, height: 36, borderRadius: 9,
                display: 'grid', placeItems: 'center',
                background: a.highlight ? 'var(--accent)' : 'var(--bg-3)',
                color: a.highlight ? '#fff' : 'var(--muted)',
              }}>
                {React.createElement(Icon.trophy, { size: 18 })}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{a.title}</span>
                  {a.year && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--dim)', flexShrink: 0 }}>{a.year}</span>}
                </div>
                <div style={{ fontSize: 12.5, marginTop: 3, color: a.highlight ? 'var(--accent)' : 'var(--muted)', fontWeight: a.highlight ? 600 : 400 }}>
                  {a.result}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, fontSize: 11.5, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
          tip: cat ~/achievements.txt · or run: achievements
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  FileManagerApp, TextEditorApp, BrowserApp, ImageViewerApp,
  BurpApp, MusicApp, ResumeApp, SettingsApp, KonamiApp, AchievementsApp, ProjectsApp,
});
