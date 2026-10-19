// Blocos visuais reutilizáveis: Card, StatCard, SectionTitle
import type { ReactNode } from "react"
import Icon from "./Icones"
import type { IconName } from "../tipos/tipos"

// ===== CARD =====
// CARD: caixa branca com sombra, usada para agrupar conteúdo
export function Card({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={`card ${className}`}>{children}</section>
}

// ===== CARD DE RESUMO =====
// CARD DE RESUMO: ícone + título + valor + variação (usado no Painel)
export function StatCard({
  label,
  value,
  trend,
  icon,
  tone = "green",
}: {
  label: string
  value: string
  trend: string
  icon: IconName
  tone?: string
}) {
  return (
    <Card className="stat-card">
      {/* Ícone colorido do card */}
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      {/* Textos: nome, valor e variação */}
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {/* Variação vs. mês anterior (verde se subiu, vermelho se caiu) */}
        <small className={trend.startsWith("+") ? "positive" : "negative"}>
          <Icon
            name={trend.startsWith("+") ? "arrow-up" : "arrow-down"}
            size={14}
          />
          {trend} <em>vs. mês anterior</em>
        </small>
      </div>
    </Card>
  )
}

// ===== TÍTULO DE SEÇÃO =====
// TÍTULO DE SEÇÃO: título à esquerda e uma ação opcional à direita
export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {action}
    </div>
  )
}
