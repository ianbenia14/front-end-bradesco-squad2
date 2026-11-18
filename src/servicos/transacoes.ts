import type { Transaction } from "../tipos"
import { categoryIcons, incomeCategory } from "../dados/categorias"
import { fromInputDate, toInputDate } from "../utilitarios/datas"
import { categoriasApi, transacoesApi } from "./apiFinancas"
import type { Categoria, Transacao, TransacaoEntrada } from "./apiFinancas"

// Ponte entre as transações do front (Transaction) e as da API (Transacao).
// No front, a despesa tem valor NEGATIVO e a receita POSITIVO; na API o valor é sempre positivo
// e o campo "tipo" diz se entra ou sai.

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

const doisDigitos = (n: number) => String(n).padStart(2, "0")

const MESES: Record<string, number> = {
  jan: 1, fev: 2, feb: 2, mar: 3, abr: 4, apr: 4, mai: 5, may: 5, jun: 6,
  jul: 7, ago: 8, aug: 8, set: 9, sep: 9, out: 10, oct: 10, nov: 11, dez: 12, dec: 12,
}

const semAcento = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

/** Reserva: converte datas como "15 Nov 2026", "15/11/2026" ou "2026-11-15" para aaaa-mm-dd. */
const normalizarData = (data: string): string => {
  const texto = semAcento(String(data).trim().toLowerCase())

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(texto)
  if (br) return `${br[3]}-${doisDigitos(Number(br[2]))}-${doisDigitos(Number(br[1]))}`

  const extenso = /^(\d{1,2})\s*(?:de\s+)?[-\s/.]?\s*([a-z]{3,})\.?\s*(?:de\s+)?[-\s/.]?\s*(\d{4})/.exec(texto)
  if (extenso) {
    const mes = MESES[extenso[2].slice(0, 3)]
    if (mes) return `${extenso[3]}-${doisDigitos(mes)}-${doisDigitos(Number(extenso[1]))}`
  }

  const d = new Date(texto)
  if (!Number.isNaN(d.getTime())) {
    return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
  }
  return texto
}

/** Data do front ("15 Nov 2026") para aaaa-mm-dd. Se já vier em ISO, só a devolve. */
const paraIso = (data: string): string => {
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) return data.slice(0, 10)
  const iso = toInputDate(data)
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : normalizarData(data)
}

/** Aceita número ou texto ("1.234,56" ou "1234.56") e devolve sempre um número positivo. */
const normalizarValor = (valor: number | string): number => {
  if (typeof valor === "number") return Math.abs(valor)
  const limpo = String(valor).trim()
  const numero = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo
  return Math.abs(Number(numero))
}

const paraFront = (t: Transacao): Transaction => {
  const receita = t.tipo === "RECEITA"
  const category = receita ? incomeCategory : (t.categoriaNome ?? "Outros")
  return {
    id: t.id,
    title: t.descricao,
    category,
    date: fromInputDate(t.dataTransacao.slice(0, 10)),
    amount: receita ? t.valor : -t.valor, // despesa é negativa no front
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
    valor: normalizarValor(t.amount),
    descricao: t.title,
    dataTransacao: paraIso(t.date),
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