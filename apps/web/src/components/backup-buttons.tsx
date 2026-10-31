import { useRef } from "react"
import { DownloadIcon, UploadIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { exportFoods, parseImport } from "@/lib/storage"
import type { FoodItem } from "@/domain/food"

export function BackupButtons({
  foods,
  onImport,
  onError,
}: {
  foods: FoodItem[]
  onImport: (foods: FoodItem[]) => void
  onError: (error: string | null) => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    onError(null)
    const result = parseImport(await file.text())
    if (!result.ok) {
      onError(result.error)
      return
    }
    onImport(result.foods)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => exportFoods(foods)}
        disabled={foods.length === 0}
        aria-label="Export foods"
      >
        <DownloadIcon />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => fileInput.current?.click()}
        aria-label="Import foods"
      >
        <UploadIcon />
      </Button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
