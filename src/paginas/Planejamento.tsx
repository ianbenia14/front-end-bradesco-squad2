
import { useState } from "react"
import type { Goal, IncomeProfile, Transaction } from "../tipos"
import { needsCategories, savingsCategories, wantsCategories } from "../dados/categorias"
import { averageMonthlyExpense, expenseByCategory, findReserve, monthTotal, monthsWithData } from "../utilitarios/calculos"
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
    round2(
      spent
        .filter(([category]) => cats.includes(category))
        .reduce((sum, [, value]) => sum + value, 0),
    )

  const avgExpense = averageMonthlyExpense(items)
  const reserveTarget = round2(avgExpense * 6)

  const reserveGoal = findReserve(goals)
  const reserveSaved = reserveGoal?.saved ?? 0

  // Valor mensal necessário para alcançar a reserva em até 24 meses.
  const monthlyInvest = Math.max(
    0,
    round2((reserveTarget - reserveSaved) / 24),
  )

  // Meta conjunta de 20% para reserva e investimentos financeiros.
  const minInvest = round2(income * 0.2)

  // A reserva recebe prioridade dentro da meta conjunta de 20%.
  const reserveContribution = Math.min(monthlyInvest, minInvest)

  // O restante da meta conjunta fica disponível para investimentos financeiros.
  const financialInvestmentContribution = round2(
    Math.max(0, minInvest - reserveContribution),
  )

  // Verifica se a contribuição necessária para a reserva ultrapassa os 20%.
  const reserveExceedsPlan = monthlyInvest > minInvest

  // Investimentos financeiros: somente aplicações classificadas como Investimentos.
  const invested = round2(
    items
      .filter(
        (transaction) =>
          transaction.type === "expense" &&
          transaction.category === "Investimentos",
      )
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
  )

  // Bens: aquisições classificadas separadamente, sem serem confundidas com aplicações.
  const assets = round2(
    items
      .filter(
        (transaction) =>
          transaction.type === "expense" &&
          transaction.category === "Bens",
      )
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
  )

  // Soma dos valores lançados, não representa avaliação de mercado dos bens.
  const patrimony = round2(invested + assets)

  const months = Array.from(
    new Set([...monthsWithData(items), REF_MONTH]),
  ).sort()

  // Evolução acumulada das aplicações financeiras.
  const investmentEvolution = months.map((_, index) =>
    round2(
      months
        .slice(0, index + 1)
        .reduce(
          (sum, month) =>
            sum + monthTotal(items, month, "expense", "Investimentos"),
          0,
        ),
    ),
  )

  // Evolução acumulada das aquisições de bens.
  const assetEvolution = months.map((_, index) =>
    round2(
      months
        .slice(0, index + 1)
        .reduce(
          (sum, month) =>
            sum + monthTotal(items, month, "expense", "Bens"),
          0,
        ),
    ),
  )

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
            <Campo
              label="Salário líquido"
              name="salary"
              inputMode="decimal"
              defaultValue={toInputValue(profile.salary)}
            />

            <Campo
              label="Receitas recorrentes"
              name="recurring"
              inputMode="decimal"
              defaultValue={toInputValue(profile.recurring)}
            />

            <Campo
              label="Receitas variáveis"
              name="variable"
              inputMode="decimal"
              defaultValue={toInputValue(profile.variable)}
            />

            <Botao type="submit">
              {saved ? "Salvo!" : "Calcular"}
            </Botao>
          </form>

          <p className="plan-total">
            Renda considerada: <strong>{money(income)}</strong>
          </p>
        </Cartao>

        <div className="plan-grid">
          {plan.map((p) => {
            const used = actual(p.cats)
            const over = used > p.value
            const isInvestmentPlan = p.label.startsWith("Invest")

            return (
              <Cartao key={p.label} className="plan-card">
                <span className="month-label">{p.pct}%</span>

                <h3>{p.label}</h3>

                <strong>{money(p.value)}</strong>

                <small
                  className={
                    isInvestmentPlan
                      ? used >= p.value
                        ? "positive"
                        : "negative"
                      : over
                        ? "negative"
                        : "positive"
                  }
                >
                  {isInvestmentPlan ? "Aplicado no mês: " : "Gasto atual no mês: "}
                  {money(used)}
                </small>
              </Cartao>
            )
          })}
        </div>

        <div className="reports-grid">
          <Cartao>
            <TituloSecao title="Recomendação de investimentos" />

            <div className="rank-list">
              <div>
                <span>Meta mensal conjunta (20% da renda)</span>
                <strong>{money(minInvest)}</strong>
              </div>

              <div>
                <span>Parcela mensal destinada à reserva</span>
                <strong>{money(reserveContribution)}</strong>
              </div>

              <div>
                <span>Restante para investimentos financeiros</span>
                <strong>{money(financialInvestmentContribution)}</strong>
              </div>

              <div>
                <span>Reserva de emergência ideal (6 meses)</span>
                <strong>{money(reserveTarget)}</strong>
              </div>

              <div>
                <span>Reserva atual</span>
                <strong>{money(reserveSaved)}</strong>
              </div>

              <div>
                <span>Investimentos financeiros registrados</span>
                <strong>{money(invested)}</strong>
              </div>

              <div>
                <span>Bens adquiridos (valor dos lançamentos)</span>
                <strong>{money(assets)}</strong>
              </div>

              <div>
                <span>Patrimônio total registrado</span>
                <strong>{money(patrimony)}</strong>
              </div>
            </div>

            <p className="insight-text">
              Dos {money(minInvest)} reservados mensalmente para a meta conjunta
              de 20% da renda, recomenda-se destinar{" "}
              <strong>{money(reserveContribution)}</strong> à reserva de
              emergência e{" "}
              <strong>{money(financialInvestmentContribution)}</strong> aos
              investimentos financeiros.
            </p>

            {reserveExceedsPlan && (
              <p className="insight-text">
                Para alcançar a reserva em 24 meses, seriam necessários{" "}
                <strong>{money(monthlyInvest)}</strong> por mês. Esse valor
                ultrapassa a meta conjunta de 20% em{" "}
                <strong>{money(monthlyInvest - minInvest)}</strong>.
              </p>
            )}

            <small>
              A reserva de emergência faz parte da meta conjunta de 20% da
              renda, não sendo uma meta adicional. Investimentos financeiros
              e bens adquiridos não são considerados automaticamente como
              dinheiro disponível para emergências.
            </small>
          </Cartao>

          <Cartao>
            <TituloSecao title="Evolução do patrimônio registrado" />

            <GraficoBarras
              labels={months.map(monthShort)}
              series={[
                {
                  name: "Investimentos financeiros",
                  color: "#0f766e",
                  values: investmentEvolution,
                },
                {
                  name: "Bens adquiridos",
                  color: "#64748b",
                  values: assetEvolution,
                },
              ]}
            />
          </Cartao>

          <Cartao>
            <TituloSecao title="Metas sugeridas" />

            <ul className="goal-suggestions">
              <li>
                Montar a reserva de emergência de {money(reserveTarget)}.
              </li>

              <li>
                Destinar {money(reserveContribution)} por mês à reserva e{" "}
                {money(financialInvestmentContribution)} aos investimentos
                financeiros, respeitando a meta conjunta de{" "}
                {money(minInvest)}.
              </li>

              <li>
                Manter os gastos com desejos abaixo de{" "}
                {money(plan[1].value)} por mês.
              </li>
            </ul>
          </Cartao>
        </div>
      </div>
    </>
  )
}
