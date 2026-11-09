import type { Goal } from "../tipos"
import { REF_MONTH, addMonths, keyToDeadline, monthsBetween, toMonthInput } from "./datas"

export const goalInfo = (goal: Goal, monthlyPace: number) => {
  const remaining = Math.max(0, goal.target - goal.saved)
  const percent = goal.target ? Math.round((goal.saved / goal.target) * 100) : 0
  const monthsLeft = Math.max(1, monthsBetween(REF_MONTH, toMonthInput(goal.deadline)))
  const perMonth = remaining / monthsLeft
  const estimatedMonths = remaining === 0 ? 0 : monthlyPace > 0 ? Math.ceil(remaining / monthlyPace) : null
  return {
    remaining,
    percent,
    perMonth,
    monthsLeft,
    estimatedMonths,
    estimatedDate: estimatedMonths === null ? null : keyToDeadline(addMonths(REF_MONTH, estimatedMonths)),
  }
}
