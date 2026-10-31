import { useMemo, useState } from "react"
import { ChevronRightIcon, PlusIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { FoodSheet } from "@/components/food-sheet"
import type { AppState } from "@/hooks/use-app-state"
import { showRatio, type FoodItem } from "@/domain/food"

export function FoodsTab({
  state,
  importError,
}: {
  state: AppState
  importError: string | null
}) {
  const { foods, addFood, updateFood, deleteFood } = state

  const [query, setQuery] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<FoodItem | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return foods
    return foods.filter((f) => f.name.toLowerCase().includes(q))
  }, [foods, query])

  function openNew() {
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(food: FoodItem) {
    setEditing(food)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods"
          type="search"
          autoComplete="off"
          className="h-11"
        />
      </div>

      {foods.length === 0 ? (
        <p className="px-2 py-12 text-center text-muted-foreground">
          Add your first food to get started.
        </p>
      ) : visible.length === 0 ? (
        <p className="px-2 py-12 text-center text-muted-foreground">
          Nothing matches “{query.trim()}”.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {visible.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => openEdit(food)}
                className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-muted"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base">{food.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {showRatio(food)}
                  </span>
                </span>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <Button
          onClick={openNew}
          size="icon"
          aria-label="New food"
          className="h-12 w-full text-base"
        >
          New Food
          <PlusIcon />
        </Button>
        {importError && (
          <p className="text-sm text-destructive">{importError}</p>
        )}
      </div>

      <FoodSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        food={editing}
        onSave={(draft) =>
          editing ? updateFood(editing.id, draft) : addFood(draft)
        }
        onDelete={deleteFood}
      />
    </div>
  )
}
