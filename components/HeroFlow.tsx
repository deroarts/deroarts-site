/**
 * HeroFlow — illustrazione dell'hero.
 * Concetto (brand DeroArts): le 4 linee della struttura tecnica CONVERGONO nella
 * punta del pennino della piuma-icona di DeroArts — come se la penna le scrivesse.
 *
 * La piuma è un TRACCIATO vettoriale (deroarts-piuma-nera.svg, viewBox 585×744),
 * ricolorato col gradiente verde del brand. Disegnata nello STESSO viewBox delle
 * linee tramite un <g> con transform, così punta e connettori combaciano al pixel
 * a ogni dimensione. Solo CSS per le animazioni, no JS. Rispetta reduced-motion.
 */

// path della piuma (dal file public/brand/deroarts-piuma-nera.svg, viewBox 585×744)
const FEATHER_PATH =
  "M 84.08 740.05 C 107.81 735.62 128.39 729.67 146.50 722.01 C 215.09 693.03 245.91 685.18 280.20 687.96 C 303.78 689.86 315.03 693.10 368.84 713.44 C 379.19 717.35 397.98 722.40 408.00 723.97 C 411.57 724.53 420.50 724.99 427.82 724.99 C 447.49 725.00 464.66 720.76 482.43 711.50 C 489.43 707.85 498.32 701.59 501.40 698.13 C 503.28 696.04 503.28 696.00 501.40 696.02 C 500.36 696.04 496.80 697.20 493.50 698.61 C 469.56 708.83 440.54 711.32 414.50 705.39 C 403.99 703.00 383.54 696.35 375.03 692.56 C 370.89 690.71 361.88 686.88 355.00 684.04 C 348.12 681.20 340.02 677.75 337.00 676.38 C 331.55 673.91 322.82 671.15 305.51 666.43 C 283.51 660.43 249.37 661.03 225.00 667.85 C 211.84 671.53 205.55 673.53 195.69 677.14 C 189.54 679.40 182.47 682.26 180.00 683.50 C 177.53 684.74 172.35 686.98 168.50 688.48 C 164.65 689.98 159.03 692.44 156.00 693.96 C 152.97 695.47 144.88 699.08 138.00 701.98 C 131.12 704.88 121.90 708.81 117.50 710.72 C 86.79 724.01 46.77 733.00 18.31 733.00 C 9.11 733.00 7.16 732.75 7.60 731.61 C 8.42 729.47 47.75 694.04 69.00 676.28 C 76.97 669.62 77.74 668.66 78.92 663.78 C 81.95 651.25 85.18 637.17 85.97 633.00 C 86.44 630.52 87.80 625.12 88.99 621.00 C 93.34 605.95 101.05 574.58 100.66 573.56 C 100.42 572.92 96.89 572.52 91.88 572.56 L 83.50 572.62 L 76.65 585.06 C 72.88 591.90 68.42 600.20 66.74 603.50 C 61.85 613.12 52.85 628.18 52.31 627.64 C 51.71 627.04 59.37 595.81 62.12 587.65 C 63.20 584.43 65.19 577.23 66.53 571.65 C 67.87 566.07 69.27 560.44 69.63 559.15 C 70.96 554.40 67.26 557.50 59.38 567.76 C 55.05 573.40 49.92 580.24 48.00 582.95 C 40.33 593.76 24.90 612.89 16.92 621.50 C 12.39 626.38 12.27 626.69 11.68 634.50 C 9.63 661.58 7.94 678.65 4.49 707.00 C 1.93 728.05 1.67 733.48 3.15 734.68 C 3.89 735.28 6.52 736.08 9.00 736.46 C 11.48 736.83 14.87 737.56 16.55 738.08 C 29.99 742.23 66.70 743.30 84.08 740.05 Z M 117.08 553.92 C 131.61 551.01 137.42 549.26 154.50 542.67 C 167.38 537.70 176.10 533.64 182.19 529.75 C 185.11 527.89 188.92 525.67 190.66 524.81 C 195.89 522.22 216.72 507.01 225.91 499.08 C 243.43 483.95 266.71 458.64 280.03 440.24 C 283.54 435.39 281.76 434.42 273.89 436.90 C 263.86 440.06 257.38 440.86 228.50 442.52 C 213.65 443.38 198.63 444.53 195.12 445.08 C 189.28 445.99 185.75 445.70 189.11 444.58 C 193.86 442.99 215.13 437.06 230.50 433.05 C 257.21 426.07 275.28 419.03 291.18 409.41 C 316.99 393.80 345.60 365.55 375.04 326.62 C 382.88 316.25 382.87 314.72 374.99 317.02 C 364.37 320.12 352.93 321.19 321.00 322.05 C 302.57 322.55 286.15 323.25 284.50 323.61 C 282.53 324.03 281.84 323.91 282.50 323.27 C 283.55 322.24 310.60 315.54 320.00 313.98 C 327.98 312.66 345.04 308.72 356.01 305.67 C 379.13 299.23 402.15 286.82 423.00 269.55 C 438.97 256.32 464.96 228.87 473.64 216.04 C 474.95 214.09 478.31 209.35 481.09 205.50 C 488.74 194.90 500.00 177.92 500.00 176.97 C 500.00 175.53 496.17 174.84 494.16 175.91 C 490.49 177.88 470.78 178.91 452.24 178.11 C 431.86 177.23 428.18 176.31 438.50 174.67 C 440.15 174.41 446.45 173.26 452.50 172.11 C 458.55 170.97 467.10 169.36 471.50 168.54 C 496.73 163.83 513.24 155.09 529.45 137.86 C 536.37 130.51 538.50 127.00 536.06 127.00 C 535.54 127.00 531.64 128.58 527.40 130.51 C 523.16 132.45 519.55 133.88 519.38 133.71 C 519.20 133.53 522.46 130.53 526.62 127.03 C 551.01 106.51 567.20 78.27 578.22 37.00 C 582.40 21.37 584.41 2.00 581.85 2.00 C 581.22 2.00 578.86 3.49 576.60 5.31 C 570.08 10.58 561.45 15.41 548.00 21.30 C 530.82 28.83 523.19 31.09 474.50 43.09 C 465.15 45.40 454.57 48.28 451.00 49.49 C 438.04 53.89 423.18 59.94 418.33 62.81 C 415.60 64.42 411.82 66.47 409.93 67.38 C 403.62 70.41 388.80 82.18 377.18 93.40 C 366.90 103.32 350.00 122.89 350.00 124.86 C 350.00 125.93 345.89 130.23 345.37 129.71 C 344.08 128.41 361.10 93.63 366.60 86.32 C 367.92 84.57 369.00 82.88 369.00 82.57 C 369.00 77.74 329.73 99.67 305.36 118.10 C 283.68 134.51 261.77 155.09 247.03 172.90 C 231.14 192.09 214.80 220.46 206.36 243.50 C 204.48 248.62 196.92 272.79 196.26 275.76 C 195.70 278.29 193.99 279.85 194.01 277.81 C 194.02 277.09 194.47 269.98 195.03 262.00 C 196.15 245.88 196.60 243.09 201.72 221.23 C 203.69 212.83 204.97 205.64 204.58 205.24 C 202.25 202.92 170.66 242.88 154.16 269.00 C 149.42 276.52 135.00 305.37 132.67 312.00 C 127.98 325.37 122.90 342.92 121.61 350.22 C 118.75 366.33 116.97 378.62 116.00 388.94 C 115.45 394.69 114.56 399.84 114.01 400.39 C 113.33 401.07 113.00 400.92 112.99 399.95 C 112.99 399.15 112.31 392.88 111.49 386.00 C 110.67 379.12 109.70 365.29 109.34 355.25 C 108.82 340.76 108.40 337.00 107.31 337.00 C 106.56 337.00 105.66 337.79 105.33 338.75 C 104.99 339.71 102.71 345.23 100.26 351.00 C 84.80 387.42 75.64 426.97 72.91 469.00 C 71.84 485.58 72.54 523.89 74.04 530.50 C 74.54 532.70 74.96 536.15 74.98 538.17 C 75.00 542.30 75.82 545.00 77.03 545.00 C 77.48 545.00 79.33 541.74 81.14 537.75 C 85.38 528.43 113.51 472.26 119.83 460.50 C 124.15 452.47 128.01 445.64 141.03 423.00 C 143.09 419.43 147.82 411.55 151.54 405.50 C 155.26 399.45 159.78 392.02 161.57 389.00 C 168.26 377.75 197.84 334.10 206.51 322.67 C 211.46 316.17 216.17 309.87 216.99 308.67 C 219.59 304.89 235.03 285.88 243.93 275.52 C 253.63 264.22 283.91 232.01 284.87 231.97 C 285.22 231.96 288.65 228.93 292.50 225.25 C 306.42 211.94 330.23 191.72 339.00 185.76 C 340.93 184.45 346.77 180.22 352.00 176.35 C 357.23 172.48 365.55 166.70 370.50 163.50 C 375.45 160.31 381.98 156.04 385.00 154.01 C 389.49 150.99 403.43 142.56 413.50 136.76 C 422.26 131.71 440.01 122.24 447.00 118.88 C 451.68 116.63 459.05 113.02 463.38 110.86 C 467.72 108.70 471.51 107.17 471.80 107.47 C 472.52 108.19 472.34 108.32 465.50 111.92 C 458.76 115.46 458.97 115.33 435.28 130.08 C 393.14 156.32 354.95 183.80 330.00 205.83 C 300.44 231.93 271.45 262.03 248.50 290.44 C 244.10 295.89 239.11 301.96 237.42 303.92 C 224.74 318.65 194.65 361.75 176.84 390.69 C 171.70 399.04 166.16 408.04 164.53 410.69 C 162.89 413.33 159.93 418.43 157.96 422.00 C 136.53 460.77 130.72 471.71 120.77 492.00 C 114.44 504.93 108.35 517.52 107.24 520.00 C 106.12 522.48 102.01 531.30 98.11 539.62 C 94.20 547.94 91.00 555.51 91.00 556.44 C 91.00 557.92 91.75 558.06 96.75 557.49 C 99.91 557.13 109.06 555.52 117.08 553.92 Z";

