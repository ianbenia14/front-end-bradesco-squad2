import type { Budget, BudgetStatus, Goal, Transaction } from "../tipos"
import { REF_MONTH, monthKey, monthLabel, prevMonthKey } from "./datas"
import { money, round2 } from "./formatacao"

// Saldo anterior ao histórico de transações (dado de demonstração)
export const SALDO_INICIAL = 12480.5

export const inMonth = (list: Transaction[], key: string) =>
  list.filter((t) => monthKey(t.date) === key)

export const monthTotal = (
  list: Transaction[],
  key: string,
  kind: "income" | "expense",
  category?: string,
) =>
  round2(
    inMonth(list, key)
      .filter((t) => t.type === kind && (!category || t.category === category))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
  )

export const monthsWithData = (list: Transaction[]) =>
  Array.from(new Set(list.map((t) => monthKey(t.date)))).sort()

export const expenseByCategory = (list: Transaction[], key: string | "year") => {
  const result: Record<string, number> = {}
  list
    .filter(
      (t) =>
        t.type === "expense" &&
        (key === "year" ? monthKey(t.date).startsWith("2026") : monthKey(t.date) === key),
    )
    .forEach((t) => {
      result[t.category] = round2((result[t.category] ?? 0) + Math.abs(t.amount))
    })
  return Object.entries(result).sort((a, b) => b[1] - a[1])
}

export const expenseByEstablishment = (list: Transaction[], key: string | "year") => {
  const result: Record<string, number> = {}
  list
    .filter(
      (t) =>
        t.type === "expense" &&
        (key === "year" ? true : monthKey(t.date) === key),
    )
    .forEach((t) => {
      const name = t.establishment?.trim() || t.title
      result[name] = round2((result[name] ?? 0) + Math.abs(t.amount))
    })
  return Object.entries(result).sort((a, b) => b[1] - a[1])
}

// Faixas de alerta do orçamento (RF 3.4)
export const budgetStatus = (percent: number): BudgetStatus => {
  if (percent > 100) return "Estourado"
  if (percent >= 90) return "Risco"
  if (percent > 70) return "Atenção"
  return "Normal"
}

export const statusTone: Record<BudgetStatus, string> = {
  Normal: "green",
  Atenção: "orange",
  Risco: "red",
  Estourado: "red",
}

export const budgetUsage = (budget: Budget, list: Transaction[], key = REF_MONTH) => {
  const spent = monthTotal(list, key, "expense", budget.category)
  const percent = budget.limit ? (spent / budget.limit) * 100 : 0
  return {
    spent,
    percent,
    remaining: round2(budget.limit - spent),
    status: budgetStatus(percent),
  }
}

export const summary = (list: Transaction[], key = REF_MONTH) => {
  const prev = prevMonthKey(key)
  const income = monthTotal(list, key, "income")
  const expense = monthTotal(list, key, "expense")
  const prevIncome = monthTotal(list, prev, "income")
  const prevExpense = monthTotal(list, prev, "expense")
  const allIncome = list.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const allExpense = list.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0)
  return {
    income,
    expense,
    period: round2(income - expense),
    prevIncome,
    prevExpense,
    prevPeriod: round2(prevIncome - prevExpense),
    balance: round2(SALDO_INICIAL + allIncome - allExpense),
    accumulated: round2(allIncome - allExpense),
    commitment: income ? (expense / income) * 100 : 0,
  }
}

export const averageMonthlyExpense = (list: Transaction[]) => {
  const keys = monthsWithData(list)
  if (!keys.length) return 0
  return keys.reduce((s, k) => s + monthTotal(list, k, "expense"), 0) / keys.length
}

export const averageMonthlySaving = (list: Transaction[]) => {
  const keys = monthsWithData(list)
  if (!keys.length) return 0
  return keys.reduce((s, k) => s + monthTotal(list, k, "income") - monthTotal(list, k, "expense"), 0) / keys.length
}

// Score de saúde financeira (RF 3.10)
export const scoreLevel = (score: number) =>
  score >= 80 ? "Excelente" : score >= 60 ? "Bom" : score >= 40 ? "Atenção" : "Crítico"

