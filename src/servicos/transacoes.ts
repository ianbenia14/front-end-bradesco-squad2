import type { Transaction } from "../tipos"
import { categoryIcons, incomeCategory } from "../dados/categorias"
import { categoriasApi, transacoesApi } from "./apiFinancas"
import type { Categoria, Transacao, TransacaoEntrada } from "./apiFinancas"

// Ponte entre as transações do front (Transaction) e as da API (Transacao).

const LOTE = 500 // limite de transações por importação no back end
let categoriasEmCache: Categoria[] | null = null

const categorias = async () => {
  if (!categoriasEmCache) categoriasEmCache = await categoriasApi.listar()
  return categoriasEmCache
}

/** Id da categoria de despesa pelo nome; se o nome não existir, usa "Outros". */
const idDaCategoria = async (nome: string): Promise<number | null> => {
  const despesas = (await categorias()).filter((c) => c.tipo === "DESPESA")
  const categoria = despesas.find((c) => c.nome === nome) ?? despesas.find((c) => c.nome === "Outros")
  return categoria?.id ?? null
}

const paraFront = (t: Transacao): Transaction => {
  const receita = t.tipo === "RECEITA"
  const category = receita ? incomeCategory : (t.categoriaNome ?? "Outros")
  return {
    id: t.id,
    title: t.descricao,
    category,
    date: t.dataTransacao,
    amount: t.valor,
    type: receita ? "income" : "expense",
    icon: categoryIcons[category] ?? "wallet",
    establishment: t.estabelecimento ?? undefined,
    recurring: t.recorrente,
    // O back end só guarda "recorrente" (sim/não); a periodicidade não é gravada
    recurrence: t.recorrente ? "monthly" : undefined,
    userId: String(t.usuarioId),
  }
}

const paraApi = async (usuarioId: number, t: Transaction): Promise<TransacaoEntrada> => {
  const receita = t.type === "income"
  return {
    usuarioId,
    categoriaId: receita ? null : await idDaCategoria(t.category),
    tipo: receita ? "RECEITA" : "DESPESA",
    valor: Math.abs(t.amount),
    descricao: t.title,
    dataTransacao: t.date.slice(0, 10), // aaaa-mm-dd
    estabelecimento: t.establishment?.trim() || null,
    recorrente: Boolean(t.recurring),
  }
}

export const carregarTransacoes = async (usuarioId: number): Promise<Transaction[]> =>
  (await transacoesApi.listar(usuarioId)).map(paraFront)

/** Cria (id nulo) ou atualiza uma transação e devolve a versão gravada no back end. */
export const gravarTransacao = async (
  usuarioId: number,
  t: Transaction,
  id: number | null,
): Promise<Transaction> => {
  const corpo = await paraApi(usuarioId, t)
  const salva = id === null ? await transacoesApi.criar(corpo) : await transacoesApi.atualizar(id, corpo)
  return paraFront(salva)
}

export const excluirTransacao = (id: number) => transacoesApi.excluir(id)

/** Importa em lotes de 500 (cada lote é tudo ou nada no back end). */
export const importarTransacoes = async (
  usuarioId: number,
  lista: Transaction[],
): Promise<Transaction[]> => {
  const corpos = await Promise.all(lista.map((t) => paraApi(usuarioId, t)))
  const criadas: Transaction[] = []
  for (let i = 0; i < corpos.length; i += LOTE) {
    const parte = await transacoesApi.importar(corpos.slice(i, i + LOTE))
    criadas.push(...parte.map(paraFront))
  }
  return criadas
}