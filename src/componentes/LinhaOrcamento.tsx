import type { Budget } from "../tipos"
import { money } from "../utilitarios/formatacao"
import { Icone } from "./Icone"

export function LinhaOrcamento({
  item,
  compact = false,
}: {
  item: Budget
  compact?: boolean
}) {
  const percent = Math.round((item.spent / item.limit) * 100)
  return (
    <div className={`budget-row ${compact ? "compact" : ""}`}>
      <div className="budget-info">
        <span className={`category-icon ${item.color}`}>
          <Icone name={item.icon} size={19} />
        </span>
        <div>
          <strong>{item.category}</strong>
          {!compact && <span>Orçamento mensal</span>}
        </div>
      </div>
      <div className="budget-numbers">
        <span>
          <strong>{money(item.spent)}</strong> de {money(item.limit)}
        </span>
        <b className={percent > 90 ? "warning-text" : ""}>{percent}%</b>
      </div>
      <div className="progress">
        <i
          className={`${item.color} ${percent > 90 ? "warning" : ""}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  )
}