export const scoreFor = (list: Transaction[], budgets: Budget[], key = REF_MONTH) => {
  const income = monthTotal(list, key, "income")
  const expense = monthTotal(list, key, "expense")
  const invested = monthTotal(list, key, "expense", "Investimentos")
  const spendingNoInvest = expense - invested
  if (!income) return 0
  const savingRate = (income - expense + invested) / income
  const economy = Math.max(0, Math.min(1, savingRate / 0.2)) * 30
  const control = Math.max(0, Math.min(1, (1 - spendingNoInvest / income) / 0.5)) * 20
  const last3 = [key, prevMonthKey(key), prevMonthKey(prevMonthKey(key))]
  let cells = 0
  let over = 0
  last3.forEach((k) => {
    if (!inMonth(list, k).length) return
    budgets.forEach((b) => {
      cells += 1
      if (monthTotal(list, k, "expense", b.category) > b.limit) over += 1
    })
  })
  const budgetPts = cells ? 25 * (1 - over / cells) : 25
  const withData = last3.filter((k) => inMonth(list, k).length)
  const invMonths = withData.filter((k) => monthTotal(list, k, "expense", "Investimentos") > 0).length
  const constancy = withData.length ? (invMonths / withData.length) * 15 : 0
  const net = income - expense
  const prevNet = monthTotal(list, prevMonthKey(key), "income") - monthTotal(list, prevMonthKey(key), "expense")
  const evolution = net >= prevNet && net > 0 ? 10 : net > 0 ? 5 : 0
  return Math.max(0, Math.min(100, Math.round(economy + control + budgetPts + constancy + evolution)))
}

export type Insight = { id: string; tone: "danger" | "warn" | "info"; text: string }

// Insights e alertas (RF 3.5) — RN006: só com dados suficientes
export const buildInsights = (
  list: Transaction[],
  budgets: Budget[],
  goals: Goal[],
  key = REF_MONTH,
): Insight[] | null => {
  const prev = prevMonthKey(key)
  if (inMonth(list, key).length < 3 || inMonth(list, prev).length < 3) return null
  const result: Insight[] = []
  budgets.forEach((b) => {
    const u = budgetUsage(b, list, key)
    if (u.status === "Estourado")
      result.push({
        id: `over-${b.id}`,
        tone: "danger",
        text: `Seu gasto com ${b.category.toLowerCase()} ultrapassou o limite definido em ${money(u.spent - b.limit)}.`,
      })
    else if (u.status === "Risco")
      result.push({
        id: `risk-${b.id}`,
        tone: "warn",
        text: `Você já utilizou ${Math.round(u.percent)}% do orçamento de ${b.category.toLowerCase()} neste mês.`,
      })
  })
  expenseByCategory(list, key).forEach(([category, value]) => {
    const before = monthTotal(list, prev, "expense", category)
    if (before > 0 && category !== "Investimentos") {
      const growth = ((value - before) / before) * 100
      if (growth >= 30)
        result.push({
          id: `grow-${category}`,
          tone: "warn",
          text: `Seus gastos com ${category.toLowerCase()} aumentaram ${Math.round(growth)}% em relação ao mês anterior.`,
        })
    }
  })
  const income = monthTotal(list, key, "income")
  const prevIncome = monthTotal(list, prev, "income")
  if (prevIncome > 0 && income < prevIncome * 0.9)
    result.push({
      id: "income-drop",
      tone: "danger",
      text: `Sua receita mensal apresentou redução de ${Math.round(((prevIncome - income) / prevIncome) * 100)}% em comparação ao período anterior.`,
    })
  const reserve = goals.find((g) => g.name.toLowerCase().includes("reserva"))
  const daily = averageMonthlyExpense(list) / 30
  if (reserve && daily > 0) {
    const days = Math.floor(reserve.saved / daily)
    if (days < 180)
      result.push({
        id: "reserve",
        tone: "warn",
        text: `Sua reserva financeira atual cobre apenas ${days} dias de despesas médias.`,
      })
  }
  return result
}

export { monthLabel }

const groupExpenses = (list: Transaction[], pick: (t: Transaction) => string) => {
  const result: Record<string, number> = {}
  list
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const k = pick(t)
      result[k] = round2((result[k] ?? 0) + Math.abs(t.amount))
    })
  return Object.entries(result).sort((a, b) => b[1] - a[1])
}

export const categoryTotals = (list: Transaction[]) => groupExpenses(list, (t) => t.category)
export const establishmentTotals = (list: Transaction[]) =>
  groupExpenses(list, (t) => t.establishment?.trim() || t.title)

export const sumKind = (list: Transaction[], kind: "income" | "expense") =>
  round2(list.filter((t) => t.type === kind).reduce((s, t) => s + Math.abs(t.amount), 0))
