"use client";

import { useState } from "react";
import { PlayForm } from "./PlayForm";
import type { Play } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlayFormDialog({
  label,
  reportId,
  play,
  triggerClassName,
}: {
  label: string;
  reportId: string;
  play?: Play;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 my-8 w-full max-w-xl rounded-2xl border border-court-700 bg-court-900 p-6 shadow-2xl shadow-black/50">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-court-100">
                {play ? "Edit play" : "Add play"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-court-400 hover:bg-court-800 hover:text-court-100"
              >
                <span aria-hidden className={cn("text-lg leading-none")}>
                  ×
                </span>
              </button>
            </div>
            <PlayForm
              reportId={reportId}
              play={play}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
