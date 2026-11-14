import { money } from "../utilitarios/formatacao"

const palette = ["#0F766E", "#F2B84B", "#2F80B7", "#7C5CC4", "#E4572E", "#9AA7AE"]

export function GraficoRosca({ data }: { data: [string, number][] }) {
  const total = data.reduce((s, [, v]) => s + v, 0)
  if (!total) return <div className="empty-state">Sem despesas no período.</div>
  const top = data.slice(0, 4)
  const rest = data.slice(4).reduce((s, [, v]) => s + v, 0)
  const slices: [string, number][] = rest ? [...top, ["Outras", rest]] : top
  const stops = slices
    .map(([, v], i) => {
      const start = (slices.slice(0, i).reduce((sum, [, x]) => sum + x, 0) / total) * 100
      const end = start + (v / total) * 100
      return `${palette[i]} ${start}% ${end}%`
    })
    .join(", ")
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
        <div>
          <strong>{money(total)}</strong>
          <span>Total gasto</span>
        </div>
      </div>
      <div className="donut-legend">
        {slices.map(([name, value], i) => (
          <div key={name}>
            <span>
              <i className="dot" style={{ background: palette[i] }} />
              {name}
            </span>
            <strong>{((value / total) * 100).toFixed(1).replace(".", ",")}%</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
