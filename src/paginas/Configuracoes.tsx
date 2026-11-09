import { useState } from "react"
import type { Screen } from "../tipos"
import { useUsuario } from "../contexto/usuario"
import { Botao } from "../componentes/Botao"
import { Cabecalho } from "../componentes/Cabecalho"
import { Cartao } from "../componentes/Cartao"
import { TituloSecao } from "../componentes/TituloSecao"

export function Configuracoes({
  navigate,
  onClearData,
  onDeleteAccount,
  onLogout,
  onCreateAccount,
}: {
  navigate: (s: Screen) => void
  onClearData: () => void
  onDeleteAccount: () => void
  onLogout: () => void
  onCreateAccount: () => void
}) {
  const user = useUsuario()
  const [confirm, setConfirm] = useState<"data" | "account" | null>(null)
  return (
    <>
      <Cabecalho title="Configurações" subtitle="Gerencie sua conta, privacidade e ajuda." />
      <div className="page-content">
        <Cartao className="settings-card">
          <TituloSecao title="Conta" />
          <div className="rank-list">
            <div><span>Nome</span><strong>{user.name}</strong></div>
            <div><span>E-mail</span><strong>{user.guest ? "Modo convidado" : user.email}</strong></div>
          </div>
          <div className="settings-actions">
            {user.guest ? (
              <Botao onClick={onCreateAccount}>Criar minha conta</Botao>
            ) : (
              <Botao variant="secondary" onClick={onLogout}>Sair</Botao>
            )}
          </div>
        </Cartao>
        <Cartao className="settings-card">
          <TituloSecao title="Ajuda e privacidade" />
          <div className="settings-actions">
            <Botao variant="secondary" onClick={() => navigate("faq")}>Central de ajuda (FAQ)</Botao>
            <Botao variant="secondary" onClick={() => navigate("privacy")}>Política de Privacidade</Botao>
            <Botao variant="secondary" onClick={() => navigate("terms")}>Termos de Uso</Botao>
          </div>
        </Cartao>
        {!user.guest && (
          <Cartao className="settings-card">
            <TituloSecao title="Seus dados (LGPD)" />
            <p className="plan-total">Você pode apagar seus dados financeiros ou excluir a conta por completo.</p>
            {confirm ? (
              <div className="settings-actions">
                <span className="form-error">
                  {confirm === "data" ? "Apagar todas as transações, orçamentos e metas?" : "Excluir a conta e todos os dados? Não pode ser desfeito."}
                </span>
                <Botao variant="secondary" onClick={() => setConfirm(null)}>Cancelar</Botao>
                <Botao
                  style={{ background: "#b45309" }}
                  onClick={() => {
                    if (confirm === "data") onClearData()
                    else onDeleteAccount()
                    setConfirm(null)
                  }}
                >
                  Confirmar
                </Botao>
              </div>
            ) : (
              <div className="settings-actions">
                <Botao variant="secondary" onClick={() => setConfirm("data")}>Apagar meus dados</Botao>
                <Botao variant="secondary" onClick={() => setConfirm("account")}>Excluir minha conta</Botao>
              </div>
            )}
          </Cartao>
        )}
      </div>
    </>
  )
}
