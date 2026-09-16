/* global React, DragonWallpaper */
// Boot sequence: GRUB → kernel boot log → login → desktop
const { useState, useEffect, useRef } = React;

const GRUB_SECS = 5;

function BootGrub({ onPick }) {
  const [sel, setSel] = useState(0);
  const [countdown, setCountdown] = useState(GRUB_SECS);
  const [stopped, setStopped] = useState(false);

  const opts = [
    "MilkyWayOS GNU/Linux",
    "Advanced options for MilkyWayOS GNU/Linux",
    "Memory test (memtest86+x64, serial console)",
    "Memory test (memtest86+x64)",
    "UEFI Firmware Settings",
  ];

  // Keyboard handler
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Enter') { onPick(); return; }
      // Arrow keys change selection, any other key stops countdown
      if (e.key === 'ArrowDown') setSel(s => Math.min(opts.length - 1, s + 1));
      else if (e.key === 'ArrowUp') setSel(s => Math.max(0, s - 1));
      setStopped(true);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onPick]);

  // Live countdown — stops when user interacts
  useEffect(() => {
    if (stopped) return;
    if (countdown <= 0) { onPick(); return; }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, stopped, onPick]);

  return (
    <div className="grub">
      <div className="grub-header">
        <div className="grub-distro">MilkyWayOS</div>
      </div>
      <div className="grub-title">GNU GRUB  version 2.12</div>
      <div className="grub-menu">
        {opts.map((o, i) => (
          <div key={i} className={`grub-row ${i === sel ? 'selected' : ''}`}>
            {i === sel ? '* ' : '  '}{o}
          </div>
        ))}
      </div>
      <div className="grub-foot">
        <p>Use the <span className="grub-key">↑</span> and <span className="grub-key">↓</span> keys to select which entry is highlighted.</p>
        <p>Press enter to boot the selected OS, <span className="grub-key">e</span> to edit the commands</p>
        <p>before booting or <span className="grub-key">c</span> for a command-line.</p>
        <p>&nbsp;</p>
        {stopped
          ? <p className="grub-auto">Automatic boot suspended. Press ENTER to boot.</p>
          : <p className="grub-auto">The highlighted entry will be executed automatically in <span className="grub-count">{countdown}s</span>.</p>
        }
      </div>
    </div>
  );
}

const BOOT_LINES = [
  ["[    0.000000] Linux version 6.8.12-amd64 (galactic@milkyway) (gcc-13 (Debian 13.2.0-13) 13.2.0, GNU ld 2.42) #1 SMP PREEMPT_DYNAMIC", "dim"],
  ["[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.8.12-amd64 root=UUID=a1b2c3d4-e5f6-7890-abcd-ef1234567890 ro quiet splash loglevel=3", "dim"],
  ["[    0.000000] BIOS-provided physical RAM map:", "dim"],
  ["[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable", "dim"],
  ["[    0.000000] BIOS-e820: [mem 0x000000000009fc00-0x000000000009ffff] reserved", "dim"],
  ["[    0.000000] BIOS-e820: [mem 0x00000000000f0000-0x00000000000fffff] reserved", "dim"],
  ["[    0.000000] NX (Execute Disable) protection: active", "dim"],
  ["[    0.000005] x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'", "dim"],
  ["[    0.000005] x86/fpu: Supporting XSAVE feature 0x002: 'SSE registers'", "dim"],
  ["[    0.000005] x86/fpu: Supporting XSAVE feature 0x004: 'AVX registers'", "dim"],
  ["[    0.000006] x86/fpu: xstate_offset[2]:  576, xstate_sizes[2]:  256", "dim"],
  ["[    0.000009] signal: max sigframe size: 3632", "dim"],
  ["[    0.012402] ACPI: Early table checksum verification disabled", "dim"],
  ["[    0.012419] ACPI: RSDP 0x00000000000F05B0 000024 (v02 BOCHS )", "dim"],
  ["[    0.012424] ACPI: TABLE: RSDT 0x0000000007FE18CC 000044 (v01 BOCHS  BXPC     00000001 BXPC 00000001)", "dim"],
  ["[    0.024118] ACPI: IRQ0 used by override.", "dim"],
  ["[    0.038221] clocksource: tsc: mask: 0xffffffffffffffff max_cycles: 0x3a2d7a06c4e, max_idle_ns: 881590726959 ns", "dim"],
  ["[    0.048109] smpboot: CPU0: Stellar Core S-9100 24-thread Pulsar Processor (family: 0x6, model: 0xb4, stepping: 0x3)", "dim"],
  ["[    0.060022] Performance Events: PEBS fmt3+, Alderlake Hybrid events, 32-deep LBR, Intel PMU driver.", "dim"],
  ["[    0.072004] rcu: Hierarchical SRCU implementation.", "dim"],
  ["[    0.086113] random: crng init done", "dim"],
  ["[    0.102550] PCI: Using configuration type 1 for base access", "dim"],
  ["[    0.118400] clocksource: Switched to clocksource tsc-early", "dim"],
  ["[    0.214006] systemd[1]: systemd 255.4-1+b1 running in system mode (+PAM +AUDIT +SELINUX ...)", "dim"],
  ["[    0.215010] systemd[1]: Detected architecture x86-64.", "dim"],
  ["[    0.216001] systemd[1]: Hostname set to <milkyway>.", "dim"],
  ["[    0.240002] systemd[1]: Starting Journal Service...", "dim"],
  ["[  OK  ] Started Journal Service.", "ok"],
  ["[  OK  ] Started udev Kernel Device Manager.", "ok"],
  ["[  OK  ] Listening on udev Control Socket.", "ok"],
  ["[  OK  ] Listening on udev Kernel Socket.", "ok"],
  ["[  OK  ] Mounted /boot/efi.", "ok"],
  ["[  OK  ] Mounted /proc/sys/fs/binfmt_misc.", "ok"],
  ["[  OK  ] Reached target Local File Systems (Pre).", "ok"],
  ["[  OK  ] Reached target Local File Systems.", "ok"],
  ["[  OK  ] Started Restore /run/initramfs on shutdown.", "ok"],
  ["[  OK  ] Started Load/Save Random Seed.", "ok"],
  ["[  OK  ] Started Create System Users.", "ok"],
  ["[  OK  ] Started Apply Kernel Variables.", "ok"],
  ["[  OK  ] Started Flush Journal to Persistent Storage.", "ok"],
  ["[  OK  ] Started Network Time Synchronization.", "ok"],
  ["[  OK  ] Reached target System Initialization.", "ok"],
  ["[  OK  ] Started Daily apt download activities.", "ok"],
  ["[  OK  ] Started Daily apt upgrade and clean activities.", "ok"],
  ["[  OK  ] Reached target Timers.", "ok"],
  ["[  OK  ] Listening on D-Bus System Message Bus Socket.", "ok"],
  ["[  OK  ] Listening on Avahi mDNS/DNS-SD Stack Activation Socket.", "ok"],
  ["[  OK  ] Reached target Sockets.", "ok"],
  ["[  OK  ] Reached target Basic System.", "ok"],
  ["[  OK  ] Started D-Bus System Message Bus.", "ok"],
  ["[  OK  ] Started Avahi mDNS/DNS-SD Stack.", "ok"],
  ["[  OK  ] Started Network Manager.", "ok"],
  ["[  OK  ] Reached target Network.", "ok"],
  ["[  OK  ] Started Bluetooth Service.", "ok"],
  ["[  OK  ] Started Stellar Cartography Service (sagittarius-a.service).", "ok"],
  ["[  OK  ] Started Nebula Renderer (nebulad.service).", "ok"],
  ["[  OK  ] Started OpenSSH server daemon (sshd.service).", "ok"],
  ["[  OK  ] Reached target Multi-User System.", "ok"],
  ["[  OK  ] Started LightDM Display Manager.", "ok"],
  ["         Welcome to MilkyWayOS Rolling (2026.1) — 200 billion stars and counting.", "ok"],
];

