// Portfolio content — Joseph Sollestre (s0L)
// Edit this file to update any text in the OS.

window.PORTFOLIO = {
  user: {
    handle: "s0L",
    host: "milkyway",
    name: "Joseph Sollestre",
    alias: "s0L",
    title: "Cybersecurity Enthusiast · Full Stack Dev · CTF Competitor · Grey Hat · Wannabe Pentester",
    location: "Infanta, Quezon, Philippines",
    phone: "+63 966 922 1451",
    email: "josephbenjamin.sollestre@gmail.com",
    resumePdf: "JSOLLESTRE-RESUME.pdf",
    bio: [
      "Cybersecurity focused Computer Science graduate pursuing a career in purple teaming and AI/ML security, with hands on CTF competition experience and a portfolio of security tools and platforms built from the ground up.",
      "I design and build everything from competition grade CTF platforms to CLI security tools and ML based vulnerability classifiers, blending offensive security knowledge with real development skills.",
      "Known for shipping polished, functional projects with a dark cyberpunk aesthetic."
    ],
    links: {
      github:   "github.com/creampuffenjoyer",
      tryhackme:"tryhackme.com/p/quackasaur",
      email:    "josephbenjamin.sollestre@gmail.com",
      linkedin: "linkedin.com/in/—",
    }
  },

  education: [
    { degree: "B.S. Computer Science, Major in Intelligent Systems", school: "Laguna State Polytechnic University, Siniloan", period: "Oct 2021 to June 2026" },
    { degree: "Junior High & Senior High School",                    school: "Infanta National High School",                 period: "July 2015 to July 2021" },
  ],

  certifications: [
    { name: "TryHackMe — Pre Security",       date: "May 7, 2026" },
    { name: "TryHackMe — Cyber Security 101", date: "May 18, 2026" },
    { name: "TryHackMe — AI Security",        date: "July 2026 to Present" },
  ],

  achievements: [
    { title: "2025 CyberEx Philippine Army TRON",  result: "1st Place, Regional Qualifiers · 1st Runner Up, National Finals", year: "2025", highlight: true },
    { title: "TryHackMe Ranking",                  result: "Top 40 all time country ranking · Top country ranking in May across Blue Team, Web Exploitation, and Prompt Injection rooms", year: "2026", highlight: true },
    { title: "CyLab Security Academy",             result: "Top Scorer (formerly PicoCTF platform)",                          year: "2026" },
    { title: "2024 Hack4Gov CALABARZON",           result: "1st Runner Up",                                                   year: "2024" },
    { title: "ASEAN CTF for Member States",        result: "Country Representative",                                         year: "2024" },
    { title: "Trend University Capture the Flag",  result: "University Representative",                                       year: "2024" },
    { title: "12th IT Skills Olympics",            result: "University Representative",                                      year: "2023" },
    { title: "10th TOPCIT Philippines",            result: "University Representative" },
  ],

  projects: [
    {
      name: "DEADNET",
      blurb: "Full stack, self hosted CTF competition platform with a cyberpunk aesthetic, built as an alternative to CTFd and HackTheBox.",
      stack: ["React", "Vite", "Tailwind CSS", "Framer Motion", "FastAPI", "PostgreSQL", "Redis", "Docker Compose", "Railway"],
      role: "Solo author (OJT project)",
      year: "2025",
      link: "deadnet-production.up.railway.app",
      details: [
        "Implemented a four role authentication hierarchy with JWT authentication, email verification, and password reset.",
        "Designed a Contract Board with rarity tiers and bounty decay, plus a live Redis cached Bounty Board across a multi organization architecture.",
        "Enforced server side flag comparison and identified and fixed flag exposure, XSS, race condition, and JWT misconfiguration vulnerabilities.",
        "Deployed on Railway behind a Cloudflare proxy."
      ]
    },
    {
      name: "SVAT",
      blurb: "Security Vulnerability Assessment Tool, a CatBoost machine learning pipeline classifying cybersecurity risk of inactive Philippine SUC student portals.",
      stack: ["Python 3.12", "FastAPI", "React 18", "Tailwind CSS", "PostgreSQL", "Redis", "Docker", "scikit-learn", "CatBoost"],
      role: "Thesis project",
      year: "2026",
      link: "—",
      details: [
        "Built a CatBoost ML pipeline classifying cybersecurity risk of inactive Philippine SUC student portals.",
        "Achieved 94.44% accuracy and a 0.9392 macro F1 score on classification results.",
        "Delivered a full stack app to present findings, pairing a FastAPI backend with a React and Tailwind CSS frontend."
      ]
    },
    {
      name: "Noctis",
      blurb: "AI powered CTF solver agent, a CLI tool that reasons through challenges autonomously.",
      stack: ["Python", "Gemini API", "Claude API"],
      role: "Solo author",
      year: "2025",
      link: "—",
      details: [
        "Multi-model agent: routes to Gemini for vision-heavy stego, Claude for crypto reasoning.",
        "Tool-use loop with self-correction; logs the full chain of thought per challenge.",
        "Currently autosolves ~40% of picoCTF entry-tier challenges end-to-end."
      ]
    },
    {
      name: "CryptKit",
      blurb: "Smart crypto + stego fingerprinting CLI — identifies challenge type with confidence scores and chains solvers automatically.",
      stack: ["Python", "Click"],
      role: "Solo author",
      year: "2024",
      link: "—",
      details: [
        "Heuristic + entropy-based fingerprinting across 30+ classic ciphers and stego formats.",
        "Confidence scoring so you know when to trust autopilot vs. drop to manual.",
        "Pluggable solver registry — add a new cipher in <50 lines."
      ]
    },
    {
      name: "G.L.S",
      blurb: "Git Leak Scanner — scans repositories for exposed secrets and sensitive data.",
      stack: ["Python"],
      role: "Solo author",
      year: "2024",
      link: "—",
      details: [
        "Walks full commit history (not just HEAD) — catches secrets that were 'removed' but still reachable.",
        "Tunable signature set: API keys, private keys, JWTs, common .env patterns.",
        "Outputs JSON for CI or a pretty TUI for humans."
      ]
    },
    {
      name: "J4GPU-A",
      blurb: "Phishing URL analyzer powered by GPU-accelerated inference.",
      stack: ["Python", "ONNX"],
      role: "Solo author",
      year: "2024",
      link: "—",
      details: [
        "Trained classifier exported to ONNX for fast batched inference on consumer GPUs.",
        "Feature pipeline: lexical, host-based, and content-based URL signals.",
        "Built originally as a class project; kept building because real phishing kits are nasty."
      ]
    },
    {
      name: "NULLKEY",
      blurb: "Password audit tool for security assessments.",
      stack: ["Python"],
      role: "Solo author",
      year: "2024",
      link: "—",
      details: [
        "Ingests password dumps, hashes, or live LDAP exports.",
        "Cracks against curated wordlists + rule-based mutations.",
        "Reports policy violations, reuse, and weak-pattern clusters."
      ]
    },
  ],

  skills: {
    "Offensive Security":            ["Penetration Testing", "Kali Linux", "Vulnerability Assessment", "Nmap", "Burp Suite", "OWASP ZAP", "Nikto", "Gobuster"],
    "Defensive Security & Forensics":["Digital Forensics", "Threat Hunting", "Log Analysis", "Network Traffic Analysis", "Wireshark", "Autopsy", "Volatility", "Sysmon", "SIEM"],
    "Application Security":          ["JWT & Auth Security", "Authorization Testing", "XSS Testing & Remediation", "Race Condition Analysis", "Secure Coding"],
    "AI/ML Security":                ["ML Based Vulnerability Classification", "Feature Engineering", "Model Development", "Scikit-learn", "CatBoost"],
    "Languages & Frameworks":        ["Python", "JavaScript", "SQL", "Bash", "React", "Vite", "FastAPI", "Tailwind CSS", "Framer Motion"],
    "Infrastructure":                ["Docker", "Docker Compose", "PostgreSQL", "Redis", "Railway", "Vercel", "Git/GitHub"],
    "CTF":                           ["Forensics", "Cryptography", "Steganography", "OSINT", "Web Exploitation", "Blue Team"],
    "Competencies":                  ["Microsoft Office", "Remote Access Administration", "Computer Management", "Organisational Skills", "Communication"],
  },

  experience: [
    { co: "Sabinex",         role: "Full Stack Developer & Penetration Tester", years: "Aug 2025 to Present", what: "Develop and maintain client websites and applications using Python and modern web technologies. Conduct authorized penetration testing and vulnerability assessments, testing authentication, authorization, and input validation across client portals with Kali Linux, Burp Suite, OWASP ZAP, and Nmap." },
    { co: "Freelance",       role: "Freelance Developer",            years: "Apr 2023 to Present", what: "Developed websites and applications for small clients using Python and web technologies. Built a sensor integrated automation program for an undergraduate thesis (Automated Dry Fish Machine)." },
    { co: "Freelance",       role: "Computer Technician & PC Builder",years: "Aug 2022 to Present", what: "Built, repaired, and optimized desktop systems based on client needs. Provided technical support, hardware diagnostics, and OS/software installations." },
    { co: "Jon Ron Clinic",  role: "Encoder",                        years: "Mar 2018 to Dec 2020", what: "Managed accurate data entry of patient records and administrative information. Ensured timely documentation and file organization." },
  ],

  fs: null
};

