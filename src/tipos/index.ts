export type Screen = "dashboard" | "transactions" | "budgets" | "goals" | "reports" | "planning" | "settings" | "education" | "faq" | "privacy" | "terms"

export type PublicScreen = "welcome" | "login" | "register" | "faq" | "privacy" | "terms" | "tools"

export type IconName = "arrow-down" | "arrow-up" | "bell" | "calendar" | "chart" | "check" | "chevron" | "dashboard" | "eye" | "flag" | "food" | "goal" | "home" | "logout" | "menu" | "plus" | "report" | "search" | "settings" | "shopping" | "transaction" | "transport" | "wallet" | "x"

export type Transaction = {
  id: number
  title: string
  category: string
  date: string
  amount: number
  type: "income" | "expense"
  icon: IconName
  establishment?: string
  recurring?: boolean
  recurrence?: Recurrence
  recurringOf?: number
  userId?: string
}

export type Recurrence = "weekly" | "monthly" | "yearly"

export type Budget = {
  id: number
  category: string
  icon: IconName
  limit: number
  color: string
}

export type Goal = {
  id: number
  name: string
  icon: IconName
  saved: number
  target: number
  deadline: string
  color: string
  kind?: "reserve" | "other"
}

export type IncomeProfile = {
  salary: number
  recurring: number
  variable: number
}

export type BudgetStatus = "Normal" | "Atenção" | "Risco" | "Estourado"

export type ReportSnapshot = {
  id: string
  month: string
  savedAt: string
  income: number
  expense: number
  balance: number
  score: number
  ranking: [string, number][]
}
