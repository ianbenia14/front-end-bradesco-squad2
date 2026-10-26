import type { Transaction } from "../tipos"
import { summary } from "../utilitarios/calculos"
import { money, moneySigned, pct, round2 } from "../utilitarios/formatacao"
import { Cabecalho } from "../componentes/Cabecalho"
import { Cartao } from "../componentes/Cartao"
import { CartaoEstatistica } from "../componentes/CartaoEstatistica"
import { GraficoRosca } from "../componentes/GraficoRosca"
import { Icone } from "../componentes/Icone"
import { Selecao } from "../componentes/Selecao"
import { TituloSecao } from "../componentes/TituloSecao"

export function Relatorios({ items }: { items: Transaction[] }) {
  const totals = summary(items)
  const deltas = [
    {
      label: "Receitas",
      value: totals.income,
      diff: round2(totals.income - totals.prevIncome),
      up: true,
    },
    {
      label: "Despesas",
      value: totals.expense,
      diff: round2(totals.expense - totals.prevExpense),
      up: false,
    },
    {
      label: "Economia",
      value: totals.period,
      diff: round2(totals.period - totals.prevPeriod),
      up: true,
    },
  ].map((item) => ({
    ...item,
    good: item.up ? item.diff >= 0 : item.diff <= 0,
  }))
  return (
    <>
      <Cabecalho
        title="Relatórios"
        subtitle="Entenda seus hábitos e acompanhe sua evolução financeira."
      />
      <div className="page-content">
        <div className="page-heading-actions report-filters">
          <div className="segmented">
            <button className="active">Mensal</button>
            <button>Anual</button>
          </div>
          <Selecao defaultValue="out">
            <option value="out">Outubro de 2026</option>
            <option value="set">Setembro de 2026</option>
          </Selecao>
        </div>
        <div className="stats-grid report-stats">
          <CartaoEstatistica
            label="Receitas totais"
            value={money(totals.income)}
            trend={pct(totals.income, totals.prevIncome)}
            icon="arrow-up"
          />
          <CartaoEstatistica
            label="Despesas totais"
            value={money(totals.expense)}
            trend={pct(totals.expense, totals.prevExpense)}
            icon="arrow-down"
            tone="orange"
          />
          <CartaoEstatistica
            label="Saldo do período"
            value={moneySigned(totals.period)}
            trend={pct(totals.period, totals.prevPeriod)}
            icon="wallet"
          />
        </div>
        <div className="reports-grid">
          <Cartao>
            <TituloSecao
              title="Receitas x despesas"
              action={<span className="comparison">Comparativo mensal</span>}
            />
            <div className="line-chart">
              <div className="axis-labels">
                <span>R$ 12 mil</span>
                <span>R$ 8 mil</span>
                <span>R$ 4 mil</span>
                <span>R$ 0</span>
              </div>
              <svg viewBox="0 0 620 210" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="reportArea" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#0f766e" stopOpacity=".16" />
                    <stop offset="1" stopColor="#0f766e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  className="grid-line"
                  d="M0 15H620M0 75H620M0 135H620M0 195H620"
                />
                <path
                  className="report-area"
                  d="M0 120 C80 113 102 96 155 101 S244 66 310 82 S411 54 465 61 S550 29 620 37 V195H0Z"
                />
                <path
                  className="income-line"
                  d="M0 120 C80 113 102 96 155 101 S244 66 310 82 S411 54 465 61 S550 29 620 37"
                />
                <path
                  className="expense-line"
                  d="M0 148 C67 138 100 145 155 132 S252 125 310 139 S402 111 465 118 S552 102 620 109"
                />
              </svg>
              <div className="chart-months">
                <span>Mai</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Ago</span>
                <span>Set</span>
                <span>Out</span>
              </div>
            </div>
            <div className="chart-legend centered">
              <span>
                <i className="dot green-dot" />
                Receitas
              </span>
              <span>
                <i className="dot orange-dot" />
                Despesas
              </span>
            </div>
          </Cartao>
          <Cartao>
            <TituloSecao title="Gastos por categoria" />
            <GraficoRosca />
          </Cartao>
          <Cartao className="comparison-card">
            <TituloSecao title="Comparação com setembro" />
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
          <Cartao className="report-score">
            <div className="score-copy">
              <span className="month-label">SCORE FINANCEIRO</span>
              <h3>Suas finanças estão saudáveis</h3>
              <p>
                Você evoluiu em organização e economia neste mês. Mantenha a
                consistência para chegar ainda mais longe.
              </p>
              <span className="score-status">
                <Icone name="arrow-up" size={15} /> 6 pontos desde setembro
              </span>
            </div>
            <div className="mini-score">
              <strong>82</strong>
              <span>/ 100</span>
            </div>
          </Cartao>
        </div>
      </div>
    </>
  )
}
