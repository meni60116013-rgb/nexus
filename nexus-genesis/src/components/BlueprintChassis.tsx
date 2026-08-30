/**
 * Elemento de firma de Nexus: el chasis de una motocicleta dibujado como un
 * plano técnico (líneas, no fotos) que se "traza" con una animación de
 * stroke-dashoffset al entrar en pantalla, como si un ingeniero lo estuviera
 * dibujando en vivo. Reemplaza el hero fotográfico genérico de la versión
 * anterior por algo propio del dominio: un plano industrial real.
 */
export function BlueprintChassis({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 360"
      className={className}
      role="img"
      aria-label="Plano técnico de un chasis de motocicleta"
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#4FD8E0" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#4FD8E0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="640" height="360" fill="url(#glow)" />

      {/* ruedas */}
      <circle cx="140" cy="270" r="66" fill="none" stroke="#22343B" strokeWidth="2" />
      <circle cx="500" cy="270" r="66" fill="none" stroke="#22343B" strokeWidth="2" />
      <circle
        cx="140"
        cy="270"
        r="66"
        fill="none"
        stroke="#4FD8E0"
        strokeWidth="2"
        strokeDasharray="1400"
        className="animate-draw"
      />
      <circle
        cx="500"
        cy="270"
        r="66"
        fill="none"
        stroke="#4FD8E0"
        strokeWidth="2"
        strokeDasharray="1400"
        className="animate-draw"
        style={{ animationDelay: "0.15s" }}
      />

      {/* chasis / trellis */}
      <path
        d="M140 270 L 230 150 L 340 150 L 300 220 L 340 150 L 430 150 L 500 270 M230 150 L 260 210 L 340 210 M340 150 L 340 210"
        fill="none"
        stroke="#4FD8E0"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1400"
        className="animate-draw"
        style={{ animationDelay: "0.3s" }}
      />

      {/* motor */}
      <rect
        x="255"
        y="205"
        width="90"
        height="55"
        rx="6"
        fill="none"
        stroke="#EDEAE3"
        strokeWidth="1.5"
        strokeDasharray="1400"
        className="animate-draw"
        style={{ animationDelay: "0.5s" }}
      />

      {/* manubrio + horquilla */}
      <path
        d="M430 150 L 470 90 M450 96 L 490 96"
        fill="none"
        stroke="#EDEAE3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="200"
        className="animate-draw"
        style={{ animationDelay: "0.65s" }}
      />

      {/* cotas técnicas */}
      <g className="font-mono" fontSize="9" fill="#8FA3AA">
        <line x1="140" y1="340" x2="500" y2="340" stroke="#22343B" strokeWidth="1" />
        <line x1="140" y1="332" x2="140" y2="340" stroke="#22343B" strokeWidth="1" />
        <line x1="500" y1="332" x2="500" y2="340" stroke="#22343B" strokeWidth="1" />
        <text x="290" y="354">
          DISTANCIA ENTRE EJES · 1420mm
        </text>
      </g>
    </svg>
  );
}

