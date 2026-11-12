"use client";

import { useState } from "react";
import { secondaryButton } from "@/lib/styles";

export function ShareButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/r/${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard may be blocked outside a secure context — show the URL.
      window.prompt("Copy this link:", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={copy} className={secondaryButton}>
      {copied ? "Copied" : "Copy share link"}
    </button>
  );
}
