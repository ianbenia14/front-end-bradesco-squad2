import type { ReactNode } from "react"
import type { PublicScreen } from "../tipos"
import { Icone } from "./Icone"
import { Marca } from "./Marca"

export function LayoutAutenticacao({
  children,
  goTo,
}: {
  children: ReactNode
  goTo: (s: PublicScreen) => void
}) {
  return (
    <main className="login-page">
      <div className="login-art">
        <button className="brand-button" onClick={() => goTo("welcome")} aria-label="Voltar ao início">
          <Marca dark />
        </button>
        <div className="login-message">
          <span className="eyebrow">SUA VIDA FINANCEIRA, MAIS LEVE</span>
          <h1>Clareza para cuidar do seu dinheiro.</h1>
          <p>
            Organize suas finanças, acompanhe seus objetivos e tome decisões
            melhores todos os dias.
          </p>
          <div className="balance-preview">
            <div className="balance-head">
              <div>
                <span>Saldo disponível (exemplo)</span>
                <strong>R$ 12.480,50</strong>
              </div>
              <span className="growth-pill">
                <Icone name="arrow-up" size={14} /> +12,8%
              </span>
            </div>
            <svg viewBox="0 0 390 96" role="img" aria-label="Evolução positiva do saldo">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#2dd4bf" stopOpacity=".28" />
                  <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className="chart-area" d="M0 83 C45 75,56 53,99 62 S161 49,190 55 S235 29,273 38 S335 22,390 7 V96 H0Z" />
              <path className="chart-line" d="M0 83 C45 75,56 53,99 62 S161 49,190 55 S235 29,273 38 S335 22,390 7" />
            </svg>
          </div>
        </div>
        <p className="login-foot">Seus dados protegidos e sempre sob o seu controle</p>
      </div>
      <div className="login-form-wrap">{children}</div>
    </main>
  )
}
