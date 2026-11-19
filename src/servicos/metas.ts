
import type { Goal } from "../tipos"
import { initialGoals } from "../dados/metas"
import { metasApi, type Meta, type MetaEntrada } from "./apiFinancas"

const meses = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

const prazoParaApi = (deadline: string): string => {
  const partes = deadline.trim().match(/^([A-Za-zÀ-ÿ]{3})\s+(\d{4})$/)

  if (!partes) {
    throw new Error("O prazo da meta está em um formato inválido.")
  }

  const mes = meses.findIndex(
    (nome) => nome.toLowerCase() === partes[1].toLowerCase()
  ) + 1

  if (mes === 0) {
    throw new Error("O mês informado no prazo não é válido.")
  }

  const ano = Number(partes[2])
  const ultimoDia = new Date(ano, mes, 0).getDate()

  return `${ano}-${String(mes).padStart(2, "0")}-${ultimoDia}`
}

const prazoParaTela = (prazo: string): string => {
  const [ano, mes] = prazo.split("-").map(Number)
  return `${meses[mes - 1]} ${ano}`
}

const paraFront = (meta: Meta, referencia?: Goal): Goal => {
  const modelo =
    referencia ??
    initialGoals.find((goal) => goal.name === meta.nome)

  const reserva = meta.nome.toLowerCase().includes("reserva")

  return {
    id: meta.id,
    name: meta.nome,
    saved: Number(meta.valorAtual),
    target: Number(meta.valorObjetivo),
    deadline: prazoParaTela(meta.prazo),
    icon: modelo?.icon ?? (reserva ? "flag" : "goal"),
    color: modelo?.color ?? "blue",
    kind: reserva ? "reserve" : "other",
  }
}

const paraApi = (usuarioId: number, goal: Goal): MetaEntrada => ({
  usuarioId,
  nome: goal.name,
  valorObjetivo: goal.target,
  valorAtual: goal.saved,
  prazo: prazoParaApi(goal.deadline),
})

export const carregarMetas = async (usuarioId: number): Promise<Goal[]> => {
  const metas = await metasApi.listar(usuarioId)
  return metas.map((meta) => paraFront(meta))
}

export const gravarMeta = async (
  usuarioId: number,
  goal: Goal,
  id: number | null
): Promise<Goal> => {
  const corpo = paraApi(usuarioId, goal)

  const salva =
    id === null
      ? await metasApi.criar(corpo)
      : await metasApi.atualizar(id, corpo)

  return paraFront(salva, goal)
}

export const excluirMeta = (id: number) => metasApi.excluir(id)
