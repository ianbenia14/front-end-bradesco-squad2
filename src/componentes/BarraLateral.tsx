import type { IconName, Screen } from "../tipos"
import { Icone } from "./Icone"
import { Marca } from "./Marca"

export function BarraLateral({
  screen,
  setScreen,
}: {
  screen: Screen
  setScreen: (screen: Screen) => void
}) {
  const links: { id: Screen; label: string; icon: IconName }[] = [
    { id: "dashboard", label: "Painel", icon: "dashboard" },
    { id: "transactions", label: "Transações", icon: "transaction" },
    { id: "budgets", label: "Orçamentos", icon: "wallet" },
    { id: "goals", label: "Metas", icon: "goal" },
    { id: "reports", label: "Relatórios", icon: "report" },
  ]
  return (
    <aside className="sidebar">
      <Marca dark />
      <nav className="side-nav" aria-label="Navegação principal">
        <p className="nav-label">MENU PRINCIPAL</p>
        {links.map((link) => (
          <button
            key={link.id}
            className={`nav-link ${screen === link.id ? "active" : ""}`}
            onClick={() => setScreen(link.id)}
          >
            <Icone name={link.icon} size={19} />
            <span>{link.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-link">
          <Icone name="settings" size={19} />
          <span>Configurações</span>
        </button>
        <button className="nav-link" onClick={() => setScreen("login")}>
          <Icone name="logout" size={19} />
          <span>Sair</span>
        </button>
        <div className="profile">
          <span className="avatar">AM</span>
          <span>
            <strong>Ana Martins</strong>
            <small>ana@email.com</small>
          </span>
        </div>
      </div>
    </aside>
  )
}
