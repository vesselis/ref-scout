"use client";

import { useRouter } from "next/navigation";
import { setMemberRole, removeMember } from "@/app/actions/members";
import { initials } from "@/lib/utils";
import type { MemberRole } from "@/lib/types";

export interface MemberItem {
  user_id: string;
  role: MemberRole;
  profile: { display_name: string | null } | null;
}

export function Members({
  reportId,
  members,
}: {
  reportId: string;
  members: MemberItem[];
}) {
  const router = useRouter();

  async function promote(userId: string) {
    await setMemberRole(reportId, userId, "editor");
    router.refresh();
  }

  async function demote(userId: string) {
    await setMemberRole(reportId, userId, "viewer");
    router.refresh();
  }

  async function remove(userId: string) {
    await removeMember(reportId, userId);
    router.refresh();
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-court-500">
        No one else has access yet. Share the link to invite your crew — they&apos;ll
        appear here and you can make them editors.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <li
          key={member.user_id}
          className="flex items-center justify-between gap-3 rounded-lg border border-court-800 bg-court-900/40 px-3 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-court-800 text-xs font-semibold text-court-300">
              {initials(member.profile?.display_name ?? null)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-court-200">
                {member.profile?.display_name ?? "Official"}
              </p>
              <p className="text-xs text-court-500">
                {member.role === "editor" ? "Editor" : "Viewer"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 text-xs">
            {member.role === "viewer" ? (
              <button
                onClick={() => promote(member.user_id)}
                className="rounded-md px-2 py-1 text-court-300 hover:bg-court-800 hover:text-court-100"
              >
                Make editor
              </button>
            ) : (
              <button
                onClick={() => demote(member.user_id)}
                className="rounded-md px-2 py-1 text-court-300 hover:bg-court-800 hover:text-court-100"
              >
                Make viewer
              </button>
            )}
            <button
              onClick={() => remove(member.user_id)}
              className="rounded-md px-2 py-1 text-court-500 hover:text-severity-high"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
