"use client"

import { CheckIcon, DownloadIcon, TriangleAlertIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { STYLE_LABELS, type Thumbnail } from "@/lib/api"

interface ThumbnailResultCardProps {
  thumbnail: Thumbnail
}

export function ThumbnailResultCard({ thumbnail }: ThumbnailResultCardProps) {
  const styleLabel = STYLE_LABELS[thumbnail.style_name] ?? thumbnail.style_name

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2">
      <div className="relative aspect-video overflow-hidden rounded-md bg-secondary">
        {thumbnail.status === "uploaded" && thumbnail.imagekit_url ? (
          <img
            src={thumbnail.imagekit_url || "/placeholder.svg"}
            alt={`Generated ${styleLabel} thumbnail`}
            className="size-full object-cover"
          />
        ) : thumbnail.status === "failed" ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
            <TriangleAlertIcon className="size-5 text-destructive" />
            <p className="text-xs text-muted-foreground">
              {thumbnail.error_message || "Generation failed"}
            </p>
          </div>
        ) : (
          <div className="relative flex size-full items-center justify-center">
            <Skeleton className="absolute inset-0 size-full rounded-none" />
            <div className="relative flex flex-col items-center gap-2">
              <Spinner className="size-5" />
              <span className="text-xs text-muted-foreground">
                {thumbnail.status === "generating" ? "Rendering" : "Queued"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        <Badge
          variant={thumbnail.status === "failed" ? "destructive" : "secondary"}
          className="gap-1"
        >
          {thumbnail.status === "uploaded" ? (
            <CheckIcon data-icon="inline-start" />
          ) : null}
          {styleLabel}
        </Badge>

        {thumbnail.status === "uploaded" && thumbnail.imagekit_url ? (
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={
              <a
                href={thumbnail.imagekit_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Download ${styleLabel} thumbnail`}
              />
            }
          >
            <DownloadIcon />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
