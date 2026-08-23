"use client"

import { useState } from "react"
import { SparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { HeadshotDropzone } from "@/components/studio/headshot-dropzone"
import { StyleCountPicker } from "@/components/studio/style-count-picker"
import { createJob, uploadHeadshot } from "@/lib/api"

interface GeneratorFormProps {
  onJobCreated: (jobId: string) => void
  isBusy: boolean
  disabled?: boolean
  onBusyChange: (busy: boolean) => void
}

const MAX_PROMPT_LENGTH = 300

export function GeneratorForm({
  onJobCreated,
  isBusy,
  disabled = false,
  onBusyChange,
}: GeneratorFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [numThumbnails, setNumThumbnails] = useState(3)

  function handleFileSelect(next: File | null) {
    setFile(next)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(next ? URL.createObjectURL(next) : null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      toast.error("Add a headshot to continue.")
      return
    }
    if (!prompt.trim()) {
      toast.error("Describe the thumbnail you want.")
      return
    }

    onBusyChange(true)
    try {
      const headshotUrl = await uploadHeadshot(file)
      const jobId = await createJob({
        prompt: prompt.trim(),
        num_thumbnails: numThumbnails,
        headshot_url: headshotUrl,
      })
      onJobCreated(jobId)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Try again.")
      onBusyChange(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Your headshot</FieldLabel>
          <HeadshotDropzone
            file={file}
            previewUrl={previewUrl}
            onFileSelect={handleFileSelect}
            disabled={disabled}
          />
          <FieldDescription>
            We&apos;ll blend this into every generated thumbnail.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="prompt">Describe the video</FieldLabel>
          <Textarea
            id="prompt"
            placeholder="e.g. Reacting to the new iPhone leak, shocked expression, tech studio background, bold red arrows pointing at the phone"
            value={prompt}
            maxLength={MAX_PROMPT_LENGTH}
            disabled={disabled}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <FieldDescription>
            {prompt.length}/{MAX_PROMPT_LENGTH} — mention the topic, mood, and any text or props.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel>How many variations?</FieldLabel>
          <StyleCountPicker
            value={numThumbnails}
            onChange={setNumThumbnails}
            disabled={disabled}
          />
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" disabled={disabled} className="w-full">
        {isBusy ? (
          <>
            <Spinner data-icon="inline-start" />
            Generating thumbnails
          </>
        ) : (
          <>
            <SparklesIcon data-icon="inline-start" />
            Generate thumbnails
          </>
        )}
      </Button>
    </form>
  )
}
