import { type FormEvent, useState } from "react"
import type { PublicScreen } from "../tipos"
import { registrar, validarSenha, type Usuario } from "../servicos/autenticacao"
import { Botao } from "../componentes/Botao"
import { Campo } from "../componentes/Campo"
import { Icone } from "../componentes/Icone"
import { LayoutAutenticacao } from "../componentes/LayoutAutenticacao"
import { LoginSocial } from "../componentes/LoginSocial"
import { Marca } from "../componentes/Marca"

export function Cadastro({
  onRegistered,
  goTo,
}: {
  onRegistered: (user: Usuario) => void
  goTo: (s: PublicScreen) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const strengthError = password ? validarSenha(password) : ""
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError("")
    if (form.get("password") !== form.get("confirm")) {
      setError("As senhas não conferem.")
      return
    }
    if (form.get("terms") !== "on") {
      setError("Aceite os Termos de Uso e a Política de Privacidade para continuar.")
      return
    }
    setLoading(true)
    try {
      const user = await registrar(
        String(form.get("name") ?? ""),
        String(form.get("email") ?? ""),
        String(form.get("password") ?? ""),
      )
      onRegistered(user)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar a conta.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <LayoutAutenticacao goTo={goTo}>
      <form className="login-form" onSubmit={submit}>
        <div className="mobile-brand"><Marca /></div>
        <span className="eyebrow green">COMECE AGORA</span>
        <h2>Crie sua conta</h2>
        <p>Dê o primeiro passo para uma vida financeira mais tranquila.</p>
        <Campo label="Nome completo" name="name" placeholder="Como podemos chamar você?" autoComplete="name" required />
        <Campo label="E-mail" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
        <label className="field-label">
          <span>Senha</span>
          <span className="password-wrap">
            <input
              className="field"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres, com letras e números"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" aria-label="Mostrar senha" onClick={() => setShowPassword(!showPassword)}>
              <Icone name="eye" size={19} />
            </button>
          </span>
        </label>
        {strengthError && <small className="form-error">{strengthError}</small>}
        <Campo label="Confirmar senha" name="confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" required />
        <label className="check-label terms">
          <input type="checkbox" name="terms" />
          <span>
            Li e aceito os{" "}
            <button type="button" className="link-button" onClick={() => goTo("terms")}>Termos de Uso</button> e a{" "}
            <button type="button" className="link-button" onClick={() => goTo("privacy")}>Política de Privacidade</button> (LGPD).
          </span>
        </label>
        {error && <small className="form-error" role="alert">{error}</small>}
        <Botao type="submit" className="login-button" disabled={loading}>
          {loading ? "Criando..." : "Criar minha conta"}
          <Icone name="chevron" size={17} />
        </Botao>
        <div className="divider"><span>ou cadastre-se com</span></div>
        <LoginSocial />
        <p className="switch-account">
          Já tem uma conta?{" "}
          <button type="button" onClick={() => goTo("login")}>Entrar</button>
        </p>
      </form>
    </LayoutAutenticacao>
  )
}