function BootLog({ onDone }) {
  const [lines, setLines] = useState([]);
  const ref = useRef(null);
  const idxRef = useRef(0);
  useEffect(() => {
    let cancel = false;
    let finished = false;
    const tick = () => {
      if (cancel) return;
      const idx = idxRef.current;
      if (idx >= BOOT_LINES.length) {
        if (!finished) { finished = true; setTimeout(() => { if (!cancel) onDone(); }, 600); }
        return;
      }
      const line = BOOT_LINES[idx];
      setLines(prev => [...prev, line]);
      idxRef.current = idx + 1;
      // dim lines (early kernel) print fast; [OK] systemd lines are slightly slower
      const isOk = line[1] === 'ok';
      setTimeout(tick, isOk ? 80 + Math.random() * 120 : 35 + Math.random() * 55);
    };
    tick();
    const skip = (e) => { if (e.key) { cancel = true; onDone(); } };
    window.addEventListener('keydown', skip);
    return () => { cancel = true; window.removeEventListener('keydown', skip); };
  }, [onDone]);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);
  return (
    <div className="boot-log" ref={ref}>
      {lines.filter(Array.isArray).map(([txt, cls], i) => (
        <div key={i} className={cls}>{txt}</div>
      ))}
      <div className="dim">_</div>
    </div>
  );
}

function LoginScreen({ user, onAuth }) {
  const [pw, setPw] = useState('');
  const [shake, setShake] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(id);
  }, []);
  const submit = (e) => {
    e?.preventDefault();
    if (!pw.trim()) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    onAuth();
  };
  return (
    <div className="login">
      <div className="login-wp" style={{ backgroundImage: 'url(photos/nebula1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top' }}/>
      <div className="login-card" style={shake ? { animation: 'shake .35s' } : null}>
        <img src="photos/mash.gif" alt="avatar" className="login-avatar" style={{ objectFit: 'cover', padding: 0, background: 'none' }}/>
        <div style={{ textAlign: 'center' }}>
          <div className="login-name">{user.alias}@{user.host}</div>
          <div className="login-host">{user.name}</div>
        </div>
        <form onSubmit={submit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            ref={inputRef}
            className="login-input"
            type="password"
            placeholder="just type password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button type="submit" className="login-btn">Unlock</button>
          <div className="login-hint" style={{ textAlign: 'center' }}>Welcome!</div>
        </form>
        <div style={{ fontSize: 10, color: 'var(--dim)' }}>
          {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} · {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
      </div>
    </div>
  );
}

function BootSequence({ user, onDone }) {
  const [stage, setStage] = useState('grub'); // grub | log | login
  if (stage === 'grub') return <BootGrub onPick={() => setStage('log')}/>;
  if (stage === 'log')  return <div className="boot"><BootLog onDone={() => setStage('login')}/></div>;
  return <LoginScreen user={user} onAuth={onDone}/>;
}

window.BootSequence = BootSequence;
