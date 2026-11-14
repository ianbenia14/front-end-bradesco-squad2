import { useState } from "react"
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
}: {
  items: Transaction[]
  budgets: Budget[]
  reports: ReportSnapshot[]
  setReports: React.Dispatch<React.SetStateAction<ReportSnapshot[]>>
}) {
  const [filtros, setFiltros] = useState<Filtros>(filtrosVazios)
  const [mode, setMode] = useState<"month" | "year">("month")
  const [month, setMonth] = useState(REF_MONTH)
  const months = Array.from(new Set([...monthsWithData(items), REF_MONTH])).sort()

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

  const income = sumKind(scoped, "income")
  const expense = sumKind(scoped, "expense")
  const prevIncome = sumKind(prevList, "income")
  const prevExpense = sumKind(prevList, "expense")
  const balance = round2(income - expense)
  const prevBalance = round2(prevIncome - prevExpense)

  const ranking = categoryTotals(scoped)
  const totalExpense = ranking.reduce((s, [, v]) => s + v, 0)
  const establishments = establishmentTotals(scoped).slice(0, 5)
  const score = scoreFor(items, budgets, custom || mode === "year" ? REF_MONTH : month)
  const hasData = items.length > 0

  const chartMonths = Array.from(new Set(filtered.map((t) => monthKey(t.date)))).sort()
  const trend = chartMonths.map((k, i) => ({
    key: k,
    expense: monthTotal(filtered, k, "expense"),
    delta: i ? monthTotal(filtered, k, "expense") - monthTotal(filtered, chartMonths[i - 1], "expense") : null,
  }))

  const deltas = [
    { label: "Receitas", value: income, diff: round2(income - prevIncome), up: true },
    { label: "Despesas", value: expense, diff: round2(expense - prevExpense), up: false },
    { label: "Economia", value: balance, diff: round2(balance - prevBalance), up: true },
  ].map((item) => ({ ...item, good: item.up ? item.diff >= 0 : item.diff <= 0 }))

  const saveSnapshot = () => {
    const snap = buildSnapshot(items, budgets, month)
    setReports((cur) => [snap, ...cur.filter((r) => r.month !== month)])
  }
  const exportCsv = (title: string, inc: number, exp: number, rank: [string, number][]) => {
    const total = rank.reduce((s, [, v]) => s + v, 0)
    const lines = [
      csvLinha(["Relatório", title]),
      csvLinha(["Total recebido", inc.toFixed(2).replace(".", ",")]),
      csvLinha(["Total gasto", exp.toFixed(2).replace(".", ",")]),
      csvLinha(["Saldo final", (inc - exp).toFixed(2).replace(".", ",")]),
      "",
      csvLinha(["Categoria", "Valor", "Percentual"]),
      ...rank.map(([n, v]) => csvLinha([n, v.toFixed(2).replace(".", ","), total ? `${Math.round((v / total) * 100)}%` : "0%"])),
    ]
    baixarArquivo(`relatorio-${title.replace(/\s+/g, "-").toLowerCase()}.csv`, lines.join("\n"))
  }
  const periodName = custom ? "período filtrado" : mode === "year" ? "ano" : "mês"

  return (
    <>
      <Cabecalho title="Relatórios" subtitle="Entenda seus hábitos e acompanhe sua evolução financeira." />
      <div className="page-content">
        <div className="page-heading-actions report-filters">
          <div className="segmented">
            <button className={mode === "month" ? "active" : ""} onClick={() => setMode("month")}>Mensal</button>
            <button className={mode === "year" ? "active" : ""} onClick={() => setMode("year")}>Anual</button>
          </div>
          {mode === "month" && !custom && (
            <Selecao value={month} onChange={(e) => setMonth(e.target.value)}>
              {[...months].reverse().map((k) => (
                <option key={k} value={k}>{monthLabel(k)}</option>
              ))}
            </Selecao>
          )}
        </div>
        <div className="report-actions no-print">
          {mode === "month" && !custom && (
            <Botao variant="secondary" onClick={saveSnapshot}>
              Salvar relatório do mês
            </Botao>
          )}
          <Botao variant="secondary" onClick={() => exportCsv(custom ? "periodo-filtrado" : mode === "year" ? year : month, income, expense, ranking)}>
            Exportar CSV
          </Botao>
          <Botao variant="secondary" onClick={() => window.print()}>
            Exportar PDF
          </Botao>
        </div>
        <FiltrosFinanceiros filtros={filtros} setFiltros={setFiltros} />
        {custom && <p className="plan-total">Datas informadas: o relatório usa o período filtrado no lugar do mês/ano.</p>}
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
        <div className="reports-grid">
          <Cartao>
            <TituloSecao title="Evolução mensal" action={<span className="comparison">Receitas x despesas</span>} />
            <GraficoBarras
              labels={chartMonths.map(monthShort)}
              series={[
                { name: "Receitas", color: "#0f766e", values: chartMonths.map((k) => monthTotal(filtered, k, "income")) },
                { name: "Despesas", color: "#F2B84B", values: chartMonths.map((k) => monthTotal(filtered, k, "expense")) },
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
                <tr><th>#</th><th>Categoria</th><th>Valor</th><th>%</th></tr>
              </thead>
              <tbody>
                {ranking.map(([name, value], i) => (
                  <tr key={name}>
                    <td>{i + 1}</td>
                    <td>{name}</td>
                    <td>{money(value)}</td>
                    <td>{totalExpense ? Math.round((value / totalExpense) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!ranking.length && <div className="empty-state">Sem despesas no período.</div>}
          </Cartao>
          <Cartao>
            <TituloSecao title="Gastos por estabelecimento" />
            <div className="rank-list">
              {establishments.map(([name, value]) => (
                <div key={name}><span>{name}</span><strong>{money(value)}</strong></div>
              ))}
              {!establishments.length && <div className="empty-state">Sem despesas no período.</div>}
            </div>
          </Cartao>
          {comparable && (
            <Cartao className="comparison-card">
              <TituloSecao title={`Comparação com ${monthLabel(prevMonthKey(month)).split(" de ")[0].toLowerCase()}`} />
              <div className="comparison-grid">
                {deltas.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{moneySigned(item.value)}</strong>
                    <small className={item.good ? "positive" : "negative"}>
                      <Icone name={item.diff >= 0 ? "arrow-up" : "arrow-down"} size={14} /> {money(item.diff)}
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
                        {" "}{t.delta >= 0 ? "+" : "-"}{money(t.delta)}
                      </small>
                    )}
                  </strong>
                </div>
              ))}
              {!trend.length && <div className="empty-state">Sem dados no período.</div>}
            </div>
          </Cartao>
          <Cartao className="comparison-card no-print">
            <TituloSecao title="Histórico de relatórios mensais" />
            <div className="rank-list">
              {[...reports].sort((a, b) => b.month.localeCompare(a.month)).map((r) => (
                <div key={r.id}>
                  <span>
                    {monthLabel(r.month)} · saldo {moneySigned(r.balance)} · score {r.score}
                  </span>
                  <span className="snap-actions">
                    <button className="link-button" onClick={() => exportCsv(r.month, r.income, r.expense, r.ranking)}>
                      CSV
                    </button>
                    <button className="link-button" onClick={() => { setMode("month"); setMonth(r.month); setFiltros(filtrosVazios) }}>
                      Abrir
                    </button>
                    <button className="link-button danger-link" onClick={() => setReports((cur) => cur.filter((x) => x.id !== r.id))}>
                      Excluir
                    </button>
                  </span>
                </div>
              ))}
              {!reports.length && <div className="empty-state">Nenhum relatório salvo ainda. Os meses encerrados são guardados automaticamente.</div>}
            </div>
          </Cartao>
          <Cartao className="report-score">
            <div className="score-copy">
              <span className="month-label">SCORE FINANCEIRO</span>
              <h3>{hasData ? `Nível: ${scoreLevel(score)}` : "Sem dados"}</h3>
              <p>Calculado a partir da economia, controle de gastos, estouros de orçamento e constância de investimentos.</p>
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
