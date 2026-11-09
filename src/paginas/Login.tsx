import { type FormEvent, useState } from "react"
import type { PublicScreen } from "../tipos"
import { entrar, type Usuario } from "../servicos/autenticacao"
import { Botao } from "../componentes/Botao"
import { Campo } from "../componentes/Campo"
import { Icone } from "../componentes/Icone"
import { LayoutAutenticacao } from "../componentes/LayoutAutenticacao"
import { LoginSocial } from "../componentes/LoginSocial"
import { Marca } from "../componentes/Marca"

export function Login({
  onLogin,
  goTo,
  onGuest,
}: {
  onLogin: (user: Usuario, remember: boolean) => void
  goTo: (s: PublicScreen) => void
  onGuest: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError("")
    setLoading(true)
    try {
      const user = await entrar(String(form.get("email") ?? ""), String(form.get("password") ?? ""))
      onLogin(user, form.get("remember") === "on")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <LayoutAutenticacao goTo={goTo}>
      <form className="login-form" onSubmit={submit}>
        <div className="mobile-brand"><Marca /></div>
        <span className="eyebrow green">BEM-VINDO DE VOLTA</span>
        <h2>Acesse sua conta</h2>
        <p>Entre para continuar cuidando da sua vida financeira.</p>
        <Campo label="E-mail" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
        <label className="field-label">
          <span>Senha</span>
          <span className="password-wrap">
            <input className="field" name="password" type={showPassword ? "text" : "password"} placeholder="Sua senha" autoComplete="current-password" required />
            <button type="button" aria-label="Mostrar senha" onClick={() => setShowPassword(!showPassword)}>
              <Icone name="eye" size={19} />
            </button>
          </span>
        </label>
        <div className="form-options">
          <label><input type="checkbox" name="remember" /> Lembrar de mim</label>
          <button type="button" onClick={() => setInfo("A redefinição por e-mail depende do servidor. Fale com suporte@saldomais.com.br.")}>
            Esqueci minha senha
          </button>
        </div>
        {error && <small className="form-error" role="alert">{error}</small>}
        {info && <small className="form-hint">{info}</small>}
        <Botao type="submit" className="login-button" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
          <Icone name="chevron" size={17} />
        </Botao>
        <div className="divider"><span>ou entre com</span></div>
        <LoginSocial />
        <p className="switch-account">
          Ainda não tem uma conta?{" "}
          <button type="button" onClick={() => goTo("register")}>Criar conta grátis</button>
        </p>
        <p className="switch-account">
          <button type="button" onClick={onGuest}>Experimentar sem cadastro</button>
          {" · "}
          <button type="button" onClick={() => goTo("faq")}>Preciso de ajuda</button>
        </p>
      </form>
    </LayoutAutenticacao>
  )
}