/* ────────────────────────────────────────────────────────────────────────────
 * GEOMETRIA — posizione BLINDATA della piuma (NON modificare senza motivo).
 * Tutto vive nello stesso viewBox 600×470: linee, nodo e piuma restano ancorati
 * tra loro a QUALSIASI dimensione schermo/finestra (l'SVG scala in blocco).
 * La posizione finale è definita QUI, in un unico punto:
 *   - TIP_X/TIP_Y : nodo di convergenza (dove le linee incontrano il pennino)
 *   - F_W         : larghezza piuma
 *   - FEATHER_NUDGE_X : micro-offset orizzontale approvato (posizione definitiva)
 * ──────────────────────────────────────────────────────────────────────────── */
const TIP_X = 360;
const TIP_Y = 322;

const F_W = 234;
const F_SCALE = F_W / 585; // scala uniforme path→viewBox
const TIP_PATH_X = 40;
const TIP_PATH_Y = 725;
const FEATHER_NUDGE_X = 12; // spostamento a destra approvato (stato finale)
const FEATHER_NUDGE_Y = -2; // leggero spostamento verso l'alto approvato

// traslazione: scale*(TIP_PATH) + offset = TIP, più i nudge definitivi
const F_TX = TIP_X - TIP_PATH_X * F_SCALE + FEATHER_NUDGE_X;
const F_TY = TIP_Y - TIP_PATH_Y * F_SCALE + FEATHER_NUDGE_Y;

