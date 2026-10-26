# Saldo+ — Front-end (React + TypeScript + Vite)

Sistema de Gestão Financeira Pessoal (Squad 2 — TakeOff). Protótipo de interface em React com telas de login, painel, transações, orçamentos, metas e relatórios, usando dados de exemplo.

Esta versão foi refeita a partir do projeto em grupo do Squad 2, com o novo layout criado no Figma.

## Como rodar no VS Code

1. Pré-requisito: Node.js 20.19 ou superior (LTS) instalado — https://nodejs.org
2. Abrir o projeto: `File > Open Folder` e escolha a pasta que contém o `package.json`.
3. Instalar dependências: abra o terminal (`Terminal > New Terminal`) e rode `npm install`.
4. Rodar: `npm run dev`. O app sobe em http://localhost:5173. Se a porta estiver ocupada, o Vite usa a próxima (5174, por exemplo) e mostra o endereço no terminal.
5. Gerar versão final: `npm run build` (confere o TypeScript e gera a pasta `dist`).
6. Verificar o código: `npm run lint`.

Para clonar do GitHub:

```bash
git clone https://github.com/Gabrielxrl8/saldo-mais-front.git
cd saldo-mais-front
npm install
npm run dev
```

## Tecnologias

React 19, TypeScript, Vite, CSS (`index.css`) e ESLint.

## Estrutura

```
src/
  componentes/   Icone, Botao, Campo, Selecao, Cartao, CartaoEstatistica,
                 TituloSecao, Marca, BarraLateral (menu lateral), Cabecalho,
                 ListaTransacoes, LinhaOrcamento, GraficoRosca, Aviso
  dados/         transacoes, orcamentos e metas de exemplo (dados fictícios)
  paginas/
    Login        entrar / criar conta
    Painel       dashboard
    Transacoes   lista, busca, filtros, criar, editar e excluir
    Orcamentos   limites por categoria, criar, editar e excluir
    Metas        metas com progresso, criar, editar e excluir
    Relatorios   gráficos e comparativos do mês
  tipos/         tipos TypeScript (Screen, Transaction, Budget, Goal, IconName)
  utilitarios/   funções auxiliares (formatacao, calculos, datas)
  App.tsx        controla qual tela aparece e guarda transações, orçamentos e metas
  main.tsx       ponto de entrada
  index.css      estilos globais
public/          favicon e ícones
```

## Telas

| Tela | O que faz |
|---|---|
| Login | entrar ou criar conta, mostrar/ocultar senha, "Lembrar de mim" e "Esqueci minha senha" (só no login) |
| Painel | visão geral das finanças: saldo, receitas, despesas, últimas transações e score |
| Transações | lista as transações do usuário, com busca e filtros; permite criar, editar e excluir |
| Orçamentos | limite mensal por categoria, com barra de progresso; permite criar, editar e excluir |
| Metas | metas com progresso e prazo; permite registrar progresso, criar, editar e excluir |
| Relatórios | receitas x despesas, gastos por categoria, comparação com o mês anterior e score financeiro |

## Como funciona a navegação

Não há rotas nem URLs por tela. O `App.tsx` guarda a tela atual em um estado (`login`, `dashboard`, `transactions`, `budgets`, `goals` ou `reports`) e mostra o menu lateral junto com a tela escolhida, exceto no login.

As listas de transações, orçamentos e metas ficam no `App.tsx` e descem para as páginas por props. O Painel e os Relatórios calculam receitas, despesas e saldo a partir das transações de outubro.

## Integração com o back-end

Ainda não está integrado. A API do Finanças Lite (Java + Spring Boot, em `http://localhost:8080`) está em outro projeto e será consumida por este front em uma próxima etapa.

## O que ainda NÃO existe

- Backend / API conectada — as transações, orçamentos e metas vêm de `dados/`.
- Autenticação real — o login só troca de tela, sem validar usuário e senha.
- Persistência — os dados voltam ao padrão ao recarregar a página.
- Versão para celular e tablet — o layout foi pensado para telas a partir de 1100 px.
- Botões sem ação: Configurações, sino de notificações, "Esqueci minha senha", "Lembrar de mim", paginação, Mensal/Anual e seletor de mês.
- Valores fixos: saldo, +12,8%, score 82, gráficos e comparações com o mês anterior. "Este mês" é sempre outubro de 2026.
