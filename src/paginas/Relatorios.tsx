
import { History, X } from "lucide-react"
import { useEffect, useState } from "react"
import type { Budget, ReportSnapshot, Transaction } from "../tipos"
import {
  categoryTotals,
  establishmentTotals,
  inMonth,
  monthTotal,
  monthsWithData,
  scoreFor,
  scoreLevel,
  sumKind,
} from "../utilitarios/calculos"
import { REF_MONTH, monthKey, monthLabel, monthShort, prevMonthKey } from "../utilitarios/datas"
import { type Filtros, aplicarFiltros, filtrosVazios } from "../utilitarios/filtros"
import { money, moneySigned, pct, round2 } from "../utilitarios/formatacao"
import { baixarArquivo, csvLinha } from "../utilitarios/exportar"
import { buildSnapshot } from "../utilitarios/relatorios"
import {
  carregarRelatorioMensal,
  carregarSaudeFinanceira,
  carregarGastosPorCategoria,
  carregarGastosPorEstabelecimento,
  carregarComparativoMensal,
  carregarIndicadores,
  gerarRelatorioHistorico,
  carregarHistoricoRelatorios,
} from "../servicos/relatorios"
import { Botao } from "../componentes/Botao"
import { Cabecalho } from "../componentes/Cabecalho"
import { Cartao } from "../componentes/Cartao"
import { CartaoEstatistica } from "../componentes/CartaoEstatistica"
import { FiltrosFinanceiros } from "../componentes/FiltrosFinanceiros"
import { GraficoBarras } from "../componentes/GraficoBarras"
import { GraficoRosca } from "../componentes/GraficoRosca"
import { Icone } from "../componentes/Icone"
import { Selecao } from "../componentes/Selecao"
import { TituloSecao } from "../componentes/TituloSecao"

