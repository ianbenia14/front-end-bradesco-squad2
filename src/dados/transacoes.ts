import type { Transaction } from "../tipos"
import { categoryIcons, incomeCategory } from "./categorias"

type Seed = [string, string, string, number, "income" | "expense", string?, boolean?]

const seeds: Seed[] = [
  // Outubro 2026
  ["Salário mensal", incomeCategory, "05 Out 2026", 8200, "income", "Empresa", true],
  ["Supermercado Pão de Açúcar", "Alimentação", "04 Out 2026", 486.2, "expense", "Pão de Açúcar"],
  ["Aluguel", "Moradia", "03 Out 2026", 2100, "expense", "Imobiliária", true],
  ["Projeto freelance", incomeCategory, "02 Out 2026", 1850, "income", "Cliente"],
  ["Uber", "Transporte", "01 Out 2026", 42.8, "expense", "Uber"],
  ["Livraria Cultura", "Compras", "01 Out 2026", 129.9, "expense", "Livraria Cultura"],
  ["Restaurante", "Alimentação", "03 Out 2026", 184.9, "expense", "Restaurante Sabor"],
  ["Netflix", "Assinaturas", "02 Out 2026", 55.9, "expense", "Netflix", true],
  ["Farmácia São João", "Saúde", "02 Out 2026", 96.5, "expense", "Farmácia São João"],
  ["Cinema", "Lazer", "04 Out 2026", 120, "expense", "Cinemark"],
  ["Aporte em investimentos", "Investimentos", "05 Out 2026", 800, "expense", "Corretora", true],
  ["Conta de energia", "Contas e Serviços", "05 Out 2026", 238.4, "expense", "Enel", true],
  ["Posto Shell", "Transporte", "04 Out 2026", 250, "expense", "Posto Shell"],
  // Setembro 2026
  ["Salário mensal", incomeCategory, "05 Set 2026", 8200, "income", "Empresa", true],
  ["Rendimento de investimento", incomeCategory, "18 Set 2026", 342.7, "income", "Corretora"],
  ["Aluguel", "Moradia", "03 Set 2026", 2100, "expense", "Imobiliária", true],
  ["Supermercado", "Alimentação", "10 Set 2026", 520, "expense", "Pão de Açúcar"],
  ["Restaurante", "Alimentação", "22 Set 2026", 184.9, "expense", "Restaurante Sabor"],
  ["Conta de energia", "Contas e Serviços", "26 Set 2026", 238.4, "expense", "Enel", true],
  ["Combustível", "Transporte", "12 Set 2026", 250, "expense", "Posto Shell"],
  ["Uber", "Transporte", "15 Set 2026", 30, "expense", "Uber"],
  ["Netflix", "Assinaturas", "08 Set 2026", 55.9, "expense", "Netflix", true],
  ["Farmácia", "Saúde", "03 Set 2026", 96.5, "expense", "Farmácia São João"],
  ["Livraria Cultura", "Compras", "30 Set 2026", 129.9, "expense", "Livraria Cultura"],
  ["Cinema", "Lazer", "20 Set 2026", 90, "expense", "Cinemark"],
  ["Aporte em investimentos", "Investimentos", "05 Set 2026", 800, "expense", "Corretora", true],
  // Agosto 2026
  ["Salário mensal", incomeCategory, "05 Ago 2026", 8200, "income", "Empresa", true],
  ["Aluguel", "Moradia", "03 Ago 2026", 2100, "expense", "Imobiliária", true],
  ["Supermercado", "Alimentação", "11 Ago 2026", 610, "expense", "Pão de Açúcar"],
  ["Combustível", "Transporte", "14 Ago 2026", 280, "expense", "Posto Shell"],
  ["Conta de energia", "Contas e Serviços", "26 Ago 2026", 225, "expense", "Enel", true],
  ["Netflix", "Assinaturas", "08 Ago 2026", 55.9, "expense", "Netflix", true],
  ["Aporte em investimentos", "Investimentos", "05 Ago 2026", 800, "expense", "Corretora", true],
  ["Lazer fim de semana", "Lazer", "21 Ago 2026", 210, "expense", "Parque"],
]

export const transactions: Transaction[] = seeds.map(
  ([title, category, date, value, type, establishment, recurring], index) => ({
    id: index + 1,
    title,
    category,
    date,
    amount: type === "expense" ? -value : value,
    type,
    icon: categoryIcons[category] ?? "wallet",
    establishment,
    recurring: Boolean(recurring),
  }),
)
