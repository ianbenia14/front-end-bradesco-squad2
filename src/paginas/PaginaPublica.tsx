import type { PublicScreen } from "../tipos"
import { ConteudoFaq } from "../componentes/ConteudoFaq"
import { ConteudoLegal } from "../componentes/ConteudoLegal"
import { CabecalhoPublico, RodapePublico } from "../componentes/CabecalhoPublico"

const titles = {
  faq: "Central de ajuda",
  privacy: "Política de Privacidade",
  terms: "Termos de Uso",
} as const

export function PaginaPublica({
  kind,
  goTo,
}: {
  kind: "faq" | "privacy" | "terms"
  goTo: (s: PublicScreen) => void
}) {
  return (
    <div className="public-page">
      <CabecalhoPublico goTo={goTo} />
      <main className="public-content narrow">
        <h1>{titles[kind]}</h1>
        {kind === "faq" ? <ConteudoFaq /> : <ConteudoLegal kind={kind} />}
      </main>
      <RodapePublico goTo={goTo} />
    </div>
  )
}
