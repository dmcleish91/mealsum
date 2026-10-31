import { useCallback, useEffect, useMemo, useState } from "react"

import { load, mergeFoods, save } from "@/lib/storage"
import type { FoodItem, MealEntry } from "@/domain/food"

export interface FoodDraft {
  name: string
  measure: FoodItem["measure"]
  caloriesPerBase: number
  preferredUnit: string
}

export function useAppState() {
  const initial = useMemo(() => load(), [])
  const [foods, setFoods] = useState<FoodItem[]>(initial.foods)
  const [entries, setEntries] = useState<MealEntry[]>(initial.entries)

  useEffect(() => {
    save({ foods, entries })
  }, [foods, entries])

  const foodsById = useMemo(
    () => Object.fromEntries(foods.map((f) => [f.id, f])),
    [foods]
  )

  const sortedFoods = useMemo(
    () => [...foods].sort((a, b) => b.lastUsedAt - a.lastUsedAt),
    [foods]
  )

  const addFood = useCallback((draft: FoodDraft) => {
    setFoods((prev) => [
      ...prev,
      { ...draft, id: crypto.randomUUID(), lastUsedAt: Date.now() },
    ])
  }, [])

  const updateFood = useCallback((id: string, draft: FoodDraft) => {
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, ...draft } : f)))
  }, [])

  const deleteFood = useCallback((id: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== id))
    setEntries((prev) => prev.filter((e) => e.foodId !== id))
  }, [])

  const addEntry = useCallback(
    (foodId: string, amount: number, unit: string) => {
      setEntries((prev) => [
        ...prev,
        { id: crypto.randomUUID(), foodId, amount, unit },
      ])
      setFoods((prev) =>
        prev.map((f) =>
          f.id === foodId
            ? { ...f, preferredUnit: unit, lastUsedAt: Date.now() }
            : f
        )
      )
    },
    []
  )

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearMeal = useCallback(() => setEntries([]), [])

  const importFoods = useCallback((incoming: FoodItem[]) => {
    setFoods((prev) => mergeFoods(prev, incoming))
  }, [])

  return {
    foods: sortedFoods,
    foodsById,
    entries,
    addFood,
    updateFood,
    deleteFood,
    addEntry,
    removeEntry,
    clearMeal,
    importFoods,
  }
}

export type AppState = ReturnType<typeof useAppState>
