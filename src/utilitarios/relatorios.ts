import type { Budget, ReportSnapshot, Transaction } from "../tipos"
import { categoryTotals, inMonth, scoreFor, sumKind } from "./calculos"
import { monthKey } from "./datas"
import { round2 } from "./formatacao"

export const buildSnapshot = (list: Transaction[], budgets: Budget[], month: string): ReportSnapshot => {
  const scoped = inMonth(list, month)
  const income = sumKind(scoped, "income")
  const expense = sumKind(scoped, "expense")
  return {
    id: `r-${month}`,
    month,
    savedAt: new Date().toISOString(),
    income,
    expense,
    balance: round2(income - expense),
    score: scoreFor(list, budgets, month),
    ranking: categoryTotals(scoped),
  }
}

// Guarda automaticamente o relatório de cada mês já encerrado (RN009)
export const snapshotsFaltantes = (
  list: Transaction[],
  budgets: Budget[],
  existing: ReportSnapshot[],
  currentMonth: string,
) => {
  const months = Array.from(new Set(list.map((t) => monthKey(t.date)))).filter(
    (m) => m < currentMonth && !existing.some((r) => r.month === m),
  )
  return months.map((m) => buildSnapshot(list, budgets, m))
}
