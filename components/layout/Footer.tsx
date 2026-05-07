import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 md:px-8 md:py-0">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by <Link href="/" className="font-medium underline underline-offset-4">SpendPilot</Link>. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:underline underline-offset-4">Terms</Link>
          <Link href="/privacy" className="hover:underline underline-offset-4">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
