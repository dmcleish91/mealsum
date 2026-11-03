import type { ReactNode } from "react"

import { Sheet, SheetContent } from "@workspace/ui/components/sheet"

export function BottomSheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[90dvh] w-full max-w-md gap-0 overflow-y-auto rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        {children}
      </SheetContent>
    </Sheet>
  )
}
