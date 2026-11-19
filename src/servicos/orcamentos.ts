import type { Budget } from "../tipos"
import { budgetColorOf, budgetIcons } from "../dados/orcamentos"
import { REF_MONTH } from "../utilitarios/datas"
import { categoriasApi, orcamentosApi } from "./apiFinancas"
import type { Categoria, Orcamento, OrcamentoEntrada } from "./apiFinancas"

// Ponte entre os orçamentos do front (Budget) e os da API (Orcamento).
// O orçamento da API é mensal (RN004): o front trabalha com o mês de referência (REF_MONTH).
// Ícone e cor não existem na API: são derivados do nome da categoria.

let categoriasEmCache: Categoria[] | null = null

const categorias = async () => {
  if (!categoriasEmCache) categoriasEmCache = await categoriasApi.listar()
  return categoriasEmCache
}

const idDaCategoria = async (nome: string): Promise<number> => {
  const categoria = (await categorias()).find((c) => c.tipo === "DESPESA" && c.nome === nome)
  if (!categoria) throw new Error(`A categoria "${nome}" não foi encontrada no servidor.`)
  return categoria.id
}

/** Ano e mês do mês de referência atual. */
const periodo = () => {
  const [ano, mes] = REF_MONTH.split("-").map(Number)
  return { ano, mes }
}

const paraFront = (o: Orcamento): Budget => ({
  id: o.id,
  category: o.categoriaNome,
  icon: budgetIcons[o.categoriaNome] ?? "wallet",
  limit: o.limite,
  color: budgetColorOf(o.categoriaNome),
})

const paraApi = async (usuarioId: number, b: Budget): Promise<OrcamentoEntrada> => ({
  usuarioId,
  categoriaId: await idDaCategoria(b.category),
  ...periodo(),
  limite: b.limit,
})

export const carregarOrcamentos = async (usuarioId: number): Promise<Budget[]> => {
  const { ano, mes } = periodo()
  return (await orcamentosApi.listar(usuarioId, ano, mes)).map(paraFront)
}

/** Cria (id nulo) ou atualiza um orçamento e devolve a versão gravada no back end. */
export const gravarOrcamento = async (
  usuarioId: number,
  b: Budget,
  id: number | null,
): Promise<Budget> => {
  const corpo = await paraApi(usuarioId, b)
  const salvo = id === null ? await orcamentosApi.criar(corpo) : await orcamentosApi.atualizar(id, corpo)
  return paraFront(salvo)
}

export const excluirOrcamento = (id: number) => orcamentosApi.excluir(id)