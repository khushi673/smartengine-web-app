"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export type ScanStatus = "idle" | "good" | "bad";

export function DocumentScanner({
  fileLabel,
  status,
  onResult,
  onReset,
  extractedChips,
  badMessage = "We couldn't read this file clearly. Please retake the photo in good lighting with all four corners visible.",
}: {
  fileLabel: string;
  status: ScanStatus;
  onResult: (kind: "good" | "bad") => void;
  onReset: () => void;
  extractedChips?: string[];
  badMessage?: string;
}) {
  const [busy, setBusy] = useState(false);

  const simulate = (kind: "good" | "bad") => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onResult(kind);
    }, 700);
  };

  if (busy) {
    return (
      <Card flat className="flex flex-col gap-2">
        <div className="flex justify-between text-[13px]">
          <span className="text-[var(--t-ink,var(--ink))]">{fileLabel}</span>
          <span className="text-[var(--t-muted,var(--muted))]">Checking…</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
          <span className="block h-full w-[70%] rounded-full bg-[var(--t-primary,var(--brand))]" />
        </div>
        <span className="text-[11.5px] text-[var(--t-muted,var(--muted))]">Validating file, then classifying and extracting fields.</span>
      </Card>
    );
  }

  if (status === "idle") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-[var(--border-strong)] bg-[var(--t-surface,var(--surface))] p-5 text-center">
        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-[var(--t-wash,var(--brand-wash))] text-[var(--t-primary,var(--brand))]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v9M5 8l4-4 4 4M3 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <strong className="text-[13px] text-[var(--t-ink-strong,var(--ink-strong))]">Drag file or tap to browse</strong>
        <span className="text-[11.5px] text-[var(--t-muted,var(--muted))]">JPG, PNG or PDF</span>
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="secondary" onClick={() => simulate("good")}>
            Simulate clear scan
          </Button>
          <Button size="sm" variant="secondary" onClick={() => simulate("bad")}>
            Simulate blurry scan
          </Button>
        </div>
      </div>
    );
  }

  if (status === "good") {
    return (
      <Card className="flex flex-col gap-2.5 border-[var(--success-solid)]">
        <div className="flex items-center justify-between">
          <Badge tone="success" dot>
            Quality passed
          </Badge>
          <button className="text-[12.5px] font-bold text-[var(--t-muted,var(--muted))]" onClick={onReset}>
            Replace
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-[var(--success-bg)]">✅</div>
          <span className="text-[13px] text-[var(--t-ink,var(--ink))]">{fileLabel}</span>
        </div>
        {extractedChips && extractedChips.length > 0 && (
          <>
            <hr className="border-[var(--border)]" />
            <span className="text-[11.5px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">Data extracted</span>
            <div className="flex flex-wrap gap-2">
              {extractedChips.map((c) => (
                <Badge key={c} tone="info">
                  {c}
                </Badge>
              ))}
            </div>
          </>
        )}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-2.5 border-[var(--warning-solid)]">
      <Badge tone="warning" dot>
        Attention required
      </Badge>
      <div className="flex items-center gap-2.5">
        <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-[var(--warning-bg)]">⚠️</div>
        <span className="text-[13px] text-[var(--t-ink,var(--ink))]">
          {fileLabel} <span className="text-[var(--t-muted,var(--muted))]">· image unreadable</span>
        </span>
      </div>
      <p className="text-[12.5px] text-[var(--warning-text)]">{badMessage}</p>
      <Button size="sm" variant="secondary" onClick={onReset}>
        Re-upload
      </Button>
    </Card>
  );
}
