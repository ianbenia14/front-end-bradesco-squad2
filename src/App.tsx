// Raiz do app: controla qual tela aparece e guarda as transações
import { useState } from "react"
import { Sidebar } from "./componentes/LogoMenuCabecalho"
import Login from "./paginas/Login/TelaLogin"
import Dashboard from "./paginas/Painel/TelaPainel"
import Transactions from "./paginas/Transacoes/TelaTransacoes"
import { transactions } from "./dados/transacoesExemplo"
import type { Screen, Transaction } from "./tipos/tipos"

export default function App() {
  // ===== ESTADO DO APP =====
  // Tela atual: "login", "dashboard" ou "transactions"
  const [screen, setScreen] = useState<Screen>("login")
  // Lista de transações (compartilhada entre Painel e Transações)
  const [items, setItems] = useState<Transaction[]>(transactions)

  // Se estiver na tela de login, mostra só o login (sem menu)
  if (screen === "login") return <Login onLogin={() => setScreen("dashboard")} />

  // ===== LAYOUT DO APP (MENU + CONTEÚDO) =====
  // ESTRUTURA DO APP LOGADO: menu lateral + área principal
  return (
    <div className="app-shell">
      {/* MENU LATERAL (esquerda) */}
      <Sidebar screen={screen} setScreen={setScreen} />
      {/* ÁREA PRINCIPAL (direita): troca de tela conforme o menu */}
      <main className="main-area">
        {screen === "dashboard" && <Dashboard navigate={setScreen} items={items} />}
        {screen === "transactions" && <Transactions items={items} setItems={setItems} />}
      </main>
    </div>
  )
}
