import { type FormEvent, useState } from "react"
import { Botao } from "../componentes/Botao"
import { Campo } from "../componentes/Campo"
import { Icone } from "../componentes/Icone"
import { Marca } from "../componentes/Marca"

export function Login({ onLogin }: { onLogin: () => void }) {
  const [create, setCreate] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onLogin()
  }
  return (
    <main className="login-page">
      <div className="login-art">
        <Marca dark />
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
                <span>Saldo disponível</span>
                <strong>R$ 12.480,50</strong>
              </div>
              <span className="growth-pill">
                <Icone name="arrow-up" size={14} /> +12,8%
              </span>
            </div>
            <svg
              viewBox="0 0 390 96"
              role="img"
              aria-label="Evolução positiva do saldo"
            >
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#2dd4bf" stopOpacity=".28" />
                  <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                className="chart-area"
                d="M0 83 C45 75,56 53,99 62 S161 49,190 55 S235 29,273 38 S335 22,390 7 V96 H0Z"
              />
              <path
                className="chart-line"
                d="M0 83 C45 75,56 53,99 62 S161 49,190 55 S235 29,273 38 S335 22,390 7"
              />
            </svg>
          </div>
        </div>
        <p className="login-foot">
          Seus dados protegidos e sempre sob o seu controle
        </p>
      </div>
      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <div className="mobile-brand">
            <Marca />
          </div>
          <span className="eyebrow green">
            {create ? "COMECE AGORA" : "BEM-VINDO DE VOLTA"}
          </span>
          <h2>{create ? "Crie sua conta" : "Acesse sua conta"}</h2>
          <p>
            {create
              ? "Dê o primeiro passo para uma vida financeira mais tranquila."
              : "Entre para continuar cuidando da sua vida financeira."}
          </p>
          {create && (
            <Campo
              label="Nome completo"
              placeholder="Como podemos chamar você?"
              autoComplete="name"
            />
          )}
          <Campo
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
          />
          <label className="field-label">
            <span>Senha</span>
            <span className="password-wrap">
              <input
                className="field"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                autoComplete={create ? "new-password" : "current-password"}
              />
              <button
                type="button"
                aria-label="Mostrar senha"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icone name="eye" size={19} />
              </button>
            </span>
          </label>
          {!create && (
            <div className="form-options">
              <label>
                <input type="checkbox" /> Lembrar de mim
              </label>
              <button type="button">Esqueci minha senha</button>
            </div>
          )}
          <Botao type="submit" className="login-button">
            {create ? "Criar minha conta" : "Entrar"}
            <Icone name="chevron" size={17} />
          </Botao>
          <div className="divider">
            <span>ou</span>
          </div>
          <p className="switch-account">
            {create ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
            <button type="button" onClick={() => setCreate(!create)}>
              {create ? "Entrar" : "Criar conta grátis"}
            </button>
          </p>
        </form>
      </div>
    </main>
  )
}
