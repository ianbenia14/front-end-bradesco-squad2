import { useMemo, useState } from "react"
import type { Transaction } from "../tipos"
import { useUsuario } from "../contexto/usuario"
import { type Filtros, aplicarFiltros, filtrosVazios } from "../utilitarios/filtros"
import { FiltrosFinanceiros } from "../componentes/FiltrosFinanceiros"
import { Botao } from "../componentes/Botao"
import { Cabecalho } from "../componentes/Cabecalho"
import { Cartao } from "../componentes/Cartao"
import { FormularioTransacao } from "../componentes/FormularioTransacao"
import { Icone } from "../componentes/Icone"
import { ListaTransacoes } from "../componentes/ListaTransacoes"
import { TituloSecao } from "../componentes/TituloSecao"

export function Transacoes({
  items,
  setItems,
}: {
  items: Transaction[]
  setItems: React.Dispatch<React.SetStateAction<Transaction[]>>
}) {
  const usuario = useUsuario()
  const [filtros, setFiltros] = useState<Filtros>(filtrosVazios)
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const filtered = useMemo(
    () =>
      aplicarFiltros(items, filtros).filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, filtros, search],
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
        <FiltrosFinanceiros filtros={filtros} setFiltros={setFiltros} />
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
              <FormularioTransacao
                key={editing ? editing.id : "new"}
                editing={editing}
                onCancel={closeForm}
                onSave={(saved0) => {
                  const saved = { ...saved0, userId: usuario.id }
                  setItems((current) =>
                    editing
                      ? current.map((item) => (item.id === saved.id ? saved : item))
                      : [saved, ...current],
                  )
                  closeForm()
                }}
              />
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
                <Botao type="button" variant="secondary" onClick={() => setDeleting(null)}>
                  Cancelar
                </Botao>
                <Botao
                  type="button"
                  style={{ background: "#b45309" }}
                  onClick={() => {
                    setItems((current) => current.filter((item) => item.id !== deleting.id))
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
