import { useState } from "react";
import type { Issue } from "../validator/validate";
import type { TDeck } from "../spec/schema";

interface RepairPopoverProps {
  issue: Issue;
  deck: TDeck;
  onApply: (patch: any) => void;
  onClose: () => void;
  busy?: boolean;
  suggestion?: { before: string; after: string; patch: any } | null;
}

export function RepairPopover({ issue, suggestion, onApply, onClose, busy }: RepairPopoverProps) {
  const title =
    issue.kind === "overflow" ? "Text overflow" :
    issue.kind === "collision" ? "Block overlap" :
    issue.kind === "contrast" ? "Readability" :
    "Chart sanity";

  return (
    <div className="repair-popover" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-accent font-semibold">
            {issue.kind}
          </div>
          <div className="font-serif text-base text-ink leading-tight mt-0.5">{title}</div>
        </div>
        <button
          onClick={onClose}
          className="text-ink-3 hover:text-ink text-lg leading-none px-1"
        >×</button>
      </div>
      <div className="text-ink-2 text-[13px] mb-3 leading-snug">{issue.message}</div>

      {suggestion && (
        <div className="border border-rule rounded-lg overflow-hidden mb-3">
          <div className="bg-bg-surface-2 px-3 py-1.5 text-[11px] font-semibold text-ink-3 uppercase tracking-wider">
            Proposed patch
          </div>
          <div className="p-2 flex flex-col gap-1">
            <div className="diff-line diff-del">- {suggestion.before}</div>
            <div className="diff-line diff-add">+ {suggestion.after}</div>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="btn btn-ghost">Dismiss</button>
        <button
          onClick={() => suggestion && onApply(suggestion.patch)}
          disabled={busy || !suggestion}
          className="btn btn-primary"
        >
          {busy ? "Repairing…" : suggestion ? "Apply patch" : "Generating…"}
        </button>
      </div>
    </div>
  );
}
