import { useState } from "react"
import type { Goal, IncomeProfile, Transaction } from "../tipos"
import { needsCategories, savingsCategories, wantsCategories } from "../dados/categorias"
import { averageMonthlyExpense, expenseByCategory, monthTotal, monthsWithData } from "../utilitarios/calculos"
import { REF_MONTH, monthShort } from "../utilitarios/datas"
import { GraficoBarras } from "../componentes/GraficoBarras"
import { money, parseMoneyValue, round2, toInputValue } from "../utilitarios/formatacao"
import { Botao } from "../componentes/Botao"
import { Cabecalho } from "../componentes/Cabecalho"
import { Campo } from "../componentes/Campo"
import { Cartao } from "../componentes/Cartao"
import { TituloSecao } from "../componentes/TituloSecao"

export function Planejamento({
  profile,
  setProfile,
  items,
  goals,
}: {
  profile: IncomeProfile
  setProfile: (p: IncomeProfile) => void
  items: Transaction[]
  goals: Goal[]
}) {
  const [saved, setSaved] = useState(false)
  const income = profile.salary + profile.recurring + profile.variable
  const plan = [
    { label: "Necessidades", pct: 50, value: round2(income * 0.5), cats: needsCategories },
    { label: "Desejos", pct: 30, value: round2(income * 0.3), cats: wantsCategories },
    { label: "Investimentos e reserva", pct: 20, value: round2(income * 0.2), cats: savingsCategories },
  ]
  const spent = expenseByCategory(items, REF_MONTH)
  const actual = (cats: string[]) =>
    round2(spent.filter(([c]) => cats.includes(c)).reduce((s, [, v]) => s + v, 0))

  const avgExpense = averageMonthlyExpense(items)
  const reserveTarget = round2(avgExpense * 6)
  const reserveGoal = goals.find((g) => g.name.toLowerCase().includes("reserva"))
  const reserveSaved = reserveGoal?.saved ?? 0
  const monthlyInvest = Math.max(0, round2((reserveTarget - reserveSaved) / 24))
  const minInvest = round2(income * 0.2)
  const invested = items
    .filter((t) => t.category === "Investimentos")
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const patrimony = round2(goals.reduce((s, g) => s + g.saved, 0) + invested)

  const baseSaved = goals.reduce((s, g) => s + g.saved, 0)
  const months = Array.from(new Set([...monthsWithData(items), REF_MONTH])).sort()
  let running = baseSaved
  const evolution = months.map((k) => {
    running += monthTotal(items, k, "expense", "Investimentos")
    return round2(running)
  })
  return (
    <>
      <Cabecalho
        title="Planejamento"
        subtitle="Mapeie sua renda e receba recomendações personalizadas."
      />
      <div className="page-content">
        <Cartao className="plan-form-card">
          <TituloSecao title="Mapeamento salarial" />
          <form
            className="plan-form"
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              setProfile({
                salary: Math.abs(parseMoneyValue(f.get("salary"))),
                recurring: Math.abs(parseMoneyValue(f.get("recurring"))),
                variable: Math.abs(parseMoneyValue(f.get("variable"))),
              })
              setSaved(true)
              setTimeout(() => setSaved(false), 2500)
            }}
          >
            <Campo label="Salário líquido" name="salary" inputMode="decimal" defaultValue={toInputValue(profile.salary)} />
            <Campo label="Receitas recorrentes" name="recurring" inputMode="decimal" defaultValue={toInputValue(profile.recurring)} />
            <Campo label="Receitas variáveis" name="variable" inputMode="decimal" defaultValue={toInputValue(profile.variable)} />
            <Botao type="submit">{saved ? "Salvo!" : "Calcular"}</Botao>
          </form>
          <p className="plan-total">
            Renda considerada: <strong>{money(income)}</strong>
          </p>
        </Cartao>
        <div className="plan-grid">
          {plan.map((p) => {
            const used = p.label.startsWith("Invest") ? actual(savingsCategories) : actual(p.cats)
            const over = used > p.value
            return (
              <Cartao key={p.label} className="plan-card">
                <span className="month-label">{p.pct}%</span>
                <h3>{p.label}</h3>
                <strong>{money(p.value)}</strong>
                <small className={p.label.startsWith("Invest") ? (used >= p.value ? "positive" : "negative") : over ? "negative" : "positive"}>
                  Gasto atual no mês: {money(used)}
                </small>
              </Cartao>
            )
          })}
        </div>
        <div className="reports-grid">
          <Cartao>
            <TituloSecao title="Recomendação de investimentos" />
            <div className="rank-list">
              <div><span>Investimento mínimo mensal (20%)</span><strong>{money(minInvest)}</strong></div>
              <div><span>Reserva de emergência ideal (6 meses)</span><strong>{money(reserveTarget)}</strong></div>
              <div><span>Reserva atual</span><strong>{money(reserveSaved)}</strong></div>
              <div><span>Patrimônio acumulado</span><strong>{money(patrimony)}</strong></div>
            </div>
            <p className="insight-text">
              Com sua renda atual, recomenda-se investir pelo menos{" "}
              <strong>{money(monthlyInvest)}</strong> por mês para atingir uma
              reserva equivalente a 6 meses de despesas em aproximadamente 24
              meses.
            </p>
          </Cartao>
          <Cartao>
            <TituloSecao title="Evolução do patrimônio acumulado" />
            <GraficoBarras
              labels={months.map(monthShort)}
              series={[{ name: "Patrimônio", color: "#0f766e", values: evolution }]}
            />
          </Cartao>
          <Cartao>
            <TituloSecao title="Metas sugeridas" />
            <ul className="goal-suggestions">
              <li>Montar a reserva de emergência de {money(reserveTarget)}.</li>
              <li>Direcionar ao menos {money(minInvest)} por mês para investimentos.</li>
              <li>Manter os gastos com desejos abaixo de {money(plan[1].value)} por mês.</li>
            </ul>
          </Cartao>
        </div>
      </div>
    </>
  )
}
