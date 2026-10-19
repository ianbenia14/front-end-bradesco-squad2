// Tela de Transações: buscar, filtrar por tipo, adicionar e excluir
import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import Icon from "../../componentes/Icones"
import { Button } from "../../componentes/Botao"
import { Card, SectionTitle } from "../../componentes/Cartoes"
import { Field, Select } from "../../componentes/CamposFormulario"
import { Header } from "../../componentes/LogoMenuCabecalho"
import TransactionList from "./ListaTransacoes"
import { monthNames } from "../../utilitarios/formatacao"
import type { Transaction } from "../../tipos/tipos"

type Props = {
  items: Transaction[]
  setItems: Dispatch<SetStateAction<Transaction[]>>
}

// ===== TELA: TRANSAÇÕES =====
// TELA TRANSAÇÕES: buscar, filtrar, adicionar e excluir
export default function Transactions({ items, setItems }: Props) {
  // Estados: filtro de tipo, texto da busca, modais abertos e item a excluir
  const [type, setType] = useState("all")
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState(false)
  const [deleting, setDeleting] = useState<Transaction | null>(null)

  // Aplica busca por nome + filtro de tipo
  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (type === "all" || item.type === type) &&
          item.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, type, search],
  )

  // Cria a transação a partir do formulário
  const save = (form: FormData) => {
    const kind = form.get("type") as "income" | "expense"
    const value = Number(
      String(form.get("value")).replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, ""),
    )
    const [year, month, day] = String(form.get("date")).split("-")
    const category = String(form.get("category"))
    const icon =
      kind === "income" ? "wallet"
      : category === "Alimentação" ? "food"
      : category === "Moradia" ? "home"
      : category === "Transporte" ? "transport"
      : "shopping"
    const created: Transaction = {
      id: Date.now(),
      title: String(form.get("description")),
      category,
      date: `${day} ${monthNames[month] ?? "Out"} ${year}`,
      amount: kind === "expense" ? -Math.abs(value) : Math.abs(value),
      type: kind,
      icon,
    }
    setItems((current) => [created, ...current])
    setModal(false)
  }

  return (
    <>
      {/* CABEÇALHO da página */}
      <Header title="Transações" subtitle="Acompanhe suas movimentações." />
      {/* CONTEÚDO DA PÁGINA */}
      <div className="page-content">
        {/* ===== BARRA SUPERIOR ===== */}
        {/* BARRA SUPERIOR: busca + botão Nova transação */}
        <div className="page-heading-actions">
          {/* Campo de busca por nome */}
          <div className="search-box">
            <Icon name="search" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar transação..."
            />
          </div>
          {/* Botão que abre o modal Nova transação */}
          <Button onClick={() => setModal(true)}>
            <Icon name="plus" size={18} /> Nova transação
          </Button>
        </div>

        {/* ===== FILTROS ===== */}
        {/* FILTROS: por tipo (receita/despesa) */}
        <Card className="filters-card">
          <span className="filter-title">Filtrar por</span>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </Select>
        </Card>

        {/* ===== LISTA ===== */}
        {/* LISTA DE TRANSAÇÕES (ou mensagem se não houver nenhuma) */}
        <Card className="table-card">
          {filtered.length ? (
            <TransactionList items={filtered} onDelete={setDeleting} />
          ) : (
            <div className="empty-state">Nenhuma transação encontrada.</div>
          )}
        </Card>
      </div>

      {/* ===== MODAL: NOVA TRANSAÇÃO ===== */}
      {/* Modal: nova transação */}
      {modal && (
        <div className="modal-backdrop" onMouseDown={() => setModal(false)}>
          <Card className="modal">
            <div onMouseDown={(e) => e.stopPropagation()}>
              <SectionTitle title="Nova transação" />
              {/* FORMULÁRIO da nova transação */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  save(new FormData(e.currentTarget))
                }}
              >
                <Field label="Descrição" name="description" required />
                <div className="two-fields">
                  <Select label="Tipo" name="type" defaultValue="expense">
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </Select>
                  <Field label="Valor" name="value" inputMode="decimal" placeholder="R$ 0,00" required />
                </div>
                <div className="two-fields">
                  <Select label="Categoria" name="category">
                    <option>Alimentação</option>
                    <option>Moradia</option>
                    <option>Transporte</option>
                    <option>Compras</option>
                    <option>Receita</option>
                  </Select>
                  <Field label="Data" name="date" type="date" defaultValue="2026-10-18" required />
                </div>
                {/* Botões Cancelar / Salvar */}
                <div className="modal-actions">
                  <Button type="button" variant="secondary" onClick={() => setModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* ===== MODAL: EXCLUIR ===== */}
      {/* Modal: confirmar exclusão */}
      {deleting && (
        <div className="modal-backdrop" onMouseDown={() => setDeleting(null)}>
          <Card className="modal">
            <div onMouseDown={(e) => e.stopPropagation()}>
              <SectionTitle title="Excluir transação" />
              <p style={{ margin: "8px 0 22px" }}>Excluir "{deleting.title}"?</p>
              <div className="modal-actions">
                <Button variant="secondary" onClick={() => setDeleting(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setItems((c) => c.filter((i) => i.id !== deleting.id))
                    setDeleting(null)
                  }}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
