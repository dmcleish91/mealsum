import { useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { AddEntrySheet } from "@/components/add-entry-sheet"
import type { AppState } from "@/hooks/use-app-state"
import { entryCalories, showCalories, unitLabel } from "@/domain/food"

export function MealTab({ state }: { state: AppState }) {
  const { foods, foodsById, entries, addEntry, removeEntry, clearMeal } = state
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {entries.length === 0 ? (
        <p className="px-2 py-12 text-center text-muted-foreground">
          Nothing in this meal yet.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {entries.map((entry) => {
            const food = foodsById[entry.foodId]
            const cals = food ? entryCalories(entry, food) : NaN

            return (
              <li
                key={entry.id}
                className="flex min-h-14 items-center gap-2 py-2 pr-1 pl-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base">
                    {food?.name ?? "Deleted food"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.amount} {unitLabel(entry.unit)}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums">
                  {showCalories(cals)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(entry.id)}
                  aria-label={`Remove ${food?.name ?? "entry"}`}
                  className="size-11 shrink-0 text-muted-foreground"
                >
                  <XIcon />
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <Button
        onClick={() => setSheetOpen(true)}
        className="mt-auto h-12 w-full text-base"
      >
        <PlusIcon />
        Add food
      </Button>

      {entries.length > 0 && (
        <Button
          variant="ghost"
          onClick={clearMeal}
          className="h-11 text-base text-muted-foreground"
        >
          Clear meal
        </Button>
      )}

      <AddEntrySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        foods={foods}
        onAdd={addEntry}
      />
    </div>
  )
}
