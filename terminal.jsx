/* global React, PORTFOLIO */
// Terminal app — deep emulator with fake filesystem, history, autocomplete, pipes
const { useState, useEffect, useRef, useCallback } = React;

// ---------- filesystem helpers ----------
function resolvePath(cwd, target) {
  if (!target) return cwd;
  let parts;
  if (target.startsWith('/')) parts = target.split('/').filter(Boolean);
  else parts = cwd.concat(target.split('/').filter(Boolean));
  const out = [];
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') out.pop();
    else if (p === '~') out.length = 0, out.push('home', PORTFOLIO.user.handle);
    else out.push(p);
  }
  return out;
}
function getNode(parts) {
  let node = PORTFOLIO.fs;
  for (const p of parts) {
    if (!node || node.type !== 'dir') return null;
    node = node.children[p];
  }
  return node || null;
}
function pathStr(parts) {
  const home = ['home', PORTFOLIO.user.handle];
  if (parts.length >= home.length && home.every((p, i) => parts[i] === p)) {
    const rest = parts.slice(home.length);
    return rest.length ? '~/' + rest.join('/') : '~';
  }
  return '/' + parts.join('/');
}

// ---------- ANSI-ish coloring ----------
// We just render JSX spans with classes.
const C = {
  user:    (s) => <span style={{ color: 'var(--green)' }}>{s}</span>,
  host:    (s) => <span style={{ color: 'var(--green)' }}>{s}</span>,
  path:    (s) => <span style={{ color: 'var(--cyan)' }}>{s}</span>,
  cmd:     (s) => <span style={{ color: 'var(--text)' }}>{s}</span>,
  dim:     (s) => <span style={{ color: 'var(--dim)' }}>{s}</span>,
  err:     (s) => <span style={{ color: 'var(--red)' }}>{s}</span>,
  ok:      (s) => <span style={{ color: 'var(--green)' }}>{s}</span>,
  warn:    (s) => <span style={{ color: 'var(--yellow)' }}>{s}</span>,
  accent:  (s) => <span style={{ color: 'var(--accent)' }}>{s}</span>,
  magenta: (s) => <span style={{ color: 'var(--magenta)' }}>{s}</span>,
  dir:     (s) => <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s}</span>,
};

const Prompt = ({ cwd }) => (
  <>
    {C.user('┌──(')}{C.host(`${PORTFOLIO.user.handle}㉿${PORTFOLIO.user.host}`)}{C.user(')-[')}
    {C.path(pathStr(cwd))}{C.user(']')}
    <br/>
    {C.user('└─$')} {' '}
  </>
);

// ---------- Commands ----------
// Each command: (args, ctx) => string | JSX | array of strings/JSX  (output)
// or async — output appended in order.

