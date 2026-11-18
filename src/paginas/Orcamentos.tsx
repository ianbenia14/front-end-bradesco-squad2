import { useState } from "react"
import type { Budget, Goal, Transaction } from "../tipos"
import { useUsuario } from "../contexto/usuario"
import { REF_MONTH, monthLong } from "../utilitarios/datas"
import { budgetCategories, budgetColorOf, budgetIcons } from "../dados/orcamentos"
import { budgetStatus, budgetUsage, buildInsights, statusTone } from "../utilitarios/calculos"
import { money, parseMoneyValue, toInputValue } from "../utilitarios/formatacao"
import { mensagemDoErro } from "../servicos/api"
import { excluirOrcamento, gravarOrcamento } from "../servicos/orcamentos"
import { Alertas } from "../componentes/Alertas"
import { Aviso } from "../componentes/Aviso"
import { Botao } from "../componentes/Botao"
import { Modal } from "../componentes/Modal"
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
  goals,
}: {
  items: Budget[]
  setItems: React.Dispatch<React.SetStateAction<Budget[]>>
  transactionItems: Transaction[]
  goals: Goal[]
}) {
  const usuario = useUsuario()
  // Só contas criadas no back end (id numérico) usam a API; convidado e contas antigas seguem locais
  const idApi = Number(usuario.id)
  const usaApi = Number.isInteger(idApi) && idApi > 0

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState<Budget | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)
  const [erro, setErro] = useState("")
  const [toast, setToast] = useState<{ title: string; text: string } | null>(
    null,
  )
  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
    setErro("")
  }
  const withSpent = items.map((budget) => ({
    ...budget,
    spent: budgetUsage(budget, transactionItems).spent,
  }))
  const available = budgetCategories.filter(
    (name) => !items.some((budget) => budget.category === name),
  )
  const totalSpent = withSpent.reduce((total, b) => total + b.spent, 0)
  const totalLimit = withSpent.reduce((total, b) => total + b.limit, 0)
  const overall = totalLimit ? Math.round((totalSpent / totalLimit) * 100) : 0
  const remaining = totalLimit - totalSpent
  const insights = buildInsights(transactionItems, items, goals)
  const overallStatus = budgetStatus(overall)

  const salvar = async (category: string, limit: number) => {
    setErro("")
    try {
      if (editing) {
        const atual: Budget = { ...editing, limit }
        const salvo = usaApi ? await gravarOrcamento(idApi, atual, editing.id) : atual
        setItems((current) => current.map((budget) => (budget.id === editing.id ? salvo : budget)))
        setToast({
          title: "Orçamento atualizado",
          text: `O limite de ${editing.category} foi atualizado.`,
        })
      } else {
        const novo: Budget = {
          id: Date.now(),
          category,
          icon: budgetIcons[category] ?? "wallet",
          limit,
          color: budgetColorOf(category),
        }
        const salvo = usaApi ? await gravarOrcamento(idApi, novo, null) : novo
        setItems((current) => [...current, salvo])
        setToast({
          title: "Orçamento criado",
          text: `O orçamento de ${category} foi adicionado.`,
        })
      }
      closeForm()
    } catch (e) {
      setErro(mensagemDoErro(e))
    }
  }

  const excluir = async () => {
    const alvo = deleting
    if (!alvo) return
    setErro("")
    try {
      if (usaApi) await excluirOrcamento(alvo.id)
      setItems((current) => current.filter((budget) => budget.id !== alvo.id))
      setToast({
        title: "Orçamento excluído",
        text: `O orçamento de ${alvo.category} foi removido.`,
      })
      setDeleting(null)
    } catch (e) {
      setErro(mensagemDoErro(e))
    }
  }

  return (
    <>
      <Cabecalho
        title="Orçamentos"
        subtitle="Planeje seus gastos e mantenha o controle do mês."
      />
      <div className="page-content">
        <div className="page-heading-actions">
          <div>
            <span className="month-label">ORÇAMENTO DE {monthLong[REF_MONTH.split("-")[1]].toUpperCase()}</span>
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
            <span>do orçamento utilizado · {overallStatus}</span>
          </div>
          <div className="progress large">
            <i
              className={statusTone[overallStatus]}
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
        <div className="band-legend">
          <span><i className="dot green-dot" />Até 70% Normal</span>
          <span><i className="dot orange-dot" />71% a 89% Atenção</span>
          <span><i className="dot red-dot" />Acima de 90% Risco</span>
          <span><i className="dot red-dot" />Acima de 100% Estourado</span>
        </div>
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
                            setErro("")
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
          <div style={{ flex: 1 }}>
            <strong>Insights e alertas</strong>
            <Alertas insights={insights} />
          </div>
        </Cartao>
      </div>
      {(formOpen || editing) && (
        <Modal onClose={closeForm} label="Formulário">
              <TituloSecao
                title={editing ? "Editar orçamento" : "Criar orçamento"}
                action={
                  <button className="icon-button" aria-label="Fechar" onClick={closeForm}>
                    <Icone name="x" />
                  </button>
                }
              />
              {erro && (
                <p role="alert" style={{ margin: "0 0 12px", color: "#b45309" }}>
                  {erro}
                </p>
              )}
              <form
                key={editing ? editing.id : "new"}
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = new FormData(e.currentTarget)
                  const limit = Math.abs(parseMoneyValue(form.get("limit")))
                  if (!limit) return
                  void salvar(String(form.get("category") ?? "Outros"), limit)
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
            </Modal>
      )}
      {deleting && (
        <Modal
          onClose={() => {
            setDeleting(null)
            setErro("")
          }}
          label="Confirmar exclusão"
        >
              <TituloSecao title="Excluir orçamento" />
              <p style={{ margin: "8px 0 22px", color: "#64727b" }}>
                Excluir o orçamento de "{deleting.category}"? Essa ação não pode
                ser desfeita.
              </p>
              {erro && (
                <p role="alert" style={{ margin: "0 0 12px", color: "#b45309" }}>
                  {erro}
                </p>
              )}
              <div className="modal-actions">
                <Botao
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setDeleting(null)
                    setErro("")
                  }}
                >
                  Cancelar
                </Botao>
                <Botao
                  type="button"
                  style={{ background: "#b45309" }}
                  onClick={() => {
                    void excluir()
                  }}
                >
                  Excluir
                </Botao>
              </div>
            </Modal>
      )}
      <Aviso toast={toast} onClose={() => setToast(null)} />
    </>
  )
}