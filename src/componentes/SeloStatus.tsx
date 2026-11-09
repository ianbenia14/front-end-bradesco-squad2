import type { BudgetStatus } from "../tipos"
import { statusTone } from "../utilitarios/calculos"

export function SeloStatus({ status }: { status: BudgetStatus }) {
  return <span className={`status-badge ${statusTone[status]}`}>{status}</span>
}
