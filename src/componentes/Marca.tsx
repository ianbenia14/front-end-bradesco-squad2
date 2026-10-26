import { Icone } from "./Icone"

export function Marca({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`brand ${dark ? "brand-dark" : ""}`}>
      <span className="brand-mark">
        <Icone name="chart" size={22} />
      </span>
      <span>Saldo</span>
      <b>+</b>
    </div>
  )
}
