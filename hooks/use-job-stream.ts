"use client"

import { useCallback, useEffect, useState } from "react"
import { getJob, getJobStreamUrl, type Job, type Thumbnail } from "@/lib/api"

interface UseJobStreamResult {
  job: Job | null
  isStreaming: boolean
  streamError: string | null
}

export function useJobStream(jobId: string | null): UseJobStreamResult {
  const [job, setJob] = useState<Job | null>(null)
  const [streamError, setStreamError] = useState<string | null>(null)

  const applyThumbnailUpdate = useCallback((update: Partial<Thumbnail> & { thumbnail_id: string }) => {
    setJob((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        thumbnails: prev.thumbnails.map((t) =>
          t.id === update.thumbnail_id ? { ...t, ...update } : t
        ),
      }
    })
  }, [])

  useEffect(() => {
    if (!jobId) return

    let cancelled = false

    getJob(jobId)
      .then((initialJob) => {
        if (cancelled) return
        setJob(initialJob)
        setStreamError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setStreamError(err instanceof Error ? err.message : "Failed to load job")
      })

    const es = new EventSource(getJobStreamUrl(jobId))

    es.addEventListener("thumbnail_ready", (event) => {
      const data = JSON.parse((event as MessageEvent).data)
      applyThumbnailUpdate({
        thumbnail_id: data.thumbnail_id,
        status: "uploaded",
        imagekit_url: data.imagekit_url,
        variants: data.variants,
      })
    })

    es.addEventListener("thumbnail_failed", (event) => {
      const data = JSON.parse((event as MessageEvent).data)
      applyThumbnailUpdate({
        thumbnail_id: data.thumbnail_id,
        status: "failed",
        error_message: data.error,
      })
    })

    es.addEventListener("job_done", (event) => {
      const data = JSON.parse((event as MessageEvent).data)
      setJob((prev) => (prev ? { ...prev, status: data.status } : prev))
      es.close()
    })

    return () => {
      cancelled = true
      es.close()
    }
  }, [jobId, applyThumbnailUpdate])

  // Derive visible state from jobId so a cleared jobId (new batch) never
  // flashes stale data from a previous job, and so streaming status comes
  // from the job's own lifecycle rather than a separately tracked flag.
  const activeJob = jobId && job && job.id === jobId ? job : null
  const activeStreamError = jobId ? streamError : null
  const isStreaming = Boolean(
    jobId && (!activeJob || (activeJob.status !== "done" && activeJob.status !== "failed"))
  )

  return { job: activeJob, isStreaming, streamError: activeStreamError }
}
