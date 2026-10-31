import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

import { unitLabel, unitsFor, type Measure } from "@/domain/food"

interface UnitPickerProps {
  measure: Measure
  value: string
  onChange: (unit: string) => void
}

export function UnitPicker({ measure, value, onChange }: UnitPickerProps) {
  const units = unitsFor(measure)

  if (units.length < 2) return null

  return (
    <ToggleGroup
      variant="outline"
      spacing={0}
      value={[value]}
      onValueChange={(next) => {
        if (next[0]) onChange(next[0])
      }}
      className="w-full"
    >
      {units.map((unit) => (
        <ToggleGroupItem
          key={unit}
          value={unit}
          aria-label={unitLabel(unit)}
          className="h-11 flex-1 text-base aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        >
          {unitLabel(unit)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