// Build the fake filesystem
(function buildFS() {
  const P = window.PORTFOLIO;
  const u = P.user.handle;
  const file = (body) => ({ type: 'file', body });
  const dir  = (children) => ({ type: 'dir', children });

  const aboutMd = [
    `# ${P.user.name}  (${P.user.alias})`,
    `> ${P.user.title}`,
    ``,
    `Location:  ${P.user.location}`,
    `Email:     ${P.user.email}`,
    `Phone:     ${P.user.phone}`,
    ``,
    ...P.user.bio,
    ``,
    `## Links`,
    `- GitHub:     ${P.user.links.github}`,
    `- TryHackMe:  ${P.user.links.tryhackme}`,
    `- LinkedIn:   ${P.user.links.linkedin}`,
  ].join('\n');

  const projectsDir = {};
  P.projects.forEach(p => {
    projectsDir[p.name + '.md'] = file([
      `# ${p.name}`,
      `_${p.blurb}_`,
      ``,
      `Role:   ${p.role}`,
      `Year:   ${p.year}`,
      `Stack:  ${p.stack.join(', ')}`,
      `Link:   ${p.link}`,
      ``,
      ...p.details.map(d => `- ${d}`),
    ].join('\n'));
  });

  const skillsTxt = Object.entries(P.skills)
    .map(([cat, items]) => `[${cat}]\n  ${items.join(', ')}`)
    .join('\n\n');

  const achievementsTxt = P.achievements
    .map(a => `  ${(a.year || '').padEnd(6)} ${a.title}\n         ${a.result}`)
    .join('\n\n');

  const educationTxt = P.education
    .map(e => `  ${e.period}\n    ${e.degree}\n    ${e.school}`)
    .join('\n\n');

  const certificationsTxt = P.certifications
    .map(c => `  ${c.name}\n    ${c.date}`)
    .join('\n\n');

  const cvTxt = [
    `${P.user.name}  (${P.user.alias})`,
    `${P.user.title}`,
    `${P.user.email}  ·  ${P.user.links.github}`,
    ``,
    `# EXPERIENCE`,
    ...P.experience.map(e => `  ${e.years}   ${e.role}  —  ${e.co}\n     ${e.what}`),
    ``,
    `# PROJECTS`,
    ...P.projects.map(p => `  · ${p.name}  —  ${p.blurb}\n      ${p.stack.join(' / ')}`),
    ``,
    `# SKILLS`,
    skillsTxt,
    ``,
    `# EDUCATION`,
    educationTxt,
    ``,
    `# CERTIFICATIONS`,
    certificationsTxt,
    ``,
    `# ACHIEVEMENTS`,
    achievementsTxt,
  ].join('\n');

  P.fs = dir({
    'home': dir({
      [u]: dir({
        'about.md':    file(aboutMd),
        'projects':    dir(projectsDir),
        'skills.txt':         file(skillsTxt),
        'education.txt':      file(educationTxt),
        'certifications.txt': file(certificationsTxt),
        'achievements.txt':   file(achievementsTxt),
        'cv.txt':      file(cvTxt),
        'contact.txt': file([
          `email      ${P.user.links.email}`,
          `phone      ${P.user.phone}`,
          `github     ${P.user.links.github}`,
          `tryhackme  ${P.user.links.tryhackme}`,
          `linkedin   ${P.user.links.linkedin}`,
        ].join('\n')),
        '.bashrc': file(`# ~/.bashrc — s0L\nexport PS1='\\u@\\h:\\w\\$ '\nalias ll='ls -la'\nalias gs='git status'\nexport EDITOR=nvim\n`),
        '.hidden': dir({
          'note.txt': file(`you found it.\ntry: sudo hire-me\nor press up,up,down,down,left,right,left,right,b,a\n\nstill curious? there's a clue1.txt here — decode it with: base64 -d\n`),
          'clue1.txt': file(`ZmxhZ3tzMExfZ290X3RoZV9zZWNvbmRfZmxhZ30=\n`),
        }),
      }),
    }),
    'etc': dir({
      'os-release': file(`NAME="Kali GNU/Linux"\nVERSION="2025.2"\nID=kali\nPRETTY_NAME="Kali Rolling"\n`),
      'motd': file(`The quieter you become, the more you are able to hear.\n`),
      'secrets': dir({
        'flag.txt': file(`flag{s0L_w4s_h3r3_4nd_y0u_f0und_th3_b1t}\n\nNice work. Email me the flag — I owe you a coffee.\n`),
        'readme.txt': file(`The real treasure is the flags we found along the way.\nCheck ~/.hidden/ for the second flag.\n`),
      }),
    }),
    'var': dir({
      'log': dir({
        'syslog': file(`May 22 09:14:01 kali systemd[1]: Started Daily Cleanup of Snapper Snapshots.\nMay 22 09:14:02 kali kernel: [ 1234.567] usb 1-1: new high-speed USB device\nMay 22 09:14:05 kali NetworkManager[812]: device (wlan0): supplicant state: completed\n`),
      }),
    }),
    'README': file(`Kali Rolling 2025.2\n\nThis is a portfolio. Open the Terminal and run \`help\`, or double-click anything\non the desktop.\n`),
  });
})();