function makeCommands(ctx) {
  const cmds = {};

  cmds.help = () => [
    'Built-in commands:',
    '',
    '  help           Show this help',
    '  about          Who is s0L',
    '  projects       List projects',
    '  skills         Skill matrix',
    '  contact        Reach out',
    '  resume         Open resume window',
    '  achievements   List CTF & competition placements',
    '  certifications List certifications & trainings',
    '  neofetch       System info / about card',
    '  whoami         Print current user',
    '  ls [path]      List directory contents',
    '  cd [path]      Change directory',
    '  pwd            Print working directory',
    '  cat <file>     Print file contents',
    '  tree           Show filesystem tree',
    '  echo <txt>     Print text',
    '  history        Show command history',
    '  clear          Clear screen',
    '  date           Print date',
    '  uname [-a]     Print kernel info',
    '  nmap <target>  Scan a target (jokes ahead)',
    '  open <app>     Open a desktop app (terminal, files, projects, editor, browser, settings, music, resume, achievements, burp)',
    '  sudo <cmd>     Try things you can\'t do',
    '  exit           Close terminal',
    '',
    C.dim('pipes work too: ls | grep md'),
  ];

  cmds.about = () => {
    const u = PORTFOLIO.user;
    return [
      <span><span style={{color:'var(--accent)',fontWeight:600}}>{u.name}</span> <span style={{color:'var(--dim)'}}>({u.alias})</span></span>,
      C.dim(u.title),
      '',
      ...u.bio,
      '',
      <span>{C.accent('Location:')} {u.location}</span>,
      <span>{C.accent('Email:   ')} {u.email}</span>,
      <span>{C.accent('GitHub:  ')} {u.links.github}</span>,
      <span>{C.accent('THM:     ')} {u.links.tryhackme}</span>,
    ];
  };

  cmds.projects = () => {
    const out = [<span style={{color:'var(--accent)',fontWeight:600}}>Projects</span>, ''];
    PORTFOLIO.projects.forEach(p => {
      out.push(<span><span style={{color:'var(--green)'}}>● {p.name}</span> {C.dim(`  ${p.year}`)}</span>);
      out.push(<span style={{paddingLeft:'2ch'}}>{p.blurb}</span>);
      out.push(<span style={{paddingLeft:'2ch'}}>{C.dim(p.stack.join(' · '))}</span>);
      if (p.link && p.link !== '—') out.push(<span style={{paddingLeft:'2ch'}}>{C.accent(p.link)}</span>);
      out.push('');
    });
    out.push(C.dim('tip: cat ~/projects/DEADNET.md  or run: open projects  for the visual gallery'));
    return out;
  };

  cmds.skills = () => {
    const out = [];
    Object.entries(PORTFOLIO.skills).forEach(([cat, items]) => {
      out.push(<span><span style={{color:'var(--accent)',fontWeight:600}}>[{cat}]</span></span>);
      out.push(<span style={{paddingLeft:'2ch'}}>{items.join(' · ')}</span>);
      out.push('');
    });
    return out;
  };

  cmds.contact = () => {
    const u = PORTFOLIO.user;
    return [
      <span>{C.accent('email      ')} {u.email}</span>,
      <span>{C.accent('phone      ')} {u.phone}</span>,
      <span>{C.accent('github     ')} {u.links.github}</span>,
      <span>{C.accent('tryhackme  ')} {u.links.tryhackme}</span>,
      <span>{C.accent('linkedin   ')} {u.links.linkedin}</span>,
      '',
      C.dim('or run: sudo hire-me'),
    ];
  };

  cmds.resume = () => {
    ctx.openApp('resume');
    return [C.dim('opening resume…')];
  };

  cmds.achievements = () => {
    const out = [<span style={{color:'var(--accent)',fontWeight:600}}>Achievements</span>, ''];
    PORTFOLIO.achievements.forEach(a => {
      const marker = a.highlight ? <span style={{color:'var(--yellow)'}}>★</span> : <span style={{color:'var(--green)'}}>●</span>;
      out.push(<span>{marker} {a.title} {a.year ? C.dim(` (${a.year})`) : ''}</span>);
      out.push(<span style={{paddingLeft:'2ch'}}>{C.dim(a.result)}</span>);
      out.push('');
    });
    out.push(C.dim('tip: open achievements'));
    return out;
  };

  cmds.certifications = () => {
    const out = [<span style={{color:'var(--accent)',fontWeight:600}}>Certifications</span>, ''];
    PORTFOLIO.certifications.forEach(c => {
      out.push(<span><span style={{color:'var(--green)'}}>●</span> {c.name}</span>);
      out.push(<span style={{paddingLeft:'2ch'}}>{C.dim(c.date)}</span>);
      out.push('');
    });
    return out;
  };

  cmds.whoami = () => [PORTFOLIO.user.handle];

  cmds.pwd = () => [pathStr(ctx.cwd)];

  cmds.date = () => [new Date().toString()];

  cmds.uname = (args) => {
    const a = args.join(' ');
    if (a.includes('-a')) return [`Linux ${PORTFOLIO.user.host} 6.8.12-amd64 #1 SMP PREEMPT_DYNAMIC Kali x86_64 GNU/Linux`];
    return ['Linux'];
  };

  cmds.echo = (args) => [args.join(' ')];

  cmds.clear = () => { ctx.clear(); return []; };

  cmds.history = () => ctx.getHistory().map((h, i) => `${String(i + 1).padStart(4)}  ${h}`);

  cmds.exit = () => { ctx.closeWindow(); return []; };

  cmds.ls = (args) => {
    // ignore flags except -a
    const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const target = args.find(a => !a.startsWith('-')) || '.';
    const parts = resolvePath(ctx.cwd, target);
    const node = getNode(parts);
    if (!node) return [C.err(`ls: cannot access '${target}': No such file or directory`)];
    if (node.type === 'file') return [target];
    const names = Object.keys(node.children).filter(n => showHidden || !n.startsWith('.'));
    names.sort();
    if (names.length === 0) return [C.dim('(empty)')];
    // grid output: render with colors
    return [
      <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0 2ch' }}>
        {names.map(n => {
          const child = node.children[n];
          if (child.type === 'dir') return <span key={n} style={{ color: 'var(--accent)', fontWeight: 600 }}>{n}/</span>;
          if (n.endsWith('.md')) return <span key={n} style={{ color: 'var(--cyan)' }}>{n}</span>;
          if (n.endsWith('.txt')) return <span key={n} style={{ color: 'var(--text)' }}>{n}</span>;
          if (n.startsWith('.')) return <span key={n} style={{ color: 'var(--dim)' }}>{n}</span>;
          return <span key={n}>{n}</span>;
        })}
      </span>
    ];
  };

  cmds.cd = (args) => {
    const t = args[0] || '~';
    const parts = resolvePath(ctx.cwd, t);
    const node = getNode(parts);
    if (!node) return [C.err(`cd: no such file or directory: ${t}`)];
    if (node.type !== 'dir') return [C.err(`cd: not a directory: ${t}`)];
    ctx.setCwd(parts);
    return [];
  };

  cmds.cat = (args) => {
    if (args.length === 0) return [C.err('cat: missing operand')];
    const out = [];
    for (const target of args) {
      const parts = resolvePath(ctx.cwd, target);
      const node = getNode(parts);
      if (!node) { out.push(C.err(`cat: ${target}: No such file or directory`)); continue; }
      if (node.type === 'dir') { out.push(C.err(`cat: ${target}: Is a directory`)); continue; }
      // Easter egg: secret flag
      if (target.includes('flag.txt')) {
        ctx.toast('🚩 Flag captured', 'You really did read /etc/secrets — respect.');
      }
      out.push(...node.body.split('\n').map(l => renderMdLine(l)));
    }
    return out;
  };

  function renderMdLine(line) {
    if (line.startsWith('# ')) return <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{line.slice(2)}</span>;
    if (line.startsWith('## ')) return <span style={{ color: 'var(--accent)' }}>{line.slice(3)}</span>;
    if (line.startsWith('> ')) return <span style={{ color: 'var(--dim)', fontStyle: 'italic' }}>{line.slice(2)}</span>;
    if (line.startsWith('- ')) return <span><span style={{color:'var(--accent)'}}>·</span> {line.slice(2)}</span>;
    return line;
  }

  cmds.tree = (args) => {
    const target = args[0] || '.';
    const parts = resolvePath(ctx.cwd, target);
    const node = getNode(parts);
    if (!node) return [C.err(`tree: ${target}: No such file or directory`)];
    const out = [<span style={{color:'var(--accent)'}}>{pathStr(parts)}</span>];
    function walk(n, prefix) {
      if (n.type !== 'dir') return;
      const keys = Object.keys(n.children).filter(k => !k.startsWith('.'));
      keys.forEach((k, i) => {
        const last = i === keys.length - 1;
        const child = n.children[k];
        const isDir = child.type === 'dir';
        out.push(<span>{prefix}{last ? '└── ' : '├── '}{isDir ? <span style={{color:'var(--accent)',fontWeight:600}}>{k}/</span> : k}</span>);
        if (isDir) walk(child, prefix + (last ? '    ' : '│   '));
      });
    }
    walk(node, '');
    return out;
  };

  cmds.neofetch = () => {
    const u = PORTFOLIO.user;
    const art = [
      "        ⢀⣴⣶⣶⣶⣦⡀        ",
      "      ⢠⣾⣿⣿⣿⣿⣿⣿⣿⣦⡀      ",
      "    ⣰⣿⣿⡿⠋⢉⣉⡙⠻⣿⣿⣿⣧⡀    ",
      "   ⣼⣿⣿⠟⢀⣾⣿⣿⣿⣦⡈⠻⣿⣿⣧   ",
      "  ⢠⣿⣿⠟  ⠛⠛⠛⠛⠛  ⠹⣿⣿⡀  ",
      "  ⣿⣿⠏   ⢀⣀⣀⣀⡀   ⠹⣿⣿  ",
      "  ⣿⣿  ⢀⣴⣿⣿⣿⣿⣿⣿⣦⡀  ⣿⣿  ",
      "  ⢿⣿⡆ ⠹⣿⣿⡿⠿⠿⢿⣿⣿⠏ ⢰⣿⡿  ",
      "   ⠻⣿⣷⣄  ⠉⠛⠿⠟⠉  ⣠⣾⣿⠟   ",
      "    ⠈⠻⢿⣿⣶⣤⣄⣀⣠⣤⣶⣿⡿⠋    ",
      "       ⠉⠛⠿⠿⠿⠿⠛⠉       ",
    ];
    const info = [
      <span>{C.accent(`${u.handle}@${u.host}`)}</span>,
      <span>{C.dim('-----------------')}</span>,
      <span>{C.accent('OS:       ')}Kali GNU/Linux Rolling x86_64</span>,
      <span>{C.accent('Host:     ')}Portfolio Edition</span>,
      <span>{C.accent('Kernel:   ')}6.8.12-amd64</span>,
      <span>{C.accent('Uptime:   ')}{Math.floor(performance.now() / 1000)}s</span>,
      <span>{C.accent('Packages: ')}{PORTFOLIO.projects.length} projects · {Object.values(PORTFOLIO.skills).flat().length} skills</span>,
      <span>{C.accent('Shell:    ')}bash 5.2.21</span>,
      <span>{C.accent('Terminal: ')}qterminal (portfolio mode)</span>,
      <span>{C.accent('CPU:      ')}Curiosity @ 4.2GHz (12c/24t)</span>,
      <span>{C.accent('Memory:   ')}coffee / unlimited</span>,
      '',
      <span>{C.accent('Title:    ')}{u.title}</span>,
      <span>{C.accent('Email:    ')}{u.email}</span>,
      <span>{C.accent('GitHub:   ')}{u.links.github}</span>,
    ];
    // Side-by-side
    return [
      <div style={{ display: 'flex', gap: '2ch' }}>
        <div style={{ color: 'var(--accent)' }}>
          {art.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div>
          {info.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    ];
  };

  cmds.open = (args) => {
    const key = args[0];
    if (!key) return [C.err('open: usage: open <app>')];
    if (!ctx.apps[key]) return [C.err(`open: unknown app: ${key}`)];
    ctx.openApp(key);
    return [C.dim(`opening ${key}…`)];
  };

  cmds.sudo = (args) => {
    const sub = args.join(' ').trim();
    if (sub === 'hire-me' || sub === 'hire me') {
      const email = PORTFOLIO.user.email;
      const subject = encodeURIComponent('Hey s0L — I want to hire you');
      const body = encodeURIComponent('Hi Joseph,\n\nI came across your portfolio and I\'d love to discuss a potential opportunity.\n\nBest,');
      window.open(`mailto:${email}?subject=${subject}&body=${body}`);
      ctx.toast('hire-me', `Opening email client for ${email}`);
      return [
        C.ok('[sudo] authentication successful'),
        <span style={{color:'var(--ok)'}}>mailto: <span style={{color:'var(--accent)'}}>{email}</span></span>,
        C.dim('(your email client should open shortly)'),
      ];
    }
    if (sub === 'rm -rf /' || sub === 'rm -rf /*') {
      ctx.triggerGlitch();
      return [
        C.warn('rm: it is dangerous to operate recursively on \'/\''),
        C.warn('rm: use --no-preserve-root to override this failsafe'),
        C.dim('(nice try)'),
      ];
    }
    if (sub === 'apt update' || sub === 'apt install nmap') {
      return [
        'Hit:1 http://kali.download/kali kali-rolling InRelease',
        'Reading package lists... Done',
        C.ok('All packages are up to date.'),
      ];
    }
    return [C.err(`[sudo] ${PORTFOLIO.user.handle}: a password is required — and yours isn't it`)];
  };

  cmds['rm'] = (args) => {
    if (args.includes('-rf') && args.some(a => a === '/' || a === '/*')) {
      ctx.triggerGlitch();
      return [
        C.warn('rm: it is dangerous to operate recursively on \'/\''),
        C.warn('rm: use --no-preserve-root to override this failsafe'),
      ];
    }
    return [C.err('rm: this filesystem is read-only (it\'s a portfolio, friend)')];
  };

  cmds.nmap = (args) => {
    const target = args.find(a => !a.startsWith('-')) || `${PORTFOLIO.user.host}.local`;
    const now = new Date().toString().slice(0, 24);
    const ports = [
      ['22/tcp',  'open',     'ssh',    'OpenSSH 9.6p1 Debian'],
      ['80/tcp',  'open',     'http',   'caddy 2.7 (portfolio)'],
      ['443/tcp', 'open',     'https',  'caddy 2.7 (portfolio)'],
      ['1337/tcp','open',     'ctf',    'DEADNET v1.0'],
      ['3000/tcp','open',     'react',  'Vite dev server'],
      ['5432/tcp','filtered', 'postgres', '-'],
      ['6379/tcp','filtered', 'redis',  '-'],
      ['8443/tcp','open',     'burp',   'PortSwigger 2025.6'],
    ];
    const out = [
      `Starting Nmap 7.95 ( https://nmap.org ) at ${now}`,
      `Nmap scan report for ${target} (127.0.0.1)`,
      `Host is up (0.0001s latency).`,
      `Not shown: 990 closed tcp ports`,
      <span style={{ color: 'var(--accent)' }}>PORT      STATE     SERVICE   VERSION</span>,
    ];
    ports.forEach(p => {
      const stateColor = p[1] === 'open' ? 'var(--green)' : 'var(--yellow)';
      out.push(<span>{p[0].padEnd(10)}<span style={{ color: stateColor }}>{p[1].padEnd(10)}</span>{p[2].padEnd(10)}{p[3]}</span>);
    });
    out.push('');
    out.push(C.ok(`Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds`));
    out.push(C.dim('(this is a fake scan of a fake host — but the projects are real)'));
    return out;
  };

  cmds.man = (args) => {
    const c = args[0];
    if (!c) return [C.err('What manual page do you want?')];
    if (cmds[c]) return [`No manual entry for ${c}. Try \`help\` instead.`];
    return [C.err(`No manual entry for ${c}`)];
  };

  cmds.curl = (args) => {
    const url = args[0] || '';
    if (!url) return [C.err('curl: try \'curl --help\' for more information')];
    return [
      C.dim(`* connecting to ${url}…`),
      C.dim(`* connected`),
      C.dim(`> GET / HTTP/1.1`),
      C.dim(`< HTTP/1.1 200 OK`),
      '',
      `<html><body><h1>It works.</h1></body></html>`,
    ];
  };

  cmds.grep = (args) => {
    // pipes handle this — top-level grep with no input does nothing useful
    return [C.dim('(grep expects piped input)')];
  };

  cmds.base64 = (args) => {
    if (!args.length) return ['usage: base64 [-d] <string>'];
    if (args[0] === '-d') {
      if (!args[1]) return [C.err('base64: missing operand after -d')];
      try { return [atob(args[1])]; }
      catch { return [C.err('base64: invalid base64 input')]; }
    }
    return [btoa(args.join(' '))];
  };

  // alias
  cmds.ll = (a) => cmds.ls(['-la', ...a]);
  cmds.dir = cmds.ls;

  return cmds;
}

// ---------- Terminal component ----------
function TerminalApp({ openApp, closeWindow, apps, toast, triggerGlitch }) {
  const homeCwd = ['home', PORTFOLIO.user.handle];
  const [lines, setLines] = useState(() => bannerLines());
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState(homeCwd);
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const cwdRef = useRef(cwd); cwdRef.current = cwd;
  const histRef = useRef(history); histRef.current = history;
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const append = useCallback((items) => {
    setLines(ls => [...ls, ...(Array.isArray(items) ? items : [items])]);
  }, []);

  const ctx = useRef({});
  ctx.current = {
    cwd, setCwd, openApp, closeWindow, apps, toast, triggerGlitch,
    getHistory: () => histRef.current,
    clear: () => setLines([]),
  };
  const cmds = useRef(makeCommands(new Proxy({}, {
    get(_, k) { return ctx.current[k]; }
  }))).current;

  // autoscroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  const focusInput = () => inputRef.current?.focus();

  // Run a piped command pipeline
  const runPipeline = (raw) => {
    const stages = raw.split('|').map(s => s.trim()).filter(Boolean);
    if (stages.length === 0) return [];
    let buffer = null; // string lines or jsx (jsx stages can't pipe to grep cleanly, we'll stringify)
    for (let i = 0; i < stages.length; i++) {
      const tok = tokenize(stages[i]);
      const name = tok[0];
      const args = tok.slice(1);
      // text-based pipes: grep, head, tail, wc, sort, uniq
      const isText = ['grep', 'head', 'tail', 'wc', 'sort', 'uniq'].includes(name);
      if (i === 0) {
        const fn = cmds[name];
        if (!fn) { return [C.err(`zsh: command not found: ${name}`)]; }
        const out = fn(args, ctx.current);
        buffer = out;
      } else {
        // Convert buffer to string lines
        const strLines = (buffer || []).map(item => typeof item === 'string' ? item : reactToText(item));
        if (name === 'grep') {
          const pat = (args.find(a => !a.startsWith('-')) || '').toLowerCase();
          buffer = strLines.filter(l => l.toLowerCase().includes(pat));
        } else if (name === 'head') {
          const n = parseInt(args.find(a => /^-?\d+$/.test(a)) || '10');
          buffer = strLines.slice(0, n);
        } else if (name === 'tail') {
          const n = parseInt(args.find(a => /^-?\d+$/.test(a)) || '10');
          buffer = strLines.slice(-n);
        } else if (name === 'wc') {
          const lines = strLines.length;
          const words = strLines.join(' ').split(/\s+/).filter(Boolean).length;
          const chars = strLines.join('\n').length;
          buffer = [`${lines} ${words} ${chars}`];
        } else if (name === 'sort') {
          buffer = [...strLines].sort();
        } else if (name === 'uniq') {
          buffer = strLines.filter((l, i, a) => i === 0 || a[i-1] !== l);
        } else if (!isText) {
          // Non-text pipe target — just run it ignoring stdin
          const fn = cmds[name];
          if (!fn) return [C.err(`zsh: command not found: ${name}`)];
          buffer = fn(args, ctx.current);
        }
      }
    }
    return buffer || [];
  };

  function reactToText(el) {
    if (typeof el === 'string') return el;
    if (typeof el === 'number') return String(el);
    if (!el) return '';
    if (Array.isArray(el)) return el.map(reactToText).join('');
    if (el.props && el.props.children) return reactToText(el.props.children);
    return '';
  }

  const submit = (raw) => {
    const line = raw;
    // Push the prompt + command line into output
    append([<div><Prompt cwd={cwdRef.current}/><span style={{ color: 'var(--text)' }}>{line}</span></div>]);
    if (line.trim()) {
      setHistory(h => [...h, line]);
    }
    const trimmed = line.trim();
    if (!trimmed) { setInput(''); setHistIdx(-1); return; }
    try {
      const out = runPipeline(trimmed);
      if (out.length) {
        append(out.map((l, i) => <div key={i}>{l}</div>));
      }
    } catch (err) {
      append([<div style={{ color: 'var(--red)' }}>err: {String(err.message || err)}</div>]);
    }
    setInput('');
    setHistIdx(-1);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0 || histIdx < 0) return;
      const idx = histIdx + 1;
      if (idx >= history.length) { setHistIdx(-1); setInput(''); }
      else { setHistIdx(idx); setInput(history[idx]); }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const completed = complete(input, cwd, cmds);
      if (completed !== null) setInput(completed);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      append([<div><Prompt cwd={cwdRef.current}/><span>{input}</span><span style={{color:'var(--red)'}}> ^C</span></div>]);
      setInput('');
    }
  };

  return (
    <div
      ref={containerRef}
      className="scrollable"
      onClick={focusInput}
      style={{
        width: '100%', height: '100%', overflow: 'auto',
        background: '#0c0f14',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        lineHeight: 1.45,
        padding: '10px 12px',
        color: 'var(--text)',
        userSelect: 'text',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {lines.map((l, i) => <div key={i}>{l}</div>)}
      <div>
        <Prompt cwd={cwd}/>
        <span style={{ position: 'relative' }}>
          <span>{input}</span>
          <span style={{
            display: 'inline-block', width: '0.55ch', height: '1.1em',
            background: 'var(--accent)', verticalAlign: 'text-bottom',
            animation: 'blink 1s steps(2) infinite', marginLeft: 1,
          }}/>
        </span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          style={{
            position: 'absolute', opacity: 0, pointerEvents: 'none',
            left: -9999, top: -9999, width: 1, height: 1,
          }}
        />
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

function bannerLines() {
  const u = PORTFOLIO.user;
  return [
    <div style={{ color: 'var(--accent)' }}>Welcome to Kali GNU/Linux Rolling (2025.2)</div>,
    <div style={{ color: 'var(--dim)' }}>* The quieter you become, the more you are able to hear.</div>,
    <div style={{ color: 'var(--dim)' }}>Last login: {new Date().toString().slice(0, 24)} on tty1</div>,
    <div>&nbsp;</div>,
    <div>Hi — I'm <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{u.name}</span> <span style={{ color: 'var(--dim)' }}>({u.alias})</span>.</div>,
    <div style={{ color: 'var(--dim)' }}>{u.title}</div>,
    <div>&nbsp;</div>,
    <div>Type <span style={{ color: 'var(--accent)' }}>help</span> for commands · <span style={{ color: 'var(--accent)' }}>about</span> · <span style={{ color: 'var(--accent)' }}>projects</span> · <span style={{ color: 'var(--accent)' }}>neofetch</span></div>,
    <div>&nbsp;</div>,
  ];
}

// tokenize a single command (no pipes here)
function tokenize(s) {
  // split by spaces, respect quotes
  const out = [];
  let cur = '', q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === q) { q = null; } else cur += c; }
    else if (c === '"' || c === "'") q = c;
    else if (c === ' ') { if (cur) { out.push(cur); cur = ''; } }
    else cur += c;
  }
  if (cur) out.push(cur);
  return out;
}

// Basic Tab completion: commands when at start, paths when after
function complete(input, cwd, cmds) {
  const tokens = input.split(' ');
  if (tokens.length === 1) {
    const prefix = tokens[0];
    const matches = Object.keys(cmds).filter(c => c.startsWith(prefix));
    if (matches.length === 1) return matches[0] + ' ';
    if (matches.length === 0) return null;
    // common prefix
    let cp = matches[0];
    for (const m of matches) while (!m.startsWith(cp)) cp = cp.slice(0, -1);
    return cp || null;
  } else {
    const last = tokens[tokens.length - 1];
    const slash = last.lastIndexOf('/');
    const dirPart = slash >= 0 ? last.slice(0, slash + 1) : '';
    const filePart = slash >= 0 ? last.slice(slash + 1) : last;
    const parts = resolvePath(cwd, dirPart || '.');
    const node = getNode(parts);
    if (!node || node.type !== 'dir') return null;
    const matches = Object.keys(node.children).filter(n => n.startsWith(filePart));
    if (matches.length === 0) return null;
    if (matches.length === 1) {
      const m = matches[0];
      const isDir = node.children[m].type === 'dir';
      tokens[tokens.length - 1] = dirPart + m + (isDir ? '/' : ' ');
      return tokens.join(' ');
    }
    let cp = matches[0];
    for (const m of matches) while (!m.startsWith(cp)) cp = cp.slice(0, -1);
    tokens[tokens.length - 1] = dirPart + cp;
    return tokens.join(' ');
  }
}

window.TerminalApp = TerminalApp;