export default function HeroFlow() {
  return (
    <div className="relative w-full select-none">
      <svg
        viewBox="0 0 600 470"
        fill="none"
        role="img"
        aria-label="Le strutture di software convergono nella punta della piuma di DeroArts, come se la scrivesse"
        className="w-full h-auto"
      >
        <defs>
          <linearGradient id="hf-line" x1="120" y1="235" x2="360" y2="322" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1E9E3D" />
            <stop offset="1" stopColor="#8FC603" />
          </linearGradient>
          {/* gradiente piuma (invertito): lime sul pennino (basso-sx) → verde vivo
              sulla punta (alto-dx). objectBoundingBox = si adatta al bounding box
              della piuma qualunque sia scala/posizione → punta SEMPRE ben colorata.
              Nel path la cima è in ALTO (y piccola) e il pennino in BASSO (y grande):
              y1=1 (basso=lime) → y2=0 (alto=verde vivo). */}
          <linearGradient id="hf-feather-grad" x1="0.25" y1="1" x2="0.75" y2="0">
            <stop offset="0" stopColor="#8FC603" />
            <stop offset="0.6" stopColor="#6FCC3A" />
            <stop offset="1" stopColor="#5FC336" />
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


        {/* la piuma del brand (tracciato vettoriale) nello stesso viewBox.
            Posizione blindata: tutto deriva da F_TX/F_TY/F_SCALE definiti sopra.
            Appare in dissolvenza dopo le linee (vedi .hf-feather in globals.css). */}
        <g className="hf-feather">
          <g transform={`translate(${F_TX} ${F_TY}) scale(${F_SCALE})`}>
            <path d={FEATHER_PATH} fill="url(#hf-feather-grad)" />
          </g>
        </g>
      </svg>
    </div>
  );
}
