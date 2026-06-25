import Link from "next/link";
import { Headphones } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
          <Headphones className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          That test or page doesn&apos;t exist. Let&apos;s get you back to practice.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Back to all tests
        </Link>
      </div>
    </div>
  );
}
