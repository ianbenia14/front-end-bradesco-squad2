import { money } from "../utilitarios/formatacao"

const palette = ["#0f766e", "#c97731", "#4b83bd", "#8068ad", "#aab4ba"]

export function GraficoRosca({ data }: { data: [string, number][] }) {
  const total = data.reduce((s, [, v]) => s + v, 0)
  if (!total) return <div className="empty-state">Sem despesas no período.</div>
  const top = data.slice(0, 4)
  const rest = data.slice(4).reduce((s, [, v]) => s + v, 0)
  const slices: [string, number][] = rest ? [...top, ["Outras", rest]] : top
  let acc = 0
  const stops = slices
    .map(([, v], i) => {
      const start = acc
      acc += (v / total) * 100
      return `${palette[i]} ${start}% ${acc}%`
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
