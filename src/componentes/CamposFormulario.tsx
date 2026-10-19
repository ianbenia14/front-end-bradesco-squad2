import type React from "react"
// Campos de formulário: input e select
import Icon from "./Icones"

// ===== CAMPOS DE FORMULÁRIO =====
// CAMPO DE TEXTO com rótulo em cima
export function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field-label">
      <span>{label}</span>
      <input className="field" {...props} />
    </label>
  )
}

// CAMPO DE SELEÇÃO (lista suspensa) com setinha
export function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className={label ? "field-label" : ""}>
      {label && <span>{label}</span>}
      <span className="select-wrap">
        <select className="field select-field" {...props}>
          {children}
        </select>
        <Icon name="chevron" size={15} />
      </span>
    </label>
  )
}
