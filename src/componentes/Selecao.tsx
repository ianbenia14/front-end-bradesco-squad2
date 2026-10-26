import { Icone } from "./Icone"

export function Selecao({
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
        <Icone name="chevron" size={15} />
      </span>
    </label>
  )
}
