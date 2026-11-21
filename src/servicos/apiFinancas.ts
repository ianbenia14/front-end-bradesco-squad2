// Uma função para cada rota do back end (Spring Boot).
import { api } from './api'

// ---------------------------------------------------------------- tipos
export type TipoTransacao = 'RECEITA' | 'DESPESA'
export type GrupoCategoria = 'NECESSIDADE' | 'DESEJO' | 'INVESTIMENTO'
export type StatusOrcamento = 'NORMAL' | 'ATENCAO' | 'RISCO' | 'ESTOURADO'
export type TipoAlerta = 'ORCAMENTO' | 'GASTO' | 'ECONOMIA'

export interface Usuario {
  id: number
  nome: string
  email: string
  rendaMensal: number
  receitasRecorrentes?: number
  receitasVariaveis?: number
  criadoEm: string
}
export interface UsuarioEntrada {
  nome: string
  email: string
  senha: string
  rendaMensal: number
}

export interface Categoria {
  id: number
  nome: string
  tipo: TipoTransacao
  grupo: GrupoCategoria | null
}

export interface Transacao {
  id: number
  usuarioId: number
  categoriaId: number | null
  categoriaNome: string | null
  tipo: TipoTransacao
  valor: number
  descricao: string
  dataTransacao: string // aaaa-mm-dd
  estabelecimento: string | null
  recorrente: boolean
}
export interface TransacaoEntrada {
  usuarioId: number
  categoriaId?: number | null
  tipo: TipoTransacao
  valor: number
  descricao: string
  dataTransacao: string // aaaa-mm-dd
  estabelecimento?: string | null
  recorrente?: boolean
}
export interface FiltrosTransacao {
  categoriaId?: number
  tipo?: TipoTransacao
  estabelecimento?: string
  recorrente?: boolean
  dataInicio?: string
  dataFim?: string
}

export interface Orcamento {
  id: number
  usuarioId: number
  categoriaId: number
  categoriaNome: string
  ano: number
  mes: number
  limite: number
}
export interface OrcamentoEntrada {
  usuarioId: number
  categoriaId: number
  ano: number
  mes: number
  limite: number
}
export interface OrcamentoUtilizado {
  orcamentoId: number
  usuarioId: number
  categoria: string
  ano: number
  mes: number
  limite: number
  gasto: number
  percentualUtilizado: number | null
  saldoRestante: number
  status: StatusOrcamento
}

export interface Meta {
  id: number
  usuarioId: number
  nome: string
  valorObjetivo: number
  valorAtual: number
  prazo: string // aaaa-mm-dd
  percentualConcluido: number
  valorNecessarioPorMes: number
  mesesEstimados: number | null
}
export interface MetaEntrada {
  usuarioId: number
  nome: string
  valorObjetivo: number
  valorAtual?: number
  prazo: string
}

export interface Alerta {
  id: number
  usuarioId: number
  tipo: TipoAlerta
  mensagem: string
  lido: boolean
  criadoEm: string
}

export interface RelatorioMensal {
  usuarioId: number
  ano: number
  mes: number
  totalReceitas: number
  totalDespesas: number
  saldo: number
}
export interface SaudeFinanceira extends RelatorioMensal {
  taxaPoupanca: number | null
  faixa: 'SEM_RECEITA' | 'CRITICA' | 'ATENCAO' | 'BOA' | 'EXCELENTE'
}
export interface RankingGasto {
  posicao: number
  nome: string
  total: number
  percentual: number | null
}
export interface ComparativoMensal {
  ano: number
  mes: number
  receitas: number
  despesas: number
  receitasMesAnterior: number
  despesasMesAnterior: number
  variacaoReceitas: number | null
  variacaoDespesas: number | null
}
export interface Indicadores {
  ano: number
  mes: number
  receitaTotal: number
  despesaTotal: number
  saldoDisponivel: number
  economiaAcumulada: number
  comprometimentoRenda: number | null
}
export interface RelatorioHistorico {
  id: number
  usuarioId: number
  ano: number
  mes: number
  totalReceitas: number
  totalDespesas: number
  saldo: number
  geradoEm: string
}

export interface FaixaPlanejamento {
  percentual: number
  recomendado: number
  gasto: number
}
export interface PlanejamentoRenda {
  ano: number
  mes: number
  salarioLiquido: number
  receitasRecorrentes: number
  receitasVariaveis: number
  necessidades: FaixaPlanejamento
  desejos: FaixaPlanejamento
  investimentos: FaixaPlanejamento
}
export interface Investimentos {
  salarioLiquido: number
  percentualMinimo: number
  investimentoMensalMinimo: number
  despesaMediaMensal: number
  reservaEmergenciaIdeal: number
  patrimonioAcumulado: number
  mesesParaReserva: number | null
  insight: string | null
  evolucaoPatrimonio: { ano: number; mes: number; investido: number; acumulado: number }[]
  metasSugeridas: { nome: string; valorObjetivo: number; valorMensal: number; meses: number | null }[]
}

