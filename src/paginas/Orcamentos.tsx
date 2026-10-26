import { useState } from "react"
import type { Budget, Transaction } from "../tipos"
import { budgetCategories, budgetColors, budgetIcons } from "../dados/orcamentos"
import { octTotal } from "../utilitarios/calculos"
import { money, parseMoneyValue, round2, toInputValue } from "../utilitarios/formatacao"
import { Aviso } from "../componentes/Aviso"
import { Botao } from "../componentes/Botao"
import { Cabecalho } from "../componentes/Cabecalho"
import { Campo } from "../componentes/Campo"
import { Cartao } from "../componentes/Cartao"
import { Icone } from "../componentes/Icone"
import { LinhaOrcamento } from "../componentes/LinhaOrcamento"
import { Selecao } from "../componentes/Selecao"
import { TituloSecao } from "../componentes/TituloSecao"

export function Orcamentos({
  items,
  setItems,
  transactionItems,
}: {
  items: Budget[]
  setItems: React.Dispatch<React.SetStateAction<Budget[]>>
  transactionItems: Transaction[]
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState<Budget | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ title: string; text: string } | null>(
    null,
  )
  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }
  const withSpent = items.map((budget) => ({
    ...budget,
    spent: round2(
      budget.spent +
        octTotal(transactionItems, "expense", budget.category) -
        budget.baseline,
    ),
  }))
  const available = budgetCategories.filter(
    (name) => !items.some((budget) => budget.category === name),
  )
  const totalSpent = withSpent.reduce((total, b) => total + b.spent, 0)
  const totalLimit = withSpent.reduce((total, b) => total + b.limit, 0)
  const overall = totalLimit ? Math.round((totalSpent / totalLimit) * 100) : 0
  const remaining = totalLimit - totalSpent
  const food = items.find((budget) => budget.category === "Alimentação")
  return (
    <>
      <Cabecalho
        title="Orçamentos"
        subtitle="Planeje seus gastos e mantenha o controle do mês."
      />
      <div className="page-content">
        <div className="page-heading-actions">
          <div>
            <span className="month-label">ORÇAMENTO DE OUTUBRO</span>
            <h2 className="content-title">
              {money(totalSpent)} <small>gastos de {money(totalLimit)}</small>
            </h2>
          </div>
          <Botao
            onClick={() => setFormOpen(true)}
            disabled={available.length === 0}
          >
            <Icone name="plus" size={18} /> Criar orçamento
          </Botao>
        </div>
        <Cartao className="overall-budget">
          <div>
            <strong>{overall}%</strong>
            <span>do orçamento utilizado</span>
          </div>
          <div className="progress large">
            <i
              className={overall > 90 ? "orange warning" : "green"}
              style={{ width: `${Math.min(100, overall)}%` }}
            />
          </div>
          <p>
            {remaining >= 0 ? (
              <>
                Você ainda tem <strong>{money(remaining)}</strong> disponíveis
                para este mês.
              </>
            ) : (
              <>
                Você ultrapassou o orçamento em{" "}
                <strong>{money(remaining)}</strong>.
              </>
            )}
          </p>
        </Cartao>
        {withSpent.length ? (
          <div className="budget-grid">
            {withSpent.map((item) => (
              <Cartao key={item.id} className="budget-detail">
                <LinhaOrcamento item={item} />
                <div className="budget-footer">
                  <span>
                    {item.limit >= item.spent ? "Restam " : "Excedeu "}
                    <strong>{money(item.limit - item.spent)}</strong>
                  </span>
                  <div className="row-menu-wrap">
                    <button
                      className="more-button"
                      aria-label={`Opções para ${item.category}`}
                      aria-haspopup="menu"
                      aria-expanded={openId === item.id}
                      onClick={() =>
                        setOpenId(openId === item.id ? null : item.id)
                      }
                    >
                      •••
                    </button>
                    {openId === item.id && (
                      <div
                        className="row-menu"
                        role="menu"
                        style={{
                          top: "auto",
                          bottom: "calc(100% + 4px)",
                          right: 0,
                          transform: "none",
                        }}
                      >
                        <button
                          role="menuitem"
                          onClick={() => {
                            setOpenId(null)
                            setEditing(items.find((b) => b.id === item.id) ?? null)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          role="menuitem"
                          className="danger"
                          onClick={() => {
                            setOpenId(null)
                            setDeleting(items.find((b) => b.id === item.id) ?? null)
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Cartao>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Nenhum orçamento ainda. Clique em "Criar orçamento" para começar.
          </div>
        )}
        <Cartao className="budget-tip">
          <span className="tip-icon">
            <Icone name="chart" />
          </span>
          <div>
            <strong>Dica para o seu orçamento</strong>
            <p>
              Seus gastos com alimentação subiram 14% em relação ao mês passado.
              Que tal revisar esse limite?
            </p>
          </div>
          <Botao
            variant="secondary"
            disabled={!food}
            onClick={() => food && setEditing(food)}
          >
            Revisar orçamento
          </Botao>
        </Cartao>
      </div>
      {(formOpen || editing) && (
        <div className="modal-backdrop" onMouseDown={closeForm}>
          <Cartao className="modal">
            <div onMouseDown={(e) => e.stopPropagation()}>
              <TituloSecao
                title={editing ? "Editar orçamento" : "Criar orçamento"}
                action={
                  <button className="icon-button" onClick={closeForm}>
                    <Icone name="x" />
                  </button>
                }
              />
              <form
                key={editing ? editing.id : "new"}
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = new FormData(e.currentTarget)
                  const limit = Math.abs(parseMoneyValue(form.get("limit")))
                  if (!limit) return
                  if (editing) {
                    setItems((current) =>
                      current.map((budget) =>
                        budget.id === editing.id ? { ...budget, limit } : budget,
                      ),
                    )
                    setToast({
                      title: "Orçamento atualizado",
                      text: `O limite de ${editing.category} foi atualizado.`,
                    })
                  } else {
                    const category = String(form.get("category") ?? "Outros")
                    const budget: Budget = {
                      id: Date.now(),
                      category,
                      icon: budgetIcons[category] ?? "wallet",
                      spent: 0,
                      baseline: 0,
                      limit,
                      color: budgetColors[items.length % budgetColors.length],
                    }
                    setItems((current) => [...current, budget])
                    setToast({
                      title: "Orçamento criado",
                      text: `O orçamento de ${category} foi adicionado.`,
                    })
                  }
                  closeForm()
                }}
              >
                {editing ? (
                  <Campo
                    label="Categoria"
                    value={editing.category}
                    readOnly
                  />
                ) : (
                  <Selecao label="Categoria" name="category">
                    {available.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </Selecao>
                )}
                <Campo
                  label="Limite mensal"
                  name="limit"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  defaultValue={editing ? toInputValue(editing.limit) : ""}
                  required
                />
                <div className="modal-actions">
                  <Botao
                    type="button"
                    variant="secondary"
                    onClick={closeForm}
                  >
                    Cancelar
                  </Botao>
                  <Botao type="submit">
                    {editing ? "Salvar alterações" : "Criar orçamento"}
                  </Botao>
                </div>
              </form>
            </div>
          </Cartao>
        </div>
      )}
      {deleting && (
        <div className="modal-backdrop" onMouseDown={() => setDeleting(null)}>
          <Cartao className="modal">
            <div
              role="dialog"
              aria-label="Excluir orçamento"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <TituloSecao title="Excluir orçamento" />
              <p style={{ margin: "8px 0 22px", color: "#64727b" }}>
                Excluir o orçamento de "{deleting.category}"? Essa ação não pode
                ser desfeita.
              </p>
              <div className="modal-actions">
                <Botao
                  type="button"
                  variant="secondary"
                  onClick={() => setDeleting(null)}
                >
                  Cancelar
                </Botao>
                <Botao
                  type="button"
                  style={{ background: "#b45309" }}
                  onClick={() => {
                    setItems((current) =>
                      current.filter((budget) => budget.id !== deleting.id),
                    )
                    setToast({
                      title: "Orçamento excluído",
                      text: `O orçamento de ${deleting.category} foi removido.`,
                    })
                    setDeleting(null)
                  }}
                >
                  Excluir
                </Botao>
              </div>
            </div>
          </Cartao>
        </div>
      )}
      <Aviso toast={toast} onClose={() => setToast(null)} />
    </>
  )
}
