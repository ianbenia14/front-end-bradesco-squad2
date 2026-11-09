# Saldo+ — Front-end (React + TypeScript + Vite)

Sistema de Gestão Financeira Pessoal (Squad 2 — Bradesco). Interface em React com telas de boas-vindas, login, cadastro, painel, transações, orçamentos, metas, relatórios e planejamento. Este front ainda não está integrado ao back-end (Java/Spring).

## Como rodar

1. Instale o Node.js 20.19 ou superior (LTS): https://nodejs.org
2. Abra a pasta que contém o `package.json` no VS Code.
3. No terminal: `npm install`
4. Rodar: `npm run dev` e abrir o endereço mostrado (normalmente http://localhost:5173)
5. Build de produção: `npm run build`

## Tecnologias

React 19, TypeScript, Vite, CSS (`index.css`) e ESLint.

## Estrutura

```
src/
  componentes/   peças reutilizáveis (menu, cartões, gráficos, filtros, formulário de transação)
  contexto/      usuário logado (nome, e-mail, modo convidado)
  dados/         categorias, orçamentos, metas e transações de exemplo
  paginas/       telas do sistema
  servicos/      autenticação e armazenamento (localStorage)
  tipos/         tipos TypeScript
  utilitarios/   cálculos, datas, filtros, formatação e metas
  App.tsx        controla sessão, tela atual e dados do usuário
```

## Telas

| Tela | O que faz |
|---|---|
| Boas-vindas | apresentação, carrossel, criar conta, entrar e modo convidado |
| Ferramentas | calculadoras de juros compostos, meta e independência financeira (sem cadastro) |
| Cadastro / Login | só entra quem tem conta cadastrada |
| Painel | receita, despesa, saldo, economia acumulada, % da renda comprometida, gráficos, alertas, score e filtros |
| Transações | cadastrar, editar e excluir; estabelecimento, recorrência, 12 categorias com sugestão automática; filtros |
| Orçamentos | limite por categoria com consumo e faixas Normal / Atenção / Risco / Estourado |
| Metas | valor necessário por mês, tempo estimado e percentual atingido; registrar progresso |
| Relatórios | mensal e anual, ranking de categorias, evolução, comparativo mês a mês e score |
| Planejamento | salário, regra 50/30/20, reserva de emergência, investimento mínimo e evolução do patrimônio |
| Configurações / Ajuda | dados da conta, apagar dados, excluir conta, FAQ, Privacidade e Termos |

## Regras implementadas no front

- Faixas de orçamento: até 70% Normal, 71–89% Atenção, acima de 90% Risco, acima de 100% Estourado.
- Score de saúde financeira de 0 a 100 (Crítico, Atenção, Bom, Excelente), recalculado a cada nova transação.
- Valor da transação maior que zero; insights só com dados suficientes.

## Integração com o back-end

Ainda não existe. A API (Java + Spring Boot) está em outro projeto. A autenticação e o armazenamento ficam isolados em `src/servicos/autenticacao.ts`, que deve ser trocado por chamadas à API.

## O que ainda NÃO existe

- Back-end / API conectada: os dados ficam no `localStorage` do navegador.
- Autenticação real: a conta e a senha ficam só no navegador (senha com hash e salt).
- Login com Google, Apple e biometria, e redefinição de senha por e-mail (dependem do back).
- Importação automática de transações via integração bancária.
- Histórico dos relatórios mensais no servidor.
- Saldo anterior ao histórico é um valor fixo de demonstração (R$ 12.480,50).
- Layout responsivo ainda não testado em aparelhos reais.
- A fórmula do score e o tempo estimado das metas são interpretação do grupo, pois a descrição não define.
