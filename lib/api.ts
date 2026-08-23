const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export type ThumbnailStatus = "pending" | "generating" | "uploaded" | "failed"
export type JobStatus = "pending" | "processing" | "done" | "failed"

export interface ThumbnailVariants {
  [key: string]: string
}

export interface Thumbnail {
  id: string
  style_name: string
  status: ThumbnailStatus
  imagekit_url: string | null
  error_message: string | null
  variants: ThumbnailVariants | null
}

export interface Job {
  id: string
  prompt: string
  num_thumbnails: number
  headshot_url: string
  status: JobStatus
  thumbnails: Thumbnail[]
}

export const STYLE_LABELS: Record<string, string> = {
  "bold-dramatic": "Bold Dramatic",
  minimal: "Minimal",
  pastel: "Pastel",
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data?.detail || res.statusText
  } catch {
    return res.statusText
  }
}

export async function uploadHeadshot(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(`${API_BASE_URL}/api/upload-headshot`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status)
  }

  const data = await res.json()
  return data.url as string
}

export async function createJob(params: {
  prompt: string
  num_thumbnails: number
  headshot_url: string
}): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status)
  }

  const data = await res.json()
  return data.job_id as string
}

export async function getJob(jobId: string): Promise<Job> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`)

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status)
  }

  return res.json()
}

export function getJobStreamUrl(jobId: string): string {
  return `${API_BASE_URL}/api/jobs/${jobId}/stream`
}

export { ApiError, API_BASE_URL }
