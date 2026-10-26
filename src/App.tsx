import { useState } from "react"
import type { Budget, Goal, Screen, Transaction } from "./tipos"
import { initialGoals } from "./dados/metas"
import { initialBudgets } from "./dados/orcamentos"
import { transactions } from "./dados/transacoes"
import { BarraLateral } from "./componentes/BarraLateral"
import { Login } from "./paginas/Login"
import { Metas } from "./paginas/Metas"
import { Orcamentos } from "./paginas/Orcamentos"
import { Painel } from "./paginas/Painel"
import { Relatorios } from "./paginas/Relatorios"
import { Transacoes } from "./paginas/Transacoes"

export default function App() {
  const [screen, setScreen] = useState<Screen>("login")
  const [transactionItems, setTransactionItems] =
    useState<Transaction[]>(transactions)
  const [budgetItems, setBudgetItems] = useState<Budget[]>(initialBudgets)
  const [goalItems, setGoalItems] = useState<Goal[]>(initialGoals)
  if (screen === "login")
    return <Login onLogin={() => setScreen("dashboard")} />
  return (
    <div className="app-shell">
      <BarraLateral screen={screen} setScreen={setScreen} />
      <main className="main-area">
        {screen === "dashboard" && (
          <Painel navigate={setScreen} items={transactionItems} />
        )}
        {screen === "transactions" && (
          <Transacoes
            items={transactionItems}
            setItems={setTransactionItems}
          />
        )}
        {screen === "budgets" && (
          <Orcamentos
            items={budgetItems}
            setItems={setBudgetItems}
            transactionItems={transactionItems}
          />
        )}
        {screen === "goals" && (
          <Metas items={goalItems} setItems={setGoalItems} />
        )}
        {screen === "reports" && <Relatorios items={transactionItems} />}
      </main>
    </div>
  )
}
