"use client"

import { ImageIcon, RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ThumbnailResultCard } from "@/components/studio/thumbnail-result-card"
import { useJobStream } from "@/hooks/use-job-stream"

interface GenerationResultsProps {
  jobId: string | null
  onReset: () => void
}

export function GenerationResults({ jobId, onReset }: GenerationResultsProps) {
  const { job, streamError } = useJobStream(jobId)

  if (!jobId) {
    return (
      <Empty className="h-full border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageIcon />
          </EmptyMedia>
          <EmptyTitle>Your thumbnails will show up here</EmptyTitle>
          <EmptyDescription>
            Upload a headshot, describe the video, and hit generate — results stream in live as
            each style finishes rendering.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (streamError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn&apos;t load this job</AlertTitle>
        <AlertDescription>{streamError}</AlertDescription>
      </Alert>
    )
  }

  if (!job) {
    return (
      <Empty className="h-full border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageIcon />
          </EmptyMedia>
          <EmptyTitle>Connecting to studio…</EmptyTitle>
          <EmptyDescription>Fetching your job details.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const total = job.thumbnails.length
  const done = job.thumbnails.filter((t) => t.status === "uploaded" || t.status === "failed").length
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0
  const isFinished = job.status === "done" || job.status === "failed"

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium">
            {isFinished ? "Generation complete" : "Generating your thumbnails…"}
          </p>
          <Progress value={progressPct} className="h-1.5 w-48" />
        </div>
        {isFinished ? (
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcwIcon data-icon="inline-start" />
            New batch
          </Button>
        ) : null}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {job.thumbnails.map((thumbnail) => (
          <ThumbnailResultCard key={thumbnail.id} thumbnail={thumbnail} />
        ))}
      </div>
    </div>
  )
}
