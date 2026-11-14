import type { PublicScreen, Screen } from "../tipos"

export const appScreens: Screen[] = [
  "dashboard", "transactions", "budgets", "goals", "reports", "planning", "education", "settings", "faq", "privacy", "terms",
]
export const publicScreens: PublicScreen[] = [
  "welcome", "login", "register", "faq", "privacy", "terms", "tools",
]

export type Rota =
  | { kind: "app"; screen: Screen }
  | { kind: "public"; screen: PublicScreen }

export const parseHash = (hash: string): Rota | null => {
  const path = hash.replace(/^#\/?/, "")
  if (path.startsWith("app/")) {
    const screen = path.slice(4) as Screen
    return appScreens.includes(screen) ? { kind: "app", screen } : null
  }
  const screen = path as PublicScreen
  return publicScreens.includes(screen) ? { kind: "public", screen } : null
}

export const hashFor = (authed: boolean, publicScreen: PublicScreen, screen: Screen) =>
  authed ? `#/app/${screen}` : `#/${publicScreen}`
