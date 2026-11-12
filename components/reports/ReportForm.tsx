"use client";

import { useActionState } from "react";
import {
  createReport,
  updateReport,
  type ActionState,
} from "@/app/actions/reports";
import { inputClass, labelClass, primaryButton } from "@/lib/styles";

export interface ReportFormValues {
  title: string;
  opponent: string;
  competition: string;
  game_date: string;
  notes: string;
}

export function ReportForm({
  report,
  reportId,
}: {
  report?: ReportFormValues | null;
  reportId?: string;
}) {
  const action = reportId ? updateReport : createReport;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {reportId && <input type="hidden" name="id" value={reportId} />}

      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={report?.title ?? ""}
          placeholder="e.g. Kaunas — pick & roll coverage"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="opponent" className={labelClass}>
            Opponent
          </label>
          <input
            id="opponent"
            name="opponent"
            defaultValue={report?.opponent ?? ""}
            placeholder="Team being scouted"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="competition" className={labelClass}>
            Competition
          </label>
          <input
            id="competition"
            name="competition"
            defaultValue={report?.competition ?? ""}
            placeholder="League / tournament"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="game_date" className={labelClass}>
          Game date
        </label>
        <input
          id="game_date"
          name="game_date"
          type="date"
          defaultValue={report?.game_date ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={report?.notes ?? ""}
          placeholder="Overall tendencies, players to watch, crew assignments…"
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-severity-high/40 bg-severity-high/10 px-3 py-2 text-sm text-severity-high">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : reportId ? "Save changes" : "Create report"}
        </button>
        {state?.success && (
          <span className="text-sm text-severity-low">{state.success}</span>
        )}
      </div>
    </form>
  );
}
