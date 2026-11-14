import type { Recurrence, Transaction } from "../tipos"
import { fromInputDate, toInputDate } from "./datas"

export const recurrenceLabel: Record<Recurrence, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
}

const pad = (n: number) => String(n).padStart(2, "0")

const occurrence = (iso: string, period: Recurrence, n: number) => {
  const [y, m, d] = iso.split("-").map(Number)
  if (period === "weekly") {
    const date = new Date(y, m - 1, d + 7 * n)
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }
  const months = period === "monthly" ? n : 12 * n
  const first = new Date(y, m - 1 + months, 1)
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(Math.min(d, last))}`
}

// Gera automaticamente as ocorrências de transações recorrentes até hoje
export const aplicarRecorrencias = (list: Transaction[], today: string): Transaction[] => {
  const created: Transaction[] = []
  let nextId = list.reduce((max, t) => Math.max(max, t.id), 0) + 1
  list
    .filter((t) => t.recurring && !t.recurringOf)
    .forEach((template) => {
      const period = template.recurrence ?? "monthly"
      const start = toInputDate(template.date)
      for (let n = 1; n <= 120; n++) {
        const iso = occurrence(start, period, n)
        if (iso > today) break
        const label = fromInputDate(iso)
        const exists = list.some((t) => t.recurringOf === template.id && t.date === label)
        if (!exists)
          created.push({ ...template, id: nextId++, date: label, recurringOf: template.id, recurring: true })
      }
    })
  return created.length ? [...created, ...list] : list
}
