"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GeneratorForm } from "@/components/studio/generator-form"
import { GenerationResults } from "@/components/studio/generation-results"

export function ThumbnailStudio() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  function handleJobCreated(id: string) {
    setJobId(id)
    setIsBusy(false)
  }

  function handleReset() {
    setJobId(null)
    setIsBusy(false)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">New batch</CardTitle>
          <CardDescription>One headshot, one prompt, up to three styles.</CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratorForm
            onJobCreated={handleJobCreated}
            isBusy={isBusy}
            disabled={isBusy || jobId !== null}
            onBusyChange={setIsBusy}
          />
        </CardContent>
      </Card>

      <div className="min-h-[420px]">
        <GenerationResults jobId={jobId} onReset={handleReset} />
      </div>
    </div>
  )
}
