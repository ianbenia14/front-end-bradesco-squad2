import type { Transaction } from "../tipos"
import { transactions } from "../dados/transacoes"
import { round2 } from "./formatacao"

export const octTotal = (
  list: Transaction[],
  kind: "income" | "expense",
  category?: string,
) =>
  list
    .filter(
      (t) =>
        t.date.includes("Out") &&
        t.type === kind &&
        (!category || t.category === category),
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

export const summary = (list: Transaction[]) => {
  const income = round2(
    10050 + octTotal(list, "income") - octTotal(transactions, "income"),
  )
  const expense = round2(
    6284.3 + octTotal(list, "expense") - octTotal(transactions, "expense"),
  )
  return {
    income,
    expense,
    balance: round2(12480.5 + (income - 10050) - (expense - 6284.3)),
    period: round2(income - expense),
    prevIncome: 9290,
    prevExpense: 6504.8,
    prevPeriod: 2785.2,
  }
}
