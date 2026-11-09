import { ConteudoFaq } from "../componentes/ConteudoFaq"
import { ConteudoLegal } from "../componentes/ConteudoLegal"
import { Cabecalho } from "../componentes/Cabecalho"
import { Cartao } from "../componentes/Cartao"

export function Ajuda({ kind }: { kind: "faq" | "privacy" | "terms" }) {
  const title = kind === "faq" ? "Central de ajuda" : kind === "privacy" ? "Política de Privacidade" : "Termos de Uso"
  return (
    <>
      <Cabecalho title={title} subtitle="Saldo+ · Gestão financeira pessoal" />
      <div className="page-content">
        <Cartao className="settings-card">
          {kind === "faq" ? <ConteudoFaq /> : <ConteudoLegal kind={kind} />}
        </Cartao>
      </div>
    </>
  )
}
