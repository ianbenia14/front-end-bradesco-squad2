import { useState } from "react"

const perguntas: [string, string][] = [
  ["Preciso pagar para usar o Saldo+?", "Não. Criar a conta e usar as funções de controle financeiro é gratuito."],
  ["Como crio minha conta?", "Clique em \"Criar conta\", informe nome, e-mail e uma senha com pelo menos 8 caracteres, contendo letras e números, e aceite os Termos de Uso."],
  ["Só consigo entrar se eu estiver cadastrado?", "Sim. O acesso ao sistema exige uma conta cadastrada. Sem cadastro, você pode apenas explorar o modo convidado, com dados de demonstração que não são salvos."],
  ["O que é o modo convidado?", "É um teste do aplicativo com dados fictícios. Nada do que você fizer nele é guardado, e você pode criar sua conta a qualquer momento."],
  ["Esqueci minha senha. E agora?", "A redefinição por e-mail depende da integração com o servidor. Enquanto isso, fale com o suporte em suporte@saldomais.com.br."],
  ["Meus dados estão seguros?", "Tratamos seus dados conforme a LGPD, não vendemos suas informações e a senha nunca é guardada em texto puro. Veja a Política de Privacidade para detalhes."],
  ["Como funcionam as faixas do orçamento?", "Até 70% do limite o status é Normal; de 71% a 89%, Atenção; acima de 90%, Risco; e acima de 100%, Estourado."],
  ["O que é a regra 50/30/20?", "Uma sugestão de divisão da renda: 50% para necessidades, 30% para desejos e 20% para investimentos e reserva financeira."],
  ["Como o score de saúde financeira é calculado?", "Ele considera percentual de economia, controle de gastos, frequência de estouro de orçamento, constância de investimentos e evolução patrimonial."],
  ["Como excluo meus dados ou minha conta?", "Em Configurações você pode apagar seus dados financeiros ou excluir a conta por completo."],
]

export function ConteudoFaq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="faq-list">
      {perguntas.map(([q, a], i) => (
        <div key={q} className={`faq-item ${open === i ? "open" : ""}`}>
          <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            <span>{q}</span>
            <b>{open === i ? "−" : "+"}</b>
          </button>
          {open === i && <p>{a}</p>}
        </div>
      ))}
      <p className="faq-support">
        Não encontrou o que procurava? Escreva para{" "}
        <a href="mailto:suporte@saldomais.com.br">suporte@saldomais.com.br</a>.
      </p>
    </div>
  )
}
