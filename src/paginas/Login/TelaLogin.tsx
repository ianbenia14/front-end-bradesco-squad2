// Tela de login / criar conta
import { useState, type FormEvent } from "react"
import Icon from "../../componentes/Icones"
import { Button } from "../../componentes/Botao"
import { Field } from "../../componentes/CamposFormulario"
import { Brand } from "../../componentes/LogoMenuCabecalho"

// ===== TELA: LOGIN =====
// TELA DE LOGIN / CRIAR CONTA
export default function Login({ onLogin }: { onLogin: () => void }) {
  // create: false = tela "Entrar" | true = tela "Criar conta"
  const [create, setCreate] = useState(false)
  // showPassword: true = mostra a senha digitada
  const [showPassword, setShowPassword] = useState(false)
  // Ao enviar o formulário: entra direto (sem validar senha, é só demonstração)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onLogin()
  }
  // PÁGINA DE LOGIN: lado esquerdo (arte) + lado direito (formulário)
  return (
    <main className="login-page">
      {/* ===== LADO ESQUERDO ===== */}
      {/* LADO ESQUERDO: parte decorativa (some no celular) */}
      <div className="login-art">
        {/* Logo */}
        <Brand dark />
        {/* Texto de boas-vindas */}
        <div className="login-message">
          <span className="eyebrow">SUA VIDA FINANCEIRA, MAIS LEVE</span>
          <h1>Clareza para cuidar do seu dinheiro.</h1>
          <p>
            Organize suas finanças, acompanhe seus objetivos e tome decisões
            melhores todos os dias.
          </p>
          {/* Cartão de exemplo com saldo e gráfico (só visual) */}
          <div className="balance-preview">
            <div className="balance-head">
              <div>
                <span>Saldo disponível</span>
                <strong>R$ 12.480,50</strong>
              </div>
              <span className="growth-pill">
                <Icon name="arrow-up" size={14} /> +12,8%
              </span>
            </div>
            {/* Gráfico de linha desenhado em SVG */}
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
        {/* ===== RODAPÉ ===== */}
        {/* RODAPÉ do lado esquerdo: "Seus dados protegidos..." */}
        <p className="login-foot">
          Seus dados protegidos e sempre sob o seu controle
        </p>
      </div>
      {/* ===== LADO DIREITO (FORMULÁRIO) ===== */}
      {/* LADO DIREITO: formulário */}
      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          {/* Logo que só aparece no celular */}
          <div className="mobile-brand">
            <Brand />
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
          {/* Campo NOME: só aparece em "Criar conta" */}
          {create && (
            <Field
              label="Nome completo"
              placeholder="Como podemos chamar você?"
              autoComplete="name"
            />
          )}
          <Field
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
          />
          {/* Campo SENHA com botão de mostrar/ocultar (olho) */}
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
                <Icon name="eye" size={19} />
              </button>
            </span>
          </label>
          {/* "Lembrar de mim" e "Esqueci minha senha": só aparecem no login */}
          {!create && (
            <div className="form-options">
              <label>
                <input type="checkbox" /> Lembrar de mim
              </label>
              <button type="button">Esqueci minha senha</button>
            </div>
          )}
          {/* BOTÃO PRINCIPAL: Entrar / Criar minha conta */}
          <Button type="submit" className="login-button">
            {create ? "Criar minha conta" : "Entrar"}
            <Icon name="chevron" size={17} />
          </Button>
          {/* Separador "ou" */}
          <div className="divider">
            <span>ou</span>
          </div>
          {/* Link para alternar entre Entrar e Criar conta */}
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
