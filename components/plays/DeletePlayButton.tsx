"use client";

import { useTransition } from "react";
import { deletePlay } from "@/app/actions/plays";

export function DeletePlayButton({
  id,
  reportId,
}: {
  id: string;
  reportId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Delete this play?")) {
          startTransition(() => {
            deletePlay(id, reportId);
          });
        }
      }}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-severity-high transition-colors hover:bg-severity-high/10 disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
