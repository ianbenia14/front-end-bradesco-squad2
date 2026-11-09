import { useState } from "react"
import { money } from "../utilitarios/formatacao"

export type SerieBarras = { name: string; color: string; values: number[] }

export function GraficoBarras({
  labels,
  series,
}: {
  labels: string[]
  series: SerieBarras[]
}) {
  const [tip, setTip] = useState("")
  const max = Math.max(1, ...series.flatMap((s) => s.values))
  if (!labels.length) return <div className="empty-state">Sem dados no período.</div>
  return (
    <div>
      <div className="chart-tip" role="status">
        {tip || "Passe o mouse ou toque em uma barra para ver o valor."}
      </div>
      <div className="bars-chart">
        {labels.map((label, li) => (
          <div className="bars-col" key={label}>
            <div className="bars-pair">
              {series.map((s) => {
                const text = `${label} · ${s.name}: ${money(s.values[li])}`
                return (
                  <i
                    key={s.name}
                    tabIndex={0}
                    aria-label={text}
                    style={{ height: `${(s.values[li] / max) * 100}%`, background: s.color }}
                    onMouseEnter={() => setTip(text)}
                    onFocus={() => setTip(text)}
                    onClick={() => setTip(text)}
                  />
                )
              })}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend centered">
        {series.map((s) => (
          <span key={s.name}>
            <i className="dot" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}
