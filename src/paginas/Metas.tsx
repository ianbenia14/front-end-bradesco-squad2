import { useState } from "react"
import type { Goal } from "../tipos"
import { monthNames, toMonthInput } from "../utilitarios/datas"
import { money, toInputValue } from "../utilitarios/formatacao"
import { Aviso } from "../componentes/Aviso"
import { Botao } from "../componentes/Botao"
import { Cabecalho } from "../componentes/Cabecalho"
import { Campo } from "../componentes/Campo"
import { Cartao } from "../componentes/Cartao"
import { Icone } from "../componentes/Icone"
import { TituloSecao } from "../componentes/TituloSecao"

export function Metas({
  items,
  setItems,
}: {
  items: Goal[]
  setItems: React.Dispatch<React.SetStateAction<Goal[]>>
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [deleting, setDeleting] = useState<Goal | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ title: string; text: string } | null>(
    null,
  )
  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }
  const registerProgress = (goal: Goal) => {
    setItems((current) =>
      current.map((item) =>
        item.id === goal.id
          ? { ...item, saved: Math.min(item.saved + 500, item.target) }
          : item,
      ),
    )
    setToast({
      title: "Progresso registrado",
      text: `${goal.name} foi atualizada com sucesso.`,
    })
  }
  const parseMoney = (value: FormDataEntryValue | null) =>
    Number(
      String(value ?? "")
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, ""),
    )
  const totalSaved = items.reduce((total, goal) => total + goal.saved, 0)
  const totalTarget = items.reduce((total, goal) => total + goal.target, 0)
  const overall = totalTarget
    ? Math.round((totalSaved / totalTarget) * 100)
    : 0
  return (
    <>
      <Cabecalho title="Metas" subtitle="Transforme seus planos em conquistas." />
      <div className="page-content">
        <div className="page-heading-actions">
          <div>
            <span className="month-label">SEUS OBJETIVOS</span>
            <h2 className="content-title">
              {money(totalSaved)}{" "}
              <small>
                economizados em {items.length}{" "}
                {items.length === 1 ? "meta" : "metas"}
              </small>
            </h2>
          </div>
          <Botao onClick={() => setFormOpen(true)}>
            <Icone name="plus" size={18} /> Nova meta
          </Botao>
        </div>
        {items.length ? (
          <div className="goals-grid">
            {items.map((goal) => {
              const percent = Math.round((goal.saved / goal.target) * 100)
              return (
                <Cartao className="goal-card" key={goal.id}>
                  <div className="goal-top">
                    <span className={`goal-icon ${goal.color}`}>
                      <Icone name={goal.icon} />
                    </span>
                    <div className="row-menu-wrap">
                      <button
                        className="more-button"
                        aria-label={`Opções para ${goal.name}`}
                        aria-haspopup="menu"
                        aria-expanded={openId === goal.id}
                        onClick={() =>
                          setOpenId(openId === goal.id ? null : goal.id)
                        }
                      >
                        •••
                      </button>
                      {openId === goal.id && (
                        <div className="row-menu" role="menu">
                          <button
                            role="menuitem"
                            onClick={() => {
                              setOpenId(null)
                              setEditing(goal)
                            }}
                          >
                            Editar
                          </button>
                          <button
                            role="menuitem"
                            className="danger"
                            onClick={() => {
                              setOpenId(null)
                              setDeleting(goal)
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3>{goal.name}</h3>
                  <div className="goal-amount">
                    <strong>{money(goal.saved)}</strong>
                    <span>de {money(goal.target)}</span>
                  </div>
                  <div className="progress">
                    <i
                      className={goal.color}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="goal-meta">
                    <span>
                      <small>PROGRESSO</small>
                      <strong>{percent}%</strong>
                    </span>
                    <span>
                      <small>VALOR RESTANTE</small>
                      <strong>{money(goal.target - goal.saved)}</strong>
                    </span>
                    <span>
                      <small>PRAZO</small>
                      <strong>{goal.deadline}</strong>
                    </span>
                  </div>
                  <Botao
                    variant="secondary"
                    onClick={() => registerProgress(goal)}
                  >
                    <Icone name="plus" size={17} /> Registrar progresso
                  </Botao>
                </Cartao>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            Nenhuma meta ainda. Clique em "Nova meta" para começar.
          </div>
        )}
        <Cartao className="goals-summary">
          <div className="summary-illustration">
            <Icone name="goal" size={34} />
          </div>
          <div>
            <span>Progresso geral</span>
            <strong>{overall}% do valor total das metas alcançado</strong>
            <p>Continue assim! Você está cada vez mais perto.</p>
          </div>
          <div className="summary-number">
            <strong>{money(totalSaved)}</strong>
            <span>de {money(totalTarget)}</span>
          </div>
        </Cartao>
      </div>
      {(formOpen || editing) && (
        <div className="modal-backdrop" onMouseDown={closeForm}>
          <Cartao className="modal">
            <div onMouseDown={(e) => e.stopPropagation()}>
              <TituloSecao
                title={editing ? "Editar meta" : "Nova meta"}
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
                  const target = Math.abs(parseMoney(form.get("target")))
                  const savedValue = Math.abs(parseMoney(form.get("saved")))
                  if (!target) return
                  const [year, month] = String(
                    form.get("deadline") ?? "2027-12",
                  ).split("-")
                  const goal: Goal = {
                    id: editing ? editing.id : Date.now(),
                    name: String(form.get("name")),
                    icon: editing ? editing.icon : "goal",
                    saved: Math.min(savedValue || 0, target),
                    target,
                    deadline: `${monthNames[month] ?? "Dez"} ${year}`,
                    color: editing
                      ? editing.color
                      : items.length % 2 === 0
                        ? "green"
                        : "blue",
                  }
                  setItems((current) =>
                    editing
                      ? current.map((item) =>
                          item.id === goal.id ? goal : item,
                        )
                      : [...current, goal],
                  )
                  setToast({
                    title: editing ? "Meta atualizada" : "Meta criada",
                    text: `${goal.name} foi ${editing ? "atualizada" : "adicionada"} com sucesso.`,
                  })
                  closeForm()
                }}
              >
                <Campo
                  label="Nome da meta"
                  name="name"
                  placeholder="Ex.: Comprar um notebook"
                  defaultValue={editing?.name ?? ""}
                  required
                />
                <div className="two-fields">
                  <Campo
                    label="Valor da meta"
                    name="target"
                    inputMode="decimal"
                    placeholder="R$ 0,00"
                    defaultValue={editing ? toInputValue(editing.target) : ""}
                    required
                  />
                  <Campo
                    label="Já guardado"
                    name="saved"
                    inputMode="decimal"
                    placeholder="R$ 0,00"
                    defaultValue={editing ? toInputValue(editing.saved) : "0,00"}
                  />
                </div>
                <Campo
                  label="Prazo"
                  name="deadline"
                  type="month"
                  defaultValue={
                    editing ? toMonthInput(editing.deadline) : "2027-12"
                  }
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
                    {editing ? "Salvar alterações" : "Criar meta"}
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
              aria-label="Excluir meta"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <TituloSecao title="Excluir meta" />
              <p style={{ margin: "8px 0 22px", color: "#64727b" }}>
                Excluir a meta "{deleting.name}"? Essa ação não pode ser
                desfeita.
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
                      current.filter((item) => item.id !== deleting.id),
                    )
                    setToast({
                      title: "Meta excluída",
                      text: `${deleting.name} foi removida.`,
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
