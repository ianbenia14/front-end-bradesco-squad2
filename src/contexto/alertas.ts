import { createContext, useContext } from "react"
import type { Insight } from "../utilitarios/calculos"

export const AlertasContext = createContext<Insight[] | null>(null)
export const useAlertas = () => useContext(AlertasContext)
