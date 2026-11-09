import { createContext, useContext } from "react"

export type UsuarioAtual = { id: string; name: string; email: string; guest: boolean }

export const UsuarioContext = createContext<UsuarioAtual>({
  id: "convidado",
  name: "Convidado",
  email: "",
  guest: true,
})

export const useUsuario = () => useContext(UsuarioContext)

export const iniciais = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
