import type { Goal, IconName } from "../tipos"

const goals = [
  {
    name: "Reserva de emergência",
    icon: "flag" as IconName,
    saved: 12500,
    target: 30000,
    deadline: "Dez 2027",
    color: "green",
  },
  {
    name: "Viagem para Portugal",
    icon: "goal" as IconName,
    saved: 6800,
    target: 15000,
    deadline: "Set 2027",
    color: "blue",
  },
]

export const initialGoals: Goal[] = goals.map((goal, index) => ({
  ...goal,
  id: index + 1,
}))
