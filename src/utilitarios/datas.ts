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

export const toInputDate = (date: string) => {
  const [day, month, year] = date.split(" ")
  return `${year}-${monthNumbers[month] ?? "10"}-${day.padStart(2, "0")}`
}

export const toMonthInput = (deadline: string) => {
  const [month, year] = deadline.split(" ")
  return `${year}-${monthNumbers[month] ?? "12"}`
}
