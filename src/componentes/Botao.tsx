import type React from "react"
// Botão padrão (primary | secondary | ghost)
// ===== BOTÃO =====
// BOTÃO PADRÃO. variant: primary (verde), secondary (branco) ou ghost (transparente)
export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost"
}) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}
