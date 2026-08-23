"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { STYLE_LABELS } from "@/lib/api"

const OPTIONS = [1, 2, 3]
const STYLE_ORDER = ["bold-dramatic", "minimal", "pastel"]

interface StyleCountPickerProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function StyleCountPicker({ value, onChange, disabled }: StyleCountPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <ToggleGroup
        aria-label="Number of thumbnail styles"
        value={[String(value)]}
        disabled={disabled}
        onValueChange={(vals: string[]) => {
          const next = vals[0]
          if (next) onChange(Number(next))
        }}
        variant="outline"
        className="w-full"
      >
        {OPTIONS.map((count) => (
          <ToggleGroupItem key={count} value={String(count)} className="flex-1">
            {count} {count === 1 ? "style" : "styles"}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-xs text-muted-foreground">
        {STYLE_ORDER.slice(0, value)
          .map((s) => STYLE_LABELS[s])
          .join(" · ")}
      </p>
    </div>
  )
}
