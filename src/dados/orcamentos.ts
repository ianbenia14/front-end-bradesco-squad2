import type { Budget } from "../tipos"
import { categoryColors, categoryIcons, expenseCategories } from "./categorias"

const budgetData = [
  { category: "Alimentação", limit: 1000 },
  { category: "Lazer", limit: 500 },
  { category: "Transporte", limit: 600 },
  { category: "Moradia", limit: 2800 },
]

const colorOf = (category: string) => {
  const c = categoryColors[category]
  return c === "gray" || !c ? "blue" : c
}

export const initialBudgets: Budget[] = budgetData.map((budget, index) => ({
  ...budget,
  id: index + 1,
  icon: categoryIcons[budget.category] ?? "wallet",
  color: colorOf(budget.category),
}))

export const budgetCategories = expenseCategories
export const budgetIcons = categoryIcons
export const budgetColorOf = colorOf