export function Relatorios({
  items,
  budgets,
  reports,
  setReports,
  usuarioId = null,
}: {
  items: Transaction[]
  budgets: Budget[]
  reports: ReportSnapshot[]
  setReports: React.Dispatch<React.SetStateAction<ReportSnapshot[]>>
  usuarioId?: number | null
}) {
  const [filtros, setFiltros] = useState<Filtros>(filtrosVazios)
  const [mode, setMode] = useState<"month" | "year">("month")
  const [month, setMonth] = useState(REF_MONTH)
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState("")

  // Guarda o relatório escolhido no histórico.
  const [relatorioSelecionado, setRelatorioSelecionado] =
    useState<ReportSnapshot | null>(null)

  const [dadosMensais, setDadosMensais] = useState<
    Awaited<ReturnType<typeof carregarRelatorioMensal>>
  >([])

  const [saudeFinanceira, setSaudeFinanceira] = useState<
    Awaited<ReturnType<typeof carregarSaudeFinanceira>>
  >([])

  const [categoriasApi, setCategoriasApi] = useState<
    Awaited<ReturnType<typeof carregarGastosPorCategoria>>
  >([])

  const [estabelecimentosApi, setEstabelecimentosApi] = useState<
    Awaited<ReturnType<typeof carregarGastosPorEstabelecimento>>
  >([])

  const [comparativoApi, setComparativoApi] = useState<
    Awaited<ReturnType<typeof carregarComparativoMensal>> | null
  >(null)

  const [indicadoresApi, setIndicadoresApi] = useState<
    Awaited<ReturnType<typeof carregarIndicadores>> | null
  >(null)

  const meses = Array.from(
    new Set([
      ...monthsWithData(items),
      ...reports.map((report) => report.month),
      ...(relatorioSelecionado ? [relatorioSelecionado.month] : []),
      REF_MONTH,
    ]),
  ).sort()

  const filtered = aplicarFiltros(items, filtros)
  const custom = Boolean(filtros.from || filtros.to)
  const year = REF_MONTH.slice(0, 4)

  const scoped = custom
    ? filtered
    : mode === "year"
      ? filtered.filter((t) => monthKey(t.date).startsWith(year))
      : inMonth(filtered, month)

  const comparable = !custom && mode === "month"
  const prevList = comparable ? inMonth(filtered, prevMonthKey(month)) : []

  const incomeLocal = sumKind(scoped, "income")
  const expenseLocal = sumKind(scoped, "expense")
  const prevIncomeLocal = sumKind(prevList, "income")
  const prevExpenseLocal = sumKind(prevList, "expense")

  const usaDadosApi =
    usuarioId !== null &&
    usuarioId !== undefined &&
    !custom &&
    mode === "month"

  // Só considera o snapshot enquanto o usuário estiver visualizando
  // o mês correspondente ao relatório escolhido no histórico.
  const snapshotAtivo =
    relatorioSelecionado &&
    !custom &&
    mode === "month" &&
    month === relatorioSelecionado.month
      ? relatorioSelecionado
      : null

  const mensalAtual = dadosMensais[0]
  const saudeAtual = saudeFinanceira[0]

  // Quando um relatório salvo é aberto, seus valores têm prioridade.
  const income = snapshotAtivo
    ? snapshotAtivo.income
    : usaDadosApi && mensalAtual
      ? mensalAtual.totalReceitas
      : incomeLocal

  const expense = snapshotAtivo
    ? snapshotAtivo.expense
    : usaDadosApi && mensalAtual
      ? mensalAtual.totalDespesas
      : expenseLocal

  const prevIncome =
    usaDadosApi && comparativoApi
      ? comparativoApi.receitasMesAnterior
      : prevIncomeLocal

  const prevExpense =
    usaDadosApi && comparativoApi
      ? comparativoApi.despesasMesAnterior
      : prevExpenseLocal

  const balance = snapshotAtivo
    ? snapshotAtivo.balance
    : round2(income - expense)

  const prevBalance = round2(prevIncome - prevExpense)

  const rankingLocal = categoryTotals(scoped)

  // No histórico, prioriza o ranking associado ao snapshot selecionado.
  const ranking: [string, number][] = snapshotAtivo
    ? snapshotAtivo.ranking
    : usaDadosApi && categoriasApi.length > 0
      ? categoriasApi.map(
          (item) => [item.nome, item.total] as [string, number],
        )
      : rankingLocal

  const totalExpense = ranking.reduce((s, [, v]) => s + v, 0)

  const establishmentsLocal = establishmentTotals(scoped).slice(0, 5)

  // Evita mostrar estabelecimentos de uma consulta anterior
  // enquanto um relatório histórico estiver aberto.
  const establishments =
    !snapshotAtivo && usaDadosApi && estabelecimentosApi.length > 0
      ? estabelecimentosApi
          .slice(0, 5)
          .map((item) => [item.nome, item.total] as [string, number])
      : establishmentsLocal

  const score = snapshotAtivo
    ? snapshotAtivo.score
    : scoreFor(
        items,
        budgets,
        custom || mode === "year" ? REF_MONTH : month,
      )

  const hasData =
    items.length > 0 ||
    Boolean(mensalAtual) ||
    Boolean(snapshotAtivo)

  const chartMonths = Array.from(
    new Set(filtered.map((t) => monthKey(t.date))),
  ).sort()

  const trend = chartMonths.map((k, i) => ({
    key: k,
    expense: monthTotal(filtered, k, "expense"),
    delta: i
      ? monthTotal(filtered, k, "expense") -
        monthTotal(filtered, chartMonths[i - 1], "expense")
      : null,
  }))

  const deltas = [
    {
      label: "Receitas",
      value: income,
      diff: round2(income - prevIncome),
      up: true,
    },
    {
      label: "Despesas",
      value: expense,
      diff: round2(expense - prevExpense),
      up: false,
    },
    {
      label: "Economia",
      value: balance,
      diff: round2(balance - prevBalance),
      up: true,
    },
  ].map((item) => ({
    ...item,
    good: item.up ? item.diff >= 0 : item.diff <= 0,
  }))

  // Carrega os dados do período selecionado no backend.
  useEffect(() => {
    if (
      usuarioId === null ||
      usuarioId === undefined ||
      custom ||
      mode !== "month"
    ) {
      return
    }

    const idUsuario: number = usuarioId
    let ativo = true

    const [anoSelecionado, mesSelecionado] = month.split("-").map(Number)

    async function carregarDados() {
      try {
        const [
          mensal,
          saude,
          categorias,
          estabelecimentos,
          comparativo,
          indicadores,
        ] = await Promise.all([
          carregarRelatorioMensal(
            idUsuario,
            anoSelecionado,
            mesSelecionado,
          ),
          carregarSaudeFinanceira(
            idUsuario,
            anoSelecionado,
            mesSelecionado,
          ),
          carregarGastosPorCategoria(
            idUsuario,
            anoSelecionado,
            mesSelecionado,
          ),
          carregarGastosPorEstabelecimento(
            idUsuario,
            anoSelecionado,
            mesSelecionado,
          ),
          carregarComparativoMensal(
            idUsuario,
            anoSelecionado,
            mesSelecionado,
          ),
          carregarIndicadores(
            idUsuario,
            anoSelecionado,
            mesSelecionado,
          ),
        ])

        if (!ativo) return

        setDadosMensais(mensal)
        setSaudeFinanceira(saude)
        setCategoriasApi(categorias)
        setEstabelecimentosApi(estabelecimentos)
        setComparativoApi(comparativo)
        setIndicadoresApi(indicadores)
        setErroApi("")
      } catch (error) {
        if (!ativo) return

        console.error("Erro ao carregar relatórios:", error)
        setErroApi(
          "Não foi possível carregar os dados do relatório no servidor.",
        )
      }
    }

    carregarDados()

    return () => {
      ativo = false
    }
  }, [usuarioId, month, mode, custom, items])

  // Carrega o histórico salvo no banco.
  useEffect(() => {
    if (usuarioId === null || usuarioId === undefined) {
      return
    }

    const idUsuario: number = usuarioId
    let ativo = true

    async function carregarHistorico() {
      try {
        const historico = await carregarHistoricoRelatorios(idUsuario)

        if (!ativo) return

        const snapshots: ReportSnapshot[] = historico.map((item) => {
          const mesRelatorio = `${item.ano}-${String(item.mes).padStart(2, "0")}`
          const transacoesDoMes = inMonth(items, mesRelatorio)

          return {
            id: String(item.id),
            month: mesRelatorio,
            savedAt: item.geradoEm,
            income: item.totalReceitas,
            expense: item.totalDespesas,
            balance: item.saldo,
            score: scoreFor(items, budgets, mesRelatorio),
            ranking: categoryTotals(transacoesDoMes),
          }
        })

        setReports(snapshots)
      } catch (error) {
        if (!ativo) return

        console.error("Erro ao carregar histórico:", error)
        setErroApi("Não foi possível carregar o histórico de relatórios.")
      }
    }

    carregarHistorico()

    return () => {
      ativo = false
    }
  }, [usuarioId, items, budgets, setReports])

  const saveSnapshot = async () => {
    if (salvando) return

    setSalvando(true)
    setErroApi("")

    try {
      const snap = buildSnapshot(items, budgets, month)

      if (usuarioId !== null && usuarioId !== undefined) {
        const idUsuario: number = usuarioId
        const [anoSelecionado, mesSelecionado] = month.split("-").map(Number)

        const salvo = await gerarRelatorioHistorico(
          idUsuario,
          anoSelecionado,
          mesSelecionado,
        )

        const snapshotApi: ReportSnapshot = {
          id: String(salvo.id),
          month: `${salvo.ano}-${String(salvo.mes).padStart(2, "0")}`,
          savedAt: salvo.geradoEm,
          income: salvo.totalReceitas,
          expense: salvo.totalDespesas,
          balance: salvo.saldo,
          score: snap.score,
          ranking: snap.ranking,
        }

        setReports((cur) => [
          snapshotApi,
          ...cur.filter((r) => r.month !== snapshotApi.month),
        ])

        setRelatorioSelecionado(snapshotApi)
      } else {
        setReports((cur) => [
          snap,
          ...cur.filter((r) => r.month !== month),
        ])

        setRelatorioSelecionado(snap)
      }
    } catch (error) {
      console.error("Erro ao salvar relatório:", error)
      setErroApi(
        "Não foi possível salvar o relatório. Verifique sua conexão com o servidor.",
      )
    } finally {
      setSalvando(false)
    }
  }

  // Abre o relatório escolhido no histórico.
  const abrirRelatorio = (relatorio: ReportSnapshot) => {
    setFiltros({ ...filtrosVazios })
    setMode("month")
    setMonth(relatorio.month)
    setRelatorioSelecionado({ ...relatorio })
    setErroApi("")

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Fecha a visualização histórica e volta ao relatório normal.
  const fecharRelatorioHistorico = () => {
    setRelatorioSelecionado(null)
    setErroApi("")
  }

  const exportCsv = (
    title: string,
    inc: number,
    exp: number,
    rank: [string, number][],
  ) => {
    const total = rank.reduce((s, [, v]) => s + v, 0)

    const lines = [
      csvLinha(["Relatório", title]),
      csvLinha(["Total recebido", inc.toFixed(2).replace(".", ",")]),
      csvLinha(["Total gasto", exp.toFixed(2).replace(".", ",")]),
      csvLinha(["Saldo final", (inc - exp).toFixed(2).replace(".", ",")]),
      "",
      csvLinha(["Categoria", "Valor", "Percentual"]),
      ...rank.map(([n, v]) =>
        csvLinha([
          n,
          v.toFixed(2).replace(".", ","),
          total ? `${Math.round((v / total) * 100)}%` : "0%",
        ]),
      ),
    ]

    baixarArquivo(
      `relatorio-${title.replace(/\s+/g, "-").toLowerCase()}.csv`,
      lines.join("\n"),
    )
  }

  const periodName = custom
    ? "período filtrado"
    : mode === "year"
      ? "ano"
      : "mês"

  return (
    <>
      <Cabecalho
        title="Relatórios"
        subtitle="Entenda seus hábitos e acompanhe sua evolução financeira."
      />

      <div className="page-content">
        <div className="page-heading-actions report-filters">
          <div className="segmented">
            <button
              type="button"
              className={mode === "month" ? "active" : ""}
              onClick={() => {
                setMode("month")
                setRelatorioSelecionado(null)
              }}
            >
              Mensal
            </button>

            <button
              type="button"
              className={mode === "year" ? "active" : ""}
              onClick={() => {
                setMode("year")
                setRelatorioSelecionado(null)
              }}
            >
              Anual
            </button>
          </div>

          {mode === "month" && !custom && (
            <Selecao
              value={month}
              onChange={(e) => {
                setMonth(e.target.value)
                setRelatorioSelecionado(null)
              }}
            >
              {[...meses].reverse().map((k) => (
                <option key={k} value={k}>
                  {monthLabel(k)}
                </option>
              ))}
            </Selecao>
          )}
        </div>

        <div className="report-actions no-print">
          {mode === "month" && !custom && (
            <Botao
              variant="secondary"
              onClick={saveSnapshot}
            >
              {salvando ? "Salvando..." : "Salvar relatório do mês"}
            </Botao>
          )}

          <Botao
            variant="secondary"
            onClick={() =>
              exportCsv(
                custom
                  ? "periodo-filtrado"
                  : mode === "year"
                    ? year
                    : month,
                income,
                expense,
                ranking,
              )
            }
          >
            Exportar CSV
          </Botao>

          <Botao variant="secondary" onClick={() => window.print()}>
            Exportar PDF
          </Botao>
        </div>

        {snapshotAtivo && (
          <Cartao className="historical-report-card">
            <div className="historical-report-top">
              <div className="historical-report-header">
                <div className="historical-report-icon">
                  <History size={21} />
                </div>

                <div className="historical-report-heading">
                  <strong>Relatório histórico aberto</strong>
                  <p>
                    Exibindo o relatório salvo de {monthLabel(snapshotAtivo.month)}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="historical-report-close"
                onClick={fecharRelatorioHistorico}
                aria-label="Fechar relatório histórico"
                title="Fechar relatório histórico"
              >
                <X size={17} />
                <span>Fechar</span>
              </button>
            </div>

            <div className="historical-report-values">
              <div>
                <span>Receitas</span>
                <strong className="positive">
                  {money(snapshotAtivo.income)}
                </strong>
              </div>

              <div>
                <span>Despesas</span>
                <strong className="negative">
                  {money(snapshotAtivo.expense)}
                </strong>
              </div>

              <div>
                <span>Saldo</span>
                <strong className={snapshotAtivo.balance >= 0 ? "positive" : "negative"}>
                  {moneySigned(snapshotAtivo.balance)}
                </strong>
              </div>
            </div>
          </Cartao>
        )}

        {erroApi && (
          <p className="plan-total" role="alert">
            {erroApi}
          </p>
        )}

        <FiltrosFinanceiros filtros={filtros} setFiltros={setFiltros} />

        {custom && (
          <p className="plan-total">
            Datas informadas: o relatório usa o período filtrado no lugar do mês/ano.
          </p>
        )}

        <div className="stats-grid report-stats">
          <CartaoEstatistica
            label={`Total recebido no ${periodName}`}
            value={money(income)}
            trend={comparable ? pct(income, prevIncome) : undefined}
            hint="Receitas do período"
            icon="arrow-up"
          />

          <CartaoEstatistica
            label={`Total gasto no ${periodName}`}
            value={money(expense)}
            trend={comparable ? pct(expense, prevExpense) : undefined}
            hint="Despesas do período"
            icon="arrow-down"
            tone="orange"
          />

          <CartaoEstatistica
            label="Saldo final"
            value={moneySigned(balance)}
            trend={comparable ? pct(balance, prevBalance) : undefined}
            hint="Receitas menos despesas"
            icon="wallet"
          />
        </div>

        {usuarioId !== null &&
          usuarioId !== undefined &&
          usaDadosApi &&
          !snapshotAtivo && (
            <Cartao className="server-indicators-card">
              <TituloSecao title="Indicadores financeiros do servidor" />

              <div className="rank-list">
                {saudeAtual && (
                  <>
                    <div>
                      <span>Saúde financeira</span>
                      <strong>{saudeAtual.faixa.replace(/_/g, " ")}</strong>
                    </div>

                    <div>
                      <span>Taxa de poupança</span>
                      <strong>
                        {saudeAtual.taxaPoupanca === null
                          ? "Sem dados"
                          : `${saudeAtual.taxaPoupanca.toFixed(2).replace(".", ",")}%`}
                      </strong>
                    </div>
                  </>
                )}

                {indicadoresApi && (
                  <>
                    <div>
                      <span>Economia acumulada</span>
                      <strong>{money(indicadoresApi.economiaAcumulada)}</strong>
                    </div>

                    <div>
                      <span>Comprometimento da renda</span>
                      <strong>
                        {indicadoresApi.comprometimentoRenda === null
                          ? "Sem dados"
                          : `${indicadoresApi.comprometimentoRenda.toFixed(2).replace(".", ",")}%`}
                      </strong>
                    </div>
                  </>
                )}

                {comparativoApi && (
                  <>
                    <div>
                      <span>Variação das receitas</span>
                      <strong>
                        {comparativoApi.variacaoReceitas === null
                          ? "Sem dados"
                          : `${comparativoApi.variacaoReceitas.toFixed(2).replace(".", ",")}%`}
                      </strong>
                    </div>

                    <div>
                      <span>Variação das despesas</span>
                      <strong>
                        {comparativoApi.variacaoDespesas === null
                          ? "Sem dados"
                          : `${comparativoApi.variacaoDespesas.toFixed(2).replace(".", ",")}%`}
                      </strong>
                    </div>
                  </>
                )}
              </div>
            </Cartao>
          )}

        <div className="reports-grid">
          <Cartao>
            <TituloSecao
              title="Evolução mensal"
              action={<span className="comparison">Receitas x despesas</span>}
            />

            <GraficoBarras
              labels={chartMonths.map(monthShort)}
              series={[
                {
                  name: "Receitas",
                  color: "#0f766e",
                  values: chartMonths.map((k) =>
                    monthTotal(filtered, k, "income"),
                  ),
                },
                {
                  name: "Despesas",
                  color: "#F2B84B",
                  values: chartMonths.map((k) =>
                    monthTotal(filtered, k, "expense"),
                  ),
                },
              ]}
            />
          </Cartao>

          <Cartao>
            <TituloSecao title="Gastos por categoria" />
            <GraficoRosca data={ranking} />
          </Cartao>

          <Cartao className="rank-card">
            <TituloSecao title="Ranking de categorias" />

            <table className="rank-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>%</th>
                </tr>
              </thead>

              <tbody>
                {ranking.map(([name, value], i) => (
                  <tr key={name}>
                    <td>{i + 1}</td>
                    <td>{name}</td>
                    <td>{money(value)}</td>
                    <td>
                      {totalExpense
                        ? Math.round((value / totalExpense) * 100)
                        : 0}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!ranking.length && (
              <div className="empty-state">
                Sem despesas no período.
              </div>
            )}
          </Cartao>

          <Cartao>
            <TituloSecao title="Gastos por estabelecimento" />

            <div className="rank-list">
              {establishments.map(([name, value]) => (
                <div key={name}>
                  <span>{name}</span>
                  <strong>{money(value)}</strong>
                </div>
              ))}

              {!establishments.length && (
                <div className="empty-state">
                  Sem despesas no período.
                </div>
              )}
            </div>
          </Cartao>

          {comparable && (
            <Cartao className="comparison-card">
              <TituloSecao
                title={`Comparação com ${monthLabel(
                  prevMonthKey(month),
                ).split(" de ")[0].toLowerCase()}`}
              />

              <div className="comparison-grid">
                {deltas.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{moneySigned(item.value)}</strong>
                    <small className={item.good ? "positive" : "negative"}>
                      <Icone
                        name={item.diff >= 0 ? "arrow-up" : "arrow-down"}
                        size={14}
                      />{" "}
                      {money(item.diff)}
                    </small>
                  </div>
                ))}
              </div>
            </Cartao>
          )}

          <Cartao>
            <TituloSecao title="Comparativo mês a mês (despesas)" />

            <div className="rank-list">
              {trend.map((t) => (
                <div key={t.key}>
                  <span>{monthLabel(t.key)}</span>

                  <strong>
                    {money(t.expense)}

                    {t.delta !== null && (
                      <small className={t.delta <= 0 ? "positive" : "negative"}>
                        {" "}
                        {t.delta >= 0 ? "+" : "-"}
                        {money(t.delta)}
                      </small>
                    )}
                  </strong>
                </div>
              ))}

              {!trend.length && (
                <div className="empty-state">
                  Sem dados no período.
                </div>
              )}
            </div>
          </Cartao>

          <Cartao className="comparison-card no-print">
            <TituloSecao title="Histórico de relatórios mensais" />

            <div className="rank-list">
              {[...reports]
                .sort((a, b) => b.month.localeCompare(a.month))
                .map((r) => (
                  <div key={r.id}>
                    <span>
                      {monthLabel(r.month)} · saldo {moneySigned(r.balance)} · score{" "}
                      {r.score}
                      {snapshotAtivo?.id === r.id && (
                        <strong className="positive"> · Aberto</strong>
                      )}
                    </span>

                    <span className="snap-actions">
                      <button
                        type="button"
                        className="link-button"
                        onClick={() =>
                          exportCsv(r.month, r.income, r.expense, r.ranking)
                        }
                      >
                        CSV
                      </button>

                      <button
                        type="button"
                        className="link-button"
                        aria-pressed={snapshotAtivo?.id === r.id}
                        onClick={() => abrirRelatorio(r)}
                      >
                        {snapshotAtivo?.id === r.id ? "Aberto" : "Abrir"}
                      </button>

                      {!usuarioId && (
                        <button
                          type="button"
                          className="link-button danger-link"
                          onClick={() => {
                            setReports((cur) =>
                              cur.filter((x) => x.id !== r.id),
                            )

                            if (relatorioSelecionado?.id === r.id) {
                              setRelatorioSelecionado(null)
                            }
                          }}
                        >
                          Excluir
                        </button>
                      )}
                    </span>
                  </div>
                ))}

              {!reports.length && (
                <div className="empty-state">
                  Nenhum relatório salvo ainda. Os meses encerrados são guardados automaticamente.
                </div>
              )}
            </div>
          </Cartao>

          <Cartao className="report-score">
            <div className="score-copy">
              <span className="month-label">SCORE FINANCEIRO</span>

              <h3>{hasData ? `Nível: ${scoreLevel(score)}` : "Sem dados"}</h3>

              <p>
                Calculado a partir da economia, controle de gastos, estouros
                de orçamento e constância de investimentos.
              </p>
            </div>

            <div className="mini-score">
              <strong>{hasData ? score : "—"}</strong>
              <span>/ 100</span>
            </div>
          </Cartao>
        </div>
      </div>
    </>
  )
}
