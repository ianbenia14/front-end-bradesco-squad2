// Tipos compartilhados pelo app
// ===== TIPOS =====
// Telas que existem no app (adicione aqui ao criar uma nova)
export type Screen = "login" | "dashboard" | "transactions"
// Nomes dos ícones disponíveis
export type IconName = "arrow-down" | "arrow-up" | "bell" | "calendar" | "chart" | "check" | "chevron" | "dashboard" | "eye" | "flag" | "food" | "goal" | "home" | "logout" | "menu" | "plus" | "report" | "search" | "settings" | "shopping" | "transaction" | "transport" | "wallet" | "x"
// Formato de uma transação (receita ou despesa)
export type Transaction = {
  id: number
  title: string
  category: string
  date: string
  amount: number
  type: "income" | "expense"
  icon: IconName
}
