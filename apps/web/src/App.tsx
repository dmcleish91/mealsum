import { useMemo, useState } from "react"
import { ListIcon, UtensilsCrossedIcon } from "lucide-react"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

import { BackupButtons } from "@/components/backup-buttons"
import { BackupNotice } from "@/components/backup-notice"
import { FoodsTab } from "@/components/foods-tab"
import { MealTab } from "@/components/meal-tab"
import { useAppState } from "@/hooks/use-app-state"
import { mealTotal, showCalories } from "@/domain/food"

type TabValue = "meal" | "foods"

const TAB_TRIGGER =
  "h-14 flex-col gap-0.5 rounded-none text-xs data-active:bg-transparent data-active:text-primary dark:data-active:bg-transparent"

export function App() {
  const state = useAppState()
  const [tab, setTab] = useState<TabValue>("meal")
  const [importError, setImportError] = useState<string | null>(null)

  const total = useMemo(
    () => mealTotal(state.entries, state.foodsById),
    [state.entries, state.foodsById]
  )

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as TabValue)}
      className="flex min-h-dvh flex-col gap-0"
    >
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-baseline justify-between px-4 py-3">
          <h1 className="font-heading text-base font-medium">
            {tab === "meal" ? "This meal" : "Foods"}
          </h1>
          {tab === "meal" ? (
            <p className="text-2xl font-semibold tabular-nums">
              {showCalories(total)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                cal
              </span>
            </p>
          ) : (
            <BackupButtons
              foods={state.foods}
              onImport={state.importFoods}
              onError={setImportError}
            />
          )}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col pb-[calc(3.5rem+1px+env(safe-area-inset-bottom))]">
        <TabsContent value="meal" className="flex flex-col">
          <MealTab state={state} />
        </TabsContent>
        <TabsContent value="foods" className="flex flex-col">
          <FoodsTab state={state} importError={importError} />
        </TabsContent>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <TabsList
          variant="line"
          className="mx-auto flex h-auto! w-full max-w-md gap-0 rounded-none bg-transparent p-0"
        >
          <TabsTrigger value="meal" className={TAB_TRIGGER}>
            <UtensilsCrossedIcon />
            Meal
          </TabsTrigger>
          <TabsTrigger value="foods" className={TAB_TRIGGER}>
            <ListIcon />
            Foods
          </TabsTrigger>
        </TabsList>
      </div>

      <BackupNotice />
    </Tabs>
  )
}
