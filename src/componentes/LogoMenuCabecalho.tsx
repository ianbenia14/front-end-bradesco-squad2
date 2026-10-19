// Estrutura da página: logo, menu lateral e cabeçalho
import Icon from "./Icones"
import type { IconName, Screen } from "../tipos/tipos"

// ===== LOGO =====
// LOGO "Saldo+" (dark = versão para fundo escuro)
export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`brand ${dark ? "brand-dark" : ""}`}>
      {/* Quadradinho com o ícone do logo */}
      <span className="brand-mark">
        <Icon name="chart" size={22} />
      </span>
      <span>Saldo</span>
      <b>+</b>
    </div>
  )
}

// ===== MENU LATERAL =====
// MENU LATERAL: logo, botões de navegação e rodapé do menu
export function Sidebar({
  screen,
  setScreen,
}: {
  screen: Screen
  setScreen: (screen: Screen) => void
}) {
  // Botões do menu. Para adicionar uma tela nova, inclua uma linha aqui
  const links: { id: Screen; label: string; icon: IconName }[] = [
    { id: "dashboard", label: "Painel", icon: "dashboard" },
    { id: "transactions", label: "Transações", icon: "transaction" },
  ]
  // Caixa do menu lateral
  return (
    <aside className="sidebar">
      <Brand dark />
      {/* ===== NAVEGAÇÃO ===== */}
      {/* NAVEGAÇÃO: botões Painel e Transações */}
      <nav className="side-nav" aria-label="Navegação principal">
        <p className="nav-label">MENU PRINCIPAL</p>
        {links.map((link) => (
          <button
            key={link.id}
            className={`nav-link ${screen === link.id ? "active" : ""}`}
            onClick={() => setScreen(link.id)}
          >
            <Icon name={link.icon} size={19} />
            <span>{link.label}</span>
          </button>
        ))}
      </nav>
      {/* ===== RODAPÉ DO MENU LATERAL ===== */}
      {/* RODAPÉ DO MENU: Configurações, Sair e perfil do usuário */}
      <div className="sidebar-bottom">
        <button className="nav-link">
          <Icon name="settings" size={19} />
          <span>Configurações</span>
        </button>
        {/* Botão SAIR (volta para a tela de login) */}
        <button className="nav-link" onClick={() => setScreen("login")}>
          <Icon name="logout" size={19} />
          <span>Sair</span>
        </button>
        {/* Perfil do usuário (avatar, nome e e-mail) */}
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

// ===== CABEÇALHO DO TOPO =====
// CABEÇALHO DO TOPO: título e subtítulo da página + sino + avatar
export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {/* Sino de notificações e avatar (canto direito) */}
      <div className="top-actions">
        <button className="icon-button" aria-label="Notificações">
          <Icon name="bell" />
        </button>
        <span className="mini-avatar">AM</span>
      </div>
    </header>
  )
}
