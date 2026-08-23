"use client"

import { useCallback, useRef, useState } from "react"
import { ImageUpIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface HeadshotDropzoneProps {
  file: File | null
  previewUrl: string | null
  onFileSelect: (file: File | null) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"]
const MAX_SIZE_BYTES = 8 * 1024 * 1024

export function HeadshotDropzone({
  file,
  previewUrl,
  onFileSelect,
  disabled,
}: HeadshotDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateAndSelect = useCallback(
    (candidate: File) => {
      if (!ACCEPTED_TYPES.includes(candidate.type)) {
        setError("Use a PNG, JPG, or WebP image.")
        return
      }
      if (candidate.size > MAX_SIZE_BYTES) {
        setError("Image must be under 8MB.")
        return
      }
      setError(null)
      onFileSelect(candidate)
    },
    [onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      const dropped = e.dataTransfer.files?.[0]
      if (dropped) validateAndSelect(dropped)
    },
    [disabled, validateAndSelect]
  )

  if (previewUrl && file) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-border bg-secondary">
        <img
          src={previewUrl || "/placeholder.svg"}
          alt="Headshot preview"
          className="aspect-[4/3] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-background/90 to-transparent p-3">
          <span className="truncate text-xs text-muted-foreground">{file.name}</span>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            disabled={disabled}
            onClick={() => onFileSelect(null)}
            aria-label="Remove headshot"
          >
            <XIcon />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        aria-disabled={disabled}
        className={cn(
          "flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 text-center transition-colors",
          isDragging && "border-primary bg-primary/10",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <ImageUpIcon className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">Drop your headshot here</p>
        <p className="text-xs text-muted-foreground">PNG, JPG, or WebP up to 8MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            const selected = e.target.files?.[0]
            if (selected) validateAndSelect(selected)
            e.target.value = ""
          }}
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
