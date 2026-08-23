import { ClapperboardIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ClapperboardIcon className="size-4" />
          </div>
          <span className="font-heading text-base font-semibold tracking-tight">
            Thumbnail Studio
          </span>
        </div>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Beta
        </Badge>
      </div>
    </header>
  )
}
