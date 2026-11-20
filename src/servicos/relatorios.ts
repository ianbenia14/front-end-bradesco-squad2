
import {
  relatoriosApi,
  type RelatorioMensal,
  type SaudeFinanceira,
  type RankingGasto,
  type ComparativoMensal,
  type Indicadores,
  type RelatorioHistorico,
} from "./apiFinancas"

// Busca os totais mensais ou anuais do usuário.
export const carregarRelatorioMensal = (
  usuarioId: number,
  ano?: number,
  mes?: number,
): Promise<RelatorioMensal[]> =>
  relatoriosApi.mensal(usuarioId, ano, mes)

// Busca os indicadores de saúde financeira.
export const carregarSaudeFinanceira = (
  usuarioId: number,
  ano?: number,
  mes?: number,
): Promise<SaudeFinanceira[]> =>
  relatoriosApi.saudeFinanceira(usuarioId, ano, mes)

// Busca o ranking de gastos por categoria.
export const carregarGastosPorCategoria = (
  usuarioId: number,
  ano: number,
  mes: number,
): Promise<RankingGasto[]> =>
  relatoriosApi.categorias(usuarioId, ano, mes)

// Busca o ranking de gastos por estabelecimento.
export const carregarGastosPorEstabelecimento = (
  usuarioId: number,
  ano: number,
  mes: number,
): Promise<RankingGasto[]> =>
  relatoriosApi.estabelecimentos(usuarioId, ano, mes)

// Busca a comparação com o mês anterior.
export const carregarComparativoMensal = (
  usuarioId: number,
  ano: number,
  mes: number,
): Promise<ComparativoMensal> =>
  relatoriosApi.comparativo(usuarioId, ano, mes)

// Busca os indicadores financeiros do período.
export const carregarIndicadores = (
  usuarioId: number,
  ano: number,
  mes: number,
): Promise<Indicadores> =>
  relatoriosApi.indicadores(usuarioId, ano, mes)

// Gera e salva um relatório no histórico do back-end.
export const gerarRelatorioHistorico = (
  usuarioId: number,
  ano: number,
  mes: number,
): Promise<RelatorioHistorico> =>
  relatoriosApi.gerarHistorico(usuarioId, ano, mes)

// Carrega o histórico de relatórios salvos.
export const carregarHistoricoRelatorios = (
  usuarioId: number,
): Promise<RelatorioHistorico[]> =>
  relatoriosApi.historico(usuarioId)
