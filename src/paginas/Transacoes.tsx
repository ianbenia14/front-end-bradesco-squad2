import { useMemo, useState } from "react"
import type { Transaction } from "../tipos"
import { monthNames, toInputDate } from "../utilitarios/datas"
import { toInputValue } from "../utilitarios/formatacao"
import { Botao } from "../componentes/Botao"
import { Cabecalho } from "../componentes/Cabecalho"
import { Campo } from "../componentes/Campo"
import { Cartao } from "../componentes/Cartao"
import { Icone } from "../componentes/Icone"
import { ListaTransacoes } from "../componentes/ListaTransacoes"
import { Selecao } from "../componentes/Selecao"
import { TituloSecao } from "../componentes/TituloSecao"

export function Transacoes({
  items,
  setItems,
}: {
  items: Transaction[]
  setItems: React.Dispatch<React.SetStateAction<Transaction[]>>
}) {
  const [type, setType] = useState("all")
  const [category, setCategory] = useState("all")
  const [period, setPeriod] = useState("month")
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (type === "all" || item.type === type) &&
          (category === "all" || item.category === category) &&
          (period === "year" ||
            (period === "month" && item.date.includes("Out")) ||
            (period === "last" && item.date.includes("Set"))) &&
          item.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, type, category, period, search],
  )
  const closeForm = () => {
    setModal(false)
    setEditing(null)
  }
  return (
    <>
      <Cabecalho
        title="Transações"
        subtitle="Acompanhe todas as movimentações da sua conta."
      />
      <div className="page-content">
        <div className="page-heading-actions">
          <div className="search-box">
            <Icone name="search" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar transação..."
            />
          </div>
          <Botao onClick={() => setModal(true)}>
            <Icone name="plus" size={18} /> Nova transação
          </Botao>
        </div>
        <Cartao className="filters-card">
          <span className="filter-title">Filtrar por</span>
          <Selecao value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </Selecao>
          <Selecao
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">Todas as categorias</option>
            <option>Alimentação</option>
            <option>Moradia</option>
            <option>Transporte</option>
            <option>Compras</option>
            <option>Receita</option>
          </Selecao>
          <Selecao value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="month">Este mês</option>
            <option value="last">Mês anterior</option>
            <option value="year">Este ano</option>
          </Selecao>
          <button
            className="clear-filter"
            onClick={() => {
              setType("all")
              setCategory("all")
              setPeriod("month")
              setSearch("")
            }}
          >
            Limpar filtros
          </button>
        </Cartao>
        <Cartao className="table-card">
          <div className="table-header">
            <span>Descrição</span>
            <span>Categoria</span>
            <span>Data</span>
            <span>Valor</span>
            <span />
          </div>
          {filtered.length ? (
            <ListaTransacoes
              items={filtered}
              onEdit={(item) => setEditing(item)}
              onDelete={(item) => setDeleting(item)}
            />
          ) : (
            <div className="empty-state">Nenhuma transação encontrada.</div>
          )}
          <div className="table-footer">
            <span>
              Mostrando {filtered.length} de {items.length} transações
            </span>
            <div>
              <button disabled>‹</button>
              <button className="current">1</button>
              <button>2</button>
              <button>›</button>
            </div>
          </div>
        </Cartao>
      </div>
      {(modal || editing) && (
        <div className="modal-backdrop" onMouseDown={closeForm}>
          <Cartao className="modal">
            <div onMouseDown={(e) => e.stopPropagation()}>
              <TituloSecao
                title={editing ? "Editar transação" : "Nova transação"}
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
                  const transactionType = form.get("type") as
                    | "income"
                    | "expense"
                  const numericValue = Number(
                    String(form.get("value") ?? "")
                      .replace(/\./g, "")
                      .replace(",", ".")
                      .replace(/[^\d.]/g, ""),
                  )
                  const formCategory = String(form.get("category") ?? "Outros")
                  const dateValue = String(form.get("date") ?? "2026-10-06")
                  const [year, month, day] = dateValue.split("-")
                  const saved: Transaction = {
                    id: editing ? editing.id : Date.now(),
                    title: String(form.get("description")),
                    category: formCategory,
                    date: `${day} ${monthNames[month] ?? "Out"} ${year}`,
                    amount:
                      transactionType === "expense"
                        ? -Math.abs(numericValue)
                        : Math.abs(numericValue),
                    type: transactionType,
                    icon:
                      transactionType === "income"
                        ? "wallet"
                        : formCategory === "Alimentação"
                          ? "food"
                          : formCategory === "Moradia"
                            ? "home"
                            : formCategory === "Transporte"
                              ? "transport"
                              : "shopping",
                  }
                  setItems((current) =>
                    editing
                      ? current.map((item) =>
                          item.id === saved.id ? saved : item,
                        )
                      : [saved, ...current],
                  )
                  closeForm()
                }}
              >
                <Campo
                  label="Descrição"
                  name="description"
                  placeholder="Ex.: Compra no mercado"
                  defaultValue={editing?.title ?? ""}
                  required
                />
                <div className="two-fields">
                  <Selecao
                    label="Tipo"
                    name="type"
                    defaultValue={editing?.type ?? "expense"}
                    required
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </Selecao>
                  <Campo
                    label="Valor"
                    name="value"
                    inputMode="decimal"
                    placeholder="R$ 0,00"
                    defaultValue={editing ? toInputValue(editing.amount) : ""}
                    required
                  />
                </div>
                <div className="two-fields">
                  <Selecao
                    label="Categoria"
                    name="category"
                    defaultValue={editing?.category ?? "Alimentação"}
                  >
                    <option>Alimentação</option>
                    <option>Moradia</option>
                    <option>Transporte</option>
                    <option>Compras</option>
                    <option>Receita</option>
                    <option>Outros</option>
                  </Selecao>
                  <Campo
                    label="Data"
                    name="date"
                    type="date"
                    defaultValue={
                      editing ? toInputDate(editing.date) : "2026-10-06"
                    }
                    required
                  />
                </div>
                <div className="modal-actions">
                  <Botao
                    type="button"
                    variant="secondary"
                    onClick={closeForm}
                  >
                    Cancelar
                  </Botao>
                  <Botao type="submit">
                    {editing ? "Salvar alterações" : "Salvar transação"}
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
              aria-label="Excluir transação"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <TituloSecao title="Excluir transação" />
              <p style={{ margin: "8px 0 22px", color: "#64727b" }}>
                Excluir "{deleting.title}"? Essa ação não pode ser desfeita.
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
    </>
  )
}
