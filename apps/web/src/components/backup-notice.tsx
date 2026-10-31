import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { BottomSheet } from "@/components/bottom-sheet"
import { hasSeenBackupNotice, markBackupNoticeSeen } from "@/lib/storage"

export function BackupNotice() {
  const [open, setOpen] = useState(() => !hasSeenBackupNotice())

  function handleOpenChange(next: boolean) {
    if (!next) markBackupNoticeSeen()
    setOpen(next)
  }

  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange}>
      <SheetHeader className="px-5 pb-3">
        <SheetTitle>Back up your foods</SheetTitle>
        <SheetDescription>
          This app doesn’t store your data anywhere but this browser. If the
          browser clears its storage, your foods are gone. Use Export on the
          Foods tab now and then to keep a copy.
        </SheetDescription>
      </SheetHeader>
      <div className="px-5">
        <Button
          onClick={() => handleOpenChange(false)}
          className="h-12 w-full text-base"
        >
          Got it
        </Button>
      </div>
    </BottomSheet>
  )
}
