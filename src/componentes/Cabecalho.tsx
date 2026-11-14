import { useState } from "react"
import { useAlertas } from "../contexto/alertas"
import { iniciais, useUsuario } from "../contexto/usuario"
import { Alertas } from "./Alertas"
import { Icone } from "./Icone"

export function Cabecalho({ title, subtitle }: { title: string; subtitle: string }) {
  const user = useUsuario()
  const alertas = useAlertas()
  const [open, setOpen] = useState(false)
  const count = alertas?.filter((a) => a.tone !== "info").length ?? 0
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="top-actions">
        <div className="notif-wrap">
          <button
            className="icon-button notif-button"
            aria-label={`Notificações (${count})`}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icone name="bell" />
            {count > 0 && <b className="notif-badge">{count}</b>}
          </button>
          {open && (
            <div className="notif-panel" role="region" aria-label="Central de notificações">
              <strong>Notificações</strong>
              <Alertas insights={alertas} />
            </div>
          )}
        </div>
        <span className="mini-avatar">{iniciais(user.name)}</span>
      </div>
    </header>
  )
}
