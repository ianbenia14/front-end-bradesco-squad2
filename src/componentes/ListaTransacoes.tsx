import { useState } from "react"
import type { Transaction } from "../tipos"
import { transactions } from "../dados/transacoes"
import { money } from "../utilitarios/formatacao"
import { Icone } from "./Icone"

export function ListaTransacoes({
  items = transactions,
  onEdit,
  onDelete,
}: {
  items?: Transaction[]
  onEdit?: (item: Transaction) => void
  onDelete?: (item: Transaction) => void
}) {
  const [openId, setOpenId] = useState<number | null>(null)
  const hasMenu = Boolean(onEdit || onDelete)
  return (
    <div className="transaction-list">
      {items.map((item) => (
        <div className="transaction-row" key={item.id}>
          <div className="transaction-main">
            <span className={`transaction-icon ${item.type}`}>
              <Icone name={item.icon} />
            </span>
            <div className="transaction-name">
              <strong>{item.title}</strong>
              <span>{item.type === "income" ? "Entrada" : "Saída"}</span>
            </div>
          </div>
          <span className="category-label">{item.category}</span>
          <span className="transaction-date">{item.date}</span>
          <strong className={item.amount > 0 ? "positive" : "negative"}>
            {item.amount > 0 ? "+" : "-"} {money(item.amount)}
          </strong>
          {hasMenu ? (
            <div className="row-menu-wrap">
              <button
                className="more-button"
                aria-label={`Opções para ${item.title}`}
                aria-haspopup="menu"
                aria-expanded={openId === item.id}
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
              >
                •••
              </button>
              {openId === item.id && (
                <div className="row-menu" role="menu">
                  <button
                    role="menuitem"
                    onClick={() => {
                      setOpenId(null)
                      onEdit?.(item)
                    }}
                  >
                    Editar
                  </button>
                  <button
                    role="menuitem"
                    className="danger"
                    onClick={() => {
                      setOpenId(null)
                      onDelete?.(item)
                    }}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="more-button"
              aria-label={`Opções para ${item.title}`}
            >
              •••
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
