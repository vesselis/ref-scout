"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addComment, deleteComment } from "@/app/actions/comments";
import type { PlayComment } from "@/lib/types";
import { initials } from "@/lib/utils";
import { inputClass, primaryButton } from "@/lib/styles";

export function Comments({
  playId,
  reportId,
  comments,
  currentUserId,
  isOwner,
}: {
  playId: string;
  reportId: string;
  comments: PlayComment[];
  currentUserId: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await addComment({ playId, reportId, body });
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setBody("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteComment({ id, reportId, playId });
    router.refresh();
  }

  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-court-100">
        Crew notes
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note for the crew…"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className={primaryButton}
        >
          {pending ? "Posting…" : "Post"}
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-lg border border-severity-high/40 bg-severity-high/10 px-3 py-2 text-sm text-severity-high">
          {error}
        </p>
      )}

      {comments.length === 0 ? (
        <p className="mt-6 text-sm text-court-500">
          No notes yet. Start the discussion.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-court-800 text-xs font-semibold text-court-300">
                {initials(comment.author?.display_name ?? null)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-court-100">
                    {comment.author?.display_name ?? "Official"}
                  </span>
                  <span className="shrink-0 text-xs text-court-500">
                    {new Date(comment.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-court-300">
                  {comment.body}
                </p>
                {(comment.author_id === currentUserId || isOwner) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="mt-1 text-xs text-court-500 hover:text-severity-high"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
