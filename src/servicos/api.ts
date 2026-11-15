// Cliente HTTP único do front end: nenhuma tela chama fetch direto.

const BASE_URL: string = (
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_URL ??
  'http://localhost:8080'
).replace(/\/$/, '')

export type ErroCampos = Record<string, string>

type Params = Record<string, string | number | boolean | null | undefined>

/** Erro devolvido pelo back end: status, mensagem e, em validações, os campos com problema. */
export class ErroApi extends Error {
  status: number
  erro: string
  campos: ErroCampos | null

  constructor(status: number, erro: string, mensagem: string, campos: ErroCampos | null) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
    this.erro = erro
    this.campos = campos
  }
}

/** Texto pronto para mostrar ao usuário. */
export function mensagemDoErro(e: unknown): string {
  if (e instanceof ErroApi) return e.message
  if (e instanceof Error) return e.message
  return 'Ocorreu um erro inesperado.'
}

function montarUrl(caminho: string, params?: Params): string {
  const url = new URL(BASE_URL + caminho)
  if (params) {
    for (const [chave, valor] of Object.entries(params)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        url.searchParams.set(chave, String(valor))
      }
    }
  }
  return url.toString()
}

async function requisitar<T>(
  metodo: string,
  caminho: string,
  opcoes?: { params?: Params; corpo?: unknown },
): Promise<T | null> {
  const temCorpo = opcoes?.corpo !== undefined
  let resposta: Response
  try {
    resposta = await fetch(montarUrl(caminho, opcoes?.params), {
      method: metodo,
      headers: temCorpo ? { 'Content-Type': 'application/json' } : undefined,
      body: temCorpo ? JSON.stringify(opcoes?.corpo) : undefined,
    })
  } catch {
    throw new ErroApi(
      0,
      'Sem conexão',
      'Não foi possível falar com o servidor. Confira se o back end está rodando.',
      null,
    )
  }

  // 204: resposta sem corpo (DELETE e sugestão de categoria sem resultado)
  if (resposta.status === 204) return null

  const texto = await resposta.text()
  let dados: unknown = null
  if (texto) {
    try {
      dados = JSON.parse(texto)
    } catch {
      dados = null
    }
  }

  if (!resposta.ok) {
    const erro = (dados ?? {}) as { erro?: string; mensagem?: string; campos?: ErroCampos }
    throw new ErroApi(
      resposta.status,
      erro.erro ?? 'Erro',
      erro.mensagem ?? `Erro ${resposta.status} ao falar com o servidor.`,
      erro.campos ?? null,
    )
  }
  return dados as T
}

export const api = {
  get: <T>(caminho: string, params?: Params) =>
    requisitar<T>('GET', caminho, { params }) as Promise<T>,

  /** Para rotas que podem responder 204 (devolve null nesse caso). */
  getOuNulo: <T>(caminho: string, params?: Params) =>
    requisitar<T>('GET', caminho, { params }),

  post: <T>(caminho: string, corpo?: unknown, params?: Params) =>
    requisitar<T>('POST', caminho, { corpo, params }) as Promise<T>,

  put: <T>(caminho: string, corpo?: unknown) =>
    requisitar<T>('PUT', caminho, { corpo }) as Promise<T>,

  delete: async (caminho: string): Promise<void> => {
    await requisitar<void>('DELETE', caminho)
  },
}