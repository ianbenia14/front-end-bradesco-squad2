import type { Budget, Goal, IncomeProfile, Transaction } from "../tipos"

// ATENÇÃO: autenticação apenas no navegador (localStorage), usada enquanto o
// back-end não está integrado. Troque estas funções por chamadas à API.

export type Usuario = {
  id: string
  name: string
  email: string
  hash: string
  salt: string
  createdAt: string
}

export type DadosUsuario = {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  profile: IncomeProfile
}

const USERS = "saldomais:usuarios"
const SESSION = "saldomais:sessao"
const ATTEMPTS = "saldomais:tentativas"
const MAX_ATTEMPTS = 5
const LOCK_MS = 60_000

const read = <T>(storage: Storage, key: string, fallback: T): T => {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const write = (storage: Storage, key: string, value: unknown) => {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    /* armazenamento indisponível */
  }
}

const sha256 = async (text: string) => {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }
  let h = 5381
  for (let i = 0; i < text.length; i++) h = (h * 33) ^ text.charCodeAt(i)
  return String(h >>> 0)
}

const randomSalt = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

export const normalizarEmail = (email: string) => email.trim().toLowerCase()
export const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)

export const validarSenha = (senha: string) => {
  if (senha.length < 8) return "A senha deve ter pelo menos 8 caracteres."
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha))
    return "A senha deve conter letras e números."
  return ""
}

const usuarios = () => read<Usuario[]>(localStorage, USERS, [])

export const registrar = async (name: string, email: string, senha: string) => {
  const mail = normalizarEmail(email)
  if (name.trim().length < 3) throw new Error("Informe seu nome completo.")
  if (!emailValido(mail)) throw new Error("Informe um e-mail válido.")
  const erro = validarSenha(senha)
  if (erro) throw new Error(erro)
  const lista = usuarios()
  if (lista.some((u) => u.email === mail))
    throw new Error("Já existe uma conta com este e-mail. Faça login.")
  const salt = randomSalt()
  const usuario: Usuario = {
    id: `u${Date.now()}`,
    name: name.trim(),
    email: mail,
    salt,
    hash: await sha256(salt + senha),
    createdAt: new Date().toISOString(),
  }
  write(localStorage, USERS, [...lista, usuario])
  return usuario
}

export const entrar = async (email: string, senha: string) => {
  const tentativas = read<{ count: number; until: number }>(localStorage, ATTEMPTS, { count: 0, until: 0 })
  if (tentativas.until > Date.now()) {
    const s = Math.ceil((tentativas.until - Date.now()) / 1000)
    throw new Error(`Muitas tentativas. Tente novamente em ${s}s.`)
  }
  const mail = normalizarEmail(email)
  const usuario = usuarios().find((u) => u.email === mail)
  const ok = usuario ? (await sha256(usuario.salt + senha)) === usuario.hash : false
  if (!usuario || !ok) {
    const count = tentativas.count + 1
    write(localStorage, ATTEMPTS, {
      count: count >= MAX_ATTEMPTS ? 0 : count,
      until: count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0,
    })
    throw new Error("E-mail ou senha incorretos, ou conta não cadastrada.")
  }
  localStorage.removeItem(ATTEMPTS)
  return usuario
}

export const salvarSessao = (id: string, lembrar: boolean) => {
  sessionStorage.removeItem(SESSION)
  localStorage.removeItem(SESSION)
  write(lembrar ? localStorage : sessionStorage, SESSION, { id })
}

export const encerrarSessao = () => {
  sessionStorage.removeItem(SESSION)
  localStorage.removeItem(SESSION)
}

// Só devolve usuário se ele realmente estiver cadastrado
export const sessaoAtual = (): Usuario | null => {
  const s =
    read<{ id: string } | null>(sessionStorage, SESSION, null) ??
    read<{ id: string } | null>(localStorage, SESSION, null)
  if (!s) return null
  return usuarios().find((u) => u.id === s.id) ?? null
}

export const dadosVazios = (): DadosUsuario => ({
  transactions: [],
  budgets: [],
  goals: [],
  profile: { salary: 0, recurring: 0, variable: 0 },
})

const dadosKey = (id: string) => `saldomais:dados:${id}`

export const carregarDados = (id: string): DadosUsuario => ({
  ...dadosVazios(),
  ...read<Partial<DadosUsuario>>(localStorage, dadosKey(id), {}),
})

export const salvarDados = (id: string, dados: DadosUsuario) => write(localStorage, dadosKey(id), dados)

export const excluirDados = (id: string) => localStorage.removeItem(dadosKey(id))

export const excluirConta = (id: string) => {
  excluirDados(id)
  write(localStorage, USERS, usuarios().filter((u) => u.id !== id))
  encerrarSessao()
}
