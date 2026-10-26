import { Icone } from "./Icone"

export function Cabecalho({ title, subtitle }: { title: string; subtitle: string }) {
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
        <span className="mini-avatar">AM</span>
      </div>
    </header>
  )
}
