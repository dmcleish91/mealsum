import { useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { UnitPicker } from "@/components/unit-picker"
import {
  entryCalories,
  parseAmount,
  showCalories,
  showRatio,
  unitLabel,
  type FoodItem,
} from "@/domain/food"

interface AddEntrySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  foods: FoodItem[]
  onAdd: (foodId: string, amount: number, unit: string) => void
}

export function AddEntrySheet({
  open,
  onOpenChange,
  foods,
  onAdd,
}: AddEntrySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] gap-0 overflow-y-auto rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <EntryForm
          foods={foods}
          onAdd={onAdd}
          onDone={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

function EntryForm({
  foods,
  onAdd,
  onDone,
}: {
  foods: FoodItem[]
  onAdd: (foodId: string, amount: number, unit: string) => void
  onDone: () => void
}) {
  const [query, setQuery] = useState("")
  const [picked, setPicked] = useState<FoodItem | null>(null)
  const [amount, setAmount] = useState("")
  const [unit, setUnit] = useState("g")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return foods
    return foods.filter((f) => f.name.toLowerCase().includes(q))
  }, [foods, query])

  function pick(food: FoodItem) {
    setPicked(food)
    setUnit(food.preferredUnit)
    setAmount("")
  }

  const parsed = parseAmount(amount)
  const preview = picked
    ? entryCalories({ id: "", foodId: picked.id, amount: parsed, unit }, picked)
    : NaN
  const canAdd = picked !== null && Number.isFinite(preview) && parsed > 0

  function handleAdd() {
    if (!picked || !canAdd) return
    onAdd(picked.id, parsed, unit)
    onDone()
  }

  return (
    <>
      <SheetHeader className="px-5 pb-3">
        <SheetTitle>{picked ? picked.name : "Add to meal"}</SheetTitle>
        <SheetDescription>
          {picked ? showRatio(picked) : "Pick a food, then enter how much."}
        </SheetDescription>
      </SheetHeader>

      {picked === null ? (
        <div className="flex flex-col gap-3 px-5">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods"
            type="search"
            autoComplete="off"
            className="h-11"
          />
          {foods.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              No foods yet — add one on the Foods tab first.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {visible.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => pick(food)}
                    className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-muted"
                  >
                    <span className="min-w-0 flex-1 truncate text-base">
                      {food.name}
                    </span>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="entry-amount">Amount</Label>
            <Input
              id="entry-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="9"
              maxLength={9}
              autoFocus
              className="h-12 text-lg"
            />
          </div>

          {picked.measure !== "count" && (
            <div className="flex flex-col gap-2">
              <Label>Unit</Label>
              <UnitPicker
                measure={picked.measure}
                value={unit}
                onChange={setUnit}
              />
            </div>
          )}

          <p className="text-center text-2xl font-semibold tabular-nums">
            {canAdd ? `${showCalories(preview)} cal` : "—"}
            {canAdd && (
              <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">
                for {amount} {unitLabel(unit)}
              </span>
            )}
          </p>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleAdd}
              disabled={!canAdd}
              className="h-12 text-base"
            >
              Add to meal
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPicked(null)}
              className="h-11 text-base"
            >
              <ChevronLeftIcon />
              Pick a different food
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
