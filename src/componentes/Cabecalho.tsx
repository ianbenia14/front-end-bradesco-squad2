import { iniciais, useUsuario } from "../contexto/usuario"
import { Icone } from "./Icone"

export function Cabecalho({ title, subtitle }: { title: string; subtitle: string }) {
  const user = useUsuario()
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="top-actions">
        <button className="icon-button" aria-label="Notificações">
          <Icone name="bell" />
        </button>
        <span className="mini-avatar">{iniciais(user.name)}</span>
      </div>
    </header>
  )
}
