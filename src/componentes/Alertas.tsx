import type { Insight } from "../utilitarios/calculos"
import { Icone } from "./Icone"

export function Alertas({ insights }: { insights: Insight[] | null }) {
  if (insights === null)
    return <p className="insight-empty">Ainda não há dados suficientes para gerar insights.</p>
  if (!insights.length)
    return <p className="insight-empty">Tudo certo por aqui. Nenhum alerta neste mês.</p>
  return (
    <div className="insight-list">
      {insights.map((i) => (
        <div key={i.id} className={`insight-item ${i.tone}`}>
          <Icone name="bell" size={16} />
          <span>{i.text}</span>
        </div>
      ))}
    </div>
  )
}
