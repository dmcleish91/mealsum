import { useState } from "react"
import { Trash2Icon } from "lucide-react"

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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

import { UnitPicker } from "@/components/unit-picker"
import type { FoodDraft } from "@/hooks/use-app-state"
import {
  MEASURES,
  MEASURE_LABELS,
  caloriesPerBase,
  defaultUnitFor,
  parseAmount,
  toBase,
  unitLabel,
  type FoodItem,
  type Measure,
} from "@/domain/food"

interface FoodSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  food: FoodItem | null
  onSave: (draft: FoodDraft) => void
  onDelete: (id: string) => void
}

export function FoodSheet({
  open,
  onOpenChange,
  food,
  onSave,
  onDelete,
}: FoodSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <FoodForm
          food={food}
          onSave={onSave}
          onDelete={onDelete}
          onDone={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

function initialFields(food: FoodItem | null) {
  if (!food) {
    return {
      name: "",
      calories: "",
      amount: "",
      measure: "mass" as Measure,
      unit: "g",
    }
  }
  const perPreferred =
    food.caloriesPerBase * toBase(1, food.measure, food.preferredUnit)
  return {
    name: food.name,
    calories: String(Number(perPreferred.toFixed(6))),
    amount: "1",
    measure: food.measure,
    unit: food.preferredUnit,
  }
}

function FoodForm({
  food,
  onSave,
  onDelete,
  onDone,
}: {
  food: FoodItem | null
  onSave: (draft: FoodDraft) => void
  onDelete: (id: string) => void
  onDone: () => void
}) {
  const [fields] = useState(() => initialFields(food))
  const [name, setName] = useState(fields.name)
  const [calories, setCalories] = useState(fields.calories)
  const [amount, setAmount] = useState(fields.amount)
  const [measure, setMeasure] = useState<Measure>(fields.measure)
  const [unit, setUnit] = useState(fields.unit)

  function changeMeasure(next: Measure) {
    setMeasure(next)
    setUnit(defaultUnitFor(next))
  }

  const perBase = caloriesPerBase(
    parseAmount(calories),
    parseAmount(amount),
    measure,
    unit
  )
  const isValid = name.trim() !== "" && Number.isFinite(perBase)
  const baseUnit = defaultUnitFor(measure)

  function handleSave() {
    if (!isValid) return
    onSave({
      name: name.trim(),
      measure,
      caloriesPerBase: perBase,
      preferredUnit: unit,
    })
    onDone()
  }

  function handleDelete() {
    if (!food) return
    onDelete(food.id)
    onDone()
  }

  return (
    <>
      <SheetHeader className="px-5 pb-3">
        <SheetTitle>{food ? "Edit food" : "New food"}</SheetTitle>
        <SheetDescription>
          Enter whatever ratio the label gives you.
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-5 px-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="food-name">Name</Label>
          <Input
            id="food-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rotisserie Chicken"
            maxLength={60}
            autoComplete="off"
            className="h-11"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="food-calories">Calories</Label>
            <Input
              id="food-calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              inputMode="decimal"
              placeholder="130"
              maxLength={12}
              className="h-11"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="food-amount">Per amount</Label>
            <Input
              id="food-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="3"
              maxLength={9}
              className="h-11"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Measured by</Label>
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[measure]}
            onValueChange={(next) => {
              if (next[0]) changeMeasure(next[0] as Measure)
            }}
            className="w-full"
          >
            {MEASURES.map((m) => (
              <ToggleGroupItem
                key={m}
                value={m}
                className="h-11 flex-1 text-base aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              >
                {MEASURE_LABELS[m]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {measure !== "count" && (
          <div className="flex flex-col gap-2">
            <Label>Unit</Label>
            <UnitPicker measure={measure} value={unit} onChange={setUnit} />
          </div>
        )}

        <p className="text-center font-mono text-sm text-muted-foreground">
          {Number.isFinite(perBase)
            ? `= ${perBase.toFixed(4)} cal / ${baseUnit}`
            : `enter calories and an amount in ${unitLabel(unit)}`}
        </p>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="h-12 text-base"
          >
            Save food
          </Button>
          {food && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="h-12 text-base"
            >
              <Trash2Icon />
              Delete food
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
