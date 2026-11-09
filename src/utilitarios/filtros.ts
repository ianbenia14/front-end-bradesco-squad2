import type { Transaction } from "../tipos"
import { toInputDate } from "./datas"

export type Filtros = {
  from: string
  to: string
  type: string
  category: string
  establishment: string
  recurring: string
}

export const filtrosVazios: Filtros = {
  from: "",
  to: "",
  type: "all",
  category: "all",
  establishment: "",
  recurring: "all",
}

export const filtrosAtivos = (f: Filtros) =>
  Boolean(f.from || f.to || f.establishment || f.type !== "all" || f.category !== "all" || f.recurring !== "all")

export const aplicarFiltros = (list: Transaction[], f: Filtros) =>
  list.filter((item) => {
    const iso = toInputDate(item.date)
    return (
      (f.type === "all" || item.type === f.type) &&
      (f.category === "all" || item.category === f.category) &&
      (f.recurring === "all" || (f.recurring === "yes" ? item.recurring : !item.recurring)) &&
      (!f.from || iso >= f.from) &&
      (!f.to || iso <= f.to) &&
      (item.establishment ?? "").toLowerCase().includes(f.establishment.toLowerCase())
    )
  })
