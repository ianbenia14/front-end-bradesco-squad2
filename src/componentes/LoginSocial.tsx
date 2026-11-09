import { useState } from "react"

export function LoginSocial() {
  const [notice, setNotice] = useState("")
  const options = ["Google", "Apple ID", "Biometria"]
  return (
    <div className="social-login">
      <div className="social-row">
        {options.map((name) => (
          <button
            key={name}
            type="button"
            className="social-button"
            onClick={() =>
              setNotice(
                `Entrar com ${name} ainda não está disponível: depende da integração com o servidor. Use e-mail e senha de uma conta cadastrada.`,
              )
            }
          >
            {name}
          </button>
        ))}
      </div>
      {notice && <small className="form-hint" role="status">{notice}</small>}
    </div>
  )
}
