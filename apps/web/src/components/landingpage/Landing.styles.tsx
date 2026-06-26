export const GlobalStyles = () => (
  <style>{`
    :root {
      --bg:       #f8efdf;
      --paper:    #f8efdf;
      --ink:      #0d4a4e;
      --ink-soft: #2D453F;
      --muted:    #6B7770;
      --accent:   #0F4D3F;
      --coral:    #E8654C;
      --sage:     #A8C5A0;
      --line:     rgba(14, 42, 36, 0.12);
      --display:  'Fraunces', 'Syne', Georgia, serif;
      --body:     'Plus Jakarta Sans', 'Inter', sans-serif;
      --mono:     'JetBrains Mono', monospace;
    }
    html { scroll-behavior: smooth; background: var(--bg); }
    body { background: var(--bg); color: var(--ink); font-family: var(--body); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
    .Tooth Fairy a { text-decoration: none; color: inherit; }
    ::selection { background: var(--accent); color: var(--bg); }

    .deck { scroll-snap-type: y proximity; }
    .slide { scroll-snap-align: start; min-height: 100vh; position: relative; }

    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .marquee-track { display: flex; width: max-content; animation: marquee 38s linear infinite; }

    @keyframes grainShift {
      0% { transform: translate(0,0); } 25% { transform: translate(-4%,-2%); }
      50% { transform: translate(3%,-4%); } 75% { transform: translate(-2%,3%); } 100% { transform: translate(0,0); }
    }
    .paper-grain {
      position: fixed; inset: -10%; pointer-events: none; z-index: 200;
      opacity: 0.05; mix-blend-mode: multiply;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>");
      animation: grainShift 1.2s steps(6) infinite;
    }

    .slide-num {
      position: absolute; top: 100px; right: 40px;
      font-family: var(--mono); font-size: 11px; color: var(--muted);
      letter-spacing: 0.25em; text-transform: uppercase;
    }

    .eyebrow {
      font-family: var(--mono); font-size: 11px;
      letter-spacing: 0.25em; text-transform: uppercase;
      color: var(--accent);
    }

    .display {
      font-family: var(--display); font-weight: 500;
      letter-spacing: -0.025em; line-height: 0.98;
    }

    .ulink {
      position: relative; padding-bottom: 2px;
      background-image: linear-gradient(var(--ink), var(--ink));
      background-size: 0 1px; background-repeat: no-repeat; background-position: 0 100%;
      transition: background-size 0.4s ease;
    }
    .ulink:hover { background-size: 100% 1px; }

    .rail {
      position: fixed; left: 24px; top: 50%; transform: translateY(-50%);
      z-index: 130; display: flex; flex-direction: column; gap: 18px;
      padding: 8px 0;
    }
    .rail-item {
      display: inline-flex; align-items: center; gap: 14px;
      padding: 10px 12px; border-radius: 999px;
      color: var(--ink); text-decoration: none;
      transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .rail-item:hover {
      transform: translateX(0);
      background: rgba(15, 77, 63, 0.12);
      color: #2D453F;
    }
    .rail-item.active {
      background: rgba(15, 77, 63, 0.16);
      color: #2D453F;
    }
    .rail-dot {
      width: 22px; height: 22px; border-radius: 50%;
      border: 2px solid #7fbf8f; background: transparent;
      flex-shrink: 0;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12);
      transition: background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    }
    .rail-item:hover .rail-dot,
    .rail-item.active .rail-dot {
      background: #7fbf8f;
      border-color: #7fbf8f;
      transform: scale(1.1);
      box-shadow: 0 0 0 8px rgba(127,191,143,0.18);
    }
    .rail-label,
    .rail-index {
      opacity: 0;
      transform: translateX(-6px);
      transition: opacity 0.25s ease, transform 0.25s ease, color 0.25s ease;
      white-space: nowrap;
      color: var(--ink);
    }
    .rail-item:hover .rail-label,
    .rail-item:hover .rail-index,
    .rail-item.active .rail-label,
    .rail-item.active .rail-index {
      opacity: 1;
      transform: translateX(0);
      color: #2D453F;
    }
    .rail-label {
      font-size: 14px; font-weight: 500; letter-spacing: 0.01em;
    }
    .rail-index {
      font-family: var(--mono); font-size: 11px; color: var(--muted);
      letter-spacing: 0.2em;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px; }

    @media (max-width: 820px) {
      .rail { display: none; }
      .grid-2 { grid-template-columns: 1fr !important; }
      .grid-3 { grid-template-columns: 1fr !important; }
      .grid-4 { grid-template-columns: 1fr !important; }
      .grid-5 { grid-template-columns: 1fr 1fr !important; }
      .slide-num { top: 80px; right: 20px; }
      .nav-links { display: none !important; }
    }

    @media (prefers-reduced-motion: reduce) {
      .marquee-track, .paper-grain { animation: none !important; }
    }
  `}</style>
)
