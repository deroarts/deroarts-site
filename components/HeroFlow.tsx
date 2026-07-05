/**
 * HeroFlow — illustrazione dell'hero.
 * Concetto (brand DeroArts): le 4 linee della struttura tecnica CONVERGONO nella
 * punta del pennino della piuma-icona di DeroArts — come se la penna le scrivesse.
 *
 * Allineamento (chiave): la piuma è disegnata dentro lo STESSO viewBox SVG tramite
 * <image>, così la punta del pennino e i connettori vivono nello stesso sistema di
 * coordinate e combaciano al pixel. Nel PNG (585×744) la punta estrema del pennino
 * è a ~ (44, 692) → in frazione (0.075, 0.930). La piuma è collocata nel box così
 * che quel punto cada esattamente su TIP = (360, 322), dove finiscono le 4 linee.
 * Solo CSS per le animazioni, no JS. Rispetta prefers-reduced-motion.
 */

// punto di convergenza (punta del pennino) nel viewBox
const TIP_X = 360;
const TIP_Y = 322;

// geometria piuma nel viewBox: larghezza voluta e frazione della punta nel PNG
const F_W = 250; // larghezza render della piuma
const F_H = (F_W * 744) / 585; // = 318 (mantiene proporzioni)
const TIP_FRAC_X = 0.075;
const TIP_FRAC_Y = 0.93;
// origine (top-left) della piuma perché la punta cada su TIP
const F_X = TIP_X - F_W * TIP_FRAC_X;
const F_Y = TIP_Y - F_H * TIP_FRAC_Y;

export default function HeroFlow() {
  return (
    <div className="relative w-full select-none">
      <svg
        viewBox="0 0 580 470"
        fill="none"
        role="img"
        aria-label="Le strutture di software convergono nella punta della piuma di DeroArts, come se la scrivesse"
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="hf-line" x1="120" y1="235" x2="360" y2="322" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1E9E3D" />
            <stop offset="1" stopColor="#8FC603" />
          </linearGradient>
          <linearGradient id="hf-grid" x1="0" y1="0" x2="580" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8FC603" stopOpacity="0.5" />
            <stop offset="0.55" stopColor="#8FC603" stopOpacity="0.08" />
            <stop offset="1" stopColor="#8FC603" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* griglia tecnica */}
        <g stroke="url(#hf-grid)" strokeWidth="1">
          {[36, 76, 116, 156, 196, 236].map((x) => (
            <line key={`v${x}`} x1={x} y1="52" x2={x} y2="418" />
          ))}
          {[76, 124, 172, 220, 268, 316, 364].map((y) => (
            <line key={`h${y}`} x1="24" y1={y} x2="268" y2={y} />
          ))}
        </g>

        {/* moduli con micro-barre "dati" */}
        <g stroke="#8FC603" strokeOpacity="0.7" strokeWidth="1.4" fill="#8FC603" fillOpacity="0.035">
          <rect x="34" y="100" width="72" height="50" rx="8" />
          <rect x="130" y="164" width="90" height="44" rx="8" />
          <rect x="44" y="236" width="80" height="56" rx="8" />
          <rect x="142" y="318" width="68" height="46" rx="8" />
        </g>
        <g fill="#8FC603" fillOpacity="0.5">
          <rect x="46" y="112" width="36" height="4" rx="2" />
          <rect x="46" y="122" width="22" height="4" rx="2" />
          <rect x="142" y="178" width="48" height="4" rx="2" />
          <rect x="56" y="250" width="42" height="4" rx="2" />
          <rect x="56" y="260" width="28" height="4" rx="2" />
        </g>
        <g fill="#8FC603">
          {[[106, 125], [220, 186], [124, 264], [210, 341]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3.4" />
          ))}
        </g>

        {/* 4 connettori: tutti terminano ESATTAMENTE su TIP (360,322) */}
        <g stroke="url(#hf-line)" fill="none" strokeLinecap="round" className="hf-lines">
          <path d={`M106 125 C 240 140, 330 250, ${TIP_X} ${TIP_Y}`} strokeWidth="1.8" />
          <path d={`M220 186 C 300 225, 340 290, ${TIP_X} ${TIP_Y}`} strokeWidth="2" />
          <path d={`M124 264 C 240 295, 320 315, ${TIP_X} ${TIP_Y}`} strokeWidth="2.2" />
          <path d={`M210 341 C 285 342, 335 330, ${TIP_X} ${TIP_Y}`} strokeWidth="1.8" />
        </g>

        {/* la piuma del brand, nello stesso viewBox → punta allineata al pixel */}
        <image
          className="hf-feather"
          href="/brand/symbol-feather.png"
          x={F_X}
          y={F_Y}
          width={F_W}
          height={F_H}
        />
      </svg>

      <style>{`
        .hf-feather {
          opacity: 0;
          transform-box: view-box;
          transform-origin: ${TIP_X}px ${TIP_Y}px;
          transform: scale(.97);
          animation: hf-appear 1.4s cubic-bezier(.2,.7,.25,1) .5s forwards;
        }
        .hf-lines path {
          stroke-dasharray: 340;
          stroke-dashoffset: 340;
          animation: hf-draw 1.3s ease-out forwards;
        }
        .hf-lines path:nth-child(2) { animation-delay: .12s; }
        .hf-lines path:nth-child(3) { animation-delay: .24s; }
        .hf-lines path:nth-child(4) { animation-delay: .36s; }
        @keyframes hf-appear { to { opacity: 1; transform: scale(1); } }
        @keyframes hf-draw   { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .hf-feather { animation: none; opacity: 1; transform: none; }
          .hf-lines path { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
