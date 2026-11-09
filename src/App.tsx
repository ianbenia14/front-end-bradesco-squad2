import { useEffect, useState } from "react"
import type { Budget, Goal, IncomeProfile, PublicScreen, Screen, Transaction } from "./tipos"
import { UsuarioContext, type UsuarioAtual } from "./contexto/usuario"
import { initialGoals } from "./dados/metas"
import { initialBudgets } from "./dados/orcamentos"
import { transactions } from "./dados/transacoes"
import {
  type Usuario,
  carregarDados,
  dadosVazios,
  encerrarSessao,
  excluirConta,
  excluirDados,
  salvarDados,
  salvarSessao,
  sessaoAtual,
} from "./servicos/autenticacao"
import { setReference } from "./utilitarios/datas"
import { BarraLateral } from "./componentes/BarraLateral"
import { Ajuda } from "./paginas/Ajuda"
import { BoasVindas } from "./paginas/BoasVindas"
import { Cadastro } from "./paginas/Cadastro"
import { Configuracoes } from "./paginas/Configuracoes"
import { Ferramentas } from "./paginas/Ferramentas"
import { Login } from "./paginas/Login"
import { Metas } from "./paginas/Metas"
import { Orcamentos } from "./paginas/Orcamentos"
import { PaginaPublica } from "./paginas/PaginaPublica"
import { Painel } from "./paginas/Painel"
import { Planejamento } from "./paginas/Planejamento"
import { Relatorios } from "./paginas/Relatorios"
import { Transacoes } from "./paginas/Transacoes"

const demoProfile: IncomeProfile = { salary: 8200, recurring: 0, variable: 1850 }

export default function App() {
  const [boot] = useState(() => {
    const user = sessaoAtual()
    setReference(false)
    return { user, data: user ? carregarDados(user.id) : dadosVazios() }
  })
  const [user, setUser] = useState<Usuario | null>(boot.user)
  const [guest, setGuest] = useState(false)
  const [publicScreen, setPublicScreen] = useState<PublicScreen>("welcome")
  const [screen, setScreen] = useState<Screen>("dashboard")
  const [transactionItems, setTransactionItems] = useState<Transaction[]>(boot.data.transactions)
  const [budgetItems, setBudgetItems] = useState<Budget[]>(boot.data.budgets)
  const [goalItems, setGoalItems] = useState<Goal[]>(boot.data.goals)
  const [profile, setProfile] = useState<IncomeProfile>(boot.data.profile)

  // Persistência por usuário (histórico sem perda de dados). Convidado não salva.
  useEffect(() => {
    if (!user) return
    salvarDados(user.id, {
      transactions: transactionItems,
      budgets: budgetItems,
      goals: goalItems,
      profile,
    })
  }, [user, transactionItems, budgetItems, goalItems, profile])

  const startSession = (u: Usuario, remember: boolean) => {
    const data = carregarDados(u.id)
    setReference(false)
    salvarSessao(u.id, remember)
    setTransactionItems(data.transactions)
    setBudgetItems(data.budgets)
    setGoalItems(data.goals)
    setProfile(data.profile)
    setGuest(false)
    setScreen("dashboard")
    setUser(u)
  }

  const startGuest = () => {
    setReference(true)
    setTransactionItems(transactions)
    setBudgetItems(initialBudgets)
    setGoalItems(initialGoals)
    setProfile(demoProfile)
    setUser(null)
    setGuest(true)
    setScreen("dashboard")
  }

  const logout = () => {
    encerrarSessao()
    setUser(null)
    setGuest(false)
    setTransactionItems([])
    setBudgetItems([])
    setGoalItems([])
    setProfile(dadosVazios().profile)
    setReference(false)
    setPublicScreen("welcome")
  }

  const authed = Boolean(user) || guest

  // Sem cadastro/sessão válida, só as telas públicas são acessíveis
  if (!authed) {
    if (publicScreen === "login")
      return <Login onLogin={startSession} goTo={setPublicScreen} onGuest={startGuest} />
    if (publicScreen === "register")
      return <Cadastro onRegistered={(u) => startSession(u, true)} goTo={setPublicScreen} />
    if (publicScreen === "tools") return <Ferramentas goTo={setPublicScreen} />
    if (publicScreen === "faq" || publicScreen === "privacy" || publicScreen === "terms")
      return <PaginaPublica kind={publicScreen} goTo={setPublicScreen} />
    return <BoasVindas goTo={setPublicScreen} onGuest={startGuest} />
  }

  const current: UsuarioAtual = user
    ? { id: user.id, name: user.name, email: user.email, guest: false }
    : { id: "convidado", name: "Convidado", email: "", guest: true }

  return (
    <UsuarioContext.Provider value={current}>
      <div className="app-shell">
        <BarraLateral screen={screen} setScreen={setScreen} onLogout={logout} />
        <main className="main-area">
          {guest && (
            <div className="guest-banner" role="status">
              <span>Modo convidado: os dados são de demonstração e não são salvos.</span>
              <button
                onClick={() => {
                  logout()
                  setPublicScreen("register")
                }}
              >
                Criar minha conta
              </button>
            </div>
          )}
          {screen === "dashboard" && (
            <Painel
              navigate={setScreen}
              items={transactionItems}
              budgets={budgetItems}
              goals={goalItems}
            />
          )}
          {screen === "transactions" && (
            <Transacoes items={transactionItems} setItems={setTransactionItems} />
          )}
          {screen === "budgets" && (
            <Orcamentos
              items={budgetItems}
              setItems={setBudgetItems}
              transactionItems={transactionItems}
              goals={goalItems}
            />
          )}
          {screen === "goals" && (
            <Metas items={goalItems} setItems={setGoalItems} transactionItems={transactionItems} />
          )}
          {screen === "reports" && <Relatorios items={transactionItems} budgets={budgetItems} />}
          {screen === "planning" && (
            <Planejamento
              profile={profile}
              setProfile={setProfile}
              items={transactionItems}
              goals={goalItems}
            />
          )}
          {screen === "settings" && (
            <Configuracoes
              navigate={setScreen}
              onLogout={logout}
              onCreateAccount={() => {
                logout()
                setPublicScreen("register")
              }}
              onClearData={() => {
                if (!user) return
                excluirDados(user.id)
                const empty = dadosVazios()
                setTransactionItems(empty.transactions)
                setBudgetItems(empty.budgets)
                setGoalItems(empty.goals)
                setProfile(empty.profile)
              }}
              onDeleteAccount={() => {
                if (!user) return
                excluirConta(user.id)
                logout()
              }}
            />
          )}
          {(screen === "faq" || screen === "privacy" || screen === "terms") && (
            <Ajuda kind={screen} />
          )}
        </main>
      </div>
    </UsuarioContext.Provider>
  )
}
