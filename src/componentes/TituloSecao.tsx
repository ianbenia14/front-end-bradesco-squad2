import type { ReactNode } from "react"

export function TituloSecao({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {action}
    </div>
  )
}
