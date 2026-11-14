import { useState } from "react"
import type { Budget, Goal, Screen, Transaction } from "../tipos"
import {
  buildInsights,
  budgetUsage,
  categoryTotals,
  establishmentTotals,
  inMonth,
  sortByDateDesc,
  monthTotal,
  scoreFor,
  scoreLevel,
  sumKind,
  summary,
} from "../utilitarios/calculos"
import { REF_MONTH, monthKey, monthLong, monthShort, prevMonthKey } from "../utilitarios/datas"
import { type Filtros, aplicarFiltros, filtrosAtivos, filtrosVazios } from "../utilitarios/filtros"
import { money, moneySigned, pct } from "../utilitarios/formatacao"
import { useUsuario } from "../contexto/usuario"
import { Alertas } from "../componentes/Alertas"
import { Cabecalho } from "../componentes/Cabecalho"
import { Cartao } from "../componentes/Cartao"
import { CartaoEstatistica } from "../componentes/CartaoEstatistica"
import { FiltrosFinanceiros } from "../componentes/FiltrosFinanceiros"
import { GraficoBarras } from "../componentes/GraficoBarras"
import { GraficoRosca } from "../componentes/GraficoRosca"
import { Icone } from "../componentes/Icone"
import { LinhaOrcamento } from "../componentes/LinhaOrcamento"
import { ListaTransacoes } from "../componentes/ListaTransacoes"
import { TituloSecao } from "../componentes/TituloSecao"

