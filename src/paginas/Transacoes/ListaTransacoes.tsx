// Lista de transações (usada no Painel e na tela de Transações)
import { useState } from "react"
import Icon from "../../componentes/Icones"
import { money } from "../../utilitarios/formatacao"
import { transactions } from "../../dados/transacoesExemplo"
import type { Transaction } from "../../tipos/tipos"

// ===== LISTA DE TRANSAÇÕES =====
// LISTA DE TRANSAÇÕES (usada no Painel e na tela Transações)
export default function TransactionList({
  items = transactions,
  onEdit,
  onDelete,
}: {
  items?: Transaction[]
  onEdit?: (item: Transaction) => void
  onDelete?: (item: Transaction) => void
}) {
  // openId: qual linha está com o menu ••• aberto
  const [openId, setOpenId] = useState<number | null>(null)
  // Só mostra o menu ••• se a tela passar onEdit ou onDelete
  const hasMenu = Boolean(onEdit || onDelete)
  // Caixa da lista
  return (
    <div className="transaction-list">
      {/* ===== LINHAS DA LISTA ===== */}
      {/* UMA LINHA PARA CADA TRANSAÇÃO */}
      {items.map((item) => (
        <div className="transaction-row" key={item.id}>
          {/* Ícone + nome + tipo (Entrada/Saída) */}
          <div className="transaction-main">
            <span className={`transaction-icon ${item.type}`}>
              <Icon name={item.icon} />
            </span>
            <div className="transaction-name">
              <strong>{item.title}</strong>
              <span>{item.type === "income" ? "Entrada" : "Saída"}</span>
            </div>
          </div>
          {/* Categoria */}
          <span className="category-label">{item.category}</span>
          {/* Data */}
          <span className="transaction-date">{item.date}</span>
          {/* Valor (verde com + para entrada, vermelho com - para saída) */}
          <strong className={item.amount > 0 ? "positive" : "negative"}>
            {item.amount > 0 ? "+" : "-"} {money(item.amount)}
          </strong>
          {/* Botão ••• com menu (Excluir) */}
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
                // Menu suspenso aberto
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
