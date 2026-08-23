import { SiteHeader } from "@/components/studio/site-header"
import { ThumbnailStudio } from "@/components/studio/thumbnail-studio"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="max-w-2xl text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Turn a headshot and a prompt into thumbnails that get clicks
          </h1>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            Upload a headshot, describe your video, and generate up to three distinct
            thumbnail styles in one pass — bold and dramatic, minimal, or pastel.
          </p>
        </div>

        <ThumbnailStudio />
      </main>
    </div>
  )
}