export function Painel({
  navigate,
  items,
  budgets,
  goals,
}: {
  navigate: (screen: Screen) => void
  items: Transaction[]
  budgets: Budget[]
  goals: Goal[]
}) {
  const usuario = useUsuario()
  const [filtros, setFiltros] = useState<Filtros>(filtrosVazios)
  const active = filtrosAtivos(filtros)
  const scoped = aplicarFiltros(items, filtros)
  const totals = summary(items)
  const hasMonthData = inMonth(items, REF_MONTH).length > 0
  const score = scoreFor(items, budgets)
  const prevScore = scoreFor(items, budgets, prevMonthKey(REF_MONTH))
  const diff = score - prevScore
  const level = scoreLevel(score)
  const insights = buildInsights(items, budgets, goals)

  const view = active ? scoped : inMonth(items, REF_MONTH)
  const income = active ? sumKind(scoped, "income") : totals.income
  const expense = active ? sumKind(scoped, "expense") : totals.expense
  const net = income - expense
  const commitment = income ? (expense / income) * 100 : 0

  const chartList = active ? scoped : items
  const months = Array.from(new Set(chartList.map((t) => monthKey(t.date)))).sort()
  const firstName = usuario.name.split(" ")[0]
  const periodLabel = active ? "Período filtrado" : "Mês atual"

  return (
    <>
      <Cabecalho
        title={`Olá, ${firstName}!`}
        subtitle={`Aqui está o resumo das suas finanças em ${monthLong[REF_MONTH.split("-")[1]].toLowerCase()}.`}
      />
      <div className="page-content">
        <FiltrosFinanceiros filtros={filtros} setFiltros={setFiltros} />
        <div className="stats-grid five">
          <CartaoEstatistica
            label="Receita total"
            value={money(income)}
            trend={active ? undefined : pct(income, totals.prevIncome)}
            hint={periodLabel}
            icon="arrow-up"
          />
          <CartaoEstatistica
            label="Despesa total"
            value={money(expense)}
            trend={active ? undefined : pct(expense, totals.prevExpense)}
            hint={periodLabel}
            icon="arrow-down"
            tone="orange"
          />
          <CartaoEstatistica
            label="Saldo disponível"
            value={moneySigned(totals.balance)}
            hint="Considerando todo o histórico"
            icon="wallet"
          />
          <CartaoEstatistica
            label="Economia acumulada"
            value={moneySigned(active ? net : totals.accumulated)}
            hint={active ? "Receitas menos despesas do filtro" : "Receitas menos despesas do histórico"}
            icon="chart"
          />
          <CartaoEstatistica
            label="Comprometimento da renda"
            value={`${commitment.toFixed(1).replace(".", ",")}%`}
            hint="Despesas sobre a receita"
            icon="flag"
            tone={commitment > 90 ? "orange" : "green"}
          />
        </div>
        <div className="dashboard-grid">
          <Cartao className="recent-card">
            <TituloSecao
              title="Últimas transações"
              action={
                <button className="text-button" onClick={() => navigate("transactions")}>
                  Ver todas <Icone name="chevron" size={14} />
                </button>
              }
            />
            {items.length ? (
              <ListaTransacoes items={sortByDateDesc(active ? scoped : items).slice(0, 3)} />
            ) : (
              <p className="insight-empty">Nenhuma transação ainda. Registre a primeira em Transações.</p>
            )}
          </Cartao>
          <Cartao className="score-card">
            <TituloSecao title="Saúde financeira" />
            <div className="score-ring">
              <svg viewBox="0 0 120 120">
                <circle className="score-bg" cx="60" cy="60" r="50" />
                <circle
                  className="score-value"
                  cx="60"
                  cy="60"
                  r="50"
                  pathLength="100"
                  style={{ strokeDasharray: `${hasMonthData ? score : 0} ${100 - (hasMonthData ? score : 0)}` }}
                />
              </svg>
              <div>
                <strong>{hasMonthData ? score : "—"}</strong>
                <span>de 100</span>
              </div>
            </div>
            <b>{hasMonthData ? level : "Sem dados"}</b>
            <p>
              {!hasMonthData
                ? "Registre transações do mês para calcular seu score."
                : diff === 0
                  ? "Seu score se manteve em relação ao mês anterior."
                  : `Seu score ${diff > 0 ? "melhorou" : "caiu"} ${Math.abs(diff)} ${Math.abs(diff) === 1 ? "ponto" : "pontos"} este mês.`}
            </p>
            {hasMonthData && (
              <div className="score-status">
                <Icone name="check" size={16} /> Nível: {level}
              </div>
            )}
          </Cartao>
        </div>
        <div className="dashboard-grid second">
          <Cartao>
            <TituloSecao title="Evolução mensal de receitas e despesas" />
            <GraficoBarras
              labels={months.map(monthShort)}
              series={[
                { name: "Receitas", color: "#0f766e", values: months.map((k) => monthTotal(chartList, k, "income")) },
                { name: "Despesas", color: "#F2B84B", values: months.map((k) => monthTotal(chartList, k, "expense")) },
              ]}
            />
          </Cartao>
          <Cartao>
            <TituloSecao title="Gastos por categoria" />
            <GraficoRosca data={categoryTotals(view)} />
          </Cartao>
        </div>
        <div className="dashboard-grid second">
          <Cartao>
            <TituloSecao title="Gastos por estabelecimento" />
            <div className="rank-list">
              {establishmentTotals(view).slice(0, 5).map(([name, value]) => (
                <div key={name}>
                  <span>{name}</span>
                  <strong>{money(value)}</strong>
                </div>
              ))}
              {!establishmentTotals(view).length && <div className="empty-state">Sem despesas no período.</div>}
            </div>
          </Cartao>
          <Cartao>
            <TituloSecao title="Insights e alertas" />
            <Alertas insights={insights} />
          </Cartao>
        </div>
        <div className="dashboard-grid second one">
          <Cartao>
            <TituloSecao
              title="Orçamentos do mês"
              action={
                <button className="text-button" onClick={() => navigate("budgets")}>
                  Ver todos <Icone name="chevron" size={14} />
                </button>
              }
            />
            {budgets.length ? (
              budgets.map((b) => (
                <LinhaOrcamento key={b.id} compact item={{ ...b, spent: budgetUsage(b, items).spent }} />
              ))
            ) : (
              <p className="insight-empty">Nenhum orçamento definido. Crie um em Orçamentos.</p>
            )}
          </Cartao>
        </div>
      </div>
    </>
  )
}
