import type { Budget, IconName } from "../tipos"
import { transactions } from "./transacoes"
import { octTotal } from "../utilitarios/calculos"

const budgetData = [
  {
    category: "Alimentação",
    icon: "food" as IconName,
    spent: 1710,
    limit: 1800,
    color: "orange",
  },
  {
    category: "Moradia",
    icon: "home" as IconName,
    spent: 2410,
    limit: 2800,
    color: "green",
  },
  {
    category: "Transporte",
    icon: "transport" as IconName,
    spent: 720,
    limit: 1000,
    color: "blue",
  },
  {
    category: "Compras",
    icon: "shopping" as IconName,
    spent: 490,
    limit: 900,
    color: "purple",
  },
]

export const initialBudgets: Budget[] = budgetData.map((budget, index) => ({
  ...budget,
  id: index + 1,
  baseline: octTotal(transactions, "expense", budget.category),
}))

export const budgetCategories = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Compras",
  "Lazer",
  "Saúde",
  "Educação",
  "Outros",
]

export const budgetIcons: Record<string, IconName> = {
  Alimentação: "food",
  Moradia: "home",
  Transporte: "transport",
  Compras: "shopping",
}

export const budgetColors = ["blue", "purple", "green", "orange"]
