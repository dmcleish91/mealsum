import {
  MEASURES,
  defaultUnitFor,
  isValidUnit,
  type FoodItem,
  type MealEntry,
  type Measure,
} from "@/domain/food"

const KEY = "calorie:v1"
const NOTICE_KEY = "calorie:backup-notice-seen"

const EXPORT_VERSION = 1

export interface AppData {
  foods: FoodItem[]
  entries: MealEntry[]
}

const EMPTY: AppData = { foods: [], entries: [] }

const isMeasure = (v: unknown): v is Measure =>
  typeof v === "string" && (MEASURES as string[]).includes(v)

function parseFood(value: unknown): FoodItem | null {
  if (typeof value !== "object" || value === null) return null
  const f = value as Record<string, unknown>

  if (typeof f.id !== "string" || f.id === "") return null
  if (typeof f.name !== "string") return null
  if (!isMeasure(f.measure)) return null
  if (
    typeof f.caloriesPerBase !== "number" ||
    !Number.isFinite(f.caloriesPerBase)
  )
    return null

  const preferredUnit =
    typeof f.preferredUnit === "string" &&
    isValidUnit(f.measure, f.preferredUnit)
      ? f.preferredUnit
      : defaultUnitFor(f.measure)

  return {
    id: f.id,
    name: f.name,
    measure: f.measure,
    caloriesPerBase: f.caloriesPerBase,
    preferredUnit,
    lastUsedAt: typeof f.lastUsedAt === "number" ? f.lastUsedAt : 0,
  }
}

function parseEntry(value: unknown): MealEntry | null {
  if (typeof value !== "object" || value === null) return null
  const e = value as Record<string, unknown>

  if (typeof e.id !== "string" || e.id === "") return null
  if (typeof e.foodId !== "string" || e.foodId === "") return null
  if (typeof e.amount !== "number") return null
  if (typeof e.unit !== "string") return null

  return { id: e.id, foodId: e.foodId, amount: e.amount, unit: e.unit }
}

function parseFoods(value: unknown): FoodItem[] {
  if (!Array.isArray(value)) return []
  return value.map(parseFood).filter((f): f is FoodItem => f !== null)
}

export function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY

    const parsed = JSON.parse(raw) as Record<string, unknown>
    const foods = parseFoods(parsed.foods)
    const foodIds = new Set(foods.map((f) => f.id))
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries
          .map(parseEntry)
          .filter((e): e is MealEntry => e !== null && foodIds.has(e.foodId))
      : []

    return { foods, entries }
  } catch {
    return EMPTY
  }
}

export function hasSeenBackupNotice(): boolean {
  try {
    return localStorage.getItem(NOTICE_KEY) === "1"
  } catch {
    return false
  }
}

export function markBackupNoticeSeen(): boolean {
  try {
    localStorage.setItem(NOTICE_KEY, "1")
    return true
  } catch {
    return false
  }
}

export function save(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {}
}

export function exportFoods(foods: FoodItem[]): void {
  const payload = JSON.stringify({ version: EXPORT_VERSION, foods }, null, 2)
  const blob = new Blob([payload], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `mealsum-${new Date().toISOString().slice(0, 10)}.json`
  link.click()

  URL.revokeObjectURL(url)
}

export type ImportResult =
  { ok: true; foods: FoodItem[] } | { ok: false; error: string }

export function parseImport(text: string): ImportResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: "That file isn't valid JSON." }
  }

  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "That file isn't a Mealsum export." }
  }

  const { version, foods } = data as Record<string, unknown>

  if (version !== EXPORT_VERSION) {
    return {
      ok: false,
      error: `That file is version ${String(version)}; this app reads version ${EXPORT_VERSION}.`,
    }
  }
  if (!Array.isArray(foods)) {
    return { ok: false, error: "That file has no food list." }
  }

  const parsed = parseFoods(foods)
  if (parsed.length === 0) {
    return { ok: false, error: "No readable foods in that file." }
  }

  return { ok: true, foods: parsed }
}

export function mergeFoods(
  existing: FoodItem[],
  incoming: FoodItem[]
): FoodItem[] {
  const byId = new Map(existing.map((f) => [f.id, f]))
  for (const food of incoming) byId.set(food.id, food)
  return [...byId.values()]
}
