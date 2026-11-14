import { useState } from "react"
import type { Budget, Goal, Transaction } from "../tipos"
import { averageMonthlyExpense, findReserve, summary } from "../utilitarios/calculos"
import { Cabecalho } from "../componentes/Cabecalho"
import { Cartao } from "../componentes/Cartao"
import { TituloSecao } from "../componentes/TituloSecao"

type Dica = { id: string; tema: string; titulo: string; texto: string; quando: (c: Ctx) => boolean }
type Ctx = { commitment: number; reserveMonths: number; hasInvest: boolean; hasBudgets: boolean; hasGoals: boolean; subs: number; hasData: boolean }

const dicas: Dica[] = [
  { id: "reserva", tema: "Reserva", titulo: "Monte sua reserva de emergência", texto: "O ideal é guardar o equivalente a 6 meses de despesas em uma aplicação com liquidez diária. Comece com 1 mês e vá aumentando.", quando: (c) => c.reserveMonths < 6 },
  { id: "5030", tema: "Orçamento", titulo: "Regra 50/30/20", texto: "Divida sua renda em 50% necessidades, 30% desejos e 20% investimentos e reserva. Use como ponto de partida e ajuste à sua realidade.", quando: () => true },
  { id: "orcamento", tema: "Orçamento", titulo: "Defina limites por categoria", texto: "Crie orçamentos para as categorias em que você mais gasta. Os alertas avisam antes de o limite estourar.", quando: (c) => !c.hasBudgets },
  { id: "comprometimento", tema: "Dívidas", titulo: "Atenção ao comprometimento da renda", texto: "Quando mais de 80% da renda vai para despesas, sobra pouco para imprevistos. Revise gastos variáveis e evite parcelamentos longos e crédito rotativo.", quando: (c) => c.commitment > 80 },
  { id: "assinaturas", tema: "Hábitos", titulo: "Revise suas assinaturas", texto: "Liste serviços recorrentes e cancele os que você quase não usa. Pequenos valores mensais somam bastante no ano.", quando: (c) => c.subs >= 1 },
  { id: "investir", tema: "Investimentos", titulo: "Comece a investir com regularidade", texto: "Aportes pequenos e constantes valem mais do que aportes grandes e raros. Automatize um valor logo após receber o salário.", quando: (c) => !c.hasInvest },
  { id: "juros", tema: "Investimentos", titulo: "O poder dos juros compostos", texto: "Os rendimentos também rendem. Quanto mais cedo você começa, menor precisa ser o aporte mensal para chegar ao mesmo objetivo.", quando: () => true },
  { id: "metas", tema: "Hábitos", titulo: "Transforme sonhos em metas", texto: "Defina valor, prazo e quanto guardar por mês. Metas concretas aumentam muito a chance de você cumprir.", quando: (c) => !c.hasGoals },
]

export function Educacao({ items, budgets, goals }: { items: Transaction[]; budgets: Budget[]; goals: Goal[] }) {
  const [tema, setTema] = useState("Todos")
  const totals = summary(items)
  const avg = averageMonthlyExpense(items)
  const reserve = findReserve(goals)
  const ctx: Ctx = {
    commitment: totals.commitment,
    reserveMonths: avg > 0 ? (reserve?.saved ?? 0) / avg : 0,
    hasInvest: items.some((t) => t.category === "Investimentos"),
    hasBudgets: budgets.length > 0,
    hasGoals: goals.length > 0,
    subs: items.filter((t) => t.recurring && t.category === "Assinaturas").length,
    hasData: items.length > 0,
  }
  const recommended = dicas.filter((d) => d.quando(ctx) && !["5030", "juros"].includes(d.id))
  const temas = ["Todos", ...Array.from(new Set(dicas.map((d) => d.tema)))]
  const list = dicas.filter((d) => tema === "Todos" || d.tema === tema)
  return (
    <>
      <Cabecalho title="Educação financeira" subtitle="Dicas escolhidas de acordo com o seu perfil e os seus dados." />
      <div className="page-content">
        <Cartao className="settings-card">
          <TituloSecao title="Recomendado para você" />
          {recommended.length ? (
            <div className="edu-grid">
              {recommended.map((d) => (
                <article key={d.id} className="edu-card highlight">
                  <span className="edu-tag">{d.tema}</span>
                  <h3>{d.titulo}</h3>
                  <p>{d.texto}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="insight-empty">Você está em dia com as principais boas práticas. Veja todos os temas abaixo.</p>
          )}
        </Cartao>
        <Cartao className="settings-card">
          <TituloSecao title="Todos os temas" />
          <div className="segmented edu-tabs">
            {temas.map((t) => (
              <button key={t} className={tema === t ? "active" : ""} onClick={() => setTema(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="edu-grid">
            {list.map((d) => (
              <article key={d.id} className="edu-card">
                <span className="edu-tag">{d.tema}</span>
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </article>
            ))}
          </div>
        </Cartao>
      </div>
    </>
  )
}
