export type Measure = "mass" | "volume" | "count"

export interface FoodItem {
  id: string
  name: string
  measure: Measure
  caloriesPerBase: number
  preferredUnit: string
  lastUsedAt: number
}

export interface MealEntry {
  id: string
  foodId: string
  amount: number
  unit: string
}

export const UNITS = {
  mass: { g: 1, oz: 28.3495 },
  volume: {
    ml: 1,
    l: 1000,
    floz: 29.5735,
    cup: 236.588,
    tbsp: 14.7868,
    tsp: 4.92892,
  },
  count: { item: 1 },
} as const satisfies Record<Measure, Record<string, number>>

export const MEASURES: Measure[] = ["mass", "volume", "count"]

export const MEASURE_LABELS: Record<Measure, string> = {
  mass: "Mass",
  volume: "Volume",
  count: "Count",
}

const UNIT_LABELS: Record<string, string> = { floz: "fl oz" }

export const unitLabel = (unit: string) => UNIT_LABELS[unit] ?? unit

export const unitsFor = (m: Measure): string[] => Object.keys(UNITS[m])

export const defaultUnitFor = (m: Measure): string => unitsFor(m)[0]!

export const isValidUnit = (measure: Measure, unit: string): boolean =>
  unit in UNITS[measure]

export function toBase(amount: number, measure: Measure, unit: string): number {
  const factor = (UNITS[measure] as Record<string, number>)[unit]
  if (factor === undefined) return NaN
  return amount * factor
}

export function caloriesPerBase(
  labelCalories: number,
  labelAmount: number,
  measure: Measure,
  unit: string
): number {
  if (!(labelAmount > 0)) return NaN
  if (!(labelCalories >= 0)) return NaN
  return labelCalories / toBase(labelAmount, measure, unit)
}

export function entryCalories(entry: MealEntry, food: FoodItem): number {
  return toBase(entry.amount, food.measure, entry.unit) * food.caloriesPerBase
}

export function mealTotal(
  entries: MealEntry[],
  foodsById: Record<string, FoodItem>
): number {
  return entries.reduce((sum, entry) => {
    const food = foodsById[entry.foodId]
    if (!food) return sum
    const cals = entryCalories(entry, food)
    return Number.isFinite(cals) ? sum + cals : sum
  }, 0)
}

export const showCalories = (n: number): string =>
  Number.isFinite(n) ? Math.round(n).toLocaleString() : "—"

export function showRatio(food: FoodItem): string {
  const perPreferred =
    food.caloriesPerBase * toBase(1, food.measure, food.preferredUnit)
  const unit = unitLabel(food.preferredUnit)
  return `${showCalories(perPreferred)} cal / ${unit}`
}

export function parseAmount(text: string): number {
  const trimmed = text.trim()
  if (trimmed === "") return NaN
  return Number(trimmed)
}
