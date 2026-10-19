// Painel: saldo, receitas, despesas e últimas transações
import Icon from "../../componentes/Icones"
import { Card, StatCard, SectionTitle } from "../../componentes/Cartoes"
import { Header } from "../../componentes/LogoMenuCabecalho"
import TransactionList from "../Transacoes/ListaTransacoes"
import { money, moneySigned, pct, summary } from "../../utilitarios/formatacao"
import type { Screen, Transaction } from "../../tipos/tipos"

// ===== TELA: PAINEL =====
// TELA PAINEL: resumo das finanças
export default function Dashboard({
  navigate,
  items,
}: {
  navigate: (screen: Screen) => void
  items: Transaction[]
}) {
  // Calcula saldo, receitas e despesas a partir das transações
  const totals = summary(items)
  return (
    <>
      {/* ===== CABEÇALHO ===== */}
      {/* CABEÇALHO: saudação */}
      <Header
        title="Olá, Ana!"
        subtitle="Aqui está o resumo das suas finanças em outubro."
      />
      {/* CONTEÚDO DA PÁGINA */}
      <div className="page-content">
        {/* ===== CARDS DE RESUMO ===== */}
        {/* CARDS DE RESUMO (3 cards lado a lado) */}
        <div className="stats-grid">
          {/* Card 1: SALDO ATUAL */}
          <StatCard
            label="Saldo atual"
            value={moneySigned(totals.balance)}
            trend="+12,8%"
            icon="wallet"
          />
          {/* Card 2: RECEITAS (entradas) */}
          <StatCard
            label="Receitas"
            value={money(totals.income)}
            trend={pct(totals.income, totals.prevIncome)}
            icon="arrow-up"
          />
          {/* Card 3: DESPESAS (saídas) */}
          <StatCard
            label="Despesas"
            value={money(totals.expense)}
            trend={pct(totals.expense, totals.prevExpense)}
            icon="arrow-down"
            tone="orange"
          />
        </div>
        {/* Área abaixo dos cards de resumo */}
        <div className="dashboard-grid">
          {/* ===== ÚLTIMAS TRANSAÇÕES ===== */}
          {/* ÚLTIMAS TRANSAÇÕES (mostra só as 3 mais recentes) */}
          <Card className="recent-card">
            <SectionTitle
              title="Últimas transações"
              action={
                // Botão "Ver todas": leva para a tela Transações
                <button
                  className="text-button"
                  onClick={() => navigate("transactions")}
                >
                  Ver todas <Icon name="chevron" size={14} />
                </button>
              }
            />
            <TransactionList items={items.slice(0, 3)} />
          </Card>
        </div>
      </div>
    </>
  )
}
