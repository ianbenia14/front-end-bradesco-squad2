import { useMemo, useState } from "react"
import type { Transaction } from "../tipos"
import { useUsuario } from "../contexto/usuario"
import { type Filtros, aplicarFiltros, filtrosVazios } from "../utilitarios/filtros"
import { sortByDateDesc } from "../utilitarios/calculos"
import { ImportarExtrato } from "../componentes/ImportarExtrato"
import { FiltrosFinanceiros } from "../componentes/FiltrosFinanceiros"
import { Botao } from "../componentes/Botao"
import { Modal } from "../componentes/Modal"
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
  const [page, setPage] = useState(1)
  const [importing, setImporting] = useState(false)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const filtered = useMemo(
    () =>
      sortByDateDesc(aplicarFiltros(items, filtros)).filter((item) =>
        `${item.title} ${item.establishment ?? ""}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, filtros, search],
  )
  const PAGE_SIZE = 10
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
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
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar por descrição ou estabelecimento..."
            />
          </div>
          <div className="heading-buttons">
            <Botao variant="secondary" onClick={() => setImporting(true)}>
              Importar extrato
            </Botao>
            <Botao onClick={() => setModal(true)}>
              <Icone name="plus" size={18} /> Nova transação
            </Botao>
          </div>
        </div>
        <FiltrosFinanceiros
          filtros={filtros}
          setFiltros={(f) => {
            setFiltros(f)
            setPage(1)
          }}
        />
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
              items={visible}
              onEdit={(item) => setEditing(item)}
              onDelete={(item) => setDeleting(item)}
            />
          ) : (
            <div className="empty-state">Nenhuma transação encontrada.</div>
          )}
          <div className="table-footer">
            <span>
              Mostrando {visible.length} de {filtered.length} transações (total: {items.length})
            </span>
            <div>
              <button disabled={currentPage === 1} aria-label="Página anterior" onClick={() => setPage(currentPage - 1)}>
                ‹
              </button>
              <span className="page-info">
                {currentPage} / {pageCount}
              </span>
              <button disabled={currentPage === pageCount} aria-label="Próxima página" onClick={() => setPage(currentPage + 1)}>
                ›
              </button>
            </div>
          </div>
        </Cartao>
      </div>
      {importing && (
        <ImportarExtrato
          existing={items}
          onClose={() => setImporting(false)}
          onImport={(list) => {
            setItems((current) => [...list.map((t) => ({ ...t, userId: usuario.id })), ...current])
            setImporting(false)
          }}
        />
      )}
      {(modal || editing) && (
        <Modal onClose={closeForm} label="Formulário">
              <TituloSecao
                title={editing ? "Editar transação" : "Nova transação"}
                action={
                  <button className="icon-button" aria-label="Fechar" onClick={closeForm}>
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
            </Modal>
      )}
      {deleting && (
        <Modal onClose={() => setDeleting(null)} label="Confirmar exclusão">
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
            </Modal>
      )}
    </>
  )
}
