export const monthNumbers: Record<string, string> = {
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

export const monthNames: Record<string, string> = Object.fromEntries(
  Object.entries(monthNumbers).map(([name, number]) => [number, name]),
)

export const monthLong: Record<string, string> = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro",
}

const pad = (n: number) => String(n).padStart(2, "0")
const today = new Date()
const currentMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`
const currentDate = `${currentMonth}-${pad(today.getDate())}`

// Mês de referência do sistema. Usuários cadastrados usam o mês atual;
// o modo convidado usa o mês dos dados de demonstração.
export let REF_MONTH = currentMonth
export let DEFAULT_DATE = currentDate

export const setReference = (guest: boolean) => {
  REF_MONTH = guest ? "2026-10" : currentMonth
  DEFAULT_DATE = guest ? "2026-10-06" : currentDate
}

export const toInputDate = (date: string) => {
  const [day, month, year] = date.split(" ")
  return `${year}-${monthNumbers[month] ?? "10"}-${day.padStart(2, "0")}`
}

export const toMonthInput = (deadline: string) => {
  const [month, year] = deadline.split(" ")
  return `${year}-${monthNumbers[month] ?? "12"}`
}

export const monthKey = (date: string) => toInputDate(date).slice(0, 7)

export const prevMonthKey = (key: string) => {
  const [y, m] = key.split("-").map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export const monthLabel = (key: string) => {
  const [y, m] = key.split("-")
  return `${monthLong[m]} de ${y}`
}

export const monthShort = (key: string) => monthNames[key.split("-")[1]]

export const monthsBetween = (fromKey: string, toKey: string) => {
  const [fy, fm] = fromKey.split("-").map(Number)
  const [ty, tm] = toKey.split("-").map(Number)
  return (ty - fy) * 12 + (tm - fm)
}

export const addMonths = (key: string, n: number) => {
  const [y, m] = key.split("-").map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export const keyToDeadline = (key: string) => {
  const [y, m] = key.split("-")
  return `${monthNames[m]} ${y}`
}
