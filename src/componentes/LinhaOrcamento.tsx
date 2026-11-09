import type { Budget } from "../tipos"
import { budgetStatus, statusTone } from "../utilitarios/calculos"
import { money } from "../utilitarios/formatacao"
import { Icone } from "./Icone"
import { SeloStatus } from "./SeloStatus"

export function LinhaOrcamento({
  item,
  compact = false,
}: {
  item: Budget & { spent: number }
  compact?: boolean
}) {
  const percent = item.limit ? (item.spent / item.limit) * 100 : 0
  const status = budgetStatus(percent)
  const tone = statusTone[status]
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
        <SeloStatus status={status} />
      </div>
      <div className="budget-numbers">
        <span>
          <strong>{money(item.spent)}</strong> de {money(item.limit)}
        </span>
        <b className={tone === "green" ? "" : `${tone}-text`}>{Math.round(percent)}%</b>
      </div>
      <div className="progress">
        <i className={tone} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
    </div>
  )
}
