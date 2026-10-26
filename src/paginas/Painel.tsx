import type { Screen, Transaction } from "../tipos"
import { summary } from "../utilitarios/calculos"
import { money, moneySigned, pct } from "../utilitarios/formatacao"
import { Cabecalho } from "../componentes/Cabecalho"
import { Cartao } from "../componentes/Cartao"
import { CartaoEstatistica } from "../componentes/CartaoEstatistica"
import { Icone } from "../componentes/Icone"
import { ListaTransacoes } from "../componentes/ListaTransacoes"
import { TituloSecao } from "../componentes/TituloSecao"

export function Painel({
  navigate,
  items,
}: {
  navigate: (screen: Screen) => void
  items: Transaction[]
}) {
  const totals = summary(items)
  return (
    <>
      <Cabecalho
        title="Olá, Ana!"
        subtitle="Aqui está o resumo das suas finanças em outubro."
      />
      <div className="page-content">
        <div className="stats-grid">
          <CartaoEstatistica
            label="Saldo atual"
            value={moneySigned(totals.balance)}
            trend="+12,8%"
            icon="wallet"
          />
          <CartaoEstatistica
            label="Receitas"
            value={money(totals.income)}
            trend={pct(totals.income, totals.prevIncome)}
            icon="arrow-up"
          />
          <CartaoEstatistica
            label="Despesas"
            value={money(totals.expense)}
            trend={pct(totals.expense, totals.prevExpense)}
            icon="arrow-down"
            tone="orange"
          />
        </div>
        <div className="dashboard-grid">
          <Cartao className="recent-card">
            <TituloSecao
              title="Últimas transações"
              action={
                <button
                  className="text-button"
                  onClick={() => navigate("transactions")}
                >
                  Ver todas <Icone name="chevron" size={14} />
                </button>
              }
            />
            <ListaTransacoes items={items.slice(0, 3)} />
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
                />
              </svg>
              <div>
                <strong>82</strong>
                <span>de 100</span>
              </div>
            </div>
            <b>Muito bem!</b>
            <p>Seu score melhorou 6 pontos este mês.</p>
            <div className="score-status">
              <Icone name="check" size={16} /> Finanças saudáveis
            </div>
          </Cartao>
        </div>
      </div>
    </>
  )
}
