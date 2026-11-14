export function LogoSimbolo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Saldo+" className="logo-symbol">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14938A" />
          <stop offset="1" stopColor="#0B3B3A" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#logo-grad)" />
      <rect x="10" y="29" width="6.5" height="9" rx="2" fill="#fff" opacity=".7" />
      <rect x="19.5" y="22" width="6.5" height="16" rx="2" fill="#fff" />
      <rect x="29.5" y="15" width="10" height="4.4" rx="2.2" fill="#F2B84B" />
      <rect x="32.3" y="12.2" width="4.4" height="10" rx="2.2" fill="#F2B84B" />
      <rect x="29.5" y="29" width="6.5" height="9" rx="2" fill="#fff" opacity=".35" />
    </svg>
  )
}

export function Marca({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`brand ${dark ? "brand-dark" : ""}`}>
      <LogoSimbolo />
      <span>Saldo</span>
      <b>+</b>
    </div>
  )
}