// ---------------------------------------------------------------- rotas
export const usuariosApi = {
  criar: (dados: UsuarioEntrada) => api.post<Usuario>('/api/usuarios', dados),
  buscar: (id: number) => api.get<Usuario>(`/api/usuarios/${id}`),
  atualizar: (
    id: number,
    dados: { nome: string; rendaMensal: number; receitasRecorrentes?: number; receitasVariaveis?: number },
  ) => api.put<Usuario>(`/api/usuarios/${id}`, dados),
  excluir: (id: number) => api.delete(`/api/usuarios/${id}`),
  apagarDados: (id: number) => api.delete(`/api/usuarios/${id}/dados`),
  login: (email: string, senha: string) =>
    api.post<Usuario>('/api/auth/login', { email, senha }),
}

export const categoriasApi = {
  listar: () => api.get<Categoria[]>('/api/categorias'),
  /** Devolve null quando não há sugestão para o estabelecimento (resposta 204). */
  sugerir: (estabelecimento: string) =>
    api.getOuNulo<Categoria>('/api/categorias/sugestao', { estabelecimento }),
  criar: (dados: { nome: string; tipo: TipoTransacao; grupo?: GrupoCategoria }) =>
    api.post<Categoria>('/api/categorias', dados),
}

export const transacoesApi = {
  listar: (usuarioId: number, filtros: FiltrosTransacao = {}) =>
    api.get<Transacao[]>('/api/transacoes', { usuarioId, ...filtros }),
  buscar: (id: number) => api.get<Transacao>(`/api/transacoes/${id}`),
  criar: (dados: TransacaoEntrada) => api.post<Transacao>('/api/transacoes', dados),
  /** Importação em lote (até 500, tudo ou nada). */
  importar: (transacoes: TransacaoEntrada[]) =>
    api.post<Transacao[]>('/api/transacoes/importacao', { transacoes }),
  atualizar: (id: number, dados: TransacaoEntrada) =>
    api.put<Transacao>(`/api/transacoes/${id}`, dados),
  excluir: (id: number) => api.delete(`/api/transacoes/${id}`),
}

export const orcamentosApi = {
  listar: (usuarioId: number, ano?: number, mes?: number) =>
    api.get<Orcamento[]>('/api/orcamentos', { usuarioId, ano, mes }),
  utilizacao: (usuarioId: number, ano?: number, mes?: number) =>
    api.get<OrcamentoUtilizado[]>('/api/orcamentos/utilizacao', { usuarioId, ano, mes }),
  buscar: (id: number) => api.get<Orcamento>(`/api/orcamentos/${id}`),
  criar: (dados: OrcamentoEntrada) => api.post<Orcamento>('/api/orcamentos', dados),
  atualizar: (id: number, dados: OrcamentoEntrada) =>
    api.put<Orcamento>(`/api/orcamentos/${id}`, dados),
  excluir: (id: number) => api.delete(`/api/orcamentos/${id}`),
}

export const metasApi = {
  listar: (usuarioId: number) => api.get<Meta[]>('/api/metas', { usuarioId }),
  buscar: (id: number) => api.get<Meta>(`/api/metas/${id}`),
  criar: (dados: MetaEntrada) => api.post<Meta>('/api/metas', dados),
  /** O PUT exige o corpo completo; também serve para registrar progresso (valorAtual). */
  atualizar: (id: number, dados: MetaEntrada) => api.put<Meta>(`/api/metas/${id}`, dados),
  excluir: (id: number) => api.delete(`/api/metas/${id}`),
}

export const alertasApi = {
  listar: (usuarioId: number, lido?: boolean) =>
    api.get<Alerta[]>('/api/alertas', { usuarioId, lido }),
  criar: (dados: { usuarioId: number; tipo: TipoAlerta; mensagem: string }) =>
    api.post<Alerta>('/api/alertas', dados),
  marcarLido: (id: number) => api.put<Alerta>(`/api/alertas/${id}/lido`),
}

export const relatoriosApi = {
  mensal: (usuarioId: number, ano?: number, mes?: number) =>
    api.get<RelatorioMensal[]>('/api/relatorios/mensal', { usuarioId, ano, mes }),
  saudeFinanceira: (usuarioId: number, ano?: number, mes?: number) =>
    api.get<SaudeFinanceira[]>('/api/saude-financeira', { usuarioId, ano, mes }),
  categorias: (usuarioId: number, ano: number, mes: number) =>
    api.get<RankingGasto[]>('/api/relatorios/categorias', { usuarioId, ano, mes }),
  estabelecimentos: (usuarioId: number, ano: number, mes: number) =>
    api.get<RankingGasto[]>('/api/relatorios/estabelecimentos', { usuarioId, ano, mes }),
  comparativo: (usuarioId: number, ano: number, mes: number) =>
    api.get<ComparativoMensal>('/api/relatorios/comparativo', { usuarioId, ano, mes }),
  indicadores: (usuarioId: number, ano: number, mes: number) =>
    api.get<Indicadores>('/api/relatorios/indicadores', { usuarioId, ano, mes }),
  gerarHistorico: (usuarioId: number, ano: number, mes: number) =>
    api.post<RelatorioHistorico>('/api/relatorios/historico', undefined, { usuarioId, ano, mes }),
  historico: (usuarioId: number) =>
    api.get<RelatorioHistorico[]>('/api/relatorios/historico', { usuarioId }),
}

export const planejamentoApi = {
  renda: (usuarioId: number, ano: number, mes: number) =>
    api.get<PlanejamentoRenda>('/api/planejamento/renda', { usuarioId, ano, mes }),
  investimentos: (usuarioId: number) =>
    api.get<Investimentos>('/api/planejamento/investimentos', { usuarioId }),
}