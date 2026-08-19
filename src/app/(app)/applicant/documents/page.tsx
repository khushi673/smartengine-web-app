"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";

type UploadState = "idle" | "busy" | "good" | "bad";

export default function DocumentsPage() {
  const [upload, setUpload] = useState<UploadState>("idle");
  const { tenant } = useTenantTheme();
  const router = useRouter();

  const simulate = (kind: "good" | "bad") => {
    setUpload("busy");
    setTimeout(() => setUpload(kind), 700);
  };

  return (
    <PhoneFrame tenant={tenant}>
      <div className="flex flex-col gap-1">
        <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">Step 4 of 6</span>
        <h1 className="text-[19px]">Upload your documents</h1>
      </div>
      <ProgressSteps total={6} current={4} />

      <DocRow icon="📄" name="Trade licence" hint="PDF or photo · max 10MB" status={<Badge tone="success">Uploaded</Badge>} />
      <DocRow icon="🪪" name="Emirates ID (signatory)" hint="Front & back" status={<Badge tone="warning">Required</Badge>} />
      <DocRow icon="🧾" name="VAT certificate" hint="If VAT registered" status={<Badge tone="neutral">Optional</Badge>} />

      <hr className="border-[var(--border)]" />

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">Trade licence — upload preview</span>

        {upload === "idle" && (
          <div className="flex flex-col items-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-[var(--border-strong)] bg-[var(--t-surface,var(--surface))] p-5 text-center">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-[var(--t-wash,var(--brand-wash))] text-[var(--t-primary,var(--brand))]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v9M5 8l4-4 4 4M3 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <strong className="text-[13px] text-[var(--t-ink-strong,var(--ink-strong))]">Drag file or tap to browse</strong>
            <span className="text-[11.5px] text-[var(--t-muted,var(--muted))]">JPG, PNG or PDF</span>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="secondary" onClick={() => simulate("good")}>Simulate clear scan</Button>
              <Button size="sm" variant="secondary" onClick={() => simulate("bad")}>Simulate blurry scan</Button>
            </div>
          </div>
        )}

        {upload === "busy" && (
          <Card flat className="flex flex-col gap-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-[var(--t-ink,var(--ink))]">trade_licence_scan.jpg</span>
              <span className="text-[var(--t-muted,var(--muted))]">Checking…</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
              <span className="block h-full w-[70%] rounded-full bg-[var(--t-primary,var(--brand))]" />
            </div>
            <span className="text-[11.5px] text-[var(--t-muted,var(--muted))]">Validating file, then classifying and extracting fields.</span>
          </Card>
        )}

        {upload === "good" && (
          <Card className="flex flex-col gap-2.5 border-[var(--success-solid)]">
            <div className="flex items-center justify-between">
              <Badge tone="success" dot>Quality passed</Badge>
              <button className="text-[12.5px] font-bold text-[var(--t-muted,var(--muted))]" onClick={() => setUpload("idle")}>
                Replace
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-[var(--success-bg)]">✅</div>
              <span className="text-[13px] text-[var(--t-ink,var(--ink))]">trade_licence_scan.jpg <span className="text-[var(--t-muted,var(--muted))]">· 2.1MB</span></span>
            </div>
            <hr className="border-[var(--border)]" />
            <span className="text-[11.5px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">Data extracted</span>
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">Licence No. 774521</Badge>
              <Badge tone="info">Expiry 12 Mar 2027</Badge>
              <Badge tone="info">Legal name matched</Badge>
            </div>
          </Card>
        )}

        {upload === "bad" && (
          <Card className="flex flex-col gap-2.5 border-[var(--warning-solid)]">
            <Badge tone="warning" dot>Attention required</Badge>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-[var(--warning-bg)]">⚠️</div>
              <span className="text-[13px] text-[var(--t-ink,var(--ink))]">trade_licence_scan.jpg <span className="text-[var(--t-muted,var(--muted))]">· image unreadable</span></span>
            </div>
            <p className="text-[12.5px] text-[var(--warning-text)]">
              We couldn&apos;t read this file clearly. Please retake the photo in good lighting with all four corners visible.
            </p>
            <Button size="sm" variant="secondary" onClick={() => setUpload("idle")}>Re-upload</Button>
          </Card>
        )}
      </div>

      <div className="mt-auto flex gap-2.5 pt-2">
        <Button variant="secondary" onClick={() => router.push("/applicant/signatory")}>Back</Button>
        <Button className="flex-1" onClick={() => router.push("/applicant/processing")}>Continue</Button>
      </div>
    </PhoneFrame>
  );
}

function DocRow({ icon, name, hint, status }: { icon: string; name: string; hint: string; status: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--t-surface,var(--surface-2))] p-3">
      <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-[var(--t-wash,var(--surface))]">{icon}</div>
      <div className="flex flex-1 flex-col gap-0.5">
        <strong className="text-[13px] text-[var(--t-ink-strong,var(--ink-strong))]">{name}</strong>
        <span className="text-[11.5px] text-[var(--t-muted,var(--muted))]">{hint}</span>
      </div>
      {status}
    </div>
  );
}
