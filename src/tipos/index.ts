export type Screen = "login" | "dashboard" | "transactions" | "budgets" | "goals" | "reports"

export type IconName = "arrow-down" | "arrow-up" | "bell" | "calendar" | "chart" | "check" | "chevron" | "dashboard" | "eye" | "flag" | "food" | "goal" | "home" | "logout" | "menu" | "plus" | "report" | "search" | "settings" | "shopping" | "transaction" | "transport" | "wallet" | "x"

export type Transaction = {
  id: number
  title: string
  category: string
  date: string
  amount: number
  type: "income" | "expense"
  icon: IconName
}

export type Budget = {
  id: number
  category: string
  icon: IconName
  spent: number
  baseline: number
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
}
