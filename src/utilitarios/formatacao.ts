export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Math.abs(value),
  )

export const round2 = (value: number) => Math.round(value * 100) / 100

export const moneySigned = (value: number) => (value < 0 ? "- " : "") + money(value)

export const parseMoneyValue = (value: FormDataEntryValue | null) =>
  Number(
    String(value ?? "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, ""),
  )

export const pct = (current: number, previous: number) => {
  const value = previous ? ((current - previous) / previous) * 100 : 0
  return `${value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(1).replace(".", ",")}%`
}

export const toInputValue = (amount: number) =>
  Math.abs(amount).toFixed(2).replace(".", ",")
