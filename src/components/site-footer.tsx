import { Separator } from "@/components/ui/separator";

const YEAR = 2026;
const VERSION = "1.0.0";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-4xl px-6 py-10 text-center">
        <p className="text-sm font-bold text-foreground">
          © {YEAR} IELTS Listening Hub by Manoj Kumar. All Rights Reserved.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Practice IELTS General Training Listening with realistic CBT-style mock tests.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Version {VERSION}</p>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          IELTS is a registered trademark of its respective owners. This website is independently
          developed and is not affiliated with, endorsed by, or sponsored by the British Council,
          IDP Education, or Cambridge.
        </p>
        <Separator className="mx-auto my-6 max-w-xs" />
        <p className="text-sm font-bold text-foreground">Created by Manoj Kumar</p>
      </div>
    </footer>
  );
}
