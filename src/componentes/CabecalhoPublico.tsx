import type { PublicScreen } from "../tipos"
import { Botao } from "./Botao"
import { Marca } from "./Marca"

export function CabecalhoPublico({ goTo }: { goTo: (s: PublicScreen) => void }) {
  return (
    <header className="public-header">
      <button className="brand-button" onClick={() => goTo("welcome")} aria-label="Ir para o início">
        <Marca />
      </button>
      <nav className="public-nav" aria-label="Navegação pública">
        <button onClick={() => goTo("tools")}>Ferramentas</button>
        <button onClick={() => goTo("faq")}>Ajuda</button>
      </nav>
      <div className="public-actions">
        <Botao variant="secondary" onClick={() => goTo("login")}>Entrar</Botao>
        <Botao onClick={() => goTo("register")}>Criar conta</Botao>
      </div>
    </header>
  )
}

export function RodapePublico({ goTo }: { goTo: (s: PublicScreen) => void }) {
  return (
    <footer className="public-footer">
      <span>© 2026 Saldo+ · Gestão financeira pessoal</span>
      <div>
        <button onClick={() => goTo("privacy")}>Política de Privacidade</button>
        <button onClick={() => goTo("terms")}>Termos de Uso</button>
        <button onClick={() => goTo("faq")}>FAQ</button>
        <a href="mailto:suporte@saldomais.com.br">Suporte</a>
      </div>
    </footer>
  )
}
