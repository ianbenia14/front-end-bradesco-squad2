import type { IconName } from "../tipos"

export const expenseCategories = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Investimentos",
  "Assinaturas",
  "Impostos",
  "Contas e Serviços",
  "Outros",
]

export const incomeCategory = "Receita"

export const categoryIcons: Record<string, IconName> = {
  Alimentação: "food",
  Moradia: "home",
  Transporte: "transport",
  Saúde: "flag",
  Educação: "report",
  Lazer: "goal",
  Compras: "shopping",
  Investimentos: "chart",
  Assinaturas: "calendar",
  Impostos: "transaction",
  "Contas e Serviços": "settings",
  Outros: "wallet",
  Receita: "wallet",
}

export const categoryColors: Record<string, string> = {
  Alimentação: "orange",
  Moradia: "green",
  Transporte: "blue",
  Saúde: "purple",
  Educação: "blue",
  Lazer: "purple",
  Compras: "purple",
  Investimentos: "green",
  Assinaturas: "orange",
  Impostos: "gray",
  "Contas e Serviços": "gray",
  Outros: "gray",
}

// Sugestão automática de categoria com base no estabelecimento (RF 3.2)
const establishmentHints: [string, string][] = [
  ["mcdonald", "Alimentação"],
  ["burger", "Alimentação"],
  ["restaurante", "Alimentação"],
  ["supermercado", "Alimentação"],
  ["pão de açúcar", "Alimentação"],
  ["ifood", "Alimentação"],
  ["netflix", "Assinaturas"],
  ["spotify", "Assinaturas"],
  ["streaming", "Assinaturas"],
  ["prime", "Assinaturas"],
  ["shell", "Transporte"],
  ["posto", "Transporte"],
  ["uber", "Transporte"],
  ["99", "Transporte"],
  ["farmácia", "Saúde"],
  ["farmacia", "Saúde"],
  ["drogaria", "Saúde"],
  ["hospital", "Saúde"],
  ["clínica", "Saúde"],
  ["escola", "Educação"],
  ["faculdade", "Educação"],
  ["curso", "Educação"],
  ["cinema", "Lazer"],
  ["livraria", "Compras"],
  ["amazon", "Compras"],
  ["magazine", "Compras"],
  ["aluguel", "Moradia"],
  ["condomínio", "Moradia"],
  ["energia", "Contas e Serviços"],
  ["água", "Contas e Serviços"],
  ["internet", "Contas e Serviços"],
  ["enel", "Contas e Serviços"],
  ["receita federal", "Impostos"],
  ["iptu", "Impostos"],
  ["ipva", "Impostos"],
  ["corretora", "Investimentos"],
  ["tesouro", "Investimentos"],
]

export const suggestCategory = (establishment: string) => {
  const name = establishment.trim().toLowerCase()
  if (!name) return null
  return establishmentHints.find(([key]) => name.includes(key))?.[1] ?? null
}

// Classificação 50/30/20 (RF 3.7)
export const needsCategories = ["Moradia", "Alimentação", "Transporte", "Saúde", "Educação", "Contas e Serviços", "Impostos"]
export const wantsCategories = ["Lazer", "Compras", "Assinaturas", "Outros"]
export const savingsCategories = ["Investimentos"]
