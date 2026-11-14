import { useEffect, useRef, useState } from "react"
import type { Budget, Goal, IncomeProfile, PublicScreen, ReportSnapshot, Screen, Transaction } from "./tipos"
import { AlertasContext } from "./contexto/alertas"
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
import { DEFAULT_DATE, REF_MONTH, setReference } from "./utilitarios/datas"
import { buildInsights } from "./utilitarios/calculos"
import { aplicarRecorrencias } from "./utilitarios/recorrencia"
import { snapshotsFaltantes } from "./utilitarios/relatorios"
import { hashFor, parseHash } from "./utilitarios/rotas"
import { BarraLateral } from "./componentes/BarraLateral"
import { Ajuda } from "./paginas/Ajuda"
import { BoasVindas } from "./paginas/BoasVindas"
import { Cadastro } from "./paginas/Cadastro"
import { Configuracoes } from "./paginas/Configuracoes"
import { Educacao } from "./paginas/Educacao"
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

// Gera recorrências pendentes e guarda os relatórios dos meses encerrados
const prepararDados = (data: ReturnType<typeof carregarDados>) => {
  const transactions = aplicarRecorrencias(data.transactions, DEFAULT_DATE)
  const reports = [
    ...snapshotsFaltantes(transactions, data.budgets, data.reports, REF_MONTH),
    ...data.reports,
  ]
  return { ...data, transactions, reports }
}

export default function App() {
  const [boot] = useState(() => {
    const user = sessaoAtual()
    setReference(false)
    const rota = parseHash(window.location.hash)
    return {
      user,
      data: user ? prepararDados(carregarDados(user.id)) : dadosVazios(),
      screen: user && rota?.kind === "app" ? rota.screen : ("dashboard" as Screen),
      publicScreen: !user && rota?.kind === "public" ? rota.screen : ("welcome" as PublicScreen),
    }
  })
  const [user, setUser] = useState<Usuario | null>(boot.user)
  const [guest, setGuest] = useState(false)
  const [publicScreen, setPublicScreen] = useState<PublicScreen>(boot.publicScreen)
  const [screen, setScreen] = useState<Screen>(boot.screen)
  const [transactionItems, setTransactionItems] = useState<Transaction[]>(boot.data.transactions)
  const [budgetItems, setBudgetItems] = useState<Budget[]>(boot.data.budgets)
  const [goalItems, setGoalItems] = useState<Goal[]>(boot.data.goals)
  const [profile, setProfile] = useState<IncomeProfile>(boot.data.profile)
  const [reports, setReports] = useState<ReportSnapshot[]>(boot.data.reports)

  // Persistência por usuário (histórico sem perda de dados). Convidado não salva.
  useEffect(() => {
    if (!user) return
    salvarDados(user.id, {
      transactions: transactionItems,
      budgets: budgetItems,
      goals: goalItems,
      profile,
      reports,
    })
  }, [user, transactionItems, budgetItems, goalItems, profile, reports])

  const startSession = (u: Usuario, remember: boolean) => {
    setReference(false)
    const data = prepararDados(carregarDados(u.id))
    salvarSessao(u.id, remember)
    setTransactionItems(data.transactions)
    setBudgetItems(data.budgets)
    setGoalItems(data.goals)
    setProfile(data.profile)
    setReports(data.reports)
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
    setReports([])
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
    setReports([])
    setReference(false)
    setPublicScreen("welcome")
  }

  const authed = Boolean(user) || guest
  const lastAuthed = useRef(authed)

  // Histórico do navegador: o botão "voltar" navega entre as telas do site
  useEffect(() => {
    const target = hashFor(authed, publicScreen, screen)
    if (window.location.hash !== target) {
      if (lastAuthed.current !== authed) window.history.replaceState(null, "", target)
      else window.history.pushState(null, "", target)
    }
    lastAuthed.current = authed
    window.scrollTo(0, 0)
  }, [authed, publicScreen, screen])

  useEffect(() => {
    const onPop = () => {
      const rota = parseHash(window.location.hash)
      if (authed) {
        if (rota?.kind === "app") setScreen(rota.screen)
        else window.history.replaceState(null, "", hashFor(true, publicScreen, screen))
      } else if (rota?.kind === "public") {
        setPublicScreen(rota.screen)
      } else {
        setPublicScreen("welcome")
        window.history.replaceState(null, "", "#/welcome")
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [authed, publicScreen, screen])

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

  const alertas = buildInsights(transactionItems, budgetItems, goalItems)
  const current: UsuarioAtual = user
    ? { id: user.id, name: user.name, email: user.email, guest: false }
    : { id: "convidado", name: "Convidado", email: "", guest: true }

  return (
    <UsuarioContext.Provider value={current}>
      <AlertasContext.Provider value={alertas}>
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
          {screen === "reports" && (
            <Relatorios
              items={transactionItems}
              budgets={budgetItems}
              reports={reports}
              setReports={setReports}
            />
          )}
          {screen === "education" && (
            <Educacao items={transactionItems} budgets={budgetItems} goals={goalItems} />
          )}
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
                setReports([])
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
      </AlertasContext.Provider>
    </UsuarioContext.Provider>
  )
}
