import type { IconName } from "../tipos"
import { Cartao } from "./Cartao"
import { Icone } from "./Icone"

export function CartaoEstatistica({
  label,
  value,
  trend,
  hint,
  icon,
  tone = "green",
}: {
  label: string
  value: string
  trend?: string
  hint?: string
  icon: IconName
  tone?: string
}) {
  return (
    <Cartao className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icone name={icon} />
      </div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {trend ? (
          <small className={trend.startsWith("+") ? "positive" : "negative"}>
            <Icone
              name={trend.startsWith("+") ? "arrow-up" : "arrow-down"}
              size={14}
            />
            {trend} <em>vs. mês anterior</em>
          </small>
        ) : (
          <small className="hint">{hint}</small>
        )}
      </div>
    </Cartao>
  )
}
