"use client";

import { useTransition } from "react";
import { deleteReport } from "@/app/actions/reports";

export function DeleteReportButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Delete this report and all of its plays? This can't be undone.")) {
          startTransition(() => {
            deleteReport(id);
          });
        }
      }}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-severity-high transition-colors hover:bg-severity-high/10 disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete report"}
    </button>
  );
}
