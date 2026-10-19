// Funções de formatação e cálculo
import type { Transaction } from "../meu-app/src/tipos/tipos"
import { transactions } from "../dados/transacoesExemplo"

// ===== FORMATAÇÃO DE DINHEIRO E DATAS =====
// Formata número em reais: 1500 -> R$ 1.500,00
export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Math.abs(value),
  )

// Arredonda para 2 casas decimais
export const round2 = (value: number) => Math.round(value * 100) / 100
// Igual ao money, mas coloca "-" se for negativo
export const moneySigned = (value: number) => (value < 0 ? "- " : "") + money(value)
const parseMoneyValue = (value: FormDataEntryValue | null) =>
  Number(
    String(value ?? "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, ""),
  )
// Calcula a variação em %, ex.: +12,8%
export const pct = (current: number, previous: number) => {
  const value = previous ? ((current - previous) / previous) * 100 : 0
  return `${value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(1).replace(".", ",")}%`
}
// Soma as transações de outubro (por tipo e categoria)
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
// Calcula saldo, receitas e despesas do Painel
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

const monthNumbers: Record<string, string> = {
  Jan: "01",
  Fev: "02",
  Mar: "03",
  Abr: "04",
  Mai: "05",
  Jun: "06",
  Jul: "07",
  Ago: "08",
  Set: "09",
  Out: "10",
  Nov: "11",
  Dez: "12",
}
// Converte número do mês em nome: "10" -> "Out"
export const monthNames: Record<string, string> = Object.fromEntries(
  Object.entries(monthNumbers).map(([name, number]) => [number, name]),
)
