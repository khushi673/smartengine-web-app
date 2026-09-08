"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Badge } from "@/components/ui/Badge";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";
import { useApplicantDraft } from "@/components/shell/ApplicantDraftContext";
import { DocumentScanner } from "@/components/applicant/DocumentScanner";

export default function DocumentsPage() {
  const { tenant } = useTenantTheme();
  const router = useRouter();
  const { tradeLicenceUpload, setTradeLicenceUpload } = useApplicantDraft();

  return (
    <PhoneFrame tenant={tenant}>
      <div className="flex flex-col gap-1">
        <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">Step 2 of 6</span>
        <h1 className="text-[19px]">Upload your documents</h1>
      </div>
      <ProgressSteps total={6} current={2} />

      <p className="text-[12.5px] text-[var(--t-muted,var(--muted))]">
        Upload your mandatory documents first — we&apos;ll use them to pre-fill your business and signatory details next, so you don&apos;t
        have to type what&apos;s already on the document.
      </p>

      <DocRow icon="📄" name="Trade licence" hint="PDF or photo · max 10MB" status={<Badge tone={tradeLicenceUpload === "good" ? "success" : "warning"}>{tradeLicenceUpload === "good" ? "Uploaded" : "Required"}</Badge>} />
      <DocRow icon="🧾" name="VAT certificate" hint="If VAT registered" status={<Badge tone="neutral">Optional</Badge>} />
      <span className="text-[11.5px] text-[var(--t-muted,var(--muted))]">
        Signatory ID documents are collected on the next step, one per signatory.
      </span>

      <hr className="border-[var(--border)]" />

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">Trade licence — upload preview</span>
        <DocumentScanner
          fileLabel="trade_licence_scan.jpg"
          status={tradeLicenceUpload}
          onResult={setTradeLicenceUpload}
          onReset={() => setTradeLicenceUpload("idle")}
          extractedChips={["Licence No. 774521", "Expiry 12 Mar 2027", "Legal name matched"]}
        />
      </div>

      <div className="mt-auto flex gap-2.5 pt-2">
        <Button variant="secondary" onClick={() => router.push("/applicant/consent")}>
          Back
        </Button>
        <Button className="flex-1" disabled={tradeLicenceUpload !== "good"} onClick={() => router.push("/applicant/processing")}>
          Continue
        </Button>
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
